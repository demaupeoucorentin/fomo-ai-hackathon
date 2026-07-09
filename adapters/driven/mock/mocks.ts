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

const MOCK_SIGNALS: SignalRecord[] = [
  {
    signalType: "linkedin_comment",
    agentType: "competitor_activity",
    signalDate: "2026-07-02T09:00:00.000Z",
    data: { interaction: { author: { company_name: "CompetitorX" } } },
    lead: lead("s-1", "Camille", "Roche", "VP Sales", ACME),
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
  {
    signalType: "job_posting",
    agentType: "job_posting",
    signalDate: "2026-07-03T09:00:00.000Z",
    data: { posting: { title: "Account Executive" } },
    lead: lead("s-4", "David", "Klein", "Sales Director", NORTHWIND),
  },
  {
    signalType: "linkedin_reaction",
    agentType: "competitor_activity",
    signalDate: "2026-07-06T09:00:00.000Z",
    data: { interaction: { author: { company_name: "RivalCo" } } },
    lead: lead("s-5", "Amara", "Diallo", "Head of Revenue Ops", GLOBEX),
  },
];

export class MockSignalProvider implements SignalProviderPort {
  async importAccounts(accounts: AccountInput[], onProgress?: ProgressFn) {
    onProgress?.(`Résolution de ${accounts.length} comptes…`);
    await sleep(500);
    return [ACME, NORTHWIND, GLOBEX];
  }
  async detectSignals(opts?: { onProgress?: ProgressFn }) {
    const stages = ["Scan LinkedIn…", "Analyse des concurrents…", "Détection d'intention…"];
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
      onProgress?.(`Enrichissement ${c.firstName} ${c.lastName}…`);
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
      seniority: ["vp", "director", "c_level"],
      additionalInfo: `ICP inféré depuis ${url} : équipes sales B2B en hypercroissance.`,
    };
  }
}

export class MockEmailGenerator implements EmailGeneratorPort {
  async write(ctx: Parameters<EmailGeneratorPort["write"]>[0]) {
    await sleep(200);
    const name = fullName(ctx.lead).split(" ")[0];
    return {
      subject: `${ctx.company.name} vs les autres — un comparatif rapide`,
      body: `Bonjour ${name},\n\nJ'ai vu le signal récent côté ${ctx.company.name}. En regardant objectivement les options du marché, une chose ressort clairement sur la mise en œuvre et le ROI.\n\nJe vous partage un comparatif neutre de 2 min ?\n\n— (${ctx.template.label})`,
    };
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
