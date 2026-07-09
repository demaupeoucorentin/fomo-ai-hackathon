import { container } from "@/adapters/composition/container";
import { errorResponse } from "@/lib/api-error";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    return Response.json(await container.getLeadDetail.execute(id));
  } catch (e) {
    return errorResponse(e);
  }
}
