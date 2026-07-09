// In-memory port fakes + composition for tests. Distinct from
// adapters/driven/mock (runtime demo fallback) — these are test doubles.
import type {
  Company,
  EmailMessage,
  Interaction,
  Lead,
  Persona,
  Run,
  RunStatus,
  Signal,
  StepLog,
} from "../../domain/entities";
import type {
  AccountInput,
  CompanyRecord,
  ContactEnricherPort,
  EmailGeneratorPort,
  EnrichInput,
  EnrichResult,
  IcpGeneratorPort,
  PersonaStorePort,
  Ports,
  ProgressFn,
  SignalProviderPort,
  SignalRecord,
} from "../../ports/driven";
import { fullName } from "../../domain/entities";

class InMemoryRuns {
  items: Run[] = [];
  async create(run: Run) {
    this.items.push({ ...run });
  }
  async get(id: string) {
    return this.items.find((r) => r.id === id) ?? null;
  }
  async setStatus(id: string, status: RunStatus) {
    const r = this.items.find((x) => x.id === id);
    if (r) r.status = status;
  }
  async setSignalRequestId(id: string, signalRequestId: number) {
    const r = this.items.find((x) => x.id === id);
    if (r) r.signalRequestId = signalRequestId;
  }
}

class InMemoryCompanies {
  items: Company[] = [];
  async saveMany(companies: Company[]) {
    this.items.push(...companies.map((c) => ({ ...c })));
  }
  async listByRun(runId: string) {
    return this.items.filter((c) => c.runId === runId);
  }
  async get(id: string) {
    return this.items.find((c) => c.id === id) ?? null;
  }
}

class InMemoryLeads {
  items: Lead[] = [];
  async saveMany(leads: Lead[]) {
    this.items.push(...leads.map((l) => ({ ...l })));
  }
  async update(lead: Lead) {
    const i = this.items.findIndex((l) => l.id === lead.id);
    if (i >= 0) this.items[i] = { ...lead };
  }
  async listByRun(runId: string) {
    return this.items.filter((l) => l.runId === runId);
  }
  async get(id: string) {
    return this.items.find((l) => l.id === id) ?? null;
  }
}

class InMemorySignals {
  items: Signal[] = [];
  async saveMany(signals: Signal[]) {
    this.items.push(...signals.map((s) => ({ ...s })));
  }
  async listByLead(leadId: string) {
    return this.items.filter((s) => s.leadId === leadId);
  }
  async listByRun(runId: string) {
    return this.items.filter((s) => s.runId === runId);
  }
}

class InMemoryEmails {
  items: EmailMessage[] = [];
  async saveMany(emails: EmailMessage[]) {
    this.items.push(...emails.map((e) => ({ ...e })));
  }
  async listByLead(leadId: string) {
    return this.items.filter((e) => e.leadId === leadId);
  }
  async listByRun() {
    return this.items;
  }
}

class InMemoryStepLogs {
  items: StepLog[] = [];
  async append(log: StepLog) {
    this.items.push({ ...log });
  }
  async listByRun(runId: string) {
    return this.items.filter((s) => s.runId === runId);
  }
}

class InMemoryInteractions {
  items: Interaction[] = [];
  async saveMany(interactions: Interaction[]) {
    this.items.push(...interactions.map((i) => ({ ...i })));
  }
  async listByLead(leadId: string) {
    return this.items.filter((i) => i.leadId === leadId);
  }
}

export class FakeSignalProvider implements SignalProviderPort {
  importedAccounts: AccountInput[] = [];
  constructor(
    private readonly signals: SignalRecord[],
    private readonly companies: CompanyRecord[] = [],
  ) {}
  async importAccounts(accounts: AccountInput[], onProgress?: ProgressFn) {
    this.importedAccounts = accounts;
    onProgress?.("importing");
    return this.companies;
  }
  async detectSignals(opts?: { onProgress?: ProgressFn }) {
    opts?.onProgress?.("Detecting signals");
    return this.signals;
  }
}

export class FakeContactEnricher implements ContactEnricherPort {
  calls: EnrichInput[][] = [];
  async enrich(contacts: EnrichInput[]): Promise<Record<string, EnrichResult>> {
    this.calls.push(contacts);
    const out: Record<string, EnrichResult> = {};
    for (const c of contacts) {
      out[c.key] = {
        email: `${c.firstName}.${c.lastName}@${c.domain ?? "example.com"}`.toLowerCase(),
        phone: "+33100000000",
      };
    }
    return out;
  }
}

export class FakeEmailGenerator implements EmailGeneratorPort {
  async write(ctx: Parameters<EmailGeneratorPort["write"]>[0]) {
    return {
      subject: `Subject:${ctx.template.key}`,
      body: `Body for ${fullName(ctx.lead)} via ${ctx.template.key}`,
    };
  }
}

export class FakeIcpGenerator implements IcpGeneratorPort {
  async fromWebsite(): Promise<Persona> {
    return {
      jobTitle: ["VP Sales"],
      excludeJobTitle: [],
      location: ["France"],
      headcount: [],
      industry: ["SaaS"],
      seniority: ["vp"],
      additionalInfo: "generated",
    };
  }
}

export class FakePersonaStore implements PersonaStorePort {
  persona: Persona | null = null;
  async get() {
    return this.persona;
  }
  async upsert(persona: Persona) {
    this.persona = persona;
  }
}

export class FixedClock {
  constructor(private readonly date = new Date("2026-07-09T00:00:00.000Z")) {}
  now() {
    return new Date(this.date.getTime());
  }
}

export class SeqId {
  private n = 0;
  next() {
    this.n += 1;
    return `id-${this.n}`;
  }
}

export interface FakePorts extends Ports {
  runs: InMemoryRuns;
  companies: InMemoryCompanies;
  leads: InMemoryLeads;
  signals: InMemorySignals;
  emails: InMemoryEmails;
  stepLogs: InMemoryStepLogs;
  interactions: InMemoryInteractions;
  signalProvider: FakeSignalProvider;
  contactEnricher: FakeContactEnricher;
  personaStore: FakePersonaStore;
}

export const makeFakePorts = (opts?: {
  signals?: SignalRecord[];
}): FakePorts => ({
  signalProvider: new FakeSignalProvider(opts?.signals ?? []),
  personaStore: new FakePersonaStore(),
  icpGenerator: new FakeIcpGenerator(),
  contactEnricher: new FakeContactEnricher(),
  emailGenerator: new FakeEmailGenerator(),
  runs: new InMemoryRuns(),
  companies: new InMemoryCompanies(),
  leads: new InMemoryLeads(),
  signals: new InMemorySignals(),
  emails: new InMemoryEmails(),
  stepLogs: new InMemoryStepLogs(),
  interactions: new InMemoryInteractions(),
  clock: new FixedClock(),
  id: new SeqId(),
});
