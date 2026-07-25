"use client";
// The scattered landing cards, redone: same design as the habit-tracker template
// (white rounded card + gradient icon circle + label) but FOMO GTM "plays".
// One per original card color. Exported to individual SVGs for the landing.
import * as React from "react";
import { Send, Radar, Flame, Sparkles, Clock, Mailbox, RefreshCw } from "lucide-react";

function LinkedinGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.4 4.75 5.5V21H19v-5.3c0-1.26-.02-2.9-1.9-2.9-1.9 0-2.2 1.4-2.2 2.8V21H9z" />
    </svg>
  );
}

export interface CardDef {
  slug: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  grad: string; // icon circle gradient
  label: string;
}

// Colors mirror the template's cards (orange / green / blue / purple / coral / sky / teal / pink).
export const CARDS: CardDef[] = [
  { slug: "first-touch", Icon: Send, grad: "linear-gradient(150deg,#ff6a2b,#ff4c00)", label: "First touch, on time" },
  { slug: "catch-signal", Icon: Radar, grad: "linear-gradient(150deg,#34d399,#12a70a)", label: "Catch every buying signal" },
  { slug: "linkedin", Icon: LinkedinGlyph, grad: "linear-gradient(150deg,#5b8cff,#3d7bff)", label: "Warm them on LinkedIn" },
  { slug: "never-cool", Icon: Flame, grad: "linear-gradient(150deg,#b06bff,#7c3aed)", label: "Never let a deal cool" },
  { slug: "enrich", Icon: Sparkles, grad: "linear-gradient(150deg,#ff8a6a,#ff5a3c)", label: "Enrich every lead" },
  { slug: "reply-fast", Icon: Clock, grad: "linear-gradient(150deg,#7fd0ff,#38a8f0)", label: "Reply while intent is hot" },
  { slug: "letter", Icon: Mailbox, grad: "linear-gradient(150deg,#5eead4,#0d9488)", label: "Send a real letter" },
  { slug: "crm-sync", Icon: RefreshCw, grad: "linear-gradient(150deg,#f9a8d4,#ec4899)", label: "Synced to your CRM" },
];

export function FomoCard({ card }: { card: CardDef }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-lift)]" style={{ width: 172 }}>
      <div className="flex items-center justify-center rounded-full text-white" style={{ width: 48, height: 48, background: card.grad }}>
        <card.Icon className="size-6" />
      </div>
      <div className="mt-3 text-[15px] font-semibold leading-snug text-foreground">{card.label}</div>
    </div>
  );
}

export function FomoCardsGrid() {
  return (
    <div className="flex flex-wrap gap-5" style={{ background: "#f7f7f7" }}>
      {CARDS.map((c) => <FomoCard key={c.slug} card={c} />)}
    </div>
  );
}
