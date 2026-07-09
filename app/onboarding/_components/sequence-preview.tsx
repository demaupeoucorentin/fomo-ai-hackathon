"use client";
import type { ReactNode } from "react";
import { Mail, Users, Clock, Send } from "lucide-react";
import type { LeadListItem } from "@/core/use-cases/dto";

// LemList-style : visualise la séquence de comparateur (3 touches déterministes,
// cf. core/services/sequencing.ts). L'étape 1 est déclinée en variantes d'angle
// dérivées des signaux réellement détectés sur chaque lead.
const ANGLE_BY_SIGNAL: Record<string, string> = {
  competitor_activity: "Comparateur concurrent",
  content_engagement: "Comparateur concurrent",
  influencer_engagement: "Comparateur concurrent",
  deep_search: "Signal de croissance",
  job_update: "Nouveau poste",
  champion_tracking: "Nouveau poste",
  job_posting: "Recrutement",
  keyword_detection: "Recrutement",
};
// Ordre de priorité (identique à ANGLE_TEMPLATES dans templates.ts).
const ANGLE_PRIORITY = [
  "Comparateur concurrent",
  "Signal de croissance",
  "Nouveau poste",
  "Recrutement",
];
const VARIANT_LETTERS = ["A", "B", "C", "D"];

const pickAngle = (agentTypes: string[]): string => {
  const angles = new Set(agentTypes.map((t) => ANGLE_BY_SIGNAL[t]).filter(Boolean));
  return ANGLE_PRIORITY.find((a) => angles.has(a)) ?? "Comparateur concurrent";
};

export function SequencePreview({ leads }: { leads: LeadListItem[] }) {
  const reachable = leads.filter((l) => l.lead.email);
  const audience = reachable.length;

  const counts = new Map<string, number>();
  for (const l of reachable) {
    const a = pickAngle(l.agentTypes);
    counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  const variants = ANGLE_PRIORITY.filter((a) => counts.has(a)).map((a) => ({
    angle: a,
    count: counts.get(a)!,
  }));

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-semibold tracking-tight">Séquence d&apos;emails</h2>
        <p className="text-xs text-muted-foreground">
          3 touches · {audience} destinataire{audience > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Send className="h-3.5 w-3.5" /> Expéditeur
        </span>
        <span className="font-medium">Programmation par défaut</span>
      </div>

      <div className="relative space-y-4 border-l pl-5">
        <Step delay="Envoyer immédiatement" channel="Email" audience={audience}>
          {variants.map((v, i) => (
            <VariantRow
              key={v.angle}
              letter={VARIANT_LETTERS[i] ?? "•"}
              label={v.angle}
              count={v.count}
              total={audience}
            />
          ))}
        </Step>
        <Step delay="Délai de 7 jours" channel="Email · Relance" audience={audience} scheduled />
        <Step
          delay="Délai de 7 jours"
          channel="Email · Dernière relance"
          audience={audience}
          scheduled
        />
      </div>
    </div>
  );
}

function Step({
  delay,
  channel,
  audience,
  scheduled,
  children,
}: {
  delay: string;
  channel: string;
  audience: number;
  scheduled?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute -left-[26px] top-2.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        {delay}
        {scheduled && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-normal">
            planifié
          </span>
        )}
      </div>
      <div className="rounded-xl border bg-card p-3 shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <Mail className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{channel}</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {audience}
          </span>
        </div>
        {children && <div className="mt-2.5 space-y-1.5">{children}</div>}
      </div>
    </div>
  );
}

function VariantRow({
  letter,
  label,
  count,
  total,
}: {
  letter: string;
  label: string;
  count: number;
  total: number;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-semibold text-muted-foreground">
        {letter}
      </span>
      <span className="w-32 shrink-0 truncate text-xs">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary/60" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}
