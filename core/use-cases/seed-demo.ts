import type { AccountInput } from "../ports/driven";
import type { CreateRun } from "./create-run";
import type { RunPipeline } from "./run-pipeline";

const DEMO_ACCOUNTS: AccountInput[] = [
  { name: "Acme Analytics", domain: "acme.com" },
  { name: "Northwind", domain: "northwind.io" },
  { name: "Globex", domain: "globex.com" },
];

// Populates the dashboard with a realistic demo batch by replaying the real
// pipeline over the configured providers. In a keyless demo env those are the
// mock adapters, so this runs fully offline.
// ponytail: uses whatever providers the container wired — with API keys set it
// would hit the real APIs; that's the operator's env choice.
export class SeedDemo {
  constructor(
    private readonly deps: { createRun: CreateRun; runPipeline: RunPipeline },
  ) {}

  async execute(): Promise<{ runId: string }> {
    const { runId } = await this.deps.createRun.execute(DEMO_ACCOUNTS);
    await this.deps.runPipeline.execute(runId, DEMO_ACCOUNTS);
    return { runId };
  }
}
