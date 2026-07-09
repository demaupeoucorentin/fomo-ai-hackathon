// Domain entities — plain data, no framework/db/HTTP imports.
// The whole hexagon depends inward on these types.

export type RunStatus = "pending" | "running" | "done" | "error";
export type RunPhase = "accounts" | "signals" | "enrich" | "emails";
export type EnrichStatus = "provided" | "pending" | "enriched" | "not_found";
export type EmailStatus = "scheduled" | "sent";
export type LogLevel = "info" | "success" | "warn" | "error";

// Sillage taxonomy (see docs). Kept as string unions we actually branch on.
export type AgentType =
  | "competitor_activity"
  | "keyword_detection"
  | "job_update"
  | "content_engagement"
  | "influencer_engagement"
  | "deep_search"
  | "job_posting"
  | "champion_tracking";

export type SignalType = string; // snake_case subtype; we route on AgentType

export interface Persona {
  jobTitle: string[];
  excludeJobTitle: string[];
  location: string[];
  headcount: string[];
  industry: string[];
  seniority: string[];
  additionalInfo: string | null;
}

export interface CrmRefs {
  hubspotContactId?: string | null;
  hubspotAccountId?: string | null;
  salesforceContactId?: string | null;
  salesforceAccountId?: string | null;
}

export interface Run {
  id: string;
  status: RunStatus;
  signalRequestId: number | null;
  createdAt: string; // ISO
}

export interface Company {
  id: string;
  runId: string;
  sillageCompanyId: number | null;
  name: string;
  domain: string | null;
  website: string | null;
  logoUrl: string | null;
  linkedin: string | null;
}

export interface Lead {
  id: string;
  runId: string;
  companyId: string;
  sillageLeadId: string | null;
  firstName: string;
  lastName: string;
  position: string | null;
  linkedin: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  enrichStatus: EnrichStatus;
  crm: CrmRefs | null;
}

export interface Signal {
  id: string;
  runId: string;
  leadId: string;
  signalType: SignalType;
  agentType: AgentType;
  signalDate: string | null; // ISO
  data: unknown; // agent-type-specific payload (kept raw)
}

export interface EmailMessage {
  id: string;
  leadId: string;
  templateKey: string;
  signalType: SignalType | null;
  sendDate: string; // ISO — J+0 / J+7 / J+14
  subject: string;
  body: string;
  status: EmailStatus;
}

export interface Interaction {
  id: string;
  leadId: string;
  date: string; // ISO
  type: "signal" | "email";
  note: string;
}

export interface StepLog {
  id: string;
  runId: string;
  phase: RunPhase;
  message: string;
  level: LogLevel;
  createdAt: string; // ISO
}

import type { CadenceDay } from "./value-objects";

export interface EmailTemplateContext {
  lead: Lead;
  company: Company;
  signal: Signal | null;
  persona: Persona | null;
}

export interface EmailTemplate {
  key: string;
  label: string;
  agentTypes: AgentType[]; // which signals this template answers to
  buildPrompt: (ctx: EmailTemplateContext) => string;
}

// A template placed at a cadence offset. The retro-planning is a list of these.
export interface SequenceStep {
  template: EmailTemplate;
  cadenceDays: CadenceDay;
}

export interface ScheduledStep {
  template: EmailTemplate;
  sendDate: string; // ISO
}

export const fullName = (l: Pick<Lead, "firstName" | "lastName">) =>
  `${l.firstName} ${l.lastName}`.trim();

export const hasContact = (l: Pick<Lead, "email" | "phone">) =>
  Boolean(l.email || l.phone);
