// Client-safe presentation metadata for signal/agent types.
export const AGENT_META: Record<string, { label: string; className: string }> = {
  competitor_activity: { label: "Competitor", className: "bg-orange-50 text-orange-700 border-orange-200" },
  deep_search: { label: "Growth", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  job_update: { label: "New role", className: "bg-blue-50 text-blue-700 border-blue-200" },
  job_posting: { label: "Hiring", className: "bg-amber-50 text-amber-700 border-amber-200" },
  content_engagement: { label: "Engagement", className: "bg-violet-50 text-violet-700 border-violet-200" },
  influencer_engagement: { label: "Influencer", className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  keyword_detection: { label: "Keyword", className: "bg-sky-50 text-sky-700 border-sky-200" },
  champion_tracking: { label: "Champion", className: "bg-yellow-50 text-yellow-800 border-yellow-200" },
};

export const agentMeta = (t: string) =>
  AGENT_META[t] ?? { label: t, className: "bg-zinc-100 text-zinc-700 border-zinc-200" };

export const PHASE_LABEL: Record<string, string> = {
  accounts: "Accounts",
  signals: "Signals",
  enrich: "Enrichment",
  emails: "Emails",
};
