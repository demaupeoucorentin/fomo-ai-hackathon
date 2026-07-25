"use client";
// The hero view: a prospect's retro-planning grid — teammates (org chart) × dates,
// each cell a drafted, scheduled, channel-tagged message. LIGHT card, orange
// gradient header, channel-tinted chips. Mock data, demo-safe.
// Responsive: desktop = matrix, mobile = date-grouped timeline (landing mockups).
import * as React from "react";
import { Mail, Mailbox, Check, Clock, Radar, Users, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

export type Channel = "email" | "linkedin" | "postal";
export type TouchStatus = "scheduled" | "sent";

export interface Touch {
  channel: Channel;
  status: TouchStatus;
  subject: string;
  dayIndex: number; // which date column
  signal?: boolean; // the touch the buying signal triggered
}
export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  photo?: string; // real portrait
}
export interface GridRow {
  member: TeamMember;
  touches: Touch[];
}
export interface RetroPlan {
  prospect: string;
  contact: string;
  logo?: string;
  signal: string;
  columns: string[]; // date labels, e.g. "J+0"
  rows: GridRow[];
}

function LinkedinGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.4 4.75 5.5V21H19v-5.3c0-1.26-.02-2.9-1.9-2.9-1.9 0-2.2 1.4-2.2 2.8V21H9z" />
    </svg>
  );
}

const CHANNEL: Record<Channel, { label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; dot: string; text: string; bg: string }> = {
  email: { label: "Email", Icon: Mail, dot: "var(--email-dot)", text: "var(--email-text)", bg: "var(--email-bg)" },
  linkedin: { label: "LinkedIn", Icon: LinkedinGlyph, dot: "var(--linkedin-dot)", text: "var(--linkedin-text)", bg: "var(--linkedin-bg)" },
  postal: { label: "Postal letter", Icon: Mailbox, dot: "var(--postal-dot)", text: "var(--postal-text)", bg: "var(--postal-bg)" },
};

function Avatar({ m, className }: { m: TeamMember; className?: string }) {
  if (m.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={m.photo} alt={m.name} className={cn("shrink-0 rounded-full object-cover ring-2 ring-black/5", className)} />;
  }
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold", className)}>
      {m.initials}
    </div>
  );
}

function ChannelChip({ touch, i }: { touch: Touch; i: number }) {
  const c = CHANNEL[touch.channel];
  const sent = touch.status === "sent";
  return (
    <div
      className={cn("chip-in flex items-center gap-1.5 rounded-lg border px-2 py-1.5", !sent && "border-dashed", touch.signal && "signal-pulse")}
      style={{
        ["--i" as string]: i,
        background: c.bg,
        color: c.text,
        borderColor: sent ? c.dot : `color-mix(in srgb, ${c.dot} 38%, white)`,
      }}
      title={`${c.label} · ${sent ? "Sent" : "Scheduled"} — ${touch.subject}`}
    >
      <c.Icon className="size-3.5 shrink-0" style={{ color: c.dot }} />
      <span className="truncate text-[11px] font-medium leading-tight">{touch.subject}</span>
      {sent ? (
        <Check className="ml-auto size-3 shrink-0" style={{ color: "var(--state-sent)" }} />
      ) : (
        <Clock className="ml-auto size-3 shrink-0 opacity-40" />
      )}
    </div>
  );
}

function EmptyCell() {
  return <div className="h-full min-h-9 rounded-lg border border-dashed bg-[var(--canvas)]/50" />;
}

export function RetroPlanningGrid({ plan, className }: { plan: RetroPlan; className?: string }) {
  const total = plan.rows.reduce((n, r) => n + r.touches.length, 0);
  const gridCols = `minmax(138px, 172px) repeat(${plan.columns.length}, minmax(100px, 1fr))`;
  let chipIndex = 0;

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card text-foreground shadow-[var(--shadow-lift)]", className)}>
      {/* Hero header — the one orange gradient gesture */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-white" style={{ background: "var(--gradient-hero)" }}>
        <div className="flex items-center gap-3">
          {plan.logo && (
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white/95 p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={plan.logo} alt={plan.prospect} className="size-7 object-contain" />
            </div>
          )}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/70">Retro-planning · via HubSpot</div>
            <h3 className="font-display text-lg font-semibold leading-tight">{plan.prospect}</h3>
            <p className="text-sm text-white/80">{plan.contact}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Stat icon={CalendarClock} value={String(total)} label="touches" />
          <Stat icon={Users} value={String(plan.rows.length)} label="teammates" />
          <Stat icon={CalendarClock} value={String(plan.columns.length)} label="weeks" />
        </div>
      </div>

      {/* Signal banner — the cause of the whole plan */}
      <div className="flex items-center gap-2.5 border-b bg-[var(--accent)] px-5 py-2.5">
        <span className="relative flex size-2.5 shrink-0">
          <span className="signal-pulse absolute inline-flex size-2.5 rounded-full" style={{ background: "var(--gold)" }} />
          <span className="relative inline-flex size-2.5 rounded-full" style={{ background: "var(--gold)" }} />
        </span>
        <Radar className="size-4 shrink-0" style={{ color: "var(--primary)" }} />
        <p className="text-[13px] text-foreground">
          <span className="font-semibold">Signal detected</span> — {plan.signal}
        </p>
      </div>

      {/* Desktop matrix */}
      <div className="hidden overflow-x-auto p-4 md:block">
        <div className="grid gap-2" style={{ gridTemplateColumns: gridCols }}>
          <div />
          {plan.columns.map((c) => (
            <div key={c} className="pb-1 text-center font-mono text-[11px] font-medium text-muted-foreground">{c}</div>
          ))}
          {plan.rows.map((row) => (
            <React.Fragment key={row.member.name}>
              <div className="flex items-center gap-2 py-1">
                <Avatar m={row.member} className="size-8" />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold leading-tight">{row.member.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{row.member.role}</div>
                </div>
              </div>
              {plan.columns.map((_, col) => {
                const touch = row.touches.find((t) => t.dayIndex === col);
                return <div key={col}>{touch ? <ChannelChip touch={touch} i={chipIndex++} /> : <EmptyCell />}</div>;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile timeline — same data, grouped by date */}
      <div className="space-y-4 p-4 md:hidden">
        {plan.columns.map((col, colIdx) => {
          const items = plan.rows.flatMap((r) => r.touches.filter((t) => t.dayIndex === colIdx).map((t) => ({ t, m: r.member })));
          if (!items.length) return null;
          return (
            <div key={col} className="relative pl-5">
              <span className="absolute left-0 top-1 font-mono text-[11px] font-medium text-muted-foreground">{col}</span>
              <div className="ml-8 space-y-2 border-l pl-3">
                {items.map(({ t, m }, k) => (
                  <div key={k} className="flex items-center gap-2">
                    <Avatar m={m} className="size-7" />
                    <div className="min-w-0 flex-1"><ChannelChip touch={t} i={k} /></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Legend />
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="size-4 text-white/70" />
      <span className="font-semibold">{value}</span>
      <span className="text-white/70">{label}</span>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t bg-[var(--canvas)] px-5 py-3 text-[11px] text-muted-foreground">
      {(Object.keys(CHANNEL) as Channel[]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ background: CHANNEL[k].dot }} />
          {CHANNEL[k].label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5"><Clock className="size-3" /> Scheduled</span>
      <span className="inline-flex items-center gap-1.5"><Check className="size-3" style={{ color: "var(--state-sent)" }} /> Sent</span>
    </div>
  );
}

// ── Demo data ────────────────────────────────────────────────────────────────
const T = (m: TeamMember, touches: Touch[]): GridRow => ({ member: m, touches });

export const demoPlan: RetroPlan = {
  prospect: "Ramp",
  contact: "Nadia Okonkwo · VP Revenue",
  logo: "/companies/ramp.png",
  signal: "Ramp publicly compared 'Rival.io' on LinkedIn — the window is open.",
  columns: ["J+0", "J+3", "J+7", "J+14"],
  rows: [
    T({ name: "Sarah Lin", role: "Account Executive", initials: "SL", photo: "/people/sarah.jpg" }, [
      { channel: "email", status: "sent", subject: "Saw your Rival.io post", dayIndex: 0, signal: true },
      { channel: "linkedin", status: "scheduled", subject: "One thought on switching", dayIndex: 2 },
      { channel: "email", status: "scheduled", subject: "How Northwind switched", dayIndex: 3 },
    ]),
    T({ name: "Tom Bauer", role: "SDR", initials: "TB", photo: "/people/tom.jpg" }, [
      { channel: "linkedin", status: "sent", subject: "Connected — 2-min version", dayIndex: 0 },
      { channel: "email", status: "scheduled", subject: "3 things Rival can't do", dayIndex: 3 },
    ]),
    T({ name: "Priya Nair", role: "Solutions Engineer", initials: "PN", photo: "/people/priya.jpg" }, [
      { channel: "email", status: "scheduled", subject: "Technical deep-dive invite", dayIndex: 2 },
      { channel: "linkedin", status: "scheduled", subject: "Sharing an architecture note", dayIndex: 3 },
    ]),
    T({ name: "David Cho", role: "VP Sales (you)", initials: "DC", photo: "/people/david.jpg" }, [
      { channel: "postal", status: "scheduled", subject: "Handwritten note + swag", dayIndex: 1 },
    ]),
  ],
};
