"use client";
// Multi-channel detail: one prospect, three real message renderings —
// Email, LinkedIn (via lemlist), Postal letter. Sells "not just emails".
// Light, on-brand. Mock content.
import * as React from "react";
import { Mail, Mailbox, Clock, Check, Send, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

function LinkedinGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.4 4.75 5.5V21H19v-5.3c0-1.26-.02-2.9-1.9-2.9-1.9 0-2.2 1.4-2.2 2.8V21H9z" />
    </svg>
  );
}

function ChannelHead({ hue, Icon, label, right, tag }: { hue: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; right: React.ReactNode; tag?: string }) {
  return (
    <div className="flex items-center gap-2 border-b px-4 py-2.5">
      <span className="flex size-6 items-center justify-center rounded-md" style={{ background: `color-mix(in srgb, ${hue} 14%, transparent)`, color: hue }}>
        <Icon className="size-3.5" />
      </span>
      <span className="text-[13px] font-semibold">{label}</span>
      {tag && (
        <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{tag}</span>
      )}
      <span className="ml-auto">{right}</span>
    </div>
  );
}

function StatusPill({ status }: { status: "sent" | "scheduled" | "queued" }) {
  const map = {
    sent: { cls: "border-emerald-200 bg-emerald-50 text-emerald-700", Icon: Check, label: "Sent" },
    scheduled: { cls: "border-amber-200 bg-amber-50 text-amber-700", Icon: Clock, label: "Scheduled" },
    queued: { cls: "border-violet-200 bg-violet-50 text-violet-700", Icon: Clock, label: "Queued" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", map.cls)}>
      <map.Icon className="size-3" /> {map.label}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow)]" style={{ width: 340, maxWidth: "100%" }}>
      {children}
    </div>
  );
}

export function EmailPreview() {
  return (
    <Card>
      <ChannelHead hue="var(--email-dot)" Icon={Mail} label="Email" right={<StatusPill status="scheduled" />} tag="J+7" />
      <div className="space-y-2 px-4 py-3 text-[13px]">
        <div className="flex justify-between text-muted-foreground">
          <span><span className="text-foreground">To</span> Nadia Okonkwo</span>
          <span>nadia@ramp.com</span>
        </div>
        <div className="font-display text-[15px] font-semibold">How Northwind switched in 30 days</div>
        <p className="leading-relaxed text-muted-foreground">
          Hi Nadia — you were weighing Rival.io last week. Northwind moved over last quarter and cut close time 22%. Happy to share the before/after…
        </p>
      </div>
      <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Plug className="size-3" /> Synced to HubSpot</span>
        <span className="inline-flex items-center gap-1" style={{ color: "var(--email-text)" }}><Send className="size-3" /> From Sarah Lin</span>
      </div>
    </Card>
  );
}

export function LinkedInPreview() {
  return (
    <Card>
      <ChannelHead hue="var(--linkedin-dot)" Icon={LinkedinGlyph} label="LinkedIn message" right={<StatusPill status="scheduled" />} tag="via lemlist" />
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/people/nadia.jpg" alt="" className="size-6 rounded-full object-cover" />
          <span><span className="font-medium text-foreground">You&apos;re connected</span> · Nadia Okonkwo</span>
        </div>
        <div className="ml-auto w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-[13px] text-white" style={{ background: "var(--linkedin-dot)" }}>
          Nadia — one thought on the Rival.io eval: the switching cost people fear is mostly the CRM sync, and that part is 20 min with us. Worth 15 min next week?
        </div>
        <div className="text-right text-[11px] text-muted-foreground">Tom Bauer · SDR</div>
      </div>
      <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">J+3 · auto-personalized from the signal</div>
    </Card>
  );
}

export function LetterPreview() {
  return (
    <Card>
      <ChannelHead hue="var(--postal-dot)" Icon={Mailbox} label="Postal letter" right={<StatusPill status="queued" />} tag="handwritten" />
      <div className="relative py-4 pl-4 pr-16" style={{ background: "#fbf7f0" }}>
        <div className="absolute right-4 top-4 flex size-8 items-center justify-center rounded border-2 border-dashed border-[var(--postal-dot)]/40 text-[9px] font-semibold text-[var(--postal-text)]">
          STAMP
        </div>
        <p className="font-display text-[14px] italic leading-relaxed text-[#3a2f22]">
          &ldquo;Nadia — no pitch. Just a note to say the whole team&apos;s rooting for a smooth eval. Card + a little something on the way.&rdquo;
        </p>
        <div className="mt-3 font-display text-[15px] italic text-[#3a2f22]">— David, VP Sales</div>
      </div>
      <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">J+3 · mailed automatically · tracked to delivery</div>
    </Card>
  );
}

export function ChannelsRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-start justify-center gap-5", className)}>
      <EmailPreview />
      <LinkedInPreview />
      <LetterPreview />
    </div>
  );
}
