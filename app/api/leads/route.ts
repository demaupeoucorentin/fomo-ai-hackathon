import { container } from "@/adapters/composition/container";

export async function GET(req: Request) {
  const runId = new URL(req.url).searchParams.get("runId");
  if (!runId) return Response.json({ error: "runId required" }, { status: 400 });
  const leads = await container.getLeads.execute(runId);
  return Response.json({ leads });
}
