// Minimal CSV -> account list parser (client-safe, no dependency).
// Recognizes name / domain|website / linkedin columns; falls back to positional.
import type { AccountInput } from "@/core/ports/driven";

function splitLine(line: string): string[] {
  return line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
}

const toDomain = (v: string) =>
  v.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || undefined;

export function parseAccountsCsv(text: string): AccountInput[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const looksLikeHeader = header.some((h) =>
    /name|domain|website|site|linkedin|company|entreprise/.test(h),
  );
  const idx = (keys: string[]) => header.findIndex((h) => keys.some((k) => h.includes(k)));
  const iName = idx(["name", "company", "entreprise", "nom"]);
  const iDomain = idx(["domain", "website", "site", "url"]);
  const iLinkedin = idx(["linkedin"]);

  const rows = looksLikeHeader ? lines.slice(1) : lines;
  const out: AccountInput[] = [];
  for (const line of rows) {
    const cols = splitLine(line);
    if (looksLikeHeader) {
      const domainRaw = iDomain >= 0 ? cols[iDomain] : "";
      out.push({
        name: iName >= 0 ? cols[iName] : undefined,
        domain: domainRaw ? toDomain(domainRaw) : undefined,
        linkedinUrl: iLinkedin >= 0 ? cols[iLinkedin] || undefined : undefined,
      });
    } else {
      // positional: name, domain, linkedin
      out.push({
        name: cols[0] || undefined,
        domain: cols[1] ? toDomain(cols[1]) : undefined,
        linkedinUrl: cols[2] || undefined,
      });
    }
  }
  return out.filter((a) => a.name || a.domain || a.linkedinUrl);
}
