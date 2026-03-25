# UX Flow Design — Habit Quest

**Date:** 2026-03-25
**Status:** Approved
**Scope:** Complete app flow definition: screen inventory, navigation, campsite objects, daily/weekly interactions, and state management. No visual polish -- this is the UX skeleton.

**Reference:** `docs/GDD-frieren.md` (v4.2), `docs/superpowers/specs/2026-03-25-immersive-experience-design.md`
**Prototype:** `.superpowers/brainstorm/8854-1774450015/full-flow.html`

---

## 1. App Structure

The app has 3 modes: **Onboarding** (first time), **Campamento** (daily home), and **Domingo** (weekly ritual). There is no traditional navigation bar -- the campsite IS the navigation.

---

## 2. Onboarding (first time, 7 screens)

Sequential, no skipping. Each screen is a scene guided by Frieren's narrative voice.

| # | Screen | Content | Notes |
|---|---|---|---|
| 0 | **La llegada** | Dark screen. Typewriter text: "Toda historia empieza con una decisión." Single button. | No logo, no app name. Pure narrative. |
| 1 | **Arquetipo** | 4 cards: Guerrero, Mago, Ranger, Curandero. Esencia + description. No stats shown (purely narrative/aesthetic). | Selection pre-fills rituals in screen 3. |
| 2 | **Identidad + nombre** | "¿Quién querés ser al final de este año?" (textarea libre) + character name. | Identity declaration comes AFTER archetype so it can be informed by the choice. |
| 3 | **Misión del arco + rituales** | ONE objective area (chips pre-filled by archetype, editable). Up to 3 rituals with qué/cuándo/dónde/contingency. Defaults pre-filled + custom option. | All rituals serve the single objective. |
| 4 | **Invitar** | Link/code to invite partner, or "Viajar solo". Partner does their own onboarding. | Async -- doesn't block. |
| 5 | **Generación del mundo** | Loading with narrative steps: "Nombrando el reino... Escribiendo el primer capítulo..." | AI generates world + prologue. |
| 6 | **Prólogo** | AI-generated narrative (3-4 paragraphs). First encounter with the world. Button: "Comenzar el viaje" → Campamento. | Sets narrative tone. |

### Onboarding decisions from GDD

- Archetype is **only narrative and aesthetic** -- no mechanical advantage
- Ritual suggestions are pre-filled per archetype but 100% editable
- A second objective is only added after 60-90 days of automaticity (not in onboarding)
- Each ritual requires: what, when (time), where (place), contingency ("si no puedo")

---

## 3. Campamento (El Mundo)

The campsite is a fullscreen scene with interactive objects. No HUD, no stats overlay, no navigation bar. Clean -- inspired by DinoTaeng's world-as-interface approach.

### 3.1 Objects

| Object | Visual | Function | Tap opens |
|---|---|---|---|
| **Fogata** | Fire with logs, stones, embers (center, largest) | Register daily rituals | Overlay: ritual list with tap-to-complete |
| **Personaje (Kael)** | Character with archetype pose/weapon (upper left) | View identity + stats + ritual tracker | Overlay: single scrollable sheet with identity, stats (Poder + 4 primaries), ritual tracker with 7-day calendar |
| **Crónicas** | Book/tome (upper right) | Read story + write narrative decision | Overlay: current situation (if your turn) + scrollable newspaper "Crónicas de Valdris" with past scenes |
| **Pacto** | Sealed parchment scroll (lower left) | View weekly pact | Overlay: parchment with the 4 answers + signatures + wax seal + days remaining |
| **Frieren** | NPC near fire (conditional) | Narrative decision prompt | Takes you to write your decision (same as Crónicas write flow) |

### 3.2 Frieren NPC behavior

- **Visible + active** (notification dot pulsing): when there's a narrative decision pending (your turn, or Sunday boss)
- **Transparent/ghost** (not tappable): when it's not your turn or no decision pending
- **Tapping Frieren** goes to the same place as opening Crónicas and tapping "Escribir tu decisión" -- same destination, two entry points

### 3.3 Menu hamburger

Subtle, upper-left. Slide panel with:
- Fogata (Registrar rituales)
- [Character name] (Rituales · Stats · Identidad)
- Crónicas (Tu historia)
- Pacto (Juramento semanal)
- Nosotros (co-op, Kael & Lyra)
- Configuración

Provides text-based access to everything in the campsite + settings.

### 3.4 Sunday visual cues

On Sundays, the campsite has additional signals:
- **Crónicas** glows/has notification: cierre semanal ready to read
- After reading cierre → **Frieren** appears: boss ready
- After boss → **Pacto** glows: time to write new pact

User controls the pace -- can return to campsite between steps.

---

## 4. Daily Flow

### 4.1 Your turn

```
Open app → Campsite
         → Frieren visible (notification pulsing)
         → Register rituals at Fogata (optional, can do anytime)
         → Tap Frieren OR open Crónicas
         → Read situation (AI-generated, 3 lines max)
         → Write decision (1-2 sentences, textarea)
         → Confirm → AI generates consequence
         → Read consequence (crosses decision with stats)
         → Return to campsite
```

The situation is presented by the AI based on where the story left off yesterday (from the other player's turn). Stats from rituals registered so far influence the consequence.

### 4.2 Not your turn

```
Open app → Campsite
         → Frieren NOT visible (ghost)
         → Register rituals at Fogata
         → Open Crónicas → read yesterday's scene (what the other decided + consequence)
         → No writing prompt
         → Return to campsite
```

### 4.3 Ritual registration (Fogata)

- Tap Fogata → overlay with ritual list
- Each ritual: tap to mark done (✓)
- 2 seconds per ritual (GDD requirement)
- Feeds stats directly
- Independent of narrative writing (can register throughout the day)
- Notifications arrive at the exact time defined for each ritual

---

## 5. Sunday Flow

Always 4 steps, sequential. The boss is **always available** -- what changes is the result based on weekly stats.

### Step 1: Cierre semanal (Crónicas)

- Passive: read the AI-generated weekly closing narrative
- Tone varies by stats: celebratory (green), neutral (regular), consequences (low)
- Entry: tap Crónicas (which glows on Sunday)

### Step 2: Boss semanal (Frieren)

- **Always happens** -- every Sunday, every week
- Read the boss situation (AI-generated, more elaborate than daily)
- **Write your decision** (1-2 sentences) -- Lyra writes hers separately, can't see yours
- AI fuses decisions with 3 logics:
  - Compatible → coordinated action
  - Contradictory → stats decide which prevails
  - Opposite → conflict becomes the narrative
- **Result varies by combined weekly stats:**
  - Green: épica, satisfying victory
  - Regular: victory with cost (temporary stat penalty, recovery days)
  - Low: defeat, concrete loss that carries over to next week
- Entry: Frieren appears after reading cierre

### Step 3: Pacto (Pacto object)

- Each person answers 4 questions separately:
  1. **Obstáculos** -- what makes this week hard for your rituals?
  2. **Plan** -- how do you handle those obstacles?
  3. **Apoyo mutuo** -- how do you support each other?
  4. **Opcional** -- anything extra this week?
- Entry: Pacto object glows after boss

### Step 4: Firma

- Tap to sign your part
- Wait for the other person to complete + sign
- When both signed → AI generates narrative pact → wax seal stamps
- **Async** -- each person does their Sunday flow on their own time

### Pact states

| State | Visual |
|---|---|
| **Between weeks** (sealed) | Parchment with 4 answers, both signatures, wax seal, "X days remaining" |
| **Sunday** (flow active) | Sequential steps with progress bar |
| **Waiting for other** | Parchment written but seal is dashed outline. "Kael ✓ · Lyra pending" |

---

## 6. Personaje (Character Sheet)

Single scrollable view, no tabs. Contains:

1. **Identidad** -- the declaration from onboarding ("Soy alguien que...")
2. **Character** -- name, archetype, current arc mission + week
3. **Stats** -- Poder (derived, central ring) + VIT, STR, INT, STA (4 bars/numbers) + streak (fire days)
4. **Ritual tracker** -- each ritual with: name, time/place, individual streak, 7-day mini calendar (✓/✕/today)
5. **Add ritual** button

---

## 7. Crónicas (Story Journal)

Scrollable newspaper/book styled as "Crónicas de Valdris":

- **Header**: title + subtitle ("Pequeñas historias de un gran viaje") + current arc/week
- **Current situation** (if your turn): highlighted box with AI situation + "Escribir tu decisión" button
- **Past scenes**: reverse chronological articles, each with:
  - Day number + whose turn
  - Scene title
  - Narrative text (italic, serif)
  - Optional illustration placeholder
- Scroll to read your entire journey

---

## 8. State Variants

### Campsite states

| State | Frieren | Crónicas | Pacto |
|---|---|---|---|
| Your turn (daily) | Active + notification | Shows situation + write button | Normal (sealed) |
| Not your turn (daily) | Ghost | Shows yesterday's scene (read-only) | Normal |
| Sunday | Appears after cierre | Glows (cierre ready) | Glows after boss |
| First day | Active | "Día 1" intro text | Not yet created |
| Streak broken | Ghost (no decision change) | Normal | Normal |

### Empty states

| State | What the user sees |
|---|---|
| No rituals configured | Fogata cold/dark. Personaje prompts to add rituals. |
| No pact yet (week 1) | Pacto object is an unsigned blank parchment. |
| Partner hasn't joined | "Nosotros" shows invitation pending. Solo flow active. |
| No story yet (day 1) | Crónicas shows prologue as first entry. |

---

## 9. GDD Changes Made During This Design

| Change | Reason |
|---|---|
| **Boss is always available** (was gated by green stats) | Ensures Sunday always has active writing. Stats affect result, not access. Every Sunday is significant. |
| **Onboarding: arquetipo before identidad** | Archetype choice informs identity declaration. |
| **Grimorio replaced by character** | "Inspect your character" is more RPG than "open a book". Contains tracker + stats + identity. |
| **Espejo removed** | Stats merged into character sheet. One less object. |
| **Historial renamed to Crónicas** | More RPG/narrative feel. Styled as a newspaper/journal. |
| **Crónicas includes narrative writing** | Story reading + decision writing live in the same place. |
| **No bottom navigation bar** | Campsite objects ARE the navigation. Hamburger menu for text access. |
| **Pacto visual: sealed parchment** (was bulletin board briefly) | Aligned with GDD's "juramento" concept -- a contract, not a notice board. |
| **Frieren is NPC, not chatbot** | AI generates narrative story. Frieren is a character in it, not the responder. |

---

## 10. Screen Inventory (complete)

| # | Screen | Entry point | Type |
|---|---|---|---|
| 1 | La llegada | First open | Onboarding |
| 2 | Arquetipo | Onboarding flow | Onboarding |
| 3 | Identidad + nombre | Onboarding flow | Onboarding |
| 4 | Misión + rituales | Onboarding flow | Onboarding |
| 5 | Invitar | Onboarding flow | Onboarding |
| 6 | Generación del mundo | Onboarding flow | Onboarding |
| 7 | Prólogo | Onboarding flow | Onboarding |
| 8 | Campamento | Post-onboarding, always | Home |
| 9 | Fogata overlay | Tap fogata | Camp overlay |
| 10 | Personaje overlay | Tap character | Camp overlay |
| 11 | Crónicas overlay | Tap crónicas | Camp overlay |
| 12 | Pacto overlay | Tap pacto | Camp overlay |
| 13 | Escribir decisión | Tap Frieren / Crónicas button | Daily flow |
| 14 | Consecuencia | After writing decision | Daily flow |
| 15 | Escena de ayer (no turno) | Open Crónicas when not your turn | Daily flow |
| 16 | Cierre semanal | Crónicas on Sunday | Sunday |
| 17 | Boss — situación + escribir | After cierre | Sunday |
| 18 | Boss — resultado | After writing boss decision | Sunday |
| 19 | Pacto — 4 preguntas | After boss resultado | Sunday |
| 20 | Pacto — firma + esperar | After answering questions | Sunday |

**Total: 20 screens.**
