# Habit Quest — Project Decomposition & Task Breakdown

**Date:** 2026-03-22
**Based on:** docs/GDD-frieren.md v4.2
**Architecture spec:** docs/superpowers/specs/2026-03-22-habit-quest-architecture-design.md (needs v2 update)

---

## Starting Point

A Next.js 16 repo with dependencies installed, config (vitest, prettier, env template), and tooling. Nothing else — no schema, no logic, no UI.

## Approach

Hybrid decomposition: tasks organized by role (5 AI agents) and grouped in sequential phases. Each phase has 4-5 agents running in parallel. Each phase closes with a review before advancing.

## Daily Loop (v4.2)

The daily user interaction has two distinct layers:

1. **Conduct taps** — throughout the day, at each conduct's specific time. Notification arrives → user taps to confirm (2 seconds). Each conduct is registered individually. The day's overall level (Bien/Regular/Difícil) is **calculated automatically** from conduct completion percentage.
2. **Writing moment** — once per day, when the user opens the app. AI presents a situation → user writes their decision (1-2 sentences) → AI crosses decision with stats (fed by conduct taps) → generates calibrated consequence.

These are NOT the same interaction. Conduct taps feed stats. The writing moment feeds the narrative.

---

## Roles (Agents)

| Role | Responsibility | Claude Code Skills |
|---|---|---|
| **UX/UI Designer** | Design system, screens in code, animations, atmospheric states | `frontend-design`, `vercel-react-best-practices`, `superpowers:brainstorming` (visual companion) |
| **Fullstack Developer** | DB schema, server actions, routes, business logic, tests | `spec-driven-development`, `superpowers:test-driven-development`, `superpowers:writing-plans` |
| **Prompt Engineer** | System prompt, context builder, all Claude prompts, prompt testing | `claude-api`, `superpowers:brainstorming` |
| **Copywriter** | UI texts, onboarding copy, microcopy, notifications, error messages | `superpowers:brainstorming` |
| **DevOps** | Vercel, Postgres, Resend, Auth.js, env vars, deploy pipeline | `superpowers:writing-plans` |

**Cross-cutting skills (all roles):** `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `update-feature-specs`, `simplify`

**Director skills (human):** `superpowers:brainstorming`, `superpowers:dispatching-parallel-agents`, `superpowers:subagent-driven-development`, `superpowers:finishing-a-development-branch`

---

## Phases Overview

| Phase | Name | Outcome |
|---|---|---|
| **0** | Agent Setup | AGENTS.md per role, folder structure, specs base, architecture spec v2 |
| **1** | Cimientos | Infra running (Vercel + DB + Auth), design system defined, DB schema (including conduct_taps), GDD texts extracted, Frieren prompt calibrated |
| **2** | Core Loop | Login → onboarding → conduct taps throughout the day → auto day-level → stats → generated narrative. Single user can use the app. |
| **3** | Escritura D&D | AI generates situation → user writes decision → AI crosses with stats (from conduct taps) → calibrated consequence. |
| **4** | Dientes | Visible decay, atmospheric states, progressive consequences (1/2/3+ days), streak shield, recovery quest. |
| **5** | Co-op | Partner linking, alternating turns, weekly pact with signature, weekly boss with decision fusion, weekly close narrative, Nosotros screen. |
| **6** | Visual + Arcos | Images (Nano Banana), dynamic backgrounds, bond scene, video (Veo 3.1), complete monthly arc system. |

---

## Open Design Decisions

These must be resolved before implementation reaches the relevant phase:

1. **Mago archetype stats:** GDD lists `INT + mana` but the stat system has no mana. Resolve before Phase 1 schema. Likely maps to `INT + STA`.
2. **"Green stats" threshold:** GDD says weekly boss is gated by "stats en verde" without a numeric definition. Define threshold before Phase 4.
3. **Day type detection:** How does the AI signal that a situation is a "bifurcation" vs "normal"? Structured metadata in response, or parsed from text? Define before Phase 3 task 3.4.
4. **Streak shield storage:** Boolean on `users` table? Field on `stats_history`? Define before Phase 1 schema.
5. **Notification infrastructure:** Push notifications (PWA service worker), or in-app only? Define before Phase 2.
6. **Auto-narrative fallback:** In Phase 2 the app generates narrative automatically from conduct data. Phase 3 adds the writing layer. If the user doesn't write on their turn day, does the auto-narrative remain as fallback, or is writing mandatory? Define before Phase 3.

---

## Phase 0 — Agent Setup

| # | Task | Description |
|---|---|---|
| 0.1 | **AGENTS.md per role** | Instructions for each agent: files it touches, skills it uses, conventions it follows, what it does NOT do. References GDD v4.2 and architecture spec. Each agent MUST treat GDD v4.2 as source of truth over the architecture spec until 0.3 is complete. |
| 0.2 | **Folder structure** | Create empty `features/`, `lib/`, `app/` structure per architecture spec. Create `docs/superpowers/specs/` with empty specs per feature. |
| 0.3 | **Architecture spec v2** | Update `2026-03-22-habit-quest-architecture-design.md` with v4.2 changes: new data model (conduct_taps, decision_escrita, situacion_planteada, turn logic, boss fusion), daily loop (taps + writing), new triggers, notification system. Resolve Mago archetype stats and streak shield storage. |

---

## Phase 1 — Cimientos

5 agents in parallel.

| # | Role | Task | Deliverable |
|---|---|---|---|
| 1.1 | **DevOps** | Vercel project + Vercel Postgres + Resend | Project deployed empty, DB running, env vars in local and prod |
| 1.2 | **DevOps** | Auth.js + magic links + proxy.ts | Functional login with the 2 allowed emails |
| 1.3 | **UX/UI** | Design system in code | Frieren palette (darks, golds, fog), typography, dark theme, Tailwind tokens, extended shadcn components |
| 1.4 | **UX/UI** | Core screens — visual shell | Onboarding wizard (screens 1-5), El Mundo, conduct tap UI, writing screen — visual components with mocked data, base animations (Framer Motion). Screens 6-7 (world generation + prologue) deferred to Phase 6. |
| 1.5 | **Fullstack** | DB schema with Drizzle | 11 tables (10 from GDD v4.2 Section 13 + `conduct_taps`): `users`, `habits`, `conducts`, `conduct_taps` (NEW: id, conduct_id, user_id, date, completed_at), `daily_checkins` (with `es_turno_escritura`, `decision_escrita`, `auto_level` calculated from taps), `stats_history`, `scenes` (with `situacion_planteada`, `decision_p1/p2`, `texto_consecuencia`), `arcs`, `weekly_pacts`, `weekly_bosses`, `world_state` (with `decisiones_relevantes_json`). Resolve Mago archetype enum and streak shield storage per 0.3. |
| 1.6 | **Fullstack** | Types + DAL + base queries | `features/*/types.ts`, `lib/dal.ts`, `lib/db/queries.ts`. Include `ConductTap`, `AutoLevel` types. |
| 1.7 | **Copywriter** | Extract all GDD texts | Organized copy file: onboarding (screens 1-5 for now, 6-7 deferred), microcopy by time of day, conduct-specific notification texts (per GDD Section 12: "Kael, el desayuno espera. Tu cocina, 7:30"), turn texts ("¿Qué decide Kael hoy?" / "No es tu turno"), pact questions, loading states, errors, empty states |
| 1.8 | **Prompt Eng.** | Frieren system prompt v1 | Base prompt calibrated with D&D writing rules included. Tested against Claude API with different stat combinations. The 3 narrative modes (quiet/action/consequence) produce Frieren-faithful output. |
| 1.9 | **Prompt Eng.** | Context builder design | Complete spec: what data Claude receives per trigger (`daily`, `weekly_close`, `boss_semanal`, `vinculo`, `arc_close`, `arc_open`, `recovery`). JSON format. Includes `decision_escrita`, `tipo_dia`, `decisiones_pasadas_relevantes`, conduct completion data. |

**Dependencies:**
- 1.4 waits on 1.3 (design system)
- 1.6 waits on 1.5 (schema)
- 1.9 informed by 1.5 and 1.6 (schema + types)
- Everything else is parallel

---

## Phase 2 — Core Loop

5 agents in parallel. Goal: app works end-to-end with the habit registration layer. No writing yet — taps + auto narrative.

| # | Role | Task | Deliverable |
|---|---|---|---|
| 2.1 | **Fullstack** | Stats engine (TDD) | `calculateDecay` (per GDD Section 06 decay table: 0-24h none, 24-48h subtle, 48-72h visible, 72h+ critical), `updateStatsFromConducts` (receives conduct completion %, archetype weights → updates stats), `calculateStreak` (consecutive days with all conducts completed), `calculateAutoLevel` (maps conduct completion % to Bien/Regular/Difícil). All with tests. Stats range 0-100. Initial values: 50 all. |
| 2.2 | **Fullstack** | Onboarding server actions | Screens 1-5 saved to DB: identity text, character name, archetype, objective area, up to 3 conducts with time/place/contingency. Zod validation. Creates user + habit + conducts + initial arc + initial world state. Screen 5 (invite) saves partner email but linking deferred to Phase 5. |
| 2.3 | **Fullstack** | Conduct tap server action | `tapConduct(conductId)` — saves `conduct_tap` record with timestamp. Idempotent per conduct per day. After each tap, recalculates auto_level for the day and updates stats via `updateStatsFromConducts`. |
| 2.4 | **Fullstack** | Notification system | Infrastructure for sending conduct-specific notifications at each conduct's configured time. PWA service worker or equivalent. Notification includes conduct-specific text from Copywriter. |
| 2.5 | **Fullstack** | Narrative route — simple mode | Route handler builds context (without written decision — just conduct data + stats), calls Claude, streams response, saves scene. `daily` trigger only. Generates auto-narrative based on how the day's conducts went. |
| 2.6 | **Fullstack** | Main screen "El Mundo" | Server component: daily scene (latest narrative), stats (4 bars), active conducts with tap status for today, active pact (if exists). |
| 2.7 | **UX/UI** | Integrate design system in onboarding | Screens 1-5 with animations, step transitions, the "book feel". Archetype cards with description. Conduct entry with time/place fields. |
| 2.8 | **UX/UI** | Conduct tap UI | Notification-triggered tap interface (minimal friction, 2 seconds). In-app conduct list with today's completion status (tapped/pending). Visual feedback on tap. Integrated into El Mundo screen. |
| 2.9 | **UX/UI** | Integrate design system in El Mundo | Narrative with text reveal animation, stat bars (animated), conduct tap status indicators, daily scene display. |
| 2.10 | **Prompt Eng.** | Context builder v1 implemented | `features/narrative/context-builder.ts` — transforms game state into prompt. `daily` trigger only. Includes conduct completion data. Tests. |
| 2.11 | **Copywriter** | Copy integrated in components | All onboarding texts (screens 1-5), conduct tap confirmations, El Mundo texts, notification templates per conduct ("Kael, el desayuno espera. Tu cocina, 7:30") |

**Dependencies:**
- 2.2-2.6 depend on Phase 1 complete
- 2.5 depends on 2.10 (context builder)
- 2.7-2.9 depend on functional components (2.2, 2.3, 2.6)
- 2.10 depends on 1.8, 1.9
- 2.4 can start as soon as 1.1 and 1.5 are done (infra + schema)

---

## Phase 3 — Escritura D&D

4 agents in parallel. Adds the writing layer on top of the conduct tap layer.

| # | Role | Task | Deliverable |
|---|---|---|---|
| 3.1 | **Fullstack** | Situation generation | New endpoint/action that generates daily situation (3 lines max). Generated on app open or day start. Persisted in `scenes.situacion_planteada`. Uses conduct completion + stats + world state to inform the situation. |
| 3.2 | **Fullstack** | Writing submission | New action: receives `decision_escrita` (1-2 sentences). Saves to `daily_checkins.decision_escrita`. Triggers consequence generation. Separate from conduct taps — this is the once-per-day creative moment. |
| 3.3 | **Fullstack** | Narrative route — writing mode | Updated route handler: receives situation + decision + stats (from today's conduct taps) → generates calibrated consequence per 5-level scale (see GDD Section 07). Saves `texto_consecuencia` in scenes. Replaces auto-narrative from Phase 2 when writing is available. |
| 3.4 | **Fullstack** | Day types | Logic to determine `tipo_dia`: normal, decision (arc bifurcation), boss_semanal, arc_close. AI returns structured metadata alongside narrative text (e.g., `{ type: "decision", narrative: "..." }`). Not parsed from prose. |
| 3.5 | **UX/UI** | Writing screen | Added to El Mundo: situation displayed on top (generated text), decision field (1-2 sentences, textarea), confirm button. Consequence appears below with reveal animation. Conduct taps remain accessible separately (they happen throughout the day, writing happens once). |
| 3.6 | **Prompt Eng.** | Situation generation prompt | Prompt that generates daily situations coherent with arc, world state, conduct completion, and past decisions. Calibrated for 3 types (normal, decision, boss). Returns structured response with type metadata. Tested with different states. |
| 3.7 | **Prompt Eng.** | Decision × stats crossing prompt | 5-level scale per GDD Section 07: (1) high stats + good decision → epic, (2) high stats + risky → success with cost, (3) regular stats + good → harder than expected, (4) low stats + risky → partial failure with carry-over consequences, (5) critical stats → epic not available. Exhaustively tested. |
| 3.8 | **Prompt Eng.** | Context builder v2 | Updated: includes `decision_escrita`, `tipo_dia`, `decisiones_pasadas_relevantes`, today's conduct completion breakdown (not just aggregate). New triggers supported. |
| 3.9 | **Copywriter** | Writing mechanic texts | Turn microcopy by time of day ("¿Qué decide Kael hoy?", "El camino sigue. ¿Cómo avanza?", "¿Cómo termina este capítulo?"), decision field placeholder, confirmation ("El reino toma nota.") |

**Dependencies:**
- Everything depends on Phase 2 complete
- 3.3 depends on 3.7 and 3.8 (crossing prompt + context builder v2)
- 3.1 depends on 3.6 (situation prompt)
- 3.5 depends on 3.1 and 3.2 (needs endpoints)
- 3.4 depends on 3.6 (structured metadata format defined in prompt)

---

## Phase 4 — Dientes

4 agents in parallel. Gives the app real weight.

| # | Role | Task | Deliverable |
|---|---|---|---|
| 4.1 | **Fullstack** | Visible decay + world state mood | Stats with decay tier reflected in UI, `deriveWorldMood` calculates world state (calm/unsettled/threatened/critical) based on combined stats and conduct completion trends |
| 4.2 | **Fullstack** | Streak shield | Logic: 7 consecutive days with all conducts completed → earns shield. Auto-used if streak breaks. Doesn't stack. Persisted per architecture spec v2 resolution. |
| 4.3 | **Fullstack** | Recovery quest | Streak broken 2+ days → AI generates specific challenge reflecting what was lost. All conducts completed next day activates quest (equivalent to GDD's "nivel Bien" since auto-level from 100% conduct completion = Bien). Partial recovery (50%) of stats. World/NPC damage begins gradual reversal. |
| 4.4 | **Fullstack** | Consequences in situations + conduct impact | Generated situations reflect decay: 1 day missed → mild narrative cost, 2 days → risky decisions fail partially, 3+ days → only conservative decisions succeed. Also: missed individual conducts affect which stats are weak (e.g., skipping meals → low VIT → food-related situations are harder). Integrated in context builder. |
| 4.5 | **UX/UI** | Atmospheric states | 4 visual states (golden/cloudy/fog/dark) applied to El Mundo. Smooth CSS/Framer transitions between states. Decay animations in stat bars. Conduct tap UI reflects urgency when stats are low. |
| 4.6 | **UX/UI** | Consequence UI | Streak shield visual (icon, activation animation), recovery quest UI (challenge screen), decay tier indicators on stats, missed-conduct visual indicators |
| 4.7 | **Prompt Eng.** | Progressive narrative consequences | Prompts calibrated for 4-tier decay scale (GDD Section 08). Situations and consequences reflect specific conduct gaps, not just aggregate stats. Recovery quest narrative. Tested per tier. |
| 4.8 | **Prompt Eng.** | Consequence effect on writing | 5-level result scale now modulated by decay: with 3+ bad days, even "regular" stats produce conservative outcomes. Per GDD Section 08: "Solo las decisiones más seguras y conservadoras salen bien. La épica no está disponible." Integrated in crossing prompt. |
| 4.9 | **Copywriter** | Consequence + recovery texts | UI messages per decay tier, streak shield texts, recovery quest texts, critical stats empty states, missed-conduct notification variants |

**Dependencies:**
- Everything depends on Phase 3 complete
- 4.4 depends on 4.7 (consequence prompt)
- 4.8 modifies the crossing prompt from Phase 3

---

## Phase 5 — Co-op

5 agents in parallel. Two players, one story.

| # | Role | Task | Deliverable |
|---|---|---|---|
| 5.1 | **Fullstack** | Partner linking | Activate onboarding screen 5 invite: email invitation, link two users (validate `AUTH_ALLOWED_EMAILS`), shared world state sync. Second user does full onboarding. World generation triggers when both confirm. |
| 5.2 | **Fullstack** | Alternating writing turns | Turn logic (Mon→P1, Tue→P2, etc.), detect who writes today, differentiated view. Both users register conduct taps every day regardless of turn. Only the writing decision alternates. |
| 5.3 | **Fullstack** | Weekly pact: actions + logic | Create pact (4 questions per GDD Section 05), save each user's text, sign, generate narrative pact text with Claude |
| 5.4 | **Fullstack** | Weekly close narrative | AI generates weekly closure narrative every Sunday. Reflects both players' stats, conduct completion, and decisions from the week. Separate from boss and pact — this is the narrative reflection. Trigger: `weekly_close`. |
| 5.5 | **Fullstack** | Weekly boss with fusion | Boss gated by stats threshold (per open design decision #2). Both write decisions **separately, without seeing the other's** (per GDD Section 07). Fusion logic: compatible → merge into coordinated action, contradictory → choose by combined weekly stats, opposite → narrate the conflict as the story. Result uses combined 7-day stats + conduct completion. |
| 5.6 | **Fullstack** | Nosotros + History screens | Server components: both characters side-by-side (name, archetype, stats), active pact, combined streak, bond scene countdown. History: all scenes chronologically by arc/month, like book chapters. Bond scenes marked specially. |
| 5.7 | **UX/UI** | Turn UI | Modify El Mundo for two states: **your turn** (situation + decision field + conduct taps) vs **not your turn** (yesterday's scene showing other's decision + consequence, conduct taps only). This extends the Phase 3 writing screen (3.5), not a rebuild. |
| 5.8 | **UX/UI** | Pact + signature UI | Form (4 questions), signature with parchment seal animation (Framer Motion), pact visible during the week |
| 5.9 | **UX/UI** | Sunday ritual + Nosotros + History UI | Sunday ritual: Weekly Close narrative display (Step 1), Boss writing + waiting + fused result reveal (Step 2), Pact handled by 5.8 (Steps 3-4). Nosotros: two characters side-by-side. History: chapter layout. |
| 5.10 | **Prompt Eng.** | Two-character narrative + turns | Calibrate Claude: continue story from where the other left it yesterday. Situation generation considers both characters' states. Narrative reflects combined conduct completion ("both doing well", "one carries the other", "both struggling"). |
| 5.11 | **Prompt Eng.** | Boss decision fusion | 3 fusion logics tested per GDD Section 07. Compatible: "sin coordinarlo, cada uno tomó su camino — y el resultado fue una trampa perfecta." Contradictory: "Los stats de la semana hablaron por ella." Opposite: "No se pusieron de acuerdo esa noche." Result calibrated with combined stats. |
| 5.12 | **Prompt Eng.** | Weekly close + pact narratives | Weekly close prompt: closure narrative for the week. Pact prompt: transforms both users' raw texts into Frieren-style narrative pact. Both triggers added to context builder. |
| 5.13 | **Copywriter** | Co-op texts | Invitation texts, turn indicators ("Tu turno" / "Turno de Lyra"), boss waiting texts, Nosotros microcopy, pact 4 questions, signature text, weekly close UI texts |

**Dependencies:**
- Everything depends on Phase 4 complete
- 5.5 depends on 5.1 and 5.2 (partner + turns)
- 5.5 depends on 5.11 (fusion prompt)
- 5.4 depends on 5.12 (weekly close prompt)
- 5.7 extends 3.5 (not a rebuild)

---

## Phase 6 — Visual + Arcos

5 agents in parallel.

| # | Role | Task | Deliverable |
|---|---|---|---|
| 6.1 | **Fullstack** | Nano Banana integration | Daily image generated in parallel with narrative, Vercel Blob storage, async display. Image prompt informed by scene content + world state. |
| 6.2 | **Fullstack** | Dynamic backgrounds | El Mundo background changes per world state mood (4 atmospheric states from Phase 4) + generated image |
| 6.3 | **Fullstack** | Bond scene | Combined 5-day streak detector (both users, all conducts), auto trigger, notification "algo especial ocurrió en Valdris". Bond scene generated with `vinculo` trigger. |
| 6.4 | **Fullstack** | Veo 3.1 integration | Async video for bond (6-8s) and arc close (15-20s), Vercel Blob storage, notification when ready |
| 6.5 | **Fullstack** | Monthly arc system — lifecycle | Arc creation (first Sunday of month or after onboarding), weekly progression tracking, arc resolution on last Sunday. Trigger: `arc_open` at start, `arc_close` at end. Resolution determined by month's stats + conduct consistency + decisions written. |
| 6.6 | **Fullstack** | Monthly arc system — content | Arc poster image generation, transition question ("El reino cambió este mes. ¿Qué querés que el próximo capítulo revele?"), longer resolution narrative, video cinematic (15-20s). |
| 6.7 | **Fullstack** | Onboarding screens 6-7 | Screen 6: world generation with narrative loading ("Nombrando el reino... Dando vida a los primeros habitantes..."). Screen 7: generated prologue (3-4 paragraphs) + first image. Triggers after both users complete onboarding (or immediately for solo). |
| 6.8 | **UX/UI** | Bond scene UI | Screen without interface — no buttons, no navigation. Only narrative text + image/video. Completely different visual treatment from rest of app. |
| 6.9 | **UX/UI** | Arc poster + cinematic loading + onboarding 6-7 | Monthly arc poster display, loading animations for world generation (15-20s narrative loading), onboarding screens 6-7 visual design |
| 6.10 | **Prompt Eng.** | Image + video prompts | Prompts for Nano Banana (daily scenes matching narrative, atmospheric backgrounds per mood, arc posters) and Veo 3.1 (bond clips, monthly cinematics). Style guide for visual consistency. |
| 6.11 | **Prompt Eng.** | Bond + arc narratives | Bond scene prompt: intimate, slow, about the relationship, no mission — per GDD Section 09. Arc open prompt: new territory, new threat, new promise. Arc close prompt: resolution based on 28 days of stats + decisions. Context builder updated with `vinculo`, `arc_open`, `arc_close` triggers. |
| 6.12 | **Copywriter** | Arc + bond texts | "El reino cambió este mes. ¿Qué querés que el próximo capítulo revele?", video-ready notifications ("Tu escena de esta semana está lista"), bond scene intro ("Esta noche, algo especial ocurrió en Valdris"), loading state texts for world generation |

---

## Out of Scope (Future — GDD Section 15 + Week 8+)

Not included in this decomposition. To be planned separately after Phase 6:

- NPCs with persistent memory
- World map that reveals as you progress
- Zone lock/unlock system based on stats
- Real-life rewards system
- Advanced notification intelligence
- Multiple concurrent arcs

---

## Summary

**66 tasks across 7 phases (0-6).** Each phase runs 4-5 parallel agents. Phases are sequential with review gates between them.

| Phase | Tasks | Agents |
|---|---|---|
| 0 — Agent Setup | 3 | 1 (human) |
| 1 — Cimientos | 9 | 5 |
| 2 — Core Loop | 11 | 5 |
| 3 — Escritura D&D | 9 | 4 |
| 4 — Dientes | 9 | 4 |
| 5 — Co-op | 13 | 5 |
| 6 — Visual + Arcos | 12 | 5 |
| **Future** | TBD | — |
