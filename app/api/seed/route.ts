import { container } from "@/adapters/composition/container";
import { errorResponse } from "@/lib/api-error";

// POST -> seed one demo batch (replays the pipeline over configured providers,
// i.e. the mock adapters in a keyless demo env). Returns the created runId.
export async function POST() {
  try {
    const r = await container.seedDemo.execute();
    return Response.json(r);
  } catch (e) {
    return errorResponse(e);
  }
}
