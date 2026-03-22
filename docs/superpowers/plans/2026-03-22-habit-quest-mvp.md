# Habit Quest MVP Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP foundation — auth for two users, 6-screen onboarding, daily check-in, narrative text with Claude, HP decay, and weekly pact.

**Architecture:** Next.js 16 App Router with feature-based structure. Server Actions for all mutations. Single Route Handler for streaming Claude narrative. Drizzle ORM on Vercel Postgres. Auth.js with Resend magic links.

**Tech Stack:** Next.js 16, Drizzle ORM, Vercel Postgres, Auth.js, Resend, Claude API (Sonnet), shadcn/ui, Framer Motion, Tailwind CSS 4, Vitest

**Spec:** `docs/superpowers/specs/2026-03-22-habit-quest-architecture-design.md`

**Next.js 16 docs:** `node_modules/next/dist/docs/01-app/` — READ BEFORE implementing any Next.js pattern. This version has breaking changes from 15.

---

## File Structure

```
app/
  (auth)/
    login/page.tsx                  ← magic link login form
    # verify/ not needed — Auth.js catch-all route handles magic link callback
  (app)/
    layout.tsx                      ← protected layout, redirect if no session
    page.tsx                        ← "El Mundo" main screen
    onboarding/
      page.tsx                      ← wizard container
      _components/
        wizard.tsx                  ← multi-step wizard (client component)
        step-identity.tsx           ← "Quien queres ser"
        step-character.tsx          ← character name
        step-archetype.tsx          ← archetype selection
        step-objective.tsx          ← first arc objective
        step-conducts.tsx           ← up to 3 conducts with time/place
        step-invite.tsx             ← invite partner
      actions.ts                    ← 'use server' — save onboarding data
    checkin/
      page.tsx                      ← check-in screen
      _components/
        checkin-form.tsx            ← Bien/Regular/Dificil + free text
      actions.ts                    ← 'use server' — save check-in, recalc stats
    pact/
      page.tsx                      ← weekly pact screen
      _components/
        pact-form.tsx               ← pact text input
        pact-signature.tsx          ← sign button
      actions.ts                    ← 'use server' — save pact, sign
    history/page.tsx                ← scene history by month
    us/page.tsx                     ← "Nosotros" shared dashboard
    narrative/
      route.ts                      ← streaming Claude response (only Route Handler)
  proxy.ts                          ← auth check, redirects unauthenticated to /login

features/
  stats/
    engine.ts                       ← calculateDecay, updateStats, calculateStreak
    types.ts                        ← Stats, DecayTier, CheckinLevel types
  narrative/
    context-builder.ts              ← buildNarrativeContext from game state
    system-prompt.ts                ← FRIEREN_SYSTEM_PROMPT constant
    types.ts                        ← NarrativeContext, NarrativeTrigger types
  world/
    state.ts                        ← createInitialWorldState, updateWorldState
    types.ts                        ← WorldState types
  onboarding/
    validation.ts                   ← onboarding data validation (zod schemas)
  checkin/
    processing.ts                   ← processCheckin orchestrator (stats + decay + streak)
  pact/
    logic.ts                        ← pact state management (canSign, isComplete)

lib/
  db/
    index.ts                        ← Drizzle client singleton
    schema.ts                       ← all table definitions
    queries.ts                      ← shared query functions (getUser, getStats, getScene, etc)
  claude/
    index.ts                        ← createClaudeClient, generateNarrative
  auth/
    index.ts                        ← Auth.js config (Resend provider)
  dal.ts                            ← verifySession, getCurrentUser (cached)

vitest.config.mts                   ← Vitest config with jsdom
.env.local.example                  ← env var template

__tests__/
  features/
    stats/engine.test.ts            ← decay, stats, streak tests
    narrative/context-builder.test.ts ← context building tests
    world/state.test.ts             ← world state tests
    checkin/processing.test.ts      ← check-in processing tests
  app/
    onboarding/actions.test.ts      ← onboarding server action integration tests
    checkin/actions.test.ts         ← check-in server action integration tests
```

---

## Chunk 1: Project Foundation

Setup dependencies, tooling, database schema, and test infrastructure. After this chunk, `pnpm dev` runs, `pnpm test` runs, and the DB is ready.

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install database dependencies**

```bash
pnpm add drizzle-orm @vercel/postgres
pnpm add -D drizzle-kit
```

- [ ] **Step 2: Install auth dependencies**

```bash
pnpm add next-auth@beta resend
```

- [ ] **Step 3: Install AI dependency**

```bash
pnpm add @anthropic-ai/sdk
```

- [ ] **Step 4: Install UI dependencies**

```bash
pnpm add framer-motion
```

- [ ] **Step 4b: Install validation dependency**

```bash
pnpm add zod
```

- [ ] **Step 5: Install test dependencies**

Ref: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths
```

- [ ] **Step 6: Install prettier**

```bash
pnpm add -D prettier
```

- [ ] **Step 7: Init shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Choose: New York style, neutral color, CSS variables. This creates `components/ui/` and `lib/utils.ts`.

- [ ] **Step 8: Install initial shadcn components**

```bash
pnpm dlx shadcn@latest add button input label card textarea select
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: install all MVP dependencies"
```

---

### Task 2: Configure Vitest

**Files:**
- Create: `vitest.config.mts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Create vitest config**

Ref: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`

Create `vitest.config.mts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
  },
})
```

- [ ] **Step 2: Add test script to package.json**

Add to scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Write a smoke test to verify setup**

Create `__tests__/setup.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('test setup', () => {
  it('works', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Run test**

```bash
pnpm test:run
```

Expected: 1 test passing.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.mts __tests__/setup.test.ts package.json
git commit -m "feat: configure vitest with jsdom"
```

---

### Task 3: Configure Prettier

**Files:**
- Create: `.prettierrc`
- Create: `.prettierignore`

- [ ] **Step 1: Create prettier config**

Create `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

Create `.prettierignore`:

```
node_modules
.next
.vercel
pnpm-lock.yaml
```

- [ ] **Step 2: Add format script to package.json**

```json
"format": "prettier --write ."
```

- [ ] **Step 3: Commit**

```bash
git add .prettierrc .prettierignore package.json
git commit -m "feat: configure prettier"
```

---

### Task 4: Create env template

**Files:**
- Create: `.env.local.example`

- [ ] **Step 1: Create env template**

Create `.env.local.example`:

```bash
# Database (Vercel Postgres)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Auth.js
AUTH_SECRET= # Generate with: npx auth secret
AUTH_ALLOWED_EMAILS=user1@example.com,user2@example.com

# Resend (magic links)
RESEND_API_KEY=

# Claude API
ANTHROPIC_API_KEY=
```

- [ ] **Step 2: Verify .gitignore has .env.local**

Check that `.gitignore` already includes `.env.local` (Next.js default).

- [ ] **Step 3: Commit**

```bash
git add .env.local.example
git commit -m "feat: add env template with all required vars"
```

---

### Task 5: Database schema with Drizzle

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Create Drizzle config**

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})
```

- [ ] **Step 2: Create database schema**

Create `lib/db/schema.ts` with all MVP tables. Reference the GDD Section 12 data model and the spec.

Tables needed for MVP:
- `users` — id, email, characterName, archetype, identityText, onboardingDone, partnerId
- `habits` — id, userId, objectiveArea, identityDescription
- `conducts` — id, habitId, what, whenTime, where, contingency, sortOrder
- `dailyCheckins` — id, userId, date, level, freeNote
- `statsHistory` — id, userId, date, vit, sta, int, str, streak
- `scenes` — id, arcId, type, text, date, isBond
- `arcs` — id, name, month, year, initialDescription, resolution, currentWeek, closed
- `weeklyPacts` — id, weekStart, textP1, textP2, narrativeText, signedP1, signedP2
- `worldState` — id, realmName, npcsJson, zonesJson, currentState

Use Drizzle's `pgTable`, `pgEnum` for archetypes and scene types. Use `serial` or `text` with `cuid2` for IDs. Use `date` for date-only fields, `timestamp` for created_at.

Enums:
- `archetype`: warrior, mage, ranger, healer
- `sceneType`: daily, weekly_close, arc_close, bond
- `checkinLevel`: 1 (bien), 2 (regular), 3 (dificil)

Key constraints:
- `dailyCheckins`: unique on (userId, date)
- `statsHistory`: unique on (userId, date)
- `users.partnerId`: references users.id
- `habits.userId`: unique (one active habit per user)

- [ ] **Step 3: Create Drizzle client**

Create `lib/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

export const db = drizzle(sql, { schema })
```

- [ ] **Step 4: Add drizzle scripts to package.json**

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts lib/db/index.ts drizzle.config.ts package.json
git commit -m "feat: drizzle schema with all MVP tables"
```

---

### Task 5b: Shared database queries

**Files:**
- Create: `lib/db/queries.ts`

- [ ] **Step 1: Create shared queries file**

Create `lib/db/queries.ts` with reusable query functions that server actions and route handlers will use:

- `getUserByEmail(email)` — find user by email with habit and conducts
- `getUserWithStats(userId)` — user + latest stats history entry
- `getLatestCheckin(userId)` — most recent check-in for decay calculation
- `getRecentScenes(arcId, limit)` — last N scenes for narrative context
- `getCurrentArc()` — active (unclosed) arc
- `getCurrentPact()` — pact for current week
- `getWorldState()` — world state singleton
- `getPartner(userId)` — partner user with stats

Each function uses the Drizzle `db` instance from `lib/db/index.ts` and returns typed results.

- [ ] **Step 2: Commit**

```bash
git add lib/db/queries.ts
git commit -m "feat: shared database query functions"
```

---

### Task 6: Feature types

**Files:**
- Create: `features/stats/types.ts`
- Create: `features/narrative/types.ts`
- Create: `features/world/types.ts`

- [ ] **Step 1: Create stats types**

Create `features/stats/types.ts`:

```typescript
export interface Stats {
  vit: number
  sta: number
  int: number
  str: number
}

export type CheckinLevel = 1 | 2 | 3 // 1=bien, 2=regular, 3=dificil

export type Archetype = 'warrior' | 'mage' | 'ranger' | 'healer'

export interface DecayResult {
  stats: Stats
  hoursWithoutCheckin: number
  tier: 'none' | 'subtle' | 'visible' | 'critical'
}

export interface StatsUpdate {
  stats: Stats
  streak: number
  hasStreakShield: boolean
}

// Maps archetype to which stats it boosts
export const ARCHETYPE_STAT_WEIGHTS: Record<Archetype, Partial<Stats>> = {
  warrior: { str: 2, vit: 1.5 },
  mage: { int: 2, sta: 1.5 },    // mana mapped to STA per spec
  ranger: { str: 1.5, sta: 1.5 },
  healer: { vit: 2, sta: 1.5 },
}
```

- [ ] **Step 2: Create narrative types**

Create `features/narrative/types.ts`:

```typescript
import type { Stats, Archetype, CheckinLevel } from '../stats/types'

export type NarrativeTrigger = 'daily' | 'weekly_close' | 'bond' | 'arc_close' | 'arc_open'

export interface CharacterContext {
  name: string
  archetype: Archetype
  stats: Stats
  streak: number
  checkinToday: CheckinLevel | null
  freeNote: string | null
  conducts: string[]
}

export interface NarrativeContext {
  trigger: NarrativeTrigger
  identityP1: string
  identityP2: string | null
  character1: CharacterContext
  character2: CharacterContext | null
  arc: {
    area: string
    description: string
    currentWeek: number
    totalWeeks: number
  }
  pact: {
    textP1: string | null
    textP2: string | null
    narrativeText: string | null
  } | null
  recentScenes: string[] // last 7 scene summaries
  worldState: {
    realmName: string
    currentState: string
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add features/stats/types.ts features/narrative/types.ts features/world/types.ts
git commit -m "feat: add stats, narrative, and world type definitions"
```

- [ ] **Step 4: Create world state types**

Create `features/world/types.ts`:

```typescript
export interface WorldState {
  realmName: string
  npcs: string[]
  zones: string[]
  currentState: 'calm' | 'unsettled' | 'threatened' | 'critical'
}
```

---

## Chunk 2: Stats Engine (TDD)

Pure business logic, no framework dependencies. Fully tested.

### Task 7: Stats decay — tests first

**Files:**
- Create: `features/stats/engine.ts`
- Create: `__tests__/features/stats/engine.test.ts`

- [ ] **Step 1: Write decay tests**

Create `__tests__/features/stats/engine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateDecay } from '../../features/stats/engine'
import type { Stats } from '../../features/stats/types'

const baseStats: Stats = { vit: 80, sta: 70, int: 60, str: 75 }

describe('calculateDecay', () => {
  it('returns no decay within 24 hours', () => {
    const result = calculateDecay(baseStats, 12)
    expect(result.tier).toBe('none')
    expect(result.stats).toEqual(baseStats)
  })

  it('applies subtle decay at 24-48 hours', () => {
    const result = calculateDecay(baseStats, 30)
    expect(result.tier).toBe('subtle')
    expect(result.stats.vit).toBeLessThan(baseStats.vit)
    expect(result.stats.vit).toBeGreaterThan(baseStats.vit - 10)
  })

  it('applies visible decay at 48-72 hours', () => {
    const result = calculateDecay(baseStats, 55)
    expect(result.tier).toBe('visible')
    expect(result.stats.vit).toBeLessThan(baseStats.vit - 5)
  })

  it('applies critical decay at 72+ hours', () => {
    const result = calculateDecay(baseStats, 80)
    expect(result.tier).toBe('critical')
    expect(result.stats.vit).toBeLessThan(baseStats.vit - 15)
  })

  it('never drops stats below 0', () => {
    const lowStats: Stats = { vit: 5, sta: 3, int: 2, str: 1 }
    const result = calculateDecay(lowStats, 100)
    expect(result.stats.vit).toBeGreaterThanOrEqual(0)
    expect(result.stats.sta).toBeGreaterThanOrEqual(0)
    expect(result.stats.int).toBeGreaterThanOrEqual(0)
    expect(result.stats.str).toBeGreaterThanOrEqual(0)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:run __tests__/features/stats/engine.test.ts
```

Expected: FAIL — `calculateDecay` not found.

- [ ] **Step 3: Implement calculateDecay**

Create `features/stats/engine.ts`:

```typescript
import type { Stats, DecayResult } from './types'

const DECAY_RATES = {
  none: 0,
  subtle: 0.05,    // 5% per stat
  visible: 0.12,   // 12% per stat
  critical: 0.25,  // 25% per stat
} as const

type DecayTier = keyof typeof DECAY_RATES

function getDecayTier(hoursWithoutCheckin: number): DecayTier {
  if (hoursWithoutCheckin < 24) return 'none'
  if (hoursWithoutCheckin < 48) return 'subtle'
  if (hoursWithoutCheckin < 72) return 'visible'
  return 'critical'
}

function applyDecay(stat: number, rate: number): number {
  return Math.max(0, Math.round(stat - stat * rate))
}

export function calculateDecay(
  currentStats: Stats,
  hoursWithoutCheckin: number
): DecayResult {
  const tier = getDecayTier(hoursWithoutCheckin)
  const rate = DECAY_RATES[tier]

  if (rate === 0) {
    return { stats: { ...currentStats }, hoursWithoutCheckin, tier }
  }

  return {
    stats: {
      vit: applyDecay(currentStats.vit, rate),
      sta: applyDecay(currentStats.sta, rate),
      int: applyDecay(currentStats.int, rate),
      str: applyDecay(currentStats.str, rate),
    },
    hoursWithoutCheckin,
    tier,
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test:run __tests__/features/stats/engine.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add features/stats/engine.ts __tests__/features/stats/engine.test.ts
git commit -m "feat: stats decay engine with tests"
```

---

### Task 8: Stats update and streak calculation — tests first

**Files:**
- Modify: `features/stats/engine.ts`
- Modify: `__tests__/features/stats/engine.test.ts`

- [ ] **Step 1: Write stats update and streak tests**

Add to `__tests__/features/stats/engine.test.ts`:

```typescript
import { calculateDecay, updateStatsFromCheckin, calculateStreak } from '../../features/stats/engine'

describe('updateStatsFromCheckin', () => {
  it('increases stats on level 1 (bien)', () => {
    const result = updateStatsFromCheckin(baseStats, 1, 'warrior')
    expect(result.vit).toBeGreaterThan(baseStats.vit)
    expect(result.str).toBeGreaterThan(baseStats.str)
  })

  it('keeps stats stable on level 2 (regular)', () => {
    const result = updateStatsFromCheckin(baseStats, 2, 'warrior')
    // Stats should not decrease on regular
    expect(result.vit).toBeGreaterThanOrEqual(baseStats.vit)
  })

  it('slightly decreases stats on level 3 (dificil)', () => {
    const result = updateStatsFromCheckin(baseStats, 3, 'warrior')
    expect(result.vit).toBeLessThanOrEqual(baseStats.vit)
  })

  it('caps stats at 100', () => {
    const highStats: Stats = { vit: 98, sta: 99, int: 97, str: 100 }
    const result = updateStatsFromCheckin(highStats, 1, 'warrior')
    expect(result.vit).toBeLessThanOrEqual(100)
    expect(result.str).toBeLessThanOrEqual(100)
  })

  it('applies archetype weights — warrior boosts STR more', () => {
    const result = updateStatsFromCheckin(baseStats, 1, 'warrior')
    const strGain = result.str - baseStats.str
    const intGain = result.int - baseStats.int
    expect(strGain).toBeGreaterThan(intGain)
  })
})

describe('calculateStreak', () => {
  it('returns 0 for empty checkin dates', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 1 for a single checkin today', () => {
    const today = new Date()
    expect(calculateStreak([today])).toBe(1)
  })

  it('counts consecutive days', () => {
    const dates = [
      new Date('2026-03-22'),
      new Date('2026-03-21'),
      new Date('2026-03-20'),
    ]
    expect(calculateStreak(dates)).toBe(3)
  })

  it('breaks on gap', () => {
    const dates = [
      new Date('2026-03-22'),
      new Date('2026-03-21'),
      new Date('2026-03-19'), // gap on 20th
    ]
    expect(calculateStreak(dates)).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
pnpm test:run __tests__/features/stats/engine.test.ts
```

Expected: new tests FAIL, decay tests still PASS.

- [ ] **Step 3: Implement updateStatsFromCheckin and calculateStreak**

Add to `features/stats/engine.ts`:

```typescript
import type { Stats, DecayResult, CheckinLevel, Archetype } from './types'
import { ARCHETYPE_STAT_WEIGHTS } from './types'

const BASE_GAIN = 3
const LEVEL_MULTIPLIERS: Record<CheckinLevel, number> = {
  1: 1,      // bien: full gain
  2: 0.3,    // regular: small gain
  3: -0.3,   // dificil: slight loss
}

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function updateStatsFromCheckin(
  currentStats: Stats,
  level: CheckinLevel,
  archetype: Archetype
): Stats {
  const multiplier = LEVEL_MULTIPLIERS[level]
  const weights = ARCHETYPE_STAT_WEIGHTS[archetype]

  return {
    vit: clampStat(currentStats.vit + BASE_GAIN * multiplier * (weights.vit ?? 1)),
    sta: clampStat(currentStats.sta + BASE_GAIN * multiplier * (weights.sta ?? 1)),
    int: clampStat(currentStats.int + BASE_GAIN * multiplier * (weights.int ?? 1)),
    str: clampStat(currentStats.str + BASE_GAIN * multiplier * (weights.str ?? 1)),
  }
}

export function calculateStreak(checkinDates: Date[]): number {
  if (checkinDates.length === 0) return 0

  const sorted = [...checkinDates].sort((a, b) => b.getTime() - a.getTime())
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
pnpm test:run __tests__/features/stats/engine.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add features/stats/engine.ts __tests__/features/stats/engine.test.ts
git commit -m "feat: stats update and streak calculation with tests"
```

---

## Chunk 3: Narrative Engine (TDD)

System prompt and context builder. Pure logic, tested.

### Task 9: System prompt

**Files:**
- Create: `features/narrative/system-prompt.ts`

- [ ] **Step 1: Create system prompt**

Create `features/narrative/system-prompt.ts` with the hardcoded Frieren prompt from GDD Section 8:

```typescript
export const FRIEREN_SYSTEM_PROMPT = `Narrá en español, en el estilo de Frieren: Beyond Journey's End. Alternát entre momentos de acción épica y quietud contemplativa — el contraste entre ambos es lo que hace que cada uno impacte. Los combates son breves, intensos y resolutivos. Los momentos cotidianos son lentos, detallados, cargados de significado. Los vínculos entre personajes se construyen en silencio y en pequeños gestos. El tiempo pasa y deja marca visible. Lo mundano sostenido es más heroico que cualquier batalla. Cuando el personaje falla, el mundo acusa el golpe con consecuencias concretas y progresivas — sin juicio moral, pero con pérdida real.

REGLAS:
- Nunca menciones stats, porcentajes, puntos, ni mecánicas de juego.
- Nunca juzgues moralmente al personaje. Sin "sos débil", "fallaste", "decepcionaste".
- Las consecuencias son del MUNDO, no del personaje. El herbolario cierra. La niebla vuelve. El camino se oscurece.
- Narrá en tercera persona.
- Escenas de 3-5 párrafos.
- Usá los nombres de los personajes proporcionados.
- Si hay dos personajes, narrá la dinámica entre los dos según su estado.
- El tono depende del estado: quieto si van bien, tenso si hay decay, épico si superan un desafío.`

export const NARRATIVE_INSTRUCTIONS: Record<string, string> = {
  daily: 'Generá una escena diaria que refleje el estado actual de los personajes y el mundo.',
  weekly_close: 'Generá un cierre narrativo de la semana. Si ambos tuvieron buena racha, incluí un momento de conexión entre los dos.',
  bond: 'Generá una escena de vínculo especial — íntima, lenta, sobre la relación entre los dos personajes. Sin misión. Solo ellos.',
  arc_close: 'Generá la resolución del arco mensual según cómo les fue. Texto más largo, más épico.',
  arc_open: 'Generá el inicio de un nuevo arco. Nuevo territorio, nueva amenaza, nueva promesa.',
}
```

- [ ] **Step 2: Commit**

```bash
git add features/narrative/system-prompt.ts
git commit -m "feat: hardcoded Frieren system prompt and narrative instructions"
```

---

### Task 10: Context builder — tests first

**Files:**
- Create: `features/narrative/context-builder.ts`
- Create: `__tests__/features/narrative/context-builder.test.ts`

- [ ] **Step 1: Write context builder tests**

Create `__tests__/features/narrative/context-builder.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildNarrativeContext, buildPromptMessages } from '../../features/narrative/context-builder'
import type { NarrativeContext } from '../../features/narrative/types'

const mockContext: NarrativeContext = {
  trigger: 'daily',
  identityP1: 'Soy alguien que cuida lo que come',
  identityP2: null,
  character1: {
    name: 'Kael',
    archetype: 'warrior',
    stats: { vit: 80, sta: 70, int: 60, str: 75 },
    streak: 5,
    checkinToday: 1,
    freeNote: 'Cociné aunque estaba cansado',
    conducts: ['preparar desayuno 7:30am cocina'],
  },
  character2: null,
  arc: {
    area: 'alimentación',
    description: 'Primer arco de alimentación',
    currentWeek: 2,
    totalWeeks: 4,
  },
  pact: null,
  recentScenes: ['Kael llegó al claro del bosque.'],
  worldState: {
    realmName: 'Valdris',
    currentState: 'calm',
  },
}

describe('buildNarrativeContext', () => {
  it('builds a valid context string for single player', () => {
    const result = buildNarrativeContext(mockContext)
    expect(result).toContain('Kael')
    expect(result).toContain('warrior')
    expect(result).toContain('Valdris')
    expect(result).toContain('alimentación')
  })

  it('includes partner when present', () => {
    const twoPlayer = {
      ...mockContext,
      identityP2: 'Soy alguien disciplinada',
      character2: {
        name: 'Lyra',
        archetype: 'mage' as const,
        stats: { vit: 60, sta: 90, int: 75, str: 50 },
        streak: 3,
        checkinToday: 2 as const,
        freeNote: null,
        conducts: ['meditar 10pm'],
      },
    }
    const result = buildNarrativeContext(twoPlayer)
    expect(result).toContain('Lyra')
    expect(result).toContain('mage')
  })

  it('includes decay tier description when stats are low', () => {
    const decayed = {
      ...mockContext,
      character1: {
        ...mockContext.character1,
        checkinToday: null,
        streak: 0,
      },
    }
    const result = buildNarrativeContext(decayed)
    expect(result).toContain('no ha registrado hoy')
  })
})

describe('buildPromptMessages', () => {
  it('returns system and user messages', () => {
    const messages = buildPromptMessages(mockContext)
    expect(messages).toHaveLength(2)
    expect(messages[0].role).toBe('system')
    expect(messages[1].role).toBe('user')
  })

  it('system message contains Frieren prompt', () => {
    const messages = buildPromptMessages(mockContext)
    expect(messages[0].content).toContain('Frieren')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:run __tests__/features/narrative/context-builder.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement context builder**

Create `features/narrative/context-builder.ts`:

Build `buildNarrativeContext` that serializes the `NarrativeContext` into a readable string for Claude. Build `buildPromptMessages` that returns an array of `{ role, content }` messages combining the system prompt with the context.

The context string should describe the world state, character states, arc progress, and recent scenes in natural language — NOT JSON. Claude responds better to prose context.

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test:run __tests__/features/narrative/context-builder.test.ts
```

Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add features/narrative/context-builder.ts __tests__/features/narrative/context-builder.test.ts
git commit -m "feat: narrative context builder with tests"
```

---

### Task 11: Claude client wrapper

**Files:**
- Create: `lib/claude/index.ts`

- [ ] **Step 1: Create Claude client**

Create `lib/claude/index.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function* streamNarrative(
  messages: { role: 'system' | 'user'; content: string }[]
): AsyncGenerator<string> {
  const systemMessage = messages.find((m) => m.role === 'system')
  const userMessages = messages.filter((m) => m.role === 'user')

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemMessage?.content ?? '',
    messages: userMessages.map((m) => ({ role: 'user' as const, content: m.content })),
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield event.delta.text
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/claude/index.ts
git commit -m "feat: claude client with streaming narrative generation"
```

---

### Task 11b: World state logic — tests first

**Files:**
- Create: `features/world/state.ts`
- Create: `__tests__/features/world/state.test.ts`

- [ ] **Step 1: Write world state tests**

Create `__tests__/features/world/state.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { createInitialWorldState, deriveWorldMood } from '../../features/world/state'

describe('createInitialWorldState', () => {
  it('creates a default world state with realm name', () => {
    const state = createInitialWorldState()
    expect(state.realmName).toBeTruthy()
    expect(state.currentState).toBe('calm')
    expect(state.npcs).toEqual([])
    expect(state.zones).toEqual([])
  })
})

describe('deriveWorldMood', () => {
  it('returns calm when both players have good stats', () => {
    expect(deriveWorldMood('none', 'none')).toBe('calm')
  })

  it('returns unsettled when one player has subtle decay', () => {
    expect(deriveWorldMood('subtle', 'none')).toBe('unsettled')
  })

  it('returns threatened when visible decay', () => {
    expect(deriveWorldMood('visible', 'none')).toBe('threatened')
  })

  it('returns critical when critical decay', () => {
    expect(deriveWorldMood('critical', 'none')).toBe('critical')
  })

  it('uses the worse tier between two players', () => {
    expect(deriveWorldMood('none', 'critical')).toBe('critical')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:run __tests__/features/world/state.test.ts
```

- [ ] **Step 3: Implement world state logic**

Create `features/world/state.ts`:

```typescript
import type { WorldState } from './types'

export function createInitialWorldState(): WorldState {
  return {
    realmName: 'Valdris',
    npcs: [],
    zones: [],
    currentState: 'calm',
  }
}

type DecayTier = 'none' | 'subtle' | 'visible' | 'critical'

const TIER_SEVERITY: Record<DecayTier, number> = {
  none: 0,
  subtle: 1,
  visible: 2,
  critical: 3,
}

const SEVERITY_TO_MOOD: Record<number, WorldState['currentState']> = {
  0: 'calm',
  1: 'unsettled',
  2: 'threatened',
  3: 'critical',
}

export function deriveWorldMood(
  player1Decay: DecayTier,
  player2Decay: DecayTier | null
): WorldState['currentState'] {
  const severity1 = TIER_SEVERITY[player1Decay]
  const severity2 = player2Decay ? TIER_SEVERITY[player2Decay] : 0
  const maxSeverity = Math.max(severity1, severity2)
  return SEVERITY_TO_MOOD[maxSeverity] ?? 'calm'
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test:run __tests__/features/world/state.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add features/world/state.ts __tests__/features/world/state.test.ts
git commit -m "feat: world state logic with tests"
```

---

### Task 11c: Check-in processing logic — tests first

**Files:**
- Create: `features/checkin/processing.ts`
- Create: `__tests__/features/checkin/processing.test.ts`

- [ ] **Step 1: Write check-in processing tests**

Create `__tests__/features/checkin/processing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { processCheckin } from '../../features/checkin/processing'

describe('processCheckin', () => {
  it('returns updated stats and incremented streak on level 1', () => {
    const result = processCheckin({
      currentStats: { vit: 50, sta: 50, int: 50, str: 50 },
      level: 1,
      archetype: 'warrior',
      previousCheckinDates: [new Date('2026-03-21')],
      lastCheckinHoursAgo: 20,
    })
    expect(result.newStats.str).toBeGreaterThan(50)
    expect(result.newStreak).toBe(2)
    expect(result.decayApplied).toBe(false)
  })

  it('applies decay before stat update if last checkin was 30+ hours ago', () => {
    const result = processCheckin({
      currentStats: { vit: 80, sta: 80, int: 80, str: 80 },
      level: 1,
      archetype: 'warrior',
      previousCheckinDates: [new Date('2026-03-20')],
      lastCheckinHoursAgo: 36,
    })
    expect(result.decayApplied).toBe(true)
    // Stats should still increase because checkin offsets decay
  })

  it('resets streak to 1 if gap in checkin dates', () => {
    const result = processCheckin({
      currentStats: { vit: 50, sta: 50, int: 50, str: 50 },
      level: 1,
      archetype: 'warrior',
      previousCheckinDates: [new Date('2026-03-19')], // gap on 20th, today is 22nd
      lastCheckinHoursAgo: 50,
    })
    expect(result.newStreak).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:run __tests__/features/checkin/processing.test.ts
```

- [ ] **Step 3: Implement processCheckin**

Create `features/checkin/processing.ts` that orchestrates: calculate decay → apply decay → update stats from checkin → calculate new streak. Uses functions from `features/stats/engine.ts`.

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm test:run __tests__/features/checkin/processing.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add features/checkin/processing.ts __tests__/features/checkin/processing.test.ts
git commit -m "feat: check-in processing orchestrator with tests"
```

---

## Chunk 4: Auth

Auth.js with Resend magic links, proxy.ts, DAL.

### Task 12: Auth.js configuration

**Files:**
- Create: `lib/auth/index.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Configure Auth.js with Resend**

Ref: `node_modules/next/dist/docs/01-app/02-guides/authentication.md`

Create `lib/auth/index.ts` with Auth.js configuration using the Resend email provider for magic links. Configure with:
- `AUTH_SECRET` from env
- Resend provider with `RESEND_API_KEY`
- Session strategy: `jwt`
- Callbacks to check `AUTH_ALLOWED_EMAILS` on signIn

Create `app/api/auth/[...nextauth]/route.ts` with the standard Auth.js route handler export.

- [ ] **Step 2: Create DAL**

Create `lib/dal.ts`:

```typescript
import { cache } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const session = await auth()
  if (!session?.user?.email) {
    redirect('/login')
  }
  return session
})

export const getCurrentUser = cache(async () => {
  const session = await verifySession()
  // Query user from DB by session email
  // Return user with character data
  return session.user
})
```

- [ ] **Step 3: Commit**

```bash
git add lib/auth/index.ts lib/dal.ts app/api/auth/
git commit -m "feat: auth.js with resend magic links and DAL"
```

---

### Task 13: Proxy and auth routes

**Files:**
- Create: `app/proxy.ts`
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Create proxy.ts**

Ref: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`

Create `app/proxy.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = !isAuthRoute && !request.nextUrl.pathname.startsWith('/api/auth')

  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Create login page**

Create `app/(auth)/login/page.tsx` with a simple magic link form. Use shadcn/ui `<Input>`, `<Button>`, `<Card>`. Form calls Auth.js signIn with email provider.

- [ ] **Step 3: Commit**

```bash
git add app/proxy.ts app/(auth)/login/page.tsx
git commit -m "feat: proxy auth check and login page"
```

---

### Task 14: Protected layout

**Files:**
- Create: `app/(app)/layout.tsx`

- [ ] **Step 1: Create protected layout**

Create `app/(app)/layout.tsx` that:
1. Calls `verifySession()` from DAL
2. Checks if user has completed onboarding
3. If not, redirects to `/onboarding`
4. Wraps children in base layout

- [ ] **Step 2: Commit**

```bash
git add app/(app)/layout.tsx
git commit -m "feat: protected layout with onboarding redirect"
```

---

## Chunk 5: Onboarding

6-screen wizard with server actions.

### Task 15: Onboarding wizard shell

**Files:**
- Create: `app/(app)/onboarding/page.tsx`
- Create: `app/(app)/onboarding/_components/wizard.tsx`

- [ ] **Step 1: Create wizard container**

Create the onboarding `page.tsx` as a server component that checks if onboarding is already done (redirect to `/` if so).

Create `wizard.tsx` as a client component that manages the current step (1-6) with state, renders the appropriate step component, and has next/back navigation.

- [ ] **Step 2: Commit**

```bash
git add app/(app)/onboarding/
git commit -m "feat: onboarding wizard shell with step navigation"
```

---

### Task 16: Onboarding steps 1-4

**Files:**
- Create: `app/(app)/onboarding/_components/step-identity.tsx`
- Create: `app/(app)/onboarding/_components/step-character.tsx`
- Create: `app/(app)/onboarding/_components/step-archetype.tsx`
- Create: `app/(app)/onboarding/_components/step-objective.tsx`

- [ ] **Step 1: Create step components**

Each step is a client component receiving `onNext(data)` callback:

1. **StepIdentity** — textarea: "Quien queres ser al final de este año?"
2. **StepCharacter** — input: character name
3. **StepArchetype** — 4 cards (warrior/mage/ranger/healer) with description
4. **StepObjective** — 4 suggestions + editable input for first arc objective area

Use shadcn/ui components. Framer Motion for step transitions (AnimatePresence + motion.div with slide animation).

- [ ] **Step 2: Commit**

```bash
git add app/(app)/onboarding/_components/
git commit -m "feat: onboarding steps 1-4 (identity, character, archetype, objective)"
```

---

### Task 17: Onboarding steps 5-6

**Files:**
- Create: `app/(app)/onboarding/_components/step-conducts.tsx`
- Create: `app/(app)/onboarding/_components/step-invite.tsx`

- [ ] **Step 1: Create conduct and invite steps**

5. **StepConducts** — up to 3 conducts. Each has: what (input), when (time picker), where (input), contingency (optional input). Add/remove conduct buttons.
6. **StepInvite** — input for partner email. "Enviar invitacion" button. Skip option.

- [ ] **Step 2: Commit**

```bash
git add app/(app)/onboarding/_components/step-conducts.tsx app/(app)/onboarding/_components/step-invite.tsx
git commit -m "feat: onboarding steps 5-6 (conducts, invite)"
```

---

### Task 17b: Onboarding validation

**Files:**
- Create: `features/onboarding/validation.ts`

- [ ] **Step 1: Create onboarding validation schemas**

Create `features/onboarding/validation.ts` with Zod schemas for validating onboarding data:

- `identitySchema` — non-empty string, max 500 chars
- `characterSchema` — name: non-empty string, max 50 chars
- `archetypeSchema` — enum: warrior | mage | ranger | healer
- `objectiveSchema` — area: non-empty string, max 200 chars
- `conductSchema` — what: string, whenTime: string (HH:mm), where: string, contingency: optional string
- `onboardingSchema` — combines all the above

- [ ] **Step 2: Commit**

```bash
git add features/onboarding/validation.ts
git commit -m "feat: onboarding validation schemas"
```

---

### Task 18: Onboarding server actions

**Files:**
- Create: `app/(app)/onboarding/actions.ts`

- [ ] **Step 1: Create onboarding server actions**

Create `app/(app)/onboarding/actions.ts` with `'use server'` directive. Actions:

- `saveOnboarding(prevState, formData)` — validates with `onboardingSchema` from `features/onboarding/validation.ts`, creates/updates user record, creates habit, creates conducts, creates initial arc via queries, creates initial world state via `createInitialWorldState()` from `features/world/state.ts`, sets onboardingDone = true.
- `sendPartnerInvite(email)` — validates email is in AUTH_ALLOWED_EMAILS, links partner.

Both actions call `verifySession()` from DAL first. Use queries from `lib/db/queries.ts`.

- [ ] **Step 2: Commit**

```bash
git add app/(app)/onboarding/actions.ts
git commit -m "feat: onboarding server actions"
```

---

## Chunk 6: Check-in, Narrative Streaming, Main Screen

### Task 19: Check-in form and action

**Files:**
- Create: `app/(app)/checkin/page.tsx`
- Create: `app/(app)/checkin/_components/checkin-form.tsx`
- Create: `app/(app)/checkin/actions.ts`

- [ ] **Step 1: Create check-in page and form**

Check-in page shows contextual text based on time of day (morning/midday/night) per GDD Section 11.

Form: three large buttons (Bien / Regular / Difícil) + optional textarea for free note. Use `useActionState` for form submission.

- [ ] **Step 2: Create check-in server action**

`app/(app)/checkin/actions.ts`:
- `submitCheckin(prevState, formData)` — verifies session, saves DailyCheckin, calls `processCheckin` from `features/checkin/processing.ts` (which orchestrates decay + stats update + streak), saves new StatsHistory, updates world state mood via `deriveWorldMood` from `features/world/state.ts`, redirects to main page. Uses queries from `lib/db/queries.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/checkin/
git commit -m "feat: daily check-in form and server action"
```

---

### Task 20: Narrative streaming route

**Files:**
- Create: `app/(app)/narrative/route.ts`

- [ ] **Step 1: Create streaming route handler**

Ref: `node_modules/next/dist/docs/01-app/02-guides/streaming.md`

Create `app/(app)/narrative/route.ts`:

```typescript
import { streamNarrative } from '@/lib/claude'
import { buildPromptMessages } from '@/features/narrative/context-builder'
import { buildNarrativeContext } from '@/features/narrative/context-builder'
import { verifySession } from '@/lib/dal'
import {
  getUserWithStats, getPartner, getCurrentArc,
  getCurrentPact, getRecentScenes, getWorldState
} from '@/lib/db/queries'

export async function POST(request: Request) {
  const session = await verifySession()
  const { trigger } = await request.json()

  // Load all game state via shared queries
  const user = await getUserWithStats(session.user.id)
  const partner = await getPartner(session.user.id)
  const arc = await getCurrentArc()
  const pact = await getCurrentPact()
  const scenes = await getRecentScenes(arc?.id, 7)
  const world = await getWorldState()

  // Build narrative context from game state
  const context = buildNarrativeContext({
    trigger,
    identityP1: user.identityText,
    identityP2: partner?.identityText ?? null,
    character1: { /* map from user */ },
    character2: partner ? { /* map from partner */ } : null,
    arc: { /* map from arc */ },
    pact: pact ? { /* map from pact */ } : null,
    recentScenes: scenes.map(s => s.text),
    worldState: { realmName: world.realmName, currentState: world.currentState },
  })
  const messages = buildPromptMessages(context)

  // Stream Claude response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let fullText = ''
      for await (const chunk of streamNarrative(messages)) {
        fullText += chunk
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
      // TODO: Save scene to DB with fullText (fire-and-forget)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(app)/narrative/route.ts
git commit -m "feat: narrative streaming route handler with Claude"
```

---

### Task 21: Main screen — "El Mundo"

**Files:**
- Modify: `app/(app)/page.tsx`

- [ ] **Step 1: Create main screen**

`app/(app)/page.tsx` — the main screen that users see when they open the app:

1. Server component that loads: current scene, current stats, pact, streak
2. Displays: scene text (latest narrative), pact summary (if active), check-in button
3. Stats displayed as character sheet (VIT/STA/INT/STR bars)
4. "Registrar" button links to `/checkin`
5. Navigation to `/history`, `/us`, `/pact`

Use Suspense boundaries for data that loads independently.

- [ ] **Step 2: Commit**

```bash
git add app/(app)/page.tsx
git commit -m "feat: main screen El Mundo with scene, stats, navigation"
```

---

## Chunk 7: Weekly Pact, History, "Nosotros"

### Task 22: Weekly pact

**Files:**
- Create: `app/(app)/pact/page.tsx`
- Create: `app/(app)/pact/_components/pact-form.tsx`
- Create: `app/(app)/pact/_components/pact-signature.tsx`
- Create: `app/(app)/pact/actions.ts`

- [ ] **Step 1: Create pact page and components**

Pact page: shows current pact if exists (with signature status), or form to create new one.

PactForm: textarea for pact text + submit. Uses `useActionState`.

PactSignature: "Firmar" button with Framer Motion seal animation. Only enabled when both players have written their text.

- [ ] **Step 2: Create pact server actions**

`actions.ts`:
- `savePactText(prevState, formData)` — saves user's pact text for the current week
- `signPact()` — marks current user as signed. When both signed, triggers Claude to generate narrative pact text.

- [ ] **Step 3: Commit**

```bash
git add app/(app)/pact/
git commit -m "feat: weekly pact with form, signature, and server actions"
```

---

### Task 23: History page

**Files:**
- Create: `app/(app)/history/page.tsx`

- [ ] **Step 1: Create history page**

Server component that:
1. Loads all scenes grouped by arc/month
2. Displays them chronologically, like chapters of a book
3. Bond scenes marked with special styling
4. Uses Suspense for loading state

- [ ] **Step 2: Commit**

```bash
git add app/(app)/history/page.tsx
git commit -m "feat: scene history page grouped by month"
```

---

### Task 24: "Nosotros" page

**Files:**
- Create: `app/(app)/us/page.tsx`

- [ ] **Step 1: Create "Nosotros" page**

Server component showing:
1. Both characters side by side (name, archetype, stats)
2. Active pact text
3. Combined streak info
4. Next bond scene availability ("en X días si ambos mantienen")

Only visible if user has a partner linked.

- [ ] **Step 2: Commit**

```bash
git add app/(app)/us/page.tsx
git commit -m "feat: Nosotros shared dashboard page"
```

---

## Chunk 7b: Server Action Integration Tests

### Task 24b: Onboarding server action tests

**Files:**
- Create: `__tests__/app/onboarding/actions.test.ts`

- [ ] **Step 1: Write onboarding action integration tests**

Create `__tests__/app/onboarding/actions.test.ts`. Mock the DB and auth, then test:

- `saveOnboarding` creates user record with correct fields
- `saveOnboarding` creates habit with conducts
- `saveOnboarding` creates initial arc and world state
- `saveOnboarding` sets onboardingDone to true
- `saveOnboarding` rejects if session is invalid

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:run __tests__/app/onboarding/actions.test.ts
```

- [ ] **Step 3: Fix any issues in onboarding actions to make tests pass**

- [ ] **Step 4: Commit**

```bash
git add __tests__/app/onboarding/actions.test.ts
git commit -m "test: onboarding server action integration tests"
```

---

### Task 24c: Check-in server action tests

**Files:**
- Create: `__tests__/app/checkin/actions.test.ts`

- [ ] **Step 1: Write check-in action integration tests**

Create `__tests__/app/checkin/actions.test.ts`. Mock the DB and auth, then test:

- `submitCheckin` saves a DailyCheckin record
- `submitCheckin` updates stats via processCheckin
- `submitCheckin` prevents duplicate check-in for same day
- `submitCheckin` rejects if session is invalid

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm test:run __tests__/app/checkin/actions.test.ts
```

- [ ] **Step 3: Fix any issues in check-in actions to make tests pass**

- [ ] **Step 4: Commit**

```bash
git add __tests__/app/checkin/actions.test.ts
git commit -m "test: check-in server action integration tests"
```

---

## Chunk 8: Integration and Polish

### Task 25: Wire up root layout and navigation

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Update root layout**

Update `app/layout.tsx`:
- Set metadata (title: "Habit Quest", description)
- Dark theme by default (class on html tag)
- Import global styles

- [ ] **Step 2: Add navigation to protected layout**

Update `app/(app)/layout.tsx` with minimal bottom navigation:
- El Mundo (home)
- Historial
- Nosotros (if has partner)
- Pacto

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/(app)/layout.tsx
git commit -m "feat: root layout with dark theme and bottom navigation"
```

---

### Task 26: Gitignore updates

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add project-specific ignores**

Add to `.gitignore`:

```
.superpowers/
drizzle/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update gitignore for superpowers and drizzle"
```

---

### Task 27: Verify full flow

- [ ] **Step 1: Run all tests**

```bash
pnpm test:run
```

Expected: all tests pass.

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: successful build.

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Verify:
1. `/login` shows magic link form
2. Login redirects to `/onboarding` (first time)
3. Onboarding wizard works through all 6 steps
4. After onboarding, main screen shows
5. Check-in flow works
6. Narrative streams text
7. Pact creation and signing works

- [ ] **Step 4: Final commit if any fixes**

```bash
git add -A
git commit -m "fix: integration fixes from smoke test"
```
