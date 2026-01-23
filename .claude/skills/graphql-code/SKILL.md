---
name: graphql-code
description: Create and validate GraphQL operations (.gql files), generate TypeScript types, and create Vue composables. Use when creating new GraphQL queries/mutations, adding entity composables, or working with Hasura schema types. Triggers on "graphql", "composable", "query", "mutation", "entity".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__tm-graph__get-type-info, mcp__tm-graph__search-schema, mcp__tm-graph__list-queries, mcp__tm-graph__list-mutations
---

# GraphQL Code Generation Skill

Create and validate GraphQL operations, generate types, and create composables following Testimonials FSD patterns.

---

## Workflow

```
1. Create .gql files → 2. Validate with tm-graph MCP → 3. Run codegen → 4. Create composables
```

---

## 1. Create GraphQL Files

### File Structure
```
entities/{entity}/graphql/
├── fragments/{Entity}Basic.gql
├── queries/get{Entity}.gql
└── mutations/{action}{Entity}.gql
```

### Fragment Pattern
```graphql
fragment OrganizationBasic on organizations {
  id
  name
  slug
  logo_url
  setup_status
  is_active
  created_at
  updated_at
}
```

### Query Pattern
```graphql
#import "../fragments/OrganizationBasic.gql"

query GetOrganization($organizationId: String!) {
  organizations_by_pk(id: $organizationId) {
    ...OrganizationBasic
  }
}
```

### Mutation Pattern
```graphql
mutation UpdateOrganization($id: String!, $changes: organizations_set_input!) {
  update_organizations_by_pk(pk_columns: { id: $id }, _set: $changes) {
    id
    name
    slug
    setup_status
    updated_at
  }
}
```

---

## 2. Validate with MCP

Use tm-graph MCP tools before running codegen:

```typescript
// Check table/type exists
mcp__tm-graph__get-type-info({ type_name: "organizations" })

// Search schema
mcp__tm-graph__search-schema({ query: "organization" })

// List available queries
mcp__tm-graph__list-queries()

// List available mutations
mcp__tm-graph__list-mutations()
```

---

## 3. Run Codegen

```bash
# Generate TypeScript types from .gql files
pnpm codegen:web

# Watch mode during development
pnpm codegen:web:watch
```

**Generates** (in `apps/web/src/shared/graphql/generated/`):
- `operations.ts` - Query/mutation types + Vue composables
- `types.ts` - Base GraphQL types
- `schema.graphql` - Full schema
- `introspection.json` - Schema metadata

---

## 4. Create Composables

### Query Composable Pattern

**Location**: `entities/{entity}/composables/queries/useGet{Entity}.ts`

```typescript
import { computed, type Ref } from 'vue';
import {
  useGetOrganizationQuery,
  type GetOrganizationQueryVariables,
} from '@/shared/graphql/generated/operations';

export function useGetOrganization(organizationId: Ref<string | null>) {
  // CRITICAL: Variables must be computed, not ref(computed.value)
  const variables = computed<GetOrganizationQueryVariables>(() => ({
    organizationId: organizationId.value ?? '',
  }));

  // CRITICAL: Enabled must be computed for reactivity
  const enabled = computed(() => !!organizationId.value);

  const { result, loading, error, refetch } = useGetOrganizationQuery(
    variables,
    { enabled },
  );

  const organization = computed(() => result.value?.organizations_by_pk ?? null);

  return {
    organization,
    loading,
    error,
    refetch,
    result,
  };
}
```

### Query Composable Rules (CRITICAL)

1. **Variables**: Always use `computed()` - never `ref(computed.value)`
2. **Enabled**: Always use `computed()` - enables reactive query toggling
3. **Data extraction**: Always use `computed()` with safe navigation (`?? null` or `?? []`)

### Mutation Composable Pattern

**Location**: `entities/{entity}/composables/mutations/useUpdate{Entity}.ts`

```typescript
import { computed, ref } from 'vue';
import {
  useUpdateOrganizationMutation,
  type UpdateOrganizationMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateOrganization() {
  const { mutate, loading, error, onDone, onError } = useUpdateOrganizationMutation();

  const hasError = computed(() => error.value !== null);

  const updateOrganization = async (variables: UpdateOrganizationMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_organizations_by_pk ?? null;
  };

  return {
    mutate,
    updateOrganization,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

---

## Type Safety Rules

### ✅ DO: Extract Types from Queries

```typescript
// models/index.ts
import type { GetOrganizationsQuery } from '@/shared/graphql/generated/operations';

// Extract array item type from query (CORRECT)
export type OrganizationItem = GetOrganizationsQuery['organizations'][number];

// Extract single item type from query (CORRECT)
export type Organization = GetOrganizationQuery['organizations_by_pk'];
```

### ❌ DON'T: Re-export Fragment Types

```typescript
// models/index.ts

// ❌ WRONG: Don't re-export fragment types
import type { OrganizationBasicFragment } from '@/shared/graphql/generated/operations';
export type OrganizationBasic = OrganizationBasicFragment;

// ✅ CORRECT: Extract from query instead
import type { GetOrganizationsQuery } from '@/shared/graphql/generated/operations';
export type OrganizationItem = GetOrganizationsQuery['organizations'][number];
```

**Rationale:**
- Fragments are **implementation details** for GraphQL operations
- Types should represent the **actual data structure** returned by queries
- Query-extracted types ensure **type safety** when schema changes

### ✅ DO: Re-export Mutation Variables

```typescript
import type {
  UpdateOrganizationMutationVariables,
  GetOrganizationsQueryVariables,
} from '@/shared/graphql/generated/operations';

export type UpdateOrganizationInput = UpdateOrganizationMutationVariables;
export type GetOrganizationsVariables = GetOrganizationsQueryVariables;
```

### ❌ DON'T: Create Custom Types

```typescript
// Never recreate GraphQL types manually
interface Organization {
  id: string;
  name: string;
  // ... manual fields
}
```

---

## Model Organization

### File Structure

```
entities/{entity}/models/
├── index.ts       # Barrel exports + utility types
├── queries.ts     # Query-related types only
└── mutations.ts   # Mutation-related types only
```

### queries.ts Pattern

```typescript
import type {
  GetOrganizationQuery,
  GetOrganizationsQuery,
  GetOrganizationQueryVariables,
  GetOrganizationsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetOrganizationVariables = GetOrganizationQueryVariables;
export type GetOrganizationsVariables = GetOrganizationsQueryVariables;

// Extract Data Types from Queries
export type Organization = NonNullable<GetOrganizationQuery['organizations_by_pk']>;
export type OrganizationsData = GetOrganizationsQuery['organizations'];
export type OrganizationItem = GetOrganizationsQuery['organizations'][number];
```

### mutations.ts Pattern

```typescript
import type {
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type UpdateOrganizationVariables = UpdateOrganizationMutationVariables;

// Extract Mutation Result Types
export type OrganizationUpdateResult = NonNullable<
  UpdateOrganizationMutation['update_organizations_by_pk']
>;
```

### index.ts Pattern (Barrel Export)

```typescript
export type * from './queries';
export type * from './mutations';

// Utility types
export type OrganizationId = string;
```

---

## Key Patterns

### Multi-Tenant Queries
Always include `organization_id` in where clauses for org-scoped data:

```graphql
query GetForms($organizationId: String!) {
  forms(where: { organization_id: { _eq: $organizationId } }) {
    id
    name
    slug
  }
}
```

### Enabled Refs
Use conditional query execution:

```typescript
const enabled = computed(() => !!variables.value.organizationId);
const { result } = useGetFormsQuery(variables, { enabled });
```

### Reactive Query Variables (CRITICAL)

When passing variables to GraphQL query composables, **ALWAYS use `computed()` directly** - never wrap with `ref()`:

```typescript
// ✅ CORRECT: Pass computed directly - reactive and updates when dependencies change
const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { data } = useGetFormsQuery(variables);

// ❌ WRONG: ref(computed.value) creates a STATIC ref that never updates!
const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { data } = useGetFormsQuery(ref(variables.value));  // BUG: Never updates!
```

**Why this matters:**
- `ref(computed.value)` captures the initial value at creation time
- When dependencies (like `currentOrganizationId`) change, the ref stays the same
- The query never re-executes with new values
- `ComputedRef<T>` extends `Ref<T>`, so Vue Apollo accepts computed refs directly

### Safe Data Extraction
Use safe navigation with fallbacks:

```typescript
const organization = computed(() => result.value?.organizations_by_pk ?? null);
const forms = computed(() => result.value?.forms ?? []);
```

---

## Entity Examples (Testimonials)

### Core Entities
| Entity | Table | Multi-Tenant |
|--------|-------|--------------|
| organization | organizations | No (is tenant) |
| user | users | No |
| form | forms | Yes |
| testimonial | testimonials | Yes (via form) |
| widget | widgets | Yes |

### Organization Entity Structure
```
entities/organization/
├── graphql/
│   ├── fragments/OrganizationBasic.gql
│   ├── queries/getOrganization.gql
│   └── mutations/updateOrganization.gql
├── models/
│   ├── index.ts
│   ├── queries.ts
│   └── mutations.ts
├── composables/
│   ├── queries/useGetOrganization.ts
│   ├── mutations/useUpdateOrganization.ts
│   └── index.ts
└── index.ts
```

---

## Checklist

- [ ] Create .gql files (fragments, queries, mutations)
- [ ] Validate with `mcp__tm-graph__get-type-info`
- [ ] Run `pnpm codegen:web`
- [ ] Verify generated types in `operations.ts`
- [ ] Create models (queries.ts, mutations.ts, index.ts)
- [ ] Create composables using generated types
- [ ] Export through entity `index.ts`
- [ ] Use `computed()` directly for query variables (NOT `ref(computed.value)`)
- [ ] Test in component

---

## JSONB Fields & Zod Schemas (CRITICAL)

**Rule: Any field stored as JSONB in PostgreSQL MUST have a strict Zod schema to maintain data integrity.**

### Why JSONB Needs Schemas

JSONB columns are schemaless at the database level - PostgreSQL accepts any valid JSON. Without validation:
- Data structure can drift over time
- Invalid data can be written silently
- Type safety is lost
- Bugs are hard to trace

### JSONB Schema Location

| Context | Location |
|---------|----------|
| **Shared (DB JSONB)** | `packages/libs/core/src/schemas/db/{table}/{column}/` |
| API (extends with OpenAPI) | `api/src/shared/schemas/{entity}.ts` |
| Web app (entity-specific) | `apps/web/src/entities/{entity}/schemas/` |

**Preferred Pattern:** Define JSONB schemas in `@testimonials/core` as single source of truth. API and Web import from core.

### JSONB Schema Pattern

```typescript
// packages/libs/core/src/schemas/db/form_analytics_events/event_data/deviceInfo.schema.ts
import { z } from 'zod';

/**
 * Schema for event_data.device in form_analytics_events table.
 * @see README.md for migration planning
 */
export const DeviceInfoSchema = z.object({
  screenWidth: z.number().int().positive(),
  screenHeight: z.number().int().positive(),
  isMobile: z.boolean(),
  language: z.string(),
  timezone: z.string(),
  referrer: z.string(),
  // ... all fields explicitly defined
});

// Type inferred from schema (single source of truth)
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;
```

```typescript
// api/src/shared/schemas/analytics.ts - extends with OpenAPI metadata
import { DeviceInfoSchema as BaseDeviceInfoSchema, type DeviceInfo } from '@testimonials/core';

export const DeviceInfoSchema = BaseDeviceInfoSchema.openapi({
  description: 'Device and browser information',
});
export type { DeviceInfo };
```

```typescript
// apps/web/src/features/publicForm/models/analytics.ts - imports type
export type { DeviceInfo } from '@testimonials/core';
```

### JSONB Validation Pattern

```typescript
// Writing to JSONB - validate before save
const eventData = EventDataSchema.parse(rawData);  // Throws if invalid
await insertEvent({ event_data: eventData });

// Reading from JSONB - validate/parse after fetch
const parsed = EventDataSchema.safeParse(event.event_data);
if (parsed.success) {
  const data = parsed.data;  // Typed correctly
}
```

### JSONB Schema Checklist

- [ ] Create Zod schema for the JSONB structure
- [ ] Define all fields explicitly (no `z.any()` or `z.unknown()`)
- [ ] Use `.passthrough()` for forward compatibility if needed
- [ ] Export types inferred from schemas (`z.infer<typeof Schema>`)
- [ ] Validate on write (API side)
- [ ] Validate/parse on read (for type safety)
- [ ] Document schema in the entity's ADR or models

### Existing JSONB Schemas

| Table | Column | Schema Location |
|-------|--------|-----------------|
| `form_analytics_events` | `event_data` | `packages/libs/core/src/schemas/db/form_analytics_events/event_data/` |
| `form_steps` | `content` | `apps/web/src/entities/formStep/schemas/` |

---

## Common Commands

```bash
# Validate schema
mcp__tm-graph__get-type-info({ type_name: "table_name" })

# Generate types
pnpm codegen:web

# Watch mode
pnpm codegen:web:watch
```
