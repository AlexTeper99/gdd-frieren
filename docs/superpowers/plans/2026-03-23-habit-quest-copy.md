# Habit Quest Copy System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a typed copy infrastructure that exports all fixed UI strings from the copy design spec, enforced by automated tests.

**Architecture:** All copy lives in `lib/copy/` as typed TypeScript constants organized by feature area. A `getCopy` helper returns the recommended variant by default. Vitest tests enforce voice guide rules (word count, prohibited words, voseo). Existing hardcoded strings in auth pages get replaced.

**Tech Stack:** TypeScript, Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-habit-quest-copy-design.md`

---

## File Structure

```
lib/copy/
├── index.ts           # getCopy helper + re-exports
├── types.ts           # CopyEntry, CopyVariant types
├── onboarding.ts      # Screens 1-5
├── rituals.ts         # Tap UI, notifications, stat feedback
├── writing.ts         # Writing mechanic, turns
├── sunday.ts          # Sunday ritual steps, pact questions, firma
├── navigation.ts      # Nav labels, Nosotros, arc close, deferred
├── errors.ts          # All error messages
├── empty-states.ts    # All empty states
├── glossary.ts        # Stat names, glossary terms, prohibited words
└── stats.ts           # Stat display formats

__tests__/lib/copy/
└── copy-rules.test.ts # Voice guide enforcement + prohibited words tests
```

---

## Chunk 1: Types and Infrastructure

### Task 1: Define copy types

**Files:**
- Create: `lib/copy/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// lib/copy/types.ts

export type CopyVariant = "A" | "B" | "C";

export interface CopyEntry {
  A: string;
  B: string;
  C: string;
  /** Which variant is recommended */
  recommended: CopyVariant;
}

export interface TemplateCopyEntry {
  A: string;
  B: string;
  C: string;
  recommended: CopyVariant;
  /** Variable names used in the template, e.g. ["nombre", "ritual"] */
  vars: string[];
}

/** Get the recommended variant from a CopyEntry */
export function getCopy(entry: CopyEntry): string {
  return entry[entry.recommended];
}

/** Get a specific variant */
export function getVariant(entry: CopyEntry, variant: CopyVariant): string {
  return entry[variant];
}

/** Fill template variables in a copy string */
export function fillTemplate(
  entry: TemplateCopyEntry,
  values: Record<string, string>,
  variant?: CopyVariant
): string {
  let text = variant ? entry[variant] : entry[entry.recommended];
  for (const [key, value] of Object.entries(values)) {
    text = text.replaceAll(`[${key}]`, value);
  }
  return text;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/types.ts
git commit -m "feat(copy): add CopyEntry types and helper functions"
```

---

### Task 2: Write voice guide enforcement tests

**Files:**
- Create: `__tests__/lib/copy/copy-rules.test.ts`

- [ ] **Step 1: Write the tests**

```typescript
// __tests__/lib/copy/copy-rules.test.ts
import { describe, it, expect } from "vitest";
import type { CopyEntry, TemplateCopyEntry } from "@/lib/copy/types";

// Will import all copy modules once they exist
// For now, define the test helpers

/** Count words in a string, ignoring template variables like [nombre] */
function wordCount(s: string): number {
  return s
    .replace(/\[[^\]]+\]/g, "X") // replace template vars with single word
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Check if string contains prohibited words */
const PROHIBITED_WORDS = [
  "objetivo",
  "meta",
  "progreso",
  "productividad",
  "recordatorio",
  "completar",
  "logro",
  "achievement",
  "check-in",
  "hábito",
];

function containsProhibitedWord(s: string): string | null {
  const lower = s.toLowerCase();
  for (const word of PROHIBITED_WORDS) {
    if (lower.includes(word)) return word;
  }
  return null;
}

function isValidCopyEntry(
  entry: CopyEntry | TemplateCopyEntry
): entry is CopyEntry | TemplateCopyEntry {
  return (
    typeof entry.A === "string" &&
    typeof entry.B === "string" &&
    typeof entry.C === "string" &&
    ["A", "B", "C"].includes(entry.recommended)
  );
}

export { wordCount, containsProhibitedWord, isValidCopyEntry };

describe("copy rule helpers", () => {
  it("counts words correctly", () => {
    expect(wordCount("El mundo escuchó.")).toBe(3);
    expect(wordCount("¿Qué decide [nombre] hoy?")).toBe(4);
    expect(wordCount("[nombre]. [ritual]. [lugar], [hora].")).toBe(4);
  });

  it("detects prohibited words", () => {
    expect(containsProhibitedWord("Tu objetivo mensual")).toBe("objetivo");
    expect(containsProhibitedWord("El mundo escuchó.")).toBeNull();
    expect(containsProhibitedWord("Completar tu hábito")).toBe("completar");
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run __tests__/lib/copy/copy-rules.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 3: Commit**

```bash
git add __tests__/lib/copy/copy-rules.test.ts
git commit -m "test(copy): add voice guide enforcement test helpers"
```

---

## Chunk 2: Copy Constants — Onboarding & Rituals

> **TDD note:** The full voice guide tests (Task 11) are defined after all copy modules exist. After creating each copy file in Tasks 3-10, run `npx vitest run __tests__/lib/copy/` to verify the test helpers pass. Task 11 adds the comprehensive tests that validate ALL copy entries against the voice guide rules.

### Task 3: Onboarding copy (screens 1-5)

**Files:**
- Create: `lib/copy/onboarding.ts`

- [ ] **Step 1: Create onboarding copy file**

All strings come from spec section 1. Use ★ recommended variants as `recommended: "B"` throughout.

```typescript
// lib/copy/onboarding.ts
import type { CopyEntry } from "./types";

// --- Screen 1: La llegada ---

export const SCREEN1_OPENING: CopyEntry = {
  A: "Toda historia empieza con una decisión.",
  B: "Cada decisión construye a quien sos.",
  C: "El camino empieza cuando decidís quién ser.",
  recommended: "B",
};

export const SCREEN1_BUTTON: CopyEntry = {
  A: "Empezar",
  B: "Decidir",
  C: "Entrar",
  recommended: "B",
};

// --- Screen 2: Identidad y personaje ---

export const SCREEN2_IDENTITY_QUESTION: CopyEntry = {
  A: "¿Quién querés ser?",
  B: "¿Quién decidís ser?",
  C: "¿En quién te estás convirtiendo?",
  recommended: "B",
};

export const SCREEN2_IDENTITY_HELPER: CopyEntry = {
  A: "Quién, no qué.",
  B: "Pensalo. No hay respuesta incorrecta.",
  C: "La identidad guía todo lo demás.",
  recommended: "B",
};

export const SCREEN2_IDENTITY_PLACEHOLDER: CopyEntry = {
  A: "Soy alguien que cuida lo que come.",
  B: "Soy alguien que cuida cómo vive.",
  C: "Soy alguien que se mueve todos los días.",
  recommended: "B",
};

export const SCREEN2_NAME_QUESTION: CopyEntry = {
  A: "Nombrá a tu personaje.",
  B: "¿Cómo se llama?",
  C: "Tu personaje necesita un nombre.",
  recommended: "B",
};

export const SCREEN2_NAME_HELPER: CopyEntry = {
  A: "Puede ser tu nombre. Puede ser otro.",
  B: "Real o inventado.",
  C: "El nombre es el primer acto de identidad.",
  recommended: "B",
};

export const SCREEN2_BUTTON: CopyEntry = {
  A: "Siguiente",
  B: "Continuar",
  C: "Avanzar",
  recommended: "B",
};

// --- Screen 3: El arquetipo ---

export const SCREEN3_TITLE: CopyEntry = {
  A: "Elegí tu clase.",
  B: "Tu arquetipo.",
  C: "¿Qué tipo de personaje sos?",
  recommended: "B",
};

export const ARCHETYPE_GUERRERO: CopyEntry = {
  A: "Disciplina física. Lo que entrenás, lo controlás.",
  B: "Tu fuerza es tu cuerpo. Lo que entrenás, responde.",
  C: "Construís con el cuerpo. Tu disciplina es física.",
  recommended: "B",
};

export const ARCHETYPE_MAGO: CopyEntry = {
  A: "Disciplina mental. Lo que ordenás, se aclara.",
  B: "Mente clara, decisiones claras.",
  C: "Construís con la mente. Tu disciplina es mental.",
  recommended: "B",
};

export const ARCHETYPE_RANGER: CopyEntry = {
  A: "Disciplina flexible. Lo que no te frena, te fortalece.",
  B: "Ningún día es igual. Esa es tu ventaja.",
  C: "Construís en movimiento. Tu disciplina es adaptación.",
  recommended: "B",
};

export const ARCHETYPE_CURANDERO: CopyEntry = {
  A: "Disciplina interna. Lo que cuidás, crece.",
  B: "Lo que cuidás por dentro se nota por fuera.",
  C: "Construís desde adentro. Tu disciplina es cuidado.",
  recommended: "B",
};

// --- Archetype stat suggestions (narrative-only, no multipliers) ---

import type { StatKey } from "./stats";

export const ARCHETYPE_STATS: Record<string, StatKey[]> = {
  guerrero: ["str", "vit"],
  mago: ["int", "sta"],
  ranger: ["vit", "str", "int", "sta"], // balance
  curandero: ["vit", "sta"],
};

// --- Screen 4: Misión del arco y rituales ---

export const SCREEN4_TITLE: CopyEntry = {
  A: "Tu primer arco.",
  B: "Misión del arco.",
  C: "¿Cuál es la misión?",
  recommended: "B",
};

export const SCREEN4_SUBTITLE: CopyEntry = {
  A: "Un área por arco.",
  B: "Elegí una sola área para este primer arco.",
  C: "Todo el arco gira alrededor de esto.",
  recommended: "B",
};

export const SCREEN4_LABEL_WHAT: CopyEntry = {
  A: "El ritual. Concreto.",
  B: "¿Qué vas a hacer?",
  C: "La acción.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_WHAT = "Preparar mi desayuno";

export const SCREEN4_LABEL_WHEN: CopyEntry = {
  A: "Hora exacta.",
  B: "¿A qué hora?",
  C: "Cuándo.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_WHEN = "7:30";

export const SCREEN4_LABEL_WHERE: CopyEntry = {
  A: "Lugar específico.",
  B: "¿Dónde?",
  C: "El lugar.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_WHERE = "Mi cocina";

export const SCREEN4_LABEL_CONTINGENCY: CopyEntry = {
  A: "Si ese día no se puede...",
  B: "Plan alternativo.",
  C: "¿Y si no podés?",
  recommended: "B",
};

export const SCREEN4_HELPER_CONTINGENCY: CopyEntry = {
  A: "El ritual no se rompe. Se adapta.",
  B: "Mismo rumbo, distinto camino.",
  C: "Mejor un plan B que ningún plan.",
  recommended: "B",
};

export const SCREEN4_PLACEHOLDER_CONTINGENCY = "Desayuno simple, pero real.";

export const SCREEN4_ADD_RITUAL: CopyEntry = {
  A: "Agregar ritual",
  B: "Otro ritual",
  C: "+ Ritual",
  recommended: "B",
};

export const SCREEN4_LIMIT = "Hasta 3 rituales por arco.";

// --- Screen 5: Invitar ---

export const SCREEN5_TITLE: CopyEntry = {
  A: "Tu compañero de viaje.",
  B: "¿Quién camina con vos?",
  C: "Invitá a la otra persona.",
  recommended: "B",
};

export const SCREEN5_SUBTITLE: CopyEntry = {
  A: "La historia se escribe de a dos.",
  B: "Cuando los dos confirmen, nace el mundo.",
  C: "El mundo se genera cuando los dos entren.",
  recommended: "B",
};

export const SCREEN5_LABEL_EMAIL: CopyEntry = {
  A: "Su email.",
  B: "Email.",
  C: "Dirección de email.",
  recommended: "B",
};

export const SCREEN5_BUTTON: CopyEntry = {
  A: "Enviar invitación",
  B: "Invitar",
  C: "Enviar",
  recommended: "B",
};

export const SCREEN5_SKIP: CopyEntry = {
  A: "Seguir solo",
  B: "Empezar solo",
  C: "Sin compañero por ahora",
  recommended: "B",
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/onboarding.ts
git commit -m "feat(copy): add onboarding copy for screens 1-5"
```

---

### Task 4: Rituals copy (taps, notifications, stats)

**Files:**
- Create: `lib/copy/rituals.ts`

- [ ] **Step 1: Create rituals copy file**

All strings from spec sections 2 and 3.

```typescript
// lib/copy/rituals.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Notifications ---

export const NOTIFICATION_RITUAL: TemplateCopyEntry = {
  A: "[nombre], [ritual] espera. [lugar], [hora].",
  B: "[nombre]. [ritual]. [lugar], [hora].",
  C: "[ritual] espera. [lugar], [hora].",
  recommended: "B",
  vars: ["nombre", "ritual", "lugar", "hora"],
};

export const NOTIFICATION_PERMISSION: CopyEntry = {
  A: "Cada ritual tiene su hora. Activá notificaciones.",
  B: "Los rituales llegan a su hora. Necesitan notificaciones.",
  C: "Sin notificaciones no hay señal. Activar.",
  recommended: "B",
};

// --- Tap UI: Pill display ---

export const PILL_COMPLETED = "✓";
export const PILL_PENDING = "○";

// --- Tap UI: Feedback ---

export const TAP_FEEDBACK: TemplateCopyEntry = {
  A: "[stat] +[n]",
  B: "[stat] +[n] · Racha [days]d",
  C: "+[n] [stat]",
  recommended: "B",
  vars: ["stat", "n", "days"],
};

export const TAP_DAY_COMPLETE: CopyEntry = {
  A: "Rituales completos.",
  B: "Día completo.",
  C: "Todo registrado.",
  recommended: "B",
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/rituals.ts
git commit -m "feat(copy): add ritual tap and notification copy"
```

---

## Chunk 3: Copy Constants — Writing, Turns, Sunday

### Task 5: Writing mechanic and turn system copy

**Files:**
- Create: `lib/copy/writing.ts`

- [ ] **Step 1: Create writing copy file**

All strings from spec sections 4 and 5.

```typescript
// lib/copy/writing.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Writing button by time of day ---

export const WRITING_MORNING: TemplateCopyEntry = {
  A: "¿Qué decide [nombre] hoy?",
  B: "El camino se abre. ¿Qué decide [nombre]?",
  C: "[nombre]. El día empieza.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_MIDDAY: TemplateCopyEntry = {
  A: "El camino sigue. ¿Cómo avanza?",
  B: "El día avanza. ¿Qué decide [nombre]?",
  C: "[nombre] sigue en marcha.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_NIGHT: TemplateCopyEntry = {
  A: "¿Cómo termina este capítulo?",
  B: "Cae la noche. ¿Qué decide [nombre]?",
  C: "El día termina. Última decisión.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_PLACEHOLDER: TemplateCopyEntry = {
  A: "Tu decisión. 1-2 oraciones.",
  B: "¿Qué hace [nombre]?",
  C: "Escribí lo que decide tu personaje.",
  recommended: "B",
  vars: ["nombre"],
};

export const WRITING_CONFIRMATION: CopyEntry = {
  A: "El reino toma nota.",
  B: "El mundo escuchó.",
  C: "Decisión tomada.",
  recommended: "B",
};

// --- Turns ---

export const TURN_YOURS: CopyEntry = {
  A: "Tu turno.",
  B: "Hoy decidís vos.",
  C: "Es tu turno de escribir.",
  recommended: "B",
};

export const TURN_THEIRS: TemplateCopyEntry = {
  A: "Turno de [nombre].",
  B: "Hoy decide [nombre].",
  C: "No es tu turno.",
  recommended: "B",
  vars: ["nombre"],
};

export const TURN_THEIRS_SUBTITLE: TemplateCopyEntry = {
  A: "Leé lo que pasó ayer.",
  B: "Ayer [nombre] decidió. Así salió.",
  C: "La escena de ayer.",
  recommended: "B",
  vars: ["nombre"],
};

export const TURN_TOMORROW: CopyEntry = {
  A: "Mañana te toca.",
  B: "Tu turno es mañana.",
  C: "El mundo avanza mañana con tu turno.",
  recommended: "B",
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/writing.ts
git commit -m "feat(copy): add writing mechanic and turn system copy"
```

---

### Task 6: Sunday ritual copy

**Files:**
- Create: `lib/copy/sunday.ts`

- [ ] **Step 1: Create sunday copy file**

All strings from spec section 6.

```typescript
// lib/copy/sunday.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Step labels ---

export const SUNDAY_STEP_1: CopyEntry = {
  A: "Cierre semanal",
  B: "Lo que pasó esta semana",
  C: "Cierre de la semana",
  recommended: "B",
};

export const SUNDAY_STEP_2: CopyEntry = {
  A: "Boss semanal",
  B: "El boss",
  C: "Boss de la semana",
  recommended: "B",
};

export const SUNDAY_STEP_3: CopyEntry = {
  A: "Nuevo pacto",
  B: "El pacto",
  C: "Pacto de la semana",
  recommended: "B",
};

export const SUNDAY_STEP_4: CopyEntry = {
  A: "Firma",
  B: "Sellar",
  C: "La firma",
  recommended: "B",
};

// --- Pact questions ---

export const PACT_Q1: CopyEntry = {
  A: "¿Qué se viene difícil esta semana?",
  B: "¿Qué puede complicar tus rituales?",
  C: "Obstáculos de la semana.",
  recommended: "B",
};

export const PACT_Q2: CopyEntry = {
  A: "¿Cómo lo enfrentás?",
  B: "¿Cuál es el plan?",
  C: "Tu estrategia para esos obstáculos.",
  recommended: "B",
};

export const PACT_Q3: CopyEntry = {
  A: "¿Qué necesitás del otro?",
  B: "¿Cómo se cubren esta semana?",
  C: "¿Cómo se ayudan?",
  recommended: "B",
};

export const PACT_Q4: CopyEntry = {
  A: "¿Suman algo nuevo?",
  B: "¿Quieren agregar algo esta semana?",
  C: "Algo extra.",
  recommended: "B",
};

// --- Signature ---

export const PACT_SIGN_BUTTON: CopyEntry = {
  A: "Firmar",
  B: "Sellar pacto",
  C: "Firmar pacto",
  recommended: "B",
};

export const PACT_SIGNED: CopyEntry = {
  A: "Pacto sellado.",
  B: "Sellado hasta el domingo.",
  C: "Pacto activo.",
  recommended: "B",
};

export const PACT_WAITING: TemplateCopyEntry = {
  A: "Esperando a [nombre].",
  B: "Falta la firma de [nombre].",
  C: "[nombre] todavía no firmó.",
  recommended: "B",
  vars: ["nombre"],
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/sunday.ts
git commit -m "feat(copy): add Sunday ritual and pact copy"
```

---

## Chunk 4: Copy Constants — Navigation, Errors, Empty States

### Task 7: Navigation, Nosotros, arc close, deferred copy

**Files:**
- Create: `lib/copy/navigation.ts`

- [ ] **Step 1: Create navigation copy file**

All strings from spec sections 7, 8, 9, and 10.

```typescript
// lib/copy/navigation.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

// --- Nav tabs ---

export const NAV_HISTORY: CopyEntry = {
  A: "Capítulos",
  B: "Historial",
  C: "Historia",
  recommended: "B",
};

export const NAV_WORLD: CopyEntry = {
  A: "El Mundo",
  B: "Mundo",
  C: "El Mundo",
  recommended: "B",
};

export const NAV_US: CopyEntry = {
  A: "Nosotros",
  B: "Nosotros",
  C: "El equipo",
  recommended: "B",
};

// --- Nosotros screen ---

export const NOSOTROS_TITLE: TemplateCopyEntry = {
  A: "Esta semana en [reino]...",
  B: "[reino]. Semana [n].",
  C: "Semana [n] en [reino].",
  recommended: "B",
  vars: ["reino", "n"],
};

export const NOSOTROS_PACT_LABEL = "Pacto activo";
export const NOSOTROS_BOSS_LABEL = "Boss semanal";
export const NOSOTROS_BOSS_UNLOCKED = "desbloqueado";
export const NOSOTROS_BOSS_LOCKED = "bloqueado";

export const NOSOTROS_ARC: TemplateCopyEntry = {
  A: "Arco: [nombre] — semana [n] de [total]",
  B: "Arco: [nombre] — semana [n] de [total]",
  C: "Arco: [nombre] — semana [n] de [total]",
  recommended: "B",
  vars: ["nombre", "n", "total"],
};

export const NOSOTROS_STREAK: TemplateCopyEntry = {
  A: "[nombre] · [n]d · [stat]%",
  B: "[nombre] · [n]d · [stat]%",
  C: "[nombre] · [n]d · [stat]%",
  recommended: "B",
  vars: ["nombre", "n", "stat"],
};

export const NOSOTROS_PODER: TemplateCopyEntry = {
  A: "Poder: [n]",
  B: "Poder: [n]",
  C: "Poder: [n]",
  recommended: "B",
  vars: ["n"],
};

// --- Arc close ---

export const ARC_CLOSE_QUESTION: CopyEntry = {
  A: "El arco termina. ¿Qué viene después?",
  B: "Un arco se cierra. ¿Qué querés descubrir en el siguiente?",
  C: "Nuevo arco. ¿En qué dirección?",
  recommended: "B",
};

export const ARC_CLOSE_PLACEHOLDER: CopyEntry = {
  A: "Escribí libre.",
  B: "Lo que quieras explorar.",
  C: "La dirección del próximo arco.",
  recommended: "B",
};

// --- Deferred (Phase 6) ---

export const DEFERRED_LOADING_1: CopyEntry = {
  A: "Nombrando el reino...",
  B: "Un reino toma forma...",
  C: "El mundo se despierta...",
  recommended: "B",
};

export const DEFERRED_LOADING_2: CopyEntry = {
  A: "Dando vida a los primeros habitantes...",
  B: "Nacen los primeros habitantes...",
  C: "Alguien más vive ahí ahora...",
  recommended: "B",
};

export const DEFERRED_LOADING_3: CopyEntry = {
  A: "Escribiendo el primer capítulo...",
  B: "La historia empieza a escribirse...",
  C: "El primer capítulo se escribe solo...",
  recommended: "B",
};

export const DEFERRED_TAGLINE: CopyEntry = {
  A: "Ni vos sabés cómo termina.",
  B: "Nadie sabe cómo termina.",
  C: "El final todavía no existe.",
  recommended: "B",
};

export const DEFERRED_START_BUTTON: CopyEntry = {
  A: "Comenzar",
  B: "Entrar al mundo",
  C: "Empezar",
  recommended: "B",
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/navigation.ts
git commit -m "feat(copy): add navigation, Nosotros, arc close, and deferred copy"
```

---

### Task 8: Error messages and empty states

**Files:**
- Create: `lib/copy/errors.ts`
- Create: `lib/copy/empty-states.ts`

- [ ] **Step 1: Create errors copy file**

All strings from spec section 11.

```typescript
// lib/copy/errors.ts
import type { CopyEntry } from "./types";

export const ERROR_CONNECTION: CopyEntry = {
  A: "Sin conexión. Revisá tu señal.",
  B: "El mundo no responde. Revisá tu conexión.",
  C: "Conexión perdida. Sin señal no hay camino.",
  recommended: "B",
};

export const ERROR_SAVE: CopyEntry = {
  A: "No se pudo guardar. Intentá de nuevo.",
  B: "El registro falló. Intentá otra vez.",
  C: "Algo falló. Volvé a intentar.",
  recommended: "B",
};

export const ERROR_AUTH_LINK: CopyEntry = {
  A: "El enlace expiró. Pedí uno nuevo.",
  B: "Enlace inválido o expirado. Pedí otro.",
  C: "Este enlace ya no sirve. Generá uno nuevo.",
  recommended: "B",
};

export const ERROR_AI_GENERATION: CopyEntry = {
  A: "La narrativa no se pudo generar. Intentá en unos minutos.",
  B: "El mundo no pudo responder. Intentá de nuevo.",
  C: "La historia se trabó. Volvé a intentar.",
  recommended: "B",
};

export const ERROR_RETRY_BUTTON = "Reintentar";
export const ERROR_NEW_LINK_BUTTON = "Pedir nuevo enlace";

// --- Validation errors ---

export const VALIDATION_NAME_EMPTY: CopyEntry = {
  A: "Tu personaje necesita un nombre.",
  B: "Falta el nombre.",
  C: "Sin nombre no hay personaje.",
  recommended: "B",
};

export const VALIDATION_IDENTITY_EMPTY: CopyEntry = {
  A: "Escribí quién decidís ser.",
  B: "La identidad no puede estar vacía.",
  C: "Necesitás una identidad para empezar.",
  recommended: "B",
};

export const VALIDATION_RITUAL_NO_TIME: CopyEntry = {
  A: "El ritual necesita una hora.",
  B: "¿A qué hora? Sin hora no hay señal.",
  C: "Falta la hora del ritual.",
  recommended: "B",
};

export const VALIDATION_RITUAL_NO_PLACE: CopyEntry = {
  A: "¿Dónde? El lugar activa la señal.",
  B: "Falta el lugar.",
  C: "El ritual necesita un lugar.",
  recommended: "B",
};

export const VALIDATION_EMAIL: CopyEntry = {
  A: "Revisá el email.",
  B: "Email inválido.",
  C: "Ese email no parece correcto.",
  recommended: "B",
};
```

- [ ] **Step 2: Create empty states copy file**

All strings from spec section 12.

```typescript
// lib/copy/empty-states.ts
import type { CopyEntry, TemplateCopyEntry } from "./types";

export const EMPTY_HISTORY: CopyEntry = {
  A: "Sin escenas todavía. La primera se escribe hoy.",
  B: "Tu historia todavía no empezó. Escribí tu primera decisión.",
  C: "El historial se llena con cada decisión.",
  recommended: "B",
};

export const EMPTY_RITUALS_DONE: CopyEntry = {
  A: "Día completo.",
  B: "Rituales del día, completos.",
  C: "Todo registrado.",
  recommended: "B",
};

export const EMPTY_NO_PACT: CopyEntry = {
  A: "Sin pacto esta semana.",
  B: "Sin pacto activo. El domingo se firma uno nuevo.",
  C: "El pacto se renueva el domingo.",
  recommended: "B",
};

export const EMPTY_BOSS_LOCKED: CopyEntry = {
  A: "El boss sigue ahí. La puerta sigue cerrada.",
  B: "Boss bloqueado. Necesitás más poder.",
  C: "Todavía no. La puerta no se abre.",
  recommended: "B",
};

export const EMPTY_WAITING_PARTNER: CopyEntry = {
  A: "Tu compañero todavía no entró.",
  B: "Esperando. El mundo nace cuando los dos confirmen.",
  C: "Falta la otra persona.",
  recommended: "B",
};

export const EMPTY_NOT_YOUR_TURN: TemplateCopyEntry = {
  A: "Hoy no escribís. Leé lo que pasó.",
  B: "Hoy decide [nombre]. Mañana te toca.",
  C: "Tu turno es mañana.",
  recommended: "B",
  vars: ["nombre"],
};

export const EMPTY_NO_SCENE: CopyEntry = {
  A: "Todavía no hay escena.",
  B: "La primera escena se genera con tu primera decisión.",
  C: "Escribí tu primera decisión para que el mundo arranque.",
  recommended: "B",
};

export const EMPTY_INITIAL_STATS: CopyEntry = {
  A: "Los stats empiezan en 50. Cada ritual los mueve.",
  B: "Punto de partida. Los rituales hacen el resto.",
  C: "Stats iniciales. Todo puede cambiar.",
  recommended: "B",
};
```

- [ ] **Step 3: Commit**

```bash
git add lib/copy/errors.ts lib/copy/empty-states.ts
git commit -m "feat(copy): add error messages and empty states"
```

---

## Chunk 5: Glossary, Index, and Tests

### Task 9: Glossary and stats copy

**Files:**
- Create: `lib/copy/glossary.ts`
- Create: `lib/copy/stats.ts`

- [ ] **Step 1: Create glossary file**

```typescript
// lib/copy/glossary.ts

/** Words that must NEVER appear in UI copy */
export const PROHIBITED_WORDS = [
  "objetivo",
  "meta",
  "progreso",
  "productividad",
  "recordatorio",
  "completar",
  "logro",
  "achievement",
  "check-in",
  "hábito",
] as const;

/** Internal term → UI term mapping */
export const GLOSSARY = {
  conducta: "Ritual",
  objetivo_mensual: "Misión del arco",
  tap_conducta: "Registrar",
  pacto_semanal: "Pacto",
  streak: "Racha",
  weekly_boss: "Boss semanal",
  monthly_arc: "Arco",
  stats_primarios: "VIT / STR / INT / STA",
  stat_derivado: "Poder",
  day_level: null, // invisible to user
} as const;
```

- [ ] **Step 2: Create stats file**

```typescript
// lib/copy/stats.ts

export const STAT_NAMES = {
  vit: { short: "VIT", long: "Vitalidad" },
  str: { short: "STR", long: "Fuerza" },
  int: { short: "INT", long: "Inteligencia" },
  sta: { short: "STA", long: "Stamina" },
  poder: { short: "Poder", long: "Poder" },
} as const;

export type StatKey = keyof typeof STAT_NAMES;

/** Display format templates for stats in UI */
export const STAT_FORMATS = {
  /** Stat bar display: "VIT 85" */
  bar: (stat: string, value: number) => `${stat} ${value}`,
  /** Post-ritual change: "VIT +3" */
  change: (stat: string, delta: number) => `${stat} +${delta}`,
  /** Poder display: "Poder 72" */
  poder: (value: number) => `Poder ${value}`,
  /** Racha display: "Racha 5d" */
  racha: (days: number) => `Racha ${days}d`,
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add lib/copy/glossary.ts lib/copy/stats.ts
git commit -m "feat(copy): add glossary, prohibited words, and stat names"
```

---

### Task 10: Index file — re-exports

**Files:**
- Create: `lib/copy/index.ts`

- [ ] **Step 1: Create index file**

```typescript
// lib/copy/index.ts
export { getCopy, getVariant, fillTemplate } from "./types";
export type { CopyEntry, TemplateCopyEntry, CopyVariant } from "./types";

export * as onboarding from "./onboarding";
export * as rituals from "./rituals";
export * as writing from "./writing";
export * as sunday from "./sunday";
export * as navigation from "./navigation";
export * as errors from "./errors";
export * as emptyStates from "./empty-states";
export * as glossary from "./glossary";
export * as stats from "./stats";
```

- [ ] **Step 2: Commit**

```bash
git add lib/copy/index.ts
git commit -m "feat(copy): add index with re-exports"
```

---

### Task 11: Full copy rules test suite

**Files:**
- Modify: `__tests__/lib/copy/copy-rules.test.ts`

- [ ] **Step 1: Add comprehensive voice guide tests**

Append to the existing test file:

```typescript
import * as onboarding from "@/lib/copy/onboarding";
import * as rituals from "@/lib/copy/rituals";
import * as writing from "@/lib/copy/writing";
import * as sunday from "@/lib/copy/sunday";
import * as navigation from "@/lib/copy/navigation";
import * as errors from "@/lib/copy/errors";
import * as emptyStates from "@/lib/copy/empty-states";

function getAllCopyEntries(): Array<{ name: string; entry: CopyEntry }> {
  const modules = {
    onboarding,
    rituals,
    writing,
    sunday,
    navigation,
    errors,
    emptyStates,
  };
  const entries: Array<{ name: string; entry: CopyEntry }> = [];
  for (const [mod, exports] of Object.entries(modules)) {
    for (const [key, value] of Object.entries(exports)) {
      if (
        value &&
        typeof value === "object" &&
        "A" in value &&
        "B" in value &&
        "C" in value
      ) {
        entries.push({ name: `${mod}.${key}`, entry: value as CopyEntry });
      }
    }
  }
  return entries;
}

describe("voice guide rules", () => {
  const entries = getAllCopyEntries();

  it("all CopyEntry objects have valid structure", () => {
    for (const { name, entry } of entries) {
      expect(isValidCopyEntry(entry), `${name} has invalid structure`).toBe(
        true
      );
    }
  });

  it("no copy string exceeds 12 words", () => {
    for (const { name, entry } of entries) {
      for (const variant of ["A", "B", "C"] as const) {
        const text = entry[variant];
        const count = wordCount(text);
        expect(
          count,
          `${name}.${variant} has ${count} words: "${text}"`
        ).toBeLessThanOrEqual(12);
      }
    }
  });

  it("no copy string contains prohibited words", () => {
    for (const { name, entry } of entries) {
      for (const variant of ["A", "B", "C"] as const) {
        const text = entry[variant];
        const found = containsProhibitedWord(text);
        expect(
          found,
          `${name}.${variant} contains prohibited word "${found}": "${text}"`
        ).toBeNull();
      }
    }
  });

  it("recommended variant is one of A, B, C", () => {
    for (const { name, entry } of entries) {
      expect(
        ["A", "B", "C"].includes(entry.recommended),
        `${name} has invalid recommended: ${entry.recommended}`
      ).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run __tests__/lib/copy/`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add __tests__/lib/copy/copy-rules.test.ts
git commit -m "test(copy): add voice guide enforcement across all copy modules"
```

---

## Chunk 6: Integration

### Task 12: Replace hardcoded strings in existing pages

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/login/actions.ts`
- Modify: `app/(auth)/verify/page.tsx`

- [ ] **Step 1: Read current files**

Read `app/(auth)/login/page.tsx`, `app/(auth)/login/actions.ts`, and `app/(auth)/verify/page.tsx` to identify all hardcoded strings.

- [ ] **Step 2: Replace hardcoded strings with copy imports**

Import from `@/lib/copy` and replace hardcoded text. The exact edits depend on current file contents found in Step 1. Key replacements:
- Page titles → use copy constants
- Error messages → use `errors.ERROR_AUTH_LINK` etc.
- Button labels → use copy constants
- Helper text → use copy constants

Note: Auth pages are pre-onboarding so not all copy from the spec applies. Use the error messages and any applicable labels.

- [ ] **Step 3: Verify the app still works**

Run: `npx next build` (or `npx vitest run` for tests)
Expected: Build succeeds, no type errors.

- [ ] **Step 4: Commit**

```bash
git add app/(auth)/
git commit -m "refactor(copy): replace hardcoded auth strings with copy system"
```

---

## Summary

| Task | What | Files |
|---|---|---|
| 1 | Types + helpers | `lib/copy/types.ts` |
| 2 | Test helpers | `__tests__/lib/copy/copy-rules.test.ts` |
| 3 | Onboarding copy | `lib/copy/onboarding.ts` |
| 4 | Rituals copy | `lib/copy/rituals.ts` |
| 5 | Writing + turns copy | `lib/copy/writing.ts` |
| 6 | Sunday ritual copy | `lib/copy/sunday.ts` |
| 7 | Navigation + deferred | `lib/copy/navigation.ts` |
| 8 | Errors + empty states | `lib/copy/errors.ts`, `lib/copy/empty-states.ts` |
| 9 | Glossary + stats | `lib/copy/glossary.ts`, `lib/copy/stats.ts` |
| 10 | Index re-exports | `lib/copy/index.ts` |
| 11 | Voice guide tests | `__tests__/lib/copy/copy-rules.test.ts` |
| 12 | Replace hardcoded strings | `app/(auth)/**` |
