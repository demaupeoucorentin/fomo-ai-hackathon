// Runtime demo doubles — used when an API key is missing so the whole flow runs
// on stage without external calls. Distinct from core/__tests__ fakes.
import type { Persona } from "../../../core/domain/entities";
import { fullName } from "../../../core/domain/entities";
import type {
  AccountInput,
  CompanyRecord,
  ContactEnricherPort,
  EmailGeneratorPort,
  EnrichInput,
  EnrichResult,
  IcpGeneratorPort,
  PersonaStorePort,
  ProgressFn,
  SequenceNamerPort,
  SignalProviderPort,
  SignalRecord,
} from "../../../core/ports/driven";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const company = (name: string, domain: string): CompanyRecord => ({
  sillageCompanyId: null,
  name,
  domain,
  website: `https://${domain}`,
  logoUrl: `https://logo.clearbit.com/${domain}`,
  linkedin: null,
});

const ACME = company("Acme Analytics", "acme.com");
const NORTHWIND = company("Northwind", "northwind.io");
const GLOBEX = company("Globex", "globex.com");
const INITECH = company("Initech", "initech.com");
const UMBRELLA = company("Umbrella", "umbrella.co");

const lead = (
  id: string,
  first: string,
  last: string,
  position: string,
  co: CompanyRecord,
  email: string | null = null,
) => ({
  sillageLeadId: id,
  firstName: first,
  lastName: last,
  position,
  linkedin: `https://linkedin.com/in/${first}${last}`.toLowerCase(),
  avatarUrl: `https://i.pravatar.cc/120?u=${id}`,
  email,
  phone: null,
  crm: null,
  company: co,
});

const CAMILLE = lead("s-1", "Camille", "Roche", "VP Sales", ACME);
const DAVID = lead("s-4", "David", "Klein", "Sales Director", NORTHWIND);
const NADIA = lead("s-7", "Nadia", "Haddad", "Head of Sales", UMBRELLA);

const MOCK_SIGNALS: SignalRecord[] = [
  // Camille — two signals (multi-touch: shows the merged timeline nicely)
  {
    signalType: "linkedin_comment",
    agentType: "competitor_activity",
    signalDate: "2026-07-02T09:00:00.000Z",
    data: { interaction: { author: { company_name: "CompetitorX" } } },
    lead: CAMILLE,
  },
  {
    signalType: "content_view",
    agentType: "content_engagement",
    signalDate: "2026-07-06T09:00:00.000Z",
    data: { content: { title: "State of Sales Benchmarks 2026" } },
    lead: CAMILLE,
  },
  {
    signalType: "deep_search",
    agentType: "deep_search",
    signalDate: "2026-07-05T09:00:00.000Z",
    data: { title: "Series B raised", tag: "funding" },
    lead: lead("s-2", "Julien", "Marchand", "Head of Growth", ACME, "julien.marchand@acme.com"),
  },
  {
    signalType: "new_job",
    agentType: "job_update",
    signalDate: "2026-07-04T09:00:00.000Z",
    data: { new_position: { role: "CRO" } },
    lead: lead("s-3", "Sofia", "Nkemba", "Chief Revenue Officer", NORTHWIND),
  },
  // David — two signals
  {
    signalType: "job_posting",
    agentType: "job_posting",
    signalDate: "2026-07-03T09:00:00.000Z",
    data: { posting: { title: "Account Executive" } },
    lead: DAVID,
  },
  {
    signalType: "keyword_match",
    agentType: "keyword_detection",
    signalDate: "2026-07-05T09:00:00.000Z",
    data: { keyword: "sales enablement" },
    lead: DAVID,
  },
  {
    signalType: "linkedin_reaction",
    agentType: "competitor_activity",
    signalDate: "2026-07-06T09:00:00.000Z",
    data: { interaction: { author: { company_name: "RivalCo" } } },
    lead: lead("s-5", "Amara", "Diallo", "Head of Revenue Ops", GLOBEX),
  },
  {
    signalType: "influencer_reaction",
    agentType: "influencer_engagement",
    signalDate: "2026-07-01T09:00:00.000Z",
    data: { interaction: { author: { name: "Top Sales Voice" } } },
    lead: lead("s-6", "Liam", "O'Brien", "VP Marketing", INITECH),
  },
  // Nadia — two signals
  {
    signalType: "deep_search",
    agentType: "deep_search",
    signalDate: "2026-07-04T09:00:00.000Z",
    data: { title: "Opened new EU office", tag: "expansion" },
    lead: NADIA,
  },
  {
    signalType: "champion_move",
    agentType: "champion_tracking",
    signalDate: "2026-07-06T09:00:00.000Z",
    data: { champion: { note: "Ex-customer joined as Head of Sales" } },
    lead: NADIA,
  },
  {
    signalType: "job_posting",
    agentType: "job_posting",
    signalDate: "2026-07-02T09:00:00.000Z",
    data: { posting: { title: "Sales Manager" } },
    lead: lead("s-8", "Marco", "Rossi", "Sales Manager", GLOBEX),
  },
];

export class MockSignalProvider implements SignalProviderPort {
  async importAccounts(accounts: AccountInput[], onProgress?: ProgressFn) {
    onProgress?.(`Resolving ${accounts.length} accounts…`);
    await sleep(500);
    return [ACME, NORTHWIND, GLOBEX, INITECH, UMBRELLA];
  }
  async detectSignals(opts?: { onProgress?: ProgressFn }) {
    const stages = ["Scanning LinkedIn…", "Analyzing competitors…", "Detecting intent…"];
    for (const st of stages) {
      opts?.onProgress?.(st);
      await sleep(450);
    }
    return MOCK_SIGNALS;
  }
}

export class MockContactEnricher implements ContactEnricherPort {
  async enrich(contacts: EnrichInput[], onProgress?: ProgressFn) {
    const out: Record<string, EnrichResult> = {};
    for (const c of contacts) {
      onProgress?.(`Enriching ${c.firstName} ${c.lastName}…`);
      await sleep(350);
      out[c.key] = {
        email: `${c.firstName}.${c.lastName}@${c.domain ?? "example.com"}`.toLowerCase(),
        phone: "+33 6 12 34 56 78",
      };
    }
    return out;
  }
}

export class MockIcpGenerator implements IcpGeneratorPort {
  async fromWebsite({ url }: { url: string }): Promise<Persona> {
    await sleep(700);
    return {
      jobTitle: ["VP Sales", "Head of Growth", "Chief Revenue Officer"],
      excludeJobTitle: ["Intern"],
      location: ["France", "United Kingdom"],
      headcount: ["51-200", "201-500"],
      industry: ["SaaS", "B2B Software"],
      seniority: ["vp", "director", "c_suite"],
      additionalInfo: `ICP inferred from ${url}: hypergrowth B2B sales teams.`,
      trackingKeywords: ["buying signals", "sales intelligence", "outbound"],
    };
  }
}

export class MockEmailGenerator implements EmailGeneratorPort {
  async write(ctx: Parameters<EmailGeneratorPort["write"]>[0]) {
    await sleep(200);
    const name = fullName(ctx.lead).split(" ")[0];
    return {
      subject: `${ctx.company.name} vs the rest — a quick comparison`,
      body: `Hi ${name},\n\nI saw the recent signal on ${ctx.company.name}'s side. Looking objectively at the options on the market, one thing clearly stands out on implementation and ROI.\n\nMind if I share a neutral 2-min comparison?\n\n— (${ctx.template.label})`,
    };
  }
}

const CODENAMES = [
  "Cobalt Horizon",
  "Amber Tide",
  "Ivory Eclipse",
  "Scarlet Wake",
  "Indigo Dawn",
  "Saffron Comet",
  "Emerald Breeze",
  "Onyx Zenith",
];
let nameCounter = 0;

export class MockSequenceNamer implements SequenceNamerPort {
  async generate(): Promise<string> {
    const n = CODENAMES[nameCounter % CODENAMES.length];
    nameCounter += 1;
    return n;
  }
}

export class MockPersonaStore implements PersonaStorePort {
  private persona: Persona | null = null;
  async get() {
    return this.persona;
  }
  async upsert(p: Persona) {
    this.persona = p;
  }
}
