import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// ponytail: create tables on boot with idempotent DDL instead of a migration
// pipeline. Single-process hackathon DB; upgrade to drizzle-kit if the schema churns.
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

// Singleton across dev hot-reloads.
const g = globalThis as unknown as { __db?: Db };

function build(): Db {
  const sqlite = new Database(process.env.SQLITE_PATH ?? "sqlite.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.exec(DDL);
  // Additive migration for DBs created before `name` existed.
  try {
    sqlite.exec("ALTER TABLE runs ADD COLUMN name TEXT");
  } catch {
    /* column already exists */
  }
  return drizzle(sqlite, { schema });
}

// Lazy: the DB file is only opened on first query, not at import time. This
// keeps `next build` page-data collection from opening N connections in
// parallel workers (SQLITE_BUSY).
function getDb(): Db {
  return g.__db ?? (g.__db = build());
}

export const db = new Proxy({} as Db, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
}) as Db;
