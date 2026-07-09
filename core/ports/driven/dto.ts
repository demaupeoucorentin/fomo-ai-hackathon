// DTOs at the driven-port boundary. Adapters map external payloads to these;
// use-cases consume them and turn them into entities.
import type { AgentType, CrmRefs } from "../../domain/entities";

export interface AccountInput {
  name?: string;
  domain?: string;
  linkedinUrl?: string;
}

export interface CompanyRecord {
  sillageCompanyId: number | null;
  name: string;
  domain: string | null;
  website: string | null;
  logoUrl: string | null;
  linkedin: string | null;
}

export interface LeadRecord {
  sillageLeadId: string | null;
  firstName: string;
  lastName: string;
  position: string | null;
  linkedin: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  crm: CrmRefs | null;
  company: CompanyRecord;
}

export interface SignalRecord {
  signalType: string;
  agentType: AgentType;
  signalDate: string | null;
  data: unknown;
  lead: LeadRecord;
}

export interface EnrichInput {
  key: string; // caller correlation id (leadId)
  firstName: string;
  lastName: string;
  domain?: string;
  companyName?: string;
  linkedinUrl?: string;
}

export interface EnrichResult {
  email: string | null;
  phone: string | null;
}
