# Plan E: New Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 10 new features: turn auto-pass, story archive, story pagination, pact sealed labels, back button, edit ritual, suggested rituals, heatmap alignment, client-side push scheduling, turn notification.

**Architecture:** Feature additions within existing feature-first structure. New pages in app/, new actions in features/. No architectural changes.

**Tech Stack:** Next.js 16, React 19, Drizzle ORM, Tailwind CSS, Web Push API

**Depends on:** Plans A-D must be completed first.

---

## Task 1: Turn auto-pass (24h rule)

**Files:**
- Modify: `features/story/actions.ts`

- [ ] **Step 1: Update getStoryState with 24h auto-pass logic**

Replace the ENTIRE content of `features/story/actions.ts`:

```typescript
"use server";

import { db } from "@/features/shared/db";
import { storyEntries, users } from "@/features/shared/db/schema";
import { desc, eq, asc } from "drizzle-orm";

const TURN_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getStoryState(userId: string) {
  const [lastDiarioEntry] = await db
    .select()
    .from(storyEntries)
    .where(eq(storyEntries.tipo, "diario"))
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  let isMyTurn: boolean;

  if (!lastDiarioEntry) {
    // No diary entries yet — first player to write gets the turn
    isMyTurn = true;
  } else if (lastDiarioEntry.userId !== userId) {
    // Last entry was by other player — it's my turn
    isMyTurn = true;
  } else {
    // Last entry was mine — normally not my turn
    // BUT: if >24h passed, auto-pass (both can write)
    const entryAge = Date.now() - new Date(lastDiarioEntry.createdAt).getTime();
    isMyTurn = entryAge > TURN_TIMEOUT_MS;
  }

  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(20);

  const allUsers = await db
    .select({ id: users.id, nombre: users.nombrePersonaje })
    .from(users)
    .orderBy(asc(users.id));
  const nameMap = Object.fromEntries(
    allUsers.map((u) => [u.id, u.nombre ?? "Desconocido"])
  );

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

export async function getStoryArchive(page: number = 1, pageSize: number = 20) {
  const offset = (page - 1) * pageSize;

  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(asc(storyEntries.turnoNumero))
    .limit(pageSize)
    .offset(offset);

  const allUsers = await db
    .select({ id: users.id, nombre: users.nombrePersonaje })
    .from(users)
    .orderBy(asc(users.id));
  const nameMap = Object.fromEntries(
    allUsers.map((u) => [u.id, u.nombre ?? "Desconocido"])
  );

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: storyEntries.id })
    .from(storyEntries);
  // Note: This returns one row per entry, not a count. Use a different approach:
  const allEntries = await db.select({ id: storyEntries.id }).from(storyEntries);
  const totalCount = allEntries.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    entries: entries.map((e) => ({
      ...e,
      autorNombre: nameMap[e.userId] ?? "Desconocido",
    })),
    page,
    totalPages,
    totalCount,
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add features/story/actions.ts
git commit -m "feat(story): add 24h turn auto-pass + getStoryArchive with pagination"
```

---

## Task 2: Story archive page

**Files:**
- Create: `app/(app)/story/archive/page.tsx`
- Create: `app/(app)/story/archive/archive-view.tsx`
- Modify: `app/(app)/story/page.tsx` (add link to archive)

- [ ] **Step 1: Create archive server page**

Create `app/(app)/story/archive/page.tsx`:

```typescript
import { verifySession } from "@/features/shared/auth/dal";
import { getStoryArchive } from "@/features/story/actions";
import { ArchiveView } from "./archive-view";

export default async function StoryArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await verifySession();
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const archive = await getStoryArchive(page, 20);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col px-6 py-8">
      <a href="/story" className="mb-3 text-xs text-hq-text-faint hover:text-hq-text-muted">
        ← Historia
      </a>
      <h1 className="mb-1 text-2xl font-bold">La Novela de Valdris</h1>
      <p className="mb-6 text-xs text-hq-text-muted">
        {archive.totalCount} entradas · Página {archive.page} de {archive.totalPages}
      </p>
      <ArchiveView
        entries={archive.entries}
        page={archive.page}
        totalPages={archive.totalPages}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create archive view client component**

Create `app/(app)/story/archive/archive-view.tsx`:

```typescript
"use client";

import Link from "next/link";

type Entry = {
  id: string;
  turnoNumero: number;
  tipo: string;
  textoJugador: string | null;
  textoIa: string | null;
  autorNombre: string;
  fecha: string;
};

type Props = {
  entries: Entry[];
  page: number;
  totalPages: number;
};

export function ArchiveView({ entries, page, totalPages }: Props) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-hq-text-muted">No hay entradas todavía</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {entries.map((e) => (
        <div key={e.id} className="border-b border-hq-border pb-6 last:border-0">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-hq-text-faint">
              Turno {e.turnoNumero}
            </span>
            <span className="text-[10px] text-hq-text-muted">
              {e.autorNombre}
            </span>
            {e.tipo === "prologo" && (
              <span className="rounded bg-hq-purple-bg px-1.5 py-0.5 text-[9px] text-hq-purple">
                prólogo
              </span>
            )}
          </div>

          {e.textoJugador && (
            <div className="mb-3 rounded-r-lg border-l-2 border-hq-blue-border bg-hq-blue-bg p-3 text-sm leading-relaxed">
              {e.textoJugador}
            </div>
          )}

          {e.textoIa && e.textoIa.split("\n\n").map((p, i) => (
            <p
              key={i}
              className="mb-2 font-serif text-sm italic leading-relaxed text-hq-text-muted"
            >
              {p}
            </p>
          ))}
        </div>
      ))}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        {page > 1 ? (
          <Link
            href={`/story/archive?page=${page - 1}`}
            className="text-xs text-hq-purple hover:underline"
          >
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-hq-text-faint">
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={`/story/archive?page=${page + 1}`}
            className="text-xs text-hq-purple hover:underline"
          >
            Siguiente →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add archive link to story page**

In `app/(app)/story/page.tsx`, add a link after the `<h1>` tag. Find:

```typescript
      <h1 className="mb-4 text-2xl font-bold">Historia</h1>
```

Replace with:

```typescript
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historia</h1>
        <a href="/story/archive" className="text-xs text-hq-purple hover:underline">
          Leer novela completa →
        </a>
      </div>
```

- [ ] **Step 4: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 5: Commit**

```bash
git add features/story/actions.ts "app/(app)/story/archive/" "app/(app)/story/page.tsx"
git commit -m "feat(story): add story archive page with pagination + link from story page"
```

---

## Task 3: Edit ritual

**Files:**
- Modify: `features/profile/actions.ts`
- Modify: `app/(app)/profile/rituals/edit-rituals.tsx`

- [ ] **Step 1: Add updateRitual action**

In `features/profile/actions.ts`, add this function after `toggleRitualActive`:

```typescript
export async function updateRitual(ritualId: string, formData: FormData) {
  const { user } = await verifySession();

  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) return { error: "No encontrado" };

  const descripcion = formData.get("descripcion") as string;
  const dias = formData.getAll("dias") as string[];
  const horaInicio = formData.get("horaInicio") as string;
  const horaFin = formData.get("horaFin") as string;
  const lugar = formData.get("lugar") as string;

  if (!descripcion || !dias.length || !horaInicio || !horaFin || !lugar) {
    return { error: "Todos los campos son obligatorios" };
  }

  if (horaInicio >= horaFin) {
    return { error: "La hora de fin debe ser después del inicio" };
  }

  await db
    .update(rituals)
    .set({ descripcion, dias, horaInicio, horaFin, lugar })
    .where(eq(rituals.id, ritualId));

  revalidatePath("/profile/rituals");
  return { success: true };
}
```

- [ ] **Step 2: Update edit-rituals.tsx to include edit functionality**

Read `app/(app)/profile/rituals/edit-rituals.tsx`. Add an edit mode. This is a larger change — the implementer should:

1. Add `import { updateRitual } from "@/features/profile/actions"` to imports
2. Add `editingId` state to track which ritual is being edited
3. When "Editar" is clicked, populate the form fields with ritual data and set editingId
4. When form submits with editingId set, call updateRitual instead of createRitual
5. Add "Cancelar" button to exit edit mode
6. Add "Editar" button next to each ritual's "Desactivar" button

The edit form should reuse the same form as create (habit, days, hours, place) but pre-filled with current values.

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add features/profile/actions.ts "app/(app)/profile/rituals/edit-rituals.tsx"
git commit -m "feat(profile): add edit ritual functionality with updateRitual action"
```

---

## Task 4: Suggested rituals by category

**Files:**
- Modify: `app/(app)/onboarding/steps/step-mission.tsx`

- [ ] **Step 1: Add SUGGESTED_RITUALS constant and toggle logic**

In `step-mission.tsx`, add after the `DAYS` constant:

```typescript
const SUGGESTED_RITUALS: Record<string, { descripcion: string; dias: string[]; horaInicio: string; horaFin: string; lugar: string }[]> = {
  "Sueño": [
    { descripcion: "Dormir antes de las 23", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:30", horaFin: "23:00", lugar: "Habitación" },
    { descripcion: "No pantallas 1h antes de dormir", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:00", horaFin: "22:30", lugar: "Casa" },
  ],
  "Alimentación": [
    { descripcion: "Cocinar el desayuno", dias: ["lun","mar","mie","jue","vie"], horaInicio: "07:00", horaFin: "09:00", lugar: "Cocina" },
    { descripcion: "Preparar almuerzo casero", dias: ["lun","mar","mie","jue","vie"], horaInicio: "12:00", horaFin: "13:00", lugar: "Cocina" },
  ],
  "Movimiento": [
    { descripcion: "Caminar 30 minutos", dias: ["lun","mar","mie","jue","vie"], horaInicio: "07:00", horaFin: "08:00", lugar: "Barrio" },
    { descripcion: "Ejercicio o deporte", dias: ["lun","mie","vie"], horaInicio: "18:00", horaFin: "19:00", lugar: "Gimnasio" },
  ],
  "Mente": [
    { descripcion: "Meditar 10 minutos", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "07:00", horaFin: "07:30", lugar: "Habitación" },
    { descripcion: "Leer 20 minutos", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:00", horaFin: "22:30", lugar: "Casa" },
  ],
  "Cuidado": [
    { descripcion: "Tomar 2 litros de agua", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "08:00", horaFin: "22:00", lugar: "Donde sea" },
    { descripcion: "Skincare noche", dias: ["lun","mar","mie","jue","vie","sab","dom"], horaInicio: "22:00", horaFin: "22:30", lugar: "Baño" },
  ],
};
```

When user selects a category, show suggested rituals as toggleable cards (pre-added to the rituals list). User can remove them with ✕ or add custom ones.

Update the category selection handler to auto-add suggested rituals:

```typescript
function handleCategorySelect(cat: string) {
  setCategory(cat);
  // Auto-add suggested rituals for this category (if not already added)
  const suggestions = SUGGESTED_RITUALS[cat] ?? [];
  const existingDescriptions = new Set(rituals.map(r => r.descripcion));
  const newSuggestions = suggestions
    .filter(s => !existingDescriptions.has(s.descripcion))
    .map(s => ({ ...s, id: crypto.randomUUID() }));
  if (newSuggestions.length > 0) {
    setRituals(prev => [...prev, ...newSuggestions]);
  }
}
```

Replace the category button `onClick={() => setCategory(c)}` with `onClick={() => handleCategorySelect(c)}`.

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/onboarding/steps/step-mission.tsx"
git commit -m "feat(onboarding): add suggested rituals by category with auto-populate"
```

---

## Task 5: Heatmap alignment to day-of-week

**Files:**
- Modify: `app/(app)/profile/profile-view.tsx`

- [ ] **Step 1: Fix heatmap grid to align with Monday start**

In `profile-view.tsx`, find the heatmap grid building section (the `days` array construction). Replace:

```typescript
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
```

With:

```typescript
  // Build heatmap grid aligned to Monday start
  const days: { date: string; ratio: number; empty?: boolean }[] = [];

  // Find the Monday 4 weeks ago
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);
  const dayOfWeek = fourWeeksAgo.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startMonday = new Date(fourWeeksAgo);
  startMonday.setDate(fourWeeksAgo.getDate() + mondayOffset);

  // Fill from that Monday to today
  const today = new Date();
  const current = new Date(startMonday);
  while (current <= today) {
    const dateStr = current.toISOString().split("T")[0];
    const data = heatmap[dateStr];
    const isFuture = current > today;
    days.push({
      date: dateStr,
      ratio: data ? data.completed / Math.max(data.total, 1) : 0,
      empty: isFuture,
    });
    current.setDate(current.getDate() + 1);
  }

  // Pad remaining cells to fill the grid (multiple of 7)
  while (days.length % 7 !== 0) {
    days.push({ date: "", ratio: 0, empty: true });
  }
```

Also update the grid rendering to handle empty cells:

Find the cell rendering and update the style:

```typescript
style={{
  backgroundColor: d.empty
    ? "transparent"
    : d.ratio === 0
      ? "rgba(255,255,255,0.03)"
      : `rgba(76,175,80,${Math.max(0.15, d.ratio)})`,
}}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/profile/profile-view.tsx"
git commit -m "feat(profile): align heatmap grid to Monday start with padding"
```

---

## Task 6: Back button in onboarding

**Files:**
- Modify: `app/(app)/onboarding/onboarding-flow.tsx`
- Modify: `app/(app)/onboarding/steps/step-character.tsx`
- Modify: `app/(app)/onboarding/steps/step-mission.tsx`

- [ ] **Step 1: Add onBack prop to onboarding flow**

In `onboarding-flow.tsx`, update the step rendering to pass `onBack`:

Replace the step rendering section:

```typescript
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
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && <StepPrologue userId={userId} />}
```

- [ ] **Step 2: Add back button to StepMission**

In `step-mission.tsx`, add `onBack` to Props type:

```typescript
type Props = {
  rituals: RitualDraft[];
  onComplete: () => void;
  onBack: () => void;
};
```

Update the function signature:

```typescript
export function StepMission({ rituals: initialRituals, onComplete, onBack }: Props) {
```

Add back button at the top of the return, after the title:

```typescript
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-xs text-hq-text-faint hover:text-hq-text-muted"
      >
        ← Volver al personaje
      </button>
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/onboarding/onboarding-flow.tsx" "app/(app)/onboarding/steps/step-mission.tsx"
git commit -m "feat(onboarding): add back button from step 2 to step 1"
```

---

## Task 7: Pact sealed view with labels

**Files:**
- Modify: `app/(app)/pact/pact-view.tsx`

- [ ] **Step 1: Replace sealed view answers section with labeled format**

In `pact-view.tsx`, find the sealed view section. Replace the two answer blocks:

Find:
```typescript
        <div className="rounded-lg bg-hq-bg-card p-3">
          <div className="mb-1 text-xs opacity-35">{myName}</div>
          <div className="text-xs opacity-50 leading-relaxed">
            {Object.values(myAnswers ?? {}).join(". ")}
          </div>
        </div>

        {otherAnswers && (
          <div className="rounded-lg bg-hq-bg-card p-3">
            <div className="mb-1 text-xs opacity-35">{otherName}</div>
            <div className="text-xs opacity-50 leading-relaxed">
              {Object.values(otherAnswers).join(". ")}
            </div>
          </div>
        )}
```

Replace with:

```typescript
        <div className="rounded-lg bg-hq-bg-card p-3">
          <div className="mb-2 text-xs font-semibold text-hq-text-muted">{myName}</div>
          <div className="space-y-2">
            {QUESTIONS.map((q) => (
              <div key={q.key}>
                <div className="text-[10px] text-hq-text-faint">{q.label}</div>
                <div className="text-xs text-hq-text-muted">{(myAnswers as Record<string, string>)?.[q.key] ?? ""}</div>
              </div>
            ))}
          </div>
        </div>

        {otherAnswers && (
          <div className="rounded-lg bg-hq-bg-card p-3">
            <div className="mb-2 text-xs font-semibold text-hq-text-muted">{otherName}</div>
            <div className="space-y-2">
              {QUESTIONS.map((q) => (
                <div key={q.key}>
                  <div className="text-[10px] text-hq-text-faint">{q.label}</div>
                  <div className="text-xs text-hq-text-muted">{(otherAnswers as Record<string, string>)?.[q.key] ?? ""}</div>
                </div>
              ))}
            </div>
          </div>
        )}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/pact/pact-view.tsx"
git commit -m "feat(pact): show question labels in sealed pact view"
```

---

## Task 8: Client-side push scheduling

**Files:**
- Modify: `app/(app)/_components/push-registration.tsx`

- [ ] **Step 1: Add local notification scheduling after SW registration**

Replace the ENTIRE content of `push-registration.tsx`:

```typescript
"use client";

import { useEffect } from "react";

export function PushRegistration() {
  useEffect(() => {
    registerAndSchedule();
  }, []);

  async function registerAndSchedule() {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Subscribe for server-sent push (existing logic)
      if ("PushManager" in window) {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          });

          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
        } catch {
          // Push subscription failed — continue with local notifications
        }
      }

      // Schedule local notifications for today's rituals
      scheduleLocalNotifications();
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  }

  async function scheduleLocalNotifications() {
    try {
      const res = await fetch("/api/push/today-rituals");
      if (!res.ok) return;
      const rituals: { descripcion: string; horaInicio: string }[] = await res.json();

      const now = new Date();

      for (const ritual of rituals) {
        const [hours, minutes] = ritual.horaInicio.split(":").map(Number);
        const ritualTime = new Date(now);
        ritualTime.setHours(hours, minutes, 0, 0);

        const delay = ritualTime.getTime() - now.getTime();
        if (delay > 0) {
          setTimeout(() => {
            new Notification("🔥 Ritual", {
              body: ritual.descripcion,
              icon: "/icons/icon-192.png",
            });
          }, delay);
        }
      }
    } catch {
      // Silent fail — local notifications are best-effort
    }
  }

  return null;
}
```

- [ ] **Step 2: Create today-rituals API endpoint**

Create `app/api/push/today-rituals/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/features/shared/auth";
import { resolveUserId } from "@/features/shared/auth/dal";
import { getTodayRituals } from "@/features/rituals/actions";

export async function GET() {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  const rituals = await getTodayRituals(userId);
  const pending = rituals
    .filter((r) => !r.completedToday)
    .map((r) => ({ descripcion: r.descripcion, horaInicio: r.horaInicio }));

  return NextResponse.json(pending);
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/_components/push-registration.tsx" "app/api/push/today-rituals/"
git commit -m "feat(push): add client-side local notification scheduling for rituals"
```

---

## Task 9: Turn notification (client-side)

**Files:**
- Modify: `app/(app)/_components/push-registration.tsx`

- [ ] **Step 1: Add turn check to push-registration**

In `push-registration.tsx`, add after `scheduleLocalNotifications()` call:

```typescript
      // Check if it's my turn to write
      checkTurnNotification();
```

Add the function:

```typescript
  async function checkTurnNotification() {
    try {
      const res = await fetch("/api/push/check-turn");
      if (!res.ok) return;
      const { isMyTurn } = await res.json();

      if (isMyTurn) {
        // Show notification after 2 seconds (let app load first)
        setTimeout(() => {
          new Notification("📖 Es tu turno", {
            body: "Escribí tu parte de la historia de Valdris",
            icon: "/icons/icon-192.png",
          });
        }, 2000);
      }
    } catch {
      // Silent fail
    }
  }
```

- [ ] **Step 2: Create check-turn API endpoint**

Create `app/api/push/check-turn/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/features/shared/auth";
import { resolveUserId } from "@/features/shared/auth/dal";
import { getStoryState } from "@/features/story/actions";

export async function GET() {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ isMyTurn: false }, { status: 401 });
  }

  const state = await getStoryState(userId);
  return NextResponse.json({ isMyTurn: state.isMyTurn });
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/_components/push-registration.tsx" "app/api/push/check-turn/"
git commit -m "feat(push): add turn notification — notify when it's your turn to write"
```

---

## Summary

| Task | Feature | Files | Parallel? |
|------|---------|-------|-----------|
| 1 | Turn auto-pass + getStoryArchive | `features/story/actions.ts` | Yes |
| 2 | Story archive page + link | 3 files (new page + component + link) | After T1 |
| 3 | Edit ritual | `features/profile/actions.ts` + `edit-rituals.tsx` | Yes |
| 4 | Suggested rituals | `step-mission.tsx` | Yes |
| 5 | Heatmap alignment | `profile-view.tsx` | Yes |
| 6 | Back button | `onboarding-flow.tsx` + `step-mission.tsx` | Yes |
| 7 | Pact sealed labels | `pact-view.tsx` | Yes |
| 8 | Client-side push | `push-registration.tsx` + new API route | Yes |
| 9 | Turn notification | `push-registration.tsx` + new API route | After T8 |

**Execution:** T1 first (adds getStoryArchive needed by T2). Then T2-T8 in parallel. T9 after T8 (same file).

**After this plan:** All spec features implemented. Ready for Plan F (a11y + deploy).
