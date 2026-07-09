// Vitest fixture: a `test` that hands each spec a fresh, isolated set of fake
// ports plus a wired RunPipeline. No shared state between tests.
import { test as base } from "vitest";
import { RunPipeline } from "../../use-cases/run-pipeline";
import type { SignalRecord } from "../../ports/driven/dto";
import { makeFakePorts, type FakePorts } from "./in-memory";

interface Ctx {
  seed: SignalRecord[];
  ports: FakePorts;
  runPipeline: RunPipeline;
}

export const test = base.extend<Ctx>({
  // override per-test with test.scoped or by using `test.extend` again; default empty
  seed: [] as SignalRecord[],
  ports: async ({ seed }, use) => {
    await use(makeFakePorts({ signals: seed }));
  },
  runPipeline: async ({ ports }, use) => {
    await use(new RunPipeline(ports));
  },
});

export { expect } from "vitest";
