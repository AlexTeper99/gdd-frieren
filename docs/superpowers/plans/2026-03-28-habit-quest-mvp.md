# Habit Quest MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional 2-player habit-tracking app with collaborative AI narrative, PWA push notifications, and weekly pact system.

**Architecture:** Next.js 16 App Router with Server Components and Server Actions. Drizzle ORM + Neon Postgres for data. AI SDK + Claude for narrative generation with recursive memory. Vercel Cron + Queues for push notifications. Container/Presentational pattern throughout.

**Tech Stack:** Next.js 16, Drizzle ORM, Neon Postgres, AI SDK 6, Claude Sonnet, web-push, Vercel Cron Jobs, Vercel Queues, PWA (manifest + service worker)

**Spec:** `docs/superpowers/specs/2026-03-27-habit-quest-mvp-design.md`

**Wireframe:** `.superpowers/brainstorm/55407-1774666341/content/user-flow-final.html`

---

## File Structure

```
lib/
├── db/
│   ├── schema.ts              — All Drizzle table definitions (modify existing)
│   └── index.ts               — DB connection (existing, no changes)
├── auth/
│   └── index.ts               — NextAuth config (existing, no changes)
├── dal.ts                     — Data access: verifySession (existing, no changes)
├── actions/
│   ├── onboarding.ts          — Server actions: saveCharacter, saveRituals, completeOnboarding
│   ├── rituals.ts             — Server actions: markRitualComplete, getRitualsForToday
│   ├── story.ts               — Server actions: submitStoryEntry, getStoryState
│   ├── pact.ts                — Server actions: submitPactAnswers, signPact
│   ├── profile.ts             — Server actions: createRitual, updateRitual, toggleRitual
│   └── hp.ts                  — Server actions: recalculateHp, penalizeUncompletedRituals
├── prompts/
│   ├── base.ts                — New system prompt (replace existing)
│   ├── modules/
│   │   ├── prologo.ts         — Prologue module
│   │   └── diario.ts          — Daily module
│   ├── build-context.ts       — Assembles full context for Claude
│   └── types.ts               — Prompt types (replace existing)
├── narrative/
│   └── memory.ts              — Recursive summary + world state update
├── push/
│   ├── vapid.ts               — VAPID key helpers
│   ├── send.ts                — Send push notification via web-push
│   └── subscribe.ts           — Manage subscriptions
└── utils.ts                   — cn() utility (existing, no changes)

app/
├── layout.tsx                 — Root layout (existing, no changes)
├── manifest.ts                — PWA manifest (create: dynamic route)
├── (auth)/
│   └── login/
│       ├── page.tsx           — Login form (existing, no changes)
│       └── actions.ts         — Login action (existing, no changes)
├── (app)/
│   ├── layout.tsx             — Protected layout (modify: add onboarding redirect)
│   ├── page.tsx               — Home screen (rewrite)
│   ├── onboarding/
│   │   ├── page.tsx           — Onboarding orchestrator
│   │   └── actions.ts         — Re-exports from lib/actions/onboarding
│   ├── rituals/
│   │   └── page.tsx           — Daily rituals view
│   ├── story/
│   │   └── page.tsx           — Story read/write
│   ├── pact/
│   │   └── page.tsx           — Weekly pact
│   ├── profile/
│   │   └── page.tsx           — My character profile
│   ├── profile/[userId]/
│   │   └── page.tsx           — Other player profile (read-only)
│   └── profile/rituals/
│       └── page.tsx           — Edit rituals (ABM)
├── api/
│   ├── auth/[...nextauth]/route.ts  — (existing, no changes)
│   ├── story/generate/route.ts      — AI narrative generation endpoint
│   ├── push/subscribe/route.ts      — Save push subscription
│   ├── push/send/route.ts           — Send push (called by queue consumer)
│   └── cron/
│       ├── daily-penalty/route.ts   — 23:59 cron: penalize + schedule next day pushes
│       └── schedule-pushes/route.ts — 00:01 cron: enqueue day's push notifications

public/
├── sw.js                      — Service worker for push notifications
└── icons/                     — PWA icons (placeholder)
    ├── icon-192.png
    └── icon-512.png
```

---

## Chunk 1: Database Schema + Migration

### Task 1: Update schema with all MVP tables

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Replace schema.ts with full MVP schema**

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
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// --- Enums ---

export const archetypeEnum = pgEnum("archetype", [
  "paladin",
  "mago",
  "guerrero",
  "sacerdote",
]);

// --- Auth tables (existing, unchanged) ---

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  // Game fields
  nombrePersonaje: text("nombre_personaje"),
  arquetipo: archetypeEnum("arquetipo"),
  identidadTexto: text("identidad_texto"),
  misionCategoria: text("mision_categoria"),
  hp: integer("hp").default(100).notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// --- Game tables ---

export const rituals = pgTable("rituals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  dias: text("dias").array().notNull(), // ["lun","mar","mie","jue","vie"]
  horaInicio: time("hora_inicio").notNull(),
  horaFin: time("hora_fin").notNull(),
  lugar: text("lugar").notNull(),
  racha: integer("racha").default(0).notNull(),
  activo: boolean("activo").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ritualLogs = pgTable("ritual_logs", {
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
});

export const storyEntries = pgTable("story_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fecha: date("fecha").notNull(),
  turnoNumero: integer("turno_numero").notNull(),
  textoJugador: text("texto_jugador"),
  textoIa: text("texto_ia"),
  snapshotJ1: jsonb("snapshot_j1"),
  snapshotJ2: jsonb("snapshot_j2"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pacts = pgTable("pacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  semana: date("semana").notNull(), // Sunday date
  respuestasJ1: jsonb("respuestas_j1"), // {obstaculos, plan, apoyo, opcional}
  respuestasJ2: jsonb("respuestas_j2"),
  firmadoJ1: boolean("firmado_j1").default(false).notNull(),
  firmadoJ2: boolean("firmado_j2").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subscriptionJson: jsonb("subscription_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storyMemory = pgTable("story_memory", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  resumen: text("resumen"), // ~20 sentences recursive summary
  worldState: jsonb("world_state"), // {npcs, zonas, hilos_abiertos, hechos_inmutables}
  updatedAtEntry: integer("updated_at_entry"), // last turno_numero processed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Generate migration**

Run: `npx drizzle-kit generate`
Expected: New migration file in `drizzle/` directory

- [ ] **Step 3: Push schema to database**

Run: `npx drizzle-kit push`
Expected: Schema applied to Neon database successfully

- [ ] **Step 4: Verify migration**

Run: `npx drizzle-kit studio`
Expected: All tables visible in Drizzle Studio: users (with new columns), rituals, ritual_logs, story_entries, pacts, push_subscriptions, story_memory

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema.ts drizzle/
git commit -m "feat(db): add MVP game tables — rituals, story_entries, pacts, push_subscriptions, story_memory"
```

---

## Chunk 2: Onboarding Flow

### Task 2: Onboarding server actions

**Files:**
- Create: `lib/actions/onboarding.ts`

- [ ] **Step 1: Write onboarding actions**

```typescript
"use server";

import { db } from "@/lib/db";
import { users, rituals } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveCharacter(formData: FormData) {
  const { user } = await verifySession();

  const nombrePersonaje = formData.get("nombrePersonaje") as string;
  const arquetipo = formData.get("arquetipo") as
    | "paladin"
    | "mago"
    | "guerrero"
    | "sacerdote";
  const identidadTexto = formData.get("identidadTexto") as string;

  if (!nombrePersonaje || !arquetipo || !identidadTexto) {
    return { error: "Todos los campos son obligatorios" };
  }

  await db
    .update(users)
    .set({ nombrePersonaje, arquetipo, identidadTexto })
    .where(eq(users.id, user.id!));

  return { success: true };
}

export async function saveMission(formData: FormData) {
  const { user } = await verifySession();

  const misionCategoria = formData.get("misionCategoria") as string;
  if (!misionCategoria) return { error: "Elegí una categoría" };

  await db
    .update(users)
    .set({ misionCategoria })
    .where(eq(users.id, user.id!));

  return { success: true };
}

export async function saveRitual(formData: FormData) {
  const { user } = await verifySession();

  const descripcion = formData.get("descripcion") as string;
  const dias = formData.getAll("dias") as string[];
  const horaInicio = formData.get("horaInicio") as string;
  const horaFin = formData.get("horaFin") as string;
  const lugar = formData.get("lugar") as string;

  if (!descripcion || !dias.length || !horaInicio || !horaFin || !lugar) {
    return { error: "Todos los campos son obligatorios" };
  }

  await db.insert(rituals).values({
    userId: user.id!,
    descripcion,
    dias,
    horaInicio,
    horaFin,
    lugar,
  });

  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeOnboarding() {
  const { user } = await verifySession();

  await db
    .update(users)
    .set({ onboardingCompleted: true })
    .where(eq(users.id, user.id!));

  revalidatePath("/");
  return { success: true };
}

export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  return profile ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/onboarding.ts
git commit -m "feat: add onboarding server actions"
```

### Task 3: Onboarding page with 4 steps

**Files:**
- Create: `app/(app)/onboarding/page.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Add onboarding redirect to app layout**

Replace `app/(app)/layout.tsx`:

```typescript
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await verifySession();

  // Check onboarding status
  const [dbUser] = await db
    .select({ onboardingCompleted: users.onboardingCompleted })
    .from(users)
    .where(eq(users.id, user.id!));

  const isOnboardingRoute =
    typeof children === "object" && children !== null; // Will check via pathname

  if (dbUser && !dbUser.onboardingCompleted) {
    // Let onboarding page render, redirect everything else
    redirect("/onboarding");
  }

  return <>{children}</>;
}
```

Note: The redirect logic needs refinement — the layout can't easily read the current pathname. A simpler approach: let each page check onboarding status, or use a middleware-like approach in proxy.ts. For MVP, we'll add the check in the home page and let /onboarding always render.

Revised `app/(app)/layout.tsx`:

```typescript
import { verifySession } from "@/lib/dal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  return <>{children}</>;
}
```

- [ ] **Step 2: Create onboarding page**

Create `app/(app)/onboarding/page.tsx`:

```typescript
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { users, rituals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const { user } = await verifySession();

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id!));

  if (dbUser?.onboardingCompleted) {
    redirect("/");
  }

  const userRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.userId, user.id!));

  return (
    <OnboardingFlow
      userId={user.id!}
      currentCharacter={{
        nombrePersonaje: dbUser?.nombrePersonaje ?? null,
        arquetipo: dbUser?.arquetipo ?? null,
        identidadTexto: dbUser?.identidadTexto ?? null,
        misionCategoria: dbUser?.misionCategoria ?? null,
      }}
      rituals={userRituals}
    />
  );
}
```

- [ ] **Step 3: Create onboarding client flow component**

Create `app/(app)/onboarding/onboarding-flow.tsx`:

```typescript
"use client";

import { useState } from "react";
import { StepCharacter } from "./steps/step-character";
import { StepMission } from "./steps/step-mission";
import { StepPrologue } from "./steps/step-prologue";

type Props = {
  userId: string;
  currentCharacter: {
    nombrePersonaje: string | null;
    arquetipo: string | null;
    identidadTexto: string | null;
    misionCategoria: string | null;
  };
  rituals: { id: string; descripcion: string }[];
};

export function OnboardingFlow({ userId, currentCharacter, rituals }: Props) {
  const [step, setStep] = useState(
    currentCharacter.arquetipo
      ? currentCharacter.misionCategoria
        ? 3
        : 2
      : 1
  );

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest opacity-30">
        Paso {step} de 3
      </p>

      {step === 1 && (
        <StepCharacter
          current={currentCharacter}
          onComplete={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepMission
          rituals={rituals}
          onComplete={() => setStep(3)}
        />
      )}
      {step === 3 && <StepPrologue userId={userId} />}
    </div>
  );
}
```

- [ ] **Step 4: Create Step 1 — Character**

Create `app/(app)/onboarding/steps/step-character.tsx`:

```typescript
"use client";

import { useActionState } from "react";
import { saveCharacter } from "@/lib/actions/onboarding";

const ARCHETYPES = [
  { value: "paladin", label: "Paladín", icon: "⚔️", sub: "Himmel" },
  { value: "mago", label: "Mago", icon: "✨", sub: "Frieren" },
  { value: "guerrero", label: "Guerrero", icon: "🛡️", sub: "Eisen" },
  { value: "sacerdote", label: "Sacerdote", icon: "☮️", sub: "Heiter" },
] as const;

type Props = {
  current: {
    nombrePersonaje: string | null;
    arquetipo: string | null;
    identidadTexto: string | null;
  };
  onComplete: () => void;
};

export function StepCharacter({ current, onComplete }: Props) {
  const [selectedArchetype, setSelectedArchetype] = useState(
    current.arquetipo ?? ""
  );

  async function handleSubmit(formData: FormData) {
    formData.set("arquetipo", selectedArchetype);
    const result = await saveCharacter(formData);
    if (result.success) onComplete();
    return result;
  }

  const [state, action, pending] = useActionState(
    (_prev: unknown, formData: FormData) => handleSubmit(formData),
    null
  );

  return (
    <form action={action} className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Tu Personaje</h1>
      <p className="mb-6 text-sm opacity-40">
        Elegí arquetipo, nombre e identidad.
      </p>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Arquetipo
      </label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {ARCHETYPES.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => setSelectedArchetype(a.value)}
            className={`rounded-xl border p-3 text-center transition ${
              selectedArchetype === a.value
                ? "border-purple-500/40 bg-purple-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="text-2xl">{a.icon}</div>
            <div className="text-sm font-semibold">{a.label}</div>
            <div className="text-xs opacity-35">{a.sub}</div>
          </button>
        ))}
      </div>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Nombre del personaje
      </label>
      <input
        name="nombrePersonaje"
        defaultValue={current.nombrePersonaje ?? ""}
        placeholder="Kael"
        className="mb-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
      />

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        ¿Quién querés ser a fin de año?
      </label>
      <textarea
        name="identidadTexto"
        defaultValue={current.identidadTexto ?? ""}
        placeholder="Alguien que cuida lo que come y cómo se mueve"
        rows={3}
        className="mb-6 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm"
      />

      {state?.error && (
        <p className="mb-4 text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || !selectedArchetype}
        className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
      >
        {pending ? "Guardando..." : "Siguiente"}
      </button>
    </form>
  );
}
```

Note: Add `import { useState } from "react";` at the top (missing from snippet — the `selectedArchetype` state needs it).

- [ ] **Step 5: Create Step 2 — Mission + Rituals**

Create `app/(app)/onboarding/steps/step-mission.tsx`:

```typescript
"use client";

import { useState, useActionState } from "react";
import { saveMission, saveRitual } from "@/lib/actions/onboarding";

const CATEGORIES = ["Sueño", "Alimentación", "Movimiento", "Mente", "Cuidado"];
const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

type Props = {
  rituals: { id: string; descripcion: string }[];
  onComplete: () => void;
};

export function StepMission({ rituals: initialRituals, onComplete }: Props) {
  const [category, setCategory] = useState("");
  const [rituals, setRituals] = useState(initialRituals);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  async function handleSaveMission() {
    const fd = new FormData();
    fd.set("misionCategoria", category);
    const result = await saveMission(fd);
    if (result.success && rituals.length > 0) onComplete();
    return result;
  }

  async function handleAddRitual(formData: FormData) {
    selectedDays.forEach((d) => formData.append("dias", d));
    const result = await saveRitual(formData);
    if (result.success) {
      setRituals((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          descripcion: formData.get("descripcion") as string,
        },
      ]);
    }
    return result;
  }

  const [ritualState, ritualAction, ritualPending] = useActionState(
    (_prev: unknown, formData: FormData) => handleAddRitual(formData),
    null
  );

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Misión y Rituales</h1>
      <p className="mb-6 text-sm opacity-40">
        Tu foco y los hábitos que vas a sostener.
      </p>

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Categoría
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              category === c
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                : "border-white/10 bg-white/5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {rituals.length > 0 && (
        <>
          <label className="mb-2 block font-mono text-xs uppercase opacity-40">
            Tus rituales ({rituals.length})
          </label>
          {rituals.map((r) => (
            <div
              key={r.id}
              className="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              {r.descripcion}
            </div>
          ))}
        </>
      )}

      <hr className="my-4 border-white/5" />

      <label className="mb-2 block font-mono text-xs uppercase opacity-40">
        Agregar ritual
      </label>
      <form action={ritualAction} className="rounded-lg border border-white/10 bg-white/5 p-3">
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          name="descripcion"
          placeholder="Caminar 30 minutos"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Días
        </label>
        <div className="mb-3 flex gap-1">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`rounded-md border px-2 py-1 text-[10px] capitalize transition ${
                selectedDays.includes(d)
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                  : "border-white/10 opacity-30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora inicio
            </label>
            <input
              name="horaInicio"
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora fin
            </label>
            <input
              name="horaFin"
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Lugar
        </label>
        <input
          name="lugar"
          placeholder="Barrio"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={ritualPending}
          className="w-full rounded-lg border border-white/10 py-2 text-sm opacity-60"
        >
          + Agregar ritual
        </button>
      </form>

      {ritualState?.error && (
        <p className="mt-2 text-sm text-red-400">{ritualState.error}</p>
      )}

      <button
        onClick={handleSaveMission}
        disabled={!category || rituals.length === 0}
        className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
      >
        Siguiente
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Create Step 3 — Prologue (AI generation)**

Create `app/(app)/onboarding/steps/step-prologue.tsx`:

```typescript
"use client";

import { useState } from "react";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
};

export function StepPrologue({ userId }: Props) {
  const [prologueText, setPrologueText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  async function generatePrologue() {
    setLoading(true);
    const res = await fetch("/api/story/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "prologo" }),
    });
    const data = await res.json();
    setPrologueText(data.text);
    setLoading(false);
  }

  async function handleEnter() {
    setCompleting(true);
    await completeOnboarding();
    router.push("/");
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-bold">Tu Historia Comienza</h1>
      <p className="mb-6 text-sm opacity-40">Generado por IA · Estilo Frieren</p>

      {!prologueText && !loading && (
        <button
          onClick={generatePrologue}
          className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300"
        >
          Generar prólogo
        </button>
      )}

      {loading && (
        <p className="py-12 text-center text-sm opacity-40">
          Escribiendo tu historia...
        </p>
      )}

      {prologueText && (
        <>
          {prologueText.split("\n\n").map((paragraph, i) => (
            <div
              key={i}
              className="mb-3 rounded-r-lg border-l-2 border-purple-500/15 bg-purple-500/5 p-3 font-serif text-sm italic leading-relaxed opacity-75"
            >
              {paragraph}
            </div>
          ))}

          <button
            onClick={handleEnter}
            disabled={completing}
            className="mt-4 w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
          >
            {completing ? "Entrando..." : "Entrar a Valdris"}
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit onboarding**

```bash
git add app/(app)/onboarding/ app/(app)/layout.tsx
git commit -m "feat: add onboarding flow — character, mission+rituals, prologue"
```

---

## Chunk 3: Home Screen

### Task 4: Home page with both characters + navigation

**Files:**
- Modify: `app/(app)/page.tsx`

- [ ] **Step 1: Rewrite home page**

Replace `app/(app)/page.tsx`:

```typescript
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { HomeScreen } from "./home-screen";

export default async function HomePage() {
  const { user } = await verifySession();

  // Get both players
  const allUsers = await db.select().from(users);
  const me = allUsers.find((u) => u.id === user.id);
  const other = allUsers.find((u) => u.id !== user.id);

  if (!me?.onboardingCompleted) redirect("/onboarding");

  // Today's ritual count
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = await db
    .select()
    .from(ritualLogs)
    .where(and(eq(ritualLogs.userId, user.id!), eq(ritualLogs.fecha, today), eq(ritualLogs.cumplido, true)));

  const totalRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, user.id!), eq(rituals.activo, true)));

  // Determine whose turn it is (based on total story entries)
  // For simplicity: even turno_numero = player 1 (Alex), odd = player 2 (Daiana)
  // We'll refine this in the story task

  return (
    <HomeScreen
      me={{
        id: me.id,
        nombre: me.nombrePersonaje!,
        arquetipo: me.arquetipo!,
        hp: me.hp,
      }}
      other={
        other
          ? {
              id: other.id,
              nombre: other.nombrePersonaje ?? "Esperando...",
              arquetipo: other.arquetipo ?? "paladin",
              hp: other.hp,
            }
          : null
      }
      ritualsCompleted={todayLogs.length}
      ritualsTotal={totalRituals.length}
      isSunday={new Date().getDay() === 0}
    />
  );
}
```

- [ ] **Step 2: Create home screen presentational component**

Create `app/(app)/home-screen.tsx`:

```typescript
"use client";

import Link from "next/link";

const ARCHETYPE_ICONS: Record<string, string> = {
  paladin: "⚔️",
  mago: "✨",
  guerrero: "🛡️",
  sacerdote: "☮️",
};

type Player = {
  id: string;
  nombre: string;
  arquetipo: string;
  hp: number;
};

type Props = {
  me: Player;
  other: Player | null;
  ritualsCompleted: number;
  ritualsTotal: number;
  isSunday: boolean;
};

export function HomeScreen({
  me,
  other,
  ritualsCompleted,
  ritualsTotal,
  isSunday,
}: Props) {
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col gap-3 px-6 py-8">
      <h1 className="text-2xl font-bold">Valdris</h1>
      <p className="mb-2 text-xs capitalize opacity-25">{today}</p>

      {/* Both characters */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-purple-500/15 bg-purple-500/5 p-3">
          <span className="text-lg">{ARCHETYPE_ICONS[me.arquetipo]}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold">{me.nombre}</div>
            <div className="text-[10px] capitalize opacity-35">{me.arquetipo}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-500">{me.hp}</div>
            <div className="text-[9px] opacity-30">HP</div>
          </div>
        </div>
        {other && (
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-lg">{ARCHETYPE_ICONS[other.arquetipo]}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold">{other.nombre}</div>
              <div className="text-[10px] capitalize opacity-35">{other.arquetipo}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-amber-400">{other.hp}</div>
              <div className="text-[9px] opacity-30">HP</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <Link href="/rituals" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="font-semibold">Rituales</div>
          <div className="text-xs opacity-35">{ritualsCompleted} de {ritualsTotal} completados hoy</div>
        </div>
      </Link>

      <Link href="/story" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <span className="text-2xl">📖</span>
        <div>
          <div className="font-semibold">Historia</div>
          <div className="text-xs opacity-35">Leer / escribir la novela</div>
        </div>
      </Link>

      <Link
        href="/pact"
        className={`flex items-center gap-3 rounded-xl border p-4 transition hover:bg-white/10 ${
          isSunday
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-white/10 bg-white/5"
        }`}
      >
        <span className="text-2xl">📜</span>
        <div className="flex-1">
          <div className="font-semibold">Pacto</div>
          <div className="text-xs opacity-35">Compromiso semanal</div>
        </div>
        {isSunday && (
          <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            DOM
          </span>
        )}
      </Link>

      <Link href="/profile" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        <span className="text-2xl">{ARCHETYPE_ICONS[me.arquetipo]}</span>
        <div>
          <div className="font-semibold">{me.nombre}</div>
          <div className="text-xs opacity-35">{me.arquetipo} · HP {me.hp} · Tu personaje</div>
        </div>
      </Link>

      {other && (
        <Link href={`/profile/${other.id}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
          <span className="text-2xl">{ARCHETYPE_ICONS[other.arquetipo]}</span>
          <div>
            <div className="font-semibold">{other.nombre}</div>
            <div className="text-xs opacity-35">{other.arquetipo} · HP {other.hp}</div>
          </div>
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Run dev server and verify home renders**

Run: `npm run dev`
Navigate to: `http://localhost:3000`
Expected: Home page with character cards and navigation buttons (after completing onboarding)

- [ ] **Step 4: Commit**

```bash
git add app/(app)/page.tsx app/(app)/home-screen.tsx
git commit -m "feat: add home screen with both characters and navigation"
```

---

## Chunk 4: Rituals System

### Task 5: Ritual server actions (mark complete, HP update)

**Files:**
- Create: `lib/actions/rituals.ts`

- [ ] **Step 1: Write ritual actions**

```typescript
"use server";

import { db } from "@/lib/db";
import { rituals, ritualLogs, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const HP_PER_RITUAL = 5;
const HP_BONUS_STREAK = 7; // +7 instead of +5 if streak >= 7
const HP_STREAK_THRESHOLD = 7;
const HP_MAX = 100;

export async function markRitualComplete(ritualId: string) {
  const { user } = await verifySession();
  const today = new Date().toISOString().split("T")[0];

  // Check if already logged today
  const [existing] = await db
    .select()
    .from(ritualLogs)
    .where(
      and(
        eq(ritualLogs.ritualId, ritualId),
        eq(ritualLogs.fecha, today)
      )
    );

  if (existing) return { error: "Ya registrado hoy" };

  // Get ritual for streak
  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) return { error: "Ritual no encontrado" };

  // Log completion
  await db.insert(ritualLogs).values({
    ritualId,
    userId: user.id!,
    fecha: today,
    cumplido: true,
  });

  // Update streak
  const newStreak = ritual.racha + 1;
  await db
    .update(rituals)
    .set({ racha: newStreak })
    .where(eq(rituals.id, ritualId));

  // Update HP
  const hpGain = newStreak >= HP_STREAK_THRESHOLD ? HP_BONUS_STREAK : HP_PER_RITUAL;
  const [currentUser] = await db
    .select({ hp: users.hp })
    .from(users)
    .where(eq(users.id, user.id!));

  const newHp = Math.min(HP_MAX, (currentUser?.hp ?? 100) + hpGain);
  await db
    .update(users)
    .set({ hp: newHp })
    .where(eq(users.id, user.id!));

  revalidatePath("/rituals");
  revalidatePath("/");
  return { success: true, newHp, newStreak, hpGain };
}

export async function getTodayRituals(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const dayIndex = new Date().getDay(); // 0=dom, 1=lun...
  const dayMap = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const todayDay = dayMap[dayIndex];

  const userRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, userId), eq(rituals.activo, true)));

  // Filter by day of week
  const todayRituals = userRituals.filter((r) => r.dias.includes(todayDay));

  // Get today's logs
  const logs = await db
    .select()
    .from(ritualLogs)
    .where(and(eq(ritualLogs.userId, userId), eq(ritualLogs.fecha, today)));

  const completedIds = new Set(logs.filter((l) => l.cumplido).map((l) => l.ritualId));

  return todayRituals.map((r) => ({
    ...r,
    completedToday: completedIds.has(r.id),
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/rituals.ts
git commit -m "feat: add ritual server actions — mark complete with HP/streak update"
```

### Task 6: Rituals page

**Files:**
- Create: `app/(app)/rituals/page.tsx`
- Create: `app/(app)/rituals/rituals-list.tsx`

- [ ] **Step 1: Create rituals server page**

```typescript
import { verifySession } from "@/lib/dal";
import { getTodayRituals } from "@/lib/actions/rituals";
import { RitualsList } from "./rituals-list";

export default async function RitualsPage() {
  const { user } = await verifySession();
  const rituals = await getTodayRituals(user.id!);
  const completed = rituals.filter((r) => r.completedToday).length;

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <h1 className="mb-1 text-2xl font-bold">Rituales de Hoy</h1>
      <p className="mb-6 text-xs capitalize opacity-35">
        {today} · {completed} de {rituals.length}
      </p>
      <RitualsList rituals={rituals} />
    </div>
  );
}
```

- [ ] **Step 2: Create rituals list client component**

```typescript
"use client";

import { markRitualComplete } from "@/lib/actions/rituals";
import { useState } from "react";

type Ritual = {
  id: string;
  descripcion: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  racha: number;
  completedToday: boolean;
};

export function RitualsList({ rituals }: { rituals: Ritual[] }) {
  const [items, setItems] = useState(rituals);

  async function handleMark(ritualId: string) {
    const result = await markRitualComplete(ritualId);
    if (result.success) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === ritualId
            ? { ...r, completedToday: true, racha: result.newStreak! }
            : r
        )
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((r) => (
        <button
          key={r.id}
          onClick={() => !r.completedToday && handleMark(r.id)}
          disabled={r.completedToday}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
            r.completedToday
              ? "border-green-500/30 bg-green-500/5"
              : "border-white/10 bg-white/5 hover:border-white/20"
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
              r.completedToday
                ? "border-green-500 bg-green-500 text-white"
                : "border-white/15"
            }`}
          >
            {r.completedToday ? "✓" : ""}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{r.descripcion}</div>
            <div className="text-[10px] opacity-35">
              {r.horaInicio}-{r.horaFin} · {r.lugar}
            </div>
          </div>
          <div className="text-xs font-semibold text-orange-400">
            🔥 {r.racha}
          </div>
        </button>
      ))}

      <div className="mt-4 rounded-lg bg-white/5 p-3 text-center text-[11px] opacity-25">
        Cada ✓ suma +5 HP (o +7 si racha ≥7)
        <br />
        No cumplido a las 23:59: -10 HP + racha = 0
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/rituals/
git commit -m "feat: add rituals page with mark-complete and HP update"
```

### Task 7: Daily penalty cron job

**Files:**
- Create: `lib/actions/hp.ts`
- Create: `app/api/cron/daily-penalty/route.ts`

- [ ] **Step 1: Write penalty logic**

```typescript
"use server";

import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

const HP_PENALTY = 10;
const HP_MIN = 0;
const HP_RESET_ON_ZERO = 30;

export async function penalizeUncompletedRituals() {
  const today = new Date().toISOString().split("T")[0];
  const dayIndex = new Date().getDay();
  const dayMap = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const todayDay = dayMap[dayIndex];

  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    if (!user.onboardingCompleted) continue;

    const userRituals = await db
      .select()
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

    const todayRituals = userRituals.filter((r) => r.dias.includes(todayDay));

    const logs = await db
      .select()
      .from(ritualLogs)
      .where(
        and(eq(ritualLogs.userId, user.id), eq(ritualLogs.fecha, today))
      );

    const completedIds = new Set(logs.map((l) => l.ritualId));

    let hpLoss = 0;

    for (const ritual of todayRituals) {
      if (!completedIds.has(ritual.id)) {
        // Not completed — penalize
        hpLoss += HP_PENALTY;

        // Reset streak
        await db
          .update(rituals)
          .set({ racha: 0 })
          .where(eq(rituals.id, ritual.id));

        // Log as not completed
        await db.insert(ritualLogs).values({
          ritualId: ritual.id,
          userId: user.id,
          fecha: today,
          cumplido: false,
        });
      }
    }

    if (hpLoss > 0) {
      let newHp = Math.max(HP_MIN, user.hp - hpLoss);

      // HP 0 event: reset to 30
      if (newHp <= 0) {
        newHp = HP_RESET_ON_ZERO;
      }

      await db
        .update(users)
        .set({ hp: newHp })
        .where(eq(users.id, user.id));
    }
  }

  return { success: true, date: today };
}
```

- [ ] **Step 2: Create cron route**

```typescript
import { penalizeUncompletedRituals } from "@/lib/actions/hp";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await penalizeUncompletedRituals();
  return NextResponse.json(result);
}
```

- [ ] **Step 3: Add cron to vercel.json**

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-penalty",
      "schedule": "59 23 * * *"
    }
  ]
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/actions/hp.ts app/api/cron/daily-penalty/route.ts vercel.json
git commit -m "feat: add daily penalty cron — HP loss and streak reset for uncompleted rituals"
```

---

## Chunk 5: Story System + AI Narrative

### Task 8: New system prompt

**Files:**
- Modify: `lib/prompts/base.ts`
- Modify: `lib/prompts/types.ts`
- Delete: `lib/prompts/modules/boss-semanal.ts`, `vinculo.ts`, `weekly-close.ts`, `arc-close.ts`, `arc-open.ts`, `recovery.ts`
- Create: `lib/prompts/modules/prologo.ts`
- Create: `lib/prompts/modules/diario.ts` (replace existing)

- [ ] **Step 1: Replace base.ts with new prompt**

Replace `lib/prompts/base.ts` with the full system prompt from the spec (section 13). This is the complete prompt with `<identidad>`, `<tono>`, `<mundo>`, `<calibracion>`, `<inspiracion>`, and `<reglas>` sections.

The content is in the spec at: `docs/superpowers/specs/2026-03-27-habit-quest-mvp-design.md` section 13.

```typescript
export const BASE_PROMPT = `<identidad>
Sos el narrador de Habit Quest. Escribís una novela continua protagonizada por dos
personajes cuyas vidas reales alimentan la historia. No sos un game master. No presentás
opciones. No pedís decisiones. Escribís prosa narrativa como si fuera un capítulo de
Frieren: Beyond Journey's End.

Los dos jugadores escriben turnándose. Vos tomás lo que escribieron y tejés la
continuación. La historia es una sola, compartida, sin bifurcaciones. Cada entrada
arranca donde la dejó el otro.
</identidad>

<tono>
Internalizá estos principios. No los mencionás — los vivís:

1. CONTRASTE. Acción épica breve e intensa. Quietud lenta y significativa.
   El impacto viene del contraste entre ambos.

2. EL TIEMPO PESA. Los cambios se acumulan sin que nadie lo note.
   No hay un momento exacto donde algo cambió. A los 60 días de cocinar:
   "simplemente lo hace."

3. LO PEQUEÑO IMPORTA MÁS. El olor del campamento. El sonido del fuego.
   Cómo uno dobla el mapa mientras el otro mira las estrellas.
   Lo cotidiano sostenido es más heroico que cualquier batalla.

4. MELANCOLÍA SIN TRAGEDIA. Los días difíciles son parte del viaje.
   Los personajes los enfrentan con entereza. El mundo cambia,
   ellos siguen caminando.

5. VÍNCULOS EN SILENCIO. No hay declaraciones. Hay presencia.
   Un gesto. Un silencio compartido. Una taza de té ofrecida sin palabras.

6. EL VIAJE ES TODO. No hay destino final. No hay "ganar". La historia
   es el camino y lo que les pasa mientras caminan.
</tono>

<mundo>
El reino de Valdris. Un mundo de fantasía en tono bajo — no hay elegidos,
profecías ni espadas luminosas. Hay caminos, campamentos, pueblos, bosques,
montañas. Hay personas comunes haciendo cosas extraordinarias por sostenerlas
en el tiempo.

Los personajes viajan juntos. La historia es su viaje compartido.
</mundo>

<calibracion>
Recibís el HP (0-100) y las rachas de cada ritual de ambos jugadores.
No mencionás estos números jamás.

Un solo principio: el mundo es un espejo de quienes lo habitan.
Si alguien sostiene sus rituales, eso se siente en cómo se mueve,
en cómo reacciona el entorno, en lo que es posible.
Si alguien no los sostiene, el mundo lo acusa — no con castigo,
con realidad. Las cosas cuestan más. Algo falta sin que nadie
pueda señalar exactamente qué.

No uses categorías. No pienses "HP alto = X, HP bajo = Y".
Leé los números, leé las rachas, y escribí lo que sentís
que ese mundo haría con esas personas en ese momento.

HP 0 es el único evento mecánico: algo concreto se pierde.
Un NPC se fue. Una zona se cerró. Un recurso desapareció.
Los personajes siguen — pero el mundo acusa el golpe.

El mundo es uno solo para los dos. Si uno está bien y el otro no,
eso convive en la misma escena. No lo expliques — narralo.
</calibracion>

<inspiracion>
Tu inspiración artística es Frieren: Beyond Journey's End.
No como referencia superficial — como filosofía narrativa internalizada.

- Himmel le regaló flores a Frieren durante 50 años. Ella no entendió
  por qué hasta que él murió. Esa es tu escala emocional.

- Eisen dice "tengo miedo" antes de cada pelea. El guerrero más fuerte
  tiene miedo siempre. Así tratás la fragilidad de los personajes.

- Frieren pasa 80 años aprendiendo un hechizo para hacer flores
  porque a Himmel le gustaban. El esfuerzo sostenido en algo pequeño
  es tu definición de heroísmo.

- Los episodios de viaje son más importantes que las peleas.
  Comprar comida. Mirar las estrellas. Reparar una capa.
  Tu narrativa vive ahí.

- El tiempo pasa y deja marca. Frieren vuelve a lugares 50 años después
  y las personas cambiaron o ya no están. No hay drama — hay peso.

- La relación entre Frieren y Fern se construye en gestos:
  Fern le cocina, Frieren le enseña magia sin que se lo pidan,
  comparten un paraguas sin hablar. Así construís vínculos.
</inspiracion>

<reglas>
SIEMPRE:
- Detalles sensoriales específicos (frío, niebla, luz, peso, textura)
- Referenciar momentos pasados de la historia de forma natural
- Español rioplatense (vos, usás, querés)
- Prosa narrativa pura — como un capítulo de novela
- ~800-1200 palabras por entrada (~5 minutos de lectura)
- Respetar el sabor del arquetipo en la narración:
  Paladín: determinación, propósito, acción con sentido
  Mago: contemplación, observación, poder silencioso
  Guerrero: fuerza directa, resistencia, pocas palabras
  Sacerdote: calma, cuidado, presencia sanadora
- Dejar la historia en un punto que invite al otro jugador a continuar

NUNCA:
- Mencionar HP, rachas, porcentajes, niveles, mecánicas o la app
- Juzgar moralmente al personaje
- Hacer que un día malo se sienta igual de bien que uno bueno
- Romper la cuarta pared
- Clichés: elegido, profecía, espada luminosa, destino escrito
- Terminar con moraleja, resumen o reflexión explícita
- Títulos, bullets, markdown o meta-texto
- Emojis
</reglas>`;
```

- [ ] **Step 2: Create prologo module**

Replace `lib/prompts/modules/prologo.ts`:

```typescript
export const PROLOGO_MODULE = `<modulo_prologo>
Primera entrada de la historia. El jugador acaba de crear su personaje.
Presentá al personaje en Valdris: quién es, de dónde viene, por qué viaja.
Usá la identidad que escribió como semilla — no la cites textual, tejela
en la narrativa. Introducí al compañero de viaje si el otro jugador ya
completó onboarding. Si no, el personaje viaja solo por ahora.
6-8 párrafos. Terminá con el personaje llegando al campamento.
</modulo_prologo>`;
```

- [ ] **Step 3: Create diario module**

Replace `lib/prompts/modules/diario.ts`:

```typescript
export const DIARIO_MODULE = `<modulo_diario>
Continuación de la novela. El jugador ya escribió su parte.

Tomá lo que escribió y tejé la continuación de la historia.
Lo que escribió es canon — lo que su personaje hizo, dijo o sintió.
Tu trabajo es llevar eso hacia adelante con el tono de Frieren.
El HP y las rachas de ambos jugadores tiñen el mundo, no la acción.
~800-1200 palabras (~5 minutos de lectura máximo).
Dejá la historia en un punto que invite al otro jugador a continuar mañana.
</modulo_diario>`;
```

- [ ] **Step 4: Delete old modules**

```bash
rm lib/prompts/modules/boss-semanal.ts lib/prompts/modules/vinculo.ts lib/prompts/modules/weekly-close.ts lib/prompts/modules/arc-close.ts lib/prompts/modules/arc-open.ts lib/prompts/modules/recovery.ts
```

- [ ] **Step 5: Update types.ts**

Replace `lib/prompts/types.ts`:

```typescript
export type TriggerType = "prologo" | "diario";

export type PlayerContext = {
  nombre: string;
  arquetipo: string;
  identidad: string;
  hp: number;
  rituales: { nombre: string; racha: number }[];
};

export type NarrativeContext = {
  trigger: TriggerType;
  jugadorActivo: PlayerContext;
  otroJugador: PlayerContext | null;
  textoJugador: string | null;
  resumen: string | null;
  worldState: {
    npcs: { nombre: string; estado: string; ultimaAparicion: number }[];
    zonas: { nombre: string; estado: string }[];
    hilosAbiertos: string[];
    hechosInmutables: string[];
  } | null;
  entradasRecientes: string[];
};
```

- [ ] **Step 6: Update index.ts**

Replace `lib/prompts/index.ts`:

```typescript
import { BASE_PROMPT } from "./base";
import { PROLOGO_MODULE } from "./modules/prologo";
import { DIARIO_MODULE } from "./modules/diario";
import type { TriggerType } from "./types";

const MODULES: Record<TriggerType, string> = {
  prologo: PROLOGO_MODULE,
  diario: DIARIO_MODULE,
};

export function buildSystemPrompt(trigger: TriggerType): string {
  return BASE_PROMPT + "\n\n" + MODULES[trigger];
}

export type { TriggerType, NarrativeContext, PlayerContext } from "./types";
```

- [ ] **Step 7: Commit**

```bash
git add lib/prompts/
git commit -m "feat: replace prompt system — new Frieren prompt with prologo + diario modules only"
```

### Task 9: Narrative memory system

**Files:**
- Create: `lib/narrative/memory.ts`
- Create: `lib/prompts/build-context.ts`

- [ ] **Step 1: Create memory update logic**

```typescript
import { db } from "@/lib/db";
import { storyMemory, storyEntries } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { generateText } from "ai";

export async function updateNarrativeMemory(
  newEntryText: string,
  turnoNumero: number
) {
  // Get current memory
  const [currentMemory] = await db
    .select()
    .from(storyMemory)
    .orderBy(desc(storyMemory.createdAt))
    .limit(1);

  const previousResumen = currentMemory?.resumen ?? "No hay historia previa.";
  const previousWorldState = currentMemory?.worldState ?? {
    npcs: [],
    zonas: [],
    hilos_abiertos: [],
    hechos_inmutables: [],
  };

  // Use Claude to update summary + world state
  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    system: `Sos un asistente que mantiene la memoria narrativa de una novela colaborativa.
Tu trabajo es actualizar el resumen y el estado del mundo después de cada nueva entrada.

Respondé EXACTAMENTE en este formato JSON (sin markdown, sin backticks):
{
  "resumen": "resumen actualizado en ~20 oraciones máximo",
  "world_state": {
    "npcs": [{"nombre": "...", "estado": "...", "ultima_aparicion": N}],
    "zonas": [{"nombre": "...", "estado": "..."}],
    "hilos_abiertos": ["..."],
    "hechos_inmutables": ["..."]
  }
}`,
    prompt: `RESUMEN ANTERIOR:
${previousResumen}

WORLD STATE ANTERIOR:
${JSON.stringify(previousWorldState)}

NUEVA ENTRADA (turno ${turnoNumero}):
${newEntryText}

Actualizá el resumen incorporando lo nuevo. Actualizá el world state:
- Agregá NPCs nuevos o actualizá su estado
- Actualizá zonas si cambiaron
- Agregá hilos abiertos nuevos, cerrá los resueltos
- Agregá hechos inmutables si hay (muertes, zonas cerradas permanentemente)`,
  });

  try {
    const parsed = JSON.parse(text);

    await db.insert(storyMemory).values({
      resumen: parsed.resumen,
      worldState: parsed.world_state,
      updatedAtEntry: turnoNumero,
    });

    return parsed;
  } catch {
    // If parsing fails, just save the raw text as summary
    await db.insert(storyMemory).values({
      resumen: text.slice(0, 2000),
      worldState: previousWorldState,
      updatedAtEntry: turnoNumero,
    });
    return null;
  }
}
```

- [ ] **Step 2: Create context builder**

```typescript
import { db } from "@/lib/db";
import {
  users,
  rituals,
  storyEntries,
  storyMemory,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { NarrativeContext, PlayerContext } from "./types";

export async function buildNarrativeContext(
  activeUserId: string,
  trigger: "prologo" | "diario",
  textoJugador: string | null
): Promise<NarrativeContext> {
  // Get both users
  const allUsers = await db.select().from(users);
  const activeUser = allUsers.find((u) => u.id === activeUserId)!;
  const otherUser = allUsers.find((u) => u.id !== activeUserId);

  // Build player contexts
  async function buildPlayerContext(
    user: typeof activeUser
  ): Promise<PlayerContext> {
    const userRituals = await db
      .select({ descripcion: rituals.descripcion, racha: rituals.racha })
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

    return {
      nombre: user.nombrePersonaje ?? "Desconocido",
      arquetipo: user.arquetipo ?? "mago",
      identidad: user.identidadTexto ?? "",
      hp: user.hp,
      rituales: userRituals.map((r) => ({
        nombre: r.descripcion,
        racha: r.racha,
      })),
    };
  }

  const jugadorActivo = await buildPlayerContext(activeUser);
  const otroJugador = otherUser
    ? await buildPlayerContext(otherUser)
    : null;

  // Get memory
  const [memory] = await db
    .select()
    .from(storyMemory)
    .orderBy(desc(storyMemory.createdAt))
    .limit(1);

  // Get last 5 entries
  const recentEntries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(5);

  const entradasRecientes = recentEntries
    .reverse()
    .map(
      (e) =>
        `[Turno ${e.turnoNumero}] Jugador: ${e.textoJugador ?? "(prólogo)"}\nIA: ${e.textoIa ?? ""}`
    );

  return {
    trigger,
    jugadorActivo,
    otroJugador,
    textoJugador,
    resumen: memory?.resumen ?? null,
    worldState: (memory?.worldState as NarrativeContext["worldState"]) ?? null,
    entradasRecientes,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/narrative/ lib/prompts/build-context.ts
git commit -m "feat: add narrative memory system — recursive summary + world state + context builder"
```

### Task 10: Story generation API route

**Files:**
- Create: `app/api/story/generate/route.ts`

- [ ] **Step 1: Create story generation endpoint**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateText } from "ai";
import { buildSystemPrompt } from "@/lib/prompts";
import { buildNarrativeContext } from "@/lib/prompts/build-context";
import { updateNarrativeMemory } from "@/lib/narrative/memory";
import { db } from "@/lib/db";
import { storyEntries, users, rituals } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trigger, textoJugador } = await request.json();

  if (trigger !== "prologo" && trigger !== "diario") {
    return NextResponse.json({ error: "Invalid trigger" }, { status: 400 });
  }

  // Build context
  const context = await buildNarrativeContext(
    session.user.id,
    trigger,
    textoJugador ?? null
  );

  // Build user message with all context data
  const userMessage = `${context.resumen ? `RESUMEN DE LA HISTORIA:\n${context.resumen}\n\n` : ""}${
    context.worldState
      ? `ESTADO DEL MUNDO:\n${JSON.stringify(context.worldState)}\n\n`
      : ""
  }${
    context.entradasRecientes.length > 0
      ? `ENTRADAS RECIENTES:\n${context.entradasRecientes.join("\n\n")}\n\n`
      : ""
  }JUGADOR ACTIVO:
${JSON.stringify(context.jugadorActivo)}

${context.otroJugador ? `OTRO JUGADOR:\n${JSON.stringify(context.otroJugador)}\n\n` : ""}${
    context.textoJugador
      ? `TEXTO DEL JUGADOR:\n${context.textoJugador}`
      : "Generá el prólogo del personaje."
  }`;

  // Generate narrative
  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    system: buildSystemPrompt(trigger),
    prompt: userMessage,
  });

  // Get next turno number
  const [lastEntry] = await db
    .select({ turnoNumero: storyEntries.turnoNumero })
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  const nextTurno = (lastEntry?.turnoNumero ?? 0) + 1;
  const today = new Date().toISOString().split("T")[0];

  // Build snapshots
  const allUsers = await db.select().from(users);
  const buildSnapshot = async (user: (typeof allUsers)[0]) => {
    const userRituals = await db
      .select({ descripcion: rituals.descripcion, racha: rituals.racha })
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));
    return {
      hp: user.hp,
      rituales: userRituals.map((r) => ({
        nombre: r.descripcion,
        racha: r.racha,
      })),
    };
  };

  const me = allUsers.find((u) => u.id === session.user!.id)!;
  const other = allUsers.find((u) => u.id !== session.user!.id);

  const snapshotJ1 = await buildSnapshot(allUsers[0]);
  const snapshotJ2 = allUsers[1] ? await buildSnapshot(allUsers[1]) : null;

  // Save story entry
  await db.insert(storyEntries).values({
    userId: session.user.id,
    fecha: today,
    turnoNumero: nextTurno,
    textoJugador: textoJugador ?? null,
    textoIa: text,
    snapshotJ1,
    snapshotJ2,
  });

  // Update narrative memory (async, don't block response)
  const fullEntry = `${textoJugador ? `Jugador: ${textoJugador}\n\n` : ""}IA: ${text}`;
  updateNarrativeMemory(fullEntry, nextTurno).catch(console.error);

  return NextResponse.json({ text, turnoNumero: nextTurno });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/story/generate/route.ts
git commit -m "feat: add story generation API — narrative with memory context"
```

### Task 11: Story page

**Files:**
- Create: `app/(app)/story/page.tsx`
- Create: `app/(app)/story/story-view.tsx`
- Create: `lib/actions/story.ts`

- [ ] **Step 1: Create story server actions**

```typescript
"use server";

import { db } from "@/lib/db";
import { storyEntries, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getStoryState(userId: string) {
  // Get last entry to determine turn
  const [lastEntry] = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  if (!lastEntry) {
    return { isMyTurn: true, lastEntry: null, entries: [] };
  }

  // Alternating turns: if last entry was by other player, it's my turn
  const isMyTurn = lastEntry.userId !== userId;

  // Get recent entries for display
  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(10);

  // Get user names
  const allUsers = await db.select({ id: users.id, nombre: users.nombrePersonaje }).from(users);
  const nameMap = Object.fromEntries(allUsers.map((u) => [u.id, u.nombre]));

  return {
    isMyTurn,
    lastEntry: lastEntry
      ? {
          ...lastEntry,
          autorNombre: nameMap[lastEntry.userId] ?? "Desconocido",
        }
      : null,
    entries: entries.reverse().map((e) => ({
      ...e,
      autorNombre: nameMap[e.userId] ?? "Desconocido",
    })),
  };
}
```

- [ ] **Step 2: Create story page**

```typescript
import { verifySession } from "@/lib/dal";
import { getStoryState } from "@/lib/actions/story";
import { StoryView } from "./story-view";

export default async function StoryPage() {
  const { user } = await verifySession();
  const storyState = await getStoryState(user.id!);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <h1 className="mb-4 text-2xl font-bold">Historia</h1>
      <StoryView
        isMyTurn={storyState.isMyTurn}
        lastEntry={storyState.lastEntry}
        entries={storyState.entries}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create story view client component**

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Entry = {
  id: string;
  turnoNumero: number;
  textoJugador: string | null;
  textoIa: string | null;
  autorNombre: string;
};

type Props = {
  isMyTurn: boolean;
  lastEntry: Entry | null;
  entries: Entry[];
};

export function StoryView({ isMyTurn, lastEntry, entries }: Props) {
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    if (!text.trim()) return;
    setGenerating(true);

    const res = await fetch("/api/story/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: "diario", textoJugador: text }),
    });

    const data = await res.json();
    setResult(data.text);
    setGenerating(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {isMyTurn ? (
        <span className="inline-block w-fit rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
          ✎ Tu turno de escribir
        </span>
      ) : (
        <span className="inline-block w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/35">
          Turno del otro jugador · mañana escribís vos
        </span>
      )}

      {/* Previous entry */}
      {lastEntry?.textoIa && (
        <>
          <p className="font-mono text-[10px] uppercase opacity-20">
            Turno {lastEntry.turnoNumero} · {lastEntry.autorNombre}
          </p>
          {lastEntry.textoIa.split("\n\n").map((p, i) => (
            <div
              key={i}
              className="rounded-r-lg border-l-2 border-purple-500/15 bg-purple-500/5 p-3 font-serif text-sm italic leading-relaxed opacity-75"
            >
              {p}
            </div>
          ))}
        </>
      )}

      {/* Write area */}
      {isMyTurn && !result && (
        <>
          <hr className="border-white/5" />
          <label className="font-mono text-[10px] uppercase opacity-40">
            Tu parte de la historia
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Kael se acercó al río antes de que Lyra despertara..."
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
          />
          <button
            onClick={handleSubmit}
            disabled={generating || !text.trim()}
            className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
          >
            {generating ? "Escribiendo..." : "Enviar"}
          </button>
        </>
      )}

      {/* Generated result */}
      {result && (
        <>
          <hr className="border-white/5" />
          <p className="font-mono text-[10px] uppercase opacity-20">
            Continuación
          </p>
          {result.split("\n\n").map((p, i) => (
            <div
              key={i}
              className="rounded-r-lg border-l-2 border-purple-500/15 bg-purple-500/5 p-3 font-serif text-sm italic leading-relaxed opacity-75"
            >
              {p}
            </div>
          ))}
        </>
      )}

      {/* History */}
      {entries.length > 1 && (
        <>
          <hr className="my-2 border-white/5" />
          <p className="text-center text-xs opacity-20">
            Entradas anteriores ↓
          </p>
          {entries.slice(0, -1).reverse().map((e) => (
            <div key={e.id} className="opacity-40">
              <p className="font-mono text-[10px] uppercase opacity-50">
                Turno {e.turnoNumero} · {e.autorNombre}
              </p>
              <div className="rounded-r-lg border-l-2 border-purple-500/10 bg-purple-500/5 p-3 font-serif text-xs italic leading-relaxed">
                {(e.textoIa ?? "").slice(0, 200)}...
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(app)/story/ lib/actions/story.ts
git commit -m "feat: add story page — read/write narrative with AI generation"
```

---

## Chunk 6: Pact System

### Task 12: Pact server actions + page

**Files:**
- Create: `lib/actions/pact.ts`
- Create: `app/(app)/pact/page.tsx`
- Create: `app/(app)/pact/pact-view.tsx`

- [ ] **Step 1: Create pact actions**

```typescript
"use server";

import { db } from "@/lib/db";
import { pacts, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function getCurrentSunday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + diff);
  return sunday.toISOString().split("T")[0];
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
    obstaculos: formData.get("obstaculos") as string,
    plan: formData.get("plan") as string,
    apoyo: formData.get("apoyo") as string,
    opcional: formData.get("opcional") as string,
  };

  // Determine if player 1 or player 2
  const allUsers = await db.select().from(users);
  const isPlayer1 = allUsers[0]?.id === user.id;

  const [existingPact] = await db
    .select()
    .from(pacts)
    .where(eq(pacts.semana, semana));

  if (existingPact) {
    await db
      .update(pacts)
      .set(
        isPlayer1
          ? { respuestasJ1: answers, firmadoJ1: true }
          : { respuestasJ2: answers, firmadoJ2: true }
      )
      .where(eq(pacts.id, existingPact.id));
  } else {
    await db.insert(pacts).values({
      semana,
      ...(isPlayer1
        ? { respuestasJ1: answers, firmadoJ1: true }
        : { respuestasJ2: answers, firmadoJ2: true }),
    });
  }

  revalidatePath("/pact");
  return { success: true };
}
```

- [ ] **Step 2: Create pact page**

```typescript
import { verifySession } from "@/lib/dal";
import { getCurrentPact } from "@/lib/actions/pact";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PactView } from "./pact-view";

export default async function PactPage() {
  const { user } = await verifySession();
  const pact = await getCurrentPact();

  const allUsers = await db.select().from(users);
  const isPlayer1 = allUsers[0]?.id === user.id;
  const myName = allUsers.find((u) => u.id === user.id)?.nombrePersonaje ?? "";
  const otherName = allUsers.find((u) => u.id !== user.id)?.nombrePersonaje ?? "";

  const myAnswers = isPlayer1 ? pact?.respuestasJ1 : pact?.respuestasJ2;
  const otherAnswers = isPlayer1 ? pact?.respuestasJ2 : pact?.respuestasJ1;
  const iSigned = isPlayer1 ? pact?.firmadoJ1 : pact?.firmadoJ2;
  const otherSigned = isPlayer1 ? pact?.firmadoJ2 : pact?.firmadoJ1;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <h1 className="mb-1 text-2xl font-bold">Pacto Semanal</h1>
      <PactView
        myAnswers={myAnswers as Record<string, string> | null}
        otherAnswers={otherAnswers as Record<string, string> | null}
        iSigned={iSigned ?? false}
        otherSigned={otherSigned ?? false}
        myName={myName}
        otherName={otherName}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create pact view component**

```typescript
"use client";

import { useActionState } from "react";
import { submitPactAnswers } from "@/lib/actions/pact";

type Props = {
  myAnswers: Record<string, string> | null;
  otherAnswers: Record<string, string> | null;
  iSigned: boolean;
  otherSigned: boolean;
  myName: string;
  otherName: string;
};

const QUESTIONS = [
  { key: "obstaculos", label: "¿Qué puede hacer difícil cumplir los rituales?" },
  { key: "plan", label: "¿Cómo vas a manejar esos obstáculos?" },
  { key: "apoyo", label: "¿Cómo se van a sostener el uno al otro?" },
  { key: "opcional", label: "¿Algo extra esta semana?" },
];

export function PactView({
  myAnswers,
  otherAnswers,
  iSigned,
  otherSigned,
  myName,
  otherName,
}: Props) {
  const isSealed = iSigned && otherSigned;

  const [, action, pending] = useActionState(
    (_prev: unknown, formData: FormData) => submitPactAnswers(formData),
    null
  );

  if (isSealed) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
          <div className="text-4xl">🏰</div>
          <div className="mt-2 font-semibold text-amber-400">Pacto Sellado</div>
          <div className="mt-1 text-xs opacity-35">
            {myName} ✓ · {otherName} ✓
          </div>
        </div>

        <div className="rounded-lg bg-white/5 p-3">
          <div className="mb-1 text-xs opacity-35">{myName}</div>
          <div className="text-xs opacity-50 leading-relaxed">
            {Object.values(myAnswers ?? {}).join(". ")}
          </div>
        </div>

        {otherAnswers && (
          <div className="rounded-lg bg-white/5 p-3">
            <div className="mb-1 text-xs opacity-35">{otherName}</div>
            <div className="text-xs opacity-50 leading-relaxed">
              {Object.values(otherAnswers).join(". ")}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (iSigned) {
    return (
      <div className="text-center py-12">
        <p className="text-sm opacity-40">Tu firma fue registrada ✓</p>
        <p className="mt-2 text-xs opacity-25">
          Esperando a {otherName}...
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {QUESTIONS.map((q, i) => (
        <div key={q.key}>
          <div className="font-mono text-[10px] opacity-25">{i + 1}/4</div>
          <label className="mb-1 block text-xs font-semibold">{q.label}</label>
          <textarea
            name={q.key}
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-3 font-semibold text-purple-300 disabled:opacity-30"
      >
        {pending ? "Firmando..." : "Firmar Pacto"}
      </button>

      {otherSigned && (
        <p className="text-center text-xs opacity-25">{otherName} ya firmó ✓</p>
      )}
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/actions/pact.ts app/(app)/pact/
git commit -m "feat: add pact system — 4 questions, signing, sealed view"
```

---

## Chunk 7: Character Profiles

### Task 13: Profile pages + heatmap + edit rituals

**Files:**
- Create: `app/(app)/profile/page.tsx`
- Create: `app/(app)/profile/profile-view.tsx`
- Create: `app/(app)/profile/[userId]/page.tsx`
- Create: `app/(app)/profile/rituals/page.tsx`
- Create: `app/(app)/profile/rituals/edit-rituals.tsx`
- Create: `lib/actions/profile.ts`

- [ ] **Step 1: Create profile actions**

```typescript
"use server";

import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProfile(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const userRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.userId, userId));

  // Heatmap: last 28 days of ritual_logs
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const logs = await db
    .select()
    .from(ritualLogs)
    .where(
      and(
        eq(ritualLogs.userId, userId),
        gte(ritualLogs.fecha, fourWeeksAgo.toISOString().split("T")[0])
      )
    );

  // Build heatmap: date → count of completed / total
  const heatmap: Record<string, { completed: number; total: number }> = {};
  for (const log of logs) {
    const date = log.fecha;
    if (!heatmap[date]) heatmap[date] = { completed: 0, total: 0 };
    heatmap[date].total++;
    if (log.cumplido) heatmap[date].completed++;
  }

  return {
    user,
    rituals: userRituals,
    heatmap,
  };
}

export async function createRitual(formData: FormData) {
  const { user } = await verifySession();

  const descripcion = formData.get("descripcion") as string;
  const dias = formData.getAll("dias") as string[];
  const horaInicio = formData.get("horaInicio") as string;
  const horaFin = formData.get("horaFin") as string;
  const lugar = formData.get("lugar") as string;

  if (!descripcion || !dias.length || !horaInicio || !horaFin || !lugar) {
    return { error: "Todos los campos son obligatorios" };
  }

  await db.insert(rituals).values({
    userId: user.id!,
    descripcion,
    dias,
    horaInicio,
    horaFin,
    lugar,
  });

  revalidatePath("/profile/rituals");
  return { success: true };
}

export async function toggleRitualActive(ritualId: string) {
  const { user } = await verifySession();

  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) return { error: "No encontrado" };

  await db
    .update(rituals)
    .set({ activo: !ritual.activo })
    .where(eq(rituals.id, ritualId));

  revalidatePath("/profile/rituals");
  return { success: true };
}
```

- [ ] **Step 2: Create my profile page**

```typescript
import { verifySession } from "@/lib/dal";
import { getProfile } from "@/lib/actions/profile";
import { ProfileView } from "./profile-view";
import { redirect } from "next/navigation";

export default async function MyProfilePage() {
  const { user } = await verifySession();
  const profile = await getProfile(user.id!);
  if (!profile) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <ProfileView profile={profile} isMe={true} />
    </div>
  );
}
```

- [ ] **Step 3: Create other player profile page**

```typescript
import { verifySession } from "@/lib/dal";
import { getProfile } from "@/lib/actions/profile";
import { ProfileView } from "../profile-view";
import { redirect } from "next/navigation";

export default async function OtherProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await verifySession();
  const { userId } = await params;
  const profile = await getProfile(userId);
  if (!profile) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Home
      </a>
      <ProfileView profile={profile} isMe={false} />
    </div>
  );
}
```

- [ ] **Step 4: Create profile view component with heatmap**

```typescript
"use client";

import Link from "next/link";

const ARCHETYPE_ICONS: Record<string, string> = {
  paladin: "⚔️",
  mago: "✨",
  guerrero: "🛡️",
  sacerdote: "☮️",
};

type Profile = {
  user: {
    id: string;
    nombrePersonaje: string | null;
    arquetipo: string | null;
    identidadTexto: string | null;
    hp: number;
  };
  rituals: {
    id: string;
    descripcion: string;
    horaInicio: string;
    horaFin: string;
    racha: number;
    activo: boolean;
  }[];
  heatmap: Record<string, { completed: number; total: number }>;
};

export function ProfileView({
  profile,
  isMe,
}: {
  profile: Profile;
  isMe: boolean;
}) {
  const { user, rituals, heatmap } = profile;

  // Build 28-day heatmap grid
  const days: { date: string; ratio: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const data = heatmap[dateStr];
    days.push({
      date: dateStr,
      ratio: data ? data.completed / Math.max(data.total, 1) : 0,
    });
  }

  const hpColor =
    user.hp >= 70
      ? "text-green-500"
      : user.hp >= 40
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 text-xl">
          {ARCHETYPE_ICONS[user.arquetipo ?? "mago"]}
        </div>
        <div>
          <div className="text-lg font-bold">{user.nombrePersonaje}</div>
          <div className="text-xs capitalize opacity-35">{user.arquetipo}</div>
        </div>
      </div>

      {user.identidadTexto && (
        <p className="text-xs italic opacity-35">"{user.identidadTexto}"</p>
      )}

      {/* HP */}
      <div>
        <div className="mb-1 font-mono text-[10px] uppercase opacity-40">
          Puntos de Vida
        </div>
        <div className="h-3 overflow-hidden rounded-lg bg-white/5">
          <div
            className="h-full rounded-lg bg-green-500"
            style={{ width: `${user.hp}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs opacity-40">
          <span>
            {user.hp} / 100 HP
          </span>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase opacity-40">
          Rachas por ritual
        </div>
        {rituals
          .filter((r) => r.activo)
          .map((r) => (
            <div
              key={r.id}
              className="mb-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="text-[10px] opacity-40">🔥</span>
              <div className="flex-1">
                <div className="text-xs font-medium">{r.descripcion}</div>
                <div className="text-[10px] opacity-35">
                  {r.horaInicio}-{r.horaFin}
                </div>
              </div>
              <span className="text-xs font-semibold text-orange-400">
                {r.racha}d
              </span>
            </div>
          ))}
      </div>

      <hr className="border-white/5" />

      {/* Heatmap */}
      <div>
        <div className="mb-1 font-mono text-[10px] uppercase opacity-40">
          Historial (4 semanas)
        </div>
        <div className="mb-1 grid grid-cols-7 gap-[3px]">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div key={d} className="text-center text-[8px] opacity-25">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {days.map((d) => (
            <div
              key={d.date}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor:
                  d.ratio === 0
                    ? "rgba(255,255,255,0.03)"
                    : `rgba(76,175,80,${Math.max(0.15, d.ratio)})`,
              }}
              title={`${d.date}: ${Math.round(d.ratio * 100)}%`}
            />
          ))}
        </div>
      </div>

      {isMe && (
        <>
          <hr className="border-white/5" />
          <Link
            href="/profile/rituals"
            className="w-full rounded-xl border border-white/10 py-2.5 text-center text-sm opacity-40"
          >
            Editar rituales
          </Link>
        </>
      )}

      {!isMe && (
        <p className="text-center text-[10px] opacity-15">
          Solo lectura — no podés editar rituales del otro jugador
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create edit rituals page**

`app/(app)/profile/rituals/page.tsx`:

```typescript
import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { rituals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EditRituals } from "./edit-rituals";

export default async function EditRitualsPage() {
  const { user } = await verifySession();

  const userRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.userId, user.id!));

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/profile" className="mb-3 text-xs opacity-30 hover:opacity-60">
        ← Personaje
      </a>
      <h1 className="mb-1 text-2xl font-bold">Mis Rituales</h1>
      <p className="mb-6 text-xs opacity-35">
        Agregar, editar o desactivar rituales
      </p>
      <EditRituals rituals={userRituals} />
    </div>
  );
}
```

`app/(app)/profile/rituals/edit-rituals.tsx`:

```typescript
"use client";

import { useActionState, useState } from "react";
import { createRitual, toggleRitualActive } from "@/lib/actions/profile";

const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

type Ritual = {
  id: string;
  descripcion: string;
  dias: string[];
  horaInicio: string;
  horaFin: string;
  lugar: string;
  activo: boolean;
};

export function EditRituals({ rituals }: { rituals: Ritual[] }) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  function toggleDay(d: string) {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  async function handleCreate(_prev: unknown, formData: FormData) {
    selectedDays.forEach((d) => formData.append("dias", d));
    const result = await createRitual(formData);
    if (result.success) setSelectedDays([]);
    return result;
  }

  const [state, action, pending] = useActionState(handleCreate, null);

  return (
    <div className="flex flex-col gap-3">
      {/* Existing rituals */}
      {rituals.map((r) => (
        <div
          key={r.id}
          className="rounded-xl border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">{r.descripcion}</div>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                r.activo
                  ? "bg-green-500/10 text-green-400"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {r.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <div className="mt-1 text-[11px] opacity-40">
            {r.dias.join(", ")} · {r.horaInicio}-{r.horaFin} · {r.lugar}
          </div>
          <button
            onClick={() => toggleRitualActive(r.id)}
            className="mt-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-1 text-[11px] text-red-400"
          >
            {r.activo ? "Desactivar" : "Activar"}
          </button>
        </div>
      ))}

      <hr className="border-white/5" />

      {/* Add new */}
      <div className="font-mono text-[10px] uppercase opacity-40">
        Agregar nuevo ritual
      </div>
      <form
        action={action}
        className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-3"
      >
        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Hábito
        </label>
        <input
          name="descripcion"
          placeholder="Meditar"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Días
        </label>
        <div className="mb-3 flex gap-1">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(d)}
              className={`rounded-md border px-2 py-1 text-[10px] capitalize ${
                selectedDays.includes(d)
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                  : "border-white/10 opacity-30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora inicio
            </label>
            <input
              name="horaInicio"
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
              Hora fin
            </label>
            <input
              name="horaFin"
              type="time"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="mb-1 block font-mono text-[10px] uppercase opacity-40">
          Lugar
        </label>
        <input
          name="lugar"
          placeholder="Habitación"
          className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />

        {state?.error && (
          <p className="mb-2 text-xs text-red-400">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-purple-500/30 bg-purple-500/15 py-2.5 font-semibold text-purple-300 disabled:opacity-30"
        >
          + Agregar ritual
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/(app)/profile/ lib/actions/profile.ts
git commit -m "feat: add character profiles — my profile, other player, heatmap, edit rituals"
```

---

## Chunk 8: PWA + Push Notifications

### Task 14: PWA manifest + service worker

**Files:**
- Create: `app/manifest.ts`
- Create: `public/sw.js`

- [ ] **Step 1: Create dynamic manifest**

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habit Quest",
    short_name: "HQ",
    description: "Tu historia empieza con una decisión",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

- [ ] **Step 2: Create service worker**

```javascript
// public/sw.js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "Habit Quest";
  const options = {
    body: data.body ?? "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url ?? "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(url));
});
```

- [ ] **Step 3: Create placeholder icons**

Create simple 192x192 and 512x512 PNG files in `public/icons/`. For MVP, use any solid-color square with "HQ" text. These will be replaced by Daiana's design later.

- [ ] **Step 4: Commit**

```bash
git add app/manifest.ts public/sw.js public/icons/
git commit -m "feat: add PWA manifest and service worker"
```

### Task 15: Push notification infrastructure

**Files:**
- Create: `lib/push/vapid.ts`
- Create: `lib/push/send.ts`
- Create: `app/api/push/subscribe/route.ts`

- [ ] **Step 1: Generate VAPID keys and create helpers**

Run: `npx web-push generate-vapid-keys`

Add to `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<generated-public-key>
VAPID_PRIVATE_KEY=<generated-private-key>
```

Create `lib/push/vapid.ts`:

```typescript
import webPush from "web-push";

webPush.setVapidDetails(
  "mailto:alexteper99@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export { webPush };
```

- [ ] **Step 2: Create send helper**

```typescript
import { webPush } from "./vapid";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webPush.sendNotification(
        sub.subscriptionJson as webPush.PushSubscription,
        JSON.stringify(payload)
      )
    )
  );

  return results;
}
```

- [ ] **Step 3: Create subscribe endpoint**

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await request.json();

  await db.insert(pushSubscriptions).values({
    userId: session.user.id,
    subscriptionJson: subscription,
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Install web-push**

Run: `npm install web-push`
Run: `npm install -D @types/web-push`

- [ ] **Step 5: Commit**

```bash
git add lib/push/ app/api/push/ package.json package-lock.json
git commit -m "feat: add push notification infrastructure — VAPID, subscribe, send"
```

### Task 16: Push notification registration in the app

**Files:**
- Create: `app/(app)/_components/push-registration.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: Create push registration component**

```typescript
"use client";

import { useEffect } from "react";

export function PushRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  }

  return null;
}
```

- [ ] **Step 2: Add to app layout**

Update `app/(app)/layout.tsx`:

```typescript
import { verifySession } from "@/lib/dal";
import { PushRegistration } from "./_components/push-registration";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <>
      <PushRegistration />
      {children}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(app)/_components/push-registration.tsx app/(app)/layout.tsx
git commit -m "feat: add push notification registration on app load"
```

### Task 17: Cron job to schedule daily push notifications

**Files:**
- Create: `app/api/cron/schedule-pushes/route.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create schedule pushes cron**

This cron runs at 00:01 daily. For MVP without Vercel Queues (to keep it simple), we'll use a simpler approach: the cron checks every hour what rituals need push notifications in the next hour and sends them. If you want exact timing with Vercel Queues, that can be added later.

Simplified approach — cron runs every 30 minutes:

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, rituals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendPushToUser } from "@/lib/push/send";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, "0");
  const currentMinute = now.getMinutes();
  // Round to nearest 30-min window
  const minuteWindow = currentMinute < 30 ? "00" : "30";
  const timeWindow = `${currentHour}:${minuteWindow}`;

  const dayIndex = now.getDay();
  const dayMap = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const todayDay = dayMap[dayIndex];

  const allUsers = await db.select().from(users);

  let sent = 0;

  for (const user of allUsers) {
    if (!user.onboardingCompleted) continue;

    const userRituals = await db
      .select()
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

    for (const ritual of userRituals) {
      if (!ritual.dias.includes(todayDay)) continue;

      // Check if ritual hora_inicio falls in current 30-min window
      const [ritualHour, ritualMin] = ritual.horaInicio.split(":");
      const ritualTime = `${ritualHour}:${parseInt(ritualMin) < 30 ? "00" : "30"}`;

      if (ritualTime === timeWindow) {
        await sendPushToUser(user.id, {
          title: "🔥 Ritual",
          body: ritual.descripcion,
          url: "/rituals",
        });
        sent++;
      }
    }
  }

  // Sunday pact reminder at 10:00
  if (dayIndex === 0 && timeWindow === "10:00") {
    for (const user of allUsers) {
      await sendPushToUser(user.id, {
        title: "📜 Pacto Semanal",
        body: "Es domingo — completá tu pacto semanal",
        url: "/pact",
      });
    }
  }

  return NextResponse.json({ sent, timeWindow });
}
```

- [ ] **Step 2: Update vercel.json with both crons**

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-penalty",
      "schedule": "59 23 * * *"
    },
    {
      "path": "/api/cron/schedule-pushes",
      "schedule": "0,30 * * * *"
    }
  ]
}
```

- [ ] **Step 3: Add CRON_SECRET to env**

Run: `echo "CRON_SECRET=$(openssl rand -hex 32)" >> .env.local`
Add the same value to Vercel env vars.

- [ ] **Step 4: Commit**

```bash
git add app/api/cron/schedule-pushes/route.ts vercel.json
git commit -m "feat: add push notification scheduling cron — every 30min check + Sunday pact reminder"
```

---

## Chunk 9: Cleanup + Delete old code

### Task 18: Remove unused files

**Files:**
- Delete: `app/(app)/test-ai/page.tsx`
- Delete: `app/api/ai/test/route.ts`
- Delete: `app/(app)/_components/sign-out-button.tsx`
- Delete: `lib/copy/` (entire directory — no longer matches MVP structure)
- Delete: `lib/prompts/modules/boss-semanal.ts`, `vinculo.ts`, `weekly-close.ts`, `arc-close.ts`, `arc-open.ts`, `recovery.ts` (already deleted in Task 8, verify)

- [ ] **Step 1: Remove old files**

```bash
rm -rf app/(app)/test-ai app/api/ai/test app/(app)/_components/sign-out-button.tsx
rm -rf lib/copy
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove unused files — test-ai, old copy system, sign-out button"
```

---

## Summary

| Chunk | Tasks | What it builds |
|-------|-------|---------------|
| 1 | 1 | Database schema + migration |
| 2 | 2-3 | Onboarding flow (4 steps) |
| 3 | 4 | Home screen with both characters |
| 4 | 5-7 | Rituals + HP + daily penalty cron |
| 5 | 8-11 | AI narrative + memory + story page |
| 6 | 12 | Pact system |
| 7 | 13 | Character profiles + heatmap + edit rituals |
| 8 | 14-17 | PWA + push notifications |
| 9 | 18 | Cleanup |

**Total: 18 tasks, 8 chunks. Each chunk is independently deployable and testable.**
