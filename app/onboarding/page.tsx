"use client";
import { useState } from "react";
import { Check, Zap } from "lucide-react";
import type { AccountInput } from "@/core/ports/driven";
import { useStartRun } from "@/lib/query/hooks";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { IcpStep } from "./_components/icp-step";
import { ImportStep } from "./_components/import-step";
import { RunningStep } from "./_components/running-step";
import { GenerateStep } from "./_components/generate-step";
import { LeadsStep } from "./_components/leads-step";

type Step = "icp" | "import" | "run" | "generate" | "leads";
const STEPS: { key: Step; label: string }[] = [
  { key: "icp", label: "ICP" },
  { key: "import", label: "Import" },
  { key: "run", label: "Detection" },
  { key: "generate", label: "Sequences" },
  { key: "leads", label: "Leads" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("icp");
  const [runId, setRunId] = useState<string | null>(null);
  const startRun = useStartRun();

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const launch = (accounts: AccountInput[]) => {
    startRun.mutate(accounts, {
      onSuccess: ({ runId }) => {
        setRunId(runId);
        setStep("run");
      },
    });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <header className="mb-12">
        <div className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-primary-foreground shadow-[var(--shadow-sm)]"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Zap className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">{BRAND}</span>
        </div>
        <nav className="mt-7 flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  i < stepIndex && "border-primary/25 bg-accent text-accent-foreground",
                  i === stepIndex &&
                    "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-sm)]",
                  i > stepIndex && "border-border text-muted-foreground",
                )}
              >
                {i < stepIndex ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="tabular-nums">{i + 1}</span>
                )}
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 rounded-full transition-colors",
                    i < stepIndex ? "bg-primary/40" : "bg-border",
                  )}
                />
              )}
            </div>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        {step === "icp" && <IcpStep onNext={() => setStep("import")} />}
        {step === "import" && (
          <ImportStep onSubmit={launch} pending={startRun.isPending} />
        )}
        {step === "run" && runId && (
          <RunningStep runId={runId} onDone={() => setStep("generate")} />
        )}
        {step === "generate" && <GenerateStep onDone={() => setStep("leads")} />}
        {step === "leads" && runId && <LeadsStep runId={runId} />}
      </main>
    </div>
  );
}
