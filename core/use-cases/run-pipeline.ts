import type {
  Company,
  EmailMessage,
  Interaction,
  Lead,
  LogLevel,
  RunPhase,
  Signal,
} from "../domain/entities";
import { fullName, hasContact } from "../domain/entities";
import { logoFromDomain } from "../domain/value-objects";
import type { Ports } from "../ports/driven";
import type { AccountInput, CompanyRecord, SignalRecord } from "../ports/driven";
import { dedupLeads, topSignal } from "../services/dedup";
import { buildSchedule, buildSequence } from "../services/sequencing";

const companyKey = (c: CompanyRecord): string =>
  (c.domain ?? c.name ?? "").toLowerCase();

// The live pipeline: accounts -> signals -> enrichment -> emails.
// Writes stepLogs at every beat so the client timeline streams progress.
export class RunPipeline {
  constructor(private readonly ports: Ports) {}

  async execute(runId: string, accounts: AccountInput[]): Promise<void> {
    const p = this.ports;
    const log = (phase: RunPhase, message: string, level: LogLevel = "info") =>
      p.stepLogs.append({
        id: p.id.next(),
        runId,
        phase,
        message,
        level,
        createdAt: p.clock.now().toISOString(),
      });

    try {
      await p.runs.setStatus(runId, "running");
      const persona = await p.personaStore.get();

      // A company is stored once, keyed by domain/name. Seeded from the
      // account-enrichment fallback, then extended with signal companies.
      const companyByKey = new Map<string, Company>();
      const toCompany = (cr: CompanyRecord): Company => ({
        id: p.id.next(),
        runId,
        sillageCompanyId: cr.sillageCompanyId,
        name: cr.name,
        domain: cr.domain,
        website: cr.website,
        logoUrl: cr.logoUrl ?? logoFromDomain(cr.domain),
        linkedin: cr.linkedin,
      });

      // Phase 1 — accounts (this IS the company-enrichment fallback: the
      // top-account-list resolves enriched company records we keep regardless
      // of whether signal detection later succeeds).
      await log("accounts", `📥 Importing ${accounts.length} accounts…`);
      const importedCompanies = await p.signalProvider.importAccounts(accounts, (l) =>
        log("accounts", l),
      );
      for (const cr of importedCompanies) {
        const ck = companyKey(cr);
        if (!companyByKey.has(ck)) companyByKey.set(ck, toCompany(cr));
      }
      await log("accounts", `✅ ${companyByKey.size} companies enriched`, "success");

      // Phase 2 — signals (Sillage detection). Resilient: if detection fails we
      // keep the enriched companies and continue (fallback), logging the reason.
      await log("signals", `🔍 Detecting signals…`);
      let signalRecords: SignalRecord[] = [];
      try {
        signalRecords = await p.signalProvider.detectSignals({
          onProgress: (l) => log("signals", l),
        });
      } catch (e) {
        await log(
          "signals",
          `⚠️ Detection unavailable (${e instanceof Error ? e.message : "error"}) — falling back to enriched companies`,
          "warn",
        );
      }
      const groups = dedupLeads(signalRecords);

      // Add companies discovered via signals (deduped against imported ones)
      for (const g of groups) {
        const ck = companyKey(g.lead.company);
        if (!companyByKey.has(ck)) companyByKey.set(ck, toCompany(g.lead.company));
      }
      await p.companies.saveMany([...companyByKey.values()]);

      // Persist leads + signals
      const leads: Lead[] = [];
      const signals: Signal[] = [];
      const groupByLeadId = new Map<string, (typeof groups)[number]>();
      const needEnrich: { lead: Lead; company: Company }[] = [];

      for (const g of groups) {
        const company = companyByKey.get(companyKey(g.lead.company))!;
        const leadId = p.id.next();
        const lr = g.lead;
        const lead: Lead = {
          id: leadId,
          runId,
          companyId: company.id,
          sillageLeadId: lr.sillageLeadId,
          firstName: lr.firstName,
          lastName: lr.lastName,
          position: lr.position,
          linkedin: lr.linkedin,
          avatarUrl: lr.avatarUrl,
          email: lr.email,
          phone: lr.phone,
          enrichStatus: hasContact(lr) ? "provided" : "pending",
          crm: lr.crm,
        };
        leads.push(lead);
        groupByLeadId.set(leadId, g);
        for (const sr of g.signals) {
          signals.push({
            id: p.id.next(),
            runId,
            leadId,
            signalType: sr.signalType,
            agentType: sr.agentType,
            signalDate: sr.signalDate,
            data: sr.data,
          });
        }
        if (!hasContact(lr)) needEnrich.push({ lead, company });
      }
      await p.leads.saveMany(leads);
      await p.signals.saveMany(signals);
      await log(
        "signals",
        `✅ ${companyByKey.size} companies → ${signals.length} signals / ${leads.length} decision-makers`,
        "success",
      );

      // Phase 3 — enrichment (FullEnrich) for leads without contact
      if (needEnrich.length > 0) {
        await log("enrich", `📧 Enriching ${needEnrich.length} contacts…`);
        const results = await p.contactEnricher.enrich(
          needEnrich.map(({ lead, company }) => ({
            key: lead.id,
            firstName: lead.firstName,
            lastName: lead.lastName,
            domain: company.domain ?? undefined,
            companyName: company.name,
            linkedinUrl: lead.linkedin ?? undefined,
          })),
          (l) => log("enrich", l),
        );
        for (const { lead } of needEnrich) {
          const r = results[lead.id];
          lead.email = r?.email ?? null;
          lead.phone = r?.phone ?? null;
          lead.enrichStatus = r && (r.email || r.phone) ? "enriched" : "not_found";
          await p.leads.update(lead);
          await log("enrich", `📧 ${fullName(lead)} — ${lead.email ?? "not found"}`);
        }
      }

      // Phase 4 — email sequence (Anthropic) + interactions
      const emails: EmailMessage[] = [];
      const interactions: Interaction[] = [];
      const now = p.clock.now();

      for (const lead of leads) {
        const g = groupByLeadId.get(lead.id)!;
        const company = companyByKey.get(companyKey(g.lead.company))!;
        const top = topSignal(g.signals);
        const topSignalEntity: Signal | null = top
          ? {
              id: "",
              runId,
              leadId: lead.id,
              signalType: top.signalType,
              agentType: top.agentType,
              signalDate: top.signalDate,
              data: top.data,
            }
          : null;

        // Seed a past interaction for the triggering signal
        if (top) {
          interactions.push({
            id: p.id.next(),
            leadId: lead.id,
            date: top.signalDate ?? now.toISOString(),
            type: "signal",
            note: `Signal detected: ${top.agentType}`,
          });
        }

        const scheduled = buildSchedule(buildSequence(top?.agentType ?? null), now);
        for (const step of scheduled) {
          let subject: string;
          let body: string;
          try {
            ({ subject, body } = await p.emailGenerator.write({
              lead,
              company,
              signal: topSignalEntity,
              persona,
              template: step.template,
            }));
          } catch (e) {
            // One email failing must not kill the whole run — degrade gracefully.
            await log(
              "emails",
              `⚠️ ${fullName(lead)} (${step.template.key}): generation failed, fallback`,
              "warn",
            );
            subject = `${company.name} — ${step.template.label}`;
            body = `Draft unavailable (${e instanceof Error ? e.message : "error"}). To be regenerated.`;
          }
          emails.push({
            id: p.id.next(),
            leadId: lead.id,
            templateKey: step.template.key,
            signalType: top?.signalType ?? null,
            sendDate: step.sendDate,
            subject,
            body,
            status: "scheduled",
          });
          interactions.push({
            id: p.id.next(),
            leadId: lead.id,
            date: step.sendDate,
            type: "email",
            note: `${step.template.label} — ${subject}`,
          });
        }
        await log("emails", `✍️ ${fullName(lead)} — ${scheduled.length} emails scheduled`);
      }
      await p.emails.saveMany(emails);
      await p.interactions.saveMany(interactions);

      await log("emails", `🎯 ${emails.length} emails generated`, "success");
      await p.runs.setStatus(runId, "done");
    } catch (err) {
      await log(
        "emails",
        `❌ Pipeline error: ${err instanceof Error ? err.message : String(err)}`,
        "error",
      );
      await p.runs.setStatus(runId, "error");
    }
  }
}
