// Client-safe presentation metadata for signal/agent types.
export const AGENT_META: Record<string, { label: string; className: string }> = {
  competitor_activity: { label: "Concurrent", className: "bg-rose-50 text-rose-700 border-rose-200" },
  deep_search: { label: "Croissance", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  job_update: { label: "Nouveau poste", className: "bg-blue-50 text-blue-700 border-blue-200" },
  job_posting: { label: "Recrutement", className: "bg-amber-50 text-amber-700 border-amber-200" },
  content_engagement: { label: "Engagement", className: "bg-violet-50 text-violet-700 border-violet-200" },
  influencer_engagement: { label: "Influenceur", className: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  keyword_detection: { label: "Mot-clé", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  champion_tracking: { label: "Champion", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export const agentMeta = (t: string) =>
  AGENT_META[t] ?? { label: t, className: "bg-zinc-100 text-zinc-700 border-zinc-200" };

export const PHASE_LABEL: Record<string, string> = {
  accounts: "Comptes",
  signals: "Signaux",
  enrich: "Enrichissement",
  emails: "Emails",
};
