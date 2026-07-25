import {
  Plug,
  Mail,
  Mailbox,
  Radio,
  Check,
  RefreshCw,
  ArrowLeftRight,
  Building2,
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

type Integration = {
  id: string;
  name: string;
  blurb: string;
  connected: boolean;
  mark: string;
  accent: string;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    blurb: "Contacts, companies and deals sync both ways in real time.",
    connected: true,
    mark: "H",
    accent: "var(--primary)",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    blurb: "Map leads and opportunities to your existing pipeline stages.",
    connected: false,
    mark: "S",
    accent: "var(--linkedin-dot)",
  },
];

const TOUCHES = [
  { label: "Email", hue: "var(--email-dot)", Icon: Mail, note: "logged as activity" },
  { label: "LinkedIn", hue: "var(--linkedin-dot)", Icon: LinkedinGlyph, note: "logged as note" },
  { label: "Postal", hue: "var(--postal-dot)", Icon: Mailbox, note: "logged as task" },
  { label: "Signal", hue: "var(--gold)", Icon: Radio, note: "logged as property" },
] as const;

const SYNCED = [
  { id: "c1", name: "Nadia Okonkwo", company: "Ramp", touches: 4, stage: "Evaluating" },
  { id: "c2", name: "Marcus Reyes", company: "Lattice", touches: 2, stage: "New" },
  { id: "c3", name: "Priya Anand", company: "Notion", touches: 3, stage: "Contacted" },
];

function IntegrationCard({ i }: { i: Integration }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]">
      <div className="flex items-start gap-3">
        <span
          className="font-display flex size-11 items-center justify-center rounded-xl text-lg font-bold text-white shadow-[var(--shadow-sm)]"
          style={{ background: i.accent }}
        >
          {i.mark}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-semibold tracking-tight">{i.name}</span>
            {i.connected && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <Check className="h-3 w-3" /> Connected
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{i.blurb}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {i.connected ? (
          <>
            <Button size="sm" variant="outline" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Sync now
            </Button>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Two-way
            </span>
          </>
        ) : (
          <Button size="sm" className="gap-1.5">
            <Plug className="h-3.5 w-3.5" /> Connect
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DashboardCrm() {
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="CRM"
        description="Two-way sync with HubSpot and Salesforce. Every signal, message and channel touch lands on the contact record."
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {INTEGRATIONS.map((i) => (
            <IntegrationCard key={i.id} i={i} />
          ))}
        </div>

        {/* What lands on the record */}
        <div className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <ArrowLeftRight className="h-4 w-4" style={{ color: "var(--primary)" }} /> Every touch, on
            the record
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOUCHES.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-[var(--shadow-sm)]"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{
                    background: `color-mix(in srgb, ${t.hue} 14%, transparent)`,
                    color: t.hue,
                  }}
                >
                  <t.Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently synced */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4" style={{ color: "var(--primary)" }} /> Recently synced
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <Check className="h-3 w-3" /> Up to date
            </span>
          </div>
          <ul className="divide-y">
            {SYNCED.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <span className="font-display flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold" style={{ color: "var(--primary)" }}>
                  {s.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.company}</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Plug className="h-3 w-3" /> {s.touches} touches
                </span>
                <span className="hidden rounded-full border px-2 py-0.5 text-[11px] font-medium text-muted-foreground sm:inline-flex">
                  {s.stage}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
