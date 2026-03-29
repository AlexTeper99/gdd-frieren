# Plan D: UX + Design Tokens + Loading/Error/Empty States

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add design tokens to globals.css, create loading/error boundaries, add empty states, improve ritual/pact error handling, add heatmap legend, and refactor all hardcoded colors to use CSS variables.

**Architecture:** CSS custom properties in `:root` for theming. Next.js loading.tsx/error.tsx for page-level states. Client component state for inline loading/error/empty patterns. Tailwind `var()` syntax for color consistency.

**Tech Stack:** Tailwind CSS v4, Next.js 16 App Router, React 19

**Depends on:** Plans A, B, C must be completed first. Feature-first architecture in place.

**Already done (skip):** Metadata + PWA (Plan B T8), story/prologue error handling (Plan B T4), story/prologue/pact/edit-rituals loading states.

---

## Task 1: Add design tokens to globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add Habit Quest design tokens to the .dark block**

In `app/globals.css`, find the `.dark {` block (line 86). Add these custom properties AT THE END of the block, before the closing `}`:

```css
  /* Habit Quest design tokens */
  --hq-bg: #0a0a0f;
  --hq-bg-card: rgba(255, 255, 255, 0.03);
  --hq-bg-card-hover: rgba(255, 255, 255, 0.06);
  --hq-text: #e8e4df;
  --hq-text-muted: rgba(255, 255, 255, 0.4);
  --hq-text-faint: rgba(255, 255, 255, 0.15);
  --hq-border: rgba(255, 255, 255, 0.08);
  --hq-border-hover: rgba(255, 255, 255, 0.15);
  --hq-purple: #aa82ff;
  --hq-purple-bg: rgba(170, 130, 255, 0.08);
  --hq-purple-border: rgba(170, 130, 255, 0.25);
  --hq-green: #4caf50;
  --hq-green-bg: rgba(76, 175, 80, 0.08);
  --hq-green-border: rgba(76, 175, 80, 0.25);
  --hq-red: #ef5350;
  --hq-red-bg: rgba(239, 83, 80, 0.08);
  --hq-red-border: rgba(239, 83, 80, 0.15);
  --hq-blue: #42a5f5;
  --hq-blue-bg: rgba(66, 165, 245, 0.1);
  --hq-blue-border: rgba(66, 165, 245, 0.25);
  --hq-amber: #ffb74d;
  --hq-amber-bg: rgba(255, 183, 77, 0.08);
  --hq-amber-border: rgba(255, 183, 77, 0.25);
```

- [ ] **Step 2: Add the same tokens to the @theme inline block**

In the `@theme inline {` block (line 7), add at the end before `}`:

```css
  --color-hq-bg: var(--hq-bg);
  --color-hq-bg-card: var(--hq-bg-card);
  --color-hq-bg-card-hover: var(--hq-bg-card-hover);
  --color-hq-text: var(--hq-text);
  --color-hq-text-muted: var(--hq-text-muted);
  --color-hq-text-faint: var(--hq-text-faint);
  --color-hq-border: var(--hq-border);
  --color-hq-border-hover: var(--hq-border-hover);
  --color-hq-purple: var(--hq-purple);
  --color-hq-purple-bg: var(--hq-purple-bg);
  --color-hq-purple-border: var(--hq-purple-border);
  --color-hq-green: var(--hq-green);
  --color-hq-green-bg: var(--hq-green-bg);
  --color-hq-green-border: var(--hq-green-border);
  --color-hq-red: var(--hq-red);
  --color-hq-red-bg: var(--hq-red-bg);
  --color-hq-red-border: var(--hq-red-border);
  --color-hq-blue: var(--hq-blue);
  --color-hq-blue-bg: var(--hq-blue-bg);
  --color-hq-blue-border: var(--hq-blue-border);
  --color-hq-amber: var(--hq-amber);
  --color-hq-amber-bg: var(--hq-amber-bg);
  --color-hq-amber-border: var(--hq-amber-border);
```

This registers them as Tailwind colors so you can use `bg-hq-bg`, `text-hq-purple`, `border-hq-border`, etc.

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: add Habit Quest design tokens to globals.css"
```

---

## Task 2: Create loading.tsx files

**Files:**
- Create: `app/(app)/loading.tsx`

- [ ] **Step 1: Create app-level loading skeleton**

```typescript
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col gap-4 px-6 py-8 animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-hq-bg-card" />
      <div className="h-4 w-48 rounded bg-hq-bg-card" />
      <div className="mt-4 space-y-3">
        <div className="h-16 rounded-xl bg-hq-bg-card" />
        <div className="h-16 rounded-xl bg-hq-bg-card" />
        <div className="h-16 rounded-xl bg-hq-bg-card" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/loading.tsx"
git commit -m "feat: add loading skeleton for app pages"
```

---

## Task 3: Create error.tsx boundary

**Files:**
- Create: `app/(app)/error.tsx`

- [ ] **Step 1: Create app-level error boundary**

```typescript
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-6">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-sm text-hq-text-muted">
        {error.message || "Error inesperado. Intentá de nuevo."}
      </p>
      <button
        onClick={reset}
        className="rounded-xl border border-hq-purple-border bg-hq-purple-bg px-6 py-2 text-sm font-semibold text-hq-purple"
      >
        Reintentar
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/error.tsx"
git commit -m "feat: add app-level error boundary with retry"
```

---

## Task 4: Fix rituals-list — loading + error + empty state

**Files:**
- Modify: `app/(app)/rituals/rituals-list.tsx`

- [ ] **Step 1: Read current file and rewrite with loading, error, and empty state**

Read `app/(app)/rituals/rituals-list.tsx` first. Then replace the ENTIRE content with:

```typescript
"use client";

import { markRitualComplete } from "@/features/rituals/actions";
import { useState } from "react";
import Link from "next/link";

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
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleMark(ritualId: string) {
    setLoadingId(ritualId);
    setError(null);

    try {
      const result = await markRitualComplete(ritualId);
      if (result.success) {
        setItems((prev) =>
          prev.map((r) =>
            r.id === ritualId
              ? { ...r, completedToday: true, racha: result.newStreak! }
              : r
          )
        );
      } else {
        setError(result.error ?? "Error al marcar ritual");
      }
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoadingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-hq-text-muted">
          No tenés rituales para hoy
        </p>
        <Link
          href="/profile/rituals"
          className="text-xs text-hq-purple underline opacity-60 hover:opacity-100"
        >
          Agregar rituales
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="rounded-lg border border-hq-red-border bg-hq-red-bg p-3 text-sm text-hq-red">
          {error}
        </div>
      )}

      {items.map((r) => (
        <button
          key={r.id}
          onClick={() => !r.completedToday && loadingId !== r.id && handleMark(r.id)}
          disabled={r.completedToday || loadingId === r.id}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
            r.completedToday
              ? "border-hq-green-border bg-hq-green-bg"
              : loadingId === r.id
                ? "border-hq-border opacity-50"
                : "border-hq-border bg-hq-bg-card hover:border-hq-border-hover"
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
              r.completedToday
                ? "border-hq-green bg-hq-green text-white"
                : loadingId === r.id
                  ? "border-hq-border animate-pulse"
                  : "border-hq-border-hover"
            }`}
          >
            {r.completedToday ? "✓" : loadingId === r.id ? "…" : ""}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{r.descripcion}</div>
            <div className="text-[10px] text-hq-text-muted">
              {r.horaInicio}-{r.horaFin} · {r.lugar}
            </div>
          </div>
          <div className="text-xs font-semibold text-hq-amber">
            🔥 {r.racha}
          </div>
        </button>
      ))}

      <div className="mt-4 rounded-lg bg-hq-bg-card p-3 text-center text-[11px] text-hq-text-faint">
        Cada ✓ suma +5 HP (o +7 si racha ≥7)
        <br />
        No cumplido a las 23:59: -10 HP + racha = 0
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/rituals/rituals-list.tsx"
git commit -m "feat(rituals): add per-ritual loading, error state, empty state with CTA"
```

---

## Task 5: Story empty state

**Files:**
- Modify: `app/(app)/story/story-view.tsx`

- [ ] **Step 1: Read current file. Add empty state when no entries**

In `story-view.tsx`, find the turn badge section at the top of the return. BEFORE the turn badge, add:

```typescript
      {/* Empty state — first time */}
      {!lastEntry && entries.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-lg font-semibold">Tu aventura comienza</p>
          <p className="text-sm text-hq-text-muted">
            Escribí la primera entrada de la historia de Valdris.
          </p>
        </div>
      )}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/story/story-view.tsx"
git commit -m "feat(story): add empty state for first-time story view"
```

---

## Task 6: Pact error UI

**Files:**
- Modify: `app/(app)/pact/pact-view.tsx`

- [ ] **Step 1: Read current file. Find the useActionState and form, add error rendering**

In `pact-view.tsx`, the form uses `useActionState`. Find the `<form action={action}` section. Right after `<form action={action} className="flex flex-col gap-4">`, add:

```typescript
      {state?.error && (
        <div className="rounded-lg border border-hq-red-border bg-hq-red-bg p-3 text-sm text-hq-red">
          {state.error}
        </div>
      )}
```

Note: The `useActionState` returns `[state, action, pending]`. Make sure the first element is captured (currently it's `[, action, pending]` — change to `[state, action, pending]`).

Find:
```typescript
  const [, action, pending] = useActionState(
```

Replace with:
```typescript
  const [state, action, pending] = useActionState(
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add "app/(app)/pact/pact-view.tsx"
git commit -m "feat(pact): add error UI for pact submission failures"
```

---

## Task 7: Heatmap legend + partner message

**Files:**
- Modify: `app/(app)/profile/profile-view.tsx`
- Modify: `app/(app)/home-screen.tsx`

- [ ] **Step 1: Read profile-view.tsx. Add heatmap legend after the grid**

In `profile-view.tsx`, find the heatmap grid (`className="grid grid-cols-7 gap-[3px]"`). After the closing `</div>` of that grid, add:

```typescript
        <div className="mt-2 flex items-center gap-2 text-[10px] text-hq-text-faint">
          <span>Menos</span>
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(76,175,80,0.2)" }} />
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(76,175,80,0.5)" }} />
          <div className="h-3 w-3 rounded-sm" style={{ background: "rgba(76,175,80,0.8)" }} />
          <div className="h-3 w-3 rounded-sm bg-hq-green" />
          <span>Más</span>
        </div>
```

- [ ] **Step 2: Read home-screen.tsx. Update partner card when not onboarded**

In `home-screen.tsx`, find the section where `other` is rendered (the character card). Find the `"Esperando..."` fallback. The `other` prop uses `nombrePersonaje ?? "Esperando..."`.

The home page already handles this. But add a more explicit message. Find the other player card and after the HP display, check if nombre is "Esperando..." and show a subtitle:

Actually, this is handled at the page level in `app/(app)/page.tsx`. The `other` object sets `nombre: other.nombrePersonaje ?? "Esperando..."`. The card renders the name. This is acceptable for MVP. Skip this sub-step — the card already shows "Esperando..." which is clear enough.

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/profile/profile-view.tsx"
git commit -m "feat(profile): add heatmap legend (Menos → Más)"
```

---

## Task 8: Update layout.tsx body to use design tokens

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace hardcoded colors with token classes**

In `app/layout.tsx`, find:
```typescript
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#e8e4df]">
```

Replace with:
```typescript
      <body className="min-h-full flex flex-col bg-hq-bg text-hq-text">
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "refactor(layout): use design tokens instead of hardcoded colors"
```

---

## Task 9: Refactor all hardcoded colors to design tokens

**Files:**
- Modify: `app/(app)/home-screen.tsx`
- Modify: `app/(app)/rituals/rituals-list.tsx` (already using some tokens from Task 4)
- Modify: `app/(app)/story/story-view.tsx`
- Modify: `app/(app)/pact/pact-view.tsx`
- Modify: `app/(app)/profile/profile-view.tsx`
- Modify: `app/(app)/profile/rituals/edit-rituals.tsx`
- Modify: `app/(app)/onboarding/steps/step-character.tsx`
- Modify: `app/(app)/onboarding/steps/step-mission.tsx`
- Modify: `app/(app)/onboarding/steps/step-prologue.tsx`

- [ ] **Step 1: Read each file and apply color replacements**

Apply these find-and-replace rules across ALL files listed above. Read each file, apply replacements, write back.

**Replacement map (Tailwind classes):**

```
# Backgrounds
bg-white/5       → bg-hq-bg-card
bg-white/10      → bg-hq-bg-card-hover
hover:bg-white/10 → hover:bg-hq-bg-card-hover
bg-[#0a0a0f]     → bg-hq-bg

# Borders
border-white/10  → border-hq-border
border-white/5   → border-hq-border
border-white/15  → border-hq-border-hover
border-white/8   → border-hq-border
hover:border-white/20 → hover:border-hq-border-hover

# Text
opacity-35       → text-hq-text-muted (where used for text dimming)
opacity-40       → text-hq-text-muted (where used for labels/descriptions)
opacity-25       → text-hq-text-faint
opacity-20       → text-hq-text-faint
opacity-15       → text-hq-text-faint
opacity-30       → text-hq-text-faint

# Purple accent
border-purple-500/30 → border-hq-purple-border
border-purple-500/40 → border-hq-purple-border
border-purple-500/15 → border-hq-purple-border
bg-purple-500/10     → bg-hq-purple-bg
bg-purple-500/15     → bg-hq-purple-bg
bg-purple-500/5      → bg-hq-purple-bg
bg-purple-500/8      → bg-hq-purple-bg
text-purple-300      → text-hq-purple

# Green accent
border-green-500/30  → border-hq-green-border
border-green-500/25  → border-hq-green-border
border-green-500/20  → border-hq-green-border
bg-green-500/10      → bg-hq-green-bg
bg-green-500/5       → bg-hq-green-bg
text-green-500       → text-hq-green
text-green-400       → text-hq-green
bg-green-500         → bg-hq-green

# Red accent
border-red-500/20    → border-hq-red-border
border-red-500/15    → border-hq-red-border
bg-red-500/5         → bg-hq-red-bg
bg-red-500/10        → bg-hq-red-bg
text-red-400         → text-hq-red

# Blue accent
border-blue-500/20   → border-hq-blue-border
border-blue-500/10   → border-hq-blue-border
bg-blue-500/5        → bg-hq-blue-bg
bg-blue-500/10       → bg-hq-blue-bg

# Amber accent
border-amber-500/30  → border-hq-amber-border
border-amber-500/20  → border-hq-amber-border
bg-amber-500/5       → bg-hq-amber-bg
bg-amber-500/15      → bg-hq-amber-bg
text-amber-400       → text-hq-amber
text-amber-500       → text-hq-amber

# Orange (map to amber)
text-orange-400      → text-hq-amber
```

**IMPORTANT NOTES:**
- Do NOT replace `opacity-XX` when it's used for non-text opacity (e.g., a container's opacity, not text color). Only replace when it's clearly text dimming (on `<p>`, `<div>` with text, `<span>`).
- Some files (rituals-list.tsx) may already use tokens from Task 4. Skip those.
- Keep `rgba(76,175,80,...)` in profile-view.tsx heatmap — those are inline styles, not Tailwind classes.
- The `disabled:opacity-30` pattern should stay as-is (it's a state modifier, not a color).

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Verify visually**

Run dev server and check that all pages still look correct:
- Home: character cards, nav buttons
- Rituals: mark/unmark buttons
- Story: turn badge, narrative text
- Pact: form, sealed view
- Profile: HP bar, streaks, heatmap
- Onboarding: archetype cards, category pills

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "refactor: replace all hardcoded colors with design tokens (hq-*)"
```

---

## Summary

| Task | What it does | Files | Parallel? |
|------|-------------|-------|-----------|
| 1 | Design tokens in globals.css | globals.css | Yes |
| 2 | Loading skeleton | loading.tsx (create) | Yes |
| 3 | Error boundary | error.tsx (create) | Yes |
| 4 | Rituals: loading + error + empty | rituals-list.tsx | After T1 (uses tokens) |
| 5 | Story: empty state | story-view.tsx | After T1 |
| 6 | Pact: error UI | pact-view.tsx | Yes |
| 7 | Heatmap legend | profile-view.tsx | Yes |
| 8 | Layout: use tokens | layout.tsx | After T1 |
| 9 | Refactor all colors | 9 files, ~60 changes | After T1 |

**Execution order:** T1 first (tokens), then T2+T3+T6+T7 in parallel, then T4+T5+T8+T9 (depend on tokens).

**After this plan:** All UX states are covered (loading, error, empty). Colors use design tokens. Daiana can refine the theme by editing `globals.css` tokens. Ready for Plan E (new features).
