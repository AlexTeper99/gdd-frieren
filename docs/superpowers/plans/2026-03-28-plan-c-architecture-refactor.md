# Plan C: Architecture Refactor — Feature-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor from `lib/` layer-based structure to `features/` feature-first structure. Move 21 files, update 64 imports across 38 files, clean up empty directories.

**Architecture:** Each feature (onboarding, rituals, story, pact, profile, push) becomes a self-contained folder. `features/shared/` holds cross-cutting concerns (db, auth, constants, utils). `app/` remains routing-only, importing from `features/`.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM. Uses `git mv` to preserve git history.

**Depends on:** Plan A + Plan B must be completed first.

**Risk:** LOW — no logic changes, only file moves + import updates. Build verification after each task.

---

## Execution Strategy

This plan is split into 4 tasks executed **sequentially** (each depends on prior):

1. **Task 1:** Create directory structure + move shared files (db, auth, utils, constants)
2. **Task 2:** Move feature files (actions, prompts, memory, push)
3. **Task 3:** Update ALL imports in `app/` pages and API routes
4. **Task 4:** Clean up empty `lib/` directories, verify build, commit

**IMPORTANT:** Tasks must be sequential because import paths change incrementally. Parallel execution would cause build failures.

---

## Task 1: Create directories + move shared files

**Files:**
- Move: `lib/db/index.ts` → `features/shared/db/index.ts`
- Move: `lib/db/schema.ts` → `features/shared/db/schema.ts`
- Move: `lib/auth/index.ts` → `features/shared/auth/index.ts`
- Move: `lib/dal.ts` → `features/shared/auth/dal.ts`
- Move: `app/(app)/actions.ts` → `features/shared/auth/actions.ts`
- Move: `lib/shared/constants.ts` → `features/shared/constants.ts`
- Move: `lib/utils.ts` → `features/shared/utils.ts`

- [ ] **Step 1: Create all feature directories**

```bash
mkdir -p features/{onboarding,rituals,story/prompts/modules,pact,profile,push,shared/{auth,db}}
```

- [ ] **Step 2: Move shared/db files**

```bash
git mv lib/db/index.ts features/shared/db/index.ts
git mv lib/db/schema.ts features/shared/db/schema.ts
```

- [ ] **Step 3: Move shared/auth files**

```bash
git mv lib/auth/index.ts features/shared/auth/index.ts
git mv lib/dal.ts features/shared/auth/dal.ts
git mv "app/(app)/actions.ts" features/shared/auth/actions.ts
```

- [ ] **Step 4: Move shared utilities**

```bash
git mv lib/shared/constants.ts features/shared/constants.ts
git mv lib/utils.ts features/shared/utils.ts
```

- [ ] **Step 5: Update internal imports within moved shared files**

`features/shared/db/index.ts` — update schema import:
```typescript
// Change: import * as schema from "./schema";
// This is a relative import, so it should still work after move. Verify.
```

`features/shared/auth/index.ts` — update db import:
```typescript
// Old: import { db } from "@/lib/db";
// New: import { db } from "@/features/shared/db";
// Old: import * as schema from "@/lib/db/schema";
// New: import * as schema from "@/features/shared/db/schema";
```

`features/shared/auth/dal.ts` — update imports:
```typescript
// Old: import { auth } from "@/lib/auth";
// New: import { auth } from "@/features/shared/auth";
// Old: import { db } from "@/lib/db";
// New: import { db } from "@/features/shared/db";
// Old: import { users } from "@/lib/db/schema";
// New: import { users } from "@/features/shared/db/schema";
```

`features/shared/auth/actions.ts` — update import:
```typescript
// Old: import { signOut } from "@/lib/auth";
// New: import { signOut } from "@/features/shared/auth";
```

- [ ] **Step 6: Update components/ui imports**

All 6 files in `components/ui/` import from `@/lib/utils`. Update each:

```bash
# For each file: button.tsx, card.tsx, input.tsx, label.tsx, select.tsx, textarea.tsx
# Change: import { cn } from "@/lib/utils"
# To:     import { cn } from "@/features/shared/utils"
```

- [ ] **Step 7: Verify build compiles (will have errors from remaining lib/ imports — that's expected)**

Run: `npm run build 2>&1 | head -20`
Expected: Errors about `@/lib/actions/*` imports not found (these move in Task 2)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: move shared files to features/shared/ (db, auth, utils, constants)"
```

---

## Task 2: Move feature files

**Files:**
- Move: `lib/actions/onboarding.ts` → `features/onboarding/actions.ts`
- Move: `lib/actions/rituals.ts` → `features/rituals/actions.ts`
- Move: `lib/actions/hp.ts` → `features/rituals/penalty.ts`
- Move: `lib/actions/story.ts` → `features/story/actions.ts`
- Move: `lib/actions/pact.ts` → `features/pact/actions.ts`
- Move: `lib/actions/profile.ts` → `features/profile/actions.ts`
- Move: `lib/prompts/*` → `features/story/prompts/*`
- Move: `lib/narrative/memory.ts` → `features/story/memory.ts`
- Move: `lib/push/vapid.ts` → `features/push/vapid.ts`
- Move: `lib/push/send.ts` → `features/push/send.ts`

- [ ] **Step 1: Move action files**

```bash
git mv lib/actions/onboarding.ts features/onboarding/actions.ts
git mv lib/actions/rituals.ts features/rituals/actions.ts
git mv lib/actions/hp.ts features/rituals/penalty.ts
git mv lib/actions/story.ts features/story/actions.ts
git mv lib/actions/pact.ts features/pact/actions.ts
git mv lib/actions/profile.ts features/profile/actions.ts
```

- [ ] **Step 2: Move prompts**

```bash
git mv lib/prompts/base.ts features/story/prompts/base.ts
git mv lib/prompts/index.ts features/story/prompts/index.ts
git mv lib/prompts/types.ts features/story/prompts/types.ts
git mv lib/prompts/build-context.ts features/story/prompts/build-context.ts
git mv lib/prompts/modules/diario.ts features/story/prompts/modules/diario.ts
git mv lib/prompts/modules/prologo.ts features/story/prompts/modules/prologo.ts
```

- [ ] **Step 3: Move memory + push**

```bash
git mv lib/narrative/memory.ts features/story/memory.ts
git mv lib/push/vapid.ts features/push/vapid.ts
git mv lib/push/send.ts features/push/send.ts
```

- [ ] **Step 4: Update imports within all moved feature files**

Every moved file needs its `@/lib/` imports updated to `@/features/`. Here's the complete list:

**features/onboarding/actions.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
@/lib/dal        → @/features/shared/auth/dal
```

**features/rituals/actions.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
@/lib/dal        → @/features/shared/auth/dal
@/lib/shared/constants → @/features/shared/constants
```

**features/rituals/penalty.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
@/lib/shared/constants → @/features/shared/constants
```

**features/story/actions.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```

**features/pact/actions.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
@/lib/dal        → @/features/shared/auth/dal
@/lib/shared/constants → @/features/shared/constants
```

**features/profile/actions.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
@/lib/dal        → @/features/shared/auth/dal
```

**features/story/prompts/build-context.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```
(Also check: types.ts import is relative `./types` — should still work)

**features/story/memory.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```

**features/push/send.ts:**
```
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```
(Also: `./vapid` relative import should still work)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move feature files to features/ (actions, prompts, memory, push)"
```

---

## Task 3: Update all imports in app/ pages and API routes

**Files:** Every file under `app/` that imports from `@/lib/`

- [ ] **Step 1: Update app/(app)/ page imports**

**app/(app)/layout.tsx:**
```
@/lib/dal → @/features/shared/auth/dal
```

**app/(app)/page.tsx:**
```
@/lib/dal        → @/features/shared/auth/dal
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
@/lib/shared/constants → @/features/shared/constants
```

**app/(app)/home-screen.tsx:**
```
@/features/shared/auth/actions → @/features/shared/auth/actions
```
(Check: this might already import from the new path if actions.ts was moved in Task 1)

**app/(app)/onboarding/page.tsx:**
```
@/lib/dal        → @/features/shared/auth/dal
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```

**app/(app)/onboarding/steps/step-character.tsx:**
```
@/lib/actions/onboarding → @/features/onboarding/actions
```

**app/(app)/onboarding/steps/step-mission.tsx:**
```
@/lib/actions/onboarding → @/features/onboarding/actions
```

**app/(app)/onboarding/steps/step-prologue.tsx:**
```
@/lib/actions/onboarding → @/features/onboarding/actions
```

**app/(app)/rituals/page.tsx:**
```
@/lib/dal             → @/features/shared/auth/dal
@/lib/actions/rituals → @/features/rituals/actions
```

**app/(app)/rituals/rituals-list.tsx:**
```
@/lib/actions/rituals → @/features/rituals/actions
```

**app/(app)/story/page.tsx:**
```
@/lib/dal            → @/features/shared/auth/dal
@/lib/actions/story  → @/features/story/actions
```

**app/(app)/pact/page.tsx:**
```
@/lib/dal           → @/features/shared/auth/dal
@/lib/db            → @/features/shared/db
@/lib/db/schema     → @/features/shared/db/schema
@/lib/actions/pact  → @/features/pact/actions
```

**app/(app)/pact/pact-view.tsx:**
```
@/lib/actions/pact → @/features/pact/actions
```

**app/(app)/profile/page.tsx:**
```
@/lib/dal              → @/features/shared/auth/dal
@/lib/actions/profile  → @/features/profile/actions
```

**app/(app)/profile/[userId]/page.tsx:**
```
@/lib/dal              → @/features/shared/auth/dal
@/lib/actions/profile  → @/features/profile/actions
```

**app/(app)/profile/rituals/page.tsx:**
```
@/lib/dal              → @/features/shared/auth/dal
@/lib/db               → @/features/shared/db
@/lib/db/schema        → @/features/shared/db/schema
```

**app/(app)/profile/rituals/edit-rituals.tsx:**
```
@/lib/actions/profile → @/features/profile/actions
```

- [ ] **Step 2: Update app/(auth)/ imports**

**app/(auth)/login/actions.ts:**
```
@/lib/auth → @/features/shared/auth
```

- [ ] **Step 3: Update app/api/ imports**

**app/api/auth/[...nextauth]/route.ts:**
```
@/lib/auth → @/features/shared/auth
```

**app/api/cron/daily-penalty/route.ts:**
```
@/lib/actions/hp → @/features/rituals/penalty
```

**app/api/cron/schedule-pushes/route.ts:**
```
@/lib/push/send  → @/features/push/send
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```

**app/api/push/subscribe/route.ts:**
```
@/lib/auth       → @/features/shared/auth
@/lib/dal        → @/features/shared/auth/dal
@/lib/db         → @/features/shared/db
@/lib/db/schema  → @/features/shared/db/schema
```

**app/api/story/generate/route.ts:**
```
@/lib/auth                  → @/features/shared/auth
@/lib/dal                   → @/features/shared/auth/dal
@/lib/prompts               → @/features/story/prompts
@/lib/prompts/build-context → @/features/story/prompts/build-context
@/lib/narrative/memory      → @/features/story/memory
@/lib/db                    → @/features/shared/db
@/lib/db/schema             → @/features/shared/db/schema
@/lib/shared/constants      → @/features/shared/constants
@/lib/actions/story         → @/features/story/actions
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: update all app/ imports from @/lib/ to @/features/"
```

---

## Task 4: Cleanup + verify + push

- [ ] **Step 1: Remove empty lib/ directories**

```bash
rm -rf lib/actions lib/prompts lib/db lib/push lib/auth lib/narrative lib/shared
rmdir lib 2>/dev/null || true
```

- [ ] **Step 2: Verify no remaining @/lib/ imports**

```bash
grep -r "@/lib/" --include="*.ts" --include="*.tsx" app/ features/ components/ | head -20
```

Expected: 0 results (no remaining `@/lib/` imports)

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds with no errors

- [ ] **Step 4: Verify tests (if any)**

```bash
npm run test:run 2>&1 | tail -10
```

Expected: Tests pass (or skip if no relevant tests)

- [ ] **Step 5: Final commit + push**

```bash
git add -A
git commit -m "refactor: remove empty lib/ directories, feature-first architecture complete"
git push origin develop
```

---

## Summary

| Task | What it does | Files moved | Imports updated |
|------|-------------|-------------|-----------------|
| 1 | Move shared (db, auth, utils, constants) | 7 | ~12 internal |
| 2 | Move features (actions, prompts, memory, push) | 14 | ~20 internal |
| 3 | Update app/ page and API route imports | 0 | ~32 app/ files |
| 4 | Cleanup + verify | 0 | 0 (verification) |
| **Total** | | **21 files** | **~64 imports** |

**After this plan:** Codebase is organized by feature. `lib/` directory is gone. All imports use `@/features/`. Ready for Plan D (UX + design tokens).

### Final directory structure:

```
features/
├── onboarding/actions.ts
├── rituals/
│   ├── actions.ts
│   └── penalty.ts
├── story/
│   ├── actions.ts
│   ├── memory.ts
│   └── prompts/
│       ├── base.ts
│       ├── build-context.ts
│       ├── index.ts
│       ├── types.ts
│       └── modules/
│           ├── diario.ts
│           └── prologo.ts
├── pact/actions.ts
├── profile/actions.ts
├── push/
│   ├── vapid.ts
│   └── send.ts
└── shared/
    ├── auth/
    │   ├── index.ts
    │   ├── dal.ts
    │   └── actions.ts
    ├── db/
    │   ├── index.ts
    │   └── schema.ts
    ├── constants.ts
    └── utils.ts

app/                          ← routing only, imports from features/
components/ui/                ← shadcn, imports from features/shared/utils
```
