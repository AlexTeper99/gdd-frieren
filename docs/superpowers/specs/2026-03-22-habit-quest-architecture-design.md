# Habit Quest — Architecture & Technical Design

**Date:** 2026-03-22
**Scope:** MVP Week 1 — Foundation
**Based on:** docs/GDD-frieren.md v3.0

---

## MVP Scope

Auth for two users. Onboarding (6 screens: identity, character name, archetype, objective, conducts, invite). Daily check-in. Narrative text generation with Claude. HP decay basic. Weekly pact with signature.

**Onboarding screens (6):** (1) Identity question, (2) Character name, (3) Archetype selection, (4) First arc objective, (5) Conducts with time/place, (6) Invite partner. Screens for rewards, world generation loading, and prologue are deferred.

**Out of scope for MVP:** Design system (separate chat), image generation, video generation, rewards system, NPC memory, world map reveal, onboarding rewards/generation/prologue screens.

---

## Stack

> **Note:** This stack supersedes Section 12 of the GDD. Key changes from GDD: Next.js 16 (was 15), Drizzle (was Prisma), Auth.js + Resend (was Supabase), Vercel (was Railway/Render). Rationale: Vercel-native stack for faster development, Drizzle for zero-codegen type safety, Auth.js for simpler magic link auth.

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 App Router (Turbopack) | Latest, server actions, streaming |
| Deploy | Vercel | Native Next.js support, free tier |
| Database | Vercel Postgres + Drizzle ORM | Type-safe, zero codegen, lightweight |
| Storage | Vercel Blob | For future images/video, free 500MB |
| Auth | Auth.js + Resend | Magic links, zero passwords, 3k emails/mo free |
| AI Narrative | Claude API (Sonnet) | Scene generation, pact narratives |
| UI Components | shadcn/ui | Functional components out of the box |
| Animations | Framer Motion | Cinematic narrative animations |
| Styling | Tailwind CSS 4 | Already configured in project |
| Testing | Vitest + React Testing Library | Unit + integration tests |
| Linting | ESLint + Prettier | Minimal, no git hooks |
| Dev Tools | next-devtools-mcp | Real-time app state for AI-assisted dev |

---

## Project Structure

Feature-based with server actions. Opinionated separation: UI in `app/`, business logic in `features/`, shared infra in `lib/`.

```
app/
  (auth)/                    ← public auth routes
    login/page.tsx           ← magic link login form
    verify/page.tsx          ← verify magic link callback
  (app)/                     ← protected routes (auth required)
    layout.tsx               ← protected layout, checks session
    page.tsx                 ← "El Mundo" — main screen
    onboarding/
      page.tsx
      _components/           ← wizard step components (private)
      actions.ts             ← 'use server' — save identity, character, etc
    checkin/
      page.tsx
      _components/
      actions.ts             ← 'use server' — save checkin, trigger narrative
    pact/
      page.tsx
      _components/
      actions.ts             ← 'use server' — save pact text, sign
    history/page.tsx         ← scene history by month
    us/page.tsx              ← "Nosotros" — shared dashboard
    narrative/
      route.ts               ← ONLY Route Handler: streaming Claude response
  proxy.ts                   ← auth check, replaces middleware.ts (Next.js 16)

features/
  onboarding/                ← onboarding-specific logic & components
  checkin/                   ← check-in specific logic & components
  narrative/
    context-builder.ts       ← builds Claude prompt context from game state
    system-prompt.ts         ← hardcoded Frieren narrative prompt
    types.ts
  stats/
    engine.ts                ← stat calculation, decay, streak logic
    types.ts
  pact/                      ← pact-specific logic & components
  world/                     ← world state management
    state.ts
    types.ts

lib/
  db/                        ← Drizzle client, schema, reusable queries
    index.ts                 ← Drizzle client singleton
    schema.ts                ← Drizzle schema (all tables)
    queries.ts               ← reusable query functions
  claude/                    ← Claude SDK client wrapper
    index.ts
  auth/                      ← Auth.js configuration
    index.ts
  dal.ts                     ← Data Access Layer (verifySession, getCurrentUser)

__tests__/                   ← mirrors features/ structure
  features/
    stats/engine.test.ts
    narrative/context-builder.test.ts
  app/
    checkin/actions.test.ts
    onboarding/actions.test.ts
```

---

## Next.js 16 Patterns

These are breaking changes from Next.js 15 that must be followed:

1. **Server Actions for all mutations** — `'use server'` in `actions.ts` files colocated with routes. No API route handlers for mutations.
2. **`proxy.ts` replaces `middleware.ts`** — Exported `proxy()` function, Node.js runtime (not edge). Used for auth checks before route access.
3. **Async request APIs** — `cookies()`, `headers()`, `params`, `searchParams` are all Promises. Always `await` them.
4. **Single Route Handler** — Only `app/(app)/narrative/route.ts` for streaming Claude responses via SSE. Everything else is server actions.
5. **Turbopack is default** — No flags needed for `next dev` or `next build`.
6. **Private folders** — Prefix with `_` (e.g., `_components/`) for non-routable colocated files.
7. **Route groups** — `(auth)` and `(app)` for layout separation without URL impact.

---

## Auth Flow

1. User enters email on login page
2. Auth.js + Resend sends magic link
3. User clicks link → `verify/page.tsx` handles callback
4. Session stored in httpOnly cookie
5. `proxy.ts` checks session on all `(app)/` routes
6. `lib/dal.ts` provides `verifySession()` for server actions
7. Two users only — allowed emails in `AUTH_ALLOWED_EMAILS` env var (comma-separated). Unrecognized emails get a generic "not authorized" message.

---

## Key Dependencies

```
# Core
next@16
react@19
react-dom@19

# Database
drizzle-orm
drizzle-kit
@vercel/postgres

# Auth
next-auth (Auth.js)
resend

# AI
@anthropic-ai/sdk

# UI
framer-motion
(shadcn/ui components installed individually via CLI)

# Dev
vitest
@testing-library/react
@testing-library/jest-dom
prettier
eslint-config-next
```

---

## Testing Strategy

- **Unit tests** — Business logic in `features/` (stats engine, decay calculation, streak logic, context builder)
- **Integration tests** — Server actions (onboarding flow, check-in processing, pact creation)
- **Mocking** — Claude API mocked in tests, DB queries mocked for unit tests
- **No E2E** — Flows change too fast during week 1, unit/integration gives better ROI

---

## Design System

Deferred to a separate conversation. For MVP, use shadcn/ui defaults + Tailwind for layout. Framer Motion for narrative-specific animations (text reveal, scene transitions).

---

## Known GDD Inconsistencies

- **Mago archetype** lists `INT + mana` as stats, but the stat system only defines VIT, STA, INT, STR (no mana). Needs resolution before implementing archetypes — likely maps to INT + STA or INT + VIT.
