import { container } from "@/adapters/composition/container";
import { errorResponse } from "@/lib/api-error";

export async function GET() {
  try {
    return Response.json({ sequences: await container.getSequences.execute() });
  } catch (e) {
    return errorResponse(e);
  }
}
