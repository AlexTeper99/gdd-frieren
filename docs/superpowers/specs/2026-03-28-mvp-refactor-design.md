# Habit Quest MVP — Refactor + Fixes + UX Spec

**Date:** 2026-03-28
**Scope:** Architecture refactor, 65 bug fixes, UX improvements, design tokens
**Base:** `develop` branch, post-MVP implementation
**Audit:** 10 subagent reviews covering every screen, action, and edge case

---

## 1. Goals

1. **Refactor** to feature-first architecture (adapted for small project)
2. **Fix** all critical/high bugs found in audit (65 issues)
3. **Improve** UX gaps (story archive, error states, loading states, empty states)
4. **Establish** design tokens for consistent dark theme
5. **Prepare** for production deploy on Vercel Hobby plan

**Non-goals:** No new features beyond what the spec requires. No TanStack Query, no `use cache`, no repositories layer.

---

## 2. Architecture: Feature-First

### New folder structure

```
features/
├── onboarding/
│   ├── components/
│   │   ├── onboarding-flow.tsx
│   │   ├── step-character.tsx
│   │   ├── step-mission.tsx
│   │   └── step-prologue.tsx
│   └── actions.ts
│
├── rituals/
│   ├── components/
│   │   └── rituals-list.tsx
│   ├── actions.ts          — markComplete, getTodayRituals
│   └── penalty.ts          — penalizeUncompleted (used by cron)
│
├── story/
│   ├── components/
│   │   ├── story-view.tsx
│   │   └── story-archive.tsx   — NEW: full story reader
│   ├── actions.ts
│   ├── prompts/
│   │   ├── base.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   ├── build-context.ts
│   │   └── modules/
│   │       ├── prologo.ts
│   │       └── diario.ts
│   └── memory.ts
│
├── pact/
│   ├── components/
│   │   └── pact-view.tsx
│   └── actions.ts
│
├── profile/
│   ├── components/
│   │   ├── profile-view.tsx
│   │   └── edit-rituals.tsx
│   └── actions.ts
│
├── push/
│   ├── vapid.ts
│   ├── send.ts
│   └── registration.tsx
│
└── shared/
    ├── db/
    │   ├── schema.ts          — single schema, all tables
    │   └── index.ts           — drizzle client
    ├── auth/
    │   ├── index.ts           — NextAuth config
    │   └── dal.ts             — verifySession, resolveUserId
    ├── constants.ts           — DAYS, HP values, archetype icons
    ├── utils.ts               — cn()
    └── types.ts               — shared types (PlayerSnapshot, etc.)

app/                           — ROUTING ONLY, imports from features/
├── layout.tsx                 — root layout (updated metadata + PWA tags)
├── manifest.ts
├── (auth)/login/
│   ├── page.tsx
│   └── actions.ts
├── (app)/
│   ├── layout.tsx
│   ├── page.tsx               — home (imports from features/)
│   ├── onboarding/page.tsx
│   ├── rituals/page.tsx
│   ├── story/page.tsx
│   ├── story/archive/page.tsx — NEW: full story reader
│   ├── pact/page.tsx
│   ├── profile/page.tsx
│   ├── profile/[userId]/page.tsx
│   └── profile/rituals/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── story/generate/route.ts
│   ├── push/subscribe/route.ts
│   └── cron/daily-penalty/route.ts

public/
├── sw.js
└── icons/
```

### Principles

- `app/` pages are thin — import components + actions from `features/`
- Features never import from other features
- `features/shared/` is the only cross-feature dependency
- One actions file per feature (not one per function)
- `features/shared/constants.ts` holds all shared constants (DAYS, HP values, etc.)

### Import mapping (old → new)

| Old | New |
|-----|-----|
| `@/lib/actions/onboarding` | `@/features/onboarding/actions` |
| `@/lib/actions/rituals` | `@/features/rituals/actions` |
| `@/lib/actions/hp` | `@/features/rituals/penalty` |
| `@/lib/actions/story` | `@/features/story/actions` |
| `@/lib/actions/pact` | `@/features/pact/actions` |
| `@/lib/actions/profile` | `@/features/profile/actions` |
| `@/lib/db/*` | `@/features/shared/db/*` |
| `@/lib/auth/*` | `@/features/shared/auth/*` |
| `@/lib/dal` | `@/features/shared/auth/dal` |
| `@/lib/prompts/*` | `@/features/story/prompts/*` |
| `@/lib/narrative/*` | `@/features/story/memory` |
| `@/lib/push/*` | `@/features/push/*` |
| `@/lib/utils` | `@/features/shared/utils` |

---

## 3. Schema Changes

### 3a. Add `tipo` to story_entries

```typescript
export const storyEntryTypeEnum = pgEnum("story_entry_type", [
  "prologo",
  "diario",
]);

export const storyEntries = pgTable("story_entries", {
  // ... existing fields ...
  tipo: storyEntryTypeEnum("tipo").default("diario").notNull(),
});
```

**Migration:** Existing rows get `tipo = "diario"` by default. Then update prologues:
```sql
UPDATE story_entries SET tipo = 'prologo' WHERE texto_jugador IS NULL;
```

### 3b. Add unique constraints

```typescript
// ritual_logs: prevent double-marking
export const ritualLogs = pgTable("ritual_logs", {
  // ... existing fields ...
}, (table) => [
  uniqueIndex("ritual_logs_ritual_fecha").on(table.ritualId, table.fecha),
]);

// pacts: one per week
export const pacts = pgTable("pacts", {
  // ... existing fields ...
}, (table) => [
  uniqueIndex("pacts_semana_unique").on(table.semana),
]);

// story_entries: unique turn number
export const storyEntries = pgTable("story_entries", {
  // ... existing fields ...
}, (table) => [
  uniqueIndex("story_entries_turno_unique").on(table.turnoNumero),
]);
```

### 3c. Add timezone to users (for future, optional now)

For MVP with 2 Argentine users, hardcode `America/Argentina/Buenos_Aires`. Add field later if needed.

---

## 4. Design Tokens (Tailwind)

Add to `app/globals.css` or Tailwind config:

```css
:root {
  --bg: #0a0a0f;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);
  --text: #e8e4df;
  --text-muted: rgba(255, 255, 255, 0.4);
  --text-faint: rgba(255, 255, 255, 0.15);
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);

  --purple: #aa82ff;
  --purple-bg: rgba(170, 130, 255, 0.08);
  --purple-border: rgba(170, 130, 255, 0.25);

  --green: #4caf50;
  --green-bg: rgba(76, 175, 80, 0.08);
  --green-border: rgba(76, 175, 80, 0.25);

  --red: #ef5350;
  --red-bg: rgba(239, 83, 80, 0.08);
  --red-border: rgba(239, 83, 80, 0.15);

  --blue: #42a5f5;
  --blue-bg: rgba(66, 165, 245, 0.1);
  --blue-border: rgba(66, 165, 245, 0.25);

  --amber: #ffb74d;
  --amber-bg: rgba(255, 183, 77, 0.08);
  --amber-border: rgba(255, 183, 77, 0.25);

  --radius: 12px;
  --radius-sm: 8px;
  --radius-full: 9999px;
}
```

Base para desarrollo. Daiana refina después.

---

## 5. Fixes por Feature

### 5.1 Auth + Layout

| Fix | Qué cambiar |
|-----|-------------|
| **Password a env var** | `lib/auth/index.ts:12` → `process.env.AUTH_PASSWORD!` |
| **Sign-out roto** | `home-screen.tsx:128` → usar server action `signOut({ redirectTo: "/login" })` |
| **Metadata placeholder** | `app/layout.tsx` → title "Habit Quest", description real, PWA meta tags |
| **PWA meta tags** | Agregar apple-touch-icon, theme-color, apple-mobile-web-app-capable en layout |
| **proxy.ts sin usar** | Eliminar `proxy.ts` — protección es via `verifySession()` en layouts |
| **.env.local.example** | Crear con todas las vars necesarias documentadas |

### 5.2 Onboarding

| Fix | Qué cambiar |
|-----|-------------|
| **Prologue error handling** | `step-prologue.tsx` → try-catch, check res.ok, mostrar error + retry |
| **Missing revalidatePath** | `saveCharacter()` → agregar `revalidatePath("/onboarding")` |
| **Client-side validation** | Deshabilitar submit si campos vacíos (nombre, identidad, arquetipo) |
| **Botón atrás** | Agregar `onBack` a cada step, `setStep(step - 1)` |
| **Rituales sugeridos** | Agregar rituales default por categoría que el user puede togglear (spec requirement) |
| **Validación horaInicio < horaFin** | En `handleAddRitual()`, validar antes de agregar a lista |
| **Error messages específicos** | "Elegí al menos un día" en vez de "Completá todos los campos" |

### 5.3 Home

| Fix | Qué cambiar |
|-----|-------------|
| **Ritual count bug** | `page.tsx:31-34` → filtrar por día de semana (usar `getTodayRituals` o replicar filtro) |
| **Partner sin onboarding** | Mostrar "Esperando a que [nombre] complete el onboarding" en vez de card vacía |
| **Sign-out funcional** | Server action en vez de form POST |

### 5.4 Rituals

| Fix | Qué cambiar |
|-----|-------------|
| **Race condition** | Unique constraint en DB + manejar conflict en app code |
| **Loading state** | Agregar `loading` state por ritual, deshabilitar botón durante async |
| **HP con SQL increment** | `set({ hp: sql\`LEAST(hp + ${gain}, 100)\` })` en vez de read-then-write |
| **Empty state** | Si 0 rituales hoy: "No tenés rituales para hoy. [Agregar →]" |
| **No error feedback** | Si markComplete falla, mostrar error toast |

### 5.5 HP / Penalty

| Fix | Qué cambiar |
|-----|-------------|
| **HP nunca llega a 0** | Quitar `Math.max(0, ...)`, dejar que llegue a <=0, luego resetear a 30 |
| **Error handling en cron** | try-catch per user, log failures, return resultado detallado |
| **Penalty log filtering** | Filtrar solo `cumplido=true` al armar completedIds set |
| **Timezone** | Usar `America/Argentina/Buenos_Aires` para calcular "hoy" y "día de semana" |
| **Cron timing** | Cambiar de 23:59 UTC a 03:00 UTC (= 00:00 Argentina) |

### 5.6 Story

| Fix | Qué cambiar |
|-----|-------------|
| **Turn logic** | Filtrar por `tipo = "diario"` para detectar turno. Prólogos no cuentan. |
| **Server-side turn validation** | En route.ts, verificar que es el turno del user antes de generar |
| **Claude API error handling** | try-catch en generateText, return error con mensaje claro |
| **Fetch error handling** | En story-view, check `res.ok`, mostrar error con retry |
| **Memory update sync** | `await updateNarrativeMemory()` en vez de fire-and-forget |
| **snake_case worldState** | Unificar a camelCase en types.ts Y en el prompt de memory update |
| **Mostrar textoJugador** | story-view muestra AMBOS: texto del jugador + continuación IA |
| **Story archive** | NUEVA PÁGINA: `/story/archive` con todas las entradas completas, paginadas, orden cronológico |
| **Paginación** | Cambiar limit(10) por paginación real con offset/cursor |
| **Gateway API key check** | Validar que `AI_GATEWAY_API_KEY` existe antes de llamar |
| **Player order estable** | `orderBy(users.createdAt)` en todas las queries de "ambos jugadores" |

### 5.7 Pact

| Fix | Qué cambiar |
|-----|-------------|
| **getCurrentSunday()** | `diff = day === 0 ? 0 : -day` (ir ATRÁS, no adelante) + fecha sin toISOString |
| **Player determination** | Ordenar por `createdAt` o usar email para determinar J1/J2 de forma estable |
| **Race condition** | Usar UPSERT con `onConflictDoUpdate` + unique constraint en `semana` |
| **Validación vacía** | Server-side: rechazar si obstáculos/plan/apoyo están vacíos |
| **Sealed view con labels** | Mostrar pregunta + respuesta (no solo respuestas concatenadas) |
| **No data migration needed** | Pacts con fechas incorrectas se ignoran (semana vieja no matchea) |

### 5.8 Profile

| Fix | Qué cambiar |
|-----|-------------|
| **Heatmap alignment** | Calcular inicio como lunes de la semana de 28 días atrás, pad con celdas vacías |
| **Heatmap leyenda** | Agregar leyenda de colores debajo (Menos → Más) |
| **Edit ritual existente** | NUEVA FUNCIONALIDAD: `updateRitual(id, data)` action + form en edit-rituals |
| **Validación horaInicio < horaFin** | Server-side en createRitual y updateRitual |
| **Validación días válidos** | Verificar que cada día está en ["lun","mar","mie","jue","vie","sab","dom"] |
| **Deactivate clarification** | Texto: "Desactivar (no aparece en tu día, pero conserva tu racha)" |

### 5.9 Push / PWA

| Fix | Qué cambiar |
|-----|-------------|
| **Eliminar cron cada 30min** | Incompatible con Hobby. Usar client-side scheduling via Service Worker |
| **SW local notifications** | En sw.js, al registrar, leer rituales del día y programar notificaciones locales |
| **Permission denial feedback** | Mostrar UI si user deniega permisos push |
| **Manifest link en layout** | Next.js lo maneja automático con `app/manifest.ts` — verificar que funciona |

### 5.10 Shared / Constants

| Fix | Qué cambiar |
|-----|-------------|
| **DAYS en 3 archivos** | Extraer a `features/shared/constants.ts` |
| **HP constants duplicados** | Extraer HP_PER_RITUAL, HP_BONUS, HP_MAX, HP_PENALTY, HP_RESET |
| **Archetype icons** | Extraer ARCHETYPE_ICONS map a constants |
| **Timezone helper** | Crear `getArgentinaDate()` y `getArgentinaDay()` helpers |

---

## 6. New Features Required

### 6.1 Story Archive (`/story/archive`)

- Página nueva: todas las entradas en orden cronológico (oldest first)
- Muestra textoJugador + textoIa para cada entrada
- Paginación server-side (20 entries per page)
- Estilo "libro": serif font, espaciado generoso, separador entre turnos
- Accesible desde botón en `/story`

### 6.2 Edit Ritual

- Botón "Editar" en cada ritual en `/profile/rituals`
- Form pre-llenado con datos actuales
- Server action `updateRitual(id, data)` con validación
- Misma validación que create (horaInicio < horaFin, días válidos)

### 6.3 Rituales Sugeridos por Categoría

En onboarding step 2, al elegir categoría, mostrar rituales pre-definidos:

```typescript
const SUGGESTED_RITUALS: Record<string, {descripcion: string, dias: string[], horaInicio: string, horaFin: string, lugar: string}[]> = {
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

User puede togglear cada sugerido (agregar/quitar de la lista) + agregar custom.

### 6.4 Client-side Push Scheduling

Reemplaza el cron cada 30min (incompatible con Hobby):

```javascript
// En push-registration.tsx, después de registrar SW:
// 1. Fetch today's rituals from API
// 2. Para cada ritual, calcular ms hasta horaInicio
// 3. Usar Notification API para programar localmente
// 4. Re-calcular cada vez que el user abre la app
```

Limitación: solo funciona si el user abrió la app ese día. Aceptable para MVP de 2 personas.

---

## 7. Data Integrity

### Transactions

Envolver en transaction estas operaciones:
- `markRitualComplete`: check + insert log + update streak + update HP
- `penalizeUncompleted`: loop completo de penalty
- `submitPactAnswers`: check + insert/update (o usar UPSERT)

### HP con SQL increment

```typescript
// En vez de:
const [user] = await db.select({ hp: users.hp }).from(users);
const newHp = Math.min(100, user.hp + gain);
await db.update(users).set({ hp: newHp });

// Usar:
await db.update(users)
  .set({ hp: sql`LEAST(${users.hp} + ${gain}, 100)` })
  .where(eq(users.id, userId));
```

### Timezone

Hardcodear `America/Argentina/Buenos_Aires` para MVP:

```typescript
// features/shared/constants.ts
export const USER_TIMEZONE = "America/Argentina/Buenos_Aires";

export function getLocalDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: USER_TIMEZONE });
}

export function getLocalDay(): string {
  const dayIndex = new Date().toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    weekday: "short",
  });
  const map: Record<string, string> = {
    Sun: "dom", Mon: "lun", Tue: "mar", Wed: "mie",
    Thu: "jue", Fri: "vie", Sat: "sab",
  };
  return map[dayIndex] ?? "lun";
}
```

Reemplazar TODOS los `new Date().toISOString().split("T")[0]` y `new Date().getDay()` con estos helpers.

---

## 8. Deploy Readiness

### Vercel Hobby compatibility

| Item | Estado | Fix |
|------|--------|-----|
| Cron penalty (1x/día) | Compatible | Cambiar a 03:00 UTC (00:00 ARG) |
| Cron push (48x/día) | **Incompatible** | Eliminar, usar client-side scheduling |
| DB migration | Pendiente | `npx drizzle-kit push` antes de deploy |
| Env vars | Parcial | Subir AUTH_PASSWORD, completar .env.local.example |

### .env.local.example final

```
# Database (Neon)
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=

# Auth
AUTH_SECRET=
AUTH_PASSWORD=

# AI (Vercel AI Gateway)
AI_GATEWAY_API_KEY=

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Cron
CRON_SECRET=
```

### Pre-deploy checklist

- [ ] Schema migration aplicada en production DB
- [ ] Ambos usuarios existen en production DB
- [ ] Todas las env vars seteadas en Vercel
- [ ] Password movida de código a env var
- [ ] Cron push eliminado de vercel.json
- [ ] Metadata actualizada en layout.tsx
- [ ] Build exitoso

---

## 9. Implementation Order

**Fase 1 — Schema + Data Integrity (bloqueante)**
1. Schema changes (tipo, unique constraints)
2. Migration + backfill
3. Timezone helpers
4. SQL increment para HP
5. Transactions en operaciones críticas

**Fase 2 — Critical Bug Fixes (bloqueante)**
6. Turn logic (filtrar por tipo)
7. getCurrentSunday fix
8. Sign-out fix
9. Password a env var
10. Claude API error handling
11. Ritual count fix
12. HP llega a 0 fix
13. Player order estable

**Fase 3 — Architecture Refactor**
14. Crear `features/` structure
15. Mover archivos (git mv)
16. Actualizar imports (42+)
17. Verify build

**Fase 4 — Design Tokens + UX**
18. CSS variables en globals.css
19. Metadata + PWA tags en layout
20. Loading states en todas las pantallas
21. Error states con retry
22. Empty states con CTAs

**Fase 5 — New Features**
23. Story archive page
24. Story pagination
25. Edit ritual
26. Rituales sugeridos por categoría
27. Heatmap alignment + leyenda
28. Botón atrás en onboarding
29. Pact sealed view con labels
30. Client-side push scheduling

**Fase 6 — Deploy**
31. .env.local.example
32. Limpiar vercel.json (sacar cron push)
33. Migration en production DB
34. Deploy + test
