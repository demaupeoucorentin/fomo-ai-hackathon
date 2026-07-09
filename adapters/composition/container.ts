// Composition root — the ONLY place adapters meet ports. Server-only
// (imports better-sqlite3). API routes import this; UI never does.
import "server-only";
import type { Ports } from "../../core/ports/driven";
import { CreateRun } from "../../core/use-cases/create-run";
import { GenerateIcp, SavePersona } from "../../core/use-cases/generate-icp";
import {
  GetLeadDetail,
  GetLeads,
  GetRunStatus,
  GetSequences,
} from "../../core/use-cases/queries";
import { RunPipeline } from "../../core/use-cases/run-pipeline";

import {
  DrizzleCompanyRepository,
  DrizzleEmailRepository,
  DrizzleInteractionRepository,
  DrizzleLeadRepository,
  DrizzleRunRepository,
  DrizzleSignalRepository,
  DrizzleStepLogRepository,
} from "../driven/persistence/repositories";
import {
  AnthropicEmailGenerator,
  AnthropicIcpGenerator,
  AnthropicSequenceNamer,
} from "../driven/anthropic/anthropic";
import { FullEnrichContactEnricher } from "../driven/fullenrich/fullenrich";
import { SillagePersonaStore, SillageSignalProvider } from "../driven/sillage/sillage";
import {
  MockContactEnricher,
  MockEmailGenerator,
  MockIcpGenerator,
  MockPersonaStore,
  MockSequenceNamer,
  MockSignalProvider,
} from "../driven/mock/mocks";

const hasSillage = !!(process.env.SILLAGE_API_BASE && process.env.SILLAGE_API_KEY);
const hasFullEnrich = !!process.env.FULLENRICH_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

function buildPorts(): Ports {
  return {
    signalProvider: hasSillage ? new SillageSignalProvider() : new MockSignalProvider(),
    personaStore: hasSillage ? new SillagePersonaStore() : new MockPersonaStore(),
    icpGenerator: hasAnthropic ? new AnthropicIcpGenerator() : new MockIcpGenerator(),
    contactEnricher: hasFullEnrich ? new FullEnrichContactEnricher() : new MockContactEnricher(),
    emailGenerator: hasAnthropic ? new AnthropicEmailGenerator() : new MockEmailGenerator(),
    sequenceNamer: hasAnthropic ? new AnthropicSequenceNamer() : new MockSequenceNamer(),
    runs: new DrizzleRunRepository(),
    companies: new DrizzleCompanyRepository(),
    leads: new DrizzleLeadRepository(),
    signals: new DrizzleSignalRepository(),
    emails: new DrizzleEmailRepository(),
    stepLogs: new DrizzleStepLogRepository(),
    interactions: new DrizzleInteractionRepository(),
    clock: { now: () => new Date() },
    id: { next: () => crypto.randomUUID() },
  };
}

function buildContainer() {
  const ports = buildPorts();
  return {
    ports,
    mode: {
      sillage: hasSillage ? "live" : "mock",
      fullenrich: hasFullEnrich ? "live" : "mock",
      anthropic: hasAnthropic ? "live" : "mock",
    } as const,
    generateIcp: new GenerateIcp(ports),
    savePersona: new SavePersona(ports),
    createRun: new CreateRun(ports),
    runPipeline: new RunPipeline(ports),
    getRunStatus: new GetRunStatus(ports),
    getLeads: new GetLeads(ports),
    getLeadDetail: new GetLeadDetail(ports),
    getSequences: new GetSequences(ports),
  };
}

const g = globalThis as unknown as { __container?: ReturnType<typeof buildContainer> };
export const container = g.__container ?? (g.__container = buildContainer());
