import type { Ports } from "../ports/driven";

// Creates the run record and returns its id immediately. The heavy pipeline is
// launched separately (fire-and-forget) so the client can start polling.
export class CreateRun {
  constructor(private readonly ports: Pick<Ports, "runs" | "id" | "clock">) {}

  async execute(): Promise<{ runId: string }> {
    const runId = this.ports.id.next();
    await this.ports.runs.create({
      id: runId,
      status: "pending",
      signalRequestId: null,
      createdAt: this.ports.clock.now().toISOString(),
    });
    return { runId };
  }
}
