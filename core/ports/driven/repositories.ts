// Persistence ports (implemented by adapters/driven/persistence with Drizzle,
// and by in-memory fakes in tests).
import type {
  Company,
  EmailMessage,
  Interaction,
  Lead,
  Run,
  RunStatus,
  Signal,
  StepLog,
} from "../../domain/entities";

export interface RunRepositoryPort {
  create(run: Run): Promise<void>;
  get(id: string): Promise<Run | null>;
  list(): Promise<Run[]>; // newest first
  setStatus(id: string, status: RunStatus): Promise<void>;
  setSignalRequestId(id: string, signalRequestId: number): Promise<void>;
}

export interface CompanyRepositoryPort {
  saveMany(companies: Company[]): Promise<void>;
  listByRun(runId: string): Promise<Company[]>;
  get(id: string): Promise<Company | null>;
}

export interface LeadRepositoryPort {
  saveMany(leads: Lead[]): Promise<void>;
  update(lead: Lead): Promise<void>;
  listByRun(runId: string): Promise<Lead[]>;
  get(id: string): Promise<Lead | null>;
}

export interface SignalRepositoryPort {
  saveMany(signals: Signal[]): Promise<void>;
  listByLead(leadId: string): Promise<Signal[]>;
  listByRun(runId: string): Promise<Signal[]>;
}

export interface EmailRepositoryPort {
  saveMany(emails: EmailMessage[]): Promise<void>;
  listByLead(leadId: string): Promise<EmailMessage[]>;
  listByRun(runId: string): Promise<EmailMessage[]>;
}

export interface StepLogRepositoryPort {
  append(log: StepLog): Promise<void>;
  listByRun(runId: string): Promise<StepLog[]>;
}

export interface InteractionRepositoryPort {
  saveMany(interactions: Interaction[]): Promise<void>;
  listByLead(leadId: string): Promise<Interaction[]>;
}
