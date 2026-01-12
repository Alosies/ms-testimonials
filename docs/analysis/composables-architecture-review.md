# CreateForm Composables Architecture Review

**Date:** 2026-01-12
**Scope:** `apps/web/src/features/createForm/composables/`
**Total Lines:** ~7,100 across 42 files
**Architecture:** Feature-Sliced Design (FSD)

---

## Executive Summary

The createForm feature has grown organically with significant technical debt. While individual composables are well-documented, the overall architecture suffers from **SOLID principle violations** and **FSD layer boundary violations** that make the system difficult to reason about and maintain.

**Key Issues:**
1. "God Composable" pattern (`useTimelineEditor` returns 80+ methods)
2. Feature layer doing entity-level work (data operations belong in entities)
3. Dual save mechanisms with complex coordination
4. Type duplication across layers
5. Hardcoded business rules scattered across files

---

## FSD Layer Reference

```
src/
├── app/        ← App init, providers, routing
├── pages/      ← Route components (THIN - just compose features)
├── widgets/    ← Composite UI blocks (optional)
├── features/   ← User actions & workflows (orchestration)
├── entities/   ← Business entities (data + operations)
└── shared/     ← Utilities, UI kit, API helpers
```

**FSD Rules:**
- Higher layers import from lower layers (never reverse)
- **Entities own their data** — types, validation, GraphQL operations
- **Entities do NOT import from other entities** — cross-entity logic belongs in features
- **Features orchestrate** — compose entities, manage UI state for workflows
- Features should be thin; if they grow large, logic likely belongs in entities

**Rule of Thumb for Function Placement:**
```
If function needs 1 entity type  → entities/{entity}/functions/
If function needs 2+ entity types → features/{feature}/functions/
```

---

## SOLID Principle Violations

### 1. Single Responsibility Principle (SRP)

> **Principle:** A module should have one, and only one, reason to change. Each composable should do ONE thing well.

#### Violation: `useTimelineEditor` — "God Composable"

**Location:** `composables/timeline/useTimelineEditor.ts` (389 lines)

This composable manages:
- Form ID and context
- Step array state
- Selection state
- Step CRUD operations
- Branching logic
- Design configuration
- Persistence coordination

**Evidence:** Returns 80+ properties/methods:

```typescript
return {
  // Form context (4 items)
  currentFormId, setFormId, resetState, formContext,

  // Step state (7 items)
  steps, originalSteps, isDirty, hasSteps, setSteps, markClean, getStepById,

  // Selection (6 items)
  selectedIndex, selectedStep, canGoNext, canGoPrev, selectStep, selectStepById,

  // CRUD operations (11 items)
  addStep, addStepAsync, removeStep, updateStep, moveStep, duplicateStep, /* ... */

  // Persistence operations (8 items)
  handleAddStepWithPersist, handleRemoveStepWithPersist, /* ... */

  // Branching state (15 items)
  branchingConfig, isBranchingEnabled, sharedSteps, testimonialSteps, /* ... */

  // Branching operations (15 items)
  enableBranching, disableBranching, setBranchingThreshold, /* ... */

  // Design config (18 items)
  designConfig, primaryColor, logoUrl, updatePrimaryColor, /* ... */
};
```

**Why it's wrong:** Any change to branching logic, selection behavior, or design config requires modifying this file. Components get access to everything even if they only need selection.

#### ✅ FSD-Compliant Fix

**Split by responsibility, move data operations to entities:**

```
entities/formStep/
├── composables/
│   ├── queries/useGetFormSteps.ts
│   └── mutations/
│       ├── useCreateFormStep.ts
│       ├── useUpdateFormStep.ts
│       └── useDeleteFormStep.ts
└── models/index.ts              ← FormStep type lives here

features/createForm/
├── composables/
│   ├── useTimelineState.ts      ← UI state only (selection, panels)
│   ├── useTimelineActions.ts    ← Thin orchestrator of entity operations
│   ├── useBranchingState.ts     ← Branching UI state
│   └── useDesignConfig.ts       ← Design customization
```

**Example — Selection as standalone composable:**

```typescript
// features/createForm/composables/useTimelineSelection.ts
export function useTimelineSelection(steps: Ref<readonly FormStep[]>) {
  const selectedIndex = ref(0);

  const selectedStep = computed(() => steps.value[selectedIndex.value] ?? null);
  const canGoNext = computed(() => selectedIndex.value < steps.value.length - 1);
  const canGoPrev = computed(() => selectedIndex.value > 0);

  function selectStep(index: number) {
    selectedIndex.value = Math.max(0, Math.min(index, steps.value.length - 1));
  }

  return {
    selectedIndex: readonly(selectedIndex),
    selectedStep,
    canGoNext,
    canGoPrev,
    selectStep,
  };
}
```

**Example — Actions as thin orchestrator:**

```typescript
// features/createForm/composables/useTimelineActions.ts
import { useCreateFormStep, useDeleteFormStep } from '@/entities/formStep';

export function useTimelineActions(
  steps: Ref<FormStep[]>,
  selection: ReturnType<typeof useTimelineSelection>
) {
  // Entity composables provide data operations
  const { createFormStep } = useCreateFormStep();
  const { deleteFormStep } = useDeleteFormStep();

  async function addStep(type: StepType, afterIndex?: number) {
    const newStep = await createFormStep({ stepType: type, /* ... */ });
    // Update local state
    steps.value.splice(afterIndex ?? steps.value.length, 0, newStep);
    selection.selectStep(steps.value.indexOf(newStep));
  }

  async function removeStep(index: number) {
    const step = steps.value[index];
    await deleteFormStep(step.id);
    steps.value.splice(index, 1);
  }

  return { addStep, removeStep };
}
```

---

#### Violation: `useCreateFormWithSteps` — Does Too Much

**Location:** `composables/wizard/useCreateFormWithSteps.ts` (451 lines)

Creates form, questions, flows, AND steps in a single 180-line function:

```typescript
async function createFormWithSteps(params) {
  const form = await createForm({ /* ... */ });           // Step 1
  const questions = await createFormQuestions({ /* ... */ }); // Step 2
  const flows = await createFlows({ /* ... */ });         // Step 3
  const steps = buildFormSteps(/* 100+ lines */);         // Step 4
  await createFormSteps({ inputs: steps });               // Step 5
  await updateForm({ branching_config: /* ... */ });      // Step 6
}
```

**Why it's wrong:** Cannot create just a form, or just add questions. All operations bundled together.

#### ✅ FSD-Compliant Fix

**Separate entity operations; feature orchestrates:**

```typescript
// entities/form/composables/mutations/useCreateForm.ts
// Already exists — creates form only

// entities/formQuestion/composables/mutations/useCreateFormQuestions.ts
// Already exists — creates questions only

// features/createForm/composables/wizard/useFormCreation.ts
// Thin orchestrator that calls entities in sequence
import { useCreateForm } from '@/entities/form';
import { useCreateFormQuestions } from '@/entities/formQuestion';
import { useCreateFlows } from '@/entities/flow';
import { useCreateFormSteps } from '@/entities/formStep';

export function useFormCreation() {
  const { createForm } = useCreateForm();
  const { createFormQuestions } = useCreateFormQuestions();
  const { createFlows } = useCreateFlows();
  const { createFormSteps } = useCreateFormSteps();

  async function createFormWithSteps(params: WizardOutput) {
    // Each step is a simple entity call
    const form = await createForm(params.formData);
    const questions = await createFormQuestions(form.id, params.questions);
    const flows = await createFlows(form.id, params.branchingConfig);
    await createFormSteps(form.id, flows, questions);
    return form;
  }

  return { createFormWithSteps };
}
```

**Move step-building logic to feature (NOT entity):**

> **FSD Rule:** Entities should NOT import from other entities. Since `buildStepsFromQuestions` needs `FormQuestion` (from formQuestion entity) and `Flow` (from flow entity), it must live in a higher layer that can import from multiple entities.

```typescript
// features/createForm/functions/buildStepsFromQuestions.ts
// ✅ Feature layer CAN import from multiple entities
import type { FormQuestion } from '@/entities/formQuestion';
import type { Flow } from '@/entities/flow';
import type { FormStepInput } from '@/entities/formStep';

export function buildStepsFromQuestions(
  formId: string,
  questions: FormQuestion[],
  flows: Flow[],
  conceptName: string
): FormStepInput[] {
  // Pure function — no side effects, easily testable
  const steps: FormStepInput[] = [];

  // Welcome step
  steps.push(createWelcomeStep(formId, flows.shared.id, conceptName));

  // Question steps
  for (const q of questions) {
    steps.push(createQuestionStep(formId, q, flows));
  }

  // Thank you steps per flow
  // ...

  return steps;
}
```

**What SHOULD live in entity functions (single-entity only):**

```typescript
// entities/formStep/functions/stepValidation.ts
// ✅ Only uses FormStep — no cross-entity imports
export function isValidStepOrder(steps: FormStep[]): boolean {
  return steps.every((s, i) => s.stepOrder === i);
}

// entities/formStep/functions/stepTransform.ts
// ✅ Only transforms FormStep data
export function toFormStepInput(step: FormStep): FormStepInput {
  return { id: step.id, form_id: step.formId, step_type: step.stepType };
}
```

---

### 2. Open/Closed Principle (OCP)

> **Principle:** Software should be open for extension but closed for modification. Add new behavior without changing existing code.

#### Violation: Hardcoded Step Type Logic

**Location:** Multiple files

Adding a new step type (e.g., `video_upload`) requires modifying:

1. `useCreateFormWithSteps.ts` — buildFormSteps logic
2. `stepOperations.ts` — addStepAt, duplicateStepAt
3. `useStepQuestionService.ts` — requiresQuestion check
4. `useTimelineBranching.ts` — flow membership rules
5. Step content type definitions

**Example of hardcoded logic:**

```typescript
// composables/wizard/useCreateFormWithSteps.ts
function buildFormSteps(/* ... */) {
  // Hardcoded: welcome always first
  steps.push(createStep('welcome', 'shared', welcomeContent));

  // Hardcoded: loop logic per flow membership
  for (/* ... */) {
    if (originalQuestion.flow_membership !== 'shared') continue;
    const isRating = originalQuestion.question_type_id.startsWith('rating');
    const stepType = isRating ? 'rating' : 'question';  // Hardcoded mapping
    steps.push(createStep(stepType, 'shared', {}, createdQuestion.id));
  }

  // Hardcoded: testimonial flow gets consent
  steps.push(createStep('consent', 'testimonial', consentContent));

  // Hardcoded: improvement flow gets different thank_you
  steps.push(createStep('thank_you', 'improvement', improvementThankYouContent));
}
```

#### ✅ FSD-Compliant Fix

**Use a registry pattern in the entity layer:**

```typescript
// entities/formStep/config/stepTypeRegistry.ts
export interface StepTypeConfig {
  type: StepType;
  requiresQuestion: boolean;
  defaultContent: () => StepContent;
  allowedFlows: FlowMembership[];
  canDuplicate: boolean;
  canDelete: (context: { isBranchPoint: boolean }) => boolean;
}

const stepTypeRegistry: Record<StepType, StepTypeConfig> = {
  welcome: {
    type: 'welcome',
    requiresQuestion: false,
    defaultContent: () => ({ title: 'Welcome!', subtitle: '' }),
    allowedFlows: ['shared'],
    canDuplicate: false,
    canDelete: () => false,  // Welcome is required
  },
  question: {
    type: 'question',
    requiresQuestion: true,
    defaultContent: () => ({}),
    allowedFlows: ['shared', 'testimonial', 'improvement'],
    canDuplicate: true,
    canDelete: ({ isBranchPoint }) => !isBranchPoint,
  },
  rating: {
    type: 'rating',
    requiresQuestion: true,
    defaultContent: () => ({}),
    allowedFlows: ['shared'],
    canDuplicate: false,
    canDelete: ({ isBranchPoint }) => !isBranchPoint,
  },
  // ... other types
};

// Adding new type = add entry here, no other file changes
export function getStepTypeConfig(type: StepType): StepTypeConfig {
  return stepTypeRegistry[type];
}

export function requiresQuestion(type: StepType): boolean {
  return getStepTypeConfig(type).requiresQuestion;
}
```

**Usage in feature:**

```typescript
// features/createForm/composables/useTimelineActions.ts
import { getStepTypeConfig, requiresQuestion } from '@/entities/formStep';

async function addStep(type: StepType) {
  const config = getStepTypeConfig(type);

  let questionId = null;
  if (config.requiresQuestion) {
    const question = await createFormQuestion({ /* ... */ });
    questionId = question.id;
  }

  const step = await createFormStep({
    stepType: type,
    content: config.defaultContent(),
    questionId,
  });
}
```

---

### 3. Liskov Substitution Principle (LSP)

> **Principle:** Subtypes must be substitutable for their base types. Functions should work correctly with any implementation of an interface.

#### Violation: Inconsistent Method Signatures

**Location:** `useTimelineStepCrud.ts`

Same operation, three different signatures:

```typescript
// Sync version — returns FormStep
function addStep(type: StepType, afterIndex?: number): FormStep

// Async version — returns Promise<FormStep>
async function addStepAsync(type: StepType, afterIndex?: number): Promise<FormStep>

// Persist version — also returns Promise<FormStep> but different behavior
async function addStepWithPersist(type: StepType, afterIndex?: number): Promise<FormStep>
```

**Why it's wrong:** Callers must know which version to use. Cannot substitute one for another. The naming convention (`Async`, `WithPersist`) indicates the interface is unstable.

#### ✅ FSD-Compliant Fix

**Single interface, options object for variants:**

```typescript
// entities/formStep/composables/mutations/useCreateFormStep.ts
interface CreateStepOptions {
  persist?: boolean;  // Default: true
  optimistic?: boolean;  // Default: true
}

export function useCreateFormStep() {
  async function createFormStep(
    input: CreateStepInput,
    options: CreateStepOptions = {}
  ): Promise<FormStep> {
    const { persist = true, optimistic = true } = options;

    // Always create local step first (optimistic)
    const localStep = buildLocalStep(input);

    if (persist) {
      // Persist to database
      const savedStep = await mutate({ variables: { input } });
      return savedStep;
    }

    return localStep;
  }

  return { createFormStep };
}
```

**Usage:**

```typescript
// Default: persists immediately
const step = await createFormStep({ stepType: 'question', formId });

// Explicit: local only (for wizard preview)
const previewStep = await createFormStep(
  { stepType: 'question', formId },
  { persist: false }
);
```

---

### 4. Interface Segregation Principle (ISP)

> **Principle:** Clients should not depend on interfaces they don't use. Provide focused interfaces instead of one large one.

#### Violation: Everything Exposed to Everyone

**Location:** `useTimelineEditor.ts`

A read-only preview component gets access to destructive operations:

```typescript
// PreviewPanel.vue — only needs to READ steps
const editor = useTimelineEditor();

// But it can also:
editor.removeStepWithPersist(0);           // Delete!
editor.disableBranchingDeleteAll();        // Destructive!
editor.updatePrimaryColor('#ff0000');      // Modify design!
```

**Why it's wrong:** No compile-time protection. Easy to accidentally call mutation methods.

#### ✅ FSD-Compliant Fix

**Separate composables by capability:**

```typescript
// features/createForm/composables/useTimelineReader.ts
// READ-ONLY interface for display components
export function useTimelineReader() {
  const steps = readonly(useTimelineState().steps);
  const branchingConfig = readonly(useBranchingState().config);

  return {
    steps,
    branchingConfig,
    getStepById: (id: string) => steps.value.find(s => s.id === id),
    isBranchingEnabled: computed(() => branchingConfig.value.enabled),
  };
}

// features/createForm/composables/useTimelineMutator.ts
// WRITE interface for editor components
export function useTimelineMutator() {
  const actions = useTimelineActions();

  return {
    addStep: actions.addStep,
    removeStep: actions.removeStep,
    updateStep: actions.updateStep,
    reorderSteps: actions.reorderSteps,
  };
}

// features/createForm/composables/useTimelineBranchingControl.ts
// Branching-specific interface
export function useTimelineBranchingControl() {
  const branching = useBranchingState();

  return {
    enable: branching.enable,
    disable: branching.disable,
    setThreshold: branching.setThreshold,
  };
}
```

**Usage in components:**

```typescript
// PreviewPanel.vue — only gets read access
const { steps, isBranchingEnabled } = useTimelineReader();
// Cannot call mutations — they don't exist on this interface

// StepEditor.vue — gets write access
const { steps } = useTimelineReader();
const { updateStep } = useTimelineMutator();

// BranchingSettings.vue — gets branching control
const { enable, disable, setThreshold } = useTimelineBranchingControl();
```

---

### 5. Dependency Inversion Principle (DIP)

> **Principle:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

#### Violation: Direct GraphQL Dependencies

**Location:** `useTimelineBranching.ts`, `useAutoSaveController.ts`

Feature composables directly import and call entity mutations:

```typescript
// features/createForm/composables/timeline/useTimelineBranching.ts
import { useClearFlowBranchColumns, useDeleteFlow } from '@/entities/flow';
import { useDeleteFormSteps } from '@/entities/formStep';

export function useTimelineBranching(deps) {
  // Direct dependency on concrete implementations
  const { clearFlowBranchColumns } = useClearFlowBranchColumns();
  const { deleteFormSteps } = useDeleteFormSteps();
  const { deleteFlow } = useDeleteFlow();

  async function disableBranchingDeleteAllWithPersist() {
    // Calling GraphQL directly from business logic
    await clearFlowBranchColumns(currentFormId);
    await deleteFormSteps({ ids: stepIdsToDelete });
    for (const flowId of flowIdsToDelete) {
      await deleteFlow({ flowId });
    }
  }
}
```

**Why it's wrong:**
- Cannot test branching logic without mocking GraphQL
- Feature knows too much about persistence implementation
- Changes to GraphQL schema ripple through feature code

#### ✅ FSD-Compliant Fix

In FSD, **entities own their operations**. Features should call entity methods without knowing HOW they persist.

**Entity provides high-level operations:**

```typescript
// entities/flow/composables/mutations/useDisableBranching.ts
export function useDisableBranching() {
  const { clearFlowBranchColumns } = useClearFlowBranchColumns();
  const { deleteFlow } = useDeleteFlow();

  /**
   * Disable branching for a form.
   * Clears branch columns and optionally deletes branch flows.
   */
  async function disableBranching(
    formId: string,
    options: { deleteFlows?: boolean; flowIdsToDelete?: string[] } = {}
  ) {
    await clearFlowBranchColumns(formId);

    if (options.deleteFlows && options.flowIdsToDelete) {
      await Promise.all(
        options.flowIdsToDelete.map(id => deleteFlow({ flowId: id }))
      );
    }
  }

  return { disableBranching };
}
```

**Feature calls entity operation:**

```typescript
// features/createForm/composables/useBranchingActions.ts
import { useDisableBranching } from '@/entities/flow';
import { useDeleteFormSteps } from '@/entities/formStep';

export function useBranchingActions(state: BranchingState) {
  const { disableBranching } = useDisableBranching();
  const { deleteFormSteps } = useDeleteFormSteps();

  async function disableAndDeleteAll() {
    const stepIds = state.branchedSteps.value.map(s => s.id);
    const flowIds = state.branchFlowIds.value;

    // High-level calls to entities
    await deleteFormSteps({ ids: stepIds });
    await disableBranching(state.formId.value, {
      deleteFlows: true,
      flowIdsToDelete: flowIds
    });

    // Update local state
    state.config.value = { enabled: false };
  }

  return { disableAndDeleteAll };
}
```

**Benefit:** Feature code reads like business logic, not database operations.

---

## Additional FSD Violations

### 6. Feature Doing Entity Work

**Location:** `features/createForm/models/index.ts`

Types defined in feature that belong in entities:

```typescript
// features/createForm/models/index.ts
export interface FormData {
  name: string;
  product_name: string;
  product_description: string;
}

export interface QuestionData extends AIQuestion {
  id?: string;
  isNew?: boolean;
  isModified?: boolean;
}
```

#### ✅ FSD-Compliant Fix

**Move to entities:**

```typescript
// entities/form/models/index.ts
export interface FormData {
  name: string;
  productName: string;
  productDescription: string;
}

// entities/formQuestion/models/index.ts
export interface FormQuestion {
  id: string;
  questionText: string;
  questionTypeId: string;
  // ...
}

// For wizard-specific extension, use type composition:
// features/createForm/models/index.ts
import type { FormQuestion } from '@/entities/formQuestion';

export interface WizardQuestion extends FormQuestion {
  isNew: boolean;
  isModified: boolean;
}
```

---

### 7. Dual Save Mechanism Complexity

**Location:** `autoSave/` + `*WithPersist` methods throughout

Two competing save strategies:

| Auto-Save | Immediate Save |
|-----------|----------------|
| Debounced 500ms | Synchronous |
| Watches for changes | Explicit method calls |
| Batches entities | Single operation |

They coordinate via `useSaveLock`:

```typescript
// Auto-save checks lock
if (isLocked.value) {
  console.log('[AutoSave] Skipped - immediate save in progress');
  return;
}

// Immediate save acquires lock
async function addStepWithPersist(type) {
  return withLock('add-step', async () => { /* ... */ });
}
```

**Why it's complex:** Developers must understand both systems and when each applies.

#### ✅ FSD-Compliant Fix

**Unify into single pattern — Command-based saves:**

```typescript
// entities/formStep/composables/useStepPersistence.ts
type SaveStrategy = 'immediate' | 'debounced';

export function useStepPersistence() {
  const pendingChanges = ref<Map<string, Partial<FormStep>>>(new Map());
  const saveStrategy = ref<SaveStrategy>('debounced');

  // Internal: actual save logic
  async function flush() {
    const changes = new Map(pendingChanges.value);
    pendingChanges.value.clear();

    await batchUpdate(changes);
  }

  // Debounced flush
  const debouncedFlush = useDebounceFn(flush, 500);

  // Public API: single save method
  async function saveStep(id: string, changes: Partial<FormStep>) {
    pendingChanges.value.set(id, {
      ...pendingChanges.value.get(id),
      ...changes,
    });

    if (saveStrategy.value === 'immediate') {
      await flush();
    } else {
      debouncedFlush();
    }
  }

  // Switch strategy for discrete actions
  function withImmediateSave<T>(fn: () => Promise<T>): Promise<T> {
    const previous = saveStrategy.value;
    saveStrategy.value = 'immediate';
    return fn().finally(() => {
      saveStrategy.value = previous;
    });
  }

  return { saveStep, withImmediateSave, pendingChanges };
}
```

**Usage:**

```typescript
// Regular edit — debounced
saveStep(stepId, { content: newContent });

// Discrete action — immediate
await withImmediateSave(async () => {
  await saveStep(stepId, { stepOrder: newOrder });
});
```

---

## Proposed Target Architecture (FSD-Compliant)

```
entities/
├── form/
│   ├── models/
│   │   └── index.ts                 ← Form, FormData types
│   ├── composables/
│   │   ├── queries/useGetForm.ts
│   │   └── mutations/useUpdateForm.ts
│   └── index.ts
│
├── formStep/
│   ├── models/
│   │   └── index.ts                 ← FormStep type
│   ├── config/
│   │   └── stepTypeRegistry.ts      ← Step type configuration (OCP)
│   ├── functions/
│   │   ├── stepValidation.ts        ← Single-entity functions only
│   │   └── stepTransform.ts
│   ├── composables/
│   │   ├── queries/useGetFormSteps.ts
│   │   ├── mutations/
│   │   │   ├── useCreateFormStep.ts
│   │   │   ├── useUpdateFormStep.ts
│   │   │   └── useDeleteFormStep.ts
│   │   └── useStepPersistence.ts    ← Unified save strategy
│   └── index.ts
│
├── formQuestion/
│   └── ...
│
└── flow/
    ├── composables/
    │   └── mutations/
    │       └── useDisableBranching.ts  ← High-level operation
    └── ...

features/createForm/
├── functions/                       ← Pure functions (multi-entity orchestration)
│   └── buildStepsFromQuestions.ts   ← Needs FormQuestion + Flow + FormStep
│
├── composables/
│   ├── wizard/                      ← Form creation wizard
│   │   ├── useWizardState.ts        ← Wizard screen state
│   │   └── useFormCreation.ts       ← Orchestrates entity calls
│   │
│   ├── timeline/                    ← Form Studio editor
│   │   ├── useTimelineState.ts      ← Selection, panels (UI state)
│   │   ├── useTimelineActions.ts    ← Thin orchestrator
│   │   └── useTimelineReader.ts     ← Read-only interface (ISP)
│   │
│   ├── branching/                   ← Branching feature
│   │   ├── useBranchingState.ts     ← Branching config state
│   │   └── useBranchingActions.ts   ← Enable/disable operations
│   │
│   └── design/                      ← Design customization
│       └── useDesignConfig.ts
│
├── ui/                              ← Feature-specific components
└── index.ts
```

---

## Migration Path

| Phase | What | Effort | Risk |
|-------|------|--------|------|
| **1** | Move types from `features/createForm/models/` to entities | Low | Low |
| **2** | Add `stepTypeRegistry` to `entities/formStep/config/` | Low | Low |
| **3** | Create focused composables (`useTimelineReader`, etc.) | Medium | Low |
| **4** | Extract multi-entity functions to `features/createForm/functions/` | Medium | Low |
| **5** | Split `useTimelineEditor` into focused composables | High | Medium |
| **6** | Unify save mechanism | High | Medium |

**Recommended approach:** Start with Phases 1-4 (low risk, immediate clarity). Phase 5-6 can be done incrementally.

> **Note on Phase 4:** Functions that orchestrate multiple entities (like `buildStepsFromQuestions`) belong in the **feature** layer, not entity layer. Entity functions should only work with their own data type.

---

## Summary Table

| SOLID Principle | Violation | Fix |
|-----------------|-----------|-----|
| **SRP** | `useTimelineEditor` does 6+ things | Split into focused composables by responsibility |
| **OCP** | Step types hardcoded in 5+ files | Use `stepTypeRegistry` in entity layer |
| **LSP** | `addStep` vs `addStepAsync` vs `addStepWithPersist` | Single method with options object |
| **ISP** | 80+ methods exposed to all consumers | Separate `Reader`, `Mutator`, `BranchingControl` interfaces |
| **DIP** | Feature calls GraphQL directly | Entity provides high-level operations; feature orchestrates |

| FSD Violation | Fix |
|---------------|-----|
| Types in feature that belong in entity | Move to `entities/*/models/` |
| Data operations in feature | Move to `entities/*/composables/mutations/` |
| Feature is 7000+ lines | Push logic down to entities; feature becomes thin orchestrator |

---

## Key Takeaway

**The feature layer should be THIN.**

Current state:
```
features/createForm/composables/ → 7,100 lines (too much!)
```

Target state:
```
entities/{form,formStep,formQuestion,flow}/ → Data + operations
features/createForm/composables/ → ~1,500 lines (orchestration only)
```

Push data operations to entities. Features compose and orchestrate. This makes each layer testable, understandable, and maintainable.
