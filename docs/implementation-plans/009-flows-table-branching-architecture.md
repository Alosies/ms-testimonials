# Implementation Plan: ADR-009 Flows Table Branching Architecture

> Migrate frontend from `flow_membership` TEXT column to `flows` table with `flow_id` foreign key.

**ADR:** `docs/adr/009-flows-table-branching-architecture.md`
**Status:** Not Started
**Created:** January 8, 2026

---

## Overview

The database schema has been upgraded to use a `flows` table per ADR-009, but the frontend still uses the legacy `flow_membership` TEXT column. This plan details the migration to fully utilize the flows table architecture.

### Current State

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (17 files)                                                     │
│ ─────────────────────                                                   │
│ • Uses step.flowMembership ('shared'|'testimonial'|'improvement')       │
│ • Stores branching config in forms.branching_config JSONB               │
│ • Threshold hardcoded as select options (3, 4, 5)                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE (Ready but underutilized)                                      │
│ ─────────────────────────────                                           │
│ • flows table with branch_condition JSONB ✅                            │
│ • form_steps.flow_id FK to flows.id ✅                                  │
│ • form_steps.flow_membership (legacy, still populated) ✅               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Target State (ADR-009)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                                │
│ ─────────                                                               │
│ • Uses step.flowId referencing flows.id                                 │
│ • Reads branching config from flows.branch_condition                    │
│ • Threshold configurable per flow                                       │
│ • Flow names customizable                                               │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ DATABASE                                                                │
│ ────────                                                                │
│ • flows.branch_condition stores {"field":"rating","op":">=","value":4}  │
│ • form_steps.flow_id is the source of truth                             │
│ • form_steps.flow_membership deprecated (can be dropped later)          │
│ • forms.branching_config deprecated (can be dropped later)              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Data Model Changes

### Flow Entity Model

**Current:** `forms.branching_config` JSONB with `{enabled, threshold, ratingStepId}`

**Target:** `flows` table with explicit rows:

```sql
-- Example data after migration
flows:
┌──────────────┬─────────────┬───────────────────┬───────────┬──────────────────────────────────────────────┐
│ id           │ form_id     │ name              │ flow_type │ branch_condition                             │
├──────────────┼─────────────┼───────────────────┼───────────┼──────────────────────────────────────────────┤
│ flow_abc123  │ form_xyz    │ Shared Steps      │ shared    │ NULL                                         │
│ flow_def456  │ form_xyz    │ Testimonial Flow  │ branch    │ {"field":"rating","op":">=","value":4}       │
│ flow_ghi789  │ form_xyz    │ Improvement Flow  │ branch    │ {"field":"rating","op":"<","value":4}        │
└──────────────┴─────────────┴───────────────────┴───────────┴──────────────────────────────────────────────┘
```

### FormStep Model

**Current:**
```typescript
interface FormStep {
  // ...
  flowMembership: 'shared' | 'testimonial' | 'improvement';
}
```

**Target:**
```typescript
interface FormStep {
  // ...
  flowId: string;
  flow?: Flow; // Loaded via GraphQL relationship
  // flowMembership: deprecated, derived from flow.flow_type for backward compat
}
```

---

## Phase 1: GraphQL Layer Updates

### 1.1 Add Flow Queries

**File:** `apps/web/src/entities/flow/graphql/queries/getFlowsByFormId.gql`

```graphql
query GetFlowsByFormId($formId: String!) {
  flows(
    where: { form_id: { _eq: $formId } }
    order_by: { display_order: asc }
  ) {
    ...FlowBasic
    steps(order_by: { step_order: asc }) {
      id
      step_order
    }
  }
}
```

### 1.2 Add Flow Fragment

**File:** `apps/web/src/entities/flow/graphql/fragments/FlowBasic.gql`

```graphql
fragment FlowBasic on flows {
  id
  form_id
  name
  flow_type
  branch_condition
  display_order
  created_at
  updated_at
}
```

### 1.3 Add Flow Mutations

**File:** `apps/web/src/entities/flow/graphql/mutations/createFlows.gql`

```graphql
#import "../fragments/FlowBasic.gql"

mutation CreateFlows($inputs: [flows_insert_input!]!) {
  insert_flows(objects: $inputs) {
    returning {
      ...FlowBasic
    }
  }
}
```

**File:** `apps/web/src/entities/flow/graphql/mutations/updateFlows.gql`

```graphql
#import "../fragments/FlowBasic.gql"

mutation UpdateFlows($updates: [flows_updates!]!) {
  update_flows_many(updates: $updates) {
    returning {
      ...FlowBasic
    }
  }
}
```

**File:** `apps/web/src/entities/flow/graphql/mutations/deleteFlows.gql`

```graphql
mutation DeleteFlows($ids: [String!]!) {
  delete_flows(where: { id: { _in: $ids } }) {
    affected_rows
  }
}
```

### 1.4 Update FormStep Fragment

**File:** `apps/web/src/entities/formStep/graphql/fragments/FormStepBasic.gql`

Add flow relationship:
```graphql
fragment FormStepBasic on form_steps {
  id
  form_id
  step_type
  step_order
  question_id
  content
  tips
  is_active
  flow_id
  flow_membership  # Keep for backward compat during migration
  flow {
    id
    name
    flow_type
    branch_condition
    display_order
  }
}
```

### 1.5 Update GetFormSteps Query

**File:** `apps/web/src/entities/formStep/graphql/queries/getFormSteps.gql`

Ensure `flow_id` and `flow` relationship are included.

### 1.6 Run Codegen

```bash
pnpm codegen:web
```

---

## Phase 2: Type Definitions

Following the graphql-code skill patterns: types extracted from queries (not fragments), functions in `functions/` folder.

### 2.1 Create Flow Models Structure

**Directory Structure:**
```
entities/flow/
├── graphql/
│   ├── fragments/FlowBasic.gql
│   ├── queries/getFlowsByFormId.gql
│   └── mutations/
│       ├── createFlows.gql
│       ├── updateFlows.gql
│       └── deleteFlows.gql
├── models/
│   ├── index.ts       # Barrel exports + utility types
│   ├── queries.ts     # Query-related types
│   └── mutations.ts   # Mutation-related types
├── functions/
│   ├── index.ts
│   ├── createDefaultFlows.ts
│   └── deriveFlowMembership.ts
├── composables/
│   ├── index.ts
│   ├── queries/useGetFlowsByFormId.ts
│   └── mutations/
│       ├── useCreateFlows.ts
│       ├── useUpdateFlows.ts
│       └── useDeleteFlows.ts
└── index.ts
```

### 2.2 Flow Query Types

**File:** `apps/web/src/entities/flow/models/queries.ts`

```typescript
import type {
  GetFlowsByFormIdQuery,
  GetFlowsByFormIdQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetFlowsByFormIdVariables = GetFlowsByFormIdQueryVariables;

// Extract Data Types from Queries (CORRECT: extract from query, not fragment)
export type FlowsData = GetFlowsByFormIdQuery['flows'];
export type Flow = GetFlowsByFormIdQuery['flows'][number];
```

### 2.3 Flow Mutation Types

**File:** `apps/web/src/entities/flow/models/mutations.ts`

```typescript
import type {
  CreateFlowsMutation,
  CreateFlowsMutationVariables,
  UpdateFlowsMutation,
  UpdateFlowsMutationVariables,
  DeleteFlowsMutation,
  DeleteFlowsMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateFlowsVariables = CreateFlowsMutationVariables;
export type UpdateFlowsVariables = UpdateFlowsMutationVariables;
export type DeleteFlowsVariables = DeleteFlowsMutationVariables;

// Extract Mutation Result Types
export type CreateFlowsResult = NonNullable<CreateFlowsMutation['insert_flows']>['returning'];
export type UpdateFlowsResult = NonNullable<UpdateFlowsMutation['update_flows_many']>;
export type DeleteFlowsResult = NonNullable<DeleteFlowsMutation['delete_flows']>;
```

### 2.4 Flow Barrel Export

**File:** `apps/web/src/entities/flow/models/index.ts`

```typescript
export type * from './queries';
export type * from './mutations';

// Utility types (custom types that don't come from GraphQL)
export type FlowType = 'shared' | 'branch';

/**
 * Verbose operator names for clarity and self-documentation.
 * Follows Notion/Typeform conventions for form builders.
 */
export type BranchConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal_to'
  | 'less_than'
  | 'less_than_or_equal_to'
  | 'between'
  | 'is_one_of'    // matches any value in array (future: NPS segments)
  | 'contains'     // future: text matching
  | 'is_empty'     // future: optional field checks
  ;

/**
 * Branch condition stored in flows.branch_condition JSONB
 */
export interface BranchCondition {
  field: string;           // "rating", "nps", etc.
  op: BranchConditionOperator;
  value: number | boolean | [number, number];  // e.g., 4, true, [7, 8]
}

/**
 * Legacy flow membership for backward compatibility
 */
export type FlowMembershipLegacy = 'shared' | 'testimonial' | 'improvement';
```

### 2.5 Flow Functions (NOT in models/)

**File:** `apps/web/src/entities/flow/functions/createDefaultFlows.ts`

```typescript
import type { BranchCondition, FlowType } from '../models';

export interface DefaultFlowInput {
  form_id: string;
  organization_id: string;
  name: string;
  flow_type: FlowType;
  branch_condition: BranchCondition | null;
  display_order: number;
}

/**
 * Create default flows for a form when branching is enabled
 */
export function createDefaultFlows(
  formId: string,
  organizationId: string,
  threshold: number = 4
): DefaultFlowInput[] {
  return [
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Shared Steps',
      flow_type: 'shared',
      branch_condition: null,
      display_order: 0,
    },
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Testimonial Flow',
      flow_type: 'branch',
      branch_condition: { field: 'rating', op: 'greater_than_or_equal_to', value: threshold },
      display_order: 1,
    },
    {
      form_id: formId,
      organization_id: organizationId,
      name: 'Improvement Flow',
      flow_type: 'branch',
      branch_condition: { field: 'rating', op: 'less_than', value: threshold },
      display_order: 2,
    },
  ];
}
```

**File:** `apps/web/src/entities/flow/functions/deriveFlowMembership.ts`

```typescript
import type { Flow, BranchCondition, FlowMembershipLegacy } from '../models';

/**
 * Derive legacy flowMembership from flow for backward compat
 */
export function deriveFlowMembership(flow: Flow): FlowMembershipLegacy {
  if (flow.flow_type === 'shared') return 'shared';

  const condition = flow.branch_condition as BranchCondition | null;
  if (!condition) return 'testimonial'; // Default fallback

  // Rating >= threshold → testimonial
  if (condition.field === 'rating' &&
      (condition.op === 'greater_than_or_equal_to' || condition.op === 'greater_than')) {
    return 'testimonial';
  }

  // Rating < threshold → improvement
  if (condition.field === 'rating' &&
      (condition.op === 'less_than' || condition.op === 'less_than_or_equal_to')) {
    return 'improvement';
  }

  // Default to testimonial for unknown conditions
  return 'testimonial';
}
```

**File:** `apps/web/src/entities/flow/functions/index.ts`

```typescript
export { createDefaultFlows, type DefaultFlowInput } from './createDefaultFlows';
export { deriveFlowMembership } from './deriveFlowMembership';
```

### 2.6 Update FormStep Type

**File:** `apps/web/src/shared/stepCards/models/stepContent.ts`

```typescript
// Add to FormStep interface
export interface FormStep {
  id: string;
  formId: string;
  stepType: StepType;
  stepOrder: number;
  questionId?: string | null;
  question?: LinkedQuestion | null;
  content: StepContent;
  tips: string[];
  isActive: boolean;

  // NEW: Flow reference (source of truth)
  flowId: string;
  flow?: Flow | null;

  // DEPRECATED: Kept for backward compatibility during migration
  // Derived from flow.flow_type and flow.branch_condition
  flowMembership: FlowMembership;

  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}
```

---

## Phase 3: Flow Entity Composables

Following the graphql-code skill patterns: `computed()` for variables and enabled (CRITICAL for reactivity).

### 3.1 Create useGetFlowsByFormId

**File:** `apps/web/src/entities/flow/composables/queries/useGetFlowsByFormId.ts`

```typescript
import { computed, type Ref } from 'vue';
import {
  useGetFlowsByFormIdQuery,
  type GetFlowsByFormIdQueryVariables,
} from '@/shared/graphql/generated/operations';
import type { BranchCondition } from '../../models';

export function useGetFlowsByFormId(formId: Ref<string | null>) {
  // CRITICAL: Variables must be computed, not ref(computed.value)
  const variables = computed<GetFlowsByFormIdQueryVariables>(() => ({
    formId: formId.value ?? '',
  }));

  // CRITICAL: Enabled must be computed for reactivity
  const enabled = computed(() => !!formId.value);

  const { result, loading, error, refetch } = useGetFlowsByFormIdQuery(
    variables,
    { enabled },
  );

  // Safe data extraction with fallbacks
  const flows = computed(() => result.value?.flows ?? []);

  const sharedFlow = computed(() =>
    flows.value.find(f => f.flow_type === 'shared') ?? null
  );

  const testimonialFlow = computed(() =>
    flows.value.find(f => {
      if (f.flow_type !== 'branch') return false;
      const cond = f.branch_condition as BranchCondition | null;
      return cond?.op === 'greater_than_or_equal_to' || cond?.op === 'greater_than';
    }) ?? null
  );

  const improvementFlow = computed(() =>
    flows.value.find(f => {
      if (f.flow_type !== 'branch') return false;
      const cond = f.branch_condition as BranchCondition | null;
      return cond?.op === 'less_than' || cond?.op === 'less_than_or_equal_to';
    }) ?? null
  );

  return {
    flows,
    sharedFlow,
    testimonialFlow,
    improvementFlow,
    loading,
    error,
    refetch,
    result,
  };
}
```

### 3.2 Create useUpdateFlows

**File:** `apps/web/src/entities/flow/composables/mutations/useUpdateFlows.ts`

```typescript
import { computed } from 'vue';
import {
  useUpdateFlowsMutation,
  type UpdateFlowsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateFlows() {
  const { mutate, loading, error, onDone, onError } = useUpdateFlowsMutation();

  const hasError = computed(() => error.value !== null);

  const updateFlows = async (variables: UpdateFlowsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_flows_many?.flatMap(r => r?.returning ?? []) ?? [];
  };

  return {
    mutate,
    updateFlows,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

### 3.3 Create useDeleteFlows

**File:** `apps/web/src/entities/flow/composables/mutations/useDeleteFlows.ts`

```typescript
import { computed } from 'vue';
import {
  useDeleteFlowsMutation,
  type DeleteFlowsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteFlows() {
  const { mutate, loading, error, onDone, onError } = useDeleteFlowsMutation();

  const hasError = computed(() => error.value !== null);

  const deleteFlows = async (variables: DeleteFlowsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.delete_flows?.affected_rows ?? 0;
  };

  return {
    mutate,
    deleteFlows,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

### 3.4 Create useCreateFlows

**File:** `apps/web/src/entities/flow/composables/mutations/useCreateFlows.ts`

```typescript
import { computed } from 'vue';
import {
  useCreateFlowsMutation,
  type CreateFlowsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateFlows() {
  const { mutate, loading, error, onDone, onError } = useCreateFlowsMutation();

  const hasError = computed(() => error.value !== null);

  const createFlows = async (variables: CreateFlowsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_flows?.returning ?? [];
  };

  return {
    mutate,
    createFlows,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

### 3.5 Composable Barrel Export

**File:** `apps/web/src/entities/flow/composables/index.ts`

```typescript
// Queries
export { useGetFlowsByFormId } from './queries/useGetFlowsByFormId';

// Mutations
export { useCreateFlows } from './mutations/useCreateFlows';
export { useUpdateFlows } from './mutations/useUpdateFlows';
export { useDeleteFlows } from './mutations/useDeleteFlows';
```

### 3.6 Query Composable Rules (CRITICAL)

When creating query composables, follow these rules:

1. **Variables**: Always use `computed()` - never `ref(computed.value)`
   ```typescript
   // ✅ CORRECT: Pass computed directly
   const variables = computed(() => ({ formId: formId.value ?? '' }));

   // ❌ WRONG: ref(computed.value) creates STATIC ref that never updates!
   const variables = ref(computed.value);
   ```

2. **Enabled**: Always use `computed()` - enables reactive query toggling
   ```typescript
   const enabled = computed(() => !!formId.value);
   ```

3. **Data extraction**: Always use `computed()` with safe navigation
   ```typescript
   const flows = computed(() => result.value?.flows ?? []);
   const sharedFlow = computed(() => flows.value.find(f => f.flow_type === 'shared') ?? null);
   ```

---

## Phase 4: Timeline Editor Migration

### 4.1 Update useTimelineBranching

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineBranching.ts`

Key changes:

```typescript
// OLD: In-memory flowMembership manipulation
function enableBranching(ratingStepId: string, threshold = 4) {
  steps.value.forEach((step, index) => {
    step.flowMembership = index <= ratingIndex ? 'shared' : 'testimonial';
  });
  addDefaultImprovementSteps();
}

// NEW: Create flows in DB, assign flowId to steps
async function enableBranching(ratingStepId: string, threshold = 4) {
  const { createFlows } = useCreateFlows();

  // 1. Create flows in database
  const flowInputs = createDefaultFlows(formId.value, organizationId.value, threshold);
  const createdFlows = await createFlows({ inputs: flowInputs });

  // 2. Map flows by type
  const sharedFlow = createdFlows.find(f => f.flow_type === 'shared');
  const testimonialFlow = createdFlows.find(f => f.flow_type === 'branch' &&
    (f.branch_condition as BranchCondition)?.op === 'greater_than_or_equal_to');
  const improvementFlow = createdFlows.find(f => f.flow_type === 'branch' &&
    (f.branch_condition as BranchCondition)?.op === 'less_than');

  // 3. Assign flowId to existing steps
  const ratingIndex = steps.value.findIndex(s => s.id === ratingStepId);
  steps.value.forEach((step, index) => {
    if (index <= ratingIndex) {
      step.flowId = sharedFlow!.id;
      step.flow = sharedFlow;
    } else {
      step.flowId = testimonialFlow!.id;
      step.flow = testimonialFlow;
    }
    step.isModified = true;
  });

  // 4. Add default improvement steps with improvementFlow.id
  addDefaultImprovementSteps(improvementFlow!.id);

  // 5. Update branching config (can be deprecated later)
  branchingConfig.value = {
    enabled: true,
    threshold,
    ratingStepId,
  };
}
```

### 4.2 Update useBranchingDisable

**File:** `apps/web/src/features/createForm/composables/timeline/useBranchingDisable.ts`

Key changes:

```typescript
// OLD: Filter by flowMembership, delete steps
function disableBranchingKeepTestimonial() {
  const filtered = steps.value.filter(s => s.flowMembership !== 'improvement');
  steps.value = filtered;
  steps.value.forEach(step => step.flowMembership = 'shared');
}

// NEW: Delete improvement flow, reassign steps to shared flow
async function disableBranchingKeepTestimonial() {
  const { deleteFlows } = useDeleteFlows();

  // 1. Find flows
  const sharedFlow = flows.value.find(f => f.flow_type === 'shared');
  const improvementFlow = flows.value.find(f => deriveFlowMembership(f) === 'improvement');

  // 2. Delete improvement flow (cascade deletes steps or reassign first)
  if (improvementFlow) {
    // Remove improvement steps from local state
    const filtered = steps.value.filter(s => s.flowId !== improvementFlow.id);
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Delete flow from DB
    await deleteFlows({ ids: [improvementFlow.id] });
  }

  // 3. Reassign testimonial steps to shared flow
  const testimonialFlow = flows.value.find(f => deriveFlowMembership(f) === 'testimonial');
  steps.value.forEach(step => {
    if (step.flowId === testimonialFlow?.id) {
      step.flowId = sharedFlow!.id;
      step.flow = sharedFlow;
      step.isModified = true;
    }
  });

  // 4. Delete testimonial flow
  if (testimonialFlow) {
    await deleteFlows({ ids: [testimonialFlow.id] });
  }

  // 5. Reset branching config
  branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };
}
```

### 4.3 Update useSaveFormSteps

**File:** `apps/web/src/features/createForm/composables/timeline/useSaveFormSteps.ts`

Key changes:

```typescript
// OLD: Save flowMembership and forms.branching_config
function mapStepToInput(step: StepForMapping, organizationId: string, userId?: string) {
  return {
    // ...
    flow_membership: step.flowMembership,
  };
}

async function saveBranchingConfig(): Promise<boolean> {
  const branchingConfig = serializeBranchingConfig(editor.branchingConfig.value);
  await updateForm({ id: formId, changes: { branching_config: branchingConfig } });
}

// NEW: Save flowId, flows.branch_condition already persisted during enableBranching
function mapStepToInput(step: StepForMapping, organizationId: string, userId?: string) {
  return {
    // ...
    flow_id: step.flowId,
    // flow_membership can be removed once migration is complete
  };
}

// saveBranchingConfig can be simplified or removed entirely
// as branching state is now represented by existence of flows
```

### 4.4 Update Computed Properties

Update all computed properties that filter by `flowMembership`:

```typescript
// OLD
const testimonialSteps = computed(() =>
  steps.value.filter(s => s.flowMembership === 'testimonial')
);

// NEW
const testimonialSteps = computed(() => {
  const flow = flows.value.find(f => deriveFlowMembership(f) === 'testimonial');
  return flow ? steps.value.filter(s => s.flowId === flow.id) : [];
});
```

---

## Phase 5: Step Transform Functions

### 5.1 Update stepTransform.ts

**File:** `apps/web/src/features/createForm/functions/stepTransform.ts`

```typescript
// OLD: Transform DB step to local FormStep
function transformDbStepToLocal(dbStep: FormStepBasicFragment): FormStep {
  return {
    // ...
    flowMembership: dbStep.flow_membership as FlowMembership,
  };
}

// NEW: Derive flowMembership from flow relationship
function transformDbStepToLocal(dbStep: FormStepBasicFragment): FormStep {
  const flow = dbStep.flow;
  const flowMembership = flow ? deriveFlowMembership(flow) : 'shared';

  return {
    // ...
    flowId: dbStep.flow_id,
    flow: flow ?? null,
    flowMembership, // Backward compat, derived from flow
  };
}
```

---

## Phase 6: Threshold Configuration

### 6.1 Update RatingStepEditor

**File:** `apps/web/src/features/createForm/ui/stepEditor/editors/RatingStepEditor.vue`

Key changes:

```typescript
// OLD: Update forms.branching_config.threshold
function updateThreshold(newThreshold: number) {
  editor.setBranchingThreshold(newThreshold);
}

// NEW: Update flows.branch_condition for both branch flows
async function updateThreshold(newThreshold: number) {
  const { updateFlows } = useUpdateFlows();

  const testimonialFlow = flows.value.find(f => deriveFlowMembership(f) === 'testimonial');
  const improvementFlow = flows.value.find(f => deriveFlowMembership(f) === 'improvement');

  if (testimonialFlow && improvementFlow) {
    await updateFlows({
      updates: [
        {
          where: { id: { _eq: testimonialFlow.id } },
          _set: {
            branch_condition: { field: 'rating', op: 'greater_than_or_equal_to', value: newThreshold },
          },
        },
        {
          where: { id: { _eq: improvementFlow.id } },
          _set: {
            branch_condition: { field: 'rating', op: 'less_than', value: newThreshold },
          },
        },
      ],
    });
  }

  // Also update local branchingConfig for backward compat
  editor.setBranchingThreshold(newThreshold);
}
```

---

## Phase 7: Public Form Runtime

### 7.1 Update usePublicFormFlow

**File:** `apps/web/src/features/publicForm/composables/usePublicFormFlow.ts`

```typescript
// OLD: Evaluate from forms.branching_config
function determineFlow(ratingValue: number): FlowMembership {
  const threshold = branchingConfig.value.threshold;
  return ratingValue >= threshold ? 'testimonial' : 'improvement';
}

// NEW: Evaluate from flows.branch_condition
function determineFlow(ratingValue: number): string {
  const branchFlows = flows.value.filter(f => f.flow_type === 'branch');

  for (const flow of branchFlows) {
    const condition = flow.branch_condition as BranchCondition | null;
    if (!condition) continue;

    if (evaluateBranchCondition(condition, ratingValue)) {
      return flow.id;
    }
  }

  // Fallback to testimonial flow
  return branchFlows[0]?.id ?? '';
}

function evaluateBranchCondition(condition: BranchCondition, value: number): boolean {
  switch (condition.op) {
    case '>=': return value >= (condition.value as number);
    case '>':  return value > (condition.value as number);
    case '<=': return value <= (condition.value as number);
    case '<':  return value < (condition.value as number);
    case '=':  return value === (condition.value as number);
    case '!=': return value !== (condition.value as number);
    case 'between': {
      const [min, max] = condition.value as [number, number];
      return value >= min && value <= max;
    }
    default: return false;
  }
}
```

---

## Phase 8: Backward Compatibility & Cleanup

### 8.1 Migration for Existing Forms

Forms created before this migration need flows created:

```typescript
// Run once for each form without flows
async function migrateFormToFlows(formId: string, organizationId: string) {
  const { createFlows } = useCreateFlows();

  // Check if form already has flows
  const existingFlows = await getFlowsByFormId(formId);
  if (existingFlows.length > 0) return;

  // Read existing branching_config
  const form = await getFormById(formId);
  const branchingConfig = parseBranchingConfig(form.branching_config);

  // Create flows based on existing config
  if (branchingConfig.enabled) {
    const flowInputs = createDefaultFlows(formId, organizationId, branchingConfig.threshold);
    const createdFlows = await createFlows({ inputs: flowInputs });

    // Map flows by type
    const sharedFlow = createdFlows.find(f => f.flow_type === 'shared');
    const testimonialFlow = createdFlows.find(f =>
      (f.branch_condition as BranchCondition)?.op === 'greater_than_or_equal_to');
    const improvementFlow = createdFlows.find(f =>
      (f.branch_condition as BranchCondition)?.op === 'less_than');

    // Update existing steps with flow_id
    const steps = await getFormSteps(formId);
    for (const step of steps) {
      let flowId: string;
      switch (step.flow_membership) {
        case 'shared': flowId = sharedFlow!.id; break;
        case 'testimonial': flowId = testimonialFlow!.id; break;
        case 'improvement': flowId = improvementFlow!.id; break;
      }
      await updateFormStep(step.id, { flow_id: flowId });
    }
  } else {
    // Create only shared flow for non-branching forms
    const flowInputs = [{
      form_id: formId,
      organization_id: organizationId,
      name: 'Shared Steps',
      flow_type: 'shared' as const,
      branch_condition: null,
      display_order: 0,
    }];
    const [sharedFlow] = await createFlows({ inputs: flowInputs });

    // Update all steps with shared flow_id
    const steps = await getFormSteps(formId);
    for (const step of steps) {
      await updateFormStep(step.id, { flow_id: sharedFlow.id });
    }
  }
}
```

### 8.2 Deprecation Timeline

| Phase | Target Date | Action |
|-------|-------------|--------|
| Phase 1-7 | Week 1-2 | Implement new flows-based logic |
| Phase 8 | Week 3 | Run backfill migration for existing forms |
| Phase 9 | Week 4+ | Monitor, fix edge cases |
| Phase 10 | After stable | Drop `flow_membership` column |
| Phase 11 | After stable | Drop `forms.branching_config` column |

---

## Phase 9: Drop Legacy Columns

After the frontend migration is complete and stable, remove the deprecated columns.

### 9.1 Drop `flow_membership` Column

**Prerequisites:**
- All frontend code uses `flowId` instead of `flowMembership`
- No GraphQL queries/mutations reference `flow_membership`
- Backfill migration has run for all existing forms

**Migration:** `form_steps__drop_flow_membership_column`

**up.sql:**
```sql
-- =====================================================
-- Drop flow_membership Column
-- =====================================================
-- Purpose: Remove deprecated flow_membership column after frontend
--          migration to flow_id is complete.
--
-- Prerequisites:
--   - All frontend code uses flowId instead of flowMembership
--   - No GraphQL queries/mutations reference flow_membership
--   - All form_steps have valid flow_id values
--
-- This is a BREAKING CHANGE - ensure frontend is fully migrated first.

-- Drop the index first
DROP INDEX IF EXISTS public.idx_form_steps_flow_membership;

-- Drop the column
ALTER TABLE public.form_steps
DROP COLUMN IF EXISTS flow_membership;
```

**down.sql:**
```sql
-- =====================================================
-- Restore flow_membership Column
-- =====================================================
-- WARNING: This will add the column back but data will be NULL.
--          You must run a backfill to populate from flow_id.

-- Re-add the column (nullable, no constraint)
ALTER TABLE public.form_steps
ADD COLUMN flow_membership TEXT;

-- Re-create the index
CREATE INDEX idx_form_steps_flow_membership
ON public.form_steps(form_id, flow_membership);

-- Backfill from flow relationship
UPDATE public.form_steps fs
SET flow_membership = CASE
    WHEN f.flow_type = 'shared' THEN 'shared'
    WHEN f.branch_condition->>'op' IN ('greater_than_or_equal_to', 'greater_than') THEN 'testimonial'
    WHEN f.branch_condition->>'op' IN ('less_than', 'less_than_or_equal_to') THEN 'improvement'
    ELSE 'shared'
END
FROM public.flows f
WHERE fs.flow_id = f.id;

-- Make NOT NULL after backfill
ALTER TABLE public.form_steps
ALTER COLUMN flow_membership SET NOT NULL;

-- Set default
ALTER TABLE public.form_steps
ALTER COLUMN flow_membership SET DEFAULT 'shared';

-- Add documentation
COMMENT ON COLUMN public.form_steps.flow_membership IS
  'Which flow this step belongs to: shared (all paths), testimonial (positive rating), or improvement (negative rating)';
```

### 9.2 Drop `branching_config` Column from Forms

**Prerequisites:**
- All frontend code reads branching state from `flows` table
- No GraphQL queries/mutations reference `branching_config`

**Migration:** `forms__drop_branching_config_column`

**up.sql:**
```sql
-- =====================================================
-- Drop branching_config Column
-- =====================================================
-- Purpose: Remove deprecated branching_config JSONB column after
--          migration to flows table is complete.
--
-- Prerequisites:
--   - All frontend code reads branching from flows table
--   - No GraphQL queries/mutations reference branching_config
--
-- This is a BREAKING CHANGE - ensure frontend is fully migrated first.

-- Drop the column
ALTER TABLE public.forms
DROP COLUMN IF EXISTS branching_config;
```

**down.sql:**
```sql
-- =====================================================
-- Restore branching_config Column
-- =====================================================
-- WARNING: This will add the column back but data will be default.
--          You must run a backfill to populate from flows table.

-- Re-add the column with default
ALTER TABLE public.forms
ADD COLUMN branching_config JSONB NOT NULL DEFAULT '{"enabled": false, "threshold": 4, "ratingStepId": null}';

-- Backfill from flows table
UPDATE public.forms f
SET branching_config = jsonb_build_object(
    'enabled', EXISTS (SELECT 1 FROM public.flows fl WHERE fl.form_id = f.id AND fl.flow_type = 'branch'),
    'threshold', COALESCE(
        (SELECT (fl.branch_condition->>'value')::int
         FROM public.flows fl
         WHERE fl.form_id = f.id
           AND fl.flow_type = 'branch'
           AND fl.branch_condition->>'op' = 'greater_than_or_equal_to'
         LIMIT 1),
        4
    ),
    'ratingStepId', (
        SELECT fs.id
        FROM public.form_steps fs
        JOIN public.flows fl ON fs.flow_id = fl.id
        WHERE fl.form_id = f.id
          AND fl.flow_type = 'shared'
          AND fs.step_type = 'rating'
        ORDER BY fs.step_order DESC
        LIMIT 1
    )
);

-- Add documentation
COMMENT ON COLUMN public.forms.branching_config IS
  'Branching configuration: { enabled: boolean, threshold: number, ratingStepId: string | null }';
```

### 9.3 Update GraphQL/Hasura Metadata

After dropping columns, update Hasura metadata to remove them from:
- Select permissions
- Insert permissions
- Update permissions

**Files to update:**
- `db/hasura/metadata/databases/default/tables/public_form_steps.yaml` - Remove `flow_membership`
- `db/hasura/metadata/databases/default/tables/public_forms.yaml` - Remove `branching_config`

---

## Files to Modify

### GraphQL (New)
- `apps/web/src/entities/flow/graphql/queries/getFlowsByFormId.gql`
- `apps/web/src/entities/flow/graphql/mutations/updateFlows.gql`
- `apps/web/src/entities/flow/graphql/mutations/deleteFlows.gql`

### GraphQL (Modify)
- `apps/web/src/entities/formStep/graphql/fragments/FormStepBasic.gql`
- `apps/web/src/entities/formStep/graphql/queries/getFormSteps.gql`
- `apps/web/src/entities/formStep/graphql/mutations/upsertFormSteps.gql`

### Types (New)
- `apps/web/src/entities/flow/models/flow.ts`

### Types (Modify)
- `apps/web/src/shared/stepCards/models/stepContent.ts`
- `apps/web/src/entities/form/models/branchingConfig.ts` (deprecation notes)

### Composables (New)
- `apps/web/src/entities/flow/composables/queries/useGetFlowsByFormId.ts`
- `apps/web/src/entities/flow/composables/mutations/useUpdateFlows.ts`
- `apps/web/src/entities/flow/composables/mutations/useDeleteFlows.ts`

### Composables (Modify - 17 files using flowMembership)
- `apps/web/src/features/createForm/composables/timeline/useTimelineEditor.ts`
- `apps/web/src/features/createForm/composables/timeline/useTimelineBranching.ts`
- `apps/web/src/features/createForm/composables/timeline/useBranchingDisable.ts`
- `apps/web/src/features/createForm/composables/timeline/useBranchingDetection.ts`
- `apps/web/src/features/createForm/composables/timeline/useSaveFormSteps.ts`
- `apps/web/src/features/createForm/composables/timeline/useFlowNavigation.ts`
- `apps/web/src/features/createForm/composables/timeline/useStepOperations.ts`
- `apps/web/src/features/createForm/composables/useCreateFormWithSteps.ts`
- `apps/web/src/features/createForm/composables/useQuestionEditorPanel.ts`
- `apps/web/src/features/createForm/composables/useFormEditor.ts`
- `apps/web/src/features/createForm/composables/useCreateFormWizard.ts`
- `apps/web/src/features/publicForm/composables/usePublicFormFlow.ts`

### Functions (Modify)
- `apps/web/src/features/createForm/functions/stepTransform.ts`

### Components (Modify)
- `apps/web/src/features/createForm/ui/stepEditor/editors/RatingStepEditor.vue`
- `apps/web/src/features/createForm/ui/propertiesPanel/BranchingSettings.vue`
- `apps/web/src/features/createForm/ui/formStudio/TimelineSidebar.vue`
- `apps/web/src/features/createForm/ui/wizard/screens/PreviewScreen.vue`
- `apps/web/src/features/createForm/ui/wizard/components/PreviewStepCard.vue`
- `apps/web/src/features/createForm/ui/wizard/components/BranchingFlowPreview.vue`

---

## Toggle State Change Summary

### When Enable Branching Toggle is Activated

**Before (Current - flowMembership):**
1. Set `branchingConfig` with threshold and ratingStepId
2. Update `step.flowMembership` in memory for each step
3. Create improvement steps with `flowMembership: 'improvement'`
4. On save: Update `forms.branching_config` JSONB, upsert steps with `flow_membership`

**After (Target - flows table):**
1. **Create 3 flows** in database via `useCreateFlows`:
   - Shared flow (`flow_type: 'shared'`, no condition)
   - Testimonial flow (`flow_type: 'branch'`, `branch_condition: {field:'rating',op:'greater_than_or_equal_to',value:threshold}`)
   - Improvement flow (`flow_type: 'branch'`, `branch_condition: {field:'rating',op:'less_than',value:threshold}`)
2. **Assign `flowId`** to each existing step based on position relative to rating step
3. **Create improvement steps** with `flowId` pointing to improvement flow
4. On save: Upsert steps with `flow_id` (flows already created)

### When Disable Branching Toggle is Activated

**Before (Current - flowMembership):**
1. Show modal if branched steps exist (keep testimonial / keep improvement / delete all)
2. Filter out unwanted steps in memory
3. Set remaining steps' `flowMembership` to `'shared'`
4. Reset `branchingConfig`
5. On save: Update `forms.branching_config`, upsert/delete steps

**After (Target - flows table):**
1. Show modal if branched steps exist (same options)
2. **Delete branch flows** via `useDeleteFlows` (cascade deletes steps if not reassigned first)
3. **Reassign kept steps** to shared flow (update `flowId`)
4. Reset `branchingConfig` (backward compat)
5. On save: Steps already reassigned, no additional flow operations needed

---

## Testing Checklist

### Phase 1-2: GraphQL & Types
- [ ] `getFlowsByFormId` query returns flows with steps
- [ ] `updateFlows` mutation updates branch_condition
- [ ] `deleteFlows` mutation removes flows
- [ ] Generated types include Flow entity
- [ ] FormStep type includes flowId and flow relationship

### Phase 3: Flow Composables
- [ ] `useGetFlowsByFormId` loads flows correctly
- [ ] `useCreateFlows` creates 3 default flows
- [ ] `useUpdateFlows` updates threshold condition
- [ ] `useDeleteFlows` removes flows

### Phase 4-5: Timeline Editor
- [ ] Enable branching creates flows in DB
- [ ] Steps assigned correct flowId
- [ ] Disable branching deletes branch flows
- [ ] Keep testimonial/improvement works correctly
- [ ] Step transform derives flowMembership from flow

### Phase 6: Threshold
- [ ] Threshold change updates flow.branch_condition
- [ ] UI reflects new threshold

### Phase 7: Public Form
- [ ] Runtime evaluates branch_condition correctly
- [ ] Correct flow shown based on rating

### Phase 8: Migration
- [ ] Existing forms migrated to flows table
- [ ] No regressions for forms without branching

### Phase 9: Drop Legacy Columns
- [ ] All frontend code verified to use `flowId` (no `flowMembership` references)
- [ ] All GraphQL operations verified to not reference `flow_membership`
- [ ] All GraphQL operations verified to not reference `branching_config`
- [ ] `flow_membership` column dropped successfully
- [ ] `branching_config` column dropped successfully
- [ ] Hasura metadata updated (permissions cleaned)
- [ ] No runtime errors after column drops

---

## Rollback Strategy

If issues are discovered after deployment:

1. **Feature flag**: Add `USE_FLOWS_TABLE` flag to toggle between old/new logic
2. **Dual-write**: Continue populating `flow_membership` during transition
3. **Read fallback**: If `flowId` is null, fall back to `flowMembership` logic
4. **Database**: `flow_membership` column remains populated, can revert to old logic

---

## Future Enhancements (Enabled by This Migration)

1. **Custom threshold per flow** - Edit `flows.branch_condition.value`
2. **Named flows** - Edit `flows.name`
3. **NPS 3-way branching** - Add third branch flow with `between` condition
4. **Non-rating branches** - Change `branch_condition.field` to question reference
5. **Multiple branch points** - Add more flows with different conditions
