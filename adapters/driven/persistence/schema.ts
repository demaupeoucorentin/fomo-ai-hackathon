import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),
  signalRequestId: integer("signal_request_id"),
  createdAt: text("created_at").notNull(),
});

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  sillageCompanyId: integer("sillage_company_id"),
  name: text("name").notNull(),
  domain: text("domain"),
  website: text("website"),
  logoUrl: text("logo_url"),
  linkedin: text("linkedin"),
});

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  companyId: text("company_id").notNull(),
  sillageLeadId: text("sillage_lead_id"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position"),
  linkedin: text("linkedin"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  phone: text("phone"),
  enrichStatus: text("enrich_status").notNull(),
  crm: text("crm"), // json
});

export const signals = sqliteTable("signals", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  leadId: text("lead_id").notNull(),
  signalType: text("signal_type").notNull(),
  agentType: text("agent_type").notNull(),
  signalDate: text("signal_date"),
  data: text("data"), // json
});

export const emails = sqliteTable("emails", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  templateKey: text("template_key").notNull(),
  signalType: text("signal_type"),
  sendDate: text("send_date").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull(),
});

export const stepLogs = sqliteTable("step_logs", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull(),
  phase: text("phase").notNull(),
  message: text("message").notNull(),
  level: text("level").notNull(),
  createdAt: text("created_at").notNull(),
});

export const interactions = sqliteTable("interactions", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  note: text("note").notNull(),
});
