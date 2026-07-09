// Maps thrown errors to structured HTTP responses so the client always gets a
// readable reason instead of an opaque 500.
import { NotFoundError, ProviderError, ValidationError } from "@/core/domain/errors";

export function errorResponse(e: unknown): Response {
  if (e instanceof NotFoundError) {
    return Response.json({ error: { code: "not_found", message: e.message } }, { status: 404 });
  }
  if (e instanceof ValidationError) {
    return Response.json({ error: { code: "validation", message: e.message } }, { status: 400 });
  }
  if (e instanceof ProviderError) {
    // Surface upstream client errors (400/401/403/422) as-is; server-side as 502.
    const status = e.status >= 400 && e.status < 500 ? e.status : 502;
    return Response.json(
      { error: { code: "provider_error", provider: e.provider, upstreamStatus: e.status, message: e.message, detail: e.detail } },
      { status },
    );
  }
  const message = e instanceof Error ? e.message : "Internal error";
  console.error("Unhandled route error:", e);
  return Response.json({ error: { code: "internal", message } }, { status: 500 });
}
