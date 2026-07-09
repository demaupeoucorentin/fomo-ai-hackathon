// Lightweight value-object helpers. ponytail: validators, not wrapper classes —
// enough to guard trust boundaries without ceremony.
import { ValidationError } from "./errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (v: string): boolean => EMAIL_RE.test(v);

export const normalizeDomain = (input: string): string => {
  const s = input.trim().toLowerCase();
  if (!s) throw new ValidationError("empty domain");
  // strip protocol, path, leading www.
  return s
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
};

export const logoFromDomain = (domain: string | null): string | null =>
  domain ? `https://logo.clearbit.com/${normalizeDomain(domain)}` : null;

// Days offset from run date for a scheduled email in a sequence.
export type CadenceDay = number;

export const cadenceToDate = (from: Date, days: CadenceDay): string => {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
};
