"use client";
import type { ReactNode } from "react";
import { Mail, Users, Clock, Send } from "lucide-react";
import type { LeadListItem } from "@/core/use-cases/dto";

// LemList-style: visualizes the comparator sequence (3 deterministic touches,
// see core/services/sequencing.ts). Step 1 is broken into angle variants
// derived from the signals actually detected on each lead.
const ANGLE_BY_SIGNAL: Record<string, string> = {
  competitor_activity: "Competitor comparison",
  content_engagement: "Competitor comparison",
  influencer_engagement: "Competitor comparison",
  deep_search: "Growth signal",
  job_update: "New role",
  champion_tracking: "New role",
  job_posting: "Hiring",
  keyword_detection: "Hiring",
};
// Priority order (same as ANGLE_TEMPLATES in templates.ts).
const ANGLE_PRIORITY = [
  "Competitor comparison",
  "Growth signal",
  "New role",
  "Hiring",
];
const VARIANT_LETTERS = ["A", "B", "C", "D"];

const pickAngle = (agentTypes: string[]): string => {
  const angles = new Set(agentTypes.map((t) => ANGLE_BY_SIGNAL[t]).filter(Boolean));
  return ANGLE_PRIORITY.find((a) => angles.has(a)) ?? "Competitor comparison";
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
    <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-3">
        <h2 className="font-display text-sm font-semibold tracking-tight">Email sequence</h2>
        <p className="text-xs text-muted-foreground">
          3 touches · {audience} recipient{audience > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Send className="h-3.5 w-3.5" /> Sender
        </span>
        <span className="font-medium">Default schedule</span>
      </div>

      <div className="relative space-y-4 border-l pl-5">
        <Step delay="Send immediately" channel="Email" audience={audience}>
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
        <Step delay="7-day delay" channel="Email · Follow-up" audience={audience} scheduled />
        <Step
          delay="7-day delay"
          channel="Email · Last follow-up"
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
            scheduled
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
