"use client";
import { useEffect, useState } from "react";
import { Loader2, Check, Sparkles, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Fake generation: we show 4 Anthropic tasks running in sequence to keep
// the user engaged, then automatically move to the Leads step.
// The data (leads + emails) was already produced by the run in the previous step.
const TASKS = [
  "Analyzing detected signals",
  "Selecting comparison angles",
  "Personalized writing by Anthropic",
  "Scheduling the cadence (Day 0, Day 7, Day 14)",
];
const STEP_MS = 1100;

export function GenerateStep({ onDone }: { onDone: () => void }) {
  // active = index of the current task; TASKS.length = everything is done.
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
          Generating sequences…
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Anthropic writes and schedules a comparator sequence for each lead, based on
          your ICP and the detected signals.
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
