# v0.dev prompt — FOMO AI landing + product

Paste this into [v0.dev](https://v0.dev) to generate design proposals. Reference: https://daily-plum-503383.framer.app/

---

Build a modern B2B SaaS landing page + product UI for **FOMO AI**, an AI-native sales co-pilot.

**What it does (put this across the page):** FOMO AI lives *inside* the customer's CRM (HubSpot / Salesforce) — it is NOT a separate app. It syncs the CRM leads and the internal team's org chart, then for every prospect auto-builds a **multi-person, multi-channel retro-planning grid**: teammates × dates, where each cell is a drafted, scheduled message tagged by channel (email / LinkedIn / postal letter). Buying signals (a competitor mention, a job change, a LinkedIn post) trigger the cadence. The pitch: the whole go-to-market team shows up in a coordinated, high-status way, so the prospect is never left alone between an SDR's touchpoints → more trust → more closed deals.

**Audience:** mid-market / enterprise B2B sales teams (50+ employees, €1M–€50M ARR).

**Brand system (use exactly):**
- Colors: off-white page `#F7F7F7`, near-black ink `#131515`, white cards, and a hero **orange `#FF4C00`** with a warm gradient `linear-gradient(150deg,#FF6A2B,#FF4C00,#7A1F00)`. Gold accent `#FFB020` for signals/streaks. Channel accents (used as small chips on a dark card): email = orange, LinkedIn = blue `#3D7BFF`, postal = purple `#9B5CFF`, "sent" = green `#12A70A`.
- Type: display/headings **Bricolage Grotesque** (bold, tight tracking -0.03em, large), body **Hanken Grotesk**, mono **JetBrains Mono** for dates. NOT Inter/Geist/Roboto (too generic/AI).
- Shape: fully rounded — pill buttons (radius ~20px+), rounded-2xl cards. Soft ambient shadows. Playful, slightly gamified (a "12 touches scheduled this week" flame badge, streaks).
- One signature dark card: near-black `#131515` with colored accent chips — this is the hero "retro-planning grid".

**Sections:**
1. **Nav** — a floating rounded pill bar (logo "FOMO AI" + Product / How it works / Pricing / Company + a white "Join waitlist" pill), over the orange hero.
2. **Hero** — full orange gradient. Big bold headline "Your SDR shouldn't have to close alone." + subcopy + two pill CTAs (white "Get started", ghost "Request a demo"). On the right, the **dark retro-planning grid card** floating: header with prospect company logo (e.g. "Ramp"), contact "Nadia Okonkwo · VP Revenue", stats (8 touches · 4 teammates · 4 weeks); a signal banner "Signal detected — Ramp compared 'Rival.io' on LinkedIn"; a matrix of 4 teammates (with real photos) × 4 date columns (J+0, J+3, J+7, J+14) where cells are colored channel chips (email orange, LinkedIn blue, postal purple) with a clock (scheduled) or green check (sent) icon; a legend.
3. **"Inside your CRM"** — a mock HubSpot record page where a "✨ FOMO AI" tab reveals the same grid. Caption: "No new tool. Just réglage."
4. **How it works** — 3 steps: Sync CRM + org chart → Signals trigger cadences → Team shows up on time, every channel.
5. **Logos / social proof**, **pricing teaser**, **waitlist CTA footer** ("Be the first to give every deal executive voice.").

**Must be fully responsive** — the landing shows **mobile mockups**, so the grid must collapse gracefully to a date-grouped vertical timeline on phones.

Make it filmable: high contrast, motion-friendly, screenshot-ready at 1080p.
