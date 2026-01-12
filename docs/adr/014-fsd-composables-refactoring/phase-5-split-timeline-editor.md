# Phase 5: Split useTimelineEditor (SRP Fix)

## Overview

**Effort:** High
**Risk:** Medium
**Dependencies:** Phase 3 (focused composables exist), Phase 4 (functions extracted)

Split the "God Composable" `useTimelineEditor` into smaller, single-responsibility composables.

---

## Problem Statement

`useTimelineEditor` currently:
- Is 389 lines
- Returns 80+ methods/properties
- Handles 6+ responsibilities
- Violates Single Responsibility Principle (SRP)

**Current Responsibilities in One Composable:**
1. Step state management
2. Step selection
3. Step CRUD operations
4. Branching configuration
5. Design configuration
6. Persistence coordination
7. Flow membership handling
8. Computed step groupings

---

## Solution

Split into focused composables, each handling ONE responsibility. The main `useTimelineEditor` becomes a thin orchestrator.

---

## Target Architecture

```
features/createForm/composables/timeline/
├── useTimelineEditor.ts       # Thin orchestrator (composition root)
├── useTimelineState.ts        # Core state (steps, selection)
├── useTimelineStepOps.ts      # Step CRUD operations
├── useTimelinePersistence.ts  # Save coordination
├── useTimelineBranching.ts    # Branching state & ops
├── useTimelineDesign.ts       # Design config
└── useTimelineComputed.ts     # Derived computations
```

---

## Tasks

### Task 5.1: Create useTimelineState

**Goal:** Extract core state management

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineState.ts`

```typescript
import { ref, computed, readonly, type Ref, type ComputedRef } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep } from '@/entities/formStep';

export interface TimelineState {
  /** All steps in timeline */
  steps: Ref<FormStep[]>;

  /** Original steps from server (for dirty detection) */
  originalSteps: Ref<FormStep[]>;

  /** Currently selected step index */
  selectedIndex: Ref<number>;

  /** Whether state has unsaved changes */
  isDirty: ComputedRef<boolean>;

  /** Currently selected step */
  currentStep: ComputedRef<FormStep | null>;

  /** Initialize state from server data */
  initialize: (steps: FormStep[]) => void;

  /** Reset to original state */
  reset: () => void;

  /** Update a step in state */
  updateStepInState: (stepId: string, changes: Partial<FormStep>) => void;

  /** Replace all steps */
  setSteps: (steps: FormStep[]) => void;
}

function _useTimelineState(): TimelineState {
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);
  const selectedIndex = ref(0);

  const isDirty = computed(() => {
    return JSON.stringify(steps.value) !== JSON.stringify(originalSteps.value);
  });

  const currentStep = computed(() => {
    return steps.value[selectedIndex.value] ?? null;
  });

  function initialize(serverSteps: FormStep[]) {
    steps.value = structuredClone(serverSteps);
    originalSteps.value = structuredClone(serverSteps);
    selectedIndex.value = 0;
  }

  function reset() {
    steps.value = structuredClone(originalSteps.value);
    selectedIndex.value = 0;
  }

  function updateStepInState(stepId: string, changes: Partial<FormStep>) {
    const index = steps.value.findIndex(s => s.id === stepId);
    if (index !== -1) {
      steps.value[index] = { ...steps.value[index], ...changes };
    }
  }

  function setSteps(newSteps: FormStep[]) {
    steps.value = newSteps;
  }

  return {
    steps,
    originalSteps,
    selectedIndex,
    isDirty,
    currentStep,
    initialize,
    reset,
    updateStepInState,
    setSteps,
  };
}

export const useTimelineState = createSharedComposable(_useTimelineState);
```

---

### Task 5.2: Create useTimelineSelection

**Goal:** Extract selection logic

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineSelection.ts`

```typescript
import { computed, watch } from 'vue';
import { useTimelineState } from './useTimelineState';

export interface TimelineSelection {
  /** Currently selected index */
  selectedIndex: Ref<number>;

  /** Currently selected step */
  currentStep: ComputedRef<FormStep | null>;

  /** Select step by index */
  selectStep: (index: number) => void;

  /** Select step by ID */
  selectStepById: (stepId: string) => void;

  /** Select next step */
  selectNextStep: () => void;

  /** Select previous step */
  selectPreviousStep: () => void;

  /** Whether selection is valid */
  isSelectionValid: ComputedRef<boolean>;
}

export function useTimelineSelection(): TimelineSelection {
  const state = useTimelineState();

  const isSelectionValid = computed(() => {
    return state.selectedIndex.value >= 0 &&
           state.selectedIndex.value < state.steps.value.length;
  });

  function selectStep(index: number) {
    const clampedIndex = Math.max(0, Math.min(index, state.steps.value.length - 1));
    state.selectedIndex.value = clampedIndex;
  }

  function selectStepById(stepId: string) {
    const index = state.steps.value.findIndex(s => s.id === stepId);
    if (index !== -1) {
      selectStep(index);
    }
  }

  function selectNextStep() {
    selectStep(state.selectedIndex.value + 1);
  }

  function selectPreviousStep() {
    selectStep(state.selectedIndex.value - 1);
  }

  // Auto-correct selection if steps change
  watch(
    () => state.steps.value.length,
    (newLength) => {
      if (state.selectedIndex.value >= newLength && newLength > 0) {
        state.selectedIndex.value = newLength - 1;
      }
    }
  );

  return {
    selectedIndex: state.selectedIndex,
    currentStep: state.currentStep,
    selectStep,
    selectStepById,
    selectNextStep,
    selectPreviousStep,
    isSelectionValid,
  };
}
```

---

### Task 5.3: Create useTimelineStepOps

**Goal:** Extract step CRUD operations

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineStepOps.ts`

```typescript
import { useTimelineState } from './useTimelineState';
import { useTimelineSelection } from './useTimelineSelection';
import { useTimelinePersistence } from './useTimelinePersistence';
import { getStepTypeConfig, getStepTypeDefaultContent } from '@/entities/formStep';
import { useCreateFormStep, useDeleteFormStep } from '@/entities/formStep';
import { useCreateFormQuestion } from '@/entities/formQuestion';

export interface StepAddOptions {
  /** Persist immediately (vs waiting for auto-save) */
  persist?: boolean;
  /** Select the new step after adding */
  select?: boolean;
}

export interface TimelineStepOps {
  /** Add a new step */
  addStep: (type: string, flowMembership: FlowMembership, options?: StepAddOptions) => Promise<FormStep | null>;

  /** Remove a step */
  removeStep: (stepId: string, options?: { persist?: boolean }) => Promise<boolean>;

  /** Update step content */
  updateStepContent: (stepId: string, content: Record<string, unknown>) => void;

  /** Update step properties */
  updateStep: (stepId: string, changes: Partial<FormStep>) => void;

  /** Duplicate a step */
  duplicateStep: (stepId: string) => Promise<FormStep | null>;

  /** Reorder steps */
  reorderSteps: (fromIndex: number, toIndex: number, options?: { persist?: boolean }) => Promise<void>;
}

export function useTimelineStepOps(): TimelineStepOps {
  const state = useTimelineState();
  const selection = useTimelineSelection();
  const persistence = useTimelinePersistence();

  const { createFormStep } = useCreateFormStep();
  const { deleteFormStep } = useDeleteFormStep();
  const { createFormQuestion } = useCreateFormQuestion();

  async function addStep(
    type: string,
    flowMembership: FlowMembership,
    options: StepAddOptions = {}
  ): Promise<FormStep | null> {
    const { persist = true, select = true } = options;

    const config = getStepTypeConfig(type);

    // Validate flow membership
    if (!config.allowedFlows.includes(flowMembership)) {
      console.error(`Step type "${type}" not allowed in flow "${flowMembership}"`);
      return null;
    }

    // Create question if needed
    let questionId: string | null = null;
    if (config.requiresQuestion && config.defaultQuestionType) {
      const question = await createFormQuestion({
        question_type_id: config.defaultQuestionType,
        question_text: 'New Question',
        // ... other fields
      });
      questionId = question?.id ?? null;
    }

    // Create step
    const newStep = await createFormStep({
      step_type: type,
      content: getStepTypeDefaultContent(type),
      question_id: questionId,
      flow_membership: flowMembership,
      // ... other fields
    });

    if (newStep) {
      // Add to local state
      state.steps.value = [...state.steps.value, newStep];

      // Update original if persisted
      if (persist) {
        state.originalSteps.value = [...state.originalSteps.value, newStep];
      }

      // Select new step
      if (select) {
        selection.selectStepById(newStep.id);
      }
    }

    return newStep;
  }

  async function removeStep(
    stepId: string,
    options: { persist?: boolean } = {}
  ): Promise<boolean> {
    const { persist = true } = options;

    if (persist) {
      const success = await deleteFormStep(stepId);
      if (!success) return false;
    }

    // Remove from local state
    state.steps.value = state.steps.value.filter(s => s.id !== stepId);

    if (persist) {
      state.originalSteps.value = state.originalSteps.value.filter(s => s.id !== stepId);
    }

    return true;
  }

  function updateStepContent(stepId: string, content: Record<string, unknown>) {
    state.updateStepInState(stepId, { content });
    persistence.markDirty('step', stepId);
  }

  function updateStep(stepId: string, changes: Partial<FormStep>) {
    state.updateStepInState(stepId, changes);
    persistence.markDirty('step', stepId);
  }

  async function duplicateStep(stepId: string): Promise<FormStep | null> {
    const originalStep = state.steps.value.find(s => s.id === stepId);
    if (!originalStep) return null;

    return addStep(originalStep.step_type, originalStep.flow_membership, {
      persist: true,
      select: true,
    });
  }

  async function reorderSteps(
    fromIndex: number,
    toIndex: number,
    options: { persist?: boolean } = {}
  ): Promise<void> {
    const { persist = true } = options;

    // Use extracted function for calculation
    const { calculateStepOrdering } = await import('../../functions');
    const { reorderedSteps, changedStepIds } = calculateStepOrdering(
      state.steps.value,
      fromIndex,
      toIndex
    );

    state.setSteps(reorderedSteps);

    if (persist && changedStepIds.length > 0) {
      await persistence.persistStepOrder(changedStepIds);
    }
  }

  return {
    addStep,
    removeStep,
    updateStepContent,
    updateStep,
    duplicateStep,
    reorderSteps,
  };
}
```

---

### Task 5.4: Create useTimelinePersistence

**Goal:** Extract save coordination

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelinePersistence.ts`

```typescript
import { ref, computed } from 'vue';
import { useSaveLock } from '../autoSave/useSaveLock';
import { useDirtyTracker } from '../autoSave/useDirtyTracker';

export interface TimelinePersistence {
  /** Whether currently saving */
  isSaving: ComputedRef<boolean>;

  /** Mark entity as dirty */
  markDirty: (entityType: string, entityId: string) => void;

  /** Clear dirty flag */
  clearDirty: (entityType: string, entityId: string) => void;

  /** Check if entity is dirty */
  isDirtyEntity: (entityType: string, entityId: string) => boolean;

  /** Persist step order changes */
  persistStepOrder: (stepIds: string[]) => Promise<void>;

  /** Execute with save lock */
  withLock: <T>(key: string, fn: () => Promise<T>) => Promise<T>;

  /** Force immediate save of all dirty entities */
  saveNow: () => Promise<void>;
}

export function useTimelinePersistence(): TimelinePersistence {
  const saveLock = useSaveLock();
  const dirtyTracker = useDirtyTracker();

  const isSaving = ref(false);

  async function persistStepOrder(stepIds: string[]): Promise<void> {
    return saveLock.withLock('reorder-steps', async () => {
      isSaving.value = true;
      try {
        // Batch update step orders
        await updateStepOrders(stepIds);
      } finally {
        isSaving.value = false;
      }
    });
  }

  async function saveNow(): Promise<void> {
    return saveLock.withLock('save-now', async () => {
      isSaving.value = true;
      try {
        // Trigger all pending saves
        await flushPendingSaves();
      } finally {
        isSaving.value = false;
      }
    });
  }

  return {
    isSaving: computed(() => isSaving.value),
    markDirty: dirtyTracker.markDirty,
    clearDirty: dirtyTracker.clearDirty,
    isDirtyEntity: dirtyTracker.isDirty,
    persistStepOrder,
    withLock: saveLock.withLock,
    saveNow,
  };
}
```

---

### Task 5.5: Create useTimelineComputed

**Goal:** Extract derived computations

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineComputed.ts`

```typescript
import { computed } from 'vue';
import { useTimelineState } from './useTimelineState';
import type { FormStep } from '@/entities/formStep';

export interface TimelineComputed {
  /** Steps in shared flow */
  sharedSteps: ComputedRef<FormStep[]>;

  /** Steps in testimonial flow */
  testimonialSteps: ComputedRef<FormStep[]>;

  /** Steps in improvement flow */
  improvementSteps: ComputedRef<FormStep[]>;

  /** Welcome step */
  welcomeStep: ComputedRef<FormStep | null>;

  /** Rating step (branch point) */
  ratingStep: ComputedRef<FormStep | null>;

  /** Thank you steps */
  thankYouSteps: ComputedRef<FormStep[]>;

  /** Total step count */
  stepCount: ComputedRef<number>;

  /** Whether form has rating step */
  hasRatingStep: ComputedRef<boolean>;
}

export function useTimelineComputed(): TimelineComputed {
  const state = useTimelineState();

  const sharedSteps = computed(() =>
    state.steps.value.filter(s => s.flow_membership === 'shared')
  );

  const testimonialSteps = computed(() =>
    state.steps.value.filter(s => s.flow_membership === 'testimonial')
  );

  const improvementSteps = computed(() =>
    state.steps.value.filter(s => s.flow_membership === 'improvement')
  );

  const welcomeStep = computed(() =>
    state.steps.value.find(s => s.step_type === 'welcome') ?? null
  );

  const ratingStep = computed(() =>
    state.steps.value.find(s => s.step_type === 'rating') ?? null
  );

  const thankYouSteps = computed(() =>
    state.steps.value.filter(s => s.step_type === 'thank_you')
  );

  const stepCount = computed(() => state.steps.value.length);

  const hasRatingStep = computed(() => ratingStep.value !== null);

  return {
    sharedSteps,
    testimonialSteps,
    improvementSteps,
    welcomeStep,
    ratingStep,
    thankYouSteps,
    stepCount,
    hasRatingStep,
  };
}
```

---

### Task 5.6: Refactor useTimelineEditor as Orchestrator

**Goal:** Make `useTimelineEditor` a thin composition root

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineEditor.ts`

```typescript
import { createSharedComposable } from '@vueuse/core';
import { useTimelineState } from './useTimelineState';
import { useTimelineSelection } from './useTimelineSelection';
import { useTimelineStepOps } from './useTimelineStepOps';
import { useTimelinePersistence } from './useTimelinePersistence';
import { useTimelineComputed } from './useTimelineComputed';
import { useTimelineBranching } from './useTimelineBranching';
import { useTimelineDesign } from './useTimelineDesign';

/**
 * Main timeline editor orchestrator
 *
 * This is a thin composition root that combines all focused composables.
 * Prefer using focused composables directly when possible:
 * - useTimelineReader for read-only access
 * - useTimelineMutator for write operations
 * - useTimelineControl for workflow control
 *
 * @deprecated Prefer focused composables (useTimelineReader, etc.)
 */
function _useTimelineEditor() {
  const state = useTimelineState();
  const selection = useTimelineSelection();
  const stepOps = useTimelineStepOps();
  const persistence = useTimelinePersistence();
  const computed = useTimelineComputed();
  const branching = useTimelineBranching();
  const design = useTimelineDesign();

  return {
    // State
    steps: state.steps,
    originalSteps: state.originalSteps,
    isDirty: state.isDirty,
    initialize: state.initialize,
    reset: state.reset,

    // Selection
    selectedIndex: selection.selectedIndex,
    currentStep: selection.currentStep,
    selectStep: selection.selectStep,
    selectStepById: selection.selectStepById,
    selectNextStep: selection.selectNextStep,
    selectPreviousStep: selection.selectPreviousStep,

    // Step Operations
    addStep: stepOps.addStep,
    removeStep: stepOps.removeStep,
    updateStep: stepOps.updateStep,
    updateStepContent: stepOps.updateStepContent,
    reorderSteps: stepOps.reorderSteps,

    // Persistence
    isSaving: persistence.isSaving,
    saveNow: persistence.saveNow,

    // Computed
    sharedSteps: computed.sharedSteps,
    testimonialSteps: computed.testimonialSteps,
    improvementSteps: computed.improvementSteps,
    hasRatingStep: computed.hasRatingStep,
    ratingStep: computed.ratingStep,

    // Branching
    branchingConfig: branching.branchingConfig,
    isBranchingEnabled: branching.isBranchingEnabled,
    enableBranching: branching.enableBranching,
    disableBranching: branching.disableBranching,
    focusedBranch: branching.focusedBranch,
    setFocusedBranch: branching.setFocusedBranch,

    // Design
    designConfig: design.designConfig,
    updatePrimaryColor: design.updatePrimaryColor,
    updateLogoUrl: design.updateLogoUrl,
    updateDesignConfig: design.updateDesignConfig,

    // Immediate save variants (backward compatibility)
    addStepWithPersist: (type: string, flow: FlowMembership) =>
      stepOps.addStep(type, flow, { persist: true }),
    removeStepWithPersist: (stepId: string) =>
      stepOps.removeStep(stepId, { persist: true }),
    reorderStepsWithPersist: (from: number, to: number) =>
      stepOps.reorderSteps(from, to, { persist: true }),
  };
}

export const useTimelineEditor = createSharedComposable(_useTimelineEditor);
```

---

### Task 5.7: Update Imports Across Codebase

**Goal:** Update all imports to use new structure

**Commands:**
```bash
# Find all useTimelineEditor imports
grep -rn "from.*useTimelineEditor" apps/web/src/

# Update each file to use appropriate focused composable
```

**Migration Examples:**

| Component | Before | After |
|-----------|--------|-------|
| StepPreview | `useTimelineEditor` | `useTimelineReader` |
| TimelineSidebar | `useTimelineEditor` | `useTimelineReader` + `useTimelineStepOps` |
| PropertiesPanel | `useTimelineEditor` | `useTimelineReader` + `useTimelineMutator` |

---

### Task 5.8: Run Verification

**Commands:**
```bash
# Type check all new files
pnpm typecheck

# Build
pnpm build

# Test Form Studio still works
# Manual: Open Form Studio, edit steps, verify save works
```

---

## Acceptance Criteria

- [ ] `useTimelineState` created (~80 lines)
- [ ] `useTimelineSelection` created (~50 lines)
- [ ] `useTimelineStepOps` created (~150 lines)
- [ ] `useTimelinePersistence` created (~80 lines)
- [ ] `useTimelineComputed` created (~60 lines)
- [ ] `useTimelineEditor` reduced to thin orchestrator (<100 lines)
- [ ] Each new composable has single responsibility
- [ ] Backward compatibility maintained via orchestrator
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Form Studio works correctly

---

## Risk Mitigation

1. **Keep old composable working** during migration via orchestrator pattern
2. **Migrate consumers incrementally** - one component at a time
3. **Add integration tests** before starting migration
4. **Use `@deprecated` JSDoc** to guide future developers

---

## Next Phase

After completion, proceed to: **Phase 6: Unify Save Mechanism**
