// External-service ports (implemented by adapters/driven/{sillage,fullenrich,anthropic}).
import type { EmailTemplate, Persona } from "../../domain/entities";
import type {
  AccountInput,
  CompanyRecord,
  EnrichInput,
  EnrichResult,
  SignalRecord,
} from "./dto";
import type {
  EmailTemplateContext,
  Company,
  Lead,
  Signal,
} from "../../domain/entities";

export type ProgressFn = (label: string) => void;

// Sillage: accounts + signal detection. Polling lives inside the adapter;
// the use-case receives finished results and an optional live-label stream.
export interface SignalProviderPort {
  importAccounts(
    accounts: AccountInput[],
    onProgress?: ProgressFn,
  ): Promise<CompanyRecord[]>;
  detectSignals(
    opts?: { agentId?: number; onProgress?: ProgressFn },
  ): Promise<SignalRecord[]>;
}

// Sillage persona = the ICP.
export interface PersonaStorePort {
  get(): Promise<Persona | null>;
  upsert(persona: Persona): Promise<void>;
}

// Anthropic: website -> ICP draft.
export interface IcpGeneratorPort {
  fromWebsite(input: { url: string; siteText: string }): Promise<Persona>;
}

// FullEnrich: bulk email/phone lookup. Returns results keyed by EnrichInput.key.
export interface ContactEnricherPort {
  enrich(
    contacts: EnrichInput[],
    onProgress?: ProgressFn,
  ): Promise<Record<string, EnrichResult>>;
}

// Anthropic: a short evocative codename for a new sequence (run).
export interface SequenceNamerPort {
  generate(context: { companies: string[] }): Promise<string>;
}

// Anthropic: comparator email from a lead + its triggering signal + a template.
export interface EmailGeneratorPort {
  write(ctx: EmailTemplateContext & { template: EmailTemplate }): Promise<{
    subject: string;
    body: string;
  }>;
}

// Re-export for convenience in adapters.
export type { Company, Lead, Signal, EmailTemplate };
