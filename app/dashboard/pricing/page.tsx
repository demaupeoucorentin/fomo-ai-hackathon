import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/page-header";

type Plan = {
  name: string;
  tagline: string;
  price: string;
  cadence?: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "For solo operators getting their first plays live.",
    price: "$0",
    cadence: "/mo",
    features: [
      "1 active sequence",
      "50 leads / month",
      "Unlimited emails",
      "Signal detection (mock)",
      "Community support",
    ],
    cta: "Start free",
  },
  {
    name: "Growth",
    tagline: "For teams running coordinated outbound at scale.",
    price: "$149",
    cadence: "/mo",
    features: [
      "Unlimited sequences",
      "2,000 leads / month",
      "Live signal detection",
      "CRM sync (HubSpot)",
      "Contact enrichment",
      "Priority email support",
    ],
    cta: "Upgrade to Growth",
    popular: true,
  },
  {
    name: "Scale",
    tagline: "For revenue orgs with custom volume and controls.",
    price: "Custom",
    features: [
      "Dedicated lead volume",
      "SLA & uptime guarantees",
      "SSO & advanced roles",
      "Dedicated success manager",
      "Custom integrations",
    ],
    cta: "Talk to sales",
  },
];

const FAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes — upgrade or downgrade whenever you like. Changes prorate to the current cycle.",
  },
  {
    q: "What counts as a lead?",
    a: "A unique prospect added to a sequence within the billing month. Re-engaging an existing lead is free.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual plans ship with two months free. Reach out and we'll set you up.",
  },
];

export default function DashboardPricing() {
  return (
    <div className="max-w-5xl space-y-10">
      <PageHeader
        title="Pricing"
        description="Simple, transparent plans. The whole team already showed up for you."
      />

      {/* Pricing tiers */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow)] ${
              p.popular
                ? "ring-2 ring-[var(--primary)] shadow-[var(--shadow-lift)]"
                : ""
            }`}
          >
            {p.popular && (
              <span
                className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-[var(--shadow-sm)]"
                style={{ background: "var(--gradient-hero)" }}
              >
                <Sparkles className="h-3 w-3" /> Popular
              </span>
            )}

            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {p.name}
              </h2>
            </div>
            <p className="mt-1 min-h-10 text-sm text-muted-foreground">
              {p.tagline}
            </p>

            <div className="mt-5 flex items-end gap-1">
              <span className="font-display text-4xl font-bold tracking-tight">
                {p.price}
              </span>
              {p.cadence && (
                <span className="mb-1 text-sm text-muted-foreground">
                  {p.cadence}
                </span>
              )}
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
                    style={{ color: "var(--primary)" }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={p.popular ? "default" : "outline"}
              className="mt-7 h-11 rounded-full"
              style={
                p.popular
                  ? { background: "var(--gradient-hero)", border: "none" }
                  : undefined
              }
            >
              <Link href="/dashboard/settings">{p.cta}</Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Reassurance strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 rounded-2xl border bg-card px-6 py-4 text-sm text-muted-foreground shadow-[var(--shadow-sm)]">
        {["No credit card to start", "Cancel anytime", "14-day money-back"].map(
          (t) => (
            <span key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4" style={{ color: "var(--state-sent)" }} />
              {t}
            </span>
          ),
        )}
      </div>

      {/* FAQ */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Frequently asked
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]"
            >
              <div className="text-sm font-semibold">{item.q}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
