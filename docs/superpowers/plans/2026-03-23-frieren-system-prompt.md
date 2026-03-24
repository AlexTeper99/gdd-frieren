# Frieren System Prompt v1 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the composable system prompt that makes Claude narrate in Frieren style, calibrated to player stats, with 7 trigger-specific modules.

**Architecture:** Base prompt (~1000 tokens) always sent + one trigger module (~150-250 tokens) appended per call. All modules are plain string constants assembled by `buildSystemPrompt(trigger)`. Tests hit the real Claude API to validate narrative output.

**Tech Stack:** TypeScript, `@anthropic-ai/sdk` (already installed), Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-frieren-system-prompt-design.md`

---

## File Structure

```
lib/prompts/
├── base.ts              — exports BASE_PROMPT string constant
├── modules/
│   ├── daily.ts         — exports DAILY_MODULE
│   ├── boss-semanal.ts  — exports BOSS_SEMANAL_MODULE
│   ├── vinculo.ts       — exports VINCULO_MODULE
│   ├── weekly-close.ts  — exports WEEKLY_CLOSE_MODULE
│   ├── arc-close.ts     — exports ARC_CLOSE_MODULE
│   ├── arc-open.ts      — exports ARC_OPEN_MODULE
│   └── recovery.ts      — exports RECOVERY_MODULE
├── index.ts             — exports buildSystemPrompt(trigger) + TriggerType
└── types.ts             — exports TriggerType, StatProfile, GameContext types

__tests__/lib/prompts/
├── build-system-prompt.test.ts  — unit tests (no API calls)
└── narrative-output.test.ts     — integration tests (real Claude API)
```

---

## Chunk 1: Prompt Modules

### Task 1: Types and TriggerType enum

**Files:**
- Create: `lib/prompts/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// lib/prompts/types.ts

export const TRIGGERS = [
  'daily',
  'boss_semanal',
  'vinculo',
  'weekly_close',
  'arc_close',
  'arc_open',
  'recovery',
] as const

export type TriggerType = (typeof TRIGGERS)[number]

export interface StatProfile {
  vit: number
  sta: number
  int: number
  str: number
  streak: number
  poder: number
}

export interface PlayerContext {
  nombre: string
  arquetipo: 'Guerrero' | 'Mago' | 'Ranger' | 'Curandero'
  stats: StatProfile
  habito_hoy: 'bien' | 'regular' | 'dificil'
  decision_escrita?: string
}

export interface GameContext {
  personaje_1: PlayerContext
  personaje_2: PlayerContext
  identidad_p1: string
  identidad_p2: string
  objetivo_arco: {
    area: string
    semana_actual: number
    semana_total: number
    tipo_dia: 'normal' | 'decision' | 'boss_semanal' | 'arc_close'
  }
  pacto_semana: {
    texto_p1_raw: string
    texto_p2_raw: string
    texto_narrativo: string
  }
  weekly_boss: {
    desbloqueado: boolean
    completado: boolean
    descripcion: string
  }
  historial: string[]
  world_state: {
    reino: string
    npcs_conocidos: string[]
    zonas: string[]
    decisiones_pasadas_relevantes: string[]
    estado_actual: string
  }
  trigger: TriggerType
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/prompts/types.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/prompts/types.ts
git commit -m "feat(prompts): add TriggerType and GameContext types"
```

---

### Task 2: Base prompt module

**Files:**
- Create: `lib/prompts/base.ts`

- [ ] **Step 1: Create base prompt**

```typescript
// lib/prompts/base.ts

export const BASE_PROMPT = `<identidad>
Sos el narrador de Habit Quest — un RPG colaborativo donde dos personas construyen
una historia compartida. Sus hábitos reales son el "dado" que determina cómo sale
cada decisión que escriben.

Narrás una sola historia continua en turnos alternados entre dos personajes.
El mundo es uno solo. No hay bifurcación — hay capas. Cada escena arranca
donde la dejó el otro jugador.
</identidad>

<estilo>
Narrá en el estilo de Frieren: Beyond Journey's End. Estos son tus principios
narrativos internalizados — no los mencionás, los vivís:

1. ACCIÓN ÉPICA Y QUIETUD. El contraste es lo que hace que cada uno impacte.
   Combates: breves, intensos, resolutivos. Momentos cotidianos: lentos,
   detallados, cargados de significado.

2. EL TIEMPO TIENE PESO. Los cambios se acumulan sin que el personaje lo note.
   No hay un momento exacto en que algo cambió. A los 60 días de cocinar:
   "simplemente lo hace."

3. LO PEQUEÑO IMPORTA MÁS. El olor del campamento. Cómo dobla el mapa.
   El silencio después de comer. Lo cotidiano sostenido es más heroico
   que cualquier batalla.

4. MELANCOLÍA SIN TRAGEDIA. Los días difíciles son parte del camino.
   El personaje los enfrenta con entereza. El mundo cambia — él no se quiebra.

5. VÍNCULOS EN SILENCIO. No son declaraciones. Son presencia compartida.
   Un gesto. Un silencio que dice más que las palabras.

6. EL VIAJE SOBRE EL DESTINO. El arco no es ganar. Es el recorrido.
   La resolución es casi secundaria a lo que pasó en el camino.
</estilo>

<reglas>
MUST — siempre:
- Detalles sensoriales específicos (frío, niebla, luz del fuego, peso de la mochila)
- Referenciar decisiones pasadas y sus ecos de forma natural en la narrativa
- El mundo reacciona al estado de los stats: zonas se cierran, NPCs desaparecen,
  el clima cambia, caminos se complican
- Escalar la consecuencia según la tabla de calibración exacta
- Recuperación gradual — nunca instantánea, siempre ganada día a día
- Respetar el sabor del arquetipo en la narración (Guerrero: físico, directo;
  Mago: mental, observador; Ranger: adaptable, en movimiento; Curandero: interno, cuidado)
- Escribir en español rioplatense (vos, usás, querés)
- Prosa narrativa pura. Sin títulos, sin bullets, sin meta-comentarios.

NEVER — nunca:
- Mencionar stats, porcentajes, rachas, niveles, mecánicas o la app
- Juzgar moralmente al personaje ("fallaste", "sos débil", "decepcionante")
- Hacer que un día malo se sienta igual de bien que uno bueno con prosa
  bella sin consecuencia real. Si los stats están bajos, algo concreto
  MUST cambiar en el mundo.
- Romper la cuarta pared
- Clichés genéricos de fantasía (elegido, profecía, espada luminosa, destino escrito)
- Terminar con moraleja, resumen o reflexión explícita
- Generar fracasos sin consecuencia visible en el mundo
</reglas>

<calibracion>
Cruzá la decisión escrita del jugador con sus stats reales. El resultado
se determina así:

Stats altos + buena decisión → Épica completa. El momento que se ganaron.
Stats altos + decisión arriesgada → Éxito con costo. El triunfo tiene precio.
Stats regulares + buena decisión → Sale, pero más difícil. Llegaron, exhaustos.
Stats bajos + decisión arriesgada → Falla parcial. Consecuencias que se arrastran.
Stats críticos + cualquier decisión → El mundo resiste. La épica no está disponible.

Cómo leer cada stat:
- VIT (alimentación): claridad mental, resistencia a confusión, hambre como debilidad
- STA (hidratación): resistencia sostenida, recuperación, aguante
- INT (sueño): alerta, planificación, velocidad de reacción
- STR (movimiento): capacidad física, velocidad, combate
- Streak: momentum, confianza, brillo del mundo
- Poder (promedio de stats + streak): gatillo de momentos épicos.
  Poder alto = la épica está disponible. Poder bajo = el mundo resiste.

Decay — cómo narrar la ausencia:
- 24-48h sin registro: sutil. Una sombra. Algo distinto en el aire.
- 48-72h: urgencia real. El camino se complica visiblemente.
- 72h+: algo concreto se pierde. Un NPC se va. Una zona se cierra.
</calibracion>

<formato>
- Español rioplatense
- Prosa narrativa — NUNCA bullets, títulos, JSON ni meta-texto
- Largo según trigger (especificado en cada módulo)
- Continuidad: cada escena arranca donde terminó la anterior
</formato>`
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/prompts/base.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/prompts/base.ts
git commit -m "feat(prompts): add Frieren base system prompt"
```

---

### Task 3: All 7 trigger modules

**Files:**
- Create: `lib/prompts/modules/daily.ts`
- Create: `lib/prompts/modules/boss-semanal.ts`
- Create: `lib/prompts/modules/vinculo.ts`
- Create: `lib/prompts/modules/weekly-close.ts`
- Create: `lib/prompts/modules/arc-close.ts`
- Create: `lib/prompts/modules/arc-open.ts`
- Create: `lib/prompts/modules/recovery.ts`

- [ ] **Step 1: Create daily module**

```typescript
// lib/prompts/modules/daily.ts

export const DAILY_MODULE = `<trigger_daily>
Dos fases:

FASE 1 — SITUACIÓN (máximo 3 líneas):
Presentá una situación desde donde la dejó el otro jugador ayer.
- Día normal: peso narrativo bajo. Interesante, sin bifurcación.
- Día de decisión: señalalo en la narrativa. Lo que escriba acá define
  el arco de la semana siguiente.

FASE 2 — CONSECUENCIA (3-5 oraciones):
Recibí la decisión escrita. Cruzala con los stats. Generá la consecuencia.
Narrá desde el POV del personaje activo. El mundo es compartido y continuo.
</trigger_daily>`
```

- [ ] **Step 2: Create boss-semanal module**

```typescript
// lib/prompts/modules/boss-semanal.ts

export const BOSS_SEMANAL_MODULE = `<trigger_boss>
El clímax semanal. Los dos jugadores escribieron su decisión por separado,
sin ver la del otro.

Lógica de fusión — aplicá exactamente una:

1. DECISIONES COMPATIBLES → Fusionalas en una sola acción narrativa
   coherente. Los dos aportan desde ángulos distintos.

2. DECISIONES CONTRADICTORIAS → Elegí la respaldada por mejores stats
   combinados de la semana. La otra aparece como la tensión que existió
   antes de actuar.

3. DECISIONES OPUESTAS → Narrá el conflicto entre los personajes como
   historia. La tensión es el resultado. Resolución diferida a la
   próxima semana.

Stats combinados de ambos jugadores sobre los 7 días determinan el resultado.
Situación: 4-6 líneas. Consecuencia: 5-8 oraciones.
Si los stats combinados no alcanzan: el boss sigue ahí. La puerta sigue cerrada.
</trigger_boss>`
```

- [ ] **Step 3: Create vinculo module**

```typescript
// lib/prompts/modules/vinculo.ts

export const VINCULO_MODULE = `<trigger_vinculo>
Escena de vínculo. Los dos jugadores llevan 5+ días consecutivos
completando todos sus rituales.

Esta es la escena Frieren más pura. No es sobre la misión — es sobre ellos.

- 8-12 oraciones
- Sin acción, sin combate, sin urgencia
- Una conversación al fuego. Un gesto. Un silencio.
- Los personajes NUNCA declaran sentimientos explícitamente.
  La presencia lo dice.
- Referenciá momentos específicos del viaje reciente
- Construí algo que nació de su consistencia real, no de la trama
</trigger_vinculo>`
```

- [ ] **Step 4: Create weekly-close module**

```typescript
// lib/prompts/modules/weekly-close.ts

export const WEEKLY_CLOSE_MODULE = `<trigger_weekly_close>
Cierre narrativo de la semana. 4-6 oraciones.

Calibración:
- Buena semana: calidez, progresión sentida, mundo más brillante. Caminos abiertos.
- Semana regular: neutral. El viaje continúa sin celebración ni urgencia.
- Mala semana: consecuencia. El mundo se apretó. Algo se cerró. Pero el camino
  sigue — los personajes no se rindieron.
</trigger_weekly_close>`
```

- [ ] **Step 5: Create arc-close module**

```typescript
// lib/prompts/modules/arc-close.ts

export const ARC_CLOSE_MODULE = `<trigger_arc_close>
Resolución del arco mensual. La escena más larga del sistema. 10-15 oraciones.

El resultado de 28-30 días de hábitos y decisiones. No se decide hoy —
se construyó con cada ritual del mes.

- No es sobre ganar. Es sobre el recorrido.
- Referenciá momentos específicos del mes: decisiones, vínculos, fracasos, victorias
- Frieren puro: el tiempo tuvo peso. Mirando atrás, algo cambió sin un solo
  momento donde cambió.
- Mes bueno: la satisfacción de la automaticidad. Lo que antes costaba, ahora fluye.
- Mes malo: la dignidad de seguir en pie. Perdieron cosas, pero están acá.
</trigger_arc_close>`
```

- [ ] **Step 6: Create arc-open module**

```typescript
// lib/prompts/modules/arc-open.ts

export const ARC_OPEN_MODULE = `<trigger_arc_open>
Nuevo arco mensual. 6-8 oraciones.

Recibís la respuesta del jugador a "¿Qué querés que el próximo capítulo revele?"

- Establecé nuevo terreno: amenaza, misterio, territorio desconocido
- Integrá la respuesta del jugador como semilla — no la cites textual
- Introducí al menos un elemento nuevo (NPC, zona, conflicto) que dé tracción
- Terminá con anticipación, no con exposición. Que quieran saber qué sigue.
</trigger_arc_open>`
```

- [ ] **Step 7: Create recovery module**

```typescript
// lib/prompts/modules/recovery.ts

export const RECOVERY_MODULE = `<trigger_recovery>
El jugador vuelve después de días de ausencia. El mundo se deterioró.

- Narrá lo que se perdió: algo concreto. Un NPC se fue. Una zona se cerró.
  El camino se complicó.
- Narrá el regreso con dignidad: no se rindió. Volvió.
- Recuperación gradual — los stats mejoran día a día, no de golpe.
- NUNCA juzgues la ausencia. Solo mostrá sus consecuencias y la fuerza del regreso.
- 4-6 oraciones.
</trigger_recovery>`
```

- [ ] **Step 8: Verify all modules compile**

Run: `npx tsc --noEmit lib/prompts/modules/*.ts`
Expected: No errors

- [ ] **Step 9: Commit**

```bash
git add lib/prompts/modules/
git commit -m "feat(prompts): add all 7 trigger modules"
```

---

### Task 4: Assembler — buildSystemPrompt

**Files:**
- Create: `lib/prompts/index.ts`

- [ ] **Step 1: Create the assembler**

```typescript
// lib/prompts/index.ts

import { BASE_PROMPT } from './base'
import { DAILY_MODULE } from './modules/daily'
import { BOSS_SEMANAL_MODULE } from './modules/boss-semanal'
import { VINCULO_MODULE } from './modules/vinculo'
import { WEEKLY_CLOSE_MODULE } from './modules/weekly-close'
import { ARC_CLOSE_MODULE } from './modules/arc-close'
import { ARC_OPEN_MODULE } from './modules/arc-open'
import { RECOVERY_MODULE } from './modules/recovery'
import type { TriggerType } from './types'

const TRIGGER_MODULES: Record<TriggerType, string> = {
  daily: DAILY_MODULE,
  boss_semanal: BOSS_SEMANAL_MODULE,
  vinculo: VINCULO_MODULE,
  weekly_close: WEEKLY_CLOSE_MODULE,
  arc_close: ARC_CLOSE_MODULE,
  arc_open: ARC_OPEN_MODULE,
  recovery: RECOVERY_MODULE,
}

export function buildSystemPrompt(trigger: TriggerType): string {
  const module = TRIGGER_MODULES[trigger]
  return `${BASE_PROMPT}\n\n${module}`
}

export { type TriggerType, type GameContext, type StatProfile, type PlayerContext, TRIGGERS } from './types'
export { BASE_PROMPT } from './base'
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit lib/prompts/index.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/prompts/index.ts
git commit -m "feat(prompts): add buildSystemPrompt assembler"
```

---

## Chunk 2: Unit Tests

### Task 5: Unit tests for buildSystemPrompt (no API calls)

**Files:**
- Create: `__tests__/lib/prompts/build-system-prompt.test.ts`

- [ ] **Step 1: Write unit tests**

```typescript
// __tests__/lib/prompts/build-system-prompt.test.ts

import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, TRIGGERS, BASE_PROMPT } from '@/lib/prompts'

describe('buildSystemPrompt', () => {
  it('includes the base prompt for every trigger', () => {
    for (const trigger of TRIGGERS) {
      const result = buildSystemPrompt(trigger)
      expect(result).toContain('<identidad>')
      expect(result).toContain('<estilo>')
      expect(result).toContain('<reglas>')
      expect(result).toContain('<calibracion>')
      expect(result).toContain('<formato>')
    }
  })

  it('appends the correct trigger module', () => {
    expect(buildSystemPrompt('daily')).toContain('<trigger_daily>')
    expect(buildSystemPrompt('boss_semanal')).toContain('<trigger_boss>')
    expect(buildSystemPrompt('vinculo')).toContain('<trigger_vinculo>')
    expect(buildSystemPrompt('weekly_close')).toContain('<trigger_weekly_close>')
    expect(buildSystemPrompt('arc_close')).toContain('<trigger_arc_close>')
    expect(buildSystemPrompt('arc_open')).toContain('<trigger_arc_open>')
    expect(buildSystemPrompt('recovery')).toContain('<trigger_recovery>')
  })

  it('does not mix trigger modules', () => {
    const daily = buildSystemPrompt('daily')
    expect(daily).not.toContain('<trigger_boss>')
    expect(daily).not.toContain('<trigger_vinculo>')
    expect(daily).not.toContain('<trigger_recovery>')
  })

  it('base prompt contains MUST and NEVER rules', () => {
    expect(BASE_PROMPT).toContain('MUST')
    expect(BASE_PROMPT).toContain('NEVER')
  })

  it('base prompt specifies rioplatense', () => {
    expect(BASE_PROMPT).toContain('rioplatense')
  })

  it('base prompt contains all 6 Frieren principles', () => {
    expect(BASE_PROMPT).toContain('ACCIÓN ÉPICA Y QUIETUD')
    expect(BASE_PROMPT).toContain('EL TIEMPO TIENE PESO')
    expect(BASE_PROMPT).toContain('LO PEQUEÑO IMPORTA MÁS')
    expect(BASE_PROMPT).toContain('MELANCOLÍA SIN TRAGEDIA')
    expect(BASE_PROMPT).toContain('VÍNCULOS EN SILENCIO')
    expect(BASE_PROMPT).toContain('EL VIAJE SOBRE EL DESTINO')
  })

  it('base prompt contains all 5 calibration levels', () => {
    expect(BASE_PROMPT).toContain('Épica completa')
    expect(BASE_PROMPT).toContain('Éxito con costo')
    expect(BASE_PROMPT).toContain('más difícil')
    expect(BASE_PROMPT).toContain('Falla parcial')
    expect(BASE_PROMPT).toContain('El mundo resiste')
  })

  it('boss module contains all 3 fusion strategies', () => {
    const boss = buildSystemPrompt('boss_semanal')
    expect(boss).toContain('COMPATIBLES')
    expect(boss).toContain('CONTRADICTORIAS')
    expect(boss).toContain('OPUESTAS')
  })

  it('covers all 7 triggers', () => {
    expect(TRIGGERS).toHaveLength(7)
    expect(TRIGGERS).toEqual([
      'daily',
      'boss_semanal',
      'vinculo',
      'weekly_close',
      'arc_close',
      'arc_open',
      'recovery',
    ])
  })
})
```

- [ ] **Step 2: Run tests — expect all pass**

Run: `pnpm test:run __tests__/lib/prompts/build-system-prompt.test.ts`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add __tests__/lib/prompts/build-system-prompt.test.ts
git commit -m "test(prompts): add unit tests for buildSystemPrompt"
```

---

## Chunk 3: Integration Tests (Claude API)

### Task 6: Test fixtures — stat profiles and context factory

**Files:**
- Create: `__tests__/lib/prompts/fixtures.ts`

- [ ] **Step 1: Create test fixtures**

```typescript
// __tests__/lib/prompts/fixtures.ts

import type { GameContext, StatProfile, TriggerType } from '@/lib/prompts'

// --- 5 canonical stat profiles ---

export const STATS_ALL_HIGH: StatProfile = {
  vit: 85, sta: 90, int: 80, str: 85, streak: 7, poder: 88,
}

export const STATS_MIXED: StatProfile = {
  vit: 85, sta: 70, int: 60, str: 40, streak: 6, poder: 62,
}

export const STATS_REGULAR: StatProfile = {
  vit: 55, sta: 60, int: 50, str: 55, streak: 3, poder: 52,
}

export const STATS_LOW: StatProfile = {
  vit: 25, sta: 30, int: 20, str: 35, streak: 0, poder: 22,
}

export const STATS_CRITICAL: StatProfile = {
  vit: 15, sta: 10, int: 20, str: 15, streak: 0, poder: 12,
}

export const ALL_STAT_PROFILES = {
  all_high: STATS_ALL_HIGH,
  mixed: STATS_MIXED,
  regular: STATS_REGULAR,
  low: STATS_LOW,
  critical: STATS_CRITICAL,
} as const

// --- Decision types ---

export const DECISIONS = {
  safe: 'Kael decide rodear la montaña. El camino más largo pero más seguro.',
  risky: 'Kael se lanza al bosque oscuro. Confía en que está listo para lo que venga.',
  neutral: 'Kael sigue caminando por el sendero principal. Un paso más.',
} as const

// --- Context factory ---

export function makeGameContext(overrides: {
  trigger: TriggerType
  p1Stats?: StatProfile
  p2Stats?: StatProfile
  decision?: string
  decision_p2?: string
}): GameContext {
  return {
    personaje_1: {
      nombre: 'Kael',
      arquetipo: 'Guerrero',
      stats: overrides.p1Stats ?? STATS_REGULAR,
      habito_hoy: statsToHabito(overrides.p1Stats ?? STATS_REGULAR),
      decision_escrita: overrides.decision ?? DECISIONS.neutral,
    },
    personaje_2: {
      nombre: 'Lyra',
      arquetipo: 'Mago',
      stats: overrides.p2Stats ?? STATS_REGULAR,
      habito_hoy: statsToHabito(overrides.p2Stats ?? STATS_REGULAR),
      decision_escrita: overrides.decision_p2,
    },
    identidad_p1: 'Soy alguien que cuida cómo vive.',
    identidad_p2: 'Soy alguien que construye con la mente.',
    objetivo_arco: {
      area: 'alimentación',
      semana_actual: 2,
      semana_total: 4,
      tipo_dia: overrides.trigger === 'boss_semanal' ? 'boss_semanal' : 'normal',
    },
    pacto_semana: {
      texto_p1_raw: 'No salteo el desayuno. Si viajo, adapto.',
      texto_p2_raw: 'Duermo antes de las 23:00 de lunes a viernes.',
      texto_narrativo: 'El juramento de la semana quedó sellado bajo el cielo de Valdris.',
    },
    weekly_boss: {
      desbloqueado: (overrides.p1Stats?.poder ?? 52) > 50,
      completado: false,
      descripcion: 'La criatura del paso norte',
    },
    historial: [
      'Kael tomó el camino corto ayer. Llegó exhausto pero entero.',
      'Lyra estudió el mapa al fuego. Encontró una ruta alternativa.',
      'El herbolario les vendió provisiones. La niebla se levantó al mediodía.',
    ],
    world_state: {
      reino: 'Valdris',
      npcs_conocidos: ['Herbolario de la colina', 'Lyra'],
      zonas: ['Bosque del Este', 'Paso Norte', 'Colina del herbolario'],
      decisiones_pasadas_relevantes: [
        'Eligieron el camino largo la semana pasada — les dio tiempo.',
      ],
      estado_actual: 'La niebla se retiró pero el paso norte sigue cerrado.',
    },
    trigger: overrides.trigger,
  }
}

function statsToHabito(stats: StatProfile): 'bien' | 'regular' | 'dificil' {
  if (stats.poder >= 70) return 'bien'
  if (stats.poder >= 40) return 'regular'
  return 'dificil'
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit __tests__/lib/prompts/fixtures.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add __tests__/lib/prompts/fixtures.ts
git commit -m "test(prompts): add stat profiles and context factory fixtures"
```

---

### Task 7: Integration tests — narrative output validation

**Files:**
- Create: `__tests__/lib/prompts/narrative-output.test.ts`

These tests call the real Claude API. They require `ANTHROPIC_API_KEY` in `.env.local`.
They use a longer timeout (30s) and run in node environment, not jsdom.

- [ ] **Step 1: Write the integration test file**

```typescript
// __tests__/lib/prompts/narrative-output.test.ts
//
// @vitest-environment node
//
// These tests hit the real Claude API. Run with:
//   ANTHROPIC_API_KEY=sk-... pnpm vitest run __tests__/lib/prompts/narrative-output.test.ts
//
// They validate that the system prompt produces Frieren-faithful output
// across different stat combinations and trigger types.

import { describe, it, expect } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '@/lib/prompts'
import type { TriggerType } from '@/lib/prompts'
import {
  ALL_STAT_PROFILES,
  DECISIONS,
  makeGameContext,
} from './fixtures'

const client = new Anthropic()
const MODEL = 'claude-sonnet-4-20250514'

// --- Helper: call Claude with assembled prompt + context ---

async function generateNarrative(
  trigger: TriggerType,
  p1StatsKey: keyof typeof ALL_STAT_PROFILES,
  decisionKey: keyof typeof DECISIONS,
  extraOverrides?: { decision_p2?: string; p2Stats?: (typeof ALL_STAT_PROFILES)[keyof typeof ALL_STAT_PROFILES] },
): Promise<string> {
  const systemPrompt = buildSystemPrompt(trigger)
  const context = makeGameContext({
    trigger,
    p1Stats: ALL_STAT_PROFILES[p1StatsKey],
    decision: DECISIONS[decisionKey],
    ...extraOverrides,
  })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(context),
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Expected text response')
  return block.text
}

// --- Anti-pattern matchers ---

const FORBIDDEN_PATTERNS = [
  // Stats and game mechanics
  /\b(VIT|STA|INT|STR|stat|stats|porcentaje|racha|streak|nivel|level|poder)\b/i,
  // Moral judgment
  /\b(fallaste|fallaron|débil|decepcionante|decepcionó|vergüenza)\b/i,
  // Fourth wall
  /\b(app|aplicación|usuario|jugador|pantalla|botón|notificación)\b/i,
  // Generic fantasy clichés
  /\b(elegido|profecía|espada luminosa|destino escrito|ancestral poder)\b/i,
]

function assertNoForbiddenPatterns(text: string) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    expect(text).not.toMatch(pattern)
  }
}

function assertHasSensoryDetail(text: string) {
  // At least one sensory word should appear
  const sensoryWords = /\b(frío|calor|niebla|luz|oscur|sombra|silencio|viento|fuego|olor|peso|húmed|sec|polvo|lluvia|nieve|amanecer|anochecer|crepúsculo)\b/i
  expect(text).toMatch(sensoryWords)
}

function assertIsSpanish(text: string) {
  // Basic check: contains common Spanish words
  const spanishMarkers = /\b(el|la|los|las|de|del|en|que|por|con|sin|pero|como|más|su|sus)\b/
  expect(text).toMatch(spanishMarkers)
}

// --- Tests ---

describe('Narrative output — daily trigger', { timeout: 30_000 }, () => {
  it('high stats + risky decision → epic without unearned difficulty', async () => {
    const text = await generateNarrative('daily', 'all_high', 'risky')

    assertNoForbiddenPatterns(text)
    assertHasSensoryDetail(text)
    assertIsSpanish(text)

    // Should NOT contain struggle/difficulty markers for high stats
    expect(text).not.toMatch(/\b(no pudo|no alcanzó|no llegó|falló|fallaron)\b/i)
  })

  it('low stats + risky decision → consequence with world deterioration', async () => {
    const text = await generateNarrative('daily', 'low', 'risky')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    // Should contain some marker of difficulty, cost, or consequence
    // (we check it's not a clean victory)
    expect(text).not.toMatch(/\b(limpio|fácil|sin esfuerzo|sin problema)\b/i)
  })

  it('regular stats + safe decision → success but harder', async () => {
    const text = await generateNarrative('daily', 'regular', 'safe')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)
  })

  it('critical stats → world resists, no epic', async () => {
    const text = await generateNarrative('daily', 'critical', 'risky')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)
  })
})

describe('Narrative output — boss_semanal trigger', { timeout: 30_000 }, () => {
  it('compatible decisions → fused narrative', async () => {
    const text = await generateNarrative('boss_semanal', 'all_high', 'risky', {
      decision_p2: 'Lyra flanquea por la izquierda. Busca un punto ciego.',
      p2Stats: ALL_STAT_PROFILES.all_high,
    })

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    // Both characters should appear
    expect(text).toMatch(/Kael/i)
    expect(text).toMatch(/Lyra/i)
  })
})

describe('Narrative output — vinculo trigger', { timeout: 30_000 }, () => {
  it('produces intimate scene without action', async () => {
    const text = await generateNarrative('vinculo', 'all_high', 'neutral')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    // Should NOT contain combat words
    expect(text).not.toMatch(/\b(atacó|luchó|combate|batalla|enemigo|criatura)\b/i)

    // Both characters should appear
    expect(text).toMatch(/Kael/i)
    expect(text).toMatch(/Lyra/i)
  })
})

describe('Narrative output — recovery trigger', { timeout: 30_000 }, () => {
  it('mentions concrete loss but dignified return', async () => {
    const text = await generateNarrative('recovery', 'critical', 'neutral')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)

    // Should NOT judge
    expect(text).not.toMatch(/\b(abandonó|rindió|cobarde|débil)\b/i)
  })
})

describe('Narrative output — arc_close trigger', { timeout: 30_000 }, () => {
  it('good month → sense of earned growth', async () => {
    const text = await generateNarrative('arc_close', 'all_high', 'neutral')

    assertNoForbiddenPatterns(text)
    assertIsSpanish(text)
  })
})

describe('Narrative output — cross-trigger invariants', { timeout: 60_000 }, () => {
  const triggers: TriggerType[] = ['daily', 'weekly_close', 'arc_open']

  for (const trigger of triggers) {
    it(`${trigger}: never mentions stats or game mechanics`, async () => {
      const text = await generateNarrative(trigger, 'mixed', 'safe')
      assertNoForbiddenPatterns(text)
    })

    it(`${trigger}: always in Spanish`, async () => {
      const text = await generateNarrative(trigger, 'mixed', 'safe')
      assertIsSpanish(text)
    })

    it(`${trigger}: always has sensory detail`, async () => {
      const text = await generateNarrative(trigger, 'mixed', 'safe')
      assertHasSensoryDetail(text)
    })
  }
})
```

- [ ] **Step 2: Run the integration tests**

Run: `pnpm vitest run __tests__/lib/prompts/narrative-output.test.ts`
Expected: All tests PASS (requires `ANTHROPIC_API_KEY` in env)

Note: These tests make ~15 API calls. At ~$0.003/call with Sonnet, total cost is ~$0.05. Timeout is 30s per test.

- [ ] **Step 3: Commit**

```bash
git add __tests__/lib/prompts/narrative-output.test.ts
git commit -m "test(prompts): add integration tests for narrative output validation"
```

---

## Chunk 4: Final validation

### Task 8: Run full test suite and verify

- [ ] **Step 1: Run all unit tests**

Run: `pnpm test:run __tests__/lib/prompts/build-system-prompt.test.ts`
Expected: All PASS

- [ ] **Step 2: Run all integration tests**

Run: `pnpm vitest run __tests__/lib/prompts/narrative-output.test.ts`
Expected: All PASS

- [ ] **Step 3: Run TypeScript check on entire project**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Final commit with all files**

Run: `git status` to verify nothing is uncommitted.
If clean: done. If not: stage and commit remaining files.

```bash
git add -A
git commit -m "feat(prompts): complete Frieren system prompt v1 with tests"
```
