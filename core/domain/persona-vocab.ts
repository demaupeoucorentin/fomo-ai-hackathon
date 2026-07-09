// Sillage persona enum vocabulary + normalizers. The Persona entity's seniority
// and headcount fields must be one of these exact values, so we constrain
// generation (Anthropic tool schema) AND coerce/filter before persisting
// (guards against free-text edits in the UI).
import type { Persona } from "./entities";

export const SENIORITY = [
  "owner",
  "founder",
  "c_suite",
  "partner",
  "vp",
  "head",
  "director",
  "manager",
  "senior",
  "entry",
  "intern",
] as const;

export const HEADCOUNT = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1,000",
  "1,001-5,000",
  "5,001-10,000",
  "10,001+",
] as const;

const SENIORITY_SET = new Set<string>(SENIORITY);

const SENIORITY_ALIASES: Record<string, string> = {
  "c-level": "c_suite",
  "c level": "c_suite",
  clevel: "c_suite",
  csuite: "c_suite",
  "c-suite": "c_suite",
  cxo: "c_suite",
  chief: "c_suite",
  ceo: "c_suite",
  cto: "c_suite",
  cio: "c_suite",
  ciso: "c_suite",
  cfo: "c_suite",
  "vice president": "vp",
  "vice-president": "vp",
  "v.p.": "vp",
};

export const normalizeSeniority = (values: string[]): string[] => {
  const out = new Set<string>();
  for (const raw of values) {
    const k = raw.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
    const canonical = SENIORITY_ALIASES[k] ?? k.replace(/\s+/g, "_");
    if (SENIORITY_SET.has(canonical)) out.add(canonical);
  }
  return [...out];
};

// Match on digits only so "501-1000", "501-1,000", "501 - 1,000" all resolve.
const HEADCOUNT_BY_DIGITS = new Map(
  HEADCOUNT.map((h) => [h.replace(/[^\d+-]/g, ""), h]),
);

export const normalizeHeadcount = (values: string[]): string[] => {
  const out = new Set<string>();
  for (const raw of values) {
    const stripped = raw.replace(/[^\d+-]/g, "");
    const match = HEADCOUNT_BY_DIGITS.get(stripped);
    if (match) out.add(match);
  }
  return [...out];
};

// Coerce a persona to Sillage-valid enums before persisting. Unknown values are
// dropped rather than sent (a rejected value would 400 the whole request).
export const normalizePersona = (p: Persona): Persona => ({
  ...p,
  seniority: normalizeSeniority(p.seniority),
  headcount: normalizeHeadcount(p.headcount),
});
