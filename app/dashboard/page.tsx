import Link from "next/link";
import { Users, Mail, CheckCircle2, Layers, Radio } from "lucide-react";
import { container } from "@/adapters/composition/container";
import { agentMeta } from "@/lib/signal-meta";

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
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default async function HomePage() {
  const stats = await container.getHomeStats.execute();
  const maxSignal = Math.max(1, ...stats.signalsByType.map((s) => s.count));
  const empty = stats.leads === 0;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Home</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d&apos;ensemble de tes séquences et de leur funnel d&apos;emails.
        </p>
      </div>

      {empty ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Rien à afficher. Charge des{" "}
          <Link href="/dashboard/settings" className="text-primary underline">
            données de démo
          </Link>{" "}
          depuis les Settings, ou lance un{" "}
          <Link href="/onboarding" className="text-primary underline">
            onboarding
          </Link>
          .
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Stat label="Séquences" value={stats.sequences} icon={Layers} />
            <Stat label="Leads" value={stats.leads} icon={Users} />
            <Stat label="Emails planifiés" value={stats.emailsScheduled} icon={Mail} />
            <Stat label="Emails envoyés" value={stats.emailsSent} icon={CheckCircle2} />
            <Stat label="Contacts trouvés" value={stats.contactsFound} icon={CheckCircle2} />
          </div>

          <div className="rounded-xl border p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Radio className="h-4 w-4 text-primary" /> Signaux par type
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
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${(s.count / maxSignal) * 100}%` }}
                      />
                    </div>
                    <div className="w-6 shrink-0 text-right text-sm tabular-nums">{s.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
