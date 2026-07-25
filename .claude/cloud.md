# FOMO AI — session context

> Read this first, every session. It's the single source of truth for **what we're building and why**.
> Auto-loaded via `AGENTS.md`. Product/architecture details live in the code; this file holds the *intent*.

## The business

**FOMO AI** builds an **AI SDR co-pilot** for go-to-market teams.

- **ICP** — **mid-market → enterprise** B2B GTM teams. Companies **50+ employees**, meaningful revenue (**~€1M–€50M ARR** scale), whose leads already live in a CRM (**HubSpot, Salesforce, …**). The buyer wants to **raise the trust/confidence they project to prospects so they close more**.
- **Problem** — when an SDR is mid-deal, the prospect goes quiet *between* human touchpoints. That silence kills trust and momentum; deals go cold because the rep can't manually keep every prospect warm — and can't coordinate the rest of the team around that prospect.
- **Solution** — for **every CRM-synced lead**, we auto-build and auto-run a **multi-person, multi-channel retro-planned cadence**. When a buying **signal** fires (competitor activity, keyword mention, job change, content engagement, champion move…), we draft and schedule the *right* message, from the *right* teammate, on the *right* channel (email / LinkedIn / postal letter), at the *right* time (J+0 / J+7 / J+14).
- **Value** — the prospect is never left alone: the **whole GTM team** shows up in a coordinated, high-status way. The rep looks present, sharp, backed by a team — more trust, more charisma, higher close rate — without anyone lifting a finger between calls.

## Positioning

**AI-native, agentic, and effortless to adopt.**
- **AI-powered / very agentic** — autonomous agents watch signals and orchestrate the whole cadence; the human just approves.
- **Easy to set up** — "just réglage": connect the CRM + org chart, configure, done. No new tool, no migration.
- **Developer surface** — we ship an **API** and an **MCP server**, so customers can plug FOMO into their own stack/agents.

## Delivery model — NOT a separate app

**The rep never leaves their CRM.** FOMO AI is a **configuration layer on top of HubSpot / Salesforce**, not a new tool.
- We sync the customer's **internal org chart** (the GTM team) *and* their CRM leads.
- Inside the CRM, a **column** on each prospect exposes a **URL / grid view** — the retro-planning matrix.
- That matrix shows, per prospect: every **internal teammate mobilized** for it × **dates**, where each cell is a **drafted message + scheduled date + channel** (email / LinkedIn / postal letter).
- Setup is "just réglage" — connect, configure, done. The value renders *where the rep already works*.

**One-liner:** *Never let a deal go cold. Right inside your CRM, FOMO AI orchestrates your whole team's perfectly-timed, multi-channel outreach around every prospect — so your reps close with confidence.*

**Hero view (the money shot):** the **retro-planning grid** — teammates × dates, cells = drafted message · channel · scheduled date, accessed straight from a CRM column.

## The product — "Slipstream"

The core loop (already built in this repo):

```
CRM sync → lead → signal detected → retro-planned cadence → drafted email → scheduled → sent
```

- **Onboarding** (`app/onboarding`): import leads / connect CRM → define ICP (persona) → generate sequences → run.
- **Dashboard** (`app/dashboard`): leads, emails, CRM, **planning cockpit** (the signal→email timeline — the money shot for the demo), sequences, settings, usage, pricing.

## Architecture (hexagonal — respect the layers)

- `core/domain` — pure entities/value-objects. No framework, no I/O.
- `core/ports/driven` — interfaces for external services (CRM/signal provider, enricher, LLM, persona store).
- `core/use-cases` — orchestration (create-run, run-pipeline, generate-icp, seed-demo…).
- `adapters/` — concrete implementations (sillage / fullenrich / anthropic).
- `app/` — Next.js 16 UI + API routes. `components/ui` — design-system primitives.

## How to work here

- ⚠️ **Next.js 16.2 has breaking changes** vs training data. Read `node_modules/next/dist/docs/` before writing Next code. (see `AGENTS.md`)
- **Ponytail is on** — laziest solution that works. Fewest files, shortest diff, stdlib/native before deps.
- Keep the demo **fake-but-believable**: CRM sync is mocked/seeded, not a live integration. The pitch/business feel matters more than real plumbing — polish the mock.
- **Responsive is mandatory** — the landing page shows **mobile mockups**, so the hero grid + fake-CRM chrome must have clean phone layouts, not just desktop.
- Tests live in `core/__tests__` (vitest). Non-trivial domain logic keeps one runnable check.

## Design & visuals

**The design lives in the real app now.** Storybook has been removed — reskin/verify by running the app (`npm run dev`, seed via Settings → "Load demo data" or `POST /api/seed`) and looking at the screens. Everything is **light mode**, orange/off-white/ink (see `DESIGN.md`; tokens in `app/globals.css`).

- **`DESIGN.md`** — the design system (color, channels, type, motion). Tokens in `app/globals.css`.
- **App screens** (all reskinned to premium light-orange, `rounded-2xl` cards, `font-display` headings, orange/gold accents, channel colors, sent=emerald/scheduled=amber):
  - Shell: `app/dashboard/_components/{sidebar,page-header,wip}.tsx`. Home: `app/dashboard/page.tsx`.
  - **Planning cockpit** (money screen): `app/dashboard/planning/_components/{planning-cockpit,lead-timeline}.tsx`.
  - Onboarding: `app/onboarding/**`. Emails (multi-channel outbox), CRM, Sequences, Settings, Usage, Pricing under `app/dashboard/**`. Leads list + CRM use the shared `Wip`/`EmptyState`.
  - Gold-standard patterns: `app/dashboard/page.tsx` (stat tiles) + planning cockpit.
- **Reusable demo/Remotion components** in `components/showcase/`: `retro-planning-grid.tsx` (teammates×dates hero, light), `channels-detail.tsx` (Email/LinkedIn-via-lemlist/Postal previews), `hubspot-chrome.tsx` (fake CRM frame). Not wired into the app; kept for the Remotion demo.
- **Landing SVGs** — `public/landing-mockups/*.svg` (warm-streak, unlock-badge, daily-plan, touches-phone, retro-planning-grid, channel-{email,linkedin,letter}). High-DPI PNG-in-SVG, drop-in replacements for the Framer landing's placeholder graphics.
- **`.claude/v0-prompt.md`** — paste-ready v0.dev prompt. Real assets: portraits in `public/people/`, Ramp logo in `public/companies/`.
- Motion tokens are **Remotion-portable** (same cubic-beziers + ms) so the demo animates identically to the app.

## Specialist agent briefs

Use these with the Agent tool or `@`-mention them when the task fits:

- [`agents/business-analyst.md`](agents/business-analyst.md) — grounds any work in the ICP / value prop above.
- [`agents/brand-designer.md`](agents/brand-designer.md) — visual identity & "sexy branding" direction.
- [`agents/code-reviewer.md`](agents/code-reviewer.md) — reviews diffs for correctness + over-engineering + layer hygiene.

## Brand direction (DECISIVE — calibrated to the reference landing)

Reference: https://daily-plum-503383.framer.app/ (the FOMO Framer landing). Palette **orange / gold / near-black / off-white**: page `#F7F7F7`, ink `#131515`, hot orange `#FF4C00` (hero gradient), gold `#FFB020`. Signature = a **dark near-black card** with colored channel chips (email orange, LinkedIn blue `#3D7BFF`, postal purple `#9B5CFF`, sent green `#12A70A`). Fonts: **Bricolage Grotesque** (display) + **Hanken Grotesk** (body) + **JetBrains Mono** — deliberately not Geist/Inter. Rounded pills, gently gamified. The old indigo/Slipstream/Geist look is retired. Product name shown = `FOMO AI` (`lib/brand.ts`).
