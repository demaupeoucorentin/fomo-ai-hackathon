import Link from "next/link";
import {
  Mail,
  Mailbox,
  Clock,
  Check,
  Send,
  Plug,
  CalendarClock,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { PageHeader } from "../_components/page-header";
import { Button } from "@/components/ui/button";

function LinkedinGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.4 4.75 5.5V21H19v-5.3c0-1.26-.02-2.9-1.9-2.9-1.9 0-2.2 1.4-2.2 2.8V21H9z" />
    </svg>
  );
}

type Channel = "email" | "linkedin" | "postal";

const CHANNEL = {
  email: { label: "Email", hue: "var(--email-dot)", text: "var(--email-text)", Icon: Mail },
  linkedin: {
    label: "LinkedIn",
    hue: "var(--linkedin-dot)",
    text: "var(--linkedin-text)",
    Icon: LinkedinGlyph,
  },
  postal: {
    label: "Postal letter",
    hue: "var(--postal-dot)",
    text: "var(--postal-text)",
    Icon: Mailbox,
  },
} as const;

type Status = "sent" | "scheduled";

function StatusPill({ status }: { status: Status }) {
  const map = {
    sent: {
      cls: "border-emerald-200 bg-emerald-50 text-emerald-700",
      Icon: Check,
      label: "Sent",
    },
    scheduled: {
      cls: "border-amber-200 bg-amber-50 text-amber-700",
      Icon: Clock,
      label: "Scheduled",
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${map.cls}`}
    >
      <map.Icon className="size-3" /> {map.label}
    </span>
  );
}

type Message = {
  id: string;
  channel: Channel;
  step: string;
  status: Status;
  to: string;
  handle: string;
  subject: string;
  preview: string;
  from: string;
  signal: string;
};

// Sample outbox — mirrors the multi-channel plan the agents draft per lead.
const MESSAGES: Message[] = [
  {
    id: "m1",
    channel: "email",
    step: "J+0",
    status: "sent",
    to: "Nadia Okonkwo",
    handle: "nadia@ramp.com",
    subject: "How Northwind switched in 30 days",
    preview:
      "Hi Nadia — you were weighing Rival.io last week. Northwind moved over last quarter and cut close time 22%. Happy to share the before/after…",
    from: "Sarah Lin",
    signal: "Competitor",
  },
  {
    id: "m2",
    channel: "linkedin",
    step: "J+3",
    status: "sent",
    to: "Nadia Okonkwo",
    handle: "in/nadiaokonkwo",
    subject: "One thought on the Rival.io eval",
    preview:
      "Nadia — the switching cost people fear is mostly the CRM sync, and that part is 20 min with us. Worth 15 min next week?",
    from: "Tom Bauer",
    signal: "Competitor",
  },
  {
    id: "m3",
    channel: "email",
    step: "J+7",
    status: "scheduled",
    to: "Marcus Reyes",
    handle: "marcus@lattice.com",
    subject: "Congrats on the Series C — a quick idea",
    preview:
      "Marcus — saw the raise. Teams scaling GTM this fast usually feel the manual-follow-up pain by month two. Here's how we automate it…",
    from: "Sarah Lin",
    signal: "Growth",
  },
  {
    id: "m4",
    channel: "postal",
    step: "J+7",
    status: "scheduled",
    to: "Nadia Okonkwo",
    handle: "handwritten · tracked",
    subject: "A note from the whole team",
    preview:
      "No pitch. Just a note to say the whole team's rooting for a smooth eval. Card + a little something on the way.",
    from: "David, VP Sales",
    signal: "Champion",
  },
  {
    id: "m5",
    channel: "linkedin",
    step: "J+10",
    status: "scheduled",
    to: "Priya Anand",
    handle: "in/priyaanand",
    subject: "New role — congrats",
    preview:
      "Priya — congrats on the VP Sales seat. First 90 days are the moment to lock in the outbound stack. Two minutes on how we'd help?",
    from: "Tom Bauer",
    signal: "New role",
  },
];

const STATS = [
  { label: "Scheduled", value: 3, icon: CalendarClock },
  { label: "Sent", value: 2, icon: CheckCircle2 },
  { label: "Channels", value: 3, icon: Radio },
  { label: "Teammates", value: 3, icon: Send },
];

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className="flex size-6 items-center justify-center rounded-lg bg-[var(--accent)]"
          style={{ color: "var(--primary)" }}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="font-display mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function MessageCard({ m, idx }: { m: Message; idx: number }) {
  const c = CHANNEL[m.channel];
  return (
    <div
      style={{ "--i": idx } as React.CSSProperties}
      className="animate-in overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]"
    >
      {/* Channel head */}
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <span
          className="flex size-6 items-center justify-center rounded-md"
          style={{ background: `color-mix(in srgb, ${c.hue} 14%, transparent)`, color: c.hue }}
        >
          <c.Icon className="size-3.5" />
        </span>
        <span className="text-[13px] font-semibold">{c.label}</span>
        <span className="rounded-full border px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          {m.step}
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span
            className="hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-flex"
            style={{
              borderColor: `color-mix(in srgb, ${c.hue} 30%, transparent)`,
              color: c.text,
            }}
          >
            {m.signal}
          </span>
          <StatusPill status={m.status} />
        </span>
      </div>

      {/* Body */}
      <div className="space-y-2 px-4 py-3 text-[13px]">
        <div className="flex justify-between gap-3 text-muted-foreground">
          <span>
            <span className="text-foreground">To</span> {m.to}
          </span>
          <span className="truncate">{m.handle}</span>
        </div>
        <div className="font-display text-[15px] font-semibold tracking-tight">{m.subject}</div>
        <p className="leading-relaxed text-muted-foreground">{m.preview}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Plug className="size-3" /> Synced to HubSpot
        </span>
        <span className="inline-flex items-center gap-1" style={{ color: c.text }}>
          <Send className="size-3" /> From {m.from}
        </span>
      </div>
    </div>
  );
}

export default function DashboardEmails() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Emails"
        description="Every message your team drafts, schedules and sends — email, LinkedIn and postal, coordinated per lead."
        actions={
          <Button asChild size="sm">
            <Link href="/onboarding">Start detection</Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} icon={s.icon} />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {MESSAGES.map((m, i) => (
            <MessageCard key={m.id} m={m} idx={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
