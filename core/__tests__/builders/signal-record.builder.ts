// Test Data Builders — fluent, sensible defaults, .with*() overrides, .build().
import type { AgentType } from "../../domain/entities";
import type {
  CompanyRecord,
  LeadRecord,
  SignalRecord,
} from "../../ports/driven/dto";

export const aCompanyRecord = () => {
  let c: CompanyRecord = {
    sillageCompanyId: 1,
    name: "Acme",
    domain: "acme.com",
    website: "https://acme.com",
    logoUrl: null,
    linkedin: null,
  };
  const api = {
    withName: (name: string) => ((c = { ...c, name }), api),
    withDomain: (domain: string) => ((c = { ...c, domain }), api),
    build: () => c,
  };
  return api;
};

export const aLeadRecord = () => {
  let l: LeadRecord = {
    sillageLeadId: "lead-1",
    firstName: "Jane",
    lastName: "Doe",
    position: "VP Sales",
    linkedin: "https://linkedin.com/in/janedoe",
    avatarUrl: null,
    email: null,
    phone: null,
    crm: null,
    company: aCompanyRecord().build(),
  };
  const api = {
    withId: (sillageLeadId: string | null) => ((l = { ...l, sillageLeadId }), api),
    withName: (firstName: string, lastName: string) =>
      ((l = { ...l, firstName, lastName }), api),
    withEmail: (email: string) => ((l = { ...l, email }), api),
    withPhone: (phone: string) => ((l = { ...l, phone }), api),
    withoutContact: () => ((l = { ...l, email: null, phone: null }), api),
    atCompany: (company: CompanyRecord) => ((l = { ...l, company }), api),
    build: () => l,
  };
  return api;
};

export const aSignalRecord = () => {
  let s: SignalRecord = {
    signalType: "linkedin_comment",
    agentType: "competitor_activity",
    signalDate: "2026-07-01T00:00:00.000Z",
    data: {},
    lead: aLeadRecord().build(),
  };
  const api = {
    ofType: (agentType: AgentType) => ((s = { ...s, agentType }), api),
    on: (date: string) => ((s = { ...s, signalDate: date }), api),
    forLead: (lead: LeadRecord) => ((s = { ...s, lead }), api),
    build: () => s,
  };
  return api;
};
