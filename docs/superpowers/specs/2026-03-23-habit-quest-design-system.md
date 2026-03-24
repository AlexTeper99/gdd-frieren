# Habit Quest — Design System Specification

**Date:** 2026-03-23
**Based on:** GDD v4.2, Brainstorming session
**Status:** Approved

---

## Visual Direction

Genshin Impact-style anime RPG UI with Frieren tonal palette. Semi-transparent panels floating over atmospheric CSS backgrounds. Full anime-game aesthetic: decorative borders, glow effects, archetype badges, stat bars. The Frieren influence is in the TONE (contemplative, melancholic beauty) not in making it a reading app.

**References:** Persona 5 (color identity), Darkest Dungeon (decay UI), Ghost of Tsushima (reactive weather), Disco Elysium (narrative + stats), Honkai Star Rail (mobile RPG UI).

**Signature:** Atmospheric Bleed — panels don't just float over the background, they are TINTED by it. The entire UI shifts mood with the world state.

---

## Color System

### Core Palette

**Gold — Primary / UI Chrome (Himmel flashbacks = achievement)**

| Token | Hex | Use |
|-------|-----|-----|
| gold-100 | #fdf0d0 | Light gold highlights |
| gold-200 | #f5d98a | Bright gold, button gradient stop |
| gold-400 | #e2c67e | Primary gold, headers, borders |
| gold-500 | #c9a84c | Deep gold, button gradient start |
| gold-600 | #a38a3a | Muted gold, inactive states |
| gold-800 | #7a6728 | Dark gold, subtle accents |

**Lavender — Narrative / Identity (Frieren's signature color)**

| Token | Hex | Use |
|-------|-----|-----|
| lav-100 | #e8dff5 | Lightest lavender |
| lav-200 | #c4b3e2 | Narrative text, light accent |
| lav-400 | #9b87c8 | Primary lavender |
| lav-500 | #7b68a8 | Deep lavender, chapter markers |
| lav-600 | #5c4d82 | Muted lavender |
| lav-800 | #3d3358 | Dark lavender |

**Emerald — Magic / Success (Frieren's Zoltraak spell = progress)**

| Token | Hex | Use |
|-------|-----|-----|
| em-100 | #d4f0e0 | Light green |
| em-200 | #7eccaa | Medium green |
| em-400 | #4db882 | Primary emerald |
| em-500 | #2e9e68 | Deep emerald |
| em-600 | #237a50 | Muted emerald |
| em-800 | #1a5c3b | Dark emerald |

**Blue-Grey — Base / Backgrounds**

| Token | Hex | Use |
|-------|-----|-----|
| bg-100 | #d4d6dc | Primary text (bone) |
| bg-400 | #8b8e96 | Secondary text (ash) |
| bg-500 | #55585f | Tertiary elements |
| bg-700 | #2a2d36 | Elevated surfaces (mist) |
| bg-800 | #1a1c24 | Base surfaces |
| bg-950 | #0c0e14 | App background (dusk) |

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

### Glow Tokens

```css
--glow-gold: 0 0 20px rgba(226,198,126,0.15), 0 0 40px rgba(226,198,126,0.05);
--glow-gold-strong: 0 0 12px rgba(226,198,126,0.25), 0 0 30px rgba(226,198,126,0.1);
--glow-zoltraak: 0 0 12px rgba(77,184,130,0.2), 0 0 24px rgba(77,184,130,0.06);
--glow-frieren: 0 0 12px rgba(155,135,200,0.15), 0 0 24px rgba(155,135,200,0.05);
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

Genshin-style semi-transparent panels. Always let atmospheric background show through.

| Level | Background | Blur | Border | Use |
|-------|-----------|------|--------|-----|
| Surface 1 | bg-800 at 65-75% | blur(12px) | border-default | Base panels, narrative |
| Surface 2 | bg-700 at 75-80% | blur(16px) | border-default | Elevated panels, situation |
| Surface 3 | bg-600 at 80-85% | blur(20px) | border-gold | Premium/focus panels |

All surfaces include: `inset 0 1px 0 rgba(255,255,255,0.03)` for subtle top highlight + external drop shadow.

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

**Font:** Plus Jakarta Sans (single family for everything).

| Role | Size | Weight | Tracking | Notes |
|------|------|--------|----------|-------|
| Display | 28px | 700 | 0.5px | Chapter titles, gold color |
| H1 | 22px | 700 | — | Screen titles |
| H2 | 17px | 600 | — | Section headers |
| Narrative | 14-15px | 300 | — | line-height: 1.85, lavender color |
| Body | 14px | 400 | — | Descriptions |
| Caption | 12px | 500 | — | Metadata |
| Label | 10px | 700 | 2px uppercase | UI labels |
| Stat | 13px | 600 | — | tabular-nums, gold color |

**Rules:**
- Narrative text: weight 300 + lav-200 color + line-height 1.85
- Stat numbers: tabular-nums + gold
- Labels: uppercase + letter-spacing 2px
- Never italic for emphasis — use color or weight
- `text-wrap: balance` on headings

---

## Border System

| Token | Value | Use |
|-------|-------|-----|
| --border-subtle | rgba(255,255,255, 0.04) | Dividers within panels |
| --border-default | rgba(255,255,255, 0.07) | Panel edges, card borders |
| --border-strong | rgba(255,255,255, 0.12) | Hover states, input borders |
| --border-gold | rgba(226,198,126, 0.15) | Premium surfaces, pact cards |
| --border-focus | rgba(155,135,200, 0.5) | Focus-visible rings (lavender) |

---

## Form Controls

| Token | Value | Use |
|-------|-------|-----|
| --control-bg | rgba(12, 14, 20, 0.6) | Input/textarea background (inset) |
| --control-border | rgba(255,255,255, 0.1) | Default input border |
| --control-border-hover | rgba(255,255,255, 0.18) | Hover |
| --control-border-focus | rgba(226,198,126, 0.4) | Focus (gold) |
| --control-border-error | rgba(224, 92, 92, 0.5) | Validation error |
| --control-placeholder | #44474f | Placeholder text |

**Rules:** Labels always visible (never placeholder-only). Placeholders end with `…`. Inset shadow on inputs for "recessed" feel. Gold focus border.

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

**Key animations:**
- Typewriter: 30ms/char for narrative text
- Conduct tap: scale 1.05 → emerald flood → scale back (async, never blocks)
- Stat gain toast: slide up, hold 2s, fade out
- Stats panel: slide down, bars animate 0→value
- Atmospheric shift: crossfade over 3-5 seconds
- Pact seal: scale 1.3→1.0 with rotation
- Bond scene: UI fades to black → lavender glow → text slowly
- Stagger: list items enter with 30-50ms delay each
- Scale feedback: 0.97-0.98 on press for buttons/cards
- Exit faster than enter (60-70% of enter duration)

**prefers-reduced-motion:** All animations instant. Typewriter skips. No transitions.

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
