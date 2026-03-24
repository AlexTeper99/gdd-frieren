# Habit Quest — Gantt de Ejecucion

**13 rounds × 5 slots | Diseno antes que codigo | Fases solapadas**

**Visual:** `.superpowers/brainstorm/31001-1774272985/gantt-chart.html`
**Spec completa:** `docs/superpowers/specs/2026-03-22-habit-quest-project-decomposition.md`
**GDD:** `docs/GDD-frieren.md` v4.2

---

## Leyenda

- 🟢 DevOps
- 🟣 UX/UI
- 🟡 Copywriter
- 🔵 Prompt Engineer
- 🔴 Fullstack
- ⬜ Review
- `←EARLY` = tarea de la fase siguiente, arrancada antes en un slot libre

## Reglas

- **Round** = una ronda de ejecucion. Lanzo hasta 5 agentes en paralelo, espero a que terminen, lanzo la siguiente.
- **Slot** = un agente (subagente Claude Code en su worktree) corriendo dentro de un round.
- **Diseno antes que codigo**: los roles creativos (UX, Copy, Prompt) disenan primero. Fullstack implementa despues con ese output.
- **Fases solapadas**: mientras Fullstack implementa Fase N, los creativos disenan Fase N+1 en slots libres.

---

## R0 — Human Setup

| Status | Task |
|--------|------|
| ☐ | 0.1 AGENTS.md por rol |
| ☐ | 0.2 Estructura de carpetas |
| ☐ | 0.3 Architecture spec v2 (resolver Mago stats, streak shield storage) |

---

## R1 — Cimientos: Diseno + Infra

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🟢 DevOps | 1.1 Infra (Vercel + Postgres + Resend) | ☐ | |
| 2 | 🟣 UX/UI | 1.3 Design System (paleta Frieren, typo, dark theme, tokens) | ☐ | |
| 3 | 🟡 Copy | 1.7 Extraer textos GDD (onboarding, microcopy, notifs, pacto) | ☐ | |
| 4 | 🔵 Prompt | 1.8 System prompt v1 (Frieren calibrado, 3 modos narrativos) | ✅ | Base + 7 módulos + 26 tests (9 unit + 17 integration). Vercel AI SDK. |
| 5 | 🔴 Full | 1.5 Schema + Types + DAL (11 tablas Drizzle, types, queries) | ☐ | |

---

## R2 — Cimientos: Auth + Shells + Early Core

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🟢 DevOps | 1.2 Auth (Auth.js + magic links + proxy.ts) | ☐ | |
| 2 | 🟣 UX/UI | 1.4 Visual Shells (onb + mundo + tap + writing, mocked) | ☐ | |
| 3 | 🔵 Prompt | 1.9 Context Builder Design (JSON spec por trigger) | ☐ | |
| 4 | 🔴 Full A | 2.1 Stats Engine TDD (decay, streak, autoLevel) | ☐ | |
| 5 | 🔴 Full B | 2.4 Notificaciones (PWA service worker) | ☐ | |

**Resultado R2:** Phase 1 completa + stats engine + notificaciones.

---

## R3 — Core Loop: Implementacion + Early Escritura

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 2.2 Onboarding Actions (6 pasos + Zod + DB) | ☐ | |
| 2 | 🔴 Full B | 2.3 Conduct Tap Action (tapConduct() + recalc stats) | ☐ | |
| 3 | 🔴 Full C | 2.6 Main Screen El Mundo (server component) | ☐ | |
| 4 | 🔵 Prompt | 2.10 Context Builder v1 (implementacion + tests) | ☐ | |
| 5 | 🟡 Copy | 3.9 Textos Escritura `←EARLY` ("Que decide Kael?", placeholders) | ☐ | |

---

## R4 — Core Loop: Narrative + UI Integration + Early Escritura

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full | 2.5 Narrative Route (streaming Claude, guarda scene) | ☐ | |
| 2 | 🟣 UX A | 2.7 Onboarding UI (integra diseno + animaciones) | ☐ | |
| 3 | 🟣 UX B | 2.8 Conduct Tap UI (tap interface, feedback visual) | ☐ | |
| 4 | 🟣 UX C | 2.9 El Mundo UI (text reveal, stat bars, scene) | ☐ | |
| 5 | 🔵 Prompt | 3.6 Situation Prompt `←EARLY` (calibra 3 tipos) | ☐ | |

**Resultado R4:** Core Loop funcional. Un usuario puede hacer taps + ver narrativa.

---

## R5 — Escritura D&D: Implementacion

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🟡 Copy | 2.11 Copy en Componentes (textos finales in-situ) | ☐ | |
| 2 | 🔴 Full A | 3.1 Situation Gen (endpoint + persiste en scenes) | ☐ | |
| 3 | 🔴 Full B | 3.2 Writing Submit (decision_escrita + trigger) | ☐ | |
| 4 | 🔵 Prompt A | 3.7 Crossing Prompt (escala 5 niveles decision x stats) | ☐ | |
| 5 | 🔵 Prompt B | 3.8 Context Builder v2 (+ decision, tipo_dia, pasadas) | ☐ | |

---

## R6 — Escritura D&D: Cierre + Early Dientes

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 3.3 Narrative Writing (cruce decision x stats → consecuencia) | ☐ | |
| 2 | 🔴 Full B | 3.4 Day Types (normal/decision/boss/arc_close) | ☐ | |
| 3 | 🟣 UX | 3.5 Writing Screen (situacion + campo + reveal) | ☐ | |
| 4 | 🔵 Prompt A | 4.7 Consequence Prompts `←EARLY` (4-tier decay, recovery) | ☐ | |
| 5 | 🔵 Prompt B | 4.8 Decay x Writing `←EARLY` (decay modula resultado) | ☐ | |

**Resultado R6:** Escritura D&D funcional.

---

## R7 — Dientes: Implementacion

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 4.1 Decay + Mood (deriveWorldMood, UI reflection) | ☐ | |
| 2 | 🔴 Full B | 4.2 Streak Shield (7d → shield, auto-use) | ☐ | |
| 3 | 🔴 Full C | 4.3 Recovery Quest (2d roto → quest, 50% recovery) | ☐ | |
| 4 | 🔴 Full D | 4.4 Consequences (decay afecta situaciones) | ☐ | |
| 5 | 🟡 Copy | 4.9 Textos Consecuencia (decay tiers, shield, recovery) | ☐ | |

---

## R8 — Dientes: UI + Early Co-op

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🟣 UX A | 4.5 Atmosferas (4 estados: gold/cloud/fog/dark) | ☐ | |
| 2 | 🟣 UX B | 4.6 Consequence UI (shield icon, recovery, decay) | ☐ | |
| 3 | 🔵 Prompt A | 5.10 2-Char Narrative `←EARLY` (turnos, estado combinado) | ☐ | |
| 4 | 🔵 Prompt B | 5.11 Boss Fusion `←EARLY` (3 logicas de fusion) | ☐ | |
| 5 | 🔵 Prompt C | 5.12 Close + Pact `←EARLY` (weekly close + pact prompts) | ☐ | |

**Resultado R8:** Dientes completos.

---

## R9 — Co-op: Implementacion Wave 1

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 5.1 Partner Linking (invite + vincular + world sync) | ☐ | |
| 2 | 🔴 Full B | 5.3 Pact Actions (4 preguntas + firma + Claude) | ☐ | |
| 3 | 🔴 Full C | 5.4 Weekly Close (narrativa cierre semanal) | ☐ | |
| 4 | 🟣 UX | 5.8 Pact + Firma UI (sello pergamino, animacion) | ☐ | |
| 5 | 🟡 Copy | 5.13 Textos Co-op (turnos, pacto, boss, nosotros) | ☐ | |

---

## R10 — Co-op: Implementacion Wave 2 + Early Visual

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 5.2 Turnos Alternados (Lun→P1, Mar→P2, deteccion) | ☐ | |
| 2 | 🔴 Full B | 5.6 Nosotros + History (2 chars, pacto, capitulos) | ☐ | |
| 3 | 🟣 UX A | 5.7 Turn UI (tu turno / no es tu turno) | ☐ | |
| 4 | 🟣 UX B | 5.9 Sunday Ritual UI (close + boss + nosotros + history) | ☐ | |
| 5 | 🔵 Prompt | 6.10 Img + Video Prompts `←EARLY` (Nano Banana + Veo 3.1) | ☐ | |

---

## R11 — Co-op: Boss + Early Visual

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full | 5.5 Boss con Fusion (2 inputs, 3 logicas fusion) | ☐ | |
| 2 | 🔵 Prompt | 6.11 Bond + Arc Narratives `←EARLY` (vinculo, arc open/close) | ☐ | |
| 3 | 🟡 Copy | 6.12 Textos Arc + Bond `←EARLY` (transicion, notifs video) | ☐ | |
| 4 | ⬜ Review | Phase 5 integration check | ☐ | |
| 5 | ⬜ Review | Phase 5 integration check | ☐ | |

**Resultado R11:** Co-op completo.

---

## R12 — Visual + Arcos: Implementacion

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 6.1 Nano Banana (img daily + Vercel Blob) | ☐ | |
| 2 | 🔴 Full B | 6.3 Bond Scene (detector 5d + trigger auto) | ☐ | |
| 3 | 🔴 Full C | 6.4 Veo 3.1 (video async + notif) | ☐ | |
| 4 | 🔴 Full D | 6.5 Arc Lifecycle (crear/progresar/cerrar arco) | ☐ | |
| 5 | 🔴 Full E | 6.7 Onboarding 6-7 (world gen + prologo + img) | ☐ | |

---

## R13 — Visual + Arcos: Cierre

| Slot | Rol | Task | Status | Notas |
|------|-----|------|--------|-------|
| 1 | 🔴 Full A | 6.2 Fondos Dinamicos (mood + img background) | ☐ | |
| 2 | 🔴 Full B | 6.6 Arc Content (poster + transicion + video) | ☐ | |
| 3 | 🟣 UX A | 6.8 Bond Scene UI (sin interfaz, solo narrativa) | ☐ | |
| 4 | 🟣 UX B | 6.9 Arc + Loading UI (poster + onboarding 6-7) | ☐ | |
| 5 | ⬜ Review | Final integration + smoke test | ☐ | |

**Resultado R13:** Todo el GDD implementado.

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Rounds totales | 13 + R0 |
| Tasks totales | 66 |
| Slots usados | 65 de 65 |
| Tasks EARLY | 14 |
| Slots idle | 0 |

## Open Design Decisions

Resolver antes de llegar a la fase relevante:

| # | Decision | Resolver antes de | Status |
|---|----------|-------------------|--------|
| 1 | Mago archetype: INT + mana → INT + STA? | R0 (arch spec v2) | ☐ |
| 2 | "Green stats" threshold numerico | R7 (Phase 4) | ☐ |
| 3 | Day type detection: structured metadata vs parsed | R5 (Phase 3) | ☐ |
| 4 | Streak shield storage: donde en el schema | R0 (arch spec v2) | ☐ |
| 5 | Notificaciones: PWA push vs in-app only | R2 (task 2.4) | ☐ |
| 6 | Auto-narrative fallback cuando no se escribe | R5 (Phase 3) | ☐ |
