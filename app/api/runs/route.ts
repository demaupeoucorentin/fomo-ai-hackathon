import { container } from "@/adapters/composition/container";
import type { AccountInput } from "@/core/ports/driven";

// POST { accounts } -> create run, launch pipeline in background, return runId.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { accounts?: AccountInput[] };
  const accounts = Array.isArray(body.accounts) ? body.accounts : [];
  const { runId } = await container.createRun.execute();
  // Fire-and-forget: the long-lived dev/start server keeps this promise alive.
  void container.runPipeline
    .execute(runId, accounts)
    .catch((e) => console.error("pipeline failed", e));
  return Response.json({ runId, mode: container.mode });
}
