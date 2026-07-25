# FOMO AI — Design System

> Source of truth for the visual language. Tokens live in `app/globals.css`; components in `components/`; previews in Storybook.
> Memorable thing: **"the whole team already showed up for you."** Coordinated, high-status presence. Every choice serves that.

> **Reference:** calibrated to the FOMO Framer landing https://daily-plum-503383.framer.app/ — off-white page, near-black ink, hot orange, bold display type, dark accent cards, gently gamified.

## Aesthetic thesis

Confident, warm, a little gamified. High-energy orange (FOMO) on off-white and near-black, with a bold display face. Not sterile enterprise, not generic AI. The feeling of an unfair advantage your whole team runs together. Must film beautifully at 1080p and hold up shrunk into a phone mockup.

Three rules that keep it out of AI-slop:
1. **Orange is the one loud gesture.** The orange gradient owns the hero + primary CTAs. Everywhere else is ink-on-off-white with soft ambient shadow. The signature is a **dark near-black card** (`#131515`) carrying colored accent chips.
2. **Composition over decoration.** The retro-planning grid *is* the poster. No blobs, no 3-icon feature rows, no centered-everything.
3. **Channel color is information, not garnish.** Email / LinkedIn / postal each own a hue; a glance reads the plan.

## Color

Off-white page, near-black ink, hot orange. Values pulled from the reference landing.

| Token | Hex | Use |
|---|---|---|
| `--background` | `#FFFFFF` | white cards |
| `--canvas` | `#F7F7F7` | page / app shell |
| `--foreground` (ink) | `#131515` | primary text; **dark card bg** |
| `--muted-foreground` | `#494D4D` | secondary text |
| `--border` | `#E8E8E8` | hairlines |
| `--primary` | `#FF4C00` | orange — actions, email channel |
| `--primary-700` | `#CC3D00` | hover / pressed |
| `--gold` | `#FFB020` | signal / streak / highlight |
| `--accent` | `#FFF0E9` | tinted surfaces |

**Hero gradient:** `linear-gradient(150deg, #FF6A2B, #FF4C00, #7A1F00)`. Hero section + grid header + primary CTA.

### Channel colors (semantic — chips on the dark card use a lightened mix)

| Channel | Hue | Icon |
|---|---|---|
| **Email** | orange `#FF4C00` | `Mail` |
| **LinkedIn** | blue `#3D7BFF` | inline `in` glyph |
| **Postal letter** | purple `#9B5CFF` | `Mailbox` |

On the dark grid, chips = `color-mix(hue 14–22%, transparent)` bg + `color-mix(hue 40–60%, transparent)` border + text `color-mix(hue 22%, white)`.

### Lifecycle states (orthogonal to channel — a cell has both)

| State | Color | Treatment |
|---|---|---|
| **Signal fired** | gold `#FFB020` | pulsing ring on the triggering cell + signal banner |
| **Scheduled** | channel hue, soft | dashed-border chip + clock |
| **Sent** | green `#12A70A` | solid-border chip + check |

## Type

Fonts with character, not "AI-generic": **Bricolage Grotesque** (display/headings, bold, tight) + **Hanken Grotesk** (UI/body) + **JetBrains Mono** (dates). Loaded via `next/font` in `app/layout.tsx`; `.font-display` / `h1–h3` use Bricolage.

| Role | Size / line | Tracking |
|---|---|---|
| Display XL (hero) | 48 / 1.05 | -0.03em |
| Display L | 36 / 1.1 | -0.02em |
| H1 | 28 / 1.2 | -0.02em |
| H2 | 22 / 1.25 | -0.015em |
| Body | 15 / 1.5 | 0 |
| Small | 13 / 1.45 | 0 |
| Label (uppercase) | 11 / 1.4 | +0.06em |
| Mono | dates / ids | Geist Mono |

## Space, radius, elevation

- 4px base scale (Tailwind default). Sections breathe: 24–64px gaps.
- Radius: `--radius: 0.65rem`; cards `xl`, chips `full`, grid `2xl`.
- Shadows: `--shadow-sm` / `--shadow` (ambient, existing) + `--shadow-lift` for the grid card + `--glow-indigo` for the hero.

## Motion — Remotion-portable

Defined once as CSS vars, reused verbatim in Remotion (`Easing.bezier(...)`, `durationInFrames = ms / (1000/fps)`).

| Token | Value | Use |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | entrances, chip slide-in |
| `--ease-spring` | `cubic-bezier(0.34, 1.4, 0.5, 1)` | chip pop, signal fire |
| `--ease-io-soft` | `cubic-bezier(0.65, 0, 0.35, 1)` | reveals |
| durations | `120 / 200 / 320 / 560 / 800` ms | instant → cinematic |
| stagger | `60ms` (`--i`) | grid cells cascade |

Remotion note: at 30fps, `frames = ms / 33.33`. `--dur-base` 320ms ≈ 10 frames. Same beziers → the demo animates identically to the app.

## Hero — the retro-planning grid

The money shot, ideally sliding out of a faked HubSpot record page ("it's inside your CRM").

- **Rows** = teammates from the synced org chart (avatar + name + role).
- **Columns** = dates (J+0, J+3, J+7, J+14…), Geist Mono headers.
- **Cells** = a channel chip = a drafted, scheduled message. Empty cells are quiet dotted placeholders.
- The triggering **signal** sits at the grid's left edge with an amber pulse, the visual "cause" of the whole row.
- Header carries the hero gradient + prospect name; a live "12 touches scheduled across 4 teammates" stat sells coordination.
- **Responsive:** desktop = full matrix; mobile = the same data as a vertical per-date timeline (rows collapse into date-grouped cards) so the landing-page phone mockup stays legible.
