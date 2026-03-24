# Habit Quest — Design System Specification

**Date:** 2026-03-23
**Based on:** GDD v4.2, Brainstorming session
**Validated against:** 30 design skills + Web Interface Guidelines + anti-AI-slop research 2026
**Status:** Approved (v2 — with 7 critical fixes)

---

## Visual Direction

Genshin Impact-style anime RPG UI with Frieren tonal palette. Solid-color panels tinted by atmospheric state over CSS gradient backgrounds. Full anime-game aesthetic: archetype badges, stat bars, decorative dividers. The Frieren influence is in the TONE (contemplative, melancholic beauty) not in making it a reading app.

**Anti-AI-slop measures:**
- Subtle grain/noise texture overlay (2026 anti-perfection trend)
- Display serif font (Instrument Serif) for RPG headings — breaks generic sans-serif sameness
- Monospace font (DM Mono) for data — signals "this is a game with real numbers"
- Solid surface colors per atmospheric state — no runtime alpha compositing
- Glow effects ONLY on interactive states, never decorative
- OKLCH color space for perceptual uniformity

**References:** Persona 5 (color identity), Darkest Dungeon (decay UI), Ghost of Tsushima (reactive weather), Disco Elysium (narrative + stats), Honkai Star Rail (mobile RPG UI).

**Signature:** Atmospheric Bleed — panels are TINTED by the world state (warm hue in amanecer, cool in nublado, desaturated in niebla). The entire UI shifts mood.

---

## Color System (OKLCH)

All colors defined in OKLCH for perceptual uniformity. Chroma reduces toward light/dark extremes to avoid garish pastels or muddy darks. All neutrals tinted toward hue 260 (cool blue) with chroma 0.01-0.015 for brand cohesion.

### Core Palette

**Gold — Primary / UI Chrome (Himmel flashbacks = achievement)**

| Token | OKLCH | Use |
|-------|-------|-----|
| gold-100 | oklch(0.94 0.06 85) | Light gold highlights |
| gold-200 | oklch(0.86 0.12 85) | Bright gold, button gradient stop |
| gold-400 | oklch(0.80 0.13 85) | Primary gold, headers, borders |
| gold-500 | oklch(0.72 0.13 85) | Deep gold, button gradient start |
| gold-600 | oklch(0.62 0.11 85) | Muted gold, inactive states |
| gold-800 | oklch(0.48 0.08 85) | Dark gold, subtle accents |

**Lavender — Narrative / Identity (Frieren's signature color)**

| Token | OKLCH | Use |
|-------|-------|-----|
| lav-100 | oklch(0.90 0.05 300) | Lightest lavender |
| lav-200 | oklch(0.78 0.08 300) | Narrative text, light accent |
| lav-400 | oklch(0.64 0.12 300) | Primary lavender |
| lav-500 | oklch(0.54 0.12 300) | Deep lavender, chapter markers |
| lav-600 | oklch(0.44 0.10 300) | Muted lavender |
| lav-800 | oklch(0.32 0.08 300) | Dark lavender |

**Emerald — Magic / Success (Frieren's Zoltraak spell = progress)**

| Token | OKLCH | Use |
|-------|-------|-----|
| em-100 | oklch(0.90 0.06 160) | Light green |
| em-200 | oklch(0.78 0.10 160) | Medium green |
| em-400 | oklch(0.70 0.14 160) | Primary emerald |
| em-500 | oklch(0.62 0.14 160) | Deep emerald |
| em-600 | oklch(0.52 0.12 160) | Muted emerald |
| em-800 | oklch(0.38 0.08 160) | Dark emerald |

**Blue-Grey — Base / Backgrounds (tinted hue 260)**

| Token | OKLCH | Use |
|-------|-------|-----|
| bg-100 | oklch(0.87 0.01 260) | Primary text (bone) |
| bg-300 | oklch(0.72 0.01 260) | Strong text |
| bg-400 | oklch(0.60 0.01 260) | Secondary text (ash) |
| bg-500 | oklch(0.42 0.01 260) | Tertiary elements |
| bg-700 | oklch(0.24 0.01 260) | Elevated surfaces (mist) |
| bg-800 | oklch(0.17 0.015 260) | Base surfaces |
| bg-950 | oklch(0.11 0.015 260) | App background (dusk) |

### Semantic Tokens (Frieren world names)

| Token | Maps to | Meaning |
|-------|---------|---------|
| --himmel | gold-400 | Primary actions, achievement, golden memories |
| --frieren | lav-400 | Narrative, contemplation, identity |
| --zoltraak | em-400 | Magic, success, completion |
| --decay | #e05c5c | Danger, stat loss, broken streaks |
| --warning | #d4a844 | Low stats, risky decisions |
| --info | #5a8cc8 | Turn indicators, tooltips |
| --dusk | bg-950 | App canvas background |
| --mist | bg-800 | Surface panels |
| --ash | bg-400 | Secondary/tertiary text |
| --bone | bg-100 | Primary text |

### Archetype Colors

| Archetype | Color | Hex |
|-----------|-------|-----|
| Guerrero ⚔️ | Red | #e0503c |
| Mago 🧙 | Blue | #6482d2 |
| Ranger 🏹 | Green | #4eaa64 |
| Curandero 🌿 | Amber | #c8aa5a |

### Foreground/Background Pairs (CRITICAL)

Every background token MUST have a paired foreground token.

| Background | Foreground | Contrast |
|-----------|-----------|----------|
| --primary (gold-400) | --primary-foreground (bg-950) | ~8:1 |
| --secondary (lav-400) | --secondary-foreground (lav-100) | ~6:1 |
| --destructive (oklch 0.60 0.20 25) | --destructive-foreground (oklch 0.95 0.03 25) | ~7:1 |
| --success (em-400) | --success-foreground (oklch 0.15 0.03 160) | ~7:1 |
| --warning (oklch 0.70 0.15 85) | --warning-foreground (oklch 0.15 0.05 85) | ~8:1 |
| --card (bg-800) | --card-foreground (bg-100) | ~7:1 |
| --muted-bg (bg-700) | --muted-foreground (bg-400) | ~4.5:1 AA |
| --popover (bg-700) | --popover-foreground (bg-100) | ~7:1 |

### Glow Tokens (Interactive States ONLY)

Glow is NOT decorative. It only appears on :hover, :active, :focus, and brief completion flashes. Never on default/resting state.

```css
--glow-gold-interactive: 0 0 8px oklch(0.72 0.13 85 / 0.2);
--glow-zoltraak-interactive: 0 0 8px oklch(0.70 0.14 160 / 0.15);
```

### Grain Texture Overlay

Subtle SVG noise at 2.5% opacity, fixed position, covers entire viewport. Breaks AI-generated visual perfection.

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,...feTurbulence...");
  background-size: 200px;
}
```

---

## Atmospheric States

The full background of El Mundo changes based on combined player performance. CSS gradients, no images (Phase 6 adds generated images).

### Amanecer (both doing well)

- Background: warm dark golds, radial golden light from top
- Panel tint: warm (rgba 24,20,10)
- Gold elements: full brightness + glow
- Tab bar tint: warm (rgba 12,10,6)
- Transition: gradual over 3-5 seconds

### Nublado (one struggling)

- Background: cool blue-grey, subtle lavender tint
- Panel tint: cool (rgba 18,22,30)
- Gold replaced by lavender on streak counter
- Tab bar: neutral dark

### Niebla (both struggling)

- Background: deep desaturated grey
- Panel tint: cold, more opaque (0.8 vs 0.6)
- All colors desaturate: icon opacity drops, text mutes
- CTA loses gold gradient → ghost button
- Tab bar active icon grey (not gold)
- Heavier drop shadows (0.3 opacity)
- Decay warnings appear inline

### Vínculo (bond scene)

- Background: deep purple-black with lavender + gold radials
- ALL UI disappears. No tab bar, no nameplate, no buttons.
- Only narrative text + image/video

### Implementation

CSS custom properties on `<body>` change with state: `--atmo-tint`, `--atmo-warmth`, `--atmo-opacity`. All surfaces reference these variables.

---

## Surface System

Explicit solid colors per atmospheric state. NO runtime alpha compositing on Surface 1. Backdrop-blur ONLY on Surface 2/3 (elevated panels, popovers, modals).

### Surface 1 — Solid Colors Per State (no blur)

| State | OKLCH | Hue | Chroma |
|-------|-------|-----|--------|
| Amanecer | oklch(0.16 0.02 85) | Warm (85) | Medium (0.02) |
| Nublado | oklch(0.15 0.015 260) | Cool (260) | Low (0.015) |
| Niebla | oklch(0.13 0.005 260) | Cool (260) | Very low (0.005) |
| Vínculo | oklch(0.14 0.03 300) | Purple (300) | Medium (0.03) |

### Surface 2/3 — With Backdrop Blur (elevated only)

| Level | Background | Blur | Border | Use |
|-------|-----------|------|--------|-----|
| Surface 2 | state-tinted at 80% | blur(16px) | border-default | Situation panel, popovers |
| Surface 3 | state-tinted at 85% | blur(20px) | border-gold | Premium/focus panels |

**Key principle:** Surface 1 (the majority of panels) uses SOLID colors that change hue with atmospheric state. This is the Atmospheric Bleed signature — warm hue in amanecer, cool in nublado, desaturated in niebla. Only elevated panels (Surface 2/3) use blur for functional "floating" effect.

---

## Text Hierarchy

| Token | Value | Weight | Use |
|-------|-------|--------|-----|
| --text-primary | #d4d6dc | 400-700 | Headings, names, stat values |
| --text-secondary | #a8abb2 | 400 | Body text, descriptions |
| --text-tertiary | #6b6e78 | 400-500 | Metadata, timestamps, captions |
| --text-muted | #44474f | 400 | Disabled, placeholder, inactive |
| --text-narrative | #c4b3e2 | 300 | AI-generated scene text only |
| --text-gold | #e2c67e | 600-700 | Stat numbers, chapter titles |

---

## Typography

**Three font families with strict roles:**

| Font | Role | Why |
|------|------|-----|
| **Instrument Serif** | Display: chapter titles, archetype names, screen titles, narrative headers | Elegant serif with calligraphic quality. Evokes medieval European fantasy through Japanese aesthetics. Breaks generic sans-serif AI sameness. |
| **Plus Jakarta Sans** | Body/UI: labels, descriptions, buttons, captions, metadata | Clean, distinctive sans-serif. Better than Inter/Roboto but not so unusual that it hurts readability. |
| **DM Mono** | Data: stat numbers, streak counters, timers, XP values | Monospace with tabular-nums for proper data alignment. Signals "this is game data." |

### Type Scale

| Role | Font | Size | Weight | Tracking | Notes |
|------|------|------|--------|----------|-------|
| Display | Instrument Serif | 26px | 400 | 0.5px | Chapter titles, gold color |
| H1 | Instrument Serif | 22px | 400 | — | Screen titles |
| H2 | Plus Jakarta Sans | 17px | 600 | — | Section headers |
| Narrative | Plus Jakarta Sans | 14-15px | 300 | — | line-height: 1.9 (dark mode +0.05), lav-200 color |
| Body | Plus Jakarta Sans | 14px | 400 | — | Descriptions, min 16px on mobile (rem) |
| Caption | Plus Jakarta Sans | 12px | 500 | — | Metadata |
| Label | Plus Jakarta Sans | 10px | 700 | 2px uppercase | UI labels |
| Stat | DM Mono | 13px | 500 | — | tabular-nums, gold color |

### Rules
- Narrative text: PJS weight 300 + lav-200 color + line-height 1.9 (extra 0.05 for dark backgrounds)
- Stat numbers: DM Mono + tabular-nums + gold
- Chapter titles: Instrument Serif + italic for extra character
- Archetype names: Instrument Serif italic + archetype color
- Labels: PJS uppercase + letter-spacing 2px
- `text-wrap: balance` on headings
- All sizes in rem, not px
- `font-display: swap` on all web fonts with metric-matched fallbacks

---

## Border System

Explicit OKLCH colors, not rgba alpha (avoids unpredictable contrast on tinted surfaces).

| Token | OKLCH | Use |
|-------|-------|-----|
| --border-subtle | oklch(0.22 0.01 260) | Dividers within panels |
| --border-default | oklch(0.26 0.01 260) | Panel edges, card borders |
| --border-strong | oklch(0.32 0.01 260) | Hover states, input borders |
| --border-gold | oklch(0.40 0.06 85) | Premium surfaces, pact cards |
| --border-focus | oklch(0.55 0.12 300) | Focus-visible rings (Frieren lavender) |

---

## Form Controls

Dedicated tokens separate from surface tokens. Inputs feel "inset" (darker than surroundings).

| Token | OKLCH | Use |
|-------|-------|-----|
| --control-bg | oklch(0.10 0.015 260) | Input/textarea background (inset, darker) |
| --control-border | oklch(0.28 0.01 260) | Default input border |
| --control-border-hover | oklch(0.34 0.01 260) | Hover |
| --control-border-focus | oklch(0.55 0.10 85) | Focus (gold) |
| --control-border-error | oklch(0.50 0.15 25) | Validation error |
| --control-placeholder | oklch(0.30 0.01 260) | Placeholder text (4.5:1 contrast on dark) |

**Rules:** Labels always visible (never placeholder-only). Placeholders end with `…`. Inset shadow (`inset 0 2px 4px oklch(0 0 0 / 0.15)`) for "recessed" feel. Gold focus border. `inputmode` set correctly. `spellcheck="true"` on narrative fields. Never block paste.

---

## Components

### Buttons

| Variant | Background | Text | Border | Glow |
|---------|-----------|------|--------|------|
| Primary (gold) | 3-stop gradient (deep→base→bright) | --dusk | none | --glow-gold-strong |
| Outline (gold) | transparent | --himmel | gold-500 | none |
| Ghost | rgba(255,255,255,0.06) | --text-primary | none | none |
| Danger | rgba(decay, 0.15) | --decay | decay at 0.2 | none |

**States:** Default, hover (lighter gradient), active (scale 0.98), focus-visible (lavender ring), disabled (gold at 20% opacity), loading (spinner).

### Conduct Pills

| State | Background | Text | Border | Icon |
|-------|-----------|------|--------|------|
| Pending | rgba white 0.02 | text-tertiary | border-default | Circle outline |
| Done | rgba zoltraak 0.08 | zoltraak | zoltraak 0.15 | Checkmark SVG |
| Missed | rgba decay 0.06 | decay 0.6 | decay 0.1 | X SVG |

Tappable (pending → done). Scale 0.97 on active. Zoltraak glow on done.

### Stat Bars

HP-bar style, 0-100. Color by tier:
- 75-100: emerald gradient
- 50-74: gold gradient
- 25-49: amber/warning gradient
- 0-24: red/danger gradient

Track: rgba of bar color at 0.1. Height: 8px. Border-radius: 4px. Animate width on reveal.

### Character Nameplate

Archetype icon (SVG in colored container with glow) + name + "ARCHETYPE · DÍA N". Surface 1 panel styling. Non-breaking spaces in metadata.

### Streak Counter

Fire SVG icon (filled semitransparent + stroked). Number in tabular-nums gold. Gold glow on container. Turns red when broken (0 days).

### Chapter Marker

Diamond ornament + lines: `line — ◇ — CAPÍTULO VII — line`. Lavender color.

### Day Type Badges

- Normal: grey bg, grey text
- Decisión: gold bg, gold text, sun SVG icon
- Weekly Boss: decay bg, decay text, skull SVG icon

### Pact Card

Surface 2 + gold border. Scroll SVG icon. Signed status with gold checkmarks. Days remaining in tabular-nums.

### Stat Gain Toast

Slides up from bottom. Emerald bg. "✦ VIT +3 — Desayuno registrado". Holds 2s, fades out. `aria-live="polite"`.

---

## Navigation

Bottom tab bar, 4 tabs. Fixed. SVG icons (Phosphor-style).

| Tab | Icon | Active color |
|-----|------|-------------|
| Mundo | Sword | Gold (amanecer), grey (niebla) |
| Historial | Book | Gold |
| Nosotros | Two people | Gold |
| Stats | Chart bars | Gold |

Active: fill weight icon + gold color. Inactive: regular weight + text-muted.

`padding-bottom: max(8px, env(safe-area-inset-bottom))` for safe area.

---

## Spacing

Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Context | Value |
|---------|-------|
| Screen side padding | 14-16px |
| Card internal padding | 14-18px |
| Between major sections | 32px |
| Between related elements | 8-12px |
| Tab bar height | ~56px + safe area |
| Button min-height | 44px |
| Pill min-height | 36px |
| Max content width | 480px (centered on tablet+) |

---

## Motion

Framer Motion. Contemplative pace for narrative, snappy for interactions.

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| Instant | 100ms | ease-out | Conduct tap, pill state |
| Quick | 200ms | ease-out | Hover, tooltip, stat toast |
| Normal | 300ms | ease-out-quart | Panel slide, tab switch |
| Slow | 800ms | ease-in-out | Atmospheric transition |
| Narrative | 1200-2000ms | spring(0.4,0,0.2,1) | Text reveal, scene transition |

**Spring configuration — NO BOUNCE:**
```
// Critically-damped spring (no overshoot)
type: "spring", stiffness: 300, damping: 30, mass: 1

// OR duration-based with ease-out-expo
type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1]
```
NEVER use default Framer Motion springs (they bounce). NEVER use elastic/bounce easing.

**Animation frequency rule (Rauno Freiberg):**

| Frequency | Action | Animation Level |
|-----------|--------|----------------|
| Very high (3x/day) | Conduct tap ✓ | Minimal: color change + scale 0.97, 100ms. NO glow. |
| High (daily) | Open app, read scene | Moderate: stagger fade-in 30ms/item, typewriter |
| Medium (weekly) | Boss, pact seal | Rich: stamp animation, gold glow, stagger |
| Low (monthly/rare) | Arc close, bond, world gen | Theatrical: full atmospheric shift, slow reveals |

**Key animations:**
- Typewriter: 30ms/char for narrative text
- Conduct tap: scale 0.97 + color change, 100ms. Async, never blocks. NO glow, NO particles.
- Stat gain toast: slide up (transform only), hold 2s, fade out
- Stats panel: slide down, bars animate width 0→value
- Atmospheric shift: crossfade over 3-5 seconds
- Pact seal: scale 1.3→1.0 with rotation (weekly = rich animation justified)
- Bond scene: UI fades to black → lavender glow → text slowly (rare = theatrical justified)
- Stagger: list items enter with 30-50ms delay, capped at 500ms total
- Scale feedback: 0.97 on press for buttons/cards
- Exit animations: 70% of enter duration
- Only animate transform and opacity. Never width/height/padding/margin.

**prefers-reduced-motion:** All animations instant. Typewriter skips. No transitions. Grain texture hidden.

---

## Icons

**Library:** Phosphor Icons (`@phosphor-icons/react`) + custom SVG for unique elements.

**Weight usage:**
- Regular: inactive tab icons, secondary UI
- Duotone: stat icons, archetype badges, decorative RPG
- Fill: active tab, selected states, completed
- Bold: emphasis in dense layouts

**Icon map:**

| Icon | Phosphor name | Use |
|------|--------------|-----|
| Sword | Sword | STR stat, Guerrero, Mundo tab |
| Heart | Heart | VIT stat |
| Brain | Brain | INT stat |
| Lightning | Lightning | STA stat |
| Shield | ShieldCheck | Streak shield |
| Scroll | Scroll | Pact |
| Skull | Skull | Weekly boss |
| Fire | Fire | Active streak |
| Sun | Sun | Amanecer state |
| Cloud | Cloud | Nublado state |
| CloudFog | CloudFog | Niebla state |
| Sparkle | Sparkle | Vínculo/bond |
| Target | Target | Ranger, quests |
| Leaf | Leaf | Curandero |
| Crown | Crown | Arc completion |
| BookOpen | BookOpen | Historial tab |
| ChartBar | ChartBar | Stats tab |
| UsersThree | UsersThree | Nosotros tab |
| Check | Check | Ritual done |
| X | X | Ritual missed |
| CaretLeft | CaretLeft | Back navigation |
| Warning | Warning | Decay alert |

**Rule:** No emojis as icons in production. SVG only.

---

## Responsive Strategy

**Mobile-first. Phone frame approach.**

```css
.app-shell {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh; /* dvh, not vh */
}

body {
  background: var(--atmo-gradient);
  background-attachment: fixed;
}
```

Atmospheric background fills entire viewport. Content centered in 480px shell.

**Input detection:**
```css
@media (pointer: coarse) { /* Touch: larger targets */ }
@media (pointer: fine) { /* Mouse: enable hover */ }
@media (hover: none) { /* Use :active instead of :hover */ }
```

---

## Accessibility

- `color-scheme: dark` on `<html>`
- `<meta name="theme-color" content="#0c0e14">`
- `viewport-fit=cover` + safe area padding
- `touch-action: manipulation` on html
- Focus-visible rings: 2px solid lavender, offset 2px
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on stat gain toasts
- `role="progressbar"` + `aria-valuenow` on stat bars
- Roving tabindex on tab bar
- Skip link to main content
- Heading hierarchy: h1→h2→h3 (no skip)
- Stat bar colors: never color-only (label + number always present)

---

## Copy Rules

- Use `…` (ellipsis character) not `...`
- Use curly quotes `"` `"` in narrative text
- Non-breaking spaces: `+3 VIT`, `12 días`, `Día 47`
- `font-variant-numeric: tabular-nums` on all numbers
- Button labels specific: "El reino toma nota" not "Enviar"
- Error messages include next step
- Loading states end with `…`
- Active voice

---

## Empty / Loading / Error States

### Loading
Skeleton screens with pulse animation. Shapes match content layout.

### Empty (no data yet)
Archetype icon at 30% opacity + explanatory text + guidance on what to do next.

### Error (API failure)
Red-tinted panel. Specific message ("No se pudo generar la escena"). Next step included ("Tus rituales se registraron correctamente"). Retry button.

---

## Screens (Phase 1 — Visual Shells)

### Onboarding 1: La Llegada
Black (#030305). Typewriter text: "Toda historia empieza con una decisión." Diamond ornament divider. Gold CTA with glow. No nav.

### Onboarding 2: Identidad
Two form fields (identity + character name). Labels visible. Progress dots (expanded = active). Disabled CTA until both fields filled.

### Onboarding 3: Arquetipo
2x2 grid. SVG archetype icons in colored containers with glow. Selected: archetype border + scale 1.02 + tinted bg. Stat weight tags. Stagger entrance.

### Onboarding 4: Misión y Rituales
Objective selector + up to 3 ritual quest-cards. Pre-filled by archetype. Dashed borders for empty slots. Time fields with tabular-nums.

### Onboarding 5: Invitar
Email/link input. "Toda historia necesita dos protagonistas." Skip option for solo.

### El Mundo: Tu Turno
Full atmospheric background. Nameplate (left) + streak (right). Chapter marker with diamond. Narrative panel (Surface 1, atmospheric tint). Day type badge. Ritual pills (tappable). Pact mini. Gold CTA.

### El Mundo: No Es Tu Turno
Atmospheric shift to cooler tones. Yesterday's scene ("ESCENA DE AYER — TURNO DE LYRA"). Ritual pills still tappable. Muted CTA: "Mañana es tu turno."

### Decisión Narrativa
Back arrow + title. Situation panel (Surface 2, gold left-accent bar). Ritual completion status. Decision textarea (gold focus border). "El reino toma nota" CTA.

### Niebla State
Everything desaturates. Icons at 50% opacity. CTA loses gold → ghost. Heavier shadows. Decay warning inline. Red ritual pills with X. Streak shows 0 in red.
