"use client";
// FOMO tool phone mockup — mirrors the habit-tracker template's phone layout
// (dark header + area chart, stat cards, "stacks" row, AI suggestion) but with
// real FOMO content. Exported to SVG for the landing. Light/orange brand.
import * as React from "react";
import { Bot, ChevronDown, ChevronLeft, ChevronRight, Wifi, BatteryFull, SignalHigh, CornerUpRight } from "lucide-react";

function LinkedinGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.4 4.75 5.5V21H19v-5.3c0-1.26-.02-2.9-1.9-2.9-1.9 0-2.2 1.4-2.2 2.8V21H9z" />
    </svg>
  );
}

function AreaChart() {
  const line = "M0,66 C18,46 34,52 52,40 C70,28 86,58 104,32 C122,12 138,52 156,42 C174,34 190,20 208,38 C226,52 244,38 262,46";
  return (
    <svg viewBox="0 0 262 92" className="mt-3 h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fomoArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4c00" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff4c00" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L262,92 L0,92 Z`} fill="url(#fomoArea)" />
      <path d={line} fill="none" stroke="#ff6a2b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="104" cy="32" r="5" fill="#fff" stroke="#ff4c00" strokeWidth="3" />
    </svg>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-2xl border bg-card px-3 py-2.5 shadow-[var(--shadow-sm)]">
      <div className="font-display text-xl font-bold">{value}</div>
      <div className="text-[11px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

const CADENCES = [
  { count: "8 leads", title: "Competitor switchers", sub: "Email · LinkedIn · Postal", hue: "var(--email-dot)", bg: "#fff0e9" },
  { count: "5 leads", title: "New-role plays", sub: "Congrats + value", hue: "var(--linkedin-dot)", bg: "#e9f0ff" },
  { count: "3 leads", title: "Champion moves", sub: "Warm intro", hue: "var(--postal-dot)", bg: "#f2ebff" },
];

export function FomoPhone() {
  return (
    <div className="relative w-[300px] rounded-[2.6rem] bg-[#0b0b0c] p-[10px] shadow-[var(--shadow-lift)]">
      {/* dynamic island */}
      <div className="absolute left-1/2 top-[18px] z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[2.1rem] bg-card">
        {/* Dark header */}
        <div className="px-5 pb-4 pt-3 text-white" style={{ background: "var(--ink)" }}>
          <div className="flex items-center justify-between text-[12px] font-semibold">
            <span>19:02</span>
            <span className="flex items-center gap-1"><SignalHigh className="size-3.5" /><Wifi className="size-3.5" /><BatteryFull className="size-4" /></span>
          </div>
          <div className="mt-5">
            <h3 className="font-display text-[19px] font-bold leading-tight">Pipeline this week</h3>
            <p className="text-[12px] text-white/60">Coverage across your live deals</p>
          </div>
          <div className="mt-3 rounded-2xl bg-white/[0.06] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold">86% warm</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">Last 7 days <ChevronDown className="size-3" /></span>
            </div>
            <AreaChart />
            <div className="mt-1 flex justify-between px-0.5 text-[10px] text-white/40">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
            </div>
          </div>
        </div>

        {/* White body */}
        <div className="space-y-4 p-4">
          <div className="flex gap-2.5">
            <StatCard value="24" label="Touches sent" />
            <StatCard value="08" label="Replies in" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-display text-[15px] font-bold">Active cadences</h4>
              <div className="flex gap-1">
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--ink)] text-white"><ChevronLeft className="size-3.5" /></span>
                <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-muted-foreground"><ChevronRight className="size-3.5" /></span>
              </div>
            </div>
            <div className="flex gap-2.5">
              {CADENCES.map((c) => (
                <div key={c.title} className="w-[118px] shrink-0 rounded-2xl p-3" style={{ background: c.bg }}>
                  <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: c.hue }}>{c.count}</span>
                  <div className="mt-2 text-[13px] font-semibold leading-tight" style={{ color: "var(--ink)" }}>{c.title}</div>
                  <div className="mt-0.5 text-[10px]" style={{ color: c.hue }}>{c.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg text-white" style={{ background: "var(--gradient-hero)" }}><Bot className="size-3.5" /></span>
              <h4 className="font-display text-[15px] font-bold">AI suggestions</h4>
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl border bg-card p-3 shadow-[var(--shadow-sm)]">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full" style={{ background: "#fff0e9", color: "var(--primary)" }}>
                <CornerUpRight className="size-3.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">Best send window</div>
                <div className="text-[11px] leading-snug text-muted-foreground">Nadia (Ramp) opens email around 8:20 AM — schedule the next touch then.</div>
              </div>
              <LinkedinGlyph className="ml-auto size-4 shrink-0" style={{ color: "var(--linkedin-dot)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
