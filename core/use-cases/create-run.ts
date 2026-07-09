import type { Ports } from "../ports/driven";
import type { AccountInput } from "../ports/driven";

// Creates the run (sequence) record with a generated codename and returns its id
// immediately. The heavy pipeline is launched separately (fire-and-forget).
export class CreateRun {
  constructor(
    private readonly ports: Pick<Ports, "runs" | "id" | "clock" | "sequenceNamer">,
  ) {}

  async execute(accounts: AccountInput[] = []): Promise<{ runId: string }> {
    const runId = this.ports.id.next();
    const companies = accounts
      .map((a) => a.name ?? a.domain ?? "")
      .filter(Boolean);
    let name: string | null = null;
    try {
      name = await this.ports.sequenceNamer.generate({ companies });
    } catch {
      name = null; // naming must never block a run
    }
    await this.ports.runs.create({
      id: runId,
      name,
      status: "pending",
      signalRequestId: null,
      createdAt: this.ports.clock.now().toISOString(),
    });
    return { runId };
  }
}
