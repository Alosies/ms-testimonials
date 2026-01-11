# Implementation Plan: ADR-010 Centralized Auto-Save Controller

> Replace fragmented auto-save composables with a centralized controller for the form studio.

**ADR:** `docs/adr/010-centralized-auto-save/adr.md`
**Status:** Completed (Phase 1)
**Created:** January 11, 2026
**Completed:** January 11, 2026

---

## Overview

The form studio currently has 6 different auto-save composables with circular dependencies, multiple debounce timers, and unpredictable save ordering. This plan implements a centralized auto-save controller following the pattern outlined in ADR-010.

### Current State (Fragmented)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 6 SCATTERED COMPOSABLES                                                 │
│ ─────────────────────────                                               │
│ • useFormAutoSave.ts      - Form info                                   │
│ • useQuestionSave.ts      - Question data                               │
│ • useStepSave.ts          - Step question data                          │
│ • useSaveFormSteps.ts     - Steps + branching                           │
│ • useStepAutoSave.ts      - Steps auto-save (broken)                    │
│ • useTimelineDesignConfig - Design config                               │
│                                                                         │
│ Problems:                                                               │
│ • Circular dependencies between composables                             │
│ • Multiple independent 500ms timers                                     │
│ • Unpredictable save order                                              │
│ • Scattered dirty tracking                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### Target State (Centralized) - IMPLEMENTED

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SINGLE AUTO-SAVE CONTROLLER                                             │
│ ─────────────────────────────                                           │
│ • useDirtyTracker.ts      - ID tracking with Sets + restore             │
│ • watchers.ts             - 6 surgical watchers for text fields         │
│ • handlers.ts             - 5 save functions with ID lookup             │
│ • useAutoSaveController.ts - useIdle(500ms) + whenever orchestrator     │
│ • useNavigationGuard.ts   - beforeunload + route guard (TODO)           │
│                                                                         │
│ Benefits:                                                               │
│ • No circular dependencies                                              │
│ • Idle-based trigger (better UX than debounce)                          │
│ • Predictable save behavior                                             │
│ • Clear mental model                                                    │
│ • UX timing separated to SaveStatusPill component                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### Two Save Patterns

| Pattern | Input Type | Trigger | Debounce |
|---------|------------|---------|----------|
| **Immediate** | Buttons, toggles, dropdowns, drag-drop | Existing composables | None |
| **Debounced** | Typed content (text fields) | Auto-save controller | 500ms |

### Text Fields for Auto-Save (Schema Reference)

| Table | Fields |
|-------|--------|
| `forms` | `name`, `product_name`, `product_description` |
| `form_questions` | `question_text`, `placeholder`, `help_text`, `scale_min_label`, `scale_max_label` |
| `question_options` | `option_label`, `option_value` |
| `form_steps` | `tips` |
| `flows` | `name` |

### ID Tracking Requirement

Why boolean flags are insufficient:
1. User types in Question A
2. User switches to Question B within 500ms
3. Debounce fires while Question B is active
4. **Without ID tracking:** We save Question B (no changes) and lose Question A's changes
5. **With ID tracking:** We know Question A is dirty and save it specifically

---

## Directory Structure

```
apps/web/src/features/createForm/composables/autoSave/
├── index.ts                      # Public exports
├── useDirtyTracker.ts            # ~60 lines - ID tracking with Sets + restore
├── useNavigationGuard.ts         # ~30 lines - beforeunload + route guard
├── watchers.ts                   # ~80 lines - 5 watchers with ID tracking
├── handlers.ts                   # ~60 lines - 5 save functions with ID lookup
└── useAutoSaveController.ts      # ~60 lines - Orchestration with snapshot
```

**Total: ~290 lines** for the entire auto-save system.

---

## Phase 1: Dirty Tracker (COMPLETED)

Create the shared dirty state tracker with ID tracking using Sets.

### 1.1 Create useDirtyTracker.ts

**File:** `apps/web/src/features/createForm/composables/autoSave/useDirtyTracker.ts`

```typescript
import { computed, reactive, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';

interface DirtyState {
  formInfo: boolean;
  questions: Set<string>;
  options: Set<string>;
  steps: Set<string>;
  flows: Set<string>;
}

export const useDirtyTracker = createSharedComposable(() => {
  const dirty = reactive<DirtyState>({
    formInfo: false,
    questions: new Set<string>(),
    options: new Set<string>(),
    steps: new Set<string>(),
    flows: new Set<string>(),
  });

  const mark = {
    formInfo: () => { dirty.formInfo = true; },
    question: (id: string) => { dirty.questions.add(id); },
    option: (id: string) => { dirty.options.add(id); },
    step: (id: string) => { dirty.steps.add(id); },
    flow: (id: string) => { dirty.flows.add(id); },
  };

  const snapshot = () => {
    const captured = {
      formInfo: dirty.formInfo,
      questions: new Set(dirty.questions),
      options: new Set(dirty.options),
      steps: new Set(dirty.steps),
      flows: new Set(dirty.flows),
    };
    clear();
    return captured;
  };

  const restoreDirtyState = (captured: ReturnType<typeof snapshot>) => {
    if (captured.formInfo) dirty.formInfo = true;
    captured.questions.forEach(id => dirty.questions.add(id));
    captured.options.forEach(id => dirty.options.add(id));
    captured.steps.forEach(id => dirty.steps.add(id));
    captured.flows.forEach(id => dirty.flows.add(id));
  };

  const clear = () => {
    dirty.formInfo = false;
    dirty.questions.clear();
    dirty.options.clear();
    dirty.steps.clear();
    dirty.flows.clear();
  };

  const hasPendingChanges = computed(() =>
    dirty.formInfo ||
    dirty.questions.size > 0 ||
    dirty.options.size > 0 ||
    dirty.steps.size > 0 ||
    dirty.flows.size > 0
  );

  return { dirty: readonly(dirty), mark, snapshot, restoreDirtyState, hasPendingChanges };
});
```

### Acceptance Criteria

- [ ] File created at correct path
- [ ] Uses `createSharedComposable` for singleton pattern
- [ ] `DirtyState` interface has boolean for `formInfo`, Sets for others
- [ ] `mark` object has methods for each entity type
- [ ] `snapshot()` captures current state and clears atomically
- [ ] `restoreDirtyState()` merges captured state back into dirty
- [ ] `hasPendingChanges` computed returns true if any dirty state exists
- [ ] `pnpm typecheck` passes

---

## Phase 2: Surgical Watchers (COMPLETED)

Create watchers that track text field changes and mark dirty state with entity IDs.

**6 Watchers Implemented:**
1. `useFormInfoWatcher` - form name, product_name, product_description
2. `useQuestionTextWatcher` - question_text, placeholder, help_text, scale labels
3. `useOptionTextWatcher` - option_label, option_value
4. `useStepTipsWatcher` - tips array
5. `useStepContentWatcher` - welcome/thank_you/consent/contact_info/reward content
6. `useFlowNameWatcher` - flow name

### 2.1 Create watchers.ts

**File:** `apps/web/src/features/createForm/composables/autoSave/watchers.ts`

```typescript
import { watch } from 'vue';
import { useDirtyTracker } from './useDirtyTracker';
import { useFormEditor } from '../useFormEditor';
import { useQuestionEditor } from '../useQuestionEditor';
import { useTimelineEditor } from '../timeline/useTimelineEditor';

// Form Info Watcher
// Watches: name, product_name, product_description
export const useFormInfoWatcher = () => {
  const { mark } = useDirtyTracker();
  const { form } = useFormEditor();

  watch(
    () => form.value ? [form.value.name, form.value.product_name, form.value.product_description] : null,
    () => mark.formInfo(),
    { deep: true }
  );
};

// Question Text Watcher
// Watches: question_text, placeholder, help_text, scale_min_label, scale_max_label
export const useQuestionTextWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeQuestion } = useQuestionEditor();

  watch(
    () => activeQuestion.value ? {
      id: activeQuestion.value.id,
      fields: [
        activeQuestion.value.question_text,
        activeQuestion.value.placeholder,
        activeQuestion.value.help_text,
        activeQuestion.value.scale_min_label,
        activeQuestion.value.scale_max_label,
      ],
    } : null,
    (curr, prev) => {
      // IMPORTANT: Only mark dirty when SAME entity changed (curr.id === prev.id)
      // When user switches entities (different IDs), the "change" is just selection,
      // not a text edit. Without this check, switching questions would incorrectly
      // mark the new question as dirty with no actual text changes.
      if (curr && prev && curr.id === prev.id) {
        mark.question(curr.id);
      }
    },
    { deep: true }
  );
};

// Option Text Watcher
// Watches: option_label, option_value for each option
export const useOptionTextWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeQuestion } = useQuestionEditor();

  watch(
    () => activeQuestion.value?.options?.map(o => ({ id: o.id, label: o.option_label, value: o.option_value })),
    (curr, prev) => {
      if (!curr || !prev) return;
      const prevMap = new Map(prev.map(o => [o.id, o]));
      for (const opt of curr) {
        const old = prevMap.get(opt.id);
        if (old && (opt.label !== old.label || opt.value !== old.value)) {
          mark.option(opt.id);
        }
      }
    },
    { deep: true }
  );
};

// Step Tips Watcher
// Watches: tips
export const useStepTipsWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeStep } = useTimelineEditor();

  watch(
    () => activeStep.value ? { id: activeStep.value.id, tips: activeStep.value.tips } : null,
    (curr, prev) => {
      // Same entity check: ignore selection changes between steps
      if (curr && prev && curr.id === prev.id) {
        mark.step(curr.id);
      }
    },
    { deep: true }
  );
};

// Flow Name Watcher
// Watches: name
export const useFlowNameWatcher = () => {
  const { mark } = useDirtyTracker();
  const { activeFlow } = useTimelineEditor();

  watch(
    () => activeFlow.value ? { id: activeFlow.value.id, name: activeFlow.value.name } : null,
    (curr, prev) => {
      // Same entity check: ignore selection changes between flows
      if (curr && prev && curr.id === prev.id) {
        mark.flow(curr.id);
      }
    }
  );
};
```

### Acceptance Criteria

- [ ] File created at correct path
- [ ] 5 watchers exported: `useFormInfoWatcher`, `useQuestionTextWatcher`, `useOptionTextWatcher`, `useStepTipsWatcher`, `useFlowNameWatcher`
- [ ] Each watcher imports from `useDirtyTracker` and appropriate editor composable
- [ ] Question/Step/Flow watchers include `curr.id === prev.id` check with comment explaining why
- [ ] Option watcher compares old vs new by ID map
- [ ] `pnpm typecheck` passes

---

## Phase 3: Save Handlers (COMPLETED)

Create save handlers that receive dirty IDs and look up current values from state.

### 3.1 Create handlers.ts

**File:** `apps/web/src/features/createForm/composables/autoSave/handlers.ts`

```typescript
import type { Form } from '@/entities/form/models';
import type { FormQuestion } from '@/entities/formQuestion/models';
import type { QuestionOption } from '@/entities/questionOption/models';
import type { FormStep } from '@/entities/formStep/models';
import type { Flow } from '@/entities/flow/models';
import { useUpdateForm } from '@/entities/form/composables';
import { useUpsertFormQuestions } from '@/entities/formQuestion/composables';
import { useUpsertQuestionOptions } from '@/entities/questionOption/composables';
import { useUpsertFormSteps } from '@/entities/formStep/composables';
import { useUpsertFlows } from '@/entities/flow/composables';

export const saveFormInfo = async (form: Form) => {
  const { updateForm } = useUpdateForm();
  await updateForm({
    id: form.id,
    changes: {
      name: form.name,
      product_name: form.product_name,
      product_description: form.product_description,
    },
  });
};

export const saveQuestions = async (questionIds: Set<string>, allQuestions: FormQuestion[]) => {
  const toSave = allQuestions.filter(q => questionIds.has(q.id));
  if (toSave.length === 0) return;

  const { upsertFormQuestions } = useUpsertFormQuestions();
  await upsertFormQuestions({
    inputs: toSave.map(q => ({
      id: q.id,
      question_text: q.question_text,
      placeholder: q.placeholder,
      help_text: q.help_text,
      scale_min_label: q.scale_min_label,
      scale_max_label: q.scale_max_label,
    })),
  });
};

export const saveOptions = async (optionIds: Set<string>, allOptions: QuestionOption[]) => {
  const toSave = allOptions.filter(o => optionIds.has(o.id));
  if (toSave.length === 0) return;

  const { upsertQuestionOptions } = useUpsertQuestionOptions();
  await upsertQuestionOptions({
    inputs: toSave.map(o => ({
      id: o.id,
      option_label: o.option_label,
      option_value: o.option_value,
    })),
  });
};

export const saveSteps = async (stepIds: Set<string>, allSteps: FormStep[]) => {
  const toSave = allSteps.filter(s => stepIds.has(s.id));
  if (toSave.length === 0) return;

  const { upsertFormSteps } = useUpsertFormSteps();
  await upsertFormSteps({
    inputs: toSave.map(s => ({ id: s.id, tips: s.tips })),
  });
};

export const saveFlows = async (flowIds: Set<string>, allFlows: Flow[]) => {
  const toSave = allFlows.filter(f => flowIds.has(f.id));
  if (toSave.length === 0) return;

  const { upsertFlows } = useUpsertFlows();
  await upsertFlows({
    inputs: toSave.map(f => ({ id: f.id, name: f.name })),
  });
};
```

### Acceptance Criteria

- [ ] File created at correct path
- [ ] 5 handlers exported: `saveFormInfo`, `saveQuestions`, `saveOptions`, `saveSteps`, `saveFlows`
- [ ] Each handler filters entities by dirty IDs before saving
- [ ] Handlers return early if nothing to save (`toSave.length === 0`)
- [ ] Only text fields are included in save payloads
- [ ] Uses existing entity composables for mutations
- [ ] `pnpm typecheck` passes

---

## Phase 4: Central Controller (COMPLETED)

Create the orchestrator that coordinates dirty tracking, idle detection, and save execution.

### 4.1 Create useAutoSaveController.ts

**File:** `apps/web/src/features/createForm/composables/autoSave/useAutoSaveController.ts`

**Key Implementation Decision:** Uses `useIdle` + `whenever` instead of debounce for better UX.

```typescript
import { ref, readonly, nextTick } from 'vue';
import { createSharedComposable, useIdle, whenever } from '@vueuse/core';
import { useDirtyTracker } from './useDirtyTracker';
import { useFormEditor } from '../useFormEditor';
import {
  useFormInfoWatcher,
  useQuestionTextWatcher,
  useOptionTextWatcher,
  useStepTipsWatcher,
  useStepContentWatcher,  // 6th watcher for content steps
  useFlowNameWatcher,
} from './watchers';
import {
  saveFormInfo,
  saveQuestions,
  saveOptions,
  saveSteps,
  saveFlows,
} from './handlers';

export const useAutoSaveController = createSharedComposable(() => {
  const { snapshot, restoreDirtyState, hasPendingChanges } = useDirtyTracker();
  const { form, allQuestions, allOptions, allSteps, allFlows } = useFormEditor();

  // useIdle detects when user stops all interaction for 500ms
  const { idle } = useIdle(500);

  const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Register watchers (6 total)
  useFormInfoWatcher();
  useQuestionTextWatcher();
  useOptionTextWatcher();
  useStepTipsWatcher();
  useStepContentWatcher();
  useFlowNameWatcher();

  const executeSave = async () => {
    if (!hasPendingChanges.value) return;

    saveStatus.value = 'saving';
    const toSave = snapshot();

    try {
      const promises: Promise<void>[] = [];

      if (toSave.formInfo && form.value) {
        promises.push(saveFormInfo(form.value));
      }
      if (toSave.questions.size > 0) {
        promises.push(saveQuestions(toSave.questions, allQuestions.value));
      }
      if (toSave.options.size > 0) {
        promises.push(saveOptions(toSave.options, allOptions.value));
      }
      if (toSave.steps.size > 0) {
        promises.push(saveSteps(toSave.steps, allSteps.value));
      }
      if (toSave.flows.size > 0) {
        promises.push(saveFlows(toSave.flows, allFlows.value));
      }

      await Promise.all(promises);

      // Transition immediately: UI component (SaveStatusPill) handles display timing
      saveStatus.value = 'saved';
      await nextTick();
      saveStatus.value = 'idle';

    } catch (error) {
      saveStatus.value = 'error';
      console.error('[AutoSave] Save failed:', error);
      restoreDirtyState(toSave);
    }
  };

  // Save when user becomes idle AND has pending changes
  whenever(
    () => idle.value && hasPendingChanges.value,
    () => executeSave()
  );

  return { saveStatus: readonly(saveStatus), hasPendingChanges };
});
```

**Why useIdle + whenever instead of useDebounceFn:**
- `useIdle` detects actual user inactivity (mousemove, keydown, etc.)
- Saves only when user stops interacting, not just after a delay
- `whenever` fires when condition becomes true (handles edge cases)

### Acceptance Criteria

- [ ] File created at correct path
- [ ] Uses `createSharedComposable` for singleton pattern
- [ ] Registers all 5 watchers on initialization
- [ ] `executeSave` captures snapshot atomically before saving
- [ ] Handlers run in parallel via `Promise.all`
- [ ] `restoreDirtyState` called in catch block to prevent data loss
- [ ] Status transitions: idle → saving → saved → idle (or error)
- [ ] Single 500ms debounce via `useDebounceFn`
- [ ] `pnpm typecheck` passes

---

## Phase 5: Navigation Guard

Create the navigation guard to prevent data loss on page leave.

### 5.1 Create useNavigationGuard.ts

**File:** `apps/web/src/features/createForm/composables/autoSave/useNavigationGuard.ts`

```typescript
import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useDirtyTracker } from './useDirtyTracker';

export const useNavigationGuard = () => {
  const { hasPendingChanges } = useDirtyTracker();

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasPendingChanges.value) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  onBeforeRouteLeave((to, from, next) => {
    if (hasPendingChanges.value) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirmed) return next(false);
    }
    next();
  });
};
```

### Acceptance Criteria

- [ ] File created at correct path
- [ ] Adds `beforeunload` listener on mount, removes on unmount
- [ ] Uses `onBeforeRouteLeave` for Vue Router navigation
- [ ] Only triggers warning when `hasPendingChanges` is true
- [ ] Browser close/refresh shows native dialog
- [ ] Route navigation shows confirm dialog
- [ ] `pnpm typecheck` passes

---

## Phase 6: Barrel Export and Integration

### 6.1 Create index.ts

**File:** `apps/web/src/features/createForm/composables/autoSave/index.ts`

```typescript
export { useDirtyTracker } from './useDirtyTracker';
export { useAutoSaveController } from './useAutoSaveController';
export { useNavigationGuard } from './useNavigationGuard';
```

### 6.2 Wire Up in FormStudioPage

**File:** `apps/web/src/pages/forms/[formSlug]/studio.vue`

Add initialization:

```typescript
import { useAutoSaveController, useNavigationGuard } from '@/features/createForm/composables/autoSave';

// In setup
const autoSave = useAutoSaveController();
useNavigationGuard();

// In template - connect to header
<FormEditorHeader :save-status="autoSave.saveStatus.value" />
```

### Acceptance Criteria

- [ ] Barrel export created with all public composables
- [ ] `useAutoSaveController` initialized in FormStudioPage
- [ ] `useNavigationGuard` initialized in FormStudioPage
- [ ] Save status connected to UI header component
- [ ] `pnpm typecheck` passes
- [ ] Manual test: Type in question → see "Saving..." → "Saved"
- [ ] Manual test: Type and close tab → see browser warning

---

## Phase 7: Cleanup Deprecated Composables

Remove the old fragmented auto-save composables.

### Files to Remove

- [ ] `apps/web/src/features/createForm/composables/useFormAutoSave.ts`
- [ ] `apps/web/src/features/createForm/composables/useQuestionSave.ts`
- [ ] `apps/web/src/features/createForm/composables/useStepSave.ts`
- [ ] `apps/web/src/features/createForm/composables/useStepAutoSave.ts`

### Files to Update

- [ ] Remove imports of deprecated composables from any files using them
- [ ] Update barrel exports in composables index

### Acceptance Criteria

- [ ] Deprecated composables removed
- [ ] No TypeScript errors from missing imports
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes

---

## Testing Checklist

### Unit Tests

- [ ] `useDirtyTracker` - mark/snapshot/restore/clear
- [ ] Watchers - mark dirty on text change, not on entity switch
- [ ] Handlers - filter by ID, skip if empty

### Integration Tests

- [ ] Type in form name → saves after 500ms
- [ ] Type in question text → saves correct question
- [ ] Type in Q1, switch to Q2 within 500ms → Q1 saved, not Q2
- [ ] Save failure → dirty state restored
- [ ] Navigate away with pending changes → warning shown

### Manual Tests

- [ ] Rapid typing batches into single save
- [ ] Toggle (non-text) changes save immediately (existing behavior)
- [ ] Close tab with unsaved changes → browser dialog
- [ ] Network error → status shows error, can retry

---

## Rollback Strategy

If issues are discovered:

1. **Quick revert**: Git revert the implementation commits
2. **Deprecated composables**: Still available in git history if needed
3. **Feature flag**: Can wrap new controller in feature flag if partial rollout needed

---

## Dependencies

### Required Composables (must exist)

- `useFormEditor` - provides `form`, `allQuestions`, `allOptions`, `allSteps`, `allFlows`
- `useQuestionEditor` - provides `activeQuestion`
- `useTimelineEditor` - provides `activeStep`, `activeFlow`

### Required Entity Composables (mutations)

- `useUpdateForm`
- `useUpsertFormQuestions`
- `useUpsertQuestionOptions`
- `useUpsertFormSteps`
- `useUpsertFlows`

### VueUse Dependencies

- `createSharedComposable`
- `useDebounceFn`

---

## Notes

- **Immediate saves for non-text controls** are handled by existing composables (`useTimelineStepCrud`, `useQuestionSettings`, etc.) - no changes needed
- **Design config saves** (color, logo) use immediate mutations - not part of auto-save
- **Step CRUD operations** (add/delete/reorder) use immediate mutations - not part of auto-save
- Only text field typing benefits from debounced auto-save
