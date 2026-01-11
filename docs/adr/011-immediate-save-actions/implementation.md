# Implementation Plan: ADR-011 Immediate Save Actions

> Implement immediate save mutations for discrete user actions in the form studio.

**ADR:** `docs/adr/011-immediate-save-actions/adr.md`
**Status:** Not Started
**Created:** January 11, 2026
**Depends On:** ADR-010 (Completed)

---

## Overview

ADR-010 established centralized auto-save for **typed content** (debounced 500ms). This plan implements **immediate saves** for discrete user actions (buttons, toggles, dropdowns, drag-drop).

### Current State Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WHAT EXISTS                                                             │
│ ─────────────                                                           │
│ ✅ Auto-save infrastructure (ADR-010)                                   │
│    • useDirtyTracker.ts - ID tracking with Sets                         │
│    • useAutoSaveController.ts - useIdle(500ms) trigger                  │
│    • watchers.ts - 6 watchers for text fields                           │
│    • handlers.ts - 5 save functions                                     │
│                                                                         │
│ ✅ Entity Mutations Available                                           │
│    • formStep: useCreateFormSteps, useDeleteFormSteps, useUpsertFormSteps│
│    • formQuestion: useCreateFormQuestion, useUpdateFormQuestion          │
│    • flow: useCreateFlows, useDeleteFlow, useUpdateFlow                 │
│                                                                         │
│ ⚠️ Partial Implementation                                               │
│    • useTimelineStepCrud.ts - local state only, no persistence          │
│    • QuestionOptionBasic.gql fragment exists (in formQuestion entity)   │
│                                                                         │
│ ❌ Missing                                                               │
│    • useSaveLock.ts - save coordination                                 │
│    • questionOption entity - no composable wrappers                     │
│    • useQuestionSettings.ts - question settings persistence             │
│    • useQuestionOptions.ts - option CRUD persistence                    │
│    • useFlowSettings.ts - flow settings persistence                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Target State

```
┌─────────────────────────────────────────────────────────────────────────┐
│ IMMEDIATE SAVE SYSTEM                                                   │
│ ─────────────────────────                                               │
│                                                                         │
│ Save Coordination                                                       │
│ ├── useSaveLock.ts              ~ 60 lines (shared lock)                │
│ └── useAutoSaveController.ts    ~ +10 lines (lock integration)          │
│                                                                         │
│ Entity Layer                                                            │
│ └── entities/questionOption/                                            │
│     ├── graphql/mutations/      ~ 4 files                               │
│     ├── composables/mutations/  ~ 4 composables                         │
│     └── models/                 ~ type exports                          │
│                                                                         │
│ Feature Layer (Immediate Save Composables)                              │
│ ├── useQuestionSettings.ts      ~ 50 lines                              │
│ ├── useQuestionOptions.ts       ~ 80 lines                              │
│ ├── useFlowSettings.ts          ~ 40 lines                              │
│ └── useTimelineStepCrud.ts      ~ +100 lines (persistence enhancement)  │
│                                                                         │
│ Total New Code: ~500-600 lines                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### New Files

```
apps/web/src/
├── entities/
│   └── questionOption/                     # NEW ENTITY
│       ├── graphql/
│       │   ├── fragments/
│       │   │   └── QuestionOptionFields.gql
│       │   └── mutations/
│       │       ├── CreateQuestionOption.gql
│       │       ├── DeleteQuestionOption.gql
│       │       ├── UpdateQuestionOption.gql
│       │       └── UpsertQuestionOptions.gql
│       ├── composables/
│       │   ├── mutations/
│       │   │   ├── useCreateQuestionOption.ts
│       │   │   ├── useDeleteQuestionOption.ts
│       │   │   ├── useUpdateQuestionOption.ts
│       │   │   ├── useUpsertQuestionOptions.ts
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── models/
│       │   └── index.ts
│       └── index.ts
│
└── features/createForm/composables/
    ├── autoSave/
    │   └── useSaveLock.ts                  # NEW
    ├── useQuestionSettings.ts              # NEW
    ├── useQuestionOptions.ts               # NEW
    ├── useFlowSettings.ts                  # NEW
    └── timeline/
        └── useTimelineStepCrud.ts          # ENHANCED
```

### Modified Files

```
apps/web/src/features/createForm/composables/
├── autoSave/
│   ├── index.ts                            # Export useSaveLock
│   └── useAutoSaveController.ts            # Use lock
└── timeline/
    └── useTimelineStepCrud.ts              # Add persistence
```

---

## Phase 0: Save Coordination Infrastructure

### Story: SAVE-001 - Create Save Lock

Create the shared save lock for coordinating immediate and debounced saves.

**File:** `apps/web/src/features/createForm/composables/autoSave/useSaveLock.ts`

```typescript
/**
 * Save Lock - Coordinates immediate and debounced saves
 *
 * Prevents race conditions between immediate saves (discrete actions)
 * and debounced saves (text content). Uses createSharedComposable
 * for singleton pattern across all composables.
 *
 * Usage:
 * - Immediate saves: await withLock('add-step', async () => { ... })
 * - Auto-save controller: check isLocked before executing
 */
import { ref, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';

export const useSaveLock = createSharedComposable(() => {
  const isLocked = ref(false);
  const lockReason = ref<string | null>(null);

  const acquireLock = (reason: string): boolean => {
    if (isLocked.value) return false;
    isLocked.value = true;
    lockReason.value = reason;
    return true;
  };

  const releaseLock = () => {
    isLocked.value = false;
    lockReason.value = null;
  };

  /**
   * Execute a function with exclusive save lock.
   * Throws if lock is already held (defensive - UI should prevent this).
   */
  const withLock = async <T>(reason: string, fn: () => Promise<T>): Promise<T> => {
    if (!acquireLock(reason)) {
      throw new Error(`Save in progress: ${lockReason.value}`);
    }
    try {
      return await fn();
    } finally {
      releaseLock();
    }
  };

  return {
    isLocked: readonly(isLocked),
    lockReason: readonly(lockReason),
    withLock,
    acquireLock,
    releaseLock,
  };
});
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Uses `createSharedComposable` for singleton pattern
- [ ] `acquireLock` returns false if already locked
- [ ] `withLock` throws if cannot acquire lock
- [ ] Lock is released in finally block (even on error)
- [ ] `pnpm typecheck` passes

---

### Story: SAVE-002 - Integrate Lock with Auto-Save Controller

Update `useAutoSaveController.ts` to respect the save lock.

**File:** `apps/web/src/features/createForm/composables/autoSave/useAutoSaveController.ts`

**Changes:**

```typescript
// Add import
import { useSaveLock } from './useSaveLock';

// Inside the composable, add lock usage
const { isLocked, acquireLock, releaseLock } = useSaveLock();

const executeSave = async () => {
  // Skip if already locked (immediate save in progress)
  if (isLocked.value) {
    console.log('[AutoSave] Skipped - immediate save in progress');
    return;
  }

  if (!hasPendingChanges.value) return;

  // Try to acquire lock
  if (!acquireLock('auto-save')) {
    console.log('[AutoSave] Could not acquire lock');
    return;
  }

  saveStatus.value = 'saving';
  const toSave = snapshot();

  try {
    // ... existing save logic ...
  } catch (error) {
    // ... existing error handling ...
  } finally {
    releaseLock();
  }
};
```

**Acceptance Criteria:**
- [ ] Imports `useSaveLock`
- [ ] Checks `isLocked` before attempting save
- [ ] Acquires lock before saving, releases in finally
- [ ] Skips save gracefully if lock unavailable (dirty state preserved)
- [ ] `pnpm typecheck` passes

---

### Story: SAVE-003 - Export Save Lock

Update the autoSave index to export the new composable.

**File:** `apps/web/src/features/createForm/composables/autoSave/index.ts`

**Add export:**

```typescript
export { useSaveLock } from './useSaveLock';
```

**Acceptance Criteria:**
- [ ] `useSaveLock` exported from index
- [ ] Can import from `@/features/createForm/composables/autoSave`

---

## Phase 1: Question Options Entity

### Story: OPT-001 - Create Question Option Entity Structure

Create the entity folder structure following FSD patterns.

**⚠️ IMPORTANT: Use `/graphql-code` Skill**

This story should be executed using the `/graphql-code` skill which provides:
- Schema validation via `tm-graph` MCP tools
- GraphQL file patterns (fragments, queries, mutations)
- Codegen commands
- Composable patterns following project standards
- Type safety rules for models

**Skill Invocation:**
```
/graphql-code
```

**Skill Workflow:**
```
1. Validate schema → 2. Create .gql files → 3. Run codegen → 4. Create composables → 5. Create models
```

**Pre-Validation (via tm-graph MCP):**
```typescript
// Before creating files, validate the table exists and check available operations
mcp__tm-graph__get-type-info({ type_name: "question_options" })
mcp__tm-graph__search-schema({ query: "question_options" })
mcp__tm-graph__list-mutations()  // Verify insert/update/delete available
```

**Directory Structure:**

```
entities/questionOption/
├── graphql/
│   ├── fragments/
│   │   └── QuestionOptionFields.gql
│   └── mutations/
│       ├── CreateQuestionOption.gql
│       ├── DeleteQuestionOption.gql
│       ├── UpdateQuestionOption.gql
│       └── UpsertQuestionOptions.gql
├── composables/
│   ├── mutations/
│   │   ├── useCreateQuestionOption.ts
│   │   ├── useDeleteQuestionOption.ts
│   │   ├── useUpdateQuestionOption.ts
│   │   ├── useUpsertQuestionOptions.ts
│   │   └── index.ts
│   └── index.ts
├── models/
│   ├── index.ts
│   └── mutations.ts
└── index.ts
```

**Note:** The `QuestionOptionBasic.gql` fragment already exists in `entities/formQuestion/graphql/fragments/`. We can either:
1. Move it to the new entity and update imports
2. Create a new `QuestionOptionFields.gql` that extends it
3. Re-export from questionOption entity

**Recommendation:** Option 3 - re-export to minimize changes.

---

### Story: OPT-002 - Create GraphQL Mutations

**Part of `/graphql-code` skill workflow** - Step 2: Create .gql files

**File:** `entities/questionOption/graphql/mutations/CreateQuestionOption.gql`

```graphql
#import "../../formQuestion/graphql/fragments/QuestionOptionBasic.gql"

mutation CreateQuestionOption($input: question_options_insert_input!) {
  insert_question_options_one(object: $input) {
    ...QuestionOptionBasic
  }
}
```

**File:** `entities/questionOption/graphql/mutations/DeleteQuestionOption.gql`

```graphql
mutation DeleteQuestionOption($id: String!) {
  delete_question_options_by_pk(id: $id) {
    id
  }
}
```

**File:** `entities/questionOption/graphql/mutations/UpdateQuestionOption.gql`

```graphql
#import "../../formQuestion/graphql/fragments/QuestionOptionBasic.gql"

mutation UpdateQuestionOption($id: String!, $changes: question_options_set_input!) {
  update_question_options_by_pk(pk_columns: { id: $id }, _set: $changes) {
    ...QuestionOptionBasic
  }
}
```

**File:** `entities/questionOption/graphql/mutations/UpsertQuestionOptions.gql`

```graphql
#import "../../formQuestion/graphql/fragments/QuestionOptionBasic.gql"

mutation UpsertQuestionOptions($inputs: [question_options_insert_input!]!) {
  insert_question_options(
    objects: $inputs
    on_conflict: {
      constraint: question_options_pkey
      update_columns: [option_label, option_value, display_order, is_default, is_active]
    }
  ) {
    returning {
      ...QuestionOptionBasic
    }
  }
}
```

**Post-Creation:** Run codegen to generate TypeScript types:
```bash
pnpm codegen:web
```

**Acceptance Criteria:**
- [ ] All 4 mutation files created with correct `#import` statements
- [ ] Uses existing `QuestionOptionBasic` fragment from formQuestion entity
- [ ] `pnpm codegen:web` generates types without errors
- [ ] Verify generated types in `apps/web/src/shared/graphql/generated/operations.ts`

---

### Story: OPT-003 - Create Mutation Composables

**Part of `/graphql-code` skill workflow** - Step 4: Create composables

Create composables following the mutation composable pattern from the skill.

**File:** `entities/questionOption/composables/mutations/useCreateQuestionOption.ts`

```typescript
import { computed } from 'vue';
import {
  useCreateQuestionOptionMutation,
  type CreateQuestionOptionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateQuestionOption() {
  const { mutate, loading, error, onDone, onError } = useCreateQuestionOptionMutation();

  const hasError = computed(() => error.value !== null);

  const createQuestionOption = async (input: CreateQuestionOptionMutationVariables['input']) => {
    const result = await mutate({ input });
    if (!result?.data?.insert_question_options_one) {
      throw new Error('Failed to create question option');
    }
    return result.data.insert_question_options_one;
  };

  return {
    mutate,
    createQuestionOption,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

**File:** `entities/questionOption/composables/mutations/useDeleteQuestionOption.ts`

```typescript
import { computed } from 'vue';
import {
  useDeleteQuestionOptionMutation,
  type DeleteQuestionOptionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useDeleteQuestionOption() {
  const { mutate, loading, error, onDone, onError } = useDeleteQuestionOptionMutation();

  const hasError = computed(() => error.value !== null);

  const deleteQuestionOption = async (variables: DeleteQuestionOptionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.delete_question_options_by_pk ?? null;
  };

  return {
    mutate,
    deleteQuestionOption,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

**File:** `entities/questionOption/composables/mutations/useUpdateQuestionOption.ts`

```typescript
import { computed } from 'vue';
import {
  useUpdateQuestionOptionMutation,
  type UpdateQuestionOptionMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpdateQuestionOption() {
  const { mutate, loading, error, onDone, onError } = useUpdateQuestionOptionMutation();

  const hasError = computed(() => error.value !== null);

  const updateQuestionOption = async (variables: UpdateQuestionOptionMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_question_options_by_pk ?? null;
  };

  return {
    mutate,
    updateQuestionOption,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

**File:** `entities/questionOption/composables/mutations/useUpsertQuestionOptions.ts`

```typescript
import { computed } from 'vue';
import {
  useUpsertQuestionOptionsMutation,
  type UpsertQuestionOptionsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useUpsertQuestionOptions() {
  const { mutate, loading, error, onDone, onError } = useUpsertQuestionOptionsMutation();

  const hasError = computed(() => error.value !== null);

  const upsertQuestionOptions = async (variables: UpsertQuestionOptionsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_question_options?.returning ?? [];
  };

  return {
    mutate,
    upsertQuestionOptions,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
```

**Acceptance Criteria:**
- [ ] All 4 mutation composables created following skill pattern
- [ ] Each returns: `mutate`, named function, `loading`, `error`, `hasError`, `onDone`, `onError`
- [ ] Uses generated `use*Mutation` hooks from `@/shared/graphql/generated/operations`
- [ ] Named functions throw on failure for clear error handling
- [ ] `pnpm typecheck` passes

---

### Story: OPT-004 - Create Entity Models and Exports

**Part of `/graphql-code` skill workflow** - Step 5: Create models + exports

**File:** `entities/questionOption/models/mutations.ts`

```typescript
/**
 * Question Option Mutation Types
 *
 * Re-export mutation variables and extract result types from generated GraphQL.
 * Following graphql-code skill type safety rules.
 */
import type {
  CreateQuestionOptionMutation,
  CreateQuestionOptionMutationVariables,
  DeleteQuestionOptionMutationVariables,
  UpdateQuestionOptionMutation,
  UpdateQuestionOptionMutationVariables,
  UpsertQuestionOptionsMutation,
  UpsertQuestionOptionsMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateQuestionOptionVariables = CreateQuestionOptionMutationVariables;
export type DeleteQuestionOptionVariables = DeleteQuestionOptionMutationVariables;
export type UpdateQuestionOptionVariables = UpdateQuestionOptionMutationVariables;
export type UpsertQuestionOptionsVariables = UpsertQuestionOptionsMutationVariables;

// Extract Mutation Result Types (from mutation response)
export type QuestionOptionCreateResult = NonNullable<
  CreateQuestionOptionMutation['insert_question_options_one']
>;
export type QuestionOptionUpdateResult = NonNullable<
  UpdateQuestionOptionMutation['update_question_options_by_pk']
>;
export type QuestionOptionUpsertResult =
  UpsertQuestionOptionsMutation['insert_question_options'];
```

**File:** `entities/questionOption/models/index.ts`

```typescript
/**
 * Question Option Models
 *
 * Barrel export for question option types.
 * Types extracted from GraphQL queries/mutations per graphql-code skill rules.
 */
export type * from './mutations';

// Utility types
export type QuestionOptionId = string;

// Re-export input types for convenience (these are used directly in mutations)
export type {
  Question_Options_Insert_Input,
  Question_Options_Set_Input,
} from '@/shared/graphql/generated/types';
```

**File:** `entities/questionOption/composables/mutations/index.ts`

```typescript
export { useCreateQuestionOption } from './useCreateQuestionOption';
export { useDeleteQuestionOption } from './useDeleteQuestionOption';
export { useUpdateQuestionOption } from './useUpdateQuestionOption';
export { useUpsertQuestionOptions } from './useUpsertQuestionOptions';
```

**File:** `entities/questionOption/composables/index.ts`

```typescript
export * from './mutations';
```

**File:** `entities/questionOption/index.ts`

```typescript
/**
 * Question Option Entity
 *
 * Provides CRUD operations for question options (multiple choice, radio, etc.)
 * Used by immediate save composables for discrete option actions.
 */
export * from './composables';
export * from './models';
```

**Acceptance Criteria:**
- [ ] Models follow `/graphql-code` skill type safety rules
- [ ] Types extracted from mutations (NOT re-exporting fragment types directly)
- [ ] All barrel exports created
- [ ] Can import from `@/entities/questionOption`
- [ ] Types and composables accessible
- [ ] `pnpm typecheck` passes

**Full `/graphql-code` Skill Checklist for Phase 1:**
- [ ] Create .gql files (fragments, mutations)
- [ ] Validate with `mcp__tm-graph__get-type-info`
- [ ] Run `pnpm codegen:web`
- [ ] Verify generated types in `operations.ts`
- [ ] Create models (mutations.ts, index.ts)
- [ ] Create composables using generated types
- [ ] Export through entity `index.ts`
- [ ] Test imports work correctly

---

## Phase 2: Feature Layer Composables

### Story: FEAT-001 - Create useQuestionSettings

Composable for persisting question settings changes immediately.

**File:** `apps/web/src/features/createForm/composables/useQuestionSettings.ts`

```typescript
/**
 * Question Settings - Immediate save for discrete question changes
 *
 * Wraps useUpdateFormQuestion with save lock for:
 * - Toggle required
 * - Change question type
 * - Set validation constraints
 */
import { useUpdateFormQuestion } from '@/entities/formQuestion/composables';
import { useSaveLock } from './autoSave';

export function useQuestionSettings() {
  const { updateFormQuestion } = useUpdateFormQuestion();
  const { withLock } = useSaveLock();

  const setRequired = async (questionId: string, isRequired: boolean) => {
    return withLock('question-required', async () => {
      await updateFormQuestion({
        id: questionId,
        changes: { is_required: isRequired },
      });
    });
  };

  const setQuestionType = async (questionId: string, questionTypeId: string) => {
    return withLock('question-type', async () => {
      await updateFormQuestion({
        id: questionId,
        changes: { question_type_id: questionTypeId },
      });
    });
  };

  const setValidation = async (
    questionId: string,
    validation: {
      min_value?: number | null;
      max_value?: number | null;
      min_length?: number | null;
      max_length?: number | null;
      scale_min?: number | null;
      scale_max?: number | null;
    }
  ) => {
    return withLock('question-validation', async () => {
      await updateFormQuestion({
        id: questionId,
        changes: validation,
      });
    });
  };

  return {
    setRequired,
    setQuestionType,
    setValidation,
  };
}
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Uses `withLock` for all mutations
- [ ] Lock reason is descriptive (for debugging)
- [ ] Returns promises that resolve after successful save
- [ ] `pnpm typecheck` passes

---

### Story: FEAT-002 - Create useQuestionOptions

Composable for persisting question option CRUD immediately.

**File:** `apps/web/src/features/createForm/composables/useQuestionOptions.ts`

```typescript
/**
 * Question Options - Immediate save for option CRUD
 *
 * Handles add/delete/reorder of question options with immediate persistence.
 * Uses the new questionOption entity composables.
 */
import { useCreateQuestionOption, useDeleteQuestionOption, useUpsertQuestionOptions } from '@/entities/questionOption';
import { useSaveLock } from './autoSave';

export function useQuestionOptions() {
  const { createQuestionOption } = useCreateQuestionOption();
  const { deleteQuestionOption } = useDeleteQuestionOption();
  const { upsertQuestionOptions } = useUpsertQuestionOptions();
  const { withLock } = useSaveLock();

  /**
   * Add a new option to a question.
   * Calculates display_order based on existing options.
   */
  const addOption = async (params: {
    questionId: string;
    organizationId: string;
    userId: string;
    label: string;
    value: string;
    displayOrder: number;
  }) => {
    return withLock('add-option', async () => {
      const result = await createQuestionOption({
        question_id: params.questionId,
        organization_id: params.organizationId,
        created_by: params.userId,
        option_label: params.label,
        option_value: params.value,
        display_order: params.displayOrder,
        is_default: false,
        is_active: true,
      });
      return result;
    });
  };

  /**
   * Delete an option by ID.
   */
  const removeOption = async (optionId: string) => {
    return withLock('remove-option', async () => {
      await deleteQuestionOption({ id: optionId });
    });
  };

  /**
   * Reorder options by upserting with new display_order values.
   */
  const reorderOptions = async (
    options: Array<{ id: string; display_order: number }>
  ) => {
    return withLock('reorder-options', async () => {
      await upsertQuestionOptions({
        inputs: options.map(o => ({
          id: o.id,
          display_order: o.display_order,
        })),
      });
    });
  };

  /**
   * Set an option as default (and unset others).
   */
  const setDefaultOption = async (
    questionId: string,
    optionId: string,
    allOptionIds: string[]
  ) => {
    return withLock('set-default-option', async () => {
      await upsertQuestionOptions({
        inputs: allOptionIds.map(id => ({
          id,
          is_default: id === optionId,
        })),
      });
    });
  };

  return {
    addOption,
    removeOption,
    reorderOptions,
    setDefaultOption,
  };
}
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] All CRUD operations use `withLock`
- [ ] `addOption` creates with all required fields
- [ ] `reorderOptions` uses upsert for batch update
- [ ] `pnpm typecheck` passes

---

### Story: FEAT-003 - Create useFlowSettings

Composable for persisting flow settings changes immediately.

**File:** `apps/web/src/features/createForm/composables/useFlowSettings.ts`

```typescript
/**
 * Flow Settings - Immediate save for flow changes
 *
 * Wraps existing flow mutations with save lock for:
 * - Update condition/settings
 * - Clear branching
 */
import { useUpdateFlow, useClearFlowBranchColumns } from '@/entities/flow/composables';
import { useSaveLock } from './autoSave';

export function useFlowSettings() {
  const { updateFlow } = useUpdateFlow();
  const { clearFlowBranchColumns } = useClearFlowBranchColumns();
  const { withLock } = useSaveLock();

  /**
   * Update flow properties (condition, etc.)
   */
  const updateFlowSettings = async (
    flowId: string,
    changes: {
      branch_question_id?: string | null;
      branch_option_id?: string | null;
      name?: string;
    }
  ) => {
    return withLock('update-flow', async () => {
      await updateFlow({ id: flowId, changes });
    });
  };

  /**
   * Clear all branching from a flow.
   */
  const clearBranching = async (flowId: string) => {
    return withLock('clear-branching', async () => {
      await clearFlowBranchColumns({ flowId });
    });
  };

  return {
    updateFlowSettings,
    clearBranching,
  };
}
```

**Acceptance Criteria:**
- [ ] File created at correct path
- [ ] Uses existing flow mutation composables
- [ ] All operations use `withLock`
- [ ] `pnpm typecheck` passes

---

### Story: FEAT-004 - Enhance useTimelineStepCrud with Persistence

Add immediate persistence to step CRUD operations.

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineStepCrud.ts`

**Key Changes:**

1. Import save lock and entity mutations
2. Create async versions of CRUD operations with persistence
3. Handle mutation order (question first, then step)
4. Include error recovery for multi-step operations

**Implementation Strategy:**

```typescript
// Add imports
import { useSaveLock } from '../autoSave';
import { useCreateFormSteps, useDeleteFormSteps, useUpsertFormSteps } from '@/entities/formStep/composables';
import { useDeleteFormQuestion } from '@/entities/formQuestion/composables';

// Inside the composable, add:
const { withLock } = useSaveLock();
const { createFormSteps } = useCreateFormSteps();
const { deleteFormSteps } = useDeleteFormSteps();
const { upsertFormSteps } = useUpsertFormSteps();
const { deleteFormQuestion } = useDeleteFormQuestion();

/**
 * Async version of addStep that:
 * 1. Creates form_question (if needed) - already exists
 * 2. Creates form_step with question reference - NEW
 * 3. Updates local state
 */
async function addStepWithPersist(type: StepType, afterIndex?: number): Promise<FormStep> {
  return withLock('add-step', async () => {
    // Use existing addStepAsync for question creation
    const newStep = await addStepAsync(type, afterIndex);

    // Now persist the step itself
    await createFormSteps({
      inputs: [{
        id: newStep.id,
        form_id: formId.value,
        step_type: newStep.type,
        display_order: newStep.stepOrder,
        question_id: newStep.questionId,
        flow_id: newStep.flowMembership?.flowId ?? null,
        tips: newStep.tips,
        content: newStep.content,
      }],
    });

    return newStep;
  });
}

/**
 * Remove step with persistence.
 * FK CASCADE handles question/option cleanup.
 */
async function removeStepWithPersist(index: number): Promise<void> {
  return withLock('remove-step', async () => {
    const step = steps.value[index];
    if (!step) return;

    // Delete from database (FK CASCADE handles related entities)
    await deleteFormSteps({ ids: [step.id] });

    // Update local state
    removeStep(index);
  });
}

/**
 * Reorder steps with persistence.
 */
async function reorderStepsWithPersist(fromIndex: number, toIndex: number): Promise<void> {
  return withLock('reorder-steps', async () => {
    // Update local state first
    moveStep(fromIndex, toIndex);

    // Batch update display_order values
    const updates = steps.value.map((step, idx) => ({
      id: step.id,
      display_order: idx,
    }));

    await upsertFormSteps({ inputs: updates });
  });
}

/**
 * Duplicate step with persistence.
 */
async function duplicateStepWithPersist(index: number): Promise<FormStep | null> {
  return withLock('duplicate-step', async () => {
    // Create the duplicate locally
    const newStep = duplicateStep(index);
    if (!newStep) return null;

    // If has question, create it first
    if (questionService.requiresQuestion(newStep.type)) {
      const sourceStep = steps.value[index];
      const result = await questionService.createQuestionForStep({
        formId: formId.value ?? '',
        stepType: newStep.type,
        stepOrder: newStep.stepOrder,
        flowMembership: newStep.flowMembership,
      });

      if (result) {
        newStep.questionId = result.questionId;
        // TODO: Copy options if applicable
      }
    }

    // Persist the step
    await createFormSteps({
      inputs: [{
        id: newStep.id,
        form_id: formId.value,
        step_type: newStep.type,
        display_order: newStep.stepOrder,
        question_id: newStep.questionId,
        flow_id: newStep.flowMembership?.flowId ?? null,
        tips: newStep.tips,
        content: newStep.content,
      }],
    });

    return newStep;
  });
}
```

**Return new methods alongside existing ones:**

```typescript
return {
  // Existing local-only methods (keep for compatibility)
  addStep,
  addStepAsync,
  removeStep,
  updateStep,
  updateStepContent,
  updateStepTips,
  updateStepQuestion,
  moveStep,
  duplicateStep,
  changeStepType,

  // NEW: Persisting methods
  addStepWithPersist,
  removeStepWithPersist,
  reorderStepsWithPersist,
  duplicateStepWithPersist,
};
```

**Acceptance Criteria:**
- [ ] New `*WithPersist` methods added
- [ ] All use `withLock` for save coordination
- [ ] `addStepWithPersist` creates question first, then step
- [ ] `removeStepWithPersist` deletes step (FK cascade handles rest)
- [ ] `reorderStepsWithPersist` batch updates display_order
- [ ] `duplicateStepWithPersist` creates question copy first
- [ ] Error recovery: rollback orphaned entities on failure
- [ ] `pnpm typecheck` passes

---

## Phase 3: UI Integration

### Story: UI-001 - Wire Up Step Operations

Update components to use persisting step methods.

**Files to update:**
- `TimelineStepCard.vue` - delete button
- `BranchedTimelineCanvas.vue` - add/reorder/duplicate
- `FormStudioPage.vue` - step operations

**Pattern:**

```vue
<script setup lang="ts">
import { useSaveLock } from '@/features/createForm/composables/autoSave';

const { isLocked } = useSaveLock();

// Replace local method calls with persist versions
const handleDeleteStep = async () => {
  await removeStepWithPersist(stepIndex);
};
</script>

<template>
  <!-- Disable during any save operation -->
  <Button
    @click="handleDeleteStep"
    :disabled="isLocked"
  >
    Delete
  </Button>
</template>
```

**Acceptance Criteria:**
- [ ] Step add uses `addStepWithPersist`
- [ ] Step delete uses `removeStepWithPersist`
- [ ] Step reorder (drag-drop) uses `reorderStepsWithPersist`
- [ ] Step duplicate uses `duplicateStepWithPersist`
- [ ] All controls disabled during `isLocked`

---

### Story: UI-002 - Wire Up Question Settings

Update question settings panel to use immediate saves.

**Files to update:**
- Question settings panel component
- Question type selector

**Pattern:**

```vue
<script setup lang="ts">
import { useQuestionSettings } from '@/features/createForm/composables';
import { useSaveLock } from '@/features/createForm/composables/autoSave';

const { setRequired, setQuestionType } = useQuestionSettings();
const { isLocked } = useSaveLock();

const handleRequiredToggle = async (value: boolean) => {
  try {
    await setRequired(question.value.id, value);
  } catch (error) {
    toast.error('Failed to save. Please try again.');
  }
};
</script>

<template>
  <Switch
    v-model="isRequired"
    :disabled="isLocked"
    @update:model-value="handleRequiredToggle"
  />
</template>
```

**Acceptance Criteria:**
- [ ] Required toggle uses `setRequired`
- [ ] Question type dropdown uses `setQuestionType`
- [ ] Validation inputs use `setValidation`
- [ ] Error toast on failure
- [ ] Controls disabled during `isLocked`

---

### Story: UI-003 - Wire Up Option Management

Update option list component to use immediate saves.

**Pattern:**

```vue
<script setup lang="ts">
import { useQuestionOptions } from '@/features/createForm/composables';
import { useSaveLock } from '@/features/createForm/composables/autoSave';

const { addOption, removeOption, reorderOptions } = useQuestionOptions();
const { isLocked } = useSaveLock();

const handleAddOption = async () => {
  const newOption = await addOption({
    questionId: question.value.id,
    organizationId: organizationId.value,
    userId: currentUser.value.id,
    label: 'New Option',
    value: generateOptionValue(),
    displayOrder: options.value.length,
  });
  // Local state updates from Apollo cache
};
</script>
```

**Acceptance Criteria:**
- [ ] Add option uses `addOption`
- [ ] Delete option uses `removeOption`
- [ ] Drag-drop reorder uses `reorderOptions`
- [ ] Default selection uses `setDefaultOption`
- [ ] All controls disabled during `isLocked`

---

### Story: UI-004 - Wire Up Flow Settings

Update flow panel to use immediate saves.

**Acceptance Criteria:**
- [ ] Condition changes use `updateFlowSettings`
- [ ] Clear branching uses `clearBranching`
- [ ] Controls disabled during `isLocked`

---

## Phase 4: Testing

### Story: TEST-001 - Unit Tests for Save Lock

```typescript
describe('useSaveLock', () => {
  it('acquires lock successfully when free', () => {});
  it('returns false when lock already held', () => {});
  it('releases lock in finally block', () => {});
  it('throws when withLock cannot acquire', () => {});
});
```

### Story: TEST-002 - Integration Tests for Step CRUD

```typescript
describe('useTimelineStepCrud with persistence', () => {
  it('addStepWithPersist creates question then step', () => {});
  it('removeStepWithPersist deletes via FK cascade', () => {});
  it('reorderStepsWithPersist batch updates display_order', () => {});
  it('rolls back orphaned question on step creation failure', () => {});
});
```

### Story: TEST-003 - Save Coordination Tests

```typescript
describe('save coordination', () => {
  it('immediate save blocks auto-save', () => {});
  it('auto-save waits for lock release', () => {});
  it('dirty state preserved when auto-save skipped', () => {});
});
```

### Story: TEST-004 - Manual Testing Checklist

- [ ] Add step → persisted to database
- [ ] Delete step → removed from database
- [ ] Reorder steps (drag-drop) → display_order updated
- [ ] Duplicate step → new step with copied data
- [ ] Toggle required → saved immediately
- [ ] Change question type → saved immediately
- [ ] Add option → persisted
- [ ] Delete option → removed
- [ ] Reorder options → display_order updated
- [ ] Type in field, immediately toggle → no race condition
- [ ] Network error → shows error toast, no data loss
- [ ] Refresh after changes → data persisted correctly

---

## Dependencies

### Required Composables (must exist)

- `useFormEditor` - provides form context, steps, questions, flows
- `useTimelineEditor` - provides step/flow state
- `useStepQuestionService` - creates questions for steps (exists)

### Entity Composables (existing)

- `useCreateFormSteps` - ✅ exists
- `useDeleteFormSteps` - ✅ exists
- `useUpsertFormSteps` - ✅ exists
- `useUpdateFormQuestion` - ✅ exists
- `useCreateFlows` - ✅ exists
- `useDeleteFlow` - ✅ exists
- `useUpdateFlow` - ✅ exists
- `useClearFlowBranchColumns` - ✅ exists

### Entity Composables (to create)

- `useCreateQuestionOption` - ❌ create
- `useDeleteQuestionOption` - ❌ create
- `useUpdateQuestionOption` - ❌ create
- `useUpsertQuestionOptions` - ❌ create

### VueUse Dependencies

- `createSharedComposable` - ✅ already used in project

---

## Rollback Strategy

If issues are discovered:

1. **Quick revert**: Git revert the implementation commits
2. **Feature flag**: Wrap new `*WithPersist` methods in feature flag
3. **Gradual rollout**: Keep both local-only and persist methods, switch one at a time

---

## Notes

- **Auto-save for text fields** handled by ADR-010 (complete)
- **Design config saves** (color, logo) are on organization table, out of scope
- **Cache updates**: Apollo auto-merges returned fragments into cache
- **Error handling**: No optimistic updates = simpler rollback (just show error)
