"use client";
// Wide horizontal hero: the FOMO tool phone in the center, flanked by FOMO
// "play" cards on both sides (staggered, like the landing scatter) — one
// composed graphic that fills width. Replaces the phone + independent cards.
import * as React from "react";
import { FomoPhone } from "./fomo-phone";
import { CARDS, FomoCard, type CardDef } from "./fomo-cards";

const bySlug = (s: string): CardDef => CARDS.find((c) => c.slug === s) as CardDef;

function Col({ slugs, offset }: { slugs: string[]; offset?: boolean }) {
  return (
    <div className={`flex flex-col gap-5 ${offset ? "pt-16" : ""}`}>
      {slugs.map((s) => <FomoCard key={s} card={bySlug(s)} />)}
    </div>
  );
}

export function FomoHeroStrip() {
  return (
    <div className="flex items-center justify-center gap-6" style={{ background: "#f7f7f7", padding: 48 }}>
      {/* left cluster */}
      <Col slugs={["first-touch", "reply-fast"]} />
      <Col slugs={["catch-signal", "enrich"]} offset />
      {/* phone */}
      <div className="mx-2 shrink-0"><FomoPhone /></div>
      {/* right cluster */}
      <Col slugs={["linkedin", "letter"]} offset />
      <Col slugs={["never-cool", "crm-sync"]} />
    </div>
  );
}
