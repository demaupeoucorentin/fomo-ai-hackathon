import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// ponytail: create tables on boot with idempotent DDL instead of a migration
// pipeline. Single-schema hackathon DB; upgrade to drizzle-kit if the schema churns.
const DDL = `
CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, name TEXT, status TEXT NOT NULL, signal_request_id INTEGER, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, sillage_company_id INTEGER, name TEXT NOT NULL, domain TEXT, website TEXT, logo_url TEXT, linkedin TEXT);
CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, company_id TEXT NOT NULL, sillage_lead_id TEXT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, position TEXT, linkedin TEXT, avatar_url TEXT, email TEXT, phone TEXT, enrich_status TEXT NOT NULL, crm TEXT);
CREATE TABLE IF NOT EXISTS signals (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, lead_id TEXT NOT NULL, signal_type TEXT NOT NULL, agent_type TEXT NOT NULL, signal_date TEXT, data TEXT);
CREATE TABLE IF NOT EXISTS emails (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, template_key TEXT NOT NULL, signal_type TEXT, send_date TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS step_logs (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, phase TEXT NOT NULL, message TEXT NOT NULL, level TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS interactions (id TEXT PRIMARY KEY, lead_id TEXT NOT NULL, date TEXT NOT NULL, type TEXT NOT NULL, note TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_companies_run ON companies(run_id);
CREATE INDEX IF NOT EXISTS idx_leads_run ON leads(run_id);
CREATE INDEX IF NOT EXISTS idx_signals_run ON signals(run_id);
CREATE INDEX IF NOT EXISTS idx_signals_lead ON signals(lead_id);
CREATE INDEX IF NOT EXISTS idx_emails_lead ON emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_steplogs_run ON step_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_interactions_lead ON interactions(lead_id);
`;

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Singleton promise across serverless-instance reuse and dev hot-reloads.
const g = globalThis as unknown as { __dbP?: Promise<Db> };

async function build(): Promise<Db> {
  // Local dev: a file in the repo root. Prod (Vercel): a Turso/libSQL URL so the
  // background pipeline and the polling reads share ONE durable, cross-instance DB.
  const url = process.env.DATABASE_URL ?? "file:sqlite.db";
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const client = createClient({ url, authToken });
  await client.executeMultiple(DDL);
  // Additive migration for DBs created before `name` existed.
  try {
    await client.execute("ALTER TABLE runs ADD COLUMN name TEXT");
  } catch {
    /* column already exists */
  }
  return drizzle(client, { schema });
}

// Lazy + async: the connection opens on first use and the DDL runs exactly once.
export function getDb(): Promise<Db> {
  return (g.__dbP ??= build());
}
