import Link from "next/link";
import {
  Check,
  Sparkles,
  Database,
  Layers,
  Users,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { container } from "@/adapters/composition/container";
import { PageHeader } from "../_components/page-header";
import { SeedButton } from "./_components/seed-button";

export const dynamic = "force-dynamic";

const PROVIDERS = [
  { key: "sillage", label: "Sillage", note: "Signal detection" },
  { key: "fullenrich", label: "FullEnrich", note: "Contact enrichment" },
  { key: "anthropic", label: "Anthropic", note: "Email writing + ICP" },
] as const;

const PLANS = [
  { name: "Starter", price: "$0", features: ["1 sequence", "50 leads/mo", "Unlimited emails"] },
  {
    name: "Growth",
    price: "$149",
    features: ["Unlimited sequences", "2,000 leads/mo", "CRM sync"],
    highlight: true,
  },
  { name: "Scale", price: "Custom", features: ["Dedicated volume", "SLA", "Priority support"] },
];

const USAGE_ICONS = [Layers, Users, Mail, CheckCircle2];

export default async function SettingsPage() {
  const mode = container.mode;
  const stats = await container.getHomeStats.execute();

  const usage: [string, number][] = [
    ["Sequences", stats.sequences],
    ["Leads", stats.leads],
    ["Scheduled emails", stats.emailsScheduled],
    ["Sent emails", stats.emailsSent],
  ];

  return (
    <div className="max-w-4xl space-y-10">
      <PageHeader title="Settings" description="Integration status, usage and billing." />

      {/* Integrations */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Integrations
        </h2>
        <div className="divide-y rounded-2xl border bg-card shadow-[var(--shadow-sm)]">
          {PROVIDERS.map((p) => {
            const live = mode[p.key] === "live";
            return (
              <div key={p.key} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.note}</div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    live
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{
                      background: live ? "var(--state-sent)" : "var(--muted-foreground)",
                    }}
                  />
                  {live ? "live" : "mock"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          <b>Mock</b> mode = no API key configured, simulated data. Add the env keys to switch
          to <b>live</b>.
        </p>
      </section>

      {/* Usage */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Usage
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {usage.map(([label, value], i) => {
            const Icon = USAGE_ICONS[i];
            return (
              <div
                key={label}
                className="rounded-2xl border bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)]"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="flex size-6 items-center justify-center rounded-lg bg-[var(--accent)]"
                    style={{ color: "var(--primary)" }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </div>
                <div className="font-display mt-2 text-2xl font-bold tracking-tight">
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo data — prominent */}
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]"
              style={{ color: "var(--primary)" }}
            >
              <Database className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold">Load demo data</div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Populate the workspace with realistic sequences, leads and signals — perfect
                for a live demo.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <SeedButton />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pricing
          </h2>
          <Link
            href="/dashboard/pricing"
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Compare all plans →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)] ${
                p.highlight ? "ring-2 ring-[var(--primary)]" : ""
              }`}
            >
              {p.highlight && (
                <span
                  className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-sm)]"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <Sparkles className="h-2.5 w-2.5" /> Popular
                </span>
              )}
              <div className="text-sm font-medium">{p.name}</div>
              <div className="font-display mt-1 text-2xl font-bold tracking-tight">
                {p.price}
              </div>
              <ul className="mt-3 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                    <Check
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: "var(--primary)" }}
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
