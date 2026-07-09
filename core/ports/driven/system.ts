// System ports — injected so use-cases stay deterministic under test.
export interface ClockPort {
  now(): Date;
}

export interface IdPort {
  next(): string;
}
