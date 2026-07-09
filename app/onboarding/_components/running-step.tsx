"use client";
import { useEffect } from "react";
import { Loader2, CheckCircle2, Users, Building2, Mail, AlertCircle, Circle, Check } from "lucide-react";
import { useRunStatus } from "@/lib/query/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Étapes en langage clair (aucun jargon fournisseur). Mappées sur les phases
// techniques du pipeline via `key`.
const PHASES = [
  { key: "accounts", label: "Analyse de tes comptes" },
  { key: "signals", label: "Détection des signaux d'achat" },
  { key: "enrich", label: "Enrichissement des contacts" },
  { key: "emails", label: "Rédaction des séquences d'emails" },
];

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="animate-in rounded-lg border bg-card p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
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

  // Auto-avance vers la génération des séquences dès que la détection est finie
  // (pas de bouton). ~900ms pour que l'utilisateur voie "terminée".
  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [status, onDone]);

  const donePhases = new Set<string>(logs.filter((l) => l.level === "success").map((l) => l.phase));
  // Phase en cours = première non terminée (tant que le run n'est ni fini ni en erreur).
  const currentIndex = done ? PHASES.length : PHASES.findIndex((p) => !donePhases.has(p.key));
  const progress = done ? 100 : Math.max(10, (donePhases.size / PHASES.length) * 100);

  const companies = data?.companies.length ?? 0;
  const leads = data?.leads.length ?? 0;
  const contacts = data?.leads.filter((l) => l.email).length ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          {failed ? (
            <AlertCircle className="h-6 w-6 text-rose-600" />
          ) : done ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
          {failed ? "Un souci est survenu" : done ? "C'est prêt !" : "On cherche tes prospects…"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          On analyse tes comptes pour trouver les bons décideurs et préparer leurs emails.
        </p>
      </div>

      <Progress value={progress} />

      {failed && errorLog && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorLog}</span>
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
        <Stat icon={Building2} label="Comptes" value={companies} />
        <Stat icon={Users} label="Décideurs" value={leads} />
        <Stat icon={Mail} label="Contacts trouvés" value={contacts} />
      </div>
    </div>
  );
}
