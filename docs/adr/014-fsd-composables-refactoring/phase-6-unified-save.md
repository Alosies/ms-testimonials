# Phase 6: Unify Save Mechanism

## Overview

**Effort:** High
**Risk:** Medium
**Dependencies:** Phase 5 (split timeline editor)

Unify the dual save mechanisms (auto-save + immediate save) into a cohesive save strategy.

---

## Problem Statement

Currently there are two save mechanisms that must be carefully coordinated:

1. **Auto-save** (ADR-010)
   - Debounced 500ms after user stops typing
   - Batches multiple changes
   - Uses `useDirtyTracker` to track changed entities

2. **Immediate save** (ADR-011)
   - Executes immediately for discrete actions
   - Uses `*WithPersist` method variants
   - Requires `useSaveLock` to prevent conflicts

**Problems:**
- Complex coordination via `useSaveLock`
- Duplicate logic for similar operations (e.g., `addStep` vs `addStepWithPersist`)
- Easy to forget locking/coordination
- Hard to understand save timing

---

## Solution

Create a **unified save strategy** at the entity level that:
1. Abstracts the auto-save vs immediate decision
2. Handles locking automatically
3. Provides single API per operation

---

## Target Architecture

```
entities/formStep/
├── composables/
│   └── useStepPersistence.ts    ← Unified save strategy

features/createForm/
├── composables/
│   └── timeline/
│       └── useTimelineStepOps.ts  ← Uses entity persistence
```

---

## Tasks

### Task 6.1: Design Save Strategy Interface

**Goal:** Define the unified persistence API

```typescript
export interface SaveStrategy {
  /** Save mode */
  mode: 'immediate' | 'deferred';

  /** Priority (higher = executes first if multiple pending) */
  priority?: number;

  /** Callback after save completes */
  onComplete?: () => void;

  /** Callback if save fails */
  onError?: (error: Error) => void;
}

export interface PersistenceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EntityPersistence<T, CreateInput, UpdateInput> {
  /** Create entity with unified save handling */
  create: (input: CreateInput, strategy?: SaveStrategy) => Promise<PersistenceResult<T>>;

  /** Update entity with unified save handling */
  update: (id: string, changes: UpdateInput, strategy?: SaveStrategy) => Promise<PersistenceResult<T>>;

  /** Delete entity with unified save handling */
  remove: (id: string, strategy?: SaveStrategy) => Promise<PersistenceResult<void>>;

  /** Batch update multiple entities */
  batchUpdate: (updates: Array<{ id: string; changes: UpdateInput }>, strategy?: SaveStrategy) => Promise<PersistenceResult<T[]>>;
}
```

---

### Task 6.2: Create useStepPersistence

**Goal:** Implement unified persistence for form steps

**File:** `apps/web/src/entities/formStep/composables/useStepPersistence.ts`

```typescript
import { ref } from 'vue';
import { useSaveLock } from '@/features/createForm/composables/autoSave/useSaveLock';
import { useDirtyTracker } from '@/features/createForm/composables/autoSave/useDirtyTracker';
import { useCreateFormStep, useUpdateFormStep, useDeleteFormStep } from './mutations';
import type { FormStep, FormStepInput, FormStepUpdateInput } from '../models';

export interface StepSaveStrategy {
  /** 'immediate' persists now, 'deferred' waits for auto-save */
  mode?: 'immediate' | 'deferred';

  /** Update local state immediately (optimistic update) */
  optimistic?: boolean;

  /** Lock key for coordinating with other saves */
  lockKey?: string;
}

const DEFAULT_STRATEGY: StepSaveStrategy = {
  mode: 'immediate',
  optimistic: true,
};

/**
 * Unified persistence layer for form steps
 *
 * Handles:
 * - Automatic locking coordination
 * - Immediate vs deferred save decisions
 * - Optimistic updates
 * - Error recovery
 *
 * @example
 * ```ts
 * const { createStep, updateStep, deleteStep } = useStepPersistence();
 *
 * // Immediate save (default for discrete actions)
 * await createStep(input);
 *
 * // Deferred save (for text editing)
 * await updateStep(id, changes, { mode: 'deferred' });
 * ```
 */
export function useStepPersistence() {
  const saveLock = useSaveLock();
  const dirtyTracker = useDirtyTracker();

  const { createFormStep: _createFormStep } = useCreateFormStep();
  const { updateFormStep: _updateFormStep } = useUpdateFormStep();
  const { deleteFormStep: _deleteFormStep } = useDeleteFormStep();

  const isPersisting = ref(false);

  /**
   * Create a new step with unified save handling
   */
  async function createStep(
    input: FormStepInput,
    strategy: StepSaveStrategy = DEFAULT_STRATEGY
  ): Promise<{ success: boolean; step?: FormStep; error?: string }> {
    const { mode = 'immediate', lockKey = 'create-step' } = strategy;

    if (mode === 'deferred') {
      // For deferred, just mark as pending (auto-save will handle)
      // This case is rare for creates
      dirtyTracker.markDirty('step', 'pending-create');
      return { success: true };
    }

    // Immediate mode - acquire lock and execute
    return saveLock.withLock(lockKey, async () => {
      isPersisting.value = true;
      try {
        const step = await _createFormStep({ input });
        if (!step) {
          return { success: false, error: 'Failed to create step' };
        }
        return { success: true, step };
      } catch (error) {
        return { success: false, error: String(error) };
      } finally {
        isPersisting.value = false;
      }
    });
  }

  /**
   * Update a step with unified save handling
   */
  async function updateStep(
    id: string,
    changes: FormStepUpdateInput,
    strategy: StepSaveStrategy = {}
  ): Promise<{ success: boolean; step?: FormStep; error?: string }> {
    const { mode = 'deferred', lockKey = `update-step-${id}` } = strategy;

    if (mode === 'deferred') {
      // Mark as dirty, auto-save will handle
      dirtyTracker.markDirty('step', id);
      return { success: true };
    }

    // Immediate mode
    return saveLock.withLock(lockKey, async () => {
      isPersisting.value = true;
      try {
        const step = await _updateFormStep({ id, changes });
        if (!step) {
          return { success: false, error: 'Failed to update step' };
        }
        dirtyTracker.clearDirty('step', id);
        return { success: true, step };
      } catch (error) {
        return { success: false, error: String(error) };
      } finally {
        isPersisting.value = false;
      }
    });
  }

  /**
   * Delete a step with unified save handling
   */
  async function deleteStep(
    id: string,
    strategy: StepSaveStrategy = DEFAULT_STRATEGY
  ): Promise<{ success: boolean; error?: string }> {
    const { mode = 'immediate', lockKey = `delete-step-${id}` } = strategy;

    if (mode === 'deferred') {
      dirtyTracker.markDirty('step', `delete-${id}`);
      return { success: true };
    }

    return saveLock.withLock(lockKey, async () => {
      isPersisting.value = true;
      try {
        await _deleteFormStep({ id });
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      } finally {
        isPersisting.value = false;
      }
    });
  }

  /**
   * Batch update step orders
   */
  async function updateStepOrders(
    updates: Array<{ id: string; step_order: number }>,
    strategy: StepSaveStrategy = DEFAULT_STRATEGY
  ): Promise<{ success: boolean; error?: string }> {
    const { lockKey = 'batch-reorder' } = strategy;

    return saveLock.withLock(lockKey, async () => {
      isPersisting.value = true;
      try {
        // Execute all updates in parallel
        await Promise.all(
          updates.map(({ id, step_order }) =>
            _updateFormStep({ id, changes: { step_order } })
          )
        );
        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      } finally {
        isPersisting.value = false;
      }
    });
  }

  return {
    createStep,
    updateStep,
    deleteStep,
    updateStepOrders,
    isPersisting,
  };
}
```

---

### Task 6.3: Create useQuestionPersistence

**Goal:** Implement unified persistence for questions

**File:** `apps/web/src/entities/formQuestion/composables/useQuestionPersistence.ts`

```typescript
import { ref } from 'vue';
import { useSaveLock } from '@/features/createForm/composables/autoSave/useSaveLock';
import { useDirtyTracker } from '@/features/createForm/composables/autoSave/useDirtyTracker';
import { useCreateFormQuestion, useUpdateFormQuestion } from './mutations';

export interface QuestionSaveStrategy {
  mode?: 'immediate' | 'deferred';
  lockKey?: string;
}

/**
 * Unified persistence layer for form questions
 */
export function useQuestionPersistence() {
  const saveLock = useSaveLock();
  const dirtyTracker = useDirtyTracker();

  const { createFormQuestion: _create } = useCreateFormQuestion();
  const { updateFormQuestion: _update } = useUpdateFormQuestion();

  const isPersisting = ref(false);

  async function createQuestion(
    input: FormQuestionInput,
    strategy: QuestionSaveStrategy = { mode: 'immediate' }
  ) {
    const { mode = 'immediate', lockKey = 'create-question' } = strategy;

    if (mode === 'deferred') {
      dirtyTracker.markDirty('question', 'pending-create');
      return { success: true };
    }

    return saveLock.withLock(lockKey, async () => {
      isPersisting.value = true;
      try {
        const question = await _create({ input });
        return question
          ? { success: true, question }
          : { success: false, error: 'Failed to create question' };
      } catch (error) {
        return { success: false, error: String(error) };
      } finally {
        isPersisting.value = false;
      }
    });
  }

  async function updateQuestion(
    id: string,
    changes: FormQuestionUpdateInput,
    strategy: QuestionSaveStrategy = { mode: 'deferred' }
  ) {
    const { mode = 'deferred', lockKey = `update-question-${id}` } = strategy;

    if (mode === 'deferred') {
      dirtyTracker.markDirty('question', id);
      return { success: true };
    }

    return saveLock.withLock(lockKey, async () => {
      isPersisting.value = true;
      try {
        const question = await _update({ id, changes });
        dirtyTracker.clearDirty('question', id);
        return question
          ? { success: true, question }
          : { success: false, error: 'Failed to update question' };
      } catch (error) {
        return { success: false, error: String(error) };
      } finally {
        isPersisting.value = false;
      }
    });
  }

  return {
    createQuestion,
    updateQuestion,
    isPersisting,
  };
}
```

---

### Task 6.4: Refactor useTimelineStepOps to Use Persistence

**Goal:** Update step operations to use unified persistence

**File:** Update `apps/web/src/features/createForm/composables/timeline/useTimelineStepOps.ts`

```typescript
import { useStepPersistence } from '@/entities/formStep';
import { useQuestionPersistence } from '@/entities/formQuestion';
import { getStepTypeConfig } from '@/entities/formStep';

export function useTimelineStepOps() {
  const state = useTimelineState();
  const selection = useTimelineSelection();
  const stepPersistence = useStepPersistence();
  const questionPersistence = useQuestionPersistence();

  async function addStep(
    type: string,
    flowMembership: FlowMembership,
    options: { select?: boolean } = {}
  ) {
    const config = getStepTypeConfig(type);

    // Create question if needed (always immediate for creates)
    let questionId: string | null = null;
    if (config.requiresQuestion) {
      const result = await questionPersistence.createQuestion({
        question_type_id: config.defaultQuestionType!,
        question_text: 'New Question',
      });
      if (!result.success) {
        console.error('Failed to create question:', result.error);
        return null;
      }
      questionId = result.question!.id;
    }

    // Create step (always immediate for creates)
    const result = await stepPersistence.createStep({
      step_type: type,
      question_id: questionId,
      flow_membership: flowMembership,
      content: getStepTypeDefaultContent(type),
    });

    if (result.success && result.step) {
      // Update local state
      state.steps.value = [...state.steps.value, result.step];
      state.originalSteps.value = [...state.originalSteps.value, result.step];

      if (options.select) {
        selection.selectStepById(result.step.id);
      }

      return result.step;
    }

    return null;
  }

  async function removeStep(stepId: string) {
    const result = await stepPersistence.deleteStep(stepId);

    if (result.success) {
      state.steps.value = state.steps.value.filter(s => s.id !== stepId);
      state.originalSteps.value = state.originalSteps.value.filter(s => s.id !== stepId);
    }

    return result.success;
  }

  function updateStepContent(stepId: string, content: Record<string, unknown>) {
    // Update local state immediately
    state.updateStepInState(stepId, { content });

    // Deferred save (auto-save will handle)
    stepPersistence.updateStep(stepId, { content }, { mode: 'deferred' });
  }

  async function reorderSteps(fromIndex: number, toIndex: number) {
    const { calculateStepOrdering } = await import('../../functions');
    const { reorderedSteps, changedStepIds } = calculateStepOrdering(
      state.steps.value,
      fromIndex,
      toIndex
    );

    // Update local state immediately
    state.setSteps(reorderedSteps);

    // Persist order changes (immediate)
    if (changedStepIds.length > 0) {
      const updates = changedStepIds.map(id => {
        const step = reorderedSteps.find(s => s.id === id)!;
        return { id, step_order: step.step_order };
      });

      await stepPersistence.updateStepOrders(updates);
      state.originalSteps.value = [...reorderedSteps];
    }
  }

  return {
    addStep,
    removeStep,
    updateStepContent,
    reorderSteps,
    // No more *WithPersist variants needed!
  };
}
```

---

### Task 6.5: Remove Duplicate *WithPersist Methods

**Goal:** Eliminate redundant method variants

**Actions:**

1. Remove from `useTimelineStepCrud.ts`:
   - `addStepWithPersist` → use `addStep()`
   - `removeStepWithPersist` → use `removeStep()`
   - `reorderStepsWithPersist` → use `reorderSteps()`

2. Update callers to use unified methods

3. Update `useTimelineEditor` backward compat layer:
```typescript
// Backward compat - these now just call the unified methods
addStepWithPersist: stepOps.addStep,
removeStepWithPersist: stepOps.removeStep,
reorderStepsWithPersist: stepOps.reorderSteps,
```

---

### Task 6.6: Update Auto-Save Controller

**Goal:** Simplify auto-save to work with unified persistence

**File:** Update `apps/web/src/features/createForm/composables/autoSave/useAutoSaveController.ts`

```typescript
import { useStepPersistence } from '@/entities/formStep';
import { useQuestionPersistence } from '@/entities/formQuestion';

export function useAutoSaveController() {
  const stepPersistence = useStepPersistence();
  const questionPersistence = useQuestionPersistence();
  const dirtyTracker = useDirtyTracker();

  async function executeSave() {
    const dirtySteps = dirtyTracker.getDirtyIds('step');
    const dirtyQuestions = dirtyTracker.getDirtyIds('question');

    // Steps - use persistence layer (will handle locking)
    for (const stepId of dirtySteps) {
      const step = getStepById(stepId);
      if (step) {
        await stepPersistence.updateStep(
          stepId,
          { content: step.content },
          { mode: 'immediate' }  // Force immediate since auto-save triggered
        );
      }
    }

    // Questions
    for (const questionId of dirtyQuestions) {
      const question = getQuestionById(questionId);
      if (question) {
        await questionPersistence.updateQuestion(
          questionId,
          { question_text: question.question_text },
          { mode: 'immediate' }
        );
      }
    }
  }

  return {
    executeSave,
    // ... other methods
  };
}
```

---

### Task 6.7: Add Entity Exports

**Goal:** Export persistence composables from entities

**File:** `apps/web/src/entities/formStep/index.ts`
```typescript
export { useStepPersistence } from './composables/useStepPersistence';
```

**File:** `apps/web/src/entities/formQuestion/index.ts`
```typescript
export { useQuestionPersistence } from './composables/useQuestionPersistence';
```

---

### Task 6.8: Run Verification

**Commands:**
```bash
# Type check
pnpm typecheck

# Build
pnpm build

# Test save scenarios:
# 1. Edit text field → verify auto-save triggers after 500ms
# 2. Add step → verify immediate save
# 3. Reorder steps → verify immediate save
# 4. Delete step → verify immediate save
# 5. Rapid edits → verify debouncing works
# 6. Concurrent operations → verify locking works
```

---

## Acceptance Criteria

- [ ] `useStepPersistence` created in entity layer
- [ ] `useQuestionPersistence` created in entity layer
- [ ] `*WithPersist` method variants removed
- [ ] Single unified API per operation
- [ ] Auto-save uses persistence layer
- [ ] Immediate saves use persistence layer
- [ ] Locking handled automatically by persistence layer
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] All save scenarios work correctly

---

## Save Decision Matrix

After this phase, the save mode is determined by operation type:

| Operation | Save Mode | Reason |
|-----------|-----------|--------|
| Create step | Immediate | Needs server ID for FK references |
| Delete step | Immediate | Must remove from DB before UI update |
| Reorder steps | Immediate | Order must be consistent |
| Edit step content | Deferred | User typing, debounce 500ms |
| Edit question text | Deferred | User typing, debounce 500ms |
| Toggle setting | Immediate | Discrete action |
| Enable/disable branching | Immediate | Structural change |

---

## Verification Checklist

Before completing this phase, verify all scenarios:

- [ ] **Text editing**: Edit welcome title → changes save after 500ms idle
- [ ] **Rapid editing**: Type quickly → only one save after stopping
- [ ] **Add step**: Click add → step appears immediately, saved to DB
- [ ] **Delete step**: Click delete → step removed immediately
- [ ] **Reorder**: Drag step → new order persisted immediately
- [ ] **Concurrent**: Add step while text dirty → both save correctly
- [ ] **Error recovery**: Network failure → error shown, retry works

---

## Summary

After Phase 6:

1. **Single source of truth** for save logic per entity
2. **No duplicate methods** (`addStep` vs `addStepWithPersist`)
3. **Automatic locking** - callers don't manage locks
4. **Clear save semantics** - immediate vs deferred based on operation
5. **Testable** - persistence layer can be unit tested

This completes the ADR-012 refactoring plan.
