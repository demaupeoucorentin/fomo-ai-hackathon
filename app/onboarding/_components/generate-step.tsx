"use client";
import { useEffect, useState } from "react";
import { Loader2, Check, Sparkles, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Fausse génération : on montre 4 tâches Anthropic tourner en séquence pour
// faire patienter l'utilisateur, puis on passe automatiquement à l'étape Leads.
// La donnée (leads + emails) a déjà été produite par le run à l'étape précédente.
const TASKS = [
  "Analyse des signaux détectés",
  "Sélection des angles de comparaison",
  "Rédaction personnalisée par Anthropic",
  "Planification de la cadence (J+0, J+7, J+14)",
];
const STEP_MS = 1100;

export function GenerateStep({ onDone }: { onDone: () => void }) {
  // active = index de la tâche en cours ; TASKS.length = tout est terminé.
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= TASKS.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive((a) => a + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [active, onDone]);

  const progress = Math.round((Math.min(active, TASKS.length) / TASKS.length) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sparkles className="h-6 w-6 text-primary" />
          Génération des séquences…
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Anthropic rédige et planifie une séquence de comparateur pour chaque lead, à
          partir de ton ICP et des signaux détectés.
        </p>
      </div>

      <Progress value={progress} />

      <Card>
        <CardContent className="space-y-1 p-2">
          {TASKS.map((task, i) => {
            const done = i < active;
            const running = i === active;
            return (
              <div
                key={task}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  running && "bg-accent/50",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : running ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
                <span
                  className={cn(
                    done && "text-muted-foreground",
                    running && "font-medium",
                    !done && !running && "text-muted-foreground/60",
                  )}
                >
                  {task}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
