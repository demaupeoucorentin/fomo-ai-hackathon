// Output view-models returned by query use-cases (shaped for the UI).
import type {
  Company,
  EmailMessage,
  Interaction,
  Lead,
  Run,
  Signal,
  StepLog,
} from "../domain/entities";

export interface RunStatusView {
  run: Run;
  stepLogs: StepLog[];
  companies: Company[];
  leads: Lead[];
}

export interface LeadListItem {
  lead: Lead;
  company: Company | null;
  agentTypes: string[];
}

export interface LeadDetailView {
  lead: Lead;
  company: Company | null;
  signals: Signal[];
  emails: EmailMessage[];
  interactions: Interaction[];
}

export interface SequenceListItem {
  run: Run;
  companies: Company[];
  leadCount: number;
}
