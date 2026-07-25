import Link from "next/link";
import { Users, Mail, CheckCircle2, Layers, Radio } from "lucide-react";
import { container } from "@/adapters/composition/container";
import { agentMeta } from "@/lib/signal-meta";
import { PageHeader } from "./_components/page-header";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex size-6 items-center justify-center rounded-lg bg-[var(--accent)]" style={{ color: "var(--primary)" }}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="font-display mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export default async function HomePage() {
  const stats = await container.getHomeStats.execute();
  const maxSignal = Math.max(1, ...stats.signalsByType.map((s) => s.count));
  const empty = stats.leads === 0;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Home"
        description="Overview of your sequences and their email funnel."
      />

      {empty ? (
        <div className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground shadow-[var(--shadow-sm)]">
          Nothing to show yet. Load{" "}
          <Link href="/dashboard/settings" className="text-primary underline">
            demo data
          </Link>{" "}
          from Settings, or run an{" "}
          <Link href="/onboarding" className="text-primary underline">
            onboarding
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Sequences" value={stats.sequences} icon={Layers} />
            <Stat label="Leads" value={stats.leads} icon={Users} />
            <Stat label="Scheduled emails" value={stats.emailsScheduled} icon={Mail} />
            <Stat label="Sent emails" value={stats.emailsSent} icon={CheckCircle2} />
            <Stat label="Contacts found" value={stats.contactsFound} icon={CheckCircle2} />
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Radio className="h-4 w-4" style={{ color: "var(--primary)" }} /> Signals by type
            </div>
            <div className="space-y-2.5">
              {stats.signalsByType.map((s) => {
                const m = agentMeta(s.agentType);
                return (
                  <div key={s.agentType} className="flex items-center gap-3">
                    <div className="w-32 shrink-0">
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${m.className}`}>
                        {m.label}
                      </span>
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(s.count / maxSignal) * 100}%`, background: "var(--gradient-hero)" }}
                      />
                    </div>
                    <div className="w-6 shrink-0 text-right text-sm tabular-nums">{s.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
