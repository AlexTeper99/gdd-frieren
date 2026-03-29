# Feature-First Architecture - Next.js 16

> **Fecha**: 2026-01-20
> **Versión**: 2.0
> **Contexto**: Arquitectura optimizada para máximo desacoplamiento y "vibe coding"

---

## Resumen Ejecutivo

Arquitectura con **features completamente aislados**, cada uno con su propia base de datos, repositories, y lógica de negocio. Zero coupling entre features.

**Principio fundamental:** Cada feature es una **isla autónoma** que puede desarrollarse, testearse y desplegarse de forma independiente.

---

## Estructura Top-Level

```
src/
├── app/                    # Next.js routing ONLY
├── features/               # Features aislados (lógica + UI + data + DB)
├── common/                 # UI genérica + utils sin lógica de negocio
├── services/               # Shared infrastructure (auth, feature flags)
└── config/                 # Variables de entorno
```

### Características clave:

| Carpeta     | Responsabilidad          | Puede importar de      |
| ----------- | ------------------------ | ---------------------- |
| `app/`      | Routing (pages, layouts) | `features/`            |
| `features/` | TODO sobre un feature    | `common/`, `services/` |
| `common/`   | UI + utils genéricos     | Solo libs externas     |
| `services/` | Auth compartido          | Solo libs externas     |
| `config/`   | Env vars                 | Solo libs externas     |

**Regla de oro:** Features **NUNCA** importan de otros features.

---

## Anatomía de un Feature

```
features/[feature-name]/
│
├── components/                 # 🎨 UI Components
│   ├── FeatureGrid.tsx         # Server Component (default)
│   ├── FeatureCard.tsx         # Server Component
│   └── FeatureActions.tsx      # 'use client' (Client Island)
│
├── hooks/                      # 🪝 UI State Hooks (client-side)
│   ├── useFeaturePageState.ts  # Filtros, modals, UI state
│   └── useFeatureDragDrop.ts   # Drag & drop logic
│
├── actions/                    # 🔥 'use server' - Server Actions
│   ├── createFeature.ts
│   ├── updateFeature.ts
│   ├── deleteFeature.ts
│   └── __tests__/
│       ├── createFeature.test.ts
│       └── updateFeature.test.ts
│
├── queries/                    # 🔥 'use cache' - Data Fetching
│   ├── getFeatures.ts
│   ├── getFeatureById.ts
│   └── __tests__/
│       ├── getFeatures.test.ts
│       └── getFeatureById.test.ts
│
├── data-hooks/                 # 🔥 'use client' - TanStack Query
│   ├── useFeatures.ts
│   ├── useFeatureById.ts
│   ├── useCreateFeature.ts
│   ├── useUpdateFeature.ts
│   └── __tests__/
│       └── useCreateFeature.test.ts
│
├── db/                         # 🗄️ Database Connection
│   └── client.ts               # Drizzle client para DB propia
│
├── repositories/               # 💾 Data Access Layer
│   ├── api/                    # API externa (REST, GraphQL, etc.)
│   │   ├── client.ts           # HTTP client configurado
│   │   ├── fetchFeatures.ts    # GET /features
│   │   ├── createFeature.ts    # POST /features
│   │   └── __tests__/
│   │       └── fetchFeatures.test.ts
│   ├── db/                     # Base de datos local (Drizzle)
│   │   ├── findAllFeatures.ts  # Una función por archivo
│   │   ├── findFeatureById.ts
│   │   ├── insertFeature.ts
│   │   ├── updateFeatureById.ts
│   │   ├── deleteFeatureById.ts
│   │   ├── schema.ts           # Drizzle table definitions
│   │   ├── migrations/
│   │   │   ├── 0001_create_table.sql
│   │   │   └── meta/
│   │   └── __tests__/
│   │       ├── findAllFeatures.test.ts
│   │       └── insertFeature.test.ts
│   └── schema.ts               # (Opcional) Si solo DB, puede estar aquí
│
├── types.ts                    # 📝 TypeScript types
├── validations.ts              # ✅ Zod schemas
├── constants.ts                # 🔑 CACHE_TAGS, QUERY_KEYS
├── utils.ts                    # 🛠️ Helper functions (opcional)
│
└── __tests__/                  # 🧪 Feature-level Integration Tests
    ├── builders.ts             # Test data factories
    ├── handlers.ts             # MSW handlers
    └── FeatureGrid.test.tsx
```

---

## Responsabilidades por Carpeta

### `components/` - UI Components

**Qué contiene:**

- Componentes React específicos del feature
- Por defecto **Server Components** (sin `'use client'`)
- Solo `'use client'` para partes interactivas (Client Islands)

**Ejemplo Server Component:**

```typescript
// features/dashboards/components/DashboardCard.tsx
import Link from 'next/link'
import { Card } from '@/common/components/ui/Card'
import { DashboardCardActions } from './DashboardCardActions'
import type { Dashboard } from '../types'

// ✅ Server Component (sin 'use client')
export function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <Card>
      <Link href={`/dashboards/${dashboard.id}`}>
        <h3>{dashboard.name}</h3>
        <p>{dashboard.description}</p>
      </Link>

      {/* Client Island para acciones interactivas */}
      <DashboardCardActions dashboardId={dashboard.id} />
    </Card>
  )
}
```

**Ejemplo Client Island:**

```typescript
// features/dashboards/components/DashboardCardActions.tsx
'use client'

import { DropdownMenu } from '@/common/components/ui/DropdownMenu'
import { useDeleteDashboard } from '../data-hooks/useDeleteDashboard'

export function DashboardCardActions({ dashboardId }: { dashboardId: string }) {
  const { mutate, isPending } = useDeleteDashboard()

  const handleDelete = () => {
    if (confirm('Are you sure?')) {
      mutate({ id: dashboardId })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenu.Item onClick={handleDelete} disabled={isPending}>
        {isPending ? 'Deleting...' : 'Delete'}
      </DropdownMenu.Item>
    </DropdownMenu>
  )
}
```

---

### `hooks/` - UI State Hooks

**Qué contiene:**

- Hooks que gestionan **estado de UI local** (no datos de servidor)
- Lógica de filtros, modals, drag & drop, paginación
- Siempre `'use client'`

**Ejemplo:**

```typescript
// features/dashboards/hooks/useDashboardPageState.ts
'use client';
import { useState } from 'react';

export function useDashboardPageState() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  return {
    isCreateModalOpen,
    openCreateModal: () => setIsCreateModalOpen(true),
    closeCreateModal: () => setIsCreateModalOpen(false),
    selectedId,
    setSelectedId,
    filters,
    setFilters,
  };
}
```

---

### `actions/` - Server Actions (`'use server'`)

**Qué contiene:**

- Mutations: create, update, delete
- Siempre `'use server'` directive
- Validación con Zod
- Autenticación/autorización
- Llamadas a repositories
- Cache invalidation con `updateTag()` (inmediato) o `revalidateTag()` (stale-while-revalidate)

**Ejemplo:**

```typescript
// features/dashboards/actions/createDashboard.ts
'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/services/auth/session';
import { insertDashboard } from '../repositories/insertDashboard';
import { createDashboardSchema } from '../validations';
import { CACHE_TAGS, DASHBOARD_DEFAULTS } from '../constants';
import type { CreateDashboardInput, Dashboard } from '../types';

export async function createDashboard(input: CreateDashboardInput): Promise<never> {
  // 1. Autenticación
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // 2. Validación
  const validated = createDashboardSchema.parse({
    ...input,
    organizationId: session.orgId,
    layout: input.layout ?? DASHBOARD_DEFAULTS.layout,
  });

  // 3. Business logic (opcional)
  // const count = await countDashboards(session.orgId)
  // if (count >= 50) throw new Error('Limit reached')

  // 4. Persistencia
  const dashboard = await insertDashboard(validated);

  // 5. Cache invalidation (read-your-own-writes: immediate expiration)
  updateTag(CACHE_TAGS.list);

  // 6. Redirect
  redirect(`/dashboards/${dashboard.id}`);
}
```

**Cache Invalidation Patterns:**

```typescript
// ✅ Use updateTag() in Server Actions for read-your-own-writes
import { updateTag } from 'next/cache';
updateTag('dashboards:list'); // Immediately expires cache

// ✅ Use revalidateTag() for eventual consistency (stale-while-revalidate)
import { revalidateTag } from 'next/cache';
revalidateTag('dashboards:list', 'max'); // Serves stale, revalidates in background
```

---

### `queries/` - Data Fetching (`'use cache'`)

**Qué contiene:**

- Queries: get, getById, list
- Siempre `'use cache'` directive (Next.js 16)
- Autorización
- Transformaciones de datos
- Cache configuration con `cacheTag()` y `cacheLife()`

**Ejemplo:**

```typescript
// features/dashboards/queries/getDashboards.ts
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { getSession } from '@/services/auth/session';
import { findAllDashboards } from '../repositories/findAllDashboards';
import { CACHE_TAGS } from '../constants';
import type { Dashboard } from '../types';

export async function getDashboards(): Promise<Dashboard[]> {
  // 1. Cache configuration (MUST be inside the cached function)
  cacheTag(CACHE_TAGS.list);
  cacheLife('hours'); // Optional: defaults to 'default' if omitted

  // 2. Auth
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // 3. Fetch
  const dashboards = await findAllDashboards(session.orgId);

  // 4. Transform: filtrar, ordenar
  return dashboards
    .filter((d) => !d.deletedAt)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
```

---

### `data-hooks/` - TanStack Query Hooks (`'use client'`)

**Qué contiene:**

- Wrappers de TanStack Query sobre actions/queries
- Siempre `'use client'`
- Gestión de loading/error states
- Optimistic updates
- Query invalidation

**Ejemplo Query Hook:**

```typescript
// features/dashboards/data-hooks/useDashboards.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboards } from '../queries/getDashboards';
import { QUERY_KEYS } from '../constants';

export function useDashboards() {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: getDashboards,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
```

**Ejemplo Mutation Hook:**

```typescript
// features/dashboards/data-hooks/useCreateDashboard.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDashboard } from '../actions/createDashboard';
import { QUERY_KEYS } from '../constants';
import type { CreateDashboardInput } from '../types';

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDashboardInput) => createDashboard(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
    },
  });
}
```

---

### `db/` - Database Connection

**Qué contiene:**

- Cliente Drizzle con pool config
- **Una DB por feature** (aislamiento total)

**Ejemplo:**

```typescript
// features/dashboards/db/client.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DASHBOARDS_DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const dashboardsDb = drizzle(pool);
```

---

### `repositories/` - Data Access Layer

**Qué contiene:**

- Funciones puras de **acceso a datos** (DB, APIs externas, GraphQL, etc.)
- Una función por archivo
- **SIN lógica de negocio** (solo lectura/escritura de datos)
- Schema Drizzle (si usa DB local)
- Migraciones SQL (si usa DB local)

**IMPORTANTE:** `repositories/` NO está limitado solo a bases de datos. Es la capa de abstracción para **cualquier fuente de datos**.

#### Estructura Recomendada

```
repositories/
├── api/          # APIs externas (core-api, third-party APIs)
│   ├── client.ts
│   └── fetchDashboards.ts
└── db/           # Base de datos local (si existe)
    ├── schema.ts
    └── findLocalDashboards.ts
```

#### Ejemplo: Repository API Externa

```typescript
// features/dashboards/repositories/api/client.ts
import { env } from '@/config/env';

export const coreApiClient = {
  baseUrl: env.CORE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function fetchFromCoreApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${coreApiClient.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...coreApiClient.headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

```typescript
// features/dashboards/repositories/api/fetchDashboards.ts
import { fetchFromCoreApi } from './client';
import type { Dashboard } from '../../types';

/**
 * Fetches dashboards from core-api (external API)
 */
export async function fetchDashboards(orgId: string): Promise<Dashboard[]> {
  return fetchFromCoreApi<Dashboard[]>(`/organizations/${orgId}/dashboards`);
}
```

#### Ejemplo: Repository DB Local

```typescript
// features/dashboards/repositories/db/findAllDashboards.ts
import { eq } from 'drizzle-orm';
import { dashboardsDb } from '../../db/client';
import { dashboardsTable } from './schema';
import type { Dashboard } from '../../types';

/**
 * Finds all dashboards from local database
 */
export async function findAllDashboards(orgId: string): Promise<Dashboard[]> {
  return dashboardsDb
    .select()
    .from(dashboardsTable)
    .where(eq(dashboardsTable.organizationId, orgId));
}
```

```typescript
// features/dashboards/repositories/db/schema.ts
import { pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core';

export const dashboardsTable = pgTable('dashboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  organizationId: text('organization_id').notNull(),
  layout: jsonb('layout').notNull().$type<{
    columns: number;
    gap: number;
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
```

#### Uso en Queries

```typescript
// features/dashboards/queries/getDashboards.ts
'use cache';
import { cacheTag, cacheLife } from 'next/cache';
import { getSession } from '@/services/auth/session';
import { fetchDashboards } from '../repositories/api/fetchDashboards'; // ✅ API
// import { findAllDashboards } from '../repositories/db/findAllDashboards'; // ✅ DB
import { CACHE_TAGS } from '../constants';

export async function getDashboards(): Promise<Dashboard[]> {
  cacheTag(CACHE_TAGS.list);
  cacheLife('hours');

  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Llama al repository (API o DB según tu arquitectura)
  const dashboards = await fetchDashboards(session.orgId);

  // Transformaciones de datos (filtrar, ordenar)
  return dashboards
    .filter((d) => !d.deletedAt)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
```

---

### Archivos Top-Level del Feature

#### `types.ts` - TypeScript Types

```typescript
// features/dashboards/types.ts

// Entidades principales
export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  layout: DashboardLayout;
  widgets: Widget[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DashboardLayout {
  columns: number;
  gap: number;
}

// Input types (para mutations)
export interface CreateDashboardInput {
  name: string;
  description?: string;
  layout?: DashboardLayout;
}

export interface UpdateDashboardInput {
  id: string;
  name?: string;
  description?: string;
  layout?: DashboardLayout;
}

// Filter types
export interface DashboardFilters {
  search?: string;
  status?: 'draft' | 'published' | 'archived';
}
```

#### `validations.ts` - Zod Schemas

```typescript
// features/dashboards/validations.ts
import { z } from 'zod';

export const dashboardLayoutSchema = z.object({
  columns: z.number().int().min(1).max(12),
  gap: z.number().int().min(0).max(32),
});

export const createDashboardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  layout: dashboardLayoutSchema.optional(),
  organizationId: z.string().uuid(),
});

export const updateDashboardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  layout: dashboardLayoutSchema.optional(),
});
```

#### `constants.ts` - Cache Tags & Query Keys

```typescript
// features/dashboards/constants.ts

// Next.js Cache Tags
export const CACHE_TAGS = {
  list: 'dashboards:list',
  detail: (id: string) => `dashboards:detail:${id}`,
  all: 'dashboards:*',
} as const;

// TanStack Query Keys (factory pattern)
export const QUERY_KEYS = {
  all: ['dashboards'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: DashboardFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
} as const;

// Defaults
export const DASHBOARD_DEFAULTS = {
  layout: {
    columns: 12,
    gap: 16,
  },
} as const;
```

#### `utils.ts` - Helper Functions (Opcional)

```typescript
// features/dashboards/utils.ts
import type { Dashboard } from './types';

/**
 * Formatea un dashboard para display
 */
export function formatDashboardForDisplay(dashboard: Dashboard) {
  return {
    ...dashboard,
    createdAt: dashboard.createdAt.toLocaleDateString(),
    updatedAt: dashboard.updatedAt.toLocaleDateString(),
    widgetCount: dashboard.widgets.length,
  };
}

/**
 * Verifica si un dashboard está completo
 */
export function isDashboardComplete(dashboard: Dashboard): boolean {
  return dashboard.widgets.length > 0;
}
```

---

## Flujo de Datos End-to-End

### Escenario: Usuario crea un dashboard

```
1. User clicks "Create" button
   → CreateDashboardModal.tsx (Client Component)

2. Component calls mutation hook
   → useCreateDashboard() (TanStack Query hook)

3. Hook calls Server Action
   → createDashboard() ('use server')

4. Server Action:
   - Validates with Zod
   - Calls repository
   → insertDashboard() (DB) OR createDashboard() (API)

5. Repository writes to data source
   → dashboardsDb.insert() (DB local)
   → fetch POST /dashboards (API externa)

6. Server Action invalidates cache (immediate)
   → updateTag('dashboards:list')

7. Server Action redirects
   → redirect('/dashboards')

8. Page re-renders with fresh data
   → getDashboards() executes (cache was invalidated)
```

**Diagrama:**

```
CLIENT                          SERVER
------                          ------
CreateDashboardModal
  ↓ mutate()
useCreateDashboard() ─RPC────→ createDashboard() action
  ↓                               ↓ getSession()
  ↓                               ↓ validate()
  ↓                               ↓ insertDashboard() repository
  ↓                               ↓   → PostgreSQL (DB local)
  ↓                               ↓   → POST /dashboards (API externa)
  ↓                               ↓ updateTag() (immediate)
  ↓                               ↓ redirect()
  ↓ REDIRECT ←───────────────────┘
  ↓
Page reloads → getDashboards()
  ↓
DashboardGrid renders with fresh data
```

---

## Server Components + Cache Components + Suspense

### Thin Page Pattern (Recommended)

El **Thin Page Pattern** es la arquitectura recomendada para `page.tsx` en Next.js 16. La idea es mantener el archivo de routing lo más delgado posible, delegando toda la presentación y lógica a componentes específicos del feature.

**Principios:**

1. `page.tsx` solo contiene: metadata, auth guards, y delegación a componentes
2. Componentes de presentación viven en `features/[feature]/components/`
3. Cada componente tiene **una responsabilidad clara** (Single Responsibility Principle)
4. Los componentes son **testeables unitariamente** (a diferencia del `page.tsx`)

**Arquitectura:**

```
page.tsx (routing layer - ultra-thin)
  ↓
FeaturePageContent.tsx (Server Component - orchestration)
  ↓
├─> FeatureHeader.tsx (Server Component - presentación)
└─> FeatureGridAsync.tsx (Server Component - data fetching)
      ↓
    FeatureGrid.tsx (Client Component - interacciones)
```

**Ejemplo completo:**

```typescript
// ✅ app/(dashboard)/dashboards/page.tsx (21 lines)
import { getSession } from '@/services/auth/session';
import { redirect } from 'next/navigation';
import { DashboardsPageContent } from '@/features/dashboards/components/DashboardsPageContent';

export const metadata = {
  title: 'Dashboards',
  description: 'View and manage your dashboards',
};

/**
 * Thin routing layer for the dashboards page.
 * Responsibilities:
 * - Define page metadata
 * - Handle authentication guard
 * - Delegate rendering to feature components
 */
export default async function DashboardsPage() {
  const session = await getSession();
  if (!session?.orgId) {
    redirect('/auth');
  }

  return <DashboardsPageContent orgId={session.orgId} />;
}
```

```typescript
// ✅ features/dashboards/components/DashboardsPageContent.tsx
import { Suspense } from 'react';
import { DashboardsHeader } from './DashboardsHeader';
import { DashboardsGridAsync } from './DashboardsGridAsync';
import { DashboardsGridSkeleton } from './DashboardsGridSkeleton';

interface DashboardsPageContentProps {
  orgId: string;
}

/**
 * Server Component that orchestrates the dashboards page layout.
 * This component contains no business logic - it only composes child components.
 */
export function DashboardsPageContent({ orgId }: DashboardsPageContentProps) {
  return (
    <div className='space-y-6 p-6'>
      {/* Header with title and create button */}
      <DashboardsHeader />

      {/* Grid with Suspense boundary */}
      <Suspense fallback={<DashboardsGridSkeleton />}>
        <DashboardsGridAsync orgId={orgId} />
      </Suspense>
    </div>
  );
}
```

```typescript
// ✅ features/dashboards/components/DashboardsHeader.tsx
import { Button } from '@/common/components/ui/button';
import { Plus } from 'lucide-react';
import { createDashboard } from '../actions/createDashboard';

/**
 * Server Component that renders the dashboards page header.
 * Includes the page title, description, and create dashboard button.
 *
 * This is a Server Component - the form with Server Action works without JavaScript.
 */
export function DashboardsHeader() {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Dashboards</h1>
        <p className='text-muted-foreground'>Create and manage your custom dashboards</p>
      </div>

      {/* Create button (Server Action) */}
      <form action={createDashboard}>
        <Button type='submit'>
          <Plus className='mr-2 h-4 w-4' />
          Create Dashboard
        </Button>
      </form>
    </div>
  );
}
```

```typescript
// ✅ features/dashboards/components/DashboardsGridAsync.tsx
import { getDashboards } from '../queries/getDashboards';
import { DashboardsGrid } from './DashboardsGrid';

interface DashboardsGridAsyncProps {
  orgId: string;
}

/**
 * Async Server Component that fetches dashboards data.
 * This component is wrapped in a Suspense boundary in the parent component.
 *
 * Separation of concerns:
 * - This component: Data fetching logic
 * - DashboardsGrid: Presentation and client interactions
 */
export async function DashboardsGridAsync({ orgId }: DashboardsGridAsyncProps) {
  const dashboards = await getDashboards(orgId);
  return <DashboardsGrid dashboards={dashboards} />;
}
```

```typescript
// ✅ features/dashboards/components/DashboardsGrid.tsx
'use client';

import { DashboardCard } from './DashboardCard';
import { DashboardsEmptyState } from './DashboardsEmptyState';
import type { Dashboard } from '../types';

interface DashboardsGridProps {
  dashboards: Dashboard[];
}

/**
 * Client Component that renders the dashboards grid.
 * Handles presentation and client-side interactions.
 */
export function DashboardsGrid({ dashboards }: DashboardsGridProps) {
  if (dashboards.length === 0) {
    return <DashboardsEmptyState />;
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
      {dashboards.map((dashboard) => (
        <DashboardCard key={dashboard.id} dashboard={dashboard} />
      ))}
    </div>
  );
}
```

**Beneficios del Thin Page Pattern:**

| Beneficio                   | Impacto                                                       |
| --------------------------- | ------------------------------------------------------------- |
| **Routing vs Presentación** | Separación clara: `page.tsx` = routing, components = UI       |
| **Testeable**               | Cada componente tiene tests unitarios (70%+ coverage)         |
| **Reutilizable**            | `DashboardsHeader` puede usarse en otras páginas              |
| **Mantenible**              | Cambios en layout no afectan el routing                       |
| **Coverage excluido**       | `page.tsx` excluido del coverage (es solo routing)            |
| **Composable**              | Componentes pueden reordenarse o condicionalizarse fácilmente |

**Testing Strategy:**

```typescript
// ✅ page.tsx → ❌ No se testea (excluido de coverage en vitest.config.ts)
// ✅ DashboardsPageContent → ✅ Tests unitarios
// ✅ DashboardsHeader → ✅ Tests unitarios
// ✅ DashboardsGridAsync → ✅ Tests unitarios
// ✅ DashboardsGrid → ✅ Tests de integración

// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/app/**/page.tsx', // Thin routing layer
        'src/app/**/layout.tsx', // Routing
        'src/app/**/loading.tsx', // Routing
        'src/app/**/error.tsx', // Error boundaries (E2E)
      ],
    },
  },
});
```

**Para la mayoría de páginas simples, el Thin Page Pattern + tests unitarios es suficiente.**

### Parallel Data Fetching

```typescript
// app/(dashboard)/dashboards/[id]/page.tsx
import { getDashboardById } from '@/features/dashboards/queries/getDashboardById'
import { getDashboardWidgets } from '@/features/dashboards/queries/getDashboardWidgets'
import { notFound } from 'next/navigation'

// Cache configuration is inside query functions (getDashboardById uses cacheLife)

export default async function DashboardDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // ✅ Parallel fetching con Promise.all (each function uses 'use cache' internally)
  const [dashboard, widgets] = await Promise.all([
    getDashboardById(params.id),      // Cached with cacheTag('dashboard:123')
    getDashboardWidgets(params.id),   // Cached with cacheTag('widgets:123')
  ])

  if (!dashboard) notFound()

  return (
    <div>
      <DashboardHeader dashboard={dashboard} />
      <WidgetsGrid widgets={widgets} />
    </div>
  )
}
```

### Client Component con Initial Data

```typescript
// app/(dashboard)/dashboards/[id]/edit/page.tsx
import { getDashboardById } from '@/features/dashboards/queries/getDashboardById'
import { DashboardEditorClient } from '@/features/dashboards/components/DashboardEditorClient'

export default async function DashboardEditPage({
  params,
}: {
  params: { id: string }
}) {
  // ✅ Fetch en Server Component
  const dashboard = await getDashboardById(params.id)

  // ✅ Pass initial data a Client Component
  return <DashboardEditorClient initialData={dashboard} />
}
```

```typescript
// features/dashboards/components/DashboardEditorClient.tsx
'use client';

import { useDashboardById } from '../data-hooks/useDashboardById';
import type { Dashboard } from '../types';

export function DashboardEditorClient({ initialData }: { initialData: Dashboard }) {
  // ✅ TanStack Query con initialData (no refetch inicial)
  const { data: dashboard } = useDashboardById(initialData.id, {
    initialData,
  });

  // Editor logic...
}
```

---

## Cache Components en Next.js 16

### Cambios desde Next.js 15

Next.js 16 introdujo **Cache Components** (Partial Prerendering), cambiando fundamentalmente cómo funciona el caching:

| Aspecto             | Next.js 15                           | Next.js 16 (Cache Components)                   |
| ------------------- | ------------------------------------ | ----------------------------------------------- |
| **Default**         | Todo se cachea automáticamente       | **Nada se cachea por defecto**                  |
| **Cache explícito** | `export const revalidate = 60`       | `'use cache'` + `cacheLife()`                   |
| **Invalidación**    | `revalidateTag()` solo con `fetch()` | `cacheTag()` + `updateTag()` con ANY async work |
| **Granularidad**    | Route-level                          | Function/Component-level                        |
| **Filosofía**       | Static by default                    | Dynamic by default, cache explicitly            |

### Patrón Correcto

```typescript
// ✅ Next.js 16 - Cache explícito con 'use cache'
'use cache';
import { cacheTag, cacheLife } from 'next/cache';

export async function getData() {
  cacheTag('data'); // Tag para invalidación
  cacheLife('hours'); // Duración del cache

  return await db.query('...');
}
```

```typescript
// ✅ Invalidación inmediata con updateTag (Server Actions)
'use server';
import { updateTag } from 'next/cache';

export async function createItem() {
  await db.insert(...);
  updateTag('data'); // Expira inmediatamente (read-your-own-writes)
}
```

### ❌ Patrones Obsoletos

```typescript
// ❌ Ya NO funciona en Next.js 16
export const revalidate = 60; // Route segment config obsoleto

// ❌ Ya NO funciona en Next.js 16
getData.cacheTag = 'data'; // Propiedad externa obsoleta

// ❌ Menos óptimo para Server Actions
revalidateTag('data'); // Stale-while-revalidate (más lento)
```

### Configuración Necesaria

Para habilitar Cache Components en `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true, // Habilita Cache Components
};

export default nextConfig;
```

---

## Formularios

Tres patrones de formularios, ordenados por complejidad:

| Necesidad                          | Patrón                                                       | Ubicación                               | Ejemplo                 |
| ---------------------------------- | ------------------------------------------------------------ | --------------------------------------- | ----------------------- |
| Action sin input (crear, eliminar) | Server Action Form: `<form action={...}>` + `useActionState` | `components/`                           | `DashboardsHeader`      |
| 1-5 campos, un solo paso           | Simple Client Form: `useForm` + `zodResolver`                | `components/` + `validations.ts`        | `DashboardDetailHeader` |
| Multi-step, 3+ pasos               | Wizard: `useFormStepper` + `StepperActions`                  | `components/Wizard/` + `validations.ts` | `WidgetWizard`          |

### Reglas

- Todos los schemas de validación en `validations.ts` del feature (Zod). Nunca inline en componentes.
- Usar los FormX wrappers de `common/components/forms/` — no crear wrappers ad-hoc.
- Multi-step siempre usa `useFormStepper` de `common/hooks/`.
- `shouldUnregister: false` obligatorio en wizards.
- Guía completa: `docs/guides/forms.md`

---

## Carpeta `common/`

**Contiene:** Solo código VERDADERAMENTE genérico sin lógica de negocio.

```
common/
├── components/
│   ├── ui/                     # shadcn/ui primitivas
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Navbar.tsx
│   │   └── PageContainer.tsx
│   │
│   └── feedback/
│       ├── Loading.tsx
│       ├── ErrorDisplay.tsx
│       └── EmptyState.tsx
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useLocalStorage.ts
│
├── utils/
│   ├── dates.ts
│   ├── formatting.ts
│   └── strings.ts
│
└── types/
    ├── api.ts                  # ApiResponse, PaginatedResponse
    └── common.ts               # ID, Timestamp, Nullable
```

**Test mental:** "¿Podría usar esto en cualquier proyecto Next.js?" → `common/`

---

## Carpeta `services/`

**Contiene:** Shared infrastructure (auth, feature flags).

```
services/
├── auth/
│   ├── session.ts              # getSession() - lee cookies
│   ├── guards.ts               # requireAuth(), requireOrg()
│   └── __tests__/
│       └── session.test.ts
└── feature-flags/
    ├── registry.ts             # FLAG_REGISTRY (type-safe)
    ├── types.ts                # FlagConfig, FlagContext
    ├── flags.ts                # decideFlag(), flag exports
    ├── context.ts              # getFlagContext()
    └── __tests__/
        └── flags.test.ts
```

**Ejemplo:**

```typescript
// services/auth/session.ts
import 'server-only';
import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  const orgId = cookieStore.get('orgId')?.value;

  if (!token) return null;
  return { token, orgId };
}
```

**Por qué compartir auth y feature flags:**

- **Auth**: Todos los features leen las mismas cookies, duplicar = riesgo de seguridad
- **Feature Flags**: Infraestructura transversal, todos los features necesitan flags
- Ambos son cross-cutting concerns, no lógica de negocio

---

## Reglas de Imports

### ✅ PERMITIDO

```typescript
// Features pueden importar de common/
import { Button } from '@/common/components/ui/Button';
import { formatDate } from '@/common/utils/dates';

// Features pueden importar de services/
import { getSession } from '@/services/auth/session';

// Features pueden importar de config/
import { env } from '@/config/env';

// Imports dentro del mismo feature (relativos)
import { dashboardsDb } from '../db/client';
import { findAllDashboards } from '../repositories/findAllDashboards';
import { createDashboard } from '../actions/createDashboard';
import { QUERY_KEYS } from '../constants';
import type { Dashboard } from '../types';

// Librerías externas
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
```

### ❌ PROHIBIDO

```typescript
// ❌ NUNCA importar de otro feature
import { getSources } from '@/features/sources/queries/getSources';

// ❌ NUNCA importar repositories de otro feature
import { findAllSources } from '@/features/sources/repositories/findAllSources';

// ❌ NUNCA importar types de otro feature
import type { Source } from '@/features/sources/types';

// ❌ Components NO importan de actions/queries directamente
// (deben usar data-hooks/)
import { getDashboards } from '../queries/getDashboards';
```

---

## Testing Strategy

### Pirámide de Tests

```
                ┌─────────────┐
                │    E2E      │  ← Playwright (real DB)
                └─────────────┘
           ┌─────────────────────┐
           │  Integration Tests  │  ← React + MSW
           └─────────────────────┘
      ┌───────────────────────────────┐
      │   Unit: Actions/Queries       │  ← Mock repositories
      └───────────────────────────────┘
 ┌─────────────────────────────────────────┐
 │     Unit: Repositories                  │  ← Mock Drizzle
 └─────────────────────────────────────────┘
```

### Coverage Targets

| Capa            | Target               |
| --------------- | -------------------- |
| `repositories/` | 90%+                 |
| `actions/`      | 85%+                 |
| `queries/`      | 80%+                 |
| `data-hooks/`   | 80%+                 |
| `components/`   | 70%+                 |
| E2E             | 5-10 flujos críticos |

### Ubicación de Tests

```
features/dashboards/
├── repositories/
│   └── __tests__/
│       └── findAllDashboards.test.ts
├── actions/
│   └── __tests__/
│       └── createDashboard.test.ts
├── queries/
│   └── __tests__/
│       └── getDashboards.test.ts
├── data-hooks/
│   └── __tests__/
│       └── useCreateDashboard.test.ts
└── __tests__/
    ├── builders.ts              # Test factories
    ├── handlers.ts              # MSW handlers
    └── DashboardsGrid.test.tsx  # Integration
```

### Ejemplo Test Repository

```typescript
// features/dashboards/repositories/__tests__/findAllDashboards.test.ts
import { describe, it, expect, vi } from 'vitest';
import { findAllDashboards } from '../findAllDashboards';
import { dashboardsDb } from '../../db/client';

vi.mock('../../db/client');

describe('findAllDashboards', () => {
  it('should fetch dashboards for organization', async () => {
    const mockDashboards = [{ id: '1', name: 'Dashboard 1', organizationId: 'org-1' }];

    vi.mocked(dashboardsDb.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockDashboards),
      }),
    });

    const result = await findAllDashboards('org-1');

    expect(result).toEqual(mockDashboards);
  });
});
```

### Ejemplo Test Action

```typescript
// features/dashboards/actions/__tests__/createDashboard.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createDashboard } from '../createDashboard';
import { insertDashboard } from '../../repositories/insertDashboard';
import { getSession } from '@/services/auth/session';

vi.mock('../../repositories/insertDashboard');
vi.mock('@/services/auth/session');
vi.mock('next/cache');

describe('createDashboard', () => {
  it('should create dashboard when authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue({ token: 'x', orgId: 'org-1' });
    vi.mocked(insertDashboard).mockResolvedValue({ id: '1', name: 'Test' });

    const result = await createDashboard({ name: 'Test' });

    expect(result.name).toBe('Test');
    expect(insertDashboard).toHaveBeenCalled();
  });

  it('should throw error when not authenticated', async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    await expect(createDashboard({ name: 'Test' })).rejects.toThrow('Unauthorized');
  });
});
```

---

## Migraciones de Base de Datos

Cada feature gestiona sus propias migraciones.

### Drizzle Config por Feature

```typescript
// features/dashboards/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './repositories/schema.ts',
  out: './repositories/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DASHBOARDS_DATABASE_URL!,
  },
});
```

### Scripts de Migración

```json
// package.json
{
  "scripts": {
    "db:generate:dashboards": "drizzle-kit generate --config=features/dashboards/drizzle.config.ts",
    "db:migrate:dashboards": "drizzle-kit migrate --config=features/dashboards/drizzle.config.ts",

    "db:generate:sources": "drizzle-kit generate --config=features/sources/drizzle.config.ts",
    "db:migrate:sources": "drizzle-kit migrate --config=features/sources/drizzle.config.ts"
  }
}
```

---

## Variables de Entorno

```typescript
// config/env.ts
export const env = {
  // Una DB por feature
  DASHBOARDS_DATABASE_URL: process.env.DASHBOARDS_DATABASE_URL!,
  SOURCES_DATABASE_URL: process.env.SOURCES_DATABASE_URL!,
  REPORTS_DATABASE_URL: process.env.REPORTS_DATABASE_URL!,
  RECONCILIATIONS_DATABASE_URL: process.env.RECONCILIATIONS_DATABASE_URL!,

  // Otras
  NODE_ENV: process.env.NODE_ENV!,
};
```

---

## Ventajas de esta Arquitectura

| Ventaja                     | Impacto                                      |
| --------------------------- | -------------------------------------------- |
| **Cero coupling**           | Cambiar un feature no rompe otros            |
| **Vibe coding**             | Desarrollar sin preocuparse por dependencias |
| **Ownership claro**         | Feature = unidad completa de ownership       |
| **Aislamiento de DBs**      | Blast radius limitado                        |
| **Menos context switching** | Todo en una carpeta                          |
| **Deploy independiente**    | (Futuro) Extraer feature = copiar carpeta    |
| **Escalabilidad**           | Cada DB escala independientemente            |

---

## Desventajas / Trade-offs

| Desafío                        | Solución                                  |
| ------------------------------ | ----------------------------------------- |
| **Duplicación de código**      | Aceptado. Prioridad = velocidad sobre DRY |
| **Bugs se replican**           | Testing exhaustivo por feature            |
| **Joins cross-DB**             | No se puede. Hacer en aplicación o APIs   |
| **Transacciones distribuidas** | Patrón Saga o compensación manual         |
| **Costo de infra**             | 5 features = 5 DBs (más caro)             |

---

## Decisiones Clave

### ¿Por qué features aislados?

- Breaking changes no cascadean
- Máxima velocidad de desarrollo
- Ideal para "vibe coding"

### ¿Por qué DBs separadas?

- Aislamiento físico (no solo lógico)
- Escalabilidad independiente
- Seguridad (breach limitado)

### ¿Por qué auth compartido?

- Todos los features leen las mismas cookies
- Duplicar auth = riesgo de seguridad
- Es infraestructura, no lógica de negocio

### ¿Por qué estructura plana (no `data/`)?

- Menos anidamiento = más fácil de navegar
- Carpetas top-level del feature = fácil de encontrar

---

## Migración desde Arquitectura Anterior

```
Antes:                          Después:
------                          --------
domains/sources/    →           features/sources/
  actions/                        actions/
  queries/                        queries/
  hooks/              →           data-hooks/
  types.ts                        types.ts
  validations.ts                  validations.ts
  constants.ts                    constants.ts
                    +             db/client.ts
services/                         repositories/
  repositories/     →
    sources/        →

features/sources/   →           features/sources/
  components/                     components/
  hooks/                          hooks/
                    +             __tests__/
```

---

## Conclusión

Esta arquitectura prioriza **velocidad de desarrollo** y **desacoplamiento** sobre DRY.

Cada feature es una **isla autónoma** que puede desarrollarse, testearse y desplegarse de forma independiente.

**Ideal para:**

- Equipos que quieren "vibe coding"
- Proyectos que priorizan velocidad sobre mantenibilidad
- Features con dominios claramente separados
- Roadmap de microservicios/microfrontends

**NO ideal para:**

- Equipos obsesionados con DRY
- Proyectos con lógica muy compartida entre features
- Equipos pequeños con presupuesto limitado (costo de DBs)
