import type { EmailMessage } from "../domain/entities";
import { fullName } from "../domain/entities";
import { NotFoundError } from "../domain/errors";
import type { Ports } from "../ports/driven";
import type {
  HomeStats,
  LeadDetailView,
  LeadListItem,
  PlanningLeadItem,
  RunStatusView,
  SequenceListItem,
} from "./dto";

export class GetRunStatus {
  constructor(
    private readonly ports: Pick<
      Ports,
      "runs" | "stepLogs" | "companies" | "leads"
    >,
  ) {}

  async execute(runId: string): Promise<RunStatusView> {
    const run = await this.ports.runs.get(runId);
    if (!run) throw new NotFoundError("Run", runId);
    const [stepLogs, companies, leads] = await Promise.all([
      this.ports.stepLogs.listByRun(runId),
      this.ports.companies.listByRun(runId),
      this.ports.leads.listByRun(runId),
    ]);
    return { run, stepLogs, companies, leads };
  }
}

export class GetSequences {
  constructor(private readonly ports: Pick<Ports, "runs" | "companies" | "leads">) {}

  async execute(): Promise<SequenceListItem[]> {
    const runs = await this.ports.runs.list(); // newest first
    return Promise.all(
      runs.map(async (run) => {
        const [companies, leads] = await Promise.all([
          this.ports.companies.listByRun(run.id),
          this.ports.leads.listByRun(run.id),
        ]);
        return { run, companies, leadCount: leads.length };
      }),
    );
  }
}

export class GetLeads {
  constructor(
    private readonly ports: Pick<Ports, "leads" | "companies" | "signals">,
  ) {}

  async execute(runId: string): Promise<LeadListItem[]> {
    const [leads, companies, signals] = await Promise.all([
      this.ports.leads.listByRun(runId),
      this.ports.companies.listByRun(runId),
      this.ports.signals.listByRun(runId),
    ]);
    const companyById = new Map(companies.map((c) => [c.id, c]));
    const agentsByLead = new Map<string, Set<string>>();
    for (const s of signals) {
      const set = agentsByLead.get(s.leadId) ?? new Set<string>();
      set.add(s.agentType);
      agentsByLead.set(s.leadId, set);
    }
    return leads.map((lead) => ({
      lead,
      company: companyById.get(lead.companyId) ?? null,
      agentTypes: [...(agentsByLead.get(lead.id) ?? [])],
    }));
  }
}

// Every lead across every batch, shaped for the Planning cockpit's left rail.
export class GetAllLeads {
  constructor(
    private readonly ports: Pick<
      Ports,
      "leads" | "companies" | "signals" | "emails" | "runs"
    >,
  ) {}

  async execute(): Promise<PlanningLeadItem[]> {
    const [leads, companies, signals, emails, runs] = await Promise.all([
      this.ports.leads.listAll(),
      this.ports.companies.listAll(),
      this.ports.signals.listAll(),
      this.ports.emails.listAll(),
      this.ports.runs.list(),
    ]);
    const companyById = new Map(companies.map((c) => [c.id, c]));
    const runById = new Map(runs.map((r) => [r.id, r]));
    const agentsByLead = new Map<string, Set<string>>();
    for (const s of signals) {
      const set = agentsByLead.get(s.leadId) ?? new Set<string>();
      set.add(s.agentType);
      agentsByLead.set(s.leadId, set);
    }
    const emailsByLead = new Map<string, EmailMessage[]>();
    for (const e of emails) {
      const arr = emailsByLead.get(e.leadId) ?? [];
      arr.push(e);
      emailsByLead.set(e.leadId, arr);
    }

    const items: PlanningLeadItem[] = leads.map((lead) => {
      const run = runById.get(lead.runId);
      const le = emailsByLead.get(lead.id) ?? [];
      const nextSendDate =
        le
          .filter((e) => e.status === "scheduled")
          .map((e) => e.sendDate)
          .sort()[0] ?? null;
      return {
        lead,
        company: companyById.get(lead.companyId) ?? null,
        agentTypes: [...(agentsByLead.get(lead.id) ?? [])],
        runId: lead.runId,
        runName: run?.name ?? null,
        runCreatedAt: run?.createdAt ?? "",
        emailCount: le.length,
        nextSendDate,
      };
    });
    // Newest onboarding batch first, then alphabetical by lead.
    items.sort(
      (a, b) =>
        b.runCreatedAt.localeCompare(a.runCreatedAt) ||
        fullName(a.lead).localeCompare(fullName(b.lead)),
    );
    return items;
  }
}

// Aggregate counters for the Home page.
export class GetHomeStats {
  constructor(
    private readonly ports: Pick<Ports, "leads" | "emails" | "signals" | "runs">,
  ) {}

  async execute(): Promise<HomeStats> {
    const [leads, emails, signals, runs] = await Promise.all([
      this.ports.leads.listAll(),
      this.ports.emails.listAll(),
      this.ports.signals.listAll(),
      this.ports.runs.list(),
    ]);
    const byType = new Map<string, number>();
    for (const s of signals) byType.set(s.agentType, (byType.get(s.agentType) ?? 0) + 1);
    return {
      sequences: runs.length,
      leads: leads.length,
      emailsScheduled: emails.filter((e) => e.status === "scheduled").length,
      emailsSent: emails.filter((e) => e.status === "sent").length,
      contactsFound: leads.filter((l) => !!l.email).length,
      signalsByType: [...byType.entries()]
        .map(([agentType, count]) => ({ agentType, count }))
        .sort((a, b) => b.count - a.count),
    };
  }
}

export class GetLeadDetail {
  constructor(
    private readonly ports: Pick<
      Ports,
      "leads" | "companies" | "signals" | "emails" | "interactions"
    >,
  ) {}

  async execute(leadId: string): Promise<LeadDetailView> {
    const lead = await this.ports.leads.get(leadId);
    if (!lead) throw new NotFoundError("Lead", leadId);
    const [company, signals, emails, interactions] = await Promise.all([
      this.ports.companies.get(lead.companyId),
      this.ports.signals.listByLead(leadId),
      this.ports.emails.listByLead(leadId),
      this.ports.interactions.listByLead(leadId),
    ]);
    // chronological
    interactions.sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    emails.sort((a, b) => Date.parse(a.sendDate) - Date.parse(b.sendDate));
    return { lead, company, signals, emails, interactions };
  }
}
