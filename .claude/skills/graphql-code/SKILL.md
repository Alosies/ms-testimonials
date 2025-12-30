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

export function useGetOrganization(variables: Ref<GetOrganizationQueryVariables>) {
  const { result, loading, error, refetch } = useGetOrganizationQuery(variables, {
    enabled: computed(() => !!variables.value.organizationId),
  });

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

## Common Commands

```bash
# Validate schema
mcp__tm-graph__get-type-info({ type_name: "table_name" })

# Generate types
pnpm codegen:web

# Watch mode
pnpm codegen:web:watch
```
