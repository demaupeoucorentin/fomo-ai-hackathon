import { desc, eq } from "drizzle-orm";
import type {
  Company,
  CrmRefs,
  EmailMessage,
  EnrichStatus,
  Interaction,
  Lead,
  LogLevel,
  Run,
  RunPhase,
  RunStatus,
  Signal,
  StepLog,
  AgentType,
  EmailStatus,
} from "../../../core/domain/entities";
import type {
  CompanyRepositoryPort,
  EmailRepositoryPort,
  InteractionRepositoryPort,
  LeadRepositoryPort,
  RunRepositoryPort,
  SignalRepositoryPort,
  StepLogRepositoryPort,
} from "../../../core/ports/driven";
import { getDb } from "./client";
import * as s from "./schema";

type Row<T> = Record<string, unknown> & T;
const json = <T>(v: string | null): T | null => (v ? (JSON.parse(v) as T) : null);

const toRun = (r: typeof s.runs.$inferSelect): Run => ({
  id: r.id,
  name: r.name,
  status: r.status as RunStatus,
  signalRequestId: r.signalRequestId,
  createdAt: r.createdAt,
});

export class DrizzleRunRepository implements RunRepositoryPort {
  async create(run: Run) {
    const db = await getDb();
    await db.insert(s.runs).values({
      id: run.id,
      name: run.name,
      status: run.status,
      signalRequestId: run.signalRequestId,
      createdAt: run.createdAt,
    });
  }
  async get(id: string): Promise<Run | null> {
    const db = await getDb();
    const r = await db.select().from(s.runs).where(eq(s.runs.id, id)).get();
    return r ? toRun(r) : null;
  }
  async list(): Promise<Run[]> {
    const db = await getDb();
    return (await db.select().from(s.runs).orderBy(desc(s.runs.createdAt))).map(toRun);
  }
  async setStatus(id: string, status: RunStatus) {
    const db = await getDb();
    await db.update(s.runs).set({ status }).where(eq(s.runs.id, id));
  }
  async setSignalRequestId(id: string, signalRequestId: number) {
    const db = await getDb();
    await db.update(s.runs).set({ signalRequestId }).where(eq(s.runs.id, id));
  }
}

export class DrizzleCompanyRepository implements CompanyRepositoryPort {
  async saveMany(companies: Company[]) {
    if (companies.length === 0) return;
    const db = await getDb();
    await db.insert(s.companies).values(companies);
  }
  async listByRun(runId: string): Promise<Company[]> {
    const db = await getDb();
    return (await db.select().from(s.companies).where(eq(s.companies.runId, runId))) as Company[];
  }
  async get(id: string): Promise<Company | null> {
    const db = await getDb();
    return ((await db.select().from(s.companies).where(eq(s.companies.id, id)).get()) as Company) ?? null;
  }
}

const toLeadRow = (l: Lead) => ({ ...l, crm: l.crm ? JSON.stringify(l.crm) : null });
const fromLeadRow = (r: Row<Omit<Lead, "crm"> & { crm: string | null }>): Lead => ({
  ...r,
  enrichStatus: r.enrichStatus as EnrichStatus,
  crm: json<CrmRefs>(r.crm),
});

export class DrizzleLeadRepository implements LeadRepositoryPort {
  async saveMany(leads: Lead[]) {
    if (leads.length === 0) return;
    const db = await getDb();
    await db.insert(s.leads).values(leads.map(toLeadRow));
  }
  async update(lead: Lead) {
    const db = await getDb();
    await db.update(s.leads).set(toLeadRow(lead)).where(eq(s.leads.id, lead.id));
  }
  async listByRun(runId: string): Promise<Lead[]> {
    const db = await getDb();
    return ((await db.select().from(s.leads).where(eq(s.leads.runId, runId))) as any[]).map(fromLeadRow);
  }
  async get(id: string): Promise<Lead | null> {
    const db = await getDb();
    const r = (await db.select().from(s.leads).where(eq(s.leads.id, id)).get()) as any;
    return r ? fromLeadRow(r) : null;
  }
}

const toSignalRow = (x: Signal) => ({ ...x, data: x.data != null ? JSON.stringify(x.data) : null });
const fromSignalRow = (r: any): Signal => ({
  id: r.id,
  runId: r.runId,
  leadId: r.leadId,
  signalType: r.signalType,
  agentType: r.agentType as AgentType,
  signalDate: r.signalDate,
  data: json(r.data),
});

export class DrizzleSignalRepository implements SignalRepositoryPort {
  async saveMany(signals: Signal[]) {
    if (signals.length === 0) return;
    const db = await getDb();
    await db.insert(s.signals).values(signals.map(toSignalRow));
  }
  async listByLead(leadId: string): Promise<Signal[]> {
    const db = await getDb();
    return ((await db.select().from(s.signals).where(eq(s.signals.leadId, leadId))) as any[]).map(fromSignalRow);
  }
  async listByRun(runId: string): Promise<Signal[]> {
    const db = await getDb();
    return ((await db.select().from(s.signals).where(eq(s.signals.runId, runId))) as any[]).map(fromSignalRow);
  }
}

export class DrizzleEmailRepository implements EmailRepositoryPort {
  async saveMany(emails: EmailMessage[]) {
    if (emails.length === 0) return;
    const db = await getDb();
    await db.insert(s.emails).values(emails);
  }
  async listByLead(leadId: string): Promise<EmailMessage[]> {
    const db = await getDb();
    return ((await db.select().from(s.emails).where(eq(s.emails.leadId, leadId))) as any[]).map(
      (r) => ({ ...r, status: r.status as EmailStatus }),
    );
  }
  async listByRun(): Promise<EmailMessage[]> {
    const db = await getDb();
    return (await db.select().from(s.emails)) as EmailMessage[];
  }
}

export class DrizzleStepLogRepository implements StepLogRepositoryPort {
  async append(log: StepLog) {
    const db = await getDb();
    await db.insert(s.stepLogs).values(log);
  }
  async listByRun(runId: string): Promise<StepLog[]> {
    const db = await getDb();
    return ((await db.select().from(s.stepLogs).where(eq(s.stepLogs.runId, runId))) as any[]).map(
      (r) => ({ ...r, phase: r.phase as RunPhase, level: r.level as LogLevel }),
    );
  }
}

export class DrizzleInteractionRepository implements InteractionRepositoryPort {
  async saveMany(interactions: Interaction[]) {
    if (interactions.length === 0) return;
    const db = await getDb();
    await db.insert(s.interactions).values(interactions);
  }
  async listByLead(leadId: string): Promise<Interaction[]> {
    const db = await getDb();
    return ((await db.select().from(s.interactions).where(eq(s.interactions.leadId, leadId))) as any[]).map(
      (r) => ({ ...r, type: r.type as Interaction["type"] }),
    );
  }
}
