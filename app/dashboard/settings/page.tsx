import { Check } from "lucide-react";
import { container } from "@/adapters/composition/container";
import { PageHeader } from "../_components/page-header";
import { SeedButton } from "./_components/seed-button";

export const dynamic = "force-dynamic";

const PROVIDERS = [
  { key: "sillage", label: "Sillage", note: "Détection des signaux" },
  { key: "fullenrich", label: "FullEnrich", note: "Enrichissement des contacts" },
  { key: "anthropic", label: "Anthropic", note: "Rédaction des emails + ICP" },
] as const;

const PLANS = [
  { name: "Starter", price: "0€", features: ["1 séquence", "50 leads/mois", "Emails illimités"] },
  { name: "Growth", price: "149€", features: ["Séquences illimitées", "2 000 leads/mois", "Sync CRM"], highlight: true },
  { name: "Scale", price: "Sur devis", features: ["Volume dédié", "SLA", "Support prioritaire"] },
];

export default async function SettingsPage() {
  const mode = container.mode;
  const stats = await container.getHomeStats.execute();

  return (
    <div className="max-w-4xl space-y-8">
      <PageHeader title="Settings" description="État des intégrations, usage et facturation." />

      {/* Config sanity */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Intégrations
        </h2>
        <div className="divide-y rounded-xl border bg-card shadow-[var(--shadow-sm)]">
          {PROVIDERS.map((p) => {
            const live = mode[p.key] === "live";
            return (
              <div key={p.key} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.note}</div>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    live
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-zinc-200 bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {live ? "live" : "mock"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Mode <b>mock</b> = pas de clé API configurée, données simulées. Ajoute les clés
          d&apos;env pour passer en <b>live</b>.
        </p>
      </section>

      {/* Usage */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Usage
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Séquences", stats.sequences],
            ["Leads", stats.leads],
            ["Emails planifiés", stats.emailsScheduled],
            ["Emails envoyés", stats.emailsSent],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border bg-card p-4 shadow-[var(--shadow-sm)]">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
            </div>
          ))}
        </div>
        <SeedButton />
      </section>

      {/* Pricing */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pricing
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)] ${p.highlight ? "border-primary ring-1 ring-primary" : ""}`}
            >
              <div className="text-sm font-medium">{p.name}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{p.price}</div>
              <ul className="mt-3 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" /> {f}
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
