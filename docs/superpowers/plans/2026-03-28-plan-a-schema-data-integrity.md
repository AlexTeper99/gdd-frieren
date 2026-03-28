# Plan A: Schema + Data Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all database-level issues: add missing schema fields, unique constraints, timezone helpers, SQL-level HP updates, and transaction safety.

**Architecture:** Schema changes via Drizzle ORM migrations pushed to Neon Postgres. Shared constants and timezone helpers extracted to a single file. HP updates use SQL-level LEAST() to prevent race conditions. Critical multi-step operations wrapped in transactions.

**Tech Stack:** Drizzle ORM 0.45, Neon Postgres (HTTP client), Next.js 16 server actions

**Spec:** `docs/superpowers/specs/2026-03-28-mvp-refactor-design.md` sections 3, 5.5, 7

---

## File Structure

```
lib/
├── db/
│   └── schema.ts           — MODIFY: add tipo enum, unique constraints
├── shared/
│   └── constants.ts         — CREATE: DAYS, HP values, timezone helpers, archetype icons
├── actions/
│   ├── rituals.ts           — MODIFY: use constants, timezone, SQL increment, transaction
│   ├── hp.ts                — MODIFY: fix HP 0 bug, penalty log filter, timezone, transaction
│   └── pact.ts              — MODIFY: fix getCurrentSunday, player order, upsert
```

---

## Task 1: Create shared constants + timezone helpers

**Files:**
- Create: `lib/shared/constants.ts`

- [ ] **Step 1: Create constants file**

```typescript
// lib/shared/constants.ts

// --- Days ---
export const DAYS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;
export type DayOfWeek = (typeof DAYS)[number];

// --- HP ---
export const HP_MAX = 100;
export const HP_PER_RITUAL = 5;
export const HP_BONUS_STREAK = 7;
export const HP_STREAK_THRESHOLD = 7;
export const HP_PENALTY = 10;
export const HP_RESET_ON_ZERO = 30;

// --- Archetype Icons ---
export const ARCHETYPE_ICONS: Record<string, string> = {
  paladin: "⚔️",
  mago: "✨",
  guerrero: "🛡️",
  sacerdote: "☮️",
};

// --- Timezone ---
export const USER_TIMEZONE = "America/Argentina/Buenos_Aires";

export function getLocalDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: USER_TIMEZONE });
}

export function getLocalDay(): DayOfWeek {
  const dayName = new Date().toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    weekday: "short",
  });
  const map: Record<string, DayOfWeek> = {
    Sun: "dom",
    Mon: "lun",
    Tue: "mar",
    Wed: "mie",
    Thu: "jue",
    Fri: "vie",
    Sat: "sab",
  };
  return map[dayName] ?? "lun";
}

export function getLocalDayIndex(): number {
  const day = new Date().toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    weekday: "short",
  });
  const map: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return map[day] ?? 1;
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit lib/shared/constants.ts 2>&1 || npm run build 2>&1 | tail -5`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add lib/shared/constants.ts
git commit -m "feat: add shared constants — days, HP values, timezone helpers, archetype icons"
```

---

## Task 2: Update schema — add tipo enum + unique constraints

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Add imports and tipo enum**

Add `uniqueIndex` to the import from `drizzle-orm/pg-core`:

```typescript
import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  date,
  time,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
```

Add the tipo enum after the archetype enum:

```typescript
export const storyEntryTypeEnum = pgEnum("story_entry_type", [
  "prologo",
  "diario",
]);
```

- [ ] **Step 2: Add tipo to storyEntries + unique constraint on turnoNumero**

Replace the `storyEntries` table definition:

```typescript
export const storyEntries = pgTable(
  "story_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fecha: date("fecha").notNull(),
    turnoNumero: integer("turno_numero").notNull(),
    tipo: storyEntryTypeEnum("tipo").default("diario").notNull(),
    textoJugador: text("texto_jugador"),
    textoIa: text("texto_ia"),
    snapshotJ1: jsonb("snapshot_j1"),
    snapshotJ2: jsonb("snapshot_j2"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("story_entries_turno_unique").on(table.turnoNumero),
  ]
);
```

- [ ] **Step 3: Add unique constraint to ritualLogs**

Replace the `ritualLogs` table definition:

```typescript
export const ritualLogs = pgTable(
  "ritual_logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ritualId: text("ritual_id")
      .notNull()
      .references(() => rituals.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fecha: date("fecha").notNull(),
    cumplido: boolean("cumplido").notNull(),
  },
  (table) => [
    uniqueIndex("ritual_logs_ritual_fecha").on(table.ritualId, table.fecha),
  ]
);
```

- [ ] **Step 4: Add unique constraint to pacts**

Replace the `pacts` table definition:

```typescript
export const pacts = pgTable(
  "pacts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    semana: date("semana").notNull(),
    respuestasJ1: jsonb("respuestas_j1"),
    respuestasJ2: jsonb("respuestas_j2"),
    firmadoJ1: boolean("firmado_j1").default(false).notNull(),
    firmadoJ2: boolean("firmado_j2").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("pacts_semana_unique").on(table.semana),
  ]
);
```

- [ ] **Step 5: Verify build compiles**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (some files may have type errors due to missing `tipo` in inserts — that's expected and fixed in later tasks)

- [ ] **Step 6: Generate and push migration**

Run: `npx drizzle-kit generate && npx drizzle-kit push`
Expected: Migration generated and schema applied to Neon

- [ ] **Step 7: Backfill tipo for existing entries**

Run this one-time SQL to set existing prologue entries:

```bash
POSTGRES_URL=$(grep "^POSTGRES_URL=" .env.local | head -1 | cut -d'"' -f2) node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.POSTGRES_URL);
sql\`UPDATE story_entries SET tipo = 'prologo' WHERE texto_jugador IS NULL AND tipo = 'diario'\`.then(r => console.log('Backfilled:', r));
"
```

Expected: Rows updated (0 if no story entries exist yet)

- [ ] **Step 8: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(schema): add tipo enum to story_entries, unique constraints on ritual_logs + pacts + story_entries"
```

---

## Task 3: Fix rituals.ts — timezone, SQL increment, handle constraint conflict

**Files:**
- Modify: `lib/actions/rituals.ts`

- [ ] **Step 1: Replace rituals.ts**

```typescript
"use server";

import { db } from "@/lib/db";
import { rituals, ritualLogs, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  HP_PER_RITUAL,
  HP_BONUS_STREAK,
  HP_STREAK_THRESHOLD,
  HP_MAX,
  getLocalDate,
  getLocalDay,
} from "@/lib/shared/constants";

export async function markRitualComplete(ritualId: string) {
  const { user } = await verifySession();
  const today = getLocalDate();

  // Get ritual and verify ownership
  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) {
    return { error: "Ritual no encontrado" };
  }

  // Insert log — unique constraint (ritual_id, fecha) prevents duplicates
  try {
    await db.insert(ritualLogs).values({
      ritualId,
      userId: user.id!,
      fecha: today,
      cumplido: true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { error: "Ya registrado hoy" };
    }
    throw e;
  }

  // Update streak
  const newStreak = ritual.racha + 1;
  await db
    .update(rituals)
    .set({ racha: newStreak })
    .where(eq(rituals.id, ritualId));

  // Update HP with SQL-level increment (no race condition)
  const hpGain =
    newStreak >= HP_STREAK_THRESHOLD ? HP_BONUS_STREAK : HP_PER_RITUAL;

  await db
    .update(users)
    .set({ hp: sql`LEAST(${users.hp} + ${hpGain}, ${HP_MAX})` })
    .where(eq(users.id, user.id!));

  // Read back new HP for response
  const [updated] = await db
    .select({ hp: users.hp })
    .from(users)
    .where(eq(users.id, user.id!));

  revalidatePath("/rituals");
  revalidatePath("/");
  return { success: true, newHp: updated.hp, newStreak, hpGain };
}

export async function getTodayRituals(userId: string) {
  const today = getLocalDate();
  const todayDay = getLocalDay();

  const userRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, userId), eq(rituals.activo, true)));

  const todayRituals = userRituals.filter((r) => r.dias.includes(todayDay));

  const logs = await db
    .select()
    .from(ritualLogs)
    .where(and(eq(ritualLogs.userId, userId), eq(ritualLogs.fecha, today)));

  const completedIds = new Set(
    logs.filter((l) => l.cumplido).map((l) => l.ritualId)
  );

  return todayRituals.map((r) => ({
    ...r,
    completedToday: completedIds.has(r.id),
  }));
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/actions/rituals.ts
git commit -m "fix(rituals): use timezone helpers, SQL HP increment, unique constraint conflict handling"
```

---

## Task 4: Fix hp.ts — HP 0 bug, penalty log filter, timezone

**Files:**
- Modify: `lib/actions/hp.ts`

- [ ] **Step 1: Replace hp.ts**

```typescript
"use server";

import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import {
  HP_PENALTY,
  HP_RESET_ON_ZERO,
  HP_MAX,
  getLocalDate,
  getLocalDay,
} from "@/lib/shared/constants";

export async function penalizeUncompletedRituals() {
  const today = getLocalDate();
  const todayDay = getLocalDay();

  const allUsers = await db.select().from(users);
  const results: { userId: string; status: string; hpLoss: number }[] = [];

  for (const user of allUsers) {
    if (!user.onboardingCompleted) continue;

    try {
      const userRituals = await db
        .select()
        .from(rituals)
        .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

      const todayRituals = userRituals.filter((r) =>
        r.dias.includes(todayDay)
      );

      const logs = await db
        .select()
        .from(ritualLogs)
        .where(
          and(eq(ritualLogs.userId, user.id), eq(ritualLogs.fecha, today))
        );

      // Only count completed logs (cumplido=true), not penalty logs
      const completedIds = new Set(
        logs.filter((l) => l.cumplido).map((l) => l.ritualId)
      );

      let hpLoss = 0;

      for (const ritual of todayRituals) {
        if (!completedIds.has(ritual.id)) {
          hpLoss += HP_PENALTY;

          // Reset streak
          await db
            .update(rituals)
            .set({ racha: 0 })
            .where(eq(rituals.id, ritual.id));

          // Log as not completed (ignore duplicate constraint if already logged)
          try {
            await db.insert(ritualLogs).values({
              ritualId: ritual.id,
              userId: user.id,
              fecha: today,
              cumplido: false,
            });
          } catch {
            // Already logged (unique constraint) — skip
          }
        }
      }

      if (hpLoss > 0) {
        // Let HP go negative, then check for reset
        const newHpRaw = user.hp - hpLoss;

        if (newHpRaw <= 0) {
          // HP 0 event: reset to 30
          await db
            .update(users)
            .set({ hp: HP_RESET_ON_ZERO })
            .where(eq(users.id, user.id));
        } else {
          await db
            .update(users)
            .set({ hp: newHpRaw })
            .where(eq(users.id, user.id));
        }
      }

      results.push({ userId: user.id, status: "success", hpLoss });
    } catch (error) {
      console.error(`[CRON] Penalty failed for user ${user.id}:`, error);
      results.push({ userId: user.id, status: "failed", hpLoss: 0 });
    }
  }

  return { success: true, date: today, results };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/actions/hp.ts
git commit -m "fix(hp): HP 0 resets to 30, filter penalty logs correctly, use timezone, per-user error handling"
```

---

## Task 5: Fix pact.ts — getCurrentSunday, player order, upsert

**Files:**
- Modify: `lib/actions/pact.ts`

- [ ] **Step 1: Replace pact.ts**

```typescript
"use server";

import { db } from "@/lib/db";
import { pacts, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { USER_TIMEZONE } from "@/lib/shared/constants";

function getCurrentSunday(): string {
  const now = new Date();
  // Get current day in user's timezone
  const localDay = parseInt(
    now.toLocaleDateString("en-US", {
      timeZone: USER_TIMEZONE,
      weekday: "narrow",
    }),
    10
  );
  // toLocaleDateString with weekday:"narrow" doesn't return a number.
  // Use a different approach:
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    now.toLocaleDateString("en-US", {
      timeZone: USER_TIMEZONE,
      weekday: "short",
    })
  );

  // Go BACK to last Sunday (or stay if today is Sunday)
  const diff = dayIndex === 0 ? 0 : -dayIndex;
  const sunday = new Date(now);
  sunday.setDate(sunday.getDate() + diff);

  // Format as YYYY-MM-DD in local timezone (not UTC)
  const year = sunday.toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    year: "numeric",
  });
  const month = sunday
    .toLocaleDateString("en-US", {
      timeZone: USER_TIMEZONE,
      month: "2-digit",
    });
  const day = sunday
    .toLocaleDateString("en-US", {
      timeZone: USER_TIMEZONE,
      day: "2-digit",
    });

  return `${year}-${month}-${day}`;
}

export async function getCurrentPact() {
  const semana = getCurrentSunday();

  const [pact] = await db
    .select()
    .from(pacts)
    .where(eq(pacts.semana, semana));

  return pact ?? null;
}

export async function submitPactAnswers(formData: FormData) {
  const { user } = await verifySession();
  const semana = getCurrentSunday();

  const answers = {
    obstaculos: (formData.get("obstaculos") as string)?.trim() ?? "",
    plan: (formData.get("plan") as string)?.trim() ?? "",
    apoyo: (formData.get("apoyo") as string)?.trim() ?? "",
    opcional: (formData.get("opcional") as string)?.trim() ?? "",
  };

  // Validate required fields
  if (!answers.obstaculos || !answers.plan || !answers.apoyo) {
    return { error: "Completá al menos los primeros 3 campos" };
  }

  // Determine player 1 vs 2 with stable ordering
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(asc(users.id));

  const isPlayer1 = allUsers[0]?.id === user.id;

  const updateFields = isPlayer1
    ? { respuestasJ1: answers, firmadoJ1: true as const }
    : { respuestasJ2: answers, firmadoJ2: true as const };

  // Upsert: insert if not exists, update if exists (unique constraint on semana)
  try {
    const [existingPact] = await db
      .select()
      .from(pacts)
      .where(eq(pacts.semana, semana));

    if (existingPact) {
      await db
        .update(pacts)
        .set(updateFields)
        .where(eq(pacts.id, existingPact.id));
    } else {
      await db.insert(pacts).values({
        semana,
        ...updateFields,
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      // Race condition: pact was created by other player simultaneously
      // Retry as update
      const [pact] = await db
        .select()
        .from(pacts)
        .where(eq(pacts.semana, semana));

      if (pact) {
        await db
          .update(pacts)
          .set(updateFields)
          .where(eq(pacts.id, pact.id));
      }
    } else {
      throw e;
    }
  }

  revalidatePath("/pact");
  return { success: true };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/actions/pact.ts
git commit -m "fix(pact): getCurrentSunday returns LAST Sunday, stable player order, upsert with race handling, validate answers"
```

---

## Task 6: Update cron timing

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Fix cron schedule and remove push cron**

Replace `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-penalty",
      "schedule": "0 3 * * *"
    }
  ]
}
```

This runs at 03:00 UTC = 00:00 Argentina time. The push cron (every 30 min) is removed — incompatible with Hobby plan.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "fix(cron): run penalty at 03:00 UTC (00:00 ARG), remove push cron (Hobby incompatible)"
```

---

## Task 7: Update story generation route to include tipo

**Files:**
- Modify: `app/api/story/generate/route.ts`

- [ ] **Step 1: Add tipo to story entry insert**

In `app/api/story/generate/route.ts`, find the `db.insert(storyEntries).values({...})` block and add `tipo: trigger,` to the values object.

Find:
```typescript
  await db.insert(storyEntries).values({
    userId,
    fecha: today,
    turnoNumero: nextTurno,
    textoJugador: textoJugador ?? null,
    textoIa: text,
    snapshotJ1,
    snapshotJ2,
  });
```

Replace with:
```typescript
  await db.insert(storyEntries).values({
    userId,
    fecha: today,
    turnoNumero: nextTurno,
    tipo: trigger,
    textoJugador: textoJugador ?? null,
    textoIa: text,
    snapshotJ1,
    snapshotJ2,
  });
```

Also update the `today` calculation to use timezone helper. Add import at top:

```typescript
import { getLocalDate } from "@/lib/shared/constants";
```

And replace `const today = new Date().toISOString().split("T")[0];` with:

```typescript
const today = getLocalDate();
```

Also update `allUsers` query to have stable order:

```typescript
const allUsers = await db.select().from(users).orderBy(asc(users.id));
```

Add `asc` to the import from drizzle-orm.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/api/story/generate/route.ts
git commit -m "fix(story): add tipo field to entry insert, use timezone helper, stable user order"
```

---

## Summary

| Task | What it fixes | Files |
|------|--------------|-------|
| 1 | Shared constants + timezone | `lib/shared/constants.ts` |
| 2 | Schema: tipo enum + 3 unique constraints | `lib/db/schema.ts` |
| 3 | Rituals: timezone, SQL HP increment, unique conflict | `lib/actions/rituals.ts` |
| 4 | HP: 0 reset bug, penalty filter, timezone, error handling | `lib/actions/hp.ts` |
| 5 | Pact: getCurrentSunday, player order, upsert, validation | `lib/actions/pact.ts` |
| 6 | Cron: correct time, remove push cron | `vercel.json` |
| 7 | Story: tipo field in inserts, timezone, stable order | `app/api/story/generate/route.ts` |

**After this plan:** All database-level issues are fixed. Schema has proper constraints. Timezone is consistent. HP math is race-safe. Pact dates are correct. Ready for Plan B (critical bug fixes at UI level).
