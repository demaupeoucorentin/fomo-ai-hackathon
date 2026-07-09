// Collapse signal records (which each carry a lead) into unique leads with their
// signals attached. Person-level dedup by Sillage lead id, else name+company.
import type { LeadRecord, SignalRecord } from "../ports/driven/dto";

export interface LeadGroup {
  lead: LeadRecord;
  signals: SignalRecord[];
}

const keyOf = (l: LeadRecord): string => {
  const sid = l.sillageLeadId?.trim();
  if (sid) return `id:${sid}`;
  const company = (l.company.domain ?? l.company.name ?? "").toLowerCase();
  return `nc:${l.firstName.toLowerCase()}|${l.lastName.toLowerCase()}|${company}`;
};

export const dedupLeads = (records: SignalRecord[]): LeadGroup[] => {
  const map = new Map<string, LeadGroup>();
  for (const r of records) {
    const k = keyOf(r.lead);
    const g = map.get(k);
    if (g) g.signals.push(r);
    else map.set(k, { lead: r.lead, signals: [r] });
  }
  return [...map.values()];
};

// Most recent signal by signalDate; falls back to the first seen.
export const topSignal = (signals: SignalRecord[]): SignalRecord | null => {
  if (signals.length === 0) return null;
  return [...signals].sort((a, b) => {
    const da = a.signalDate ? Date.parse(a.signalDate) : 0;
    const db = b.signalDate ? Date.parse(b.signalDate) : 0;
    return db - da;
  })[0];
};
