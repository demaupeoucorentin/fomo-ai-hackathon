"use client";
import { useEffect, useRef } from "react";
import { Loader2, CheckCircle2, ArrowRight, Users, Building2, Mail } from "lucide-react";
import { useRunStatus } from "@/lib/query/hooks";
import { PHASE_LABEL } from "@/lib/signal-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<string, string> = {
  success: "text-emerald-600",
  warn: "text-amber-600",
  error: "text-rose-600",
  info: "text-muted-foreground",
};

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function ModeBadges({ mode }: { mode: Record<string, string> | null }) {
  if (!mode) return null;
  const labels: Record<string, string> = { sillage: "Sillage", fullenrich: "FullEnrich", anthropic: "Anthropic" };
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(mode).map(([k, v]) => (
        <span
          key={k}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            v === "live"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-zinc-200 bg-zinc-100 text-zinc-500",
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", v === "live" ? "bg-emerald-500" : "bg-zinc-400")} />
          {labels[k] ?? k} · {v === "live" ? "réel" : "mock"}
        </span>
      ))}
    </div>
  );
}

export function RunningStep({
  runId,
  mode,
  onDone,
}: {
  runId: string;
  mode: Record<string, string> | null;
  onDone: () => void;
}) {
  const { data } = useRunStatus(runId);
  const logRef = useRef<HTMLDivElement>(null);

  const logs = data?.stepLogs ?? [];
  const status = data?.run.status ?? "pending";
  const done = status === "done";

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [logs.length]);

  const phasesDone = new Set(logs.filter((l) => l.level === "success").map((l) => l.phase)).size;
  const progress = done ? 100 : Math.max(8, (phasesDone / 4) * 100);
  const companies = data?.companies.length ?? 0;
  const leads = data?.leads.length ?? 0;
  const contacts = data?.leads.filter((l) => l.email).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {done ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            )}
            {done ? "Détection terminée" : "Détection en cours…"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sillage → FullEnrich → Anthropic, en temps réel.
          </p>
          <div className="mt-3">
            <ModeBadges mode={mode} />
          </div>
        </div>
        {done && (
          <Button size="lg" onClick={onDone}>
            Voir les {leads} leads <ArrowRight />
          </Button>
        )}
      </div>

      <Progress value={progress} />

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Building2} label="Comptes" value={companies} />
        <Stat icon={Users} label="Décideurs" value={leads} />
        <Stat icon={Mail} label="Contacts trouvés" value={contacts} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={logRef} className="max-h-80 overflow-y-auto p-4 font-mono text-xs">
            {logs.length === 0 && <p className="text-muted-foreground">Initialisation…</p>}
            {logs.map((l) => (
              <div key={l.id} className="flex items-baseline gap-2 py-0.5">
                <span className="w-24 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {PHASE_LABEL[l.phase] ?? l.phase}
                </span>
                <span className={cn(LEVEL_COLOR[l.level])}>{l.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
