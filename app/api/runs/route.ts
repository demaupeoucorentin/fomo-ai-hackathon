import { after } from "next/server";
import { container } from "@/adapters/composition/container";
import type { AccountInput } from "@/core/ports/driven";

// Give the background pipeline room to finish after the response is sent.
// Bump if live-API runs need longer (Vercel Pro/Fluid allows up to 300).
export const maxDuration = 60;

// POST { accounts } -> create run, launch pipeline after the response, return runId.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { accounts?: AccountInput[] };
  const accounts = Array.isArray(body.accounts) ? body.accounts : [];
  const { runId } = await container.createRun.execute(accounts);
  // `after` keeps the work alive past the response on serverless (Vercel freezes
  // the function otherwise). Locally it runs the same as a fire-and-forget.
  after(async () => {
    try {
      await container.runPipeline.execute(runId, accounts);
    } catch (e) {
      console.error("pipeline failed", e);
    }
  });
  return Response.json({ runId, mode: container.mode });
}
