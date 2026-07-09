import { container } from "@/adapters/composition/container";
import { NotFoundError } from "@/core/domain/errors";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const view = await container.getLeadDetail.execute(id);
    return Response.json(view);
  } catch (e) {
    if (e instanceof NotFoundError) return Response.json({ error: "not found" }, { status: 404 });
    throw e;
  }
}
