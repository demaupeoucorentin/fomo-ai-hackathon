import Link from "next/link";
import {
  Layers,
  Users,
  Mail,
  CheckCircle2,
  Sparkles,
  Radio,
  Gauge,
} from "lucide-react";
import { container } from "@/adapters/composition/container";
import { agentMeta } from "@/lib/signal-meta";
import { PageHeader } from "../_components/page-header";

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
        <span
          className="flex size-6 items-center justify-center rounded-lg bg-[var(--accent)]"
          style={{ color: "var(--primary)" }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="font-display mt-2 text-2xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}

/** Quota meter with the hero gradient fill. */
function Meter({
  label,
  used,
  quota,
  unit,
}: {
  label: string;
  used: number;
  quota: number;
  unit?: string;
}) {
  const pct = Math.min(100, Math.round((used / quota) * 100));
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs tabular-nums text-muted-foreground">
          {used.toLocaleString()} / {quota.toLocaleString()}
          {unit ? ` ${unit}` : ""}
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--gradient-hero)" }}
        />
      </div>
      <div className="mt-1.5 text-[11px] text-muted-foreground">
        {pct}% of your monthly allowance used
      </div>
    </div>
  );
}

export default async function DashboardUsage() {
  const stats = await container.getHomeStats.execute();
  const maxSignal = Math.max(1, ...stats.signalsByType.map((s) => s.count));
  const empty = stats.leads === 0;

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader
        title="Usage"
        description="Sillage signals, FullEnrich credits and email volume this cycle."
      />

      {empty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-card py-20 text-center shadow-[var(--shadow-sm)]">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)]"
            style={{ color: "var(--primary)" }}
          >
            <Gauge className="h-5 w-5" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">No usage yet</p>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Load{" "}
              <Link href="/dashboard/settings" className="text-primary underline">
                demo data
              </Link>{" "}
              from Settings, or run an{" "}
              <Link href="/onboarding" className="text-primary underline">
                onboarding
              </Link>{" "}
              to populate your usage.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Sequences" value={stats.sequences} icon={Layers} />
            <Stat label="Leads" value={stats.leads} icon={Users} />
            <Stat
              label="Scheduled emails"
              value={stats.emailsScheduled}
              icon={Mail}
            />
            <Stat label="Sent emails" value={stats.emailsSent} icon={CheckCircle2} />
            <Stat
              label="Contacts found"
              value={stats.contactsFound}
              icon={Sparkles}
            />
          </div>

          {/* Quota meters */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Monthly quotas
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Meter label="Leads processed" used={stats.leads} quota={2000} />
              <Meter
                label="Enrichment credits"
                used={stats.contactsFound}
                quota={2000}
                unit="credits"
              />
              <Meter label="Emails sent" used={stats.emailsSent} quota={5000} />
              <Meter
                label="Signals detected"
                used={stats.signalsByType.reduce((a, s) => a + s.count, 0)}
                quota={1000}
              />
            </div>
          </section>

          {/* Signals by type */}
          {stats.signalsByType.length > 0 && (
            <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Radio className="h-4 w-4" style={{ color: "var(--primary)" }} />{" "}
                Signals by type
              </div>
              <div className="space-y-2.5">
                {stats.signalsByType.map((s) => {
                  const m = agentMeta(s.agentType);
                  return (
                    <div key={s.agentType} className="flex items-center gap-3">
                      <div className="w-32 shrink-0">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] ${m.className}`}
                        >
                          {m.label}
                        </span>
                      </div>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(s.count / maxSignal) * 100}%`,
                            background: "var(--gradient-hero)",
                          }}
                        />
                      </div>
                      <div className="w-6 shrink-0 text-right text-sm tabular-nums">
                        {s.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
