# Immersive Experience Design — Habit Quest

**Date:** 2026-03-25
**Status:** Approved
**Scope:** Visual direction, 3D architecture, screen mapping, and interaction design for an Awwwards-level immersive experience inspired by Frieren.

---

## 1. Vision

Habit Quest is not a traditional app. It is an immersive world the user lives inside. Every session feels like entering an isekai — a persistent, atmospheric 3D environment where rituales, stats, and narrative exist as tangible objects in a campsite the user calls home.

The experience is **constantly immersive** — not just during onboarding, but in every interaction.

---

## 2. Technical Stack

| Layer | Technology | Role |
|---|---|---|
| 3D rendering | `@react-three/fiber` + `@react-three/drei` | Canvas world (persistent fullscreen) |
| 3D modeling | Blender → GLTF/GLB with Draco compression | Isometric diorama scenes |
| Complex animation | GSAP + ScrollTrigger | Timelines, camera movement, text reveals, transitions |
| Micro-interaction | Framer Motion (existing) | UI hover, tap, layout shifts |
| Post-processing | `@react-three/postprocessing` | Bloom, DoF, vignette, grain, color grading, chromatic aberration, SMAA |
| Scroll sync | Lenis | Journey map (Historial) horizontal scroll + Grimorio page swipe |
| Audio | Howler.js | Ambient layers, spatial audio, interaction SFX |
| UI overlay | React DOM | HUD stats, narrative box, action buttons — floats over canvas |

### New dependencies required

```
@react-three/fiber @react-three/drei @react-three/postprocessing
three
gsap (with ScrollTrigger, SplitText plugins)
lenis
howler
```

### Animation boundary: GSAP vs Framer Motion

| GSAP owns | Framer Motion owns |
|---|---|
| Camera movement (zoom, pan, fly-through) | UI component hover/tap states |
| Master timelines (awakening, Sunday ritual) | Layout animations (card appear/disappear) |
| Text reveals (SplitText typewriter) | Modal/sheet transitions |
| Scene transitions (campsite ↔ map) | Stat bar fill animations |
| Scroll-linked animations (journey map) | HUD chip enter/exit |
| Post-processing uniform tweens | Button press feedback |

The design system's existing motion tokens (spring configs, 30ms typewriter) remain valid for Framer Motion micro-interactions. GSAP handles anything that involves the 3D scene, camera, or coordinated multi-element timelines.

### Camera system

- **Campsite view:** `OrthographicCamera` for true isometric feel. Fixed position, no user pan/orbit. Objects are tap targets on the fixed view.
- **Fogata zoom-in:** GSAP tweens camera position + zoom factor. Campsite objects fade except fire area.
- **Mapa (Historial):** Camera transitions to top-down orthographic. User scrolls horizontally (Lenis) to navigate the journey path.
- **Cinematic moments (Boss, Level Up):** Temporarily switches to `PerspectiveCamera` with low FOV for dramatic depth. GSAP controls camera path along a spline.
- **Awakening sequence:** `PerspectiveCamera` with animated FOV + blur. Transitions to OrthographicCamera at end.

### Responsive strategy

The design system's `max-width: 480px` constraint applies to **Layer 4 (DOM overlay) only**. The Three.js canvas is always fullscreen. On desktop, the DOM HUD elements are constrained to a centered 480px column while the 3D world fills the viewport — creating a "phone in a world" effect that actually enhances the immersion.

### Accessibility

- All campsite objects have screen-reader accessible labels via `aria-label` on invisible DOM overlay hit targets that mirror the 3D object positions
- Keyboard navigation: Tab cycles through campsite objects (Fogata → Grimorio → Espejo → Mapa → Pergamino), Enter activates
- `prefers-reduced-motion`: disables all particle systems, disables camera animations (instant cuts), disables post-processing effects, keeps static scene visible
- Audio cues always have visual equivalents (object glow states communicate same information as spatial audio)
- Minimum WebGL requirement: WebGL 2.0. Devices without WebGL get a graceful fallback: static illustrated backgrounds (AI-generated) with standard DOM UI on top. Functional but not immersive.

### Asset pipeline

1. Model in Blender (low-poly stylized)
2. Bake lighting, AO, shadows into texture atlas
3. Export as `.glb` with Draco compression (50-70% lighter)
4. Textures at power-of-2 resolutions (256, 512, 1024)
5. AI-generated illustrations (Midjourney/Flux) for backgrounds, character art, narrative scenes — consistent anime/watercolor style

---

## 3. Architecture — 4-Layer Rendering

All WebGL layers live in a single `@react-three/fiber` Canvas. The separation is logical (scene groups), not physical (multiple canvases).

```
┌─────────────────────────────────────┐
│  Layer 4: UI Overlay (React DOM)    │  Stats, buttons, narrative, modals
│  pointer-events: none (auto on els) │  Framer Motion for interactions
├─────────────────────────────────────┤
│  Layer 3: Arcane Effects (WebGL)    │  Runes, magic circles, energy trails
│  Activates by context              │  Custom GLSL shaders
├─────────────────────────────────────┤
│  Layer 2: Particles (WebGL)         │  Fireflies, petals, dust, embers
│  Always present, intensity varies   │  PointsMaterial + simplex noise
├─────────────────────────────────────┤
│  Layer 1: World (WebGL)             │  Campsite, map, scenes
│  Fullscreen persistent canvas       │  Baked lighting + 1-2 dynamic lights
└─────────────────────────────────────┘
```

---

## 4. Three Atmospheric Layers

The atmosphere shifts based on **what the user is doing**, not just decoratively.

| Context | Dominant Layer | Description |
|---|---|---|
| Idle / navigating | **Ethereal** | Fireflies, soft light, the world breathes. Calm. |
| Registrar rituales / Frieren speaks | **Arcane** | Runes appear, magic circles, energy trails, light shifts. |
| Boss semanal / level up / arc close | **Cinematic** | Camera movement, parallax, depth of field, dramatic lighting. |

---

## 5. Day/Night Cycle

The campsite changes based on the user's **real local time**. Transition between states: 3-5 seconds.

| Time | Sky | Light Temp | Particles | Mood |
|---|---|---|---|---|
| 0-6h (Night) | Stars visible, dark | 2200K | Fireflies bright, few | Intimate, melancholic |
| 6-9h (Dawn) | Coral/amber, low fog | 3500K | Mist, birds | Awakening |
| 9-17h (Day) | Clear blue-green | 5500K | Leaves, dust motes | Active, clear |
| 17-21h (Dusk) | Red/violet dramatic | 2800K | Embers, warm glow | Melancholic, reflective |
| 21-0h (Evening) | Deep blue/purple | 2400K | Fireflies return | Winding down |

Controlled via: `Intl.DateTimeFormat` (user's local timezone) → shader uniforms (sky gradient, fog color/density, light temperature, particle intensity, star visibility).

**Composition with performance-based atmospheric states (GDD):** The GDD defines atmospheric states based on player performance (Amanecer, Nublado, Niebla, Vínculo). These two systems compose as layers: **day/night cycle controls lighting and sky**, while **performance-based atmosphere controls color saturation, particle type, and mood overlay**. Example: 9am + Niebla = daytime lighting (5500K) but desaturated, grey fog, muted particles. The day/night cycle is the base; performance atmosphere is a modifier on top.

---

## 6. Screen Mapping — Campsite Objects to GDD Functions

### 6.1 Campsite Objects (within "El Mundo" tab)

| Object | GDD Function | Interaction |
|---|---|---|
| **Fogata** | Registrar rituales + Decisión narrativa + Consecuencia | Tap → camera zoom in, "sit down". Ritual cards float around fire. Tap card = registrado (glow + particles). Fire intensity grows with each completed ritual. After taps → writing prompt → Frieren responds. |
| **Grimorio** | View/edit rituales (new, not in GDD) | Tap → book opens with page-flip animation. Each ritual = a page. Swipe to browse. Edit/add/remove rituales. Active rituales have floating runes. |
| **Espejo** | Stats (VIT/STR/INT/STA/Poder/Racha) | Tap → liquid reflection shader effect. Stats revealed as radial display. Reflects current atmospheric state. Sparkles on level up. |
| **Pergamino del Pacto** | Pacto semanal + Boss (Sunday ritual, 4 sequential scenes) | Sundays: pergamino glows. Tap → unfurl animation. 4 scenes: Cierre → Boss → Pacto → Firma (drag gesture + wax seal). |
| **Mapa** | Historial (AI-generated scenes by month) | Tap → camera zoom out to top-down journey map. Each node = a past narrative scene. Path between nodes = days. Zones = monthly arcs (landscape changes). Tap node = re-read scene. Current position pulses. |
| **Frieren (NPC)** | Narrative triggers | Appears near fire when there's a pending trigger. Tap → dialogue with typewriter text. Arcane layer activates. Sometimes seen reading or looking at the sky (idle states). |

### 6.2 Tab Navigation (GDD alignment)

| GDD Tab | Implementation |
|---|---|
| **Mundo** | Isometric campsite (Fogata, Grimorio, Espejo, Pergamino, Frieren NPC) |
| **Historial** | Journey map — same view as tapping the Mapa object in campsite. The Mapa object is a shortcut; the Historial tab is the canonical entry point. One implementation, two entry points. |
| **Stats** | Espejo (also accessible from HUD shortcut) |
| **Nosotros** | Co-op dashboard — future, not MVP |

### 6.3 Object Visual States

**Fogata:**
- Burning bright = rituales pendientes
- Warm embers = rituales registrados hoy
- Cold/dark = racha rota

**Grimorio:**
- Soft glow = rituales sin configurar
- Orbiting runes = active magic (streaks alive)
- Closed, still = fully configured, nothing pending

**Espejo:**
- Reflects current atmospheric color state
- Sparkle burst when level changed since last visit

**Pergamino:**
- Sealed with wax = active pact
- Unrolled + glowing = Sunday, time to renew

**Mapa:**
- Rolled up = not visited today
- Partially open = new section unlocked

---

## 7. Screen Flows

### 7.1 First-Time: Isekai Awakening → Onboarding

**Sequence: "La llegada" reimagined (~18 seconds)**

```
0s    Black screen. Audio: soft wind.
2s    First blink — heavy gaussian blur (radius ~30). Light shapes.
      Opens and closes 2-3 times.
5s    Eyes open — blur decreases (30 → 5). Silhouettes emerge:
      sky, trees, a nearby fire.
8s    Full focus — blur → 0. World is sharp. Fireflies appear.
      First typewriter text: narrative intro.
12s   Narrative text — "No recordás cómo llegaste acá..."
      User taps to advance. Frieren-style melancholy tone.
18s   Camera moves gently toward the campfire.
      The campsite reveals itself as home.
      Onboarding begins in-world.
```

**Technical implementation:**
- Three.js post-processing: UnrealBloomPass + custom blur shader
- Scene pre-loaded but hidden (render to texture)
- Particles (fireflies) with PointsMaterial + custom fragment shader
- Camera animation via GSAP master timeline
- Vignette shader for "eyes opening" effect
- Tap advances timeline to next label: `timeline.play("phase-2")`
- Skip button (subtle, corner) for returning users
- Only shown on first-time experience

**Onboarding (6+1 screens, in-world, guided by Frieren):**

This extends the GDD's 6-screen onboarding by prepending the cinematic awakening as a new screen 0. The original 6 screens remain as defined in the architecture spec.

0. **La llegada (cinematic)** — the awakening sequence above (new, extends GDD)
2. **Identidad** — Frieren asks your name. Input floats near the fire.
3. **Arquetipo** — 4 class cards appear around campsite. Each glows on hover. Pick one.
4. **Misión del arco** — choose monthly focus + up to 3 rituals. Grimorio materializes.
5. **Invitar** — partner invite or solo. Pergamino appears if solo.
6. **Generación del mundo** — loading with atmospheric particles (deferred to Phase 6)
7. **El prólogo** — AI-generated opening narrative (deferred to Phase 6)

Each choice has a visual consequence — the campsite builds itself as you make decisions.

### 7.2 Daily Flow

```
Open app → Campsite (current time-of-day atmosphere)
         → Fogata burning = rituales pendientes
         → Tap Fogata → zoom in, sit down
         → Ritual cards appear around fire
         → Tap each = registrado (particle burst, fire grows)
         → After all taps → writing prompt appears
         → Write decision → submit
         → Frieren appears → arcane layer activates
         → Typewriter response (Claude streaming)
         → Return to campsite (fire = embers now)
```

### 7.3 Sunday Ritual

```
Open app → Pergamino glows
         → Tap Pergamino → unfurl animation
         → Scene 1: "Cierre" (Weekly Close narrative)
         → Scene 2: "Boss semanal" (if stats allow — cinematic layer)
         → Scene 3: "El pacto" (4 questions, parchment style)
         → Scene 4: "Firma" (signature drag gesture + wax seal stamp)
         → Return to campsite (new pact active)
```

---

## 8. Post-Processing Stack

Applied via `@react-three/postprocessing` EffectComposer:

| Effect | Config | Purpose |
|---|---|---|
| Bloom | Selective, luminanceThreshold > 1 | Glow on fire, magic, bright elements |
| Depth of Field | Tilt-shift (selective blur) | Miniature/diorama feel |
| Vignette | Darkness 0.4 | Draws focus to center |
| Film Grain | Intensity 0.03 | Analog warmth, prevents banding |
| Color Grading | Warm LUT | Mood consistency |
| Chromatic Aberration | Edges only, subtle | Lens imperfection, cinematic |
| SMAA | Default | Edge smoothing |

Adaptive quality: disable post-processing when `PerformanceMonitor` detects frame drops.

---

## 9. Performance Targets

| Metric | Target |
|---|---|
| FPS | 60 on mobile |
| Initial load | < 3s (lazy-load non-critical 3D assets) |
| GLB total size | < 2MB compressed |
| Draw calls | < 200 |
| DPR cap | 1.5 mobile, 2.0 desktop |

**Strategies:**
- Baked lighting (no runtime shadow computation)
- Draco compression on all geometry
- InstancedMesh for repeated elements (rocks, plants, particles)
- Frustum culling
- `PerformanceMonitor` from drei for adaptive quality
- Deferred shader compilation
- Power-of-2 textures

---

## 10. Audio Design

| Layer | Content | Behavior |
|---|---|---|
| Ambient base | Wind (always) | Fades in on first tap (autoplay policy) |
| Campfire | Crackling fire | Spatial: louder near Fogata, panning |
| Time-of-day | Birds (dawn/day), crickets (night) | Crossfade with time transitions |
| Interaction | Page flip (Grimorio), seal stamp (Pacto), liquid (Espejo) | Triggered on object interaction |
| Arcane | Low hum + shimmer | When arcane layer activates (Frieren speaks) |
| Cinematic | Dramatic swell | Boss semanal, level up |

---

## 11. What This Design Adds to the GDD

| Addition | Justification |
|---|---|
| Campsite as "El Mundo" visualization | GDD doesn't define how El Mundo looks — this is a UI decision |
| Grimorio (ritual management) | GDD has no dedicated ritual editing screen. Needed for usability. |
| Isekai awakening sequence | Extends "La llegada" (GDD screen 1) with cinematic treatment |
| Journey map as Historial | Same content as GDD (scenes by month), visualized spatially |
| Day/night cycle | Not in GDD, enhances immersion |
| Audio design | Not in GDD, standard for immersive experiences |
| 3D/WebGL rendering | Not in GDD, the core technical decision for Awwwards-level quality |

Everything else maps directly to existing GDD concepts with their official terminology.
