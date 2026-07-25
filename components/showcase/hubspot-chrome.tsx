"use client";
// Faked CRM record page. Sells "it lives inside your HubSpot — no new tool":
// the FOMO AI tab is active and reveals the retro-planning grid. Pure chrome, mock.
import * as React from "react";
import { Search, Bell, Settings, Home, Users, Building2, Sparkles, Phone, Mail, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const HS = "#FF7A59"; // HubSpot orange

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={cn(
        "relative whitespace-nowrap px-3 py-2 text-[13px] font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="inline-flex items-center gap-1.5">{children}</span>
      {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: "var(--primary)" }} />}
    </button>
  );
}

export function HubSpotChrome({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-[var(--canvas)] text-foreground shadow-[var(--shadow)]", className)}>
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b bg-white px-3 py-2">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md text-white" style={{ background: HS }}>
          <span className="text-sm font-bold">h</span>
        </div>
        <div className="hidden items-center gap-4 text-[13px] text-muted-foreground sm:flex">
          <span className="font-medium text-foreground">Contacts</span>
          <span>Deals</span>
          <span>Reports</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-md border bg-[var(--canvas)] px-2 py-1 text-[12px] text-muted-foreground sm:flex">
            <Search className="size-3.5" /> Search HubSpot
          </div>
          <Bell className="size-4 text-muted-foreground" />
          <Settings className="size-4 text-muted-foreground" />
          <div className="size-6 rounded-full bg-[var(--primary)] text-center text-[11px] font-semibold leading-6 text-white">DC</div>
        </div>
      </div>

      <div className="flex">
        {/* Left nav rail */}
        <div className="hidden w-12 shrink-0 flex-col items-center gap-4 border-r bg-white py-4 text-muted-foreground md:flex">
          {[Home, Users, Building2, Star].map((I, i) => (
            <I key={i} className={cn("size-5", i === 1 && "text-[var(--primary)]")} />
          ))}
        </div>

        {/* Contact record column */}
        <aside className="hidden w-60 shrink-0 border-r bg-white p-4 lg:block">
          <div className="flex flex-col items-center text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/people/nadia.jpg" alt="Nadia Okonkwo" className="size-14 rounded-full object-cover" />
            <div className="mt-2 font-semibold">Nadia Okonkwo</div>
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/companies/ramp.png" alt="Ramp" className="size-4 rounded" /> VP Revenue · Ramp
            </div>
            <div className="mt-3 flex gap-2">
              <RecordBtn icon={Mail} />
              <RecordBtn icon={Phone} />
            </div>
          </div>
          <dl className="mt-5 space-y-2.5 text-[12px]">
            <Field k="Lifecycle stage" v="Opportunity" />
            <Field k="Deal" v="Ramp — Platform ($48k)" />
            <Field k="Owner" v="David Cho" />
            <Field k="Last activity" v="LinkedIn signal · today" />
          </dl>
        </aside>

        {/* Main — tabs + the FOMO AI grid */}
        <main className="min-w-0 flex-1 bg-[var(--canvas)]">
          <div className="flex items-center gap-1 overflow-x-auto border-b bg-white px-3">
            <Tab>Overview</Tab>
            <Tab>Activities</Tab>
            <Tab>Emails</Tab>
            <Tab active>
              <Sparkles className="size-3.5" style={{ color: "var(--primary)" }} /> FOMO AI
            </Tab>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

function RecordBtn({ icon: Icon }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <div className="flex size-8 items-center justify-center rounded-md border bg-white text-muted-foreground">
      <Icon className="size-4" />
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.04em] text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}
