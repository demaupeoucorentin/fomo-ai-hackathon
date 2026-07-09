"use client";
import { useState } from "react";
import { Radio, Mail, CheckCircle2, Clock } from "lucide-react";
import type { LeadDetailView } from "@/core/use-cases/dto";
import { agentMeta } from "@/lib/signal-meta";
import { cn } from "@/lib/utils";

// Friendly labels for the email angle (mirrors core/services/templates.ts).
const TEMPLATE_LABEL: Record<string, string> = {
  competitor_comparison: "Comparateur concurrent",
  growth_signal: "Signal de croissance",
  new_role: "Nouveau poste",
  hiring: "Recrutement",
  follow_up: "Relance",
  breakup: "Dernière relance",
};
const templateLabel = (k: string) => TEMPLATE_LABEL[k] ?? k;

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

type Item =
  | { kind: "signal"; id: string; date: string; agentType: string; signalType: string }
  | {
      kind: "email";
      id: string;
      date: string;
      subject: string;
      body: string;
      templateKey: string;
      status: string;
    };

// Merged signal + email timeline, newest first (retro-planning at the top,
// past sends at the bottom). This is the causal chain: signal -> email -> date.
export function LeadTimeline({ data }: { data: LeadDetailView }) {
  const [openEmail, setOpenEmail] = useState<string | null>(null);

  const items: Item[] = [
    ...data.signals.map((s) => ({
      kind: "signal" as const,
      id: s.id,
      date: s.signalDate ?? "",
      agentType: s.agentType,
      signalType: s.signalType,
    })),
    ...data.emails.map((e) => ({
      kind: "email" as const,
      id: e.id,
      date: e.sendDate,
      subject: e.subject,
      body: e.body,
      templateKey: e.templateKey,
      status: e.status,
    })),
  ]
    .filter((i) => i.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (items.length === 0)
    return <p className="text-sm text-muted-foreground">Aucune activité pour ce lead.</p>;

  return (
    <ol className="relative ml-2 border-l pl-6">
      {items.map((it) => (
        <li key={`${it.kind}-${it.id}`} className="mb-6 last:mb-0">
          <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border bg-background">
            {it.kind === "signal" ? (
              <Radio className="h-2.5 w-2.5 text-primary" />
            ) : (
              <Mail className="h-2.5 w-2.5 text-muted-foreground" />
            )}
          </span>

          <div className="text-xs text-muted-foreground">{fmt(it.date)}</div>

          {it.kind === "signal" ? (
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px]",
                  agentMeta(it.agentType).className,
                )}
              >
                {agentMeta(it.agentType).label}
              </span>
              <span className="text-sm text-muted-foreground">Signal détecté ({it.signalType})</span>
            </div>
          ) : (
            <div className="mt-1">
              <button
                onClick={() => setOpenEmail(openEmail === it.id ? null : it.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-accent/40",
                  openEmail === it.id && "ring-2 ring-primary",
                )}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{it.subject}</div>
                  <div className="text-xs text-muted-foreground">{templateLabel(it.templateKey)}</div>
                </div>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                    it.status === "sent"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-blue-200 bg-blue-50 text-blue-700",
                  )}
                >
                  {it.status === "sent" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Envoyé
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" /> Planifié
                    </>
                  )}
                </span>
              </button>

              {openEmail === it.id && (
                <div className="mt-2 rounded-lg border bg-muted/20 p-4">
                  <div className="font-medium">{it.subject}</div>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {it.body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
