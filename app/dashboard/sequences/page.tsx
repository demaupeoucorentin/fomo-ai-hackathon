import { Users, Building2, Sparkles, Layers } from "lucide-react";
import { container } from "@/adapters/composition/container";
import { PageHeader } from "../_components/page-header";
import { EmptyState } from "../_components/wip";

export const dynamic = "force-dynamic";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-zinc-100 text-zinc-600 border-zinc-200",
  error: "bg-rose-50 text-rose-700 border-rose-200",
};

export default async function SequencesPage() {
  const sequences = await container.getSequences.execute();

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Sequences"
        description="Each onboarding creates a sequence. Newest to oldest."
      />

      {sequences.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No sequences yet"
          description="Run an onboarding to detect leads and generate an email sequence."
          action={{ label: "Start detection", href: "/onboarding" }}
        />
      ) : (
        <div className="space-y-3">
          {sequences.map(({ run, companies, leadCount }, idx) => (
            <div
              key={run.id}
              style={{ "--i": idx } as React.CSSProperties}
              className="animate-in rounded-xl border bg-card p-4 shadow-[var(--shadow-sm)]"
            >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">{run.name ?? "Untitled sequence"}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS[run.status] ?? STATUS.pending}`}
                  >
                    {run.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{fmt(run.createdAt)}</div>
              </div>
              <div className="flex shrink-0 gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" /> {companies.length}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {leadCount}
                </span>
              </div>
            </div>

            {companies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {companies.slice(0, 8).map((c) => (
                  <span
                    key={c.id}
                    className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                  >
                    {c.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.logoUrl} alt="" className="h-3.5 w-3.5 rounded" />
                    )}
                    {c.name}
                    {c.domain && <span className="text-muted-foreground">· {c.domain}</span>}
                  </span>
                ))}
                {companies.length > 8 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    +{companies.length - 8}
                  </span>
                )}
              </div>
            )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
