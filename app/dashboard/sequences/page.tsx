import {
  Users,
  Building2,
  Sparkles,
  Layers,
  Mail,
  Mailbox,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { container } from "@/adapters/composition/container";
import { PageHeader } from "../_components/page-header";
import { EmptyState } from "../_components/wip";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type StatusMeta = {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STATUS: Record<string, StatusMeta> = {
  done: {
    label: "Done",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  running: {
    label: "Running",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Loader2,
  },
  pending: {
    label: "Pending",
    className: "border-zinc-200 bg-zinc-100 text-zinc-600",
    icon: Clock,
  },
  error: {
    label: "Error",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
};

const CHANNELS = [
  { label: "Email", hue: "var(--email-dot)" },
  { label: "LinkedIn", hue: "var(--linkedin-dot)" },
  { label: "Postal", hue: "var(--postal-dot)" },
] as const;

function LinkedinGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.4 4.75 5.5V21H19v-5.3c0-1.26-.02-2.9-1.9-2.9-1.9 0-2.2 1.4-2.2 2.8V21H9z" />
    </svg>
  );
}

export default async function SequencesPage() {
  const sequences = await container.getSequences.execute();

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Sequences"
        description="Every onboarding spins up a multi-channel sequence. Newest first."
        actions={
          <Button asChild size="sm">
            <Link href="/onboarding">New detection</Link>
          </Button>
        }
      />

      {sequences.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No sequences yet"
          description="Run an onboarding to detect leads and generate a coordinated email, LinkedIn and postal sequence."
          action={{ label: "Start detection", href: "/onboarding" }}
        />
      ) : (
        <div className="space-y-4">
          {sequences.map(({ run, companies, leadCount }, idx) => {
            const status = STATUS[run.status] ?? STATUS.pending;
            const StatusIcon = status.icon;
            return (
              <div
                key={run.id}
                style={{ "--i": idx } as React.CSSProperties}
                className="animate-in group rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="flex size-7 items-center justify-center rounded-lg bg-[var(--accent)]"
                        style={{ color: "var(--primary)" }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="font-display text-base font-semibold tracking-tight">
                        {run.name ?? "Untitled sequence"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}
                      >
                        <StatusIcon className="h-3 w-3" /> {status.label}
                      </span>
                    </div>
                    <div className="mt-1.5 pl-9 font-mono text-xs text-muted-foreground">
                      {fmt(run.createdAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-[var(--shadow-sm)]">
                      <Building2 className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                      <span className="font-medium text-foreground tabular-nums">
                        {companies.length}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-[var(--shadow-sm)]">
                      <Users className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                      <span className="font-medium text-foreground tabular-nums">{leadCount}</span>
                    </span>
                  </div>
                </div>

                {/* Multi-channel signature */}
                <div className="mt-4 flex items-center gap-3 border-t pt-3">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Channels
                  </span>
                  <div className="flex items-center gap-1.5">
                    {CHANNELS.map((c) => (
                      <span
                        key={c.label}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          borderColor: `color-mix(in srgb, ${c.hue} 40%, transparent)`,
                          background: `color-mix(in srgb, ${c.hue} 8%, transparent)`,
                          color: c.hue,
                        }}
                      >
                        {c.label === "Email" ? (
                          <Mail className="h-3 w-3" />
                        ) : c.label === "LinkedIn" ? (
                          <LinkedinGlyph className="h-3 w-3" />
                        ) : (
                          <Mailbox className="h-3 w-3" />
                        )}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>

                {companies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {companies.slice(0, 8).map((c) => (
                      <span
                        key={c.id}
                        className="flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs"
                      >
                        {c.logoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.logoUrl} alt="" className="h-4 w-4 rounded" />
                        )}
                        <span className="font-medium">{c.name}</span>
                        {c.domain && <span className="text-muted-foreground">· {c.domain}</span>}
                      </span>
                    ))}
                    {companies.length > 8 && (
                      <span className="flex items-center px-2 py-1 text-xs text-muted-foreground">
                        +{companies.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
