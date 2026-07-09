// Typed domain errors — lets callers/routes map to HTTP without string-matching.

export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`, "not_found");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, "validation");
    this.name = "ValidationError";
  }
}

// An upstream provider (Sillage / FullEnrich / Anthropic) returned an error.
// Carries enough to understand AND display what went wrong.
export class ProviderError extends DomainError {
  constructor(
    readonly provider: "sillage" | "fullenrich" | "anthropic",
    readonly status: number,
    message: string,
    readonly detail?: unknown,
  ) {
    super(message, "provider_error");
    this.name = "ProviderError";
  }
}

