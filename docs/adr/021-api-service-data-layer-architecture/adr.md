# ADR-021: API Service Data Layer Architecture

## Doc Connections
**ID**: `adr-021-api-service-data-layer-architecture`

2026-01-24 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-022-form-dashboard` - First consumer of data layer
- `adr-018-form-persistence-analytics` - Analytics data source

---

## Status

**Accepted** - 2026-01-25

### Scope

This ADR covers:
1. **Drizzle ORM** - Type-safe SQL for complex queries
2. **Hono RPC** - End-to-end type safety between API and frontend
3. **TanStack Query** - Frontend data fetching and caching
4. **Swagger UI** - API documentation
5. **Type synchronization** - Strategy for sharing types across layers

---

## Context

### The Problem

Our stack uses Hasura for GraphQL auto-generation from PostgreSQL. This works excellently for CRUD operations and entity queries. However, **any operation beyond basic CRUD** often requires SQL capabilities that Hasura cannot express natively.

**Examples of operations Hasura struggles with:**

```sql
-- 1. Analytics: Session-based aggregations
SELECT
  session_id,
  MIN(created_at) as started,
  MAX(created_at) as ended,
  ARRAY_AGG(event_type ORDER BY created_at) as event_sequence
FROM form_analytics_events
GROUP BY session_id;

-- 2. Bulk operations: Update with complex conditions
UPDATE testimonials
SET status = 'archived'
WHERE form_id = $1
  AND status = 'pending'
  AND created_at < NOW() - INTERVAL '90 days'
RETURNING id, status;

-- 3. Search: Full-text with ranking
SELECT id, name, ts_rank(search_vector, query) as rank
FROM forms, plainto_tsquery($1) query
WHERE search_vector @@ query
ORDER BY rank DESC;

-- 4. Computed results: Aggregates with conditionals
SELECT
  form_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE rating >= 4) as positive,
  AVG(rating) as avg_rating
FROM testimonials
GROUP BY form_id
HAVING COUNT(*) >= 5;
```

**Hasura limitations for non-trivial operations:**
- No `GROUP BY` with custom aggregations
- No window functions (`ROW_NUMBER`, `LAG`, `LEAD`)
- No `FILTER` clauses in aggregates
- No `ARRAY_AGG` with ordering
- No bulk updates with `RETURNING`
- No full-text search with ranking
- No CTEs (Common Table Expressions)
- No recursive queries
- Would require PostgreSQL functions exposed as Hasura actions (adds complexity)

### Use Cases Requiring Direct SQL

| Category | Use Case | Why Hasura Struggles |
|----------|----------|---------------------|
| **Analytics** | Dashboard metrics | Session-based GROUP BY aggregations |
| **Analytics** | Conversion funnel | Step progression with drop-off calculation |
| **Analytics** | Time-series reports | Window functions, date binning |
| **Bulk Operations** | Archive old records | UPDATE with complex WHERE + RETURNING |
| **Bulk Operations** | Batch status changes | Multi-row updates with conditions |
| **Search** | Full-text search | `ts_rank`, `plainto_tsquery` |
| **Search** | Fuzzy matching | `pg_trgm`, similarity scoring |
| **Reports** | CSV/Excel exports | Large result sets with streaming |
| **Reports** | Audit trails | Complex JOINs across tables |
| **Computed** | Leaderboards | Window functions for ranking |
| **Computed** | Duplicate detection | Self-joins with similarity |
| **Migrations** | Data backfills | Bulk INSERT...SELECT |

### Requirements

1. **Type Safety** - Full TypeScript inference for queries
2. **SQL Power** - Support complex aggregations, window functions
3. **Hasura Coexistence** - No conflicts, clear responsibility split
4. **Authentication** - Integrate with existing JWT flow
5. **Multi-tenancy** - Enforce organization isolation
6. **Developer Experience** - Familiar patterns, good tooling

---

## Decision

Integrate **Drizzle ORM** for direct SQL queries in the Hono API layer, alongside **TanStack Query** for frontend data fetching.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Vue App                                                   │
│   │                                                         │
│   ├── Apollo Client ────────▶ Hasura GraphQL ──────────┐    │
│   │   • Entity CRUD (create, read, update, delete)     │    │
│   │   • Real-time subscriptions                        │    │
│   │   • Normalized caching                             ▼    │
│   │                                              PostgreSQL │
│   │                                                    ▲    │
│   └── TanStack Query ───────▶ Hono REST API ───────────┘    │
│       • Complex queries            │                        │
│       • Bulk operations            │ Drizzle ORM            │
│       • Aggregations/Reports       │ (type-safe SQL)        │
│       • Search                     │                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Responsibility Split

**Rule of thumb:** If Hasura can do it with a simple query/mutation → use Hasura. Otherwise → use Drizzle.

| Operation Type | Technology | Examples |
|----------------|------------|----------|
| **Entity CRUD** | Hasura GraphQL | Create form, update testimonial, delete widget |
| **Simple filters** | Hasura GraphQL | Get forms by org, filter testimonials by status |
| **Real-time updates** | Hasura Subscriptions | Live testimonial feed, form status changes |
| **Entity caching** | Apollo Client | Normalized cache by entity ID |
| **Aggregations** | Drizzle ORM | Dashboard stats, conversion funnels, averages |
| **Bulk operations** | Drizzle ORM | Archive old records, batch status updates |
| **Complex queries** | Drizzle ORM | Window functions, CTEs, recursive queries |
| **Search** | Drizzle ORM | Full-text search with ranking, fuzzy match |
| **Reports/Exports** | Drizzle ORM | CSV generation, large result streaming |
| **Data migrations** | Drizzle ORM | Backfills, data transformations |
| **REST response caching** | TanStack Query | Stale-while-revalidate for API responses |

### Decision Tree: Hasura vs Drizzle

```
Is it basic CRUD on a single entity?
├── YES → Use Hasura GraphQL
└── NO
    │
    ├── Does it need GROUP BY with custom aggregations?
    │   └── YES → Use Drizzle
    │
    ├── Does it need window functions (ROW_NUMBER, LAG, etc.)?
    │   └── YES → Use Drizzle
    │
    ├── Does it need bulk UPDATE/DELETE with RETURNING?
    │   └── YES → Use Drizzle
    │
    ├── Does it need full-text search with ranking?
    │   └── YES → Use Drizzle
    │
    ├── Does it need to stream large result sets?
    │   └── YES → Use Drizzle
    │
    ├── Does it need CTEs or recursive queries?
    │   └── YES → Use Drizzle
    │
    └── Can Hasura express it with where/order_by/limit?
        ├── YES → Use Hasura GraphQL
        └── NO → Use Drizzle
```

### Why Drizzle ORM?

Evaluated against alternatives:

| Criteria | Drizzle | Prisma | Kysely | Raw SQL |
|----------|---------|--------|--------|---------|
| Type Safety | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Complex Aggregations | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bundle Size | 7kb | 2MB | 50kb | 0 |
| Learning Curve | Low | Medium | Low | None |
| SQL Familiarity | High | Low | High | Perfect |
| Hasura Coexistence | ✅ | ⚠️ | ✅ | ✅ |

**Drizzle advantages:**
- SQL-first design - queries look like SQL
- Full TypeScript inference from schema definitions
- Lightweight runtime (~7kb)
- No schema sync conflicts with Hasura
- Excellent aggregation support

### Why TanStack Query (Not Apollo) for REST Endpoints?

Data from Drizzle/Hono endpoints is typically **computed results** or **aggregates**, not **entity data**. Apollo's normalized cache doesn't benefit these patterns:

| Apollo Feature | Helps Drizzle Responses? | Why |
|----------------|--------------------------|-----|
| Entity normalization | ❌ No | Returns computed data, not entities with IDs |
| Optimistic updates | ❌ Rarely | Most Drizzle queries are read-heavy |
| Cache on mutation | ❌ No | Drizzle responses aren't Apollo-managed entities |
| Subscriptions | ❌ No | REST endpoints, not GraphQL |

**When to use which:**

| Data Type | Caching Layer | Example |
|-----------|---------------|---------|
| Entity data (forms, testimonials) | Apollo Client | `useGetFormQuery()` |
| Computed/aggregate data | TanStack Query | `useFormDashboard()` |
| Search results | TanStack Query | `useSearchForms()` |
| Bulk operation results | TanStack Query | `useArchiveOldRecords()` |

**TanStack Query benefits:**
- Stale-while-revalidate caching
- Request deduplication
- Background refetching
- Simple cache invalidation
- Works with any fetch function

---

## Authentication & Authorization

### Authentication Flow

Drizzle queries run within authenticated Hono API routes. The existing JWT validation middleware extracts user context:

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│ Hono Router  │────▶│  Auth MW     │────▶│ Drizzle  │
│  (JWT)   │     │              │     │ (validate)   │     │ (query)  │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                             │
                                      Extract from JWT:
                                      • user_id
                                      • organization_id
                                      • role
```

### Authentication Middleware

```typescript
// api/src/middleware/auth.ts
import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export interface AuthContext {
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verify(token, process.env.JWT_SECRET!);

    // Extract Hasura claims
    const claims = payload['https://hasura.io/jwt/claims'] as Record<string, string>;

    c.set('auth', {
      userId: claims['x-hasura-user-id'],
      organizationId: claims['x-hasura-organization-id'],
      role: claims['x-hasura-role'],
    } as AuthContext);

    await next();
  } catch {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
```

### Authorization Pattern

**All Drizzle queries MUST include organization_id filter.** This enforces tenant isolation:

```typescript
// ✅ CORRECT: Always filter by organization
export async function getSessionStats(
  db: DrizzleClient,
  formId: string,
  organizationId: string  // From auth context
) {
  return db
    .select({ ... })
    .from(formAnalyticsEvents)
    .where(
      and(
        eq(formAnalyticsEvents.formId, formId),
        eq(formAnalyticsEvents.organizationId, organizationId)  // REQUIRED
      )
    );
}

// ❌ WRONG: Missing organization filter
export async function getSessionStats(db: DrizzleClient, formId: string) {
  return db
    .select({ ... })
    .from(formAnalyticsEvents)
    .where(eq(formAnalyticsEvents.formId, formId));  // NO! Cross-tenant leak
}
```

### Route Pattern

```typescript
// api/src/features/dashboard/routes.ts
import { Hono } from 'hono';
import { authMiddleware, AuthContext } from '@/middleware/auth';
import { getSessionStats } from './getSessionStats';

const dashboard = new Hono();

dashboard.use('/*', authMiddleware);

dashboard.get('/forms/:formId/dashboard', async (c) => {
  const { formId } = c.req.param();
  const { organizationId } = c.get('auth') as AuthContext;
  const days = parseInt(c.req.query('days') ?? '30');

  const stats = await getSessionStats(db, formId, organizationId, days);

  return c.json(stats);
});

export { dashboard };
```

---

## Schema Management

### Approach: Manual Schema with Type Inference

Rather than introspecting from the database, we define Drizzle schemas manually. This provides:

1. **Explicit contracts** - Schema is code-reviewed
2. **Selective exposure** - Only define tables Drizzle needs
3. **Custom types** - Add Zod validation for JSONB fields
4. **No DB dependency** - Works without running database

### Schema Structure

```
api/src/db/
├── index.ts                    # Drizzle client instance
├── schema/
│   ├── index.ts                # Barrel export
│   ├── formAnalyticsEvents.ts  # Analytics events
│   ├── testimonials.ts         # For rating queries
│   └── forms.ts                # Form metadata
└── types.ts                    # Shared types
```

### Schema Definition Pattern

```typescript
// api/src/db/schema/formAnalyticsEvents.ts
import { pgTable, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const formAnalyticsEvents = pgTable('form_analytics_events', {
  id: text('id').primaryKey(),
  formId: text('form_id').notNull(),
  organizationId: text('organization_id').notNull(),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type').notNull().$type<
    'form_started' | 'step_completed' | 'form_submitted' | 'form_abandoned'
  >(),
  stepIndex: integer('step_index'),
  stepId: text('step_id'),
  stepType: text('step_type'),
  eventData: jsonb('event_data').$type<EventData>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type inference
export type FormAnalyticsEvent = typeof formAnalyticsEvents.$inferSelect;
export type NewFormAnalyticsEvent = typeof formAnalyticsEvents.$inferInsert;
```

### JSONB Field Types

For JSONB columns, use Zod schemas from `@testimonials/core`:

```typescript
// api/src/db/schema/formAnalyticsEvents.ts
import { EventDataSchema, type EventData } from '@testimonials/core';

export const formAnalyticsEvents = pgTable('form_analytics_events', {
  // ...
  eventData: jsonb('event_data').$type<EventData>(),
});

// Validate on read if needed
function parseEventData(raw: unknown): EventData | null {
  const result = EventDataSchema.safeParse(raw);
  return result.success ? result.data : null;
}
```

### Keeping Schema in Sync

| Trigger | Action |
|---------|--------|
| New Hasura migration | Update corresponding Drizzle schema |
| Column rename | Update both Hasura metadata + Drizzle |
| New table for analytics | Add Drizzle schema only if needed |

**Note:** Not all tables need Drizzle schemas. Only define schemas for tables accessed via Drizzle (analytics, reports).

### Schema Sync Tooling

Maintaining two schema definitions (Hasura migrations and Drizzle schemas) creates drift risk. We use a **hybrid approach**: Drizzle introspection for base schemas + manual type enhancements for JSONB fields.

#### Approach: Introspect + Manual Types

```
┌─────────────────────────────────────────────────────────────┐
│                    Schema Sync Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Developer creates Hasura migration                      │
│     └── db/hasura/migrations/xxx_add_column.sql             │
│                                                             │
│  2. Apply migration locally                                 │
│     └── hasura migrate apply                                │
│                                                             │
│  3. Regenerate Drizzle schema                               │
│     └── pnpm db:introspect                                  │
│                                                             │
│  4. Update JSONB types if needed                            │
│     └── Edit api/src/db/schema/index.ts                     │
│                                                             │
│  5. CI validates schemas match                              │
│     └── pnpm db:validate                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### File Structure

Keep generated schemas separate from hand-written type enhancements:

```
api/src/db/schema/
├── generated/           # Auto-generated by drizzle-kit introspect
│   ├── formAnalyticsEvents.ts
│   ├── testimonials.ts
│   └── forms.ts
├── index.ts             # Combines generated + type enhancements
└── types.ts             # Shared types
```

#### Drizzle Configuration

```typescript
// api/drizzle.config.ts
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

#### Combining Generated + Type Enhancements

```typescript
// api/src/db/schema/index.ts
import {
  formAnalyticsEvents as _formAnalyticsEvents,
  testimonials as _testimonials,
  forms as _forms,
} from './generated';
import type { EventData } from '@testimonials/core';

// Re-export with JSONB type annotations
export const formAnalyticsEvents = {
  ..._formAnalyticsEvents,
  // Override eventData with proper type (lost during introspection)
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

#### CI Schema Validation

```typescript
// api/scripts/validate-drizzle-schema.ts
import { sql } from 'drizzle-orm';
import { db } from '../src/db';
import * as schema from '../src/db/schema';

const DRIZZLE_TABLES = ['form_analytics_events', 'testimonials', 'forms'];

async function validateSchema() {
  const errors: string[] = [];

  // Get actual columns from database
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

  // Build lookup map
  const dbColumnMap = new Map<string, typeof dbColumns[0]>();
  for (const col of dbColumns) {
    dbColumnMap.set(`${col.table_name}.${col.column_name}`, col);
  }

  // Compare against Drizzle schema definitions
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
      const dbCol = dbColumnMap.get(key);

      if (!dbCol) {
        errors.push(`Column in Drizzle but not in DB: ${key}`);
      }
    }

    // Check for columns in DB but not in Drizzle
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

#### Package Scripts

```json
// api/package.json
{
  "scripts": {
    "db:introspect": "drizzle-kit introspect",
    "db:validate": "tsx scripts/validate-drizzle-schema.ts",
    "db:sync": "pnpm db:introspect && pnpm db:validate"
  }
}
```

#### When to Run

| Scenario | Command |
|----------|---------|
| After creating Hasura migration | `pnpm db:sync` |
| Before committing schema changes | `pnpm db:validate` |
| After pulling changes with migrations | `pnpm db:sync` |

---

## Connection Management

### Database Client Setup

```typescript
// api/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection with sensible defaults
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: 10,                    // Max connections in pool
  idle_timeout: 20,           // Close idle connections after 20s
  connect_timeout: 10,        // Connection timeout
  prepare: false,             // Disable prepared statements (for pgbouncer)
});

export const db = drizzle(client, { schema });
export type DrizzleClient = typeof db;
```

### Environment Configuration

```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/testimonials

# For connection pooling (production)
DATABASE_URL=postgresql://user:pass@pgbouncer:6432/testimonials?pgbouncer=true
```

### Graceful Shutdown

```typescript
// api/src/index.ts
import { client } from './db';

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await client.end();
  process.exit(0);
});
```

---

## Query Patterns

### Basic Aggregation

```typescript
import { db } from '@/db';
import { formAnalyticsEvents } from '@/db/schema';
import { eq, and, gte, sql, count, countDistinct } from 'drizzle-orm';

export async function getSessionStats(
  formId: string,
  organizationId: string,
  days: number
) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      totalSessions: countDistinct(formAnalyticsEvents.sessionId),
      completedSessions: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${formAnalyticsEvents.eventType} = 'form_submitted'
          THEN ${formAnalyticsEvents.sessionId}
        END)
      `,
      abandonedSessions: sql<number>`
        COUNT(DISTINCT CASE
          WHEN ${formAnalyticsEvents.eventType} = 'form_abandoned'
          THEN ${formAnalyticsEvents.sessionId}
        END)
      `,
    })
    .from(formAnalyticsEvents)
    .where(
      and(
        eq(formAnalyticsEvents.formId, formId),
        eq(formAnalyticsEvents.organizationId, organizationId),
        gte(formAnalyticsEvents.createdAt, since)
      )
    );

  return result[0];
}
```

### JSONB Field Access

```typescript
// Access nested JSONB fields
const deviceBreakdown = await db
  .select({
    isMobile: sql<boolean>`
      COALESCE((${formAnalyticsEvents.eventData}->'device'->>'isMobile')::boolean, false)
    `,
    sessions: countDistinct(formAnalyticsEvents.sessionId),
  })
  .from(formAnalyticsEvents)
  .where(
    and(
      eq(formAnalyticsEvents.formId, formId),
      eq(formAnalyticsEvents.organizationId, organizationId),
      eq(formAnalyticsEvents.eventType, 'form_started')
    )
  )
  .groupBy(sql`${formAnalyticsEvents.eventData}->'device'->>'isMobile'`);
```

### Window Functions

```typescript
// Funnel with step-over-step drop-off
const funnel = await db.execute(sql`
  WITH step_counts AS (
    SELECT
      step_index,
      step_type,
      COUNT(DISTINCT session_id) as sessions
    FROM form_analytics_events
    WHERE form_id = ${formId}
      AND organization_id = ${organizationId}
      AND event_type IN ('form_started', 'step_completed')
    GROUP BY step_index, step_type
  )
  SELECT
    step_index,
    step_type,
    sessions,
    LAG(sessions) OVER (ORDER BY step_index) as prev_sessions,
    ROUND(
      (1 - sessions::numeric / NULLIF(LAG(sessions) OVER (ORDER BY step_index), 0)) * 100,
      1
    ) as dropoff_percent
  FROM step_counts
  ORDER BY step_index
`);
```

### Bulk Operations

```typescript
// Archive old pending testimonials (bulk UPDATE with RETURNING)
import { testimonials } from '@/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';

export async function archiveOldPendingTestimonials(
  organizationId: string,
  olderThanDays: number = 90
): Promise<{ archivedCount: number; archivedIds: string[] }> {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const result = await db
    .update(testimonials)
    .set({
      status: 'archived',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(testimonials.organizationId, organizationId),
        eq(testimonials.status, 'pending'),
        lt(testimonials.createdAt, cutoffDate)
      )
    )
    .returning({ id: testimonials.id });

  return {
    archivedCount: result.length,
    archivedIds: result.map(r => r.id),
  };
}
```

### Full-Text Search

```typescript
// Search forms with ranking
import { forms } from '@/db/schema';
import { sql, desc } from 'drizzle-orm';

export async function searchForms(
  organizationId: string,
  query: string,
  limit: number = 20
) {
  // Assuming forms table has a search_vector tsvector column
  const results = await db
    .select({
      id: forms.id,
      name: forms.name,
      slug: forms.slug,
      rank: sql<number>`ts_rank(search_vector, plainto_tsquery(${query}))`,
    })
    .from(forms)
    .where(
      and(
        eq(forms.organizationId, organizationId),
        sql`search_vector @@ plainto_tsquery(${query})`
      )
    )
    .orderBy(desc(sql`ts_rank(search_vector, plainto_tsquery(${query}))`))
    .limit(limit);

  return results;
}
```

### Batch Insert with Conflict Handling

```typescript
// Upsert multiple records (e.g., importing testimonials)
import { testimonials } from '@/db/schema';

export async function upsertTestimonials(
  organizationId: string,
  records: NewTestimonial[]
) {
  const result = await db
    .insert(testimonials)
    .values(records.map(r => ({ ...r, organizationId })))
    .onConflictDoUpdate({
      target: [testimonials.externalId],  // Unique constraint
      set: {
        content: sql`EXCLUDED.content`,
        rating: sql`EXCLUDED.rating`,
        updatedAt: new Date(),
      },
    })
    .returning({ id: testimonials.id });

  return result;
}
```

### Computed Statistics with Grouping

```typescript
// Get testimonial stats per form (for org overview)
export async function getTestimonialStatsByForm(organizationId: string) {
  const stats = await db
    .select({
      formId: testimonials.formId,
      formName: forms.name,
      total: count(),
      approved: sql<number>`COUNT(*) FILTER (WHERE ${testimonials.status} = 'approved')`,
      pending: sql<number>`COUNT(*) FILTER (WHERE ${testimonials.status} = 'pending')`,
      avgRating: sql<number>`ROUND(AVG(${testimonials.rating})::numeric, 1)`,
      latestAt: sql<Date>`MAX(${testimonials.createdAt})`,
    })
    .from(testimonials)
    .innerJoin(forms, eq(testimonials.formId, forms.id))
    .where(eq(testimonials.organizationId, organizationId))
    .groupBy(testimonials.formId, forms.name)
    .having(sql`COUNT(*) >= 1`)
    .orderBy(desc(sql`MAX(${testimonials.createdAt})`));

  return stats;
}
```

---

## Error Handling

### Query Error Pattern

```typescript
// api/src/features/dashboard/getSessionStats.ts
import { DatabaseError } from '@/db/errors';

export async function getSessionStats(
  formId: string,
  organizationId: string,
  days: number
): Promise<SessionStats> {
  try {
    const result = await db.select({ ... }).from(...);
    return result[0] ?? defaultStats();
  } catch (error) {
    // Log for debugging
    console.error('getSessionStats failed:', { formId, organizationId, error });

    // Return safe default rather than throwing
    return defaultStats();
  }
}

function defaultStats(): SessionStats {
  return {
    totalSessions: 0,
    completedSessions: 0,
    abandonedSessions: 0,
  };
}
```

### Route Error Handling

```typescript
// api/src/features/dashboard/routes.ts
dashboard.get('/forms/:formId/dashboard', async (c) => {
  try {
    const { formId } = c.req.param();
    const { organizationId } = c.get('auth') as AuthContext;

    const stats = await getSessionStats(formId, organizationId, 30);

    return c.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard endpoint error:', error);
    return c.json({ success: false, error: 'Failed to load dashboard' }, 500);
  }
});
```

---

## Testing Strategy

### Unit Testing Queries

```typescript
// api/src/features/dashboard/__tests__/getSessionStats.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/test-client';  // Test database
import { formAnalyticsEvents } from '@/db/schema';
import { getSessionStats } from '../getSessionStats';

describe('getSessionStats', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.delete(formAnalyticsEvents);
  });

  it('counts unique sessions', async () => {
    // Insert test data
    await db.insert(formAnalyticsEvents).values([
      { id: '1', formId: 'form1', organizationId: 'org1', sessionId: 's1', eventType: 'form_started' },
      { id: '2', formId: 'form1', organizationId: 'org1', sessionId: 's1', eventType: 'form_submitted' },
      { id: '3', formId: 'form1', organizationId: 'org1', sessionId: 's2', eventType: 'form_started' },
    ]);

    const stats = await getSessionStats('form1', 'org1', 30);

    expect(stats.totalSessions).toBe(2);
    expect(stats.completedSessions).toBe(1);
  });

  it('respects organization isolation', async () => {
    await db.insert(formAnalyticsEvents).values([
      { id: '1', formId: 'form1', organizationId: 'org1', sessionId: 's1', eventType: 'form_started' },
      { id: '2', formId: 'form1', organizationId: 'org2', sessionId: 's2', eventType: 'form_started' },
    ]);

    const stats = await getSessionStats('form1', 'org1', 30);

    expect(stats.totalSessions).toBe(1);  // Only org1's session
  });
});
```

### Test Database Setup

```typescript
// api/src/db/test-client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const testClient = postgres(process.env.TEST_DATABASE_URL!);
export const db = drizzle(testClient, { schema });
```

---

## Type Synchronization & Documentation

### Current State

The API already uses `@hono/zod-openapi` with `createRoute()` for some endpoints. The frontend uses a custom `createApiClient()` fetch wrapper in `apps/web/src/shared/api/`.

### Strategy: zod-openapi + Hono RPC + Swagger UI

```
┌─────────────────────────────────────────────────────────────┐
│                    Type & Doc Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  @hono/zod-openapi (Already in use)                         │
│       │                                                     │
│       ├──────────────▶ OpenAPI Spec (/api/openapi.json)     │
│       │                      │                              │
│       │                      ▼                              │
│       │               Swagger UI (/api/docs)                │
│       │               (API Documentation)                   │
│       │                                                     │
│       └──────────────▶ Route Type Exports                   │
│                              │                              │
│                              ▼                              │
│                        Hono RPC Client (hc)                 │
│                        (End-to-end type safety)             │
│                                                             │
│  @testimonials/core                                         │
│       └──────────────▶ Shared Domain Schemas                │
│                        (JSONB, enums, domain types)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What Each Layer Provides

| Layer | Provides | Used By |
|-------|----------|---------|
| **@hono/zod-openapi** | Route schemas, validation, OpenAPI spec | API routes |
| **Hono RPC (hc)** | Type-safe client from route types | Frontend |
| **@testimonials/core** | JSONB schemas, domain types | Both API & Frontend |
| **Swagger UI** | Interactive API documentation | Developers |

### Schema Ownership: Source of Truth

**Critical:** Different schema types have different sources of truth.

| Schema Type | Source of Truth | Why |
|-------------|-----------------|-----|
| **JSONB/DB data structures** | `@testimonials/core` | Shared: API validates on write, frontend may parse on read |
| **API request/response** | `api/` (zod-openapi) | Only API defines its contract |
| **Domain enums/constants** | `@testimonials/core` | Shared business logic across layers |

```
┌─────────────────────────────────────────────────────────────┐
│                    Schema Ownership Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  @testimonials/core (SOURCE OF TRUTH: Data Structures)      │
│  └── DeviceInfoSchema, GeoInfoSchema, EventDataSchema       │
│      MetricSentiment, Period, DateRange                     │
│      (Data that lives in PostgreSQL JSONB)                  │
│                   │                                         │
│                   │ imports & composes                      │
│                   ▼                                         │
│  API schemas (SOURCE OF TRUTH: API Contract)                │
│  └── TrackEventRequestSchema = z.object({                   │
│        formId: z.string(),                                  │
│        eventData: EventDataSchema,  ◄── composed from core  │
│      }).openapi('TrackEventRequest')                        │
│                   │                                         │
│                   │ Hono RPC infers types                   │
│                   ▼                                         │
│  Frontend (NO schemas defined - all inferred)               │
│  └── Types come from:                                       │
│      • Hono RPC client (API request/response)               │
│      • @testimonials/core (domain types for display)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example: Analytics Event Tracking

This example shows the complete flow from database schema to frontend usage.

**Step 1: Define JSONB schema in Core (Source of Truth for DB data)**

```typescript
// packages/libs/core/src/schemas/db/form_analytics_events/event_data/deviceInfo.schema.ts

import { z } from 'zod';

/**
 * Device information stored in form_analytics_events.event_data.device
 * This is the SOURCE OF TRUTH for this JSONB structure.
 */
export const DeviceInfoSchema = z.object({
  // Screen & Display
  screenWidth: z.number().int().positive(),
  screenHeight: z.number().int().positive(),
  viewportWidth: z.number().int().positive(),
  viewportHeight: z.number().int().positive(),
  devicePixelRatio: z.number().positive(),
  colorDepth: z.number().int().positive(),

  // Device Detection
  isTouchDevice: z.boolean(),
  isMobile: z.boolean(),

  // Locale & Region
  language: z.string(),
  languages: z.array(z.string()),
  timezone: z.string(),
  timezoneOffset: z.number().int(),

  // Browser Features
  cookiesEnabled: z.boolean(),
  doNotTrack: z.boolean(),

  // Traffic Source
  referrer: z.string(),

  // Connection (optional - not all browsers support)
  connectionType: z.string().optional(),
  connectionEffectiveType: z.string().optional(),
  connectionDownlink: z.number().optional(),
});

export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;
```

```typescript
// packages/libs/core/src/schemas/db/form_analytics_events/event_data/index.ts

import { z } from 'zod';
import { DeviceInfoSchema } from './deviceInfo.schema';
import { GeoInfoSchema } from './geoInfo.schema';

/**
 * Complete event_data JSONB structure.
 * SOURCE OF TRUTH for form_analytics_events.event_data column.
 */
export const EventDataSchema = z.object({
  device: DeviceInfoSchema.optional(),
  geo: GeoInfoSchema.optional(),
}).passthrough();  // Allow additional fields for forward compatibility

export type EventData = z.infer<typeof EventDataSchema>;

export { DeviceInfoSchema, type DeviceInfo };
export { GeoInfoSchema, type GeoInfo };
```

**Step 2: Define API schema (Source of Truth for API contract)**

```typescript
// api/src/shared/schemas/analytics.ts

import { z } from '@hono/zod-openapi';
import {
  EventDataSchema as CoreEventDataSchema,
  type EventData,
} from '@testimonials/core';

// Re-export types for convenience
export type { EventData };

/**
 * Event types - defined here because it's API-specific validation.
 * (Could also be in core if frontend needs to use these values)
 */
export const AnalyticsEventTypeSchema = z.enum([
  'form_started',
  'step_completed',
  'step_skipped',
  'form_submitted',
  'form_abandoned',
]).openapi({
  description: 'Type of analytics event',
  example: 'step_completed',
});

/**
 * Track event request - SOURCE OF TRUTH for POST /analytics/track API.
 * Composes EventDataSchema from core.
 */
export const TrackEventRequestSchema = z.object({
  formId: z.string().min(1).openapi({
    description: 'ID of the form being tracked',
    example: 'form_abc123',
  }),
  organizationId: z.string().min(1).openapi({
    description: 'ID of the organization that owns the form',
    example: 'org_xyz789',
  }),
  sessionId: z.string().uuid().openapi({
    description: 'Client-generated UUID for the session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  eventType: AnalyticsEventTypeSchema,
  stepIndex: z.number().int().min(0).optional().openapi({
    description: 'Zero-based step index',
    example: 2,
  }),
  stepId: z.string().optional(),
  stepType: z.string().optional(),
  eventData: CoreEventDataSchema.optional().openapi({  // ◄── Composed from core
    description: 'Device and geo information',
  }),
}).openapi('TrackEventRequest');

/**
 * Track event response - SOURCE OF TRUTH for response shape.
 */
export const TrackEventResponseSchema = z.object({
  success: z.boolean(),
  eventId: z.string().optional(),
}).openapi('TrackEventResponse');

// Infer types from schemas
export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;
export type TrackEventRequest = z.infer<typeof TrackEventRequestSchema>;
export type TrackEventResponse = z.infer<typeof TrackEventResponseSchema>;
```

**Step 3: Define API route with OpenAPI (exports types for frontend)**

```typescript
// api/src/routes/analytics.ts

import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import {
  TrackEventRequestSchema,
  TrackEventResponseSchema,
} from '../shared/schemas/analytics';

const analytics = new OpenAPIHono();

const trackEventRoute = createRoute({
  method: 'post',
  path: '/track',
  tags: ['Analytics'],
  summary: 'Track a form analytics event',
  description: 'Records user interactions with public forms for analytics.',
  request: {
    body: {
      content: {
        'application/json': { schema: TrackEventRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: TrackEventResponseSchema },
      },
      description: 'Event tracked successfully',
    },
    400: { description: 'Invalid request body' },
    500: { description: 'Internal server error' },
  },
});

analytics.openapi(trackEventRoute, async (c) => {
  const body = c.req.valid('json');  // Typed as TrackEventRequest

  // Validate eventData with core schema before inserting
  // (zod-openapi already validated, but we can double-check)

  const eventId = await insertAnalyticsEvent(body);

  return c.json({ success: true, eventId });
});

// CRITICAL: Export route types for Hono RPC
export type AnalyticsRoutes = typeof analytics;
export { analytics };
```

**Step 4: Frontend uses Hono RPC (types are inferred, not defined)**

```typescript
// apps/web/src/shared/api/client.ts

import { hc } from 'hono/client';
import type { AnalyticsRoutes } from '@api/routes/analytics';

export function createApiClients(getToken: () => string | null) {
  const headers = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    analytics: hc<AnalyticsRoutes>(`${API_URL}/analytics`, { headers }),
    // ... other routes
  };
}
```

```typescript
// apps/web/src/features/publicForm/composables/useAnalyticsTracking.ts

import { useApi } from '@/shared/api/useApi';
import { collectDeviceInfo } from '../functions/collectDeviceInfo';
import type { DeviceInfo } from '@testimonials/core';  // ◄── Type from core

export function useAnalyticsTracking(formId: string, organizationId: string) {
  const api = useApi();
  const sessionId = crypto.randomUUID();

  const trackEvent = async (
    eventType: 'form_started' | 'step_completed' | 'form_submitted',  // Could import from core
    stepIndex?: number
  ) => {
    const deviceInfo: DeviceInfo = collectDeviceInfo();  // ◄── Type from core

    // Request is fully typed via Hono RPC - no manual type definition!
    const res = await api.analytics.track.$post({
      json: {
        formId,
        organizationId,
        sessionId,
        eventType,
        stepIndex,
        eventData: {
          device: deviceInfo,  // TypeScript knows this matches DeviceInfoSchema
        },
      },
    });

    if (!res.ok) {
      console.error('Failed to track event');
      return;
    }

    const data = await res.json();  // Typed as TrackEventResponse
    return data.eventId;
  };

  return { trackEvent, sessionId };
}
```

### Example: Dashboard Response (Drizzle → API → Frontend)

**Step 1: Define domain types in Core**

```typescript
// packages/libs/core/src/schemas/domain/dashboard.ts

import { z } from 'zod';

/**
 * Metric sentiment for benchmark comparison.
 * Shared because both API calculates it and frontend displays it.
 */
export const MetricSentimentSchema = z.enum(['positive', 'negative', 'neutral']);
export type MetricSentiment = z.infer<typeof MetricSentimentSchema>;

/**
 * Time period for dashboard queries.
 */
export const PeriodSchema = z.enum(['7d', '30d', '90d']);
export type Period = z.infer<typeof PeriodSchema>;
```

**Step 2: Define API response schema (composes domain types)**

```typescript
// api/src/shared/schemas/dashboard.ts

import { z } from '@hono/zod-openapi';
import { MetricSentimentSchema } from '@testimonials/core';

export const SessionStatsSchema = z.object({
  totalSessions: z.number().int(),
  completedSessions: z.number().int(),
  abandonedSessions: z.number().int(),
  completionRate: z.number().nullable(),
  avgCompletionTimeMs: z.number().nullable(),
}).openapi('SessionStats');

export const MetricWithBenchmarkSchema = z.object({
  value: z.number().nullable(),
  benchmark: z.number().nullable(),
  sentiment: MetricSentimentSchema,  // ◄── From core
  diff: z.string().nullable(),  // e.g., "↑ 18% above expected"
}).openapi('MetricWithBenchmark');

export const DashboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    stats: SessionStatsSchema,
    completionMetric: MetricWithBenchmarkSchema,
    // ... other fields
  }),
}).openapi('DashboardResponse');

export type SessionStats = z.infer<typeof SessionStatsSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
```

**Step 3: Frontend composable (all types inferred)**

```typescript
// apps/web/src/features/formDashboard/composables/useFormDashboard.ts

import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useApi } from '@/shared/api/useApi';
import type { MetricSentiment } from '@testimonials/core';  // ◄── Domain type from core

export function useFormDashboard(formId: Ref<string>) {
  const api = useApi();

  const query = useQuery({
    queryKey: computed(() => ['form-dashboard', formId.value]),
    queryFn: async () => {
      const res = await api.dashboard.forms[':formId'].dashboard.$get({
        param: { formId: formId.value },
        query: { days: 30 },
      });

      if (!res.ok) throw new Error('Failed to fetch dashboard');

      return res.json();  // Typed as DashboardResponse
    },
    enabled: computed(() => !!formId.value),
  });

  // Helper to get CSS class based on sentiment (uses core type)
  const getSentimentClass = (sentiment: MetricSentiment): string => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
    }
  };

  return {
    dashboard: query.data,
    isLoading: query.isLoading,
    error: query.error,
    getSentimentClass,
  };
}
```

### Summary: What Goes Where

| What | Where | Example |
|------|-------|---------|
| JSONB column schemas | `@testimonials/core/schemas/db/` | `DeviceInfoSchema`, `EventDataSchema` |
| Domain enums/types | `@testimonials/core/schemas/domain/` | `MetricSentiment`, `Period` |
| API request schemas | `api/src/shared/schemas/` | `TrackEventRequestSchema` |
| API response schemas | `api/src/shared/schemas/` | `DashboardResponseSchema` |
| Route type exports | `api/src/routes/*.ts` | `export type AnalyticsRoutes` |
| Frontend types | **None defined** | Inferred from Hono RPC + imported from core |

### Route Definition Pattern (Existing)

The API already follows this pattern in `api/src/routes/`:

```typescript
// api/src/routes/auth.ts (existing pattern)
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const auth = new OpenAPIHono();

const enhanceTokenRoute = createRoute({
  method: 'post',
  path: '/enhance-token',
  tags: ['Authentication'],
  summary: 'Enhance Supabase token with Hasura claims',
  request: {
    body: {
      content: {
        'application/json': { schema: EnhanceTokenRequestSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': { schema: EnhanceTokenResponseSchema },
      },
      description: 'Token enhanced successfully',
    },
    401: { description: 'Invalid token' },
  },
});

auth.openapi(enhanceTokenRoute, async (c) => {
  // Handler implementation
});

// NEW: Export route types for Hono RPC
export type AuthRoutes = typeof auth;
export { auth };
```

### Adding Swagger UI

```typescript
// api/src/index.ts
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';

const app = new OpenAPIHono();

// Mount routes
app.route('/auth', auth);
app.route('/ai', ai);
app.route('/dashboard', dashboard);
// ... other routes

// OpenAPI JSON spec
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Testimonials API',
    version: '1.0.0',
    description: 'REST API for testimonial collection, analytics, and AI features',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Development' },
    { url: 'https://api.testimonials.app', description: 'Production' },
  ],
  tags: [
    { name: 'Authentication', description: 'Token management' },
    { name: 'AI', description: 'AI-powered features' },
    { name: 'Dashboard', description: 'Analytics dashboard' },
    { name: 'Analytics', description: 'Event tracking' },
  ],
});

// Swagger UI
app.get('/docs', swaggerUI({ url: '/openapi.json' }));
```

### Frontend: Hono RPC Client

Replace the custom `createApiClient()` with Hono's type-safe RPC client.

```typescript
// apps/web/src/shared/api/client.ts (NEW)
import { hc } from 'hono/client';
import type { AuthRoutes } from '@api/routes/auth';
import type { AIRoutes } from '@api/routes/ai';
import type { DashboardRoutes } from '@api/features/dashboard/routes';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Create typed clients for each route group
export function createApiClients(getToken: () => string | null) {
  const headers = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    auth: hc<AuthRoutes>(API_URL, { headers }),
    ai: hc<AIRoutes>(API_URL, { headers }),
    dashboard: hc<DashboardRoutes>(API_URL, { headers }),
  };
}

export type ApiClients = ReturnType<typeof createApiClients>;
```

### Frontend: Composable with Hono RPC

```typescript
// apps/web/src/shared/api/useApi.ts (NEW)
import { createApiClients, type ApiClients } from './client';
import { useTokenManager } from '@/shared/composables/useTokenManager';

let apiClients: ApiClients | null = null;

export function useApi() {
  if (!apiClients) {
    const { getAccessToken } = useTokenManager();
    apiClients = createApiClients(getAccessToken);
  }
  return apiClients;
}
```

### Usage in Feature Composables

```typescript
// apps/web/src/features/formDashboard/composables/useFormDashboard.ts
import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useApi } from '@/shared/api/useApi';

export function useFormDashboard(formId: Ref<string>, days: Ref<number> = ref(30)) {
  const api = useApi();

  return useQuery({
    queryKey: computed(() => ['form-dashboard', formId.value, days.value]),
    queryFn: async () => {
      const res = await api.dashboard.forms[':formId'].dashboard.$get({
        param: { formId: formId.value },
        query: { days: days.value },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      return res.json();  // Fully typed!
    },
    enabled: computed(() => !!formId.value),
  });
}
```

### TanStack Query Setup

```typescript
// apps/web/src/app/providers/queryClient.ts
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      gcTime: 30 * 60 * 1000,        // 30 minutes cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// In main.ts
app.use(VueQueryPlugin, { queryClient });
```

### Shared Domain Types (@testimonials/core)

For types that need validation on both ends (JSONB schemas, domain enums):

```typescript
// packages/libs/core/src/schemas/domain/analytics.ts
import { z } from 'zod';

export const DateRangeSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

export const PeriodSchema = z.enum(['7d', '30d', '90d']);
export type Period = z.infer<typeof PeriodSchema>;

export const MetricSentimentSchema = z.enum(['positive', 'negative', 'neutral']);
export type MetricSentiment = z.infer<typeof MetricSentimentSchema>;
```

```typescript
// packages/libs/core/src/schemas/domain/index.ts
export * from './analytics';
```

### Type Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Define route with zod-openapi                            │
│    api/src/routes/dashboard.ts                              │
│    └── createRoute({ request, responses })                  │
│                                                             │
│ 2. Export route type                                        │
│    export type DashboardRoutes = typeof dashboard;          │
│                                                             │
│ 3. Import in frontend                                       │
│    apps/web/src/shared/api/client.ts                        │
│    └── hc<DashboardRoutes>(API_URL)                         │
│                                                             │
│ 4. Use with full type inference                             │
│    const res = await api.dashboard.forms[':formId'].$get()  │
│    const data = await res.json();  // Typed!                │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Plan: Existing Routes & Client

### Current State Analysis

**API Routes (api/src/routes/):**
| Route File | Status | Pattern |
|------------|--------|---------|
| `auth.ts` | ✅ Full OpenAPI | `createRoute()` + Zod |
| `ai.ts` | ✅ Full OpenAPI | `createRoute()` + Zod |
| `media.ts` | ✅ Full OpenAPI | `createRoute()` + Zod |
| `forms.ts` | ⚠️ Placeholder | Plain Hono |
| `testimonials.ts` | ⚠️ Placeholder | Plain Hono |
| `widgets.ts` | ⚠️ Placeholder | Plain Hono |
| `analytics.ts` | ⚠️ Partial | Needs completion |

**Frontend API Client (apps/web/src/shared/api/):**
| File | Status | Change Needed |
|------|--------|---------------|
| `lib/apiClient.ts` | Custom fetch wrapper | Replace with Hono RPC |
| `ai/useApiForAI.ts` | Uses apiClient | Migrate to Hono RPC |
| `config/apiConfig.ts` | Endpoint constants | Keep for non-typed endpoints |
| `models/` | Manual type definitions | Auto-inferred from routes |

### Migration Steps

#### Step 1: Add Route Type Exports (API)

Add type exports to existing route files:

```typescript
// api/src/routes/auth.ts
// ... existing code ...

// ADD: Export route types
export type AuthRoutes = typeof auth;
```

```typescript
// api/src/routes/ai.ts
// ... existing code ...

// ADD: Export route types
export type AIRoutes = typeof ai;
```

```typescript
// api/src/routes/media.ts
// ... existing code ...

// ADD: Export route types
export type MediaRoutes = typeof media;
```

#### Step 2: Add Swagger UI (API)

```bash
cd api && pnpm add @hono/swagger-ui
```

Update `api/src/index.ts`:

```typescript
import { swaggerUI } from '@hono/swagger-ui';

// Add after route mounting
app.doc('/openapi.json', { /* config */ });
app.get('/docs', swaggerUI({ url: '/openapi.json' }));
```

#### Step 3: Create Aggregated Route Types (API)

```typescript
// api/src/routes/index.ts (NEW)
import { auth, type AuthRoutes } from './auth';
import { ai, type AIRoutes } from './ai';
import { media, type MediaRoutes } from './media';
// ... other routes

export { auth, ai, media };
export type { AuthRoutes, AIRoutes, MediaRoutes };

// Aggregated type for full API
export type AppRoutes = {
  auth: AuthRoutes;
  ai: AIRoutes;
  media: MediaRoutes;
  // ... other routes
};
```

#### Step 4: Create Hono RPC Client (Frontend)

```typescript
// apps/web/src/shared/api/client.ts (NEW)
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
```

#### Step 5: Create useApi Composable (Frontend)

```typescript
// apps/web/src/shared/api/useApi.ts (NEW)
import { createApiClients } from './client';
import { useTokenManager } from '@/shared/composables/useTokenManager';

let clients: ReturnType<typeof createApiClients> | null = null;

export function useApi() {
  if (!clients) {
    const { getAccessToken } = useTokenManager();
    clients = createApiClients(getAccessToken);
  }
  return clients;
}
```

#### Step 6: Migrate Existing Composables (Frontend)

**Before (useApiForAI.ts):**
```typescript
import { createApiClient } from '../lib/apiClient';

export function useApiForAI() {
  const client = createApiClient(API_BASE_URL, getAccessToken);

  return {
    async suggestQuestions(request: SuggestQuestionsRequest) {
      return client.post<SuggestQuestionsRequest, SuggestQuestionsResponse>(
        '/ai/suggest-questions',
        request,
        { authenticated: true }
      );
    },
  };
}
```

**After (useApiForAI.ts):**
```typescript
import { useApi } from '../useApi';

export function useApiForAI() {
  const api = useApi();

  return {
    async suggestQuestions(request: SuggestQuestionsRequest) {
      const res = await api.ai['suggest-questions'].$post({
        json: request,
      });
      if (!res.ok) throw new Error('Failed to suggest questions');
      return res.json();  // Fully typed!
    },
  };
}
```

#### Step 7: Update TypeScript Config

```jsonc
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@api/*": ["../../api/src/*"]  // Add path alias for API types
    }
  }
}
```

### Files to Modify Summary

**API:**
| File | Change |
|------|--------|
| `api/src/routes/auth.ts` | Add `export type AuthRoutes` |
| `api/src/routes/ai.ts` | Add `export type AIRoutes` |
| `api/src/routes/media.ts` | Add `export type MediaRoutes` |
| `api/src/routes/index.ts` | Create aggregated exports |
| `api/src/index.ts` | Add Swagger UI |
| `api/package.json` | Add `@hono/swagger-ui` |

**Frontend:**
| File | Change |
|------|--------|
| `apps/web/src/shared/api/client.ts` | NEW: Hono RPC client |
| `apps/web/src/shared/api/useApi.ts` | NEW: API composable |
| `apps/web/src/shared/api/ai/useApiForAI.ts` | Migrate to Hono RPC |
| `apps/web/tsconfig.json` | Add @api path alias |
| `apps/web/package.json` | Add `hono` (for client types) |

**Keep (no changes):**
| File | Reason |
|------|--------|
| `apps/web/src/shared/api/lib/apiClient.ts` | Keep for gradual migration |
| `apps/web/src/shared/api/config/apiConfig.ts` | Keep for config constants |
| `apps/web/src/shared/api/lib/errorHandler.ts` | Keep for error utilities |

---

## Implementation Plan

### Phase 1: API Type Exports & Documentation

1. Add route type exports to existing routes
   ```bash
   # Files to update:
   api/src/routes/auth.ts    → export type AuthRoutes
   api/src/routes/ai.ts      → export type AIRoutes
   api/src/routes/media.ts   → export type MediaRoutes
   ```

2. Create aggregated route exports
   ```bash
   # Create: api/src/routes/index.ts
   ```

3. Add Swagger UI
   ```bash
   cd api && pnpm add @hono/swagger-ui
   # Update: api/src/index.ts
   ```

4. Verify docs at `http://localhost:4000/docs`

### Phase 2: Frontend Hono RPC Setup

1. Install dependencies
   ```bash
   cd apps/web && pnpm add hono @tanstack/vue-query
   ```

2. Add TypeScript path alias for API types
   ```bash
   # Update: apps/web/tsconfig.json
   ```

3. Create Hono RPC client
   ```bash
   # Create: apps/web/src/shared/api/client.ts
   # Create: apps/web/src/shared/api/useApi.ts
   ```

4. Configure TanStack Query plugin
   ```bash
   # Create: apps/web/src/app/providers/queryClient.ts
   # Update: apps/web/src/main.ts
   ```

### Phase 3: Migrate Existing API Composables

1. Migrate `useApiForAI.ts` to Hono RPC
2. Update any components using the old pattern
3. Test all AI features work correctly
4. Keep old `apiClient.ts` for gradual migration

### Phase 4: Drizzle ORM Foundation

1. Install Drizzle dependencies
   ```bash
   cd api && pnpm add drizzle-orm postgres
   pnpm add -D drizzle-kit
   ```

2. Create database client (`api/src/db/index.ts`)

3. Define initial schemas for analytics tables

4. Create auth middleware with org context extraction

5. Add test database configuration

### Phase 5: Dashboard Endpoint (First Drizzle Consumer)

1. Create dashboard routes with OpenAPI schemas
2. Implement Drizzle queries (`getSessionStats`, etc.)
3. Export `DashboardRoutes` type
4. Add route tests
5. Verify organization isolation

### Phase 6: Frontend Dashboard Integration

1. Add dashboard to Hono RPC client
2. Create `useFormDashboard` composable with TanStack Query
3. Build dashboard UI components
4. Test end-to-end type safety

### Phase 7: Documentation & Cleanup

1. Update CLAUDE.md with new patterns
2. Remove deprecated `apiClient.ts` after full migration
3. Document query patterns for future features
4. Add migration guide for new endpoints

---

## File Structure

### API

```
api/src/
├── index.ts                        # App entry + Swagger UI
│
├── routes/
│   ├── index.ts                    # Aggregated route exports + types
│   ├── auth.ts                     # Auth routes (+ export type AuthRoutes)
│   ├── ai.ts                       # AI routes (+ export type AIRoutes)
│   ├── media.ts                    # Media routes (+ export type MediaRoutes)
│   └── analytics.ts                # Analytics routes (+ export type)
│
├── shared/
│   ├── schemas/                    # Zod + OpenAPI schemas
│   │   ├── common.ts               # Error, success response schemas
│   │   ├── auth.ts                 # Auth request/response schemas
│   │   ├── ai.ts                   # AI schemas
│   │   ├── analytics.ts            # Analytics schemas
│   │   └── dashboard.ts            # Dashboard schemas (NEW)
│   └── middleware/
│       └── auth.ts                 # JWT validation (existing)
│
├── db/                             # Drizzle ORM (NEW)
│   ├── index.ts                    # Drizzle client instance
│   ├── test-client.ts              # Test database client
│   └── schema/
│       ├── index.ts                # Barrel export
│       ├── formAnalyticsEvents.ts  # Analytics events
│       └── testimonials.ts         # For rating queries
│
├── features/
│   └── dashboard/                  # Dashboard feature (NEW)
│       ├── routes.ts               # OpenAPI routes (+ export type)
│       ├── getSessionStats.ts      # Drizzle query
│       ├── getFunnelData.ts        # Drizzle query
│       ├── getAudienceData.ts      # Drizzle query
│       ├── getRatingData.ts        # Drizzle query
│       ├── calculateBenchmark.ts   # Benchmark logic
│       └── __tests__/
│           └── getSessionStats.test.ts
```

### Frontend

```
apps/web/src/
├── app/
│   └── providers/
│       └── queryClient.ts          # TanStack Query setup (NEW)
│
├── shared/
│   └── api/
│       ├── client.ts               # Hono RPC client factory (NEW)
│       ├── useApi.ts               # API composable (NEW)
│       ├── config/
│       │   └── apiConfig.ts        # Config constants (existing)
│       ├── lib/
│       │   ├── apiClient.ts        # Legacy fetch wrapper (deprecate)
│       │   └── errorHandler.ts     # Error utilities (keep)
│       ├── models/
│       │   └── common.ts           # Shared types (keep for non-RPC)
│       └── ai/
│           ├── useApiForAI.ts      # Migrated to Hono RPC
│           └── index.ts
│
├── features/
│   └── formDashboard/              # Dashboard feature (NEW)
│       ├── ui/
│       │   └── ...                 # Dashboard components
│       ├── composables/
│       │   └── useFormDashboard.ts # TanStack Query + Hono RPC
│       └── models/
│           └── index.ts            # Types (inferred from API)
```

### Shared Package

```
packages/libs/core/src/
├── schemas/
│   ├── db/                         # JSONB schemas (existing)
│   │   └── form_analytics_events/
│   │       └── event_data/
│   │           ├── deviceInfo.schema.ts
│   │           └── geoInfo.schema.ts
│   │
│   └── domain/                     # Domain schemas (NEW)
│       ├── analytics.ts            # DateRange, Period, MetricSentiment
│       └── index.ts
```

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Full SQL power** | Complex aggregations, window functions, CTEs |
| **Type safety** | TypeScript inference from schema definitions |
| **Clear boundaries** | Hasura = entities, Drizzle = analytics |
| **Lightweight** | 7kb runtime, no ORM overhead |
| **Testable** | Pure functions with database, easy mocking |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **Two data layers** | Clear documentation of when to use each |
| **Schema duplication** | Only define schemas for analytics tables |
| **Manual sync** | Update Drizzle when Hasura migrations change |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Schema drift | Medium | Medium | Review both on migrations |
| Auth bypass | Low | High | Mandatory org filter pattern |
| Connection leaks | Low | Medium | Proper pool config, shutdown |

---

## References

### Technology - Data Layer
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [TanStack Query Vue](https://tanstack.com/query/latest/docs/framework/vue/overview)

### Technology - Type Safety & Documentation
- [Hono RPC Client](https://hono.dev/docs/guides/rpc) - End-to-end type safety
- [Hono Zod OpenAPI](https://hono.dev/examples/zod-openapi) - OpenAPI + validation
- [Hono Swagger UI](https://github.com/honojs/middleware/tree/main/packages/swagger-ui) - API documentation
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - Route schemas

### Related ADRs
- [ADR-022: Form Dashboard](../022-form-dashboard/adr.md) - First consumer
- [ADR-018: Form Persistence & Analytics](../018-form-persistence-analytics/adr.md) - Data source
