"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Users, Building2, Mail, AlertCircle, Circle, Check, Clock } from "lucide-react";
import { useRunStatus } from "@/lib/query/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Plain-language steps (no provider jargon). Mapped to the pipeline's
// technical phases via `key`.
const PHASES = [
  { key: "accounts", label: "Analyzing your accounts" },
  { key: "signals", label: "Detecting buying signals" },
  { key: "enrich", label: "Enriching contacts" },
  { key: "emails", label: "Writing email sequences" },
];

// After this long without the run finishing we stop pretending it's about to
// end: we show a "taking longer than expected" state with an escape hatch so
// the user is never stuck watching a spinner forever. Polling keeps going in
// the background, so if the run does finish we still auto-advance.
const TIMEOUT_MS = 90_000;

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="animate-in rounded-2xl border bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className="flex size-6 items-center justify-center rounded-lg bg-[var(--accent)]"
          style={{ color: "var(--primary)" }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="font-display mt-2 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

export function RunningStep({ runId, onDone }: { runId: string; onDone: () => void }) {
  const { data } = useRunStatus(runId);

  const logs = data?.stepLogs ?? [];
  const status = data?.run.status ?? "pending";
  const done = status === "done";
  const failed = status === "error";
  const errorLog = logs.find((l) => l.level === "error")?.message;
  // Most recent log line = what the pipeline is doing right now ("where it's at").
  const latest = logs.length ? logs[logs.length - 1].message : null;

  // Auto-advance to sequence generation as soon as detection is done
  // (no button). ~900ms so the user sees "done".
  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [status, onDone]);

  // Timeout: flip to the "slow" state if it hasn't finished in time.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (done || failed) return;
    const t = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [done, failed]);
  const slow = timedOut && !done && !failed;

  const donePhases = new Set<string>(logs.filter((l) => l.level === "success").map((l) => l.phase));
  // Current phase = first not-yet-done (while the run is neither finished nor errored).
  const currentIndex = done ? PHASES.length : PHASES.findIndex((p) => !donePhases.has(p.key));
  const progress = done ? 100 : Math.max(10, (donePhases.size / PHASES.length) * 100);

  const companies = data?.companies.length ?? 0;
  const leads = data?.leads.length ?? 0;
  const contacts = data?.leads.filter((l) => l.email).length ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display flex items-center gap-2 text-3xl font-bold tracking-tight">
          {failed ? (
            <AlertCircle className="h-6 w-6 text-rose-600" />
          ) : done ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : slow ? (
            <Clock className="h-6 w-6 text-amber-600" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
          {failed
            ? "Something went wrong"
            : done
              ? "You're all set!"
              : slow
                ? "Still working on it…"
                : "Finding your prospects…"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We analyze your accounts to find the right decision-makers and prepare their emails.
        </p>
        {/* Live activity line — shows exactly where the pipeline is right now. */}
        {!done && !failed && latest && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Loader2 className="h-3 w-3 animate-spin" /> {latest}
          </p>
        )}
      </div>

      <Progress value={progress} />

      {failed && errorLog && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorLog}</span>
        </div>
      )}

      {slow && (
        <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" />
            This is taking longer than usual — it&apos;s still running in the background. You can keep
            waiting or continue with what&apos;s ready.
          </span>
          <Button size="sm" variant="outline" className="shrink-0" onClick={onDone}>
            Continue anyway
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="space-y-1 p-2">
          {PHASES.map((phase, i) => {
            const isDone = done || donePhases.has(phase.key);
            const running = !isDone && !failed && i === currentIndex;
            return (
              <div
                key={phase.key}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  running && "bg-accent/50",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : running ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
                <span
                  className={cn(
                    isDone && "text-muted-foreground",
                    running && "font-medium",
                    !isDone && !running && "text-muted-foreground/60",
                  )}
                >
                  {phase.label}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 [&>*:nth-child(2)]:[--i:1] [&>*:nth-child(3)]:[--i:2]">
        <Stat icon={Building2} label="Accounts" value={companies} />
        <Stat icon={Users} label="Decision-makers" value={leads} />
        <Stat icon={Mail} label="Contacts found" value={contacts} />
      </div>
    </div>
  );
}
