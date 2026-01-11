# ADR-011: Immediate Save Actions

## Doc Connections
**ID**: `adr-011-immediate-save-actions`

2026-01-11-1500 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-010-centralized-auto-save` - Companion ADR for debounced text saves
- `adr-003-form-autosave` - Original auto-save pattern (being superseded)

---

## Status

**Proposed** - 2026-01-11

## Context

ADR-010 establishes a centralized auto-save controller for **typed content** (debounced 500ms). However, many user actions in the form studio are **discrete** (buttons, toggles, dropdowns, drag-drop) and should save immediately without debouncing.

### Two Save Patterns (from ADR-010)

| Pattern | Input Type | Use Case | Debounce |
|---------|------------|----------|----------|
| **Debounced** | Typed content | Continuous typing | 500ms |
| **Immediate** | Buttons, toggles, dropdowns, drag-drop | Discrete user actions | None |

### Current State: Incomplete Immediate Saves

Based on codebase audit, the immediate save infrastructure is **incomplete**:

| Composable | Status | GraphQL Available | Notes |
|------------|--------|-------------------|-------|
| `useTimelineStepCrud` | Partial | Yes | Only mutates local state, no persistence |
| `useQuestionSettings` | Missing | Yes | `useUpdateFormQuestion` exists |
| `useQuestionOptions` | Missing | Yes (schema) | No composable wrappers |
| `useDesignSettings` | N/A | Unclear | Design fields not on forms table |
| `useFlowSettings` | Missing | Yes | `useUpdateFlow` exists |

### Problems

| Problem | Impact |
|---------|--------|
| **Step changes not persisted** | Add/delete/reorder steps only affects local state |
| **Question settings not saved** | Toggle isRequired, change type - local only |
| **Options not persisted** | Add/delete/reorder options - no mutations |
| **Inconsistent UX** | Some changes save, others don't |

## Decision

**Implement immediate save mutations** for all discrete user actions by:
1. Creating missing entity composables (question options)
2. Enhancing existing CRUD composables with persistence
3. Following the factory pattern from ADR-010 for handlers

### Immediate Save Actions Inventory

Based on schema analysis, here are **all discrete actions** that need immediate saves:

#### Step Operations (form_steps table)

| User Action | Mutation | Current State |
|-------------|----------|---------------|
| Add step | `insert_form_steps_one` | Local only |
| Delete step | `delete_form_steps_by_pk` | Local only |
| Reorder steps | `update_form_steps` (display_order) | Local only |
| Duplicate step | `insert_form_steps_one` | Local only |
| Change step type | N/A (delete + create) | Local only |
| Assign to flow | `update_form_steps` (flow_id) | Local only |

**Note**: `addStepAsync` already creates the linked `form_question`, but doesn't persist the `form_step` itself.

#### Question Settings (form_questions table)

| User Action | Field | Mutation |
|-------------|-------|----------|
| Toggle required | `is_required` | `update_form_questions_by_pk` |
| Change type | `question_type_id` | `update_form_questions_by_pk` |
| Set min value | `min_value` | `update_form_questions_by_pk` |
| Set max value | `max_value` | `update_form_questions_by_pk` |
| Set min length | `min_length` | `update_form_questions_by_pk` |
| Set max length | `max_length` | `update_form_questions_by_pk` |
| Set scale min | `scale_min` | `update_form_questions_by_pk` |
| Set scale max | `scale_max` | `update_form_questions_by_pk` |

**Available**: `useUpdateFormQuestion` composable exists.

#### Question Options (question_options table)

| User Action | Mutation | Current State |
|-------------|----------|---------------|
| Add option | `insert_question_options_one` | No composable |
| Delete option | `delete_question_options_by_pk` | No composable |
| Reorder options | `update_question_options` (display_order) | No composable |

**Missing**: No `questionOption` entity or composables exist.

#### Flow Operations (flows table)

| User Action | Mutation | Current State |
|-------------|----------|---------------|
| Create flow | `insert_flows_one` | `useCreateFlows` exists |
| Delete flow | `delete_flows_by_pk` | `useDeleteFlow` exists |
| Update condition | `update_flows_by_pk` | `useUpdateFlow` exists |
| Clear branching | Custom mutation | `useClearFlowBranchColumns` exists |

**Available**: All flow mutations exist.

#### Form Design (organization table - NOT forms)

| User Action | Field | Location |
|-------------|-------|----------|
| Change logo | `logo_id` | `organizations` table |
| Primary color | N/A | Not in schema |

**Note**: Design settings are on the organization, not individual forms. This is out of scope for form studio immediate saves.

### Architecture

**Design Principle**: Enhance existing CRUD composables with persistence rather than creating separate "persist" composables. This ensures discrete actions always persist immediately with a single function call.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UI COMPONENTS                                    │
│                                                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│  │ StepCard   │ │ Question   │ │ OptionList │ │ FlowPanel  │          │
│  │ (add/del)  │ │ Settings   │ │ (add/del)  │ │ (branch)   │          │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘          │
│        │              │              │              │                  │
└────────┼──────────────┼──────────────┼──────────────┼──────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 FEATURE LAYER COMPOSABLES                               │
│            (Business logic + persistence in one call)                   │
│                                                                         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  │useTimeline     │ │useQuestion     │ │useQuestion     │ │useFlowSettings │
│  │StepCrud        │ │Settings        │ │Options         │ │                │
│  │(ENHANCED)      │ │(NEW)           │ │(NEW)           │ │(NEW)           │
│  │                │ │                │ │                │ │                │
│  │• addStepAsync()│ │• setRequired() │ │• addOption()   │ │• updateCond()  │
│  │• removeStep()  │ │• setType()     │ │• removeOption()│ │• clearBranch() │
│  │• reorderSteps()│ │• setValidation()│ │• reorderOpts() │ │                │
│  │                │ │                │ │                │ │                │
│  │ GraphQL +      │ │ GraphQL +      │ │ GraphQL +      │ │ GraphQL +      │
│  │ Local State    │ │ Cache Update   │ │ Cache Update   │ │ Cache Update   │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
│          │                  │                  │                  │
└──────────┼──────────────────┼──────────────────┼──────────────────┼────────┘
           │                  │                  │                  │
           ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     ENTITY MUTATION COMPOSABLES                         │
│                       (GraphQL wrappers)                                │
│                                                                         │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  │useCreateForm   │ │useUpdateForm   │ │useCreateOption │ │useUpdateFlow   │
│  │Steps          │ │Question        │ │(NEW)           │ │                │
│  │useDeleteForm   │ │                │ │useDeleteOption │ │useDeleteFlow   │
│  │Steps          │ │                │ │(NEW)           │ │                │
│  │useUpsertForm   │ │                │ │useReorderOpts  │ │useClearFlow    │
│  │Steps          │ │                │ │(NEW)           │ │BranchColumns   │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
│          │                  │                  │                  │
└──────────┴──────────────────┴──────────────────┴──────────────────┴────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │      GraphQL Mutations       │
                        │    (Hasura auto-generated)   │
                        └──────────────────────────────┘
```

**Why enhance existing CRUD composables (not separate "persist" composables):**

| Approach | Pros | Cons |
|----------|------|------|
| **Separate persist** (`useStepPersist`) | Flexible, can delay persistence | Two calls needed, easy to forget persist |
| **Enhanced CRUD** (`useTimelineStepCrud`) | Single call does both, impossible to forget | Less flexible |

For immediate saves, **enhanced CRUD is correct** because discrete actions should always persist immediately.

### Implementation Strategy

#### 1. Create Question Options Entity (NEW)

The `question_options` table has GraphQL mutations but no Vue composables. Create:

```
entities/questionOption/
├── graphql/
│   ├── mutations/
│   │   ├── CreateQuestionOption.gql
│   │   ├── UpdateQuestionOption.gql
│   │   ├── DeleteQuestionOption.gql
│   │   └── ReorderQuestionOptions.gql
│   └── fragments/
│       └── QuestionOptionFields.gql
├── models/
│   └── index.ts
├── composables/
│   ├── mutations/
│   │   ├── useCreateQuestionOption.ts
│   │   ├── useUpdateQuestionOption.ts
│   │   ├── useDeleteQuestionOption.ts
│   │   └── useReorderQuestionOptions.ts
│   └── index.ts
└── index.ts
```

#### 2. Enhance Step CRUD with Persistence

Current `useTimelineStepCrud` only mutates local state. Enhance with immediate persistence.

**Recommendation**: Integrate persistence into existing methods for simpler API.

### Mutation Order for Dependent Entities

Steps have foreign key dependencies that require specific mutation ordering:

```
form_steps.question_id  →  form_questions.id  (FK)
form_steps.flow_id      →  flows.id           (FK, nullable)
```

#### Add Step Sequence

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ADD STEP OPERATION                               │
│                   (Question/Rating step types)                          │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Create form_question (if needed)
         │
         │  POST insert_form_questions_one
         │  { form_id, question_type_id, question_text, display_order }
         │
         ▼
         Returns: question_id ─────────────────┐
                                               │
Step 2: Create form_step (with question_id)   │
         │                                     │
         │  POST insert_form_steps_one         │
         │  { form_id, question_id, ◄──────────┘
         │    step_type, display_order, flow_id }
         │
         ▼
         Returns: step_id

Step 3: Update local state
         │
         │  Add step to steps array with IDs from mutations
         │
         ▼
         Done
```

**Implementation:**

```typescript
async function addStepAsync(type: StepType, afterIndex?: number): Promise<FormStep> {
  return withLock('add-step', async () => {
    const displayOrder = calculateDisplayOrder(afterIndex);
    let questionId: string | null = null;

    // Step 1: Create question if this step type requires one
    if (requiresQuestion(type)) {
      const questionResult = await createFormQuestion({
        form_id: formId.value,
        question_type_id: getDefaultQuestionType(type),
        question_text: getDefaultQuestionText(type),
        display_order: displayOrder,
      });
      questionId = questionResult.id;
    }

    // Step 2: Create step with question reference
    const stepResult = await createFormStep({
      form_id: formId.value,
      question_id: questionId,
      step_type: type,
      display_order: displayOrder,
      flow_id: activeFlowId.value,  // nullable
    });

    // Step 3: Update local state
    const newStep = mapToFormStep(stepResult, questionResult);
    steps.value.splice(afterIndex + 1, 0, newStep);

    return newStep;
  });
}
```

#### Delete Step Sequence

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DELETE STEP OPERATION                             │
│                (FK CASCADE handles downstream deletes)                  │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Delete form_step
         │
         │  POST delete_form_steps_by_pk
         │  { id: step_id }
         │
         │  FK CASCADE automatically deletes:
         │  • form_questions (via step_id FK)
         │  • question_options (via question_id FK)
         │
         ▼
         Success

Step 2: Update local state + Apollo cache
         │
         │  Remove step from steps array
         │  Evict related entities from cache
         │
         ▼
         Done
```

**Note**: Database FK constraints handle cascading deletes. We only need one mutation - the database cleans up related entities automatically.

#### Reorder Steps Sequence

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      REORDER STEPS OPERATION                            │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Calculate new display_order values
         │
         │  Local computation only
         │
         ▼
         Map: { step_id → new_display_order }

Step 2: Batch update all affected steps
         │
         │  POST update_form_steps (batch)
         │  { where: { id: { _in: [...] } },
         │    _set: per-row display_order }
         │
         │  OR use upsert_form_steps with full step data
         │
         ▼
         Success

Step 3: Update local state
         │
         │  Reorder steps array
         │
         ▼
         Done
```

**Implementation:**

```typescript
async function reorderSteps(fromIndex: number, toIndex: number): Promise<void> {
  return withLock('reorder-steps', async () => {
    // Step 1: Calculate new order (local)
    const reordered = arrayMove(steps.value, fromIndex, toIndex);
    const updates = reordered.map((step, idx) => ({
      id: step.id,
      display_order: idx,
    }));

    // Step 2: Batch update
    await upsertFormSteps({
      objects: updates,
      on_conflict: { constraint: 'form_steps_pkey', update_columns: ['display_order'] },
    });

    // Step 3: Update local state
    steps.value = reordered;
  });
}
```

#### Duplicate Step Sequence

Duplicating follows the same pattern as Add, but copies values from the source step:

```
Step 1: Create form_question (copy from source question)
Step 2: Create form_step (copy from source step, new question_id)
Step 3: Copy question_options if applicable
Step 4: Update local state
```

### Error Recovery for Multi-Step Operations

For operations that create multiple entities (e.g., add step creates question then step):

```typescript
async function addStepAsync(type: StepType, afterIndex?: number): Promise<FormStep> {
  return withLock('add-step', async () => {
    let createdQuestionId: string | null = null;

    try {
      // Step 1: Create question (if needed)
      if (requiresQuestion(type)) {
        const questionResult = await createFormQuestion({ ... });
        createdQuestionId = questionResult.id;
      }

      // Step 2: Create step (links to question via FK)
      const stepResult = await createFormStep({
        question_id: createdQuestionId,
        ...
      });

      // Step 3: Update local state + cache
      // ...

      return newStep;

    } catch (error) {
      // Rollback: Delete orphaned question if step creation failed
      if (createdQuestionId) {
        try {
          await deleteFormQuestion({ id: createdQuestionId });
        } catch (rollbackError) {
          console.error('[AddStep] Rollback failed:', rollbackError);
          // Log for manual cleanup, don't throw
        }
      }
      throw error;  // Re-throw original error
    }
  });
}
```

**Note**: Delete operations don't need rollback logic because FK CASCADE handles cleanup automatically. If `deleteFormStep` fails, no entities were deleted.

#### 3. Create useQuestionSettings Composable

Wraps `useUpdateFormQuestion` for settings-specific mutations:

```typescript
// features/createForm/composables/useQuestionSettings.ts
export function useQuestionSettings() {
  const { updateFormQuestion } = useUpdateFormQuestion();

  const setRequired = async (questionId: string, isRequired: boolean) => {
    await updateFormQuestion({ id: questionId, changes: { is_required: isRequired } });
  };

  const setQuestionType = async (questionId: string, typeId: string) => {
    await updateFormQuestion({ id: questionId, changes: { question_type_id: typeId } });
  };

  const setValidation = async (questionId: string, validation: ValidationSettings) => {
    await updateFormQuestion({ id: questionId, changes: validation });
  };

  return { setRequired, setQuestionType, setValidation };
}
```

#### 4. Create useOptionPersist Composable

Uses new question option entity composables:

```typescript
// features/createForm/composables/useOptionPersist.ts
export function useOptionPersist() {
  const { createQuestionOption } = useCreateQuestionOption();
  const { deleteQuestionOption } = useDeleteQuestionOption();
  const { reorderQuestionOptions } = useReorderQuestionOptions();

  const addOption = async (questionId: string, label: string, value: string) => {
    return await createQuestionOption({
      question_id: questionId,
      option_label: label,
      option_value: value,
      display_order: getNextDisplayOrder(),
    });
  };

  const removeOption = async (optionId: string) => {
    await deleteQuestionOption({ id: optionId });
  };

  const reorderOptions = async (questionId: string, optionIds: string[]) => {
    await reorderQuestionOptions({ questionId, optionIds });
  };

  return { addOption, removeOption, reorderOptions };
}
```

### Composable Usage Pattern

All immediate save composables follow the same pattern:

```typescript
// In component setup
const { setRequired, setQuestionType } = useQuestionSettings();

// In event handlers - mutations called immediately
const handleRequiredToggle = async (value: boolean) => {
  await setRequired(question.value.id, value);
};

const handleTypeChange = async (typeId: string) => {
  await setQuestionType(question.value.id, typeId);
};
```

### Save Strategy: No Optimistic Updates

**Decision**: Skip optimistic UI updates in favor of data consistency.

```typescript
// ❌ Optimistic (NOT using this)
question.value.is_required = value;  // Update UI first
await setRequired(question.value.id, value);  // Then persist
// Risk: UI and DB out of sync on failure

// ✅ Wait for persistence (using this)
await setRequired(question.value.id, value);  // Persist first
question.value.is_required = value;  // Update UI after success
// Simpler, no rollback needed
```

**Why no optimistic updates:**
- Simpler error handling (no rollback logic)
- Data consistency guaranteed
- Discrete actions are fast enough (~100-200ms)
- Avoids complex state reconciliation

### Apollo Cache Updates

After a mutation succeeds, the UI needs to reflect the new state. We use **fragment-based cache updates** for consistency:

```typescript
// Entity mutation returns full fragment
const CREATE_QUESTION_OPTION = gql`
  mutation CreateQuestionOption($input: question_options_insert_input!) {
    insert_question_options_one(object: $input) {
      ...QuestionOptionFields  # Return full entity
    }
  }
  ${QUESTION_OPTION_FIELDS}
`;

// Apollo automatically merges into cache via __typename + id
// Reactive queries automatically update
```

**Cache Update Patterns by Operation:**

| Operation | Cache Strategy | Implementation |
|-----------|---------------|----------------|
| **Create** | Return full fragment | Apollo auto-merges new entity |
| **Update** | Return full fragment | Apollo auto-merges updated fields |
| **Delete** | Evict from cache | `cache.evict({ id: cache.identify(entity) })` |
| **Reorder** | Return affected entities | Apollo merges all updated display_orders |

**Example: Delete with cache eviction**

```typescript
async function removeStep(stepId: string): Promise<void> {
  return withLock('delete-step', async () => {
    // Step 1: Delete via GraphQL (FK cascade handles related entities)
    await deleteFormStep({ id: stepId });

    // Step 2: Evict from Apollo cache
    cache.evict({ id: `form_steps:${stepId}` });
    // Note: FK-cascaded entities (questions, options) are also evicted
    // because they're nested in the step's cache entry

    // Step 3: Update local state
    steps.value = steps.value.filter(s => s.id !== stepId);

    cache.gc(); // Garbage collect orphaned references
  });
}
```

**Example: Create with auto-merge**

```typescript
async function addOption(questionId: string, label: string): Promise<QuestionOption> {
  return withLock('add-option', async () => {
    // Mutation returns full QuestionOptionFields fragment
    const result = await createQuestionOption({
      question_id: questionId,
      option_label: label,
      option_value: label.toLowerCase().replace(/\s+/g, '_'),
      display_order: getNextDisplayOrder(),
    });

    // Apollo auto-merges result into cache
    // Parent question's options array updates automatically
    // because of normalized cache + __typename

    return result;
  });
}
```

### Save Lock: Preventing Race Conditions

**Problem**: Immediate saves and debounced saves can race each other.

```
User toggles isRequired (immediate save starts)
User types question text (marks dirty)
Immediate save completes (returns fresh data)
Debounced save fires (overwrites with stale data) ← BUG
```

**Solution**: A save lock that coordinates both patterns.

```typescript
// useSaveLock.ts - shared across both save patterns
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

  // Wrapper for immediate saves
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

  return { isLocked: readonly(isLocked), lockReason: readonly(lockReason), withLock, acquireLock, releaseLock };
});
```

**Usage in immediate save composables:**

```typescript
// useQuestionSettings.ts
export function useQuestionSettings() {
  const { updateFormQuestion } = useUpdateFormQuestion();
  const { withLock } = useSaveLock();

  const setRequired = async (questionId: string, isRequired: boolean) => {
    return withLock('question-settings', async () => {
      const result = await updateFormQuestion({ id: questionId, changes: { is_required: isRequired } });
      return result;
    });
  };

  return { setRequired };
}
```

**Usage in auto-save controller (ADR-010):**

The auto-save controller uses `useIdle(500)` which naturally handles re-queue:

```typescript
// useAutoSaveController.ts
const { idle } = useIdle(500);
const { isLocked, acquireLock, releaseLock } = useSaveLock();

const executeSave = async () => {
  // Skip if locked OR can't acquire lock
  if (isLocked.value || !acquireLock('auto-save')) {
    console.log('[AutoSave] Skipped - another save in progress');
    return; // Re-queue happens automatically (see below)
  }

  try {
    // ... proceed with debounced save
  } finally {
    releaseLock();
  }
};

// whenever() fires when condition BECOMES true
// After lock releases + 500ms idle, it fires again if hasPendingChanges
whenever(
  () => idle.value && hasPendingChanges.value,
  () => executeSave()
);
```

**Why re-queue is automatic:**

```
Timeline showing automatic re-queue:
─────────────────────────────────────────────────────────────────────────►

User clicks toggle              Lock releases    500ms idle
     │                              │               │
     ▼                              ▼               ▼
[idle=false]───────────────────[idle=false]───►[idle=true]
     │                              │               │
[lock acquired]                [lock released]     ▼
     │                              │        [hasPendingChanges?]
[immediate save]                    │               │
                                    │        [whenever fires]
                                    │               │
                           (dirty state preserved)  ▼
                                              [executeSave()]
```

1. User clicking resets idle timer (idle=false)
2. Immediate save acquires lock
3. Auto-save timer fires during lock → skipped, dirty state preserved
4. Lock releases, 500ms passes, idle becomes true
5. `whenever` fires because `idle && hasPendingChanges` is now true
6. Auto-save executes

**Behavior:**
| Scenario | Result |
|----------|--------|
| Immediate save starts | Lock acquired, UI disabled, idle timer reset |
| Auto-save timer fires during lock | Skipped, dirty state preserved |
| Immediate save completes | Lock released |
| 500ms idle after lock release | `whenever` fires, auto-save runs if dirty |

### Status Distinction: `saveStatus` vs `isLocked`

ADR-010 exposes `saveStatus` for auto-save state. ADR-011 introduces `isLocked` for save coordination. These serve different purposes:

| Property | Source | Purpose | UI Usage |
|----------|--------|---------|----------|
| `saveStatus` | `useAutoSaveController` | Auto-save status indicator | "Saving...", "Saved", "Error" text in header |
| `isLocked` | `useSaveLock` | Coordination between save patterns | Disable controls during any save |

**Key distinction:**
- `saveStatus` is for **informational display** (auto-save indicator in header)
- `isLocked` is for **UI control state** (disabling inputs during saves)
- Immediate saves do NOT update `saveStatus` - that's exclusively for auto-save
- Both immediate and debounced saves set `isLocked` while in progress

```typescript
// Auto-save controller manages saveStatus
saveStatus.value = 'saving';  // Only set by auto-save controller

// Both patterns use the lock
await withLock('immediate-save', async () => { ... });  // Immediate
await withLock('auto-save', async () => { ... });       // Debounced
```

### UI Feedback During Saves

While save is in progress, disable relevant UI controls. This prevents the "Save in progress" error from ever occurring in practice since users cannot trigger actions on disabled controls.

```vue
<template>
  <Switch
    v-model="isRequired"
    :disabled="isLocked"
    @update:model-value="handleRequiredChange"
  />
  <span v-if="isLocked" class="text-xs text-gray-400">Saving...</span>
</template>

<script setup>
const { isLocked } = useSaveLock();
</script>
```

**Important:** By disabling controls during `isLocked`, the error path in `withLock` (throwing "Save in progress") becomes a defensive measure for edge cases, not a normal user experience.

### Error Handling

With no optimistic updates, error handling is straightforward:

```typescript
const handleRequiredToggle = async (value: boolean) => {
  try {
    await setRequired(question.value.id, value);
    // UI updates happen inside setRequired after successful mutation
  } catch (error) {
    // No rollback needed - UI was never updated
    if (error.message.includes('Save in progress')) {
      toast.warning('Please wait for the current save to complete.');
    } else {
      toast.error('Failed to save. Please try again.');
    }
  }
};
```

### Interaction with Auto-Save Controller

Immediate saves and debounced saves are **coordinated via save lock**:

```
User types question text     → Auto-save controller (500ms debounce)
                               ↓ checks lock before saving

User toggles isRequired      → useSaveLock.withLock() → mutation
                               ↓ lock held during save
                               ↓ auto-save skipped if timer fires

User adds option             → useSaveLock.withLock() → mutation
User drags to reorder steps  → useSaveLock.withLock() → mutation (on drop)
```

## Implementation Checklist

### Phase 0: Save Coordination Infrastructure (~50 lines)

- [ ] Create `useSaveLock.ts` - shared lock for coordinating saves (uses `createSharedComposable`)
- [ ] Update `useAutoSaveController.ts` (ADR-010) to use lock via `acquireLock`/`releaseLock`
- [ ] Export `useSaveLock` from autoSave index (needed by both auto-save and immediate save composables)

### Phase 1: Question Options Entity (~100 lines)

- [ ] Create `entities/questionOption/` directory structure
- [ ] Create GraphQL mutations: Create, Update, Delete, Reorder
- [ ] Create mutation composables
- [ ] Export from entity index

### Phase 2: Feature Layer Composables (~200 lines)

- [ ] Enhance `useTimelineStepCrud.ts` - add persistence with proper mutation order + cache updates
- [ ] Create `useQuestionSettings.ts` - wraps existing mutation with lock
- [ ] Create `useQuestionOptions.ts` - uses new entity composables with lock + cache updates
- [ ] Create `useFlowSettings.ts` - wraps existing flow mutations with lock

### Phase 3: UI Integration

- [ ] Wire up step add/delete to persist immediately
- [ ] Wire up question settings toggles/dropdowns
- [ ] Wire up option add/delete/reorder
- [ ] Wire up flow condition changes
- [ ] Add `:disabled="isLocked"` to controls during saves
- [ ] Add "Saving..." indicators where appropriate

### Phase 4: Testing

- [ ] Test step CRUD persists correctly (including mutation order)
- [ ] Test question settings save on toggle
- [ ] Test option management saves
- [ ] Test error recovery for multi-step operations
- [ ] Test save lock prevents race conditions
- [ ] Test UI disables during save operations

## Consequences

### Positive

1. **Complete persistence** - All user actions save immediately
2. **No data loss** - Discrete actions can't be lost in debounce window
3. **Data consistency** - No optimistic updates means UI always reflects DB state
4. **Clear separation** - Text = debounced, discrete = immediate
5. **No race conditions** - Save lock coordinates immediate and debounced saves
6. **Simple error handling** - No rollback logic needed (UI updates after mutation)
7. **Clear mutation order** - Dependent entities have defined sequence

### Negative

1. **More network requests** - Each discrete action = 1 mutation
2. **Slight UI delay** - ~100-200ms wait for mutation before UI updates
3. **More composables** - Additional code to maintain
4. **UI disabled during saves** - User must wait for current save to complete

### Neutral

1. **Learning curve** - Developers need to understand two patterns + save lock
2. **Testing complexity** - Both patterns need test coverage
3. **Trade-off accepted** - Chose consistency over perceived speed

## Alternatives Considered

### Alternative 1: Batch All Changes (Including Discrete)

Put all changes through the 500ms debounce.

**Rejected because:**
- User clicks "Add Step" and waits 500ms - bad UX
- Discrete actions feel broken with delay
- Toggles/dropdowns should feel instant

### Alternative 2: Explicit Save Button for Everything

No auto-save, user clicks "Save" manually.

**Rejected because:**
- Against "no complexity tax" philosophy
- Easy to lose work
- Outdated UX pattern

### Alternative 3: Optimistic-Only for Discrete Actions

Don't persist discrete actions, rely on periodic full-state save.

**Rejected because:**
- Risk of data loss on page refresh
- Complex state reconciliation needed
- Inconsistent mental model

## References

- ADR-010: Centralized Auto-Save Controller
- ADR-003: Form Auto-Save Pattern (original)
- Vue 3 Composition API patterns
- GraphQL mutation best practices
