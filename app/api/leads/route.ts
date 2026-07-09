import { container } from "@/adapters/composition/container";
import { errorResponse } from "@/lib/api-error";

export async function GET(req: Request) {
  const runId = new URL(req.url).searchParams.get("runId");
  if (!runId)
    return Response.json({ error: { code: "validation", message: "runId requis" } }, { status: 400 });
  try {
    return Response.json({ leads: await container.getLeads.execute(runId) });
  } catch (e) {
    return errorResponse(e);
  }
}
