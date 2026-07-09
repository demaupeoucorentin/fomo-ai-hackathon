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

// One row in the Planning cockpit's left rail. Carries enough to render the
// lead + its signal badges + its email cadence summary, and to group/filter
// by the onboarding batch (runId/runName).
export interface PlanningLeadItem {
  lead: Lead;
  company: Company | null;
  agentTypes: string[];
  runId: string;
  runName: string | null;
  runCreatedAt: string; // ISO — for newest-batch-first ordering
  emailCount: number;
  nextSendDate: string | null; // earliest scheduled send in the future-or-now
}

export interface HomeStats {
  sequences: number;
  leads: number;
  emailsScheduled: number;
  emailsSent: number;
  contactsFound: number; // leads with an email
  signalsByType: { agentType: string; count: number }[]; // desc by count
}
