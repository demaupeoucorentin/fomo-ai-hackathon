import { NotFoundError } from "../domain/errors";
import type { Ports } from "../ports/driven";
import type {
  LeadDetailView,
  LeadListItem,
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
