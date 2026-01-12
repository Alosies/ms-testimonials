# Phase 3: Create Focused Composables (ISP Fix)

## Overview

**Effort:** Medium
**Risk:** Low
**Dependencies:** None

Create focused composables that expose only what consumers need, fixing Interface Segregation Principle (ISP) violations.

---

## Problem Statement

Currently `useTimelineEditor()` returns 80+ methods/properties to ALL consumers:

```typescript
// Current: Every component gets everything
const editor = useTimelineEditor();
// editor has 80+ properties, even if component only needs 3
```

This violates **ISP**: clients should not be forced to depend on interfaces they don't use.

---

## Solution

Create focused interface composables:
1. **useTimelineReader** - Read-only access (for preview components)
2. **useTimelineMutator** - Write operations (for edit components)
3. **useTimelineControl** - Workflow control (for toolbar/navigation)

---

## Tasks

### Task 3.1: Analyze Current Consumer Needs

**Goal:** Map what each component actually uses

**Components to Analyze:**

| Component | Needs |
|-----------|-------|
| `TimelineSidebar` | steps, selection, reorder |
| `StepPreview` | currentStep (read-only) |
| `PropertiesPanel` | currentStep, updateStep |
| `BranchingPanel` | branchingConfig, enable/disable |
| `DesignPanel` | designConfig, updateDesign |
| `FormStudioToolbar` | save, undo, preview |

**Commands:**
```bash
# Find all useTimelineEditor usages
grep -r "useTimelineEditor" apps/web/src/ --include="*.vue" --include="*.ts"

# For each file, check which properties are destructured
```

---

### Task 3.2: Create useTimelineReader

**Goal:** Read-only interface for preview components

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineReader.ts`

```typescript
import { computed, type ComputedRef, type DeepReadonly } from 'vue';
import { useTimelineEditor } from './useTimelineEditor';
import type { FormStep } from '@/entities/formStep';
import type { BranchingConfig } from '@/entities/form';
import type { DesignConfig } from '@/entities/form';

export interface TimelineReader {
  /** All steps in display order */
  steps: DeepReadonly<ComputedRef<FormStep[]>>;

  /** Currently selected step */
  currentStep: DeepReadonly<ComputedRef<FormStep | null>>;

  /** Index of selected step */
  selectedIndex: ComputedRef<number>;

  /** Current branching configuration */
  branchingConfig: DeepReadonly<ComputedRef<BranchingConfig>>;

  /** Design configuration (colors, logo) */
  designConfig: DeepReadonly<ComputedRef<DesignConfig>>;

  /** Whether form has unsaved changes */
  isDirty: ComputedRef<boolean>;

  /** Steps filtered by flow membership */
  sharedSteps: ComputedRef<FormStep[]>;
  testimonialSteps: ComputedRef<FormStep[]>;
  improvementSteps: ComputedRef<FormStep[]>;
}

/**
 * Read-only access to timeline state
 *
 * Use this in components that only need to display data,
 * not modify it. This provides type safety guaranteeing
 * the component cannot accidentally mutate state.
 *
 * @example
 * ```ts
 * // In StepPreview.vue
 * const { currentStep, designConfig } = useTimelineReader();
 * ```
 */
export function useTimelineReader(): TimelineReader {
  const editor = useTimelineEditor();

  return {
    steps: computed(() => editor.steps.value),
    currentStep: computed(() => editor.currentStep.value),
    selectedIndex: computed(() => editor.selectedIndex.value),
    branchingConfig: computed(() => editor.branchingConfig.value),
    designConfig: computed(() => editor.designConfig.value),
    isDirty: computed(() => editor.isDirty.value),
    sharedSteps: computed(() => editor.sharedSteps.value),
    testimonialSteps: computed(() => editor.testimonialSteps.value),
    improvementSteps: computed(() => editor.improvementSteps.value),
  };
}
```

---

### Task 3.3: Create useTimelineMutator

**Goal:** Write operations for edit components

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineMutator.ts`

```typescript
import { useTimelineEditor } from './useTimelineEditor';
import type { FormStep } from '@/entities/formStep';

export interface TimelineMutator {
  /** Update a step's content */
  updateStep: (stepId: string, changes: Partial<FormStep>) => void;

  /** Update step content field */
  updateStepContent: (stepId: string, content: Record<string, unknown>) => void;

  /** Add a new step */
  addStep: (type: string, flowMembership: string) => Promise<void>;

  /** Remove a step */
  removeStep: (stepId: string) => Promise<void>;

  /** Reorder steps */
  reorderSteps: (fromIndex: number, toIndex: number) => Promise<void>;

  /** Update question for a step */
  updateStepQuestion: (stepId: string, questionChanges: Record<string, unknown>) => void;
}

/**
 * Write operations for timeline
 *
 * Use this in components that need to modify step data.
 * Operations trigger appropriate save mechanisms.
 *
 * @example
 * ```ts
 * // In PropertiesPanel.vue
 * const { updateStep, updateStepContent } = useTimelineMutator();
 * ```
 */
export function useTimelineMutator(): TimelineMutator {
  const editor = useTimelineEditor();

  return {
    updateStep: editor.updateStep,
    updateStepContent: editor.updateStepContent,
    addStep: editor.addStepWithPersist,
    removeStep: editor.removeStepWithPersist,
    reorderSteps: editor.reorderStepsWithPersist,
    updateStepQuestion: editor.updateStepQuestion,
  };
}
```

---

### Task 3.4: Create useTimelineControl

**Goal:** Workflow control for toolbar/navigation

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineControl.ts`

```typescript
import { useTimelineEditor } from './useTimelineEditor';

export interface TimelineControl {
  /** Select a step by index */
  selectStep: (index: number) => void;

  /** Select next step */
  selectNextStep: () => void;

  /** Select previous step */
  selectPreviousStep: () => void;

  /** Current selection index */
  selectedIndex: ComputedRef<number>;

  /** Whether currently saving */
  isSaving: ComputedRef<boolean>;

  /** Force save all pending changes */
  saveNow: () => Promise<void>;

  /** Reset to original state */
  reset: () => void;

  /** Whether form has errors */
  hasErrors: ComputedRef<boolean>;

  /** Validation errors */
  errors: ComputedRef<string[]>;
}

/**
 * Workflow control for timeline
 *
 * Use this in toolbar and navigation components.
 *
 * @example
 * ```ts
 * // In FormStudioToolbar.vue
 * const { saveNow, isSaving, selectNextStep } = useTimelineControl();
 * ```
 */
export function useTimelineControl(): TimelineControl {
  const editor = useTimelineEditor();

  return {
    selectStep: editor.selectStep,
    selectNextStep: editor.selectNextStep,
    selectPreviousStep: editor.selectPreviousStep,
    selectedIndex: editor.selectedIndex,
    isSaving: editor.isSaving,
    saveNow: editor.saveNow,
    reset: editor.reset,
    hasErrors: editor.hasErrors,
    errors: editor.errors,
  };
}
```

---

### Task 3.5: Create useBranchingControl

**Goal:** Separate branching operations

**File:** `apps/web/src/features/createForm/composables/branching/useBranchingControl.ts`

```typescript
import { useTimelineEditor } from '../timeline/useTimelineEditor';
import type { BranchingConfig } from '@/entities/form';

export interface BranchingControl {
  /** Current branching configuration */
  branchingConfig: ComputedRef<BranchingConfig>;

  /** Whether branching is enabled */
  isBranchingEnabled: ComputedRef<boolean>;

  /** Enable branching with threshold */
  enableBranching: (ratingStepId: string, threshold: number) => Promise<void>;

  /** Disable branching */
  disableBranching: () => Promise<void>;

  /** Update branching threshold */
  updateThreshold: (threshold: number) => void;

  /** Get steps in testimonial branch */
  testimonialSteps: ComputedRef<FormStep[]>;

  /** Get steps in improvement branch */
  improvementSteps: ComputedRef<FormStep[]>;

  /** Currently focused branch (for UI highlighting) */
  focusedBranch: Ref<'shared' | 'testimonial' | 'improvement' | null>;

  /** Set focused branch */
  setFocusedBranch: (branch: 'shared' | 'testimonial' | 'improvement' | null) => void;
}

/**
 * Branching operations for branch management UI
 *
 * @example
 * ```ts
 * // In BranchingPanel.vue
 * const { branchingConfig, enableBranching, disableBranching } = useBranchingControl();
 * ```
 */
export function useBranchingControl(): BranchingControl {
  const editor = useTimelineEditor();

  return {
    branchingConfig: editor.branchingConfig,
    isBranchingEnabled: editor.isBranchingEnabled,
    enableBranching: editor.enableBranchingWithPersist,
    disableBranching: editor.disableBranchingWithPersist,
    updateThreshold: editor.updateBranchingThreshold,
    testimonialSteps: editor.testimonialSteps,
    improvementSteps: editor.improvementSteps,
    focusedBranch: editor.focusedBranch,
    setFocusedBranch: editor.setFocusedBranch,
  };
}
```

---

### Task 3.6: Create useDesignControl

**Goal:** Separate design configuration

**File:** `apps/web/src/features/createForm/composables/design/useDesignControl.ts`

```typescript
import { useTimelineEditor } from '../timeline/useTimelineEditor';
import type { DesignConfig } from '@/entities/form';

export interface DesignControl {
  /** Current design configuration */
  designConfig: ComputedRef<DesignConfig>;

  /** Update primary color */
  updatePrimaryColor: (color: string) => void;

  /** Update logo URL */
  updateLogoUrl: (url: string | null) => void;

  /** Update button style */
  updateButtonStyle: (style: 'rounded' | 'square' | 'pill') => void;

  /** Update all design config */
  updateDesignConfig: (changes: Partial<DesignConfig>) => void;
}

/**
 * Design configuration operations
 *
 * @example
 * ```ts
 * // In DesignPanel.vue
 * const { designConfig, updatePrimaryColor } = useDesignControl();
 * ```
 */
export function useDesignControl(): DesignControl {
  const editor = useTimelineEditor();

  return {
    designConfig: editor.designConfig,
    updatePrimaryColor: editor.updatePrimaryColor,
    updateLogoUrl: editor.updateLogoUrl,
    updateButtonStyle: editor.updateButtonStyle,
    updateDesignConfig: editor.updateDesignConfig,
  };
}
```

---

### Task 3.7: Update Barrel Exports

**Goal:** Export focused composables from feature

**File:** `apps/web/src/features/createForm/composables/index.ts`

```typescript
// Timeline
export { useTimelineEditor } from './timeline/useTimelineEditor'; // Full access (internal)
export { useTimelineReader } from './timeline/useTimelineReader'; // Read-only
export { useTimelineMutator } from './timeline/useTimelineMutator'; // Write ops
export { useTimelineControl } from './timeline/useTimelineControl'; // Navigation

// Branching
export { useBranchingControl } from './branching/useBranchingControl';

// Design
export { useDesignControl } from './design/useDesignControl';

// Types
export type { TimelineReader } from './timeline/useTimelineReader';
export type { TimelineMutator } from './timeline/useTimelineMutator';
export type { TimelineControl } from './timeline/useTimelineControl';
export type { BranchingControl } from './branching/useBranchingControl';
export type { DesignControl } from './design/useDesignControl';
```

---

### Task 3.8: Migrate One Consumer

**Goal:** Update `StepPreview.vue` to use `useTimelineReader`

**Before:**
```typescript
const { currentStep, steps, designConfig, branchingConfig, ... } = useTimelineEditor();
// Component has access to 80+ methods it doesn't need
```

**After:**
```typescript
const { currentStep, designConfig } = useTimelineReader();
// Component only has read access, can't accidentally mutate
```

---

### Task 3.9: Run Verification

**Commands:**
```bash
# Type check
pnpm typecheck

# Build
pnpm build

# Test that read-only interface cannot mutate
# (TypeScript should error if component tries to call mutation from reader)
```

---

## Acceptance Criteria

- [ ] `useTimelineReader` created and exported
- [ ] `useTimelineMutator` created and exported
- [ ] `useTimelineControl` created and exported
- [ ] `useBranchingControl` created and exported
- [ ] `useDesignControl` created and exported
- [ ] At least one component migrated to use focused interface
- [ ] Read-only interface provides DeepReadonly types
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes

---

## Migration Path for Components

Components can be migrated incrementally:

1. **Phase 3.A (Now):** Create focused composables, migrate 1 component
2. **Phase 3.B (Later):** Migrate remaining components as touched

| Component | Target Interface | Priority |
|-----------|------------------|----------|
| `StepPreview.vue` | `useTimelineReader` | High |
| `TimelineSidebar.vue` | `useTimelineReader` + `useTimelineControl` | Medium |
| `PropertiesPanel.vue` | `useTimelineReader` + `useTimelineMutator` | Medium |
| `BranchingPanel.vue` | `useBranchingControl` | Medium |
| `DesignPanel.vue` | `useDesignControl` | Low |

---

## Next Phase

After completion, proceed to: **Phase 4: Extract Multi-Entity Functions**
