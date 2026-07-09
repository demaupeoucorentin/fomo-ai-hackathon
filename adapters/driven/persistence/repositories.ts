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
import { db } from "./client";
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
    db.insert(s.runs)
      .values({
        id: run.id,
        name: run.name,
        status: run.status,
        signalRequestId: run.signalRequestId,
        createdAt: run.createdAt,
      })
      .run();
  }
  async get(id: string): Promise<Run | null> {
    const r = db.select().from(s.runs).where(eq(s.runs.id, id)).get();
    return r ? toRun(r) : null;
  }
  async list(): Promise<Run[]> {
    return db.select().from(s.runs).orderBy(desc(s.runs.createdAt)).all().map(toRun);
  }
  async setStatus(id: string, status: RunStatus) {
    db.update(s.runs).set({ status }).where(eq(s.runs.id, id)).run();
  }
  async setSignalRequestId(id: string, signalRequestId: number) {
    db.update(s.runs).set({ signalRequestId }).where(eq(s.runs.id, id)).run();
  }
}

export class DrizzleCompanyRepository implements CompanyRepositoryPort {
  async saveMany(companies: Company[]) {
    if (companies.length === 0) return;
    db.insert(s.companies).values(companies).run();
  }
  async listByRun(runId: string): Promise<Company[]> {
    return db.select().from(s.companies).where(eq(s.companies.runId, runId)).all() as Company[];
  }
  async listAll(): Promise<Company[]> {
    return db.select().from(s.companies).all() as Company[];
  }
  async get(id: string): Promise<Company | null> {
    return (db.select().from(s.companies).where(eq(s.companies.id, id)).get() as Company) ?? null;
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
    db.insert(s.leads).values(leads.map(toLeadRow)).run();
  }
  async update(lead: Lead) {
    db.update(s.leads).set(toLeadRow(lead)).where(eq(s.leads.id, lead.id)).run();
  }
  async listByRun(runId: string): Promise<Lead[]> {
    return (db.select().from(s.leads).where(eq(s.leads.runId, runId)).all() as any[]).map(fromLeadRow);
  }
  async listAll(): Promise<Lead[]> {
    return (db.select().from(s.leads).all() as any[]).map(fromLeadRow);
  }
  async get(id: string): Promise<Lead | null> {
    const r = db.select().from(s.leads).where(eq(s.leads.id, id)).get() as any;
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
    db.insert(s.signals).values(signals.map(toSignalRow)).run();
  }
  async listByLead(leadId: string): Promise<Signal[]> {
    return (db.select().from(s.signals).where(eq(s.signals.leadId, leadId)).all() as any[]).map(fromSignalRow);
  }
  async listByRun(runId: string): Promise<Signal[]> {
    return (db.select().from(s.signals).where(eq(s.signals.runId, runId)).all() as any[]).map(fromSignalRow);
  }
  async listAll(): Promise<Signal[]> {
    return (db.select().from(s.signals).all() as any[]).map(fromSignalRow);
  }
}

export class DrizzleEmailRepository implements EmailRepositoryPort {
  async saveMany(emails: EmailMessage[]) {
    if (emails.length === 0) return;
    db.insert(s.emails).values(emails).run();
  }
  async listByLead(leadId: string): Promise<EmailMessage[]> {
    return (db.select().from(s.emails).where(eq(s.emails.leadId, leadId)).all() as any[]).map(
      (r) => ({ ...r, status: r.status as EmailStatus }),
    );
  }
  async listByRun(): Promise<EmailMessage[]> {
    return db.select().from(s.emails).all() as EmailMessage[];
  }
  async listAll(): Promise<EmailMessage[]> {
    return db.select().from(s.emails).all() as EmailMessage[];
  }
}

export class DrizzleStepLogRepository implements StepLogRepositoryPort {
  async append(log: StepLog) {
    db.insert(s.stepLogs).values(log).run();
  }
  async listByRun(runId: string): Promise<StepLog[]> {
    return (db.select().from(s.stepLogs).where(eq(s.stepLogs.runId, runId)).all() as any[]).map(
      (r) => ({ ...r, phase: r.phase as RunPhase, level: r.level as LogLevel }),
    );
  }
}

export class DrizzleInteractionRepository implements InteractionRepositoryPort {
  async saveMany(interactions: Interaction[]) {
    if (interactions.length === 0) return;
    db.insert(s.interactions).values(interactions).run();
  }
  async listByLead(leadId: string): Promise<Interaction[]> {
    return (db.select().from(s.interactions).where(eq(s.interactions.leadId, leadId)).all() as any[]).map(
      (r) => ({ ...r, type: r.type as Interaction["type"] }),
    );
  }
}
