# ADR-021: Implementation Plan

## Overview

This document tracks the implementation of the API Service Data Layer Architecture.

**Status Legend:**
- [ ] Not started
- [x] Completed
- [~] In progress
- [!] Blocked

---

## Phase 1: API Type Exports & Swagger UI

**Goal:** Add route type exports to existing routes and enable API documentation.

### 1.1 Add Swagger UI

- [ ] Install `@hono/swagger-ui`
  ```bash
  cd api && pnpm add @hono/swagger-ui
  ```

- [ ] Update `api/src/index.ts` to serve OpenAPI spec and Swagger UI
  ```typescript
  // Add these imports
  import { swaggerUI } from '@hono/swagger-ui';

  // Add after route mounting
  app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'Testimonials API',
      version: '1.0.0',
      description: 'REST API for testimonial collection, analytics, and AI features',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
    ],
    tags: [
      { name: 'Authentication', description: 'Token management' },
      { name: 'AI', description: 'AI-powered features' },
      { name: 'Media', description: 'File uploads' },
      { name: 'Analytics', description: 'Event tracking' },
    ],
  });

  app.get('/docs', swaggerUI({ url: '/openapi.json' }));
  ```

- [ ] Verify Swagger UI at `http://localhost:4000/docs`

### 1.2 Add Route Type Exports

- [ ] `api/src/routes/auth.ts` - Add type export
  ```typescript
  // At end of file
  export type AuthRoutes = typeof auth;
  ```

- [ ] `api/src/routes/ai.ts` - Add type export
  ```typescript
  export type AIRoutes = typeof ai;
  ```

- [ ] `api/src/routes/media.ts` - Add type export
  ```typescript
  export type MediaRoutes = typeof media;
  ```

- [ ] `api/src/routes/analytics.ts` - Add type export (if exists)
  ```typescript
  export type AnalyticsRoutes = typeof analytics;
  ```

### 1.3 Create Aggregated Route Exports

- [ ] Create `api/src/routes/index.ts`
  ```typescript
  // Route instances
  export { auth } from './auth';
  export { ai } from './ai';
  export { media } from './media';

  // Route types for Hono RPC
  export type { AuthRoutes } from './auth';
  export type { AIRoutes } from './ai';
  export type { MediaRoutes } from './media';
  ```

### 1.4 Verification

- [ ] Run API and verify no TypeScript errors
- [ ] Verify Swagger UI shows all documented routes
- [ ] Verify OpenAPI JSON is valid at `/openapi.json`

---

## Phase 2: Frontend Hono RPC Setup

**Goal:** Set up type-safe API client using Hono RPC.

### 2.1 Install Dependencies

- [ ] Install Hono (for client types) and TanStack Query
  ```bash
  cd apps/web && pnpm add hono @tanstack/vue-query
  ```

### 2.2 Configure TypeScript Path Alias

- [ ] Update `apps/web/tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"],
        "@api/*": ["../../api/src/*"]
      }
    }
  }
  ```

- [ ] Update `apps/web/vite.config.ts` (if needed for alias resolution)
  ```typescript
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, '../../api/src'),
    },
  },
  ```

### 2.3 Create Hono RPC Client

- [ ] Create `apps/web/src/shared/api/client.ts`
  ```typescript
  import { hc } from 'hono/client';
  import type { AuthRoutes, AIRoutes, MediaRoutes } from '@api/routes';

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  export function createApiClients(getToken: () => string | null) {
    const headers = () => {
      const token = getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    };

    return {
      auth: hc<AuthRoutes>(`${API_URL}/auth`, { headers }),
      ai: hc<AIRoutes>(`${API_URL}/ai`, { headers }),
      media: hc<MediaRoutes>(`${API_URL}/media`, { headers }),
    };
  }

  export type ApiClients = ReturnType<typeof createApiClients>;
  ```

- [ ] Create `apps/web/src/shared/api/useApi.ts`
  ```typescript
  import { createApiClients, type ApiClients } from './client';
  import { useTokenManager } from '@/shared/composables/useTokenManager';

  let apiClients: ApiClients | null = null;

  export function useApi(): ApiClients {
    if (!apiClients) {
      const { getAccessToken } = useTokenManager();
      apiClients = createApiClients(getAccessToken);
    }
    return apiClients;
  }
  ```

### 2.4 Configure TanStack Query

- [ ] Create `apps/web/src/app/providers/queryClient.ts`
  ```typescript
  import { QueryClient } from '@tanstack/vue-query';

  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 minutes
        gcTime: 30 * 60 * 1000,        // 30 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  ```

- [ ] Update `apps/web/src/main.ts` to use Vue Query
  ```typescript
  import { VueQueryPlugin } from '@tanstack/vue-query';
  import { queryClient } from '@/app/providers/queryClient';

  app.use(VueQueryPlugin, { queryClient });
  ```

### 2.5 Verification

- [ ] Verify TypeScript can resolve `@api/*` imports
- [ ] Verify `useApi()` returns typed clients
- [ ] Verify no build errors

---

## Phase 3: Migrate Existing API Composables

**Goal:** Migrate existing frontend API calls to use Hono RPC.

### 3.1 Migrate AI Composable

- [ ] Update `apps/web/src/shared/api/ai/useApiForAI.ts`

  **Before:**
  ```typescript
  import { createApiClient } from '../lib/apiClient';

  export function useApiForAI() {
    const client = createApiClient(API_BASE_URL, getAccessToken);
    return {
      async suggestQuestions(request) {
        return client.post('/ai/suggest-questions', request, { authenticated: true });
      },
    };
  }
  ```

  **After:**
  ```typescript
  import { useApi } from '../useApi';

  export function useApiForAI() {
    const api = useApi();
    return {
      async suggestQuestions(request: SuggestQuestionsRequest) {
        const res = await api.ai['suggest-questions'].$post({ json: request });
        if (!res.ok) throw new Error('Failed to suggest questions');
        return res.json();
      },
      async assembleTestimonial(request: AssembleTestimonialRequest) {
        const res = await api.ai.assemble.$post({ json: request });
        if (!res.ok) throw new Error('Failed to assemble testimonial');
        return res.json();
      },
    };
  }
  ```

- [ ] Test AI features still work (form builder, testimonial assembly)

### 3.2 Verify Other Composables

- [ ] Audit other files in `apps/web/src/shared/api/` for migration needs
- [ ] List any other composables that need migration:
  - [ ] _____________________
  - [ ] _____________________

### 3.3 Keep Legacy Client (Temporary)

- [ ] Keep `apps/web/src/shared/api/lib/apiClient.ts` for gradual migration
- [ ] Add deprecation comment to file
  ```typescript
  /**
   * @deprecated Use useApi() from '@/shared/api/useApi' instead.
   * This file will be removed after full migration to Hono RPC.
   */
  ```

---

## Phase 4: Drizzle ORM Foundation

**Goal:** Set up Drizzle ORM for complex database queries.

### 4.1 Install Dependencies

- [ ] Install Drizzle and PostgreSQL driver
  ```bash
  cd api && pnpm add drizzle-orm postgres
  pnpm add -D drizzle-kit
  ```

### 4.2 Create Database Client

- [ ] Create `api/src/db/index.ts`
  ```typescript
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from './schema';

  const connectionString = process.env.DATABASE_URL!;

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  export const db = drizzle(client, { schema });
  export type DrizzleClient = typeof db;
  export { client };
  ```

- [ ] Create `api/src/db/test-client.ts`
  ```typescript
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from './schema';

  const testClient = postgres(process.env.TEST_DATABASE_URL!);
  export const testDb = drizzle(testClient, { schema });
  ```

### 4.3 Configure Drizzle Introspection

We use database introspection to generate base schemas, then add JSONB type enhancements manually.

- [ ] Create `api/drizzle.config.ts`
  ```typescript
  import { defineConfig } from 'drizzle-kit';

  export default defineConfig({
    dialect: 'postgresql',
    out: './src/db/schema/generated',
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
    // Only introspect tables Drizzle needs
    tablesFilter: [
      'form_analytics_events',
      'testimonials',
      'forms',
    ],
  });
  ```

- [ ] Run initial introspection to generate base schemas
  ```bash
  cd api && pnpm drizzle-kit introspect
  ```

- [ ] Create `api/src/db/schema/index.ts` with type enhancements
  ```typescript
  import {
    formAnalyticsEvents as _formAnalyticsEvents,
    testimonials as _testimonials,
    forms as _forms,
  } from './generated';
  import type { EventData } from '@testimonials/core';

  // Re-export with JSONB type annotations
  export const formAnalyticsEvents = {
    ..._formAnalyticsEvents,
    eventData: _formAnalyticsEvents.eventData.$type<EventData>(),
  };

  // Tables without JSONB can be re-exported directly
  export { _testimonials as testimonials, _forms as forms };

  // Type inference
  export type FormAnalyticsEvent = typeof formAnalyticsEvents.$inferSelect;
  export type NewFormAnalyticsEvent = typeof formAnalyticsEvents.$inferInsert;
  export type Testimonial = typeof _testimonials.$inferSelect;
  export type Form = typeof _forms.$inferSelect;
  ```

### 4.4 Schema Sync Tooling

- [ ] Create `api/scripts/validate-drizzle-schema.ts`
  ```typescript
  import { sql } from 'drizzle-orm';
  import { db } from '../src/db';
  import * as schema from '../src/db/schema';

  const DRIZZLE_TABLES = ['form_analytics_events', 'testimonials', 'forms'];

  async function validateSchema() {
    const errors: string[] = [];

    const result = await db.execute(sql`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY(${DRIZZLE_TABLES})
      ORDER BY table_name, ordinal_position
    `);

    const dbColumns = result.rows as Array<{
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }>;

    const dbColumnMap = new Map<string, typeof dbColumns[0]>();
    for (const col of dbColumns) {
      dbColumnMap.set(`${col.table_name}.${col.column_name}`, col);
    }

    const schemaEntries = {
      form_analytics_events: schema.formAnalyticsEvents,
      testimonials: schema.testimonials,
      forms: schema.forms,
    };

    for (const [tableName, table] of Object.entries(schemaEntries)) {
      const columns = Object.entries(table).filter(
        ([key]) => !key.startsWith('_') && key !== '$inferSelect' && key !== '$inferInsert'
      );

      for (const [, colDef] of columns) {
        if (typeof colDef !== 'object' || !('name' in colDef)) continue;
        const key = `${tableName}.${colDef.name}`;
        if (!dbColumnMap.get(key)) {
          errors.push(`Column in Drizzle but not in DB: ${key}`);
        }
      }

      const drizzleColNames = new Set(
        columns
          .filter(([, def]) => typeof def === 'object' && 'name' in def)
          .map(([, def]) => (def as { name: string }).name)
      );

      for (const dbCol of dbColumns.filter(c => c.table_name === tableName)) {
        if (!drizzleColNames.has(dbCol.column_name)) {
          errors.push(`Column in DB but not in Drizzle: ${tableName}.${dbCol.column_name}`);
        }
      }
    }

    if (errors.length > 0) {
      console.error('❌ Schema validation failed:');
      errors.forEach(e => console.error(`  - ${e}`));
      process.exit(1);
    }

    console.log('✅ Drizzle schema matches database');
  }

  validateSchema().catch(console.error);
  ```

- [ ] Add scripts to `api/package.json`
  ```json
  {
    "scripts": {
      "db:introspect": "drizzle-kit introspect",
      "db:validate": "tsx scripts/validate-drizzle-schema.ts",
      "db:sync": "pnpm db:introspect && pnpm db:validate"
    }
  }
  ```

### 4.5 Add Graceful Shutdown

- [ ] Update `api/src/index.ts` to handle shutdown
  ```typescript
  import { client } from './db';

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await client.end();
    process.exit(0);
  });
  ```

### 4.6 Verification

- [ ] Verify database connection works
- [ ] Verify schema types are correctly inferred
- [ ] Run a test query to validate setup
- [ ] Run `pnpm db:validate` successfully
- [ ] Verify `pnpm db:introspect` regenerates schemas correctly

---

## Phase 5: Documentation & Cleanup

**Goal:** Finalize documentation and clean up deprecated code.

### 5.1 Update CLAUDE.md

- [ ] Add section about Hasura vs Drizzle decision tree
- [ ] Add section about Hono RPC usage
- [ ] Add section about TanStack Query usage

### 5.2 Deprecation Cleanup

- [ ] Remove `apps/web/src/shared/api/lib/apiClient.ts` (after full migration)
- [ ] Remove manual type definitions that are now inferred
- [ ] Clean up unused API config constants

### 5.3 Final Verification

- [ ] All existing features still work
- [ ] No TypeScript errors
- [ ] Swagger UI shows all endpoints

---

## Notes

### Dependencies Summary

**API:**
```json
{
  "dependencies": {
    "@hono/swagger-ui": "^x.x.x",
    "drizzle-orm": "^0.38.x",
    "postgres": "^3.4.x"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.x",
    "tsx": "^4.x"
  }
}
```

**Web:**
```json
{
  "dependencies": {
    "hono": "^4.x.x",
    "@tanstack/vue-query": "^5.x"
  }
}
```

### Environment Variables

```bash
# API
DATABASE_URL=postgresql://user:pass@localhost:5432/testimonials
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/testimonials_test

# Web (already exists)
VITE_API_BASE_URL=http://localhost:4000
```

---

## Progress Tracking

| Phase | Status | Completed Date |
|-------|--------|----------------|
| Phase 1: API Type Exports & Swagger | [x] Completed | 2026-01-25 |
| Phase 2: Frontend Hono RPC Setup | [x] Completed | 2026-01-25 |
| Phase 3: Migrate API Composables | [x] Completed | 2026-01-25 |
| Phase 4: Drizzle ORM + Schema Sync | [x] Completed | 2026-01-25 |
| Phase 5: Documentation & Cleanup | [x] Completed | 2026-01-25 |

### Phase 4 Breakdown

| Task | Status |
|------|--------|
| 4.1 Install Dependencies | [x] |
| 4.2 Create Database Client | [x] |
| 4.3 Configure Drizzle Introspection | [x] |
| 4.4 Schema Sync Tooling | [x] |
| 4.5 Graceful Shutdown | [x] |
| 4.6 Verification | [x] |

### Implementation Notes

**Phase 1:** Route type exports added to `auth.ts`, `ai.ts`, `media.ts`, `analytics.ts`. Barrel exports created in `routes/index.ts`. Swagger UI already existed via `@scalar/hono-api-reference` at `/docs`.

**Phase 2:** Dependencies installed (`hono`, `@tanstack/vue-query`). Path aliases configured with TypeScript project references for proper cross-package type resolution. RPC client created with fetch-based approach since OpenAPIHono doesn't expose full route types for Hono RPC.

**Phase 3:** `useApiForAI.ts` migrated to use the new RPC client's fetch method. Old `apiClient.ts` marked as deprecated.

**Phase 4:** Drizzle ORM installed with `postgres` driver. Database client created in `api/src/db/`. Schema generation via introspection configured. Graceful shutdown handlers added for SIGTERM/SIGINT.

**Phase 5:** Documentation updated. Decision tree added to CLAUDE.md.
