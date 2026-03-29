# Plan B: Critical Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical UI-level bugs: turn logic, sign-out, password, error handling, ritual count, worldState casing, story display, metadata, and memory sync.

**Architecture:** Targeted fixes to existing files. No structural changes — that's Plan C (refactor). Each task touches 1-2 files max.

**Tech Stack:** Next.js 16, React 19, Drizzle ORM, AI SDK 6, NextAuth 5

**Depends on:** Plan A (schema + data integrity) must be completed first.

---

## Task 1: Fix turn logic — filter by tipo="diario"

**Files:**
- Modify: `lib/actions/story.ts`

- [ ] **Step 1: Replace story.ts with turn logic that ignores prologues**

```typescript
"use server";

import { db } from "@/lib/db";
import { storyEntries, users } from "@/lib/db/schema";
import { desc, eq, asc } from "drizzle-orm";

export async function getStoryState(userId: string) {
  // Get last DIARIO entry (prologues don't count as turns)
  const [lastDiarioEntry] = await db
    .select()
    .from(storyEntries)
    .where(eq(storyEntries.tipo, "diario"))
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  // If no diario entries yet, first player to write gets the turn
  const isMyTurn = !lastDiarioEntry || lastDiarioEntry.userId !== userId;

  // Get recent entries for display (including prologues)
  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(20);

  // Get user names with stable order
  const allUsers = await db
    .select({ id: users.id, nombre: users.nombrePersonaje })
    .from(users)
    .orderBy(asc(users.id));
  const nameMap = Object.fromEntries(
    allUsers.map((u) => [u.id, u.nombre ?? "Desconocido"])
  );

  // Most recent entry (any type) for display
  const lastEntry = entries[0] ?? null;

  return {
    isMyTurn,
    lastEntry: lastEntry
      ? { ...lastEntry, autorNombre: nameMap[lastEntry.userId] ?? "Desconocido" }
      : null,
    entries: entries.reverse().map((e) => ({
      ...e,
      autorNombre: nameMap[e.userId] ?? "Desconocido",
    })),
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/actions/story.ts
git commit -m "fix(story): filter turn detection by tipo=diario, prologues don't count as turns"
```

---

## Task 2: Fix sign-out — use server action

**Files:**
- Modify: `app/(app)/home-screen.tsx`

- [ ] **Step 1: Replace the sign-out form with a server action**

In `app/(app)/home-screen.tsx`, find the sign-out form at the bottom:

```typescript
      <form action="/api/auth/signout" method="POST" className="mt-4">
        <button
          type="submit"
          className="w-full rounded-xl border border-white/10 py-2 text-xs opacity-25 hover:opacity-50"
        >
          Cerrar sesión
        </button>
      </form>
```

Replace with:

```typescript
      <form
        action={async () => {
          "use server";
          const { signOut } = await import("@/lib/auth");
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-4"
      >
        <button
          type="submit"
          className="w-full rounded-xl border border-white/10 py-2 text-xs opacity-25 hover:opacity-50"
        >
          Cerrar sesión
        </button>
      </form>
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/home-screen.tsx"
git commit -m "fix(auth): replace broken form POST with server action signOut"
```

---

## Task 3: Move password to env var

**Files:**
- Modify: `lib/auth/index.ts`

- [ ] **Step 1: Replace hardcoded password with env var**

In `lib/auth/index.ts`, find line 12:

```typescript
const VALID_PASSWORD = "alexydaiu2026!";
```

Replace with:

```typescript
const VALID_PASSWORD = process.env.AUTH_PASSWORD!;
```

- [ ] **Step 2: Add AUTH_PASSWORD to .env.local**

```bash
echo 'AUTH_PASSWORD="alexydaiu2026!"' >> .env.local
```

- [ ] **Step 3: Add to .env.local.example**

Create `.env.local.example` if it doesn't exist, or append:

```
# Auth
AUTH_PASSWORD=your-password-here
```

- [ ] **Step 4: Add AUTH_PASSWORD to Vercel**

```bash
echo "alexydaiu2026!" | npx vercel env add AUTH_PASSWORD production
```

- [ ] **Step 5: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add lib/auth/index.ts
git commit -m "fix(auth): move password to env var AUTH_PASSWORD"
```

---

## Task 4: Add error handling to story generation

**Files:**
- Modify: `app/api/story/generate/route.ts`
- Modify: `app/(app)/story/story-view.tsx`
- Modify: `app/(app)/onboarding/steps/step-prologue.tsx`

- [ ] **Step 1: Wrap generateText in try-catch in route.ts**

In `app/api/story/generate/route.ts`, find:

```typescript
  // Generate narrative
  const { text } = await generateText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    system: buildSystemPrompt(trigger),
    prompt: userMessage,
  });
```

Replace with:

```typescript
  // Generate narrative
  let text: string;
  try {
    const result = await generateText({
      model: gateway("anthropic/claude-sonnet-4.6"),
      system: buildSystemPrompt(trigger),
      prompt: userMessage,
    });
    text = result.text;
  } catch (error) {
    console.error("[Story] AI generation failed:", error);
    return NextResponse.json(
      { error: "No se pudo generar la continuación. Intentá de nuevo." },
      { status: 500 }
    );
  }
```

Also change the memory update from fire-and-forget to awaited:

Find:
```typescript
  updateNarrativeMemory(fullEntry, nextTurno).catch(console.error);
```

Replace with:
```typescript
  try {
    await updateNarrativeMemory(fullEntry, nextTurno);
  } catch (error) {
    console.error("[Story] Memory update failed:", error);
    // Don't fail the request — story was already saved
  }
```

- [ ] **Step 2: Add error handling to story-view.tsx**

In `app/(app)/story/story-view.tsx`, add an `error` state and update handleSubmit:

Add after the existing state declarations (after line 25):
```typescript
  const [error, setError] = useState<string | null>(null);
```

Replace the `handleSubmit` function:

```typescript
  async function handleSubmit() {
    if (!text.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "diario", textoJugador: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al generar la historia");
        setGenerating(false);
        return;
      }

      const data = await res.json();
      setResult(data.text);
      setGenerating(false);
      router.refresh();
    } catch {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.");
      setGenerating(false);
    }
  }
```

Add error display after the write area button, before the `{/* Generated result */}` comment:

```typescript
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
          <button
            onClick={() => { setError(null); setGenerating(false); }}
            className="ml-2 underline opacity-60 hover:opacity-100"
          >
            Reintentar
          </button>
        </div>
      )}
```

- [ ] **Step 3: Add error handling to step-prologue.tsx**

In `app/(app)/onboarding/steps/step-prologue.tsx`, add error state and update generatePrologue:

Add after existing state declarations:
```typescript
  const [error, setError] = useState<string | null>(null);
```

Replace `generatePrologue`:
```typescript
  async function generatePrologue() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "prologo" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al generar el prólogo");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPrologueText(data.text);
    } catch {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.");
    }
    setLoading(false);
  }
```

Add error display after the loading state, before the prologueText display:
```typescript
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
          {error}
          <button
            onClick={generatePrologue}
            className="ml-2 underline opacity-60 hover:opacity-100"
          >
            Reintentar
          </button>
        </div>
      )}
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add app/api/story/generate/route.ts "app/(app)/story/story-view.tsx" "app/(app)/onboarding/steps/step-prologue.tsx"
git commit -m "fix(story): add error handling to AI generation, story view, and prologue"
```

---

## Task 5: Fix ritual count on home page

**Files:**
- Modify: `app/(app)/page.tsx`

- [ ] **Step 1: Filter rituals by today's day of week**

In `app/(app)/page.tsx`, add import at top:

```typescript
import { getLocalDate, getLocalDay, getLocalDayIndex } from "@/lib/shared/constants";
```

Replace the ritual count section (lines 19-34):

```typescript
  // Today's ritual count (filtered by day of week)
  const today = getLocalDate();
  const todayDay = getLocalDay();

  const allActiveRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, user.id!), eq(rituals.activo, true)));

  const todayRituals = allActiveRituals.filter((r) => r.dias.includes(todayDay));

  const todayLogs = await db
    .select()
    .from(ritualLogs)
    .where(
      and(
        eq(ritualLogs.userId, user.id!),
        eq(ritualLogs.fecha, today),
        eq(ritualLogs.cumplido, true)
      )
    );
```

And update the HomeScreen props:

```typescript
      ritualsCompleted={todayLogs.length}
      ritualsTotal={todayRituals.length}
      isSunday={getLocalDayIndex() === 0}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/page.tsx"
git commit -m "fix(home): filter ritual count by today's day of week, use timezone helpers"
```

---

## Task 6: Fix worldState snake_case mismatch

**Files:**
- Modify: `lib/prompts/types.ts`

- [ ] **Step 1: Change camelCase to snake_case to match Claude's JSON output**

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

export type WorldState = {
  npcs: { nombre: string; estado: string; ultima_aparicion: number }[];
  zonas: { nombre: string; estado: string }[];
  hilos_abiertos: string[];
  hechos_inmutables: string[];
};

export type NarrativeContext = {
  trigger: TriggerType;
  jugadorActivo: PlayerContext;
  otroJugador: PlayerContext | null;
  textoJugador: string | null;
  resumen: string | null;
  worldState: WorldState | null;
  entradasRecientes: string[];
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds (build-context.ts casts worldState, so the structural change is compatible)

- [ ] **Step 3: Commit**

```bash
git add lib/prompts/types.ts
git commit -m "fix(types): align worldState fields to snake_case matching Claude JSON output"
```

---

## Task 7: Show textoJugador in story view

**Files:**
- Modify: `app/(app)/story/story-view.tsx`

- [ ] **Step 1: Display player text before AI text in previous entry**

In `app/(app)/story/story-view.tsx`, find the "Previous entry" section:

```typescript
      {/* Previous entry */}
      {lastEntry?.textoIa && (
        <>
          <p className="font-mono text-[10px] uppercase opacity-20">
            Turno {lastEntry.turnoNumero} · {lastEntry.autorNombre}
          </p>
          {lastEntry.textoIa.split("\n\n").map((p, i) => (
```

Replace with:

```typescript
      {/* Previous entry */}
      {lastEntry && (lastEntry.textoJugador || lastEntry.textoIa) && (
        <>
          <p className="font-mono text-[10px] uppercase opacity-20">
            Turno {lastEntry.turnoNumero} · {lastEntry.autorNombre}
          </p>
          {lastEntry.textoJugador && (
            <div className="rounded-r-lg border-l-2 border-blue-500/20 bg-blue-500/5 p-3 text-sm leading-relaxed opacity-70">
              {lastEntry.textoJugador}
            </div>
          )}
          {lastEntry.textoIa && lastEntry.textoIa.split("\n\n").map((p, i) => (
```

Also update the history section to show textoJugador. Find:

```typescript
              <div className="rounded-r-lg border-l-2 border-purple-500/10 bg-purple-500/5 p-3 font-serif text-xs italic leading-relaxed">
                {(e.textoIa ?? "").slice(0, 200)}...
              </div>
```

Replace with:

```typescript
              {e.textoJugador && (
                <div className="rounded-r-lg border-l-2 border-blue-500/10 bg-blue-500/5 p-3 text-xs leading-relaxed opacity-60">
                  {e.textoJugador.slice(0, 100)}...
                </div>
              )}
              <div className="rounded-r-lg border-l-2 border-purple-500/10 bg-purple-500/5 p-3 font-serif text-xs italic leading-relaxed">
                {(e.textoIa ?? "").slice(0, 200)}...
              </div>
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/story/story-view.tsx"
git commit -m "fix(story): show player text (blue) + AI continuation (purple) in story view"
```

---

## Task 8: Update metadata + PWA tags in root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update root layout with proper metadata**

Replace `app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habit Quest",
  description: "Tu historia empieza con una decisión. Cada decisión sostenida construye quién sos.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Habit Quest",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#e8e4df]">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "fix(layout): update metadata to Habit Quest, add PWA tags, set dark theme base"
```

---

## Task 9: Add server-side turn validation to story route

**Files:**
- Modify: `app/api/story/generate/route.ts`

- [ ] **Step 1: Import getStoryState and validate turn before generating**

In `app/api/story/generate/route.ts`, add import:

```typescript
import { getStoryState } from "@/lib/actions/story";
```

After the trigger validation (after line `if (trigger !== "prologo" && trigger !== "diario")`), add:

```typescript
  // Server-side turn validation (prevent out-of-turn writes)
  if (trigger === "diario") {
    const storyState = await getStoryState(userId);
    if (!storyState.isMyTurn) {
      return NextResponse.json(
        { error: "No es tu turno de escribir" },
        { status: 403 }
      );
    }
  }
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/api/story/generate/route.ts
git commit -m "fix(story): add server-side turn validation to prevent out-of-turn writes"
```

---

## Summary

| Task | What it fixes | Files |
|------|--------------|-------|
| 1 | Turn logic: prologues don't count | `lib/actions/story.ts` |
| 2 | Sign-out: server action | `home-screen.tsx` |
| 3 | Password: env var | `lib/auth/index.ts` |
| 4 | Error handling: AI generation + UI | `route.ts`, `story-view.tsx`, `step-prologue.tsx` |
| 5 | Ritual count: filter by day | `page.tsx` |
| 6 | WorldState: snake_case | `lib/prompts/types.ts` |
| 7 | Story display: show player text | `story-view.tsx` |
| 8 | Metadata: Habit Quest + PWA | `app/layout.tsx` |
| 9 | Turn validation: server-side | `route.ts` |

**After this plan:** All critical bugs are fixed. Turn logic works with prologues. Sign-out works. Password is secure. AI errors are handled gracefully. Ritual count is accurate. Story shows both player and AI text. Metadata is correct. Ready for Plan C (architecture refactor).
