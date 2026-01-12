# ADR-014: FSD-Compliant Composables Refactoring

## Doc Connections
**ID**: `adr-014-fsd-composables-refactoring`

2026-01-12

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Prerequisites**:
- `adr-013-form-entities-schema-refactoring` - Schema specification (must be completed first)

**Supersedes**:
- `adr-012-fsd-composables-refactoring` - Deprecated due to chronology

**Related ReadMes**:
- `adr-010-centralized-auto-save` - Auto-save pattern
- `adr-011-immediate-save-actions` - Immediate save pattern

**Data Model**:
- `data-model.md` - Entity hierarchy and cascade behaviors

---

## Status

**In Progress** - 2026-01-12
- Phase 0.1 (Database Migrations): ✅ Complete
- Phase 0.2-0.5 (GraphQL + Codegen): ✅ Complete
- Phase 1 (Creation Order): 🔲 Next

---

## Context

This ADR documents the current state of `features/createForm/` and provides an actionable refactoring plan that accounts for ADR-013's schema changes.

### Current Metrics (Actual)

| Metric | Value |
|--------|-------|
| Total composable files | 44 |
| Total lines in composables | ~7,200 |
| Composables > 300 lines | 5 (violating limit) |
| Vue components | 64 |
| Pure functions | 4 files |
| Legacy code | 438 lines (to be removed) |

### Largest Composables (SRP Violations)

| Composable | Lines | Responsibilities |
|------------|-------|------------------|
| `useSaveFormSteps.ts` | 495 | Form save, step persistence, branching save, question creation, flow cleanup |
| `useCreateFormWithSteps.ts` | 451 | Form + flow + step + question creation orchestration |
| `useTimelineBranching.ts` | 415 | Branching config, flow focus, flow expansion, detection, disable operations |
| `useTimelineStepCrud.ts` | 396 | Step CRUD + reorder + duplicate + type change + persist variants |
| `useTimelineEditor.ts` | 389 | Steps state, selection, mode, form context, branching, design config |

---

## Current Architecture Analysis

### What's Already Well-Structured

The **entity layer** is properly organized:

```
entities/
├── form/               # 6 model files, queries, mutations
├── formStep/           # CRUD mutations, queries
├── formQuestion/       # 7 mutation composables, queries
├── flow/               # Create, update, delete, branch operations
└── questionOption/     # CRUD mutations
```

**Good patterns observed:**
- GraphQL operations properly in entity folders
- Mutation/query composable separation
- Type extraction from GraphQL results
- Auto-save composables exist (`useUpdateFormAutoSave`, etc.)
- `useQuestionDeletion` implements branch point protection

### What Needs Refactoring

#### 1. Schema-Breaking Changes Required (ADR-013 Dependency)

Current GraphQL fragments use the OLD schema:

```graphql
# FormStepBasic.gql - CURRENT (needs update)
fragment FormStepBasic on form_steps {
  id
  form_id      # ❌ REMOVE - no longer in schema
  flow_id
  question_id  # ❌ REMOVE - relationship inverted
  step_type
  step_order
  ...
}

# FormQuestionBasic.gql - CURRENT (needs update)
fragment FormQuestionBasic on form_questions {
  id
  form_id          # ❌ REMOVE - no longer in schema
  organization_id
  # step_id        # ✅ ADD - new FK to step
  ...
}

# FlowBasic.gql - CURRENT (needs update)
fragment FlowBasic on flows {
  id
  form_id
  flow_type        # Keep for classification
  # is_primary     # ✅ ADD - authoritative primary indicator
  ...
}

# getFormSteps.gql - CURRENT (needs update)
query GetFormSteps($formId: String!) {
  form_steps(
    where: { form_id: { _eq: $formId } }  # ❌ CHANGE to flow.form_id
    ...
  )
}
```

#### 2. Creation Order Inversion Required

Current flow in `useStepQuestionService.ts`:
```typescript
// CURRENT: Question created first, then step references it
await createFormQuestion({
  input: {
    form_id: formId,           // ❌ Being removed
    organization_id: organizationId,
    ...
  },
});
// Then step is created with question_id
```

Required flow (ADR-013):
```typescript
// REQUIRED: Step created first, then question references it
const step = await createFormStep({
  input: {
    flow_id: flowId,           // Only parent
    organization_id: organizationId,
    ...
  },
});
const question = await createFormQuestion({
  input: {
    step_id: step.id,          // Question points to step
    organization_id: organizationId,
    ...
  },
});
```

#### 3. SOLID Violations in Current Code

**SRP Violations:**
| Composable | Current Responsibilities | Should Be |
|------------|-------------------------|-----------|
| `useTimelineEditor` | 6+ (state, selection, CRUD, branching, design, persistence) | State + selection only |
| `useTimelineBranching` | 4+ (config, UI state, detection, operations) | Config state only |
| `useSaveFormSteps` | 5+ (form, steps, questions, flows, branching) | Delegate to entities |

**OCP Violations (Hardcoded Step Types):**
```typescript
// stepOperations.ts - switch statement
switch (type) {
  case 'welcome':
  case 'thank_you':
  case 'contact_info':  // Adding new type = modify this
  case 'consent':
  case 'rating':
  ...
}

// useStepQuestionService.ts - hardcoded configs
const DEFAULT_QUESTION_CONFIGS = {
  improvement: { ... },
  testimonial: { ... },
  shared: { ... },  // Adding new flow type = modify this
}
```

**ISP Violations:**
- `useTimelineEditor` returns 50+ properties/methods
- All consumers get entire interface even if using 10% of it

**DIP Violations:**
```typescript
// useTimelineStepCrud.ts - direct entity coupling
const { createFormSteps } = useCreateFormSteps();
const { deleteFormSteps } = useDeleteFormSteps();
const { upsertFormSteps } = useUpsertFormSteps();
// Feature tightly coupled to 3+ entity composables
```

---

## Decision

Refactor in phases, with **ADR-013 schema migration as Phase 0 prerequisite**.

### Core Principles

1. **Schema first** — Complete ADR-013 migrations before composable changes
2. **Entity layer is mature** — Leverage existing entity composables
3. **Incremental refactoring** — Each phase is independently deployable
4. **Creation order matters** — Step before question (ownership chain)

---

## Implementation Phases

### Phase 0: Schema Migration (Prerequisite - ADR-013)

**Must complete before any composable refactoring.**

#### 0.1 Database Migrations ✅ COMPLETE

ADR-013 migrations applied:
- ✅ Add `is_primary` to `flows`
- ✅ Add `step_id` to `form_questions` (nullable)
- ✅ Drop `form_id` from `form_steps`
- ✅ Drop `question_id` from `form_steps`
- ✅ Drop `form_id` from `form_questions`
- ✅ Drop cascade trigger

**Migrations committed:**
- `1768192103990__flows__add_is_primary_column`
- `1768192138001__form_questions__add_step_id_column`
- `1768192140913__form_steps__drop_question_id_column`
- `1768192143898__form_steps__drop_form_id_column`
- `1768192146720__form_questions__drop_form_id_column`
- `1768192149496__form_steps__drop_cascade_trigger`

#### 0.2 GraphQL Fragment Updates ✅ COMPLETE

| File | Changes | Status |
|------|---------|--------|
| `FormStepBasic.gql` | Remove `form_id`, `question_id`; add `questions { ...FormQuestionWithOptions }` nested relationship | ✅ |
| `FormQuestionBasic.gql` | Remove `form_id`; add `step_id` | ✅ |
| `FlowBasic.gql` | Add `is_primary` | ✅ |

**Note:** Hasura array relationship uses `questions` (plural) - access as `questions[0]` for 0:1 relationship.

#### 0.3 GraphQL Query Updates ✅ COMPLETE

| File | Change | Status |
|------|--------|--------|
| `getFormSteps.gql` | Change filter: `where: { flow: { form_id: { _eq: $formId } } }` | ✅ |
| `getFormQuestions.gql` | Change filter: `where: { step: { flow: { form_id: { _eq: $formId } } } }` | ✅ |
| `deactivateFormQuestions.gql` | Change filter to nested path | ✅ |

#### 0.4 GraphQL Mutation Updates ✅ COMPLETE

| File | Change | Status |
|------|--------|--------|
| `createFormQuestion.gql` | Input uses `step_id` instead of `form_id`; added fragment import | ✅ |
| `createFormQuestions.gql` | Added fragment import | ✅ |

**Note:** `createFormSteps.gql` and `upsertFormSteps.gql` input types are auto-generated from schema - no manual changes needed.

#### 0.5 Run Codegen ✅ COMPLETE
```bash
pnpm codegen:web
```

**Result:** Codegen ran successfully. Generated types updated in:
- `apps/web/src/shared/graphql/generated/operations.ts`
- `apps/web/src/shared/graphql/generated/types.ts`
- `apps/web/src/shared/graphql/generated/schema.graphql`
- `apps/web/src/shared/graphql/generated/introspection.json`

**Next Step:** Phase 1 (Update Creation Order) - requires updating TypeScript composables to use new schema.

---

### Phase 1: Update Creation Order

**Goal:** Align code with new ownership chain (step → question).

#### 1.1 Update `useStepQuestionService.ts`

```typescript
// BEFORE: Creates question with form_id
async function createQuestionForStep(params: CreateQuestionParams) {
  await createFormQuestion({
    input: {
      form_id: formId,  // ❌ Remove
      ...
    },
  });
}

// AFTER: Creates question with step_id (step already exists)
async function createQuestionForStep(params: CreateQuestionParams) {
  await createFormQuestion({
    input: {
      step_id: stepId,  // ✅ Step must exist first
      organization_id,
      ...
    },
  });
}
```

#### 1.2 Update `useCreateFormWithSteps.ts`

Change creation sequence:
```typescript
// BEFORE
1. createForm()
2. createFormQuestions()  // Questions first
3. createFlows()
4. createFormSteps()      // Steps reference questions

// AFTER
1. createForm()
2. createFlows()          // Flows first (steps need flow_id)
3. createFormSteps()      // Steps second (no question_id)
4. createFormQuestions()  // Questions last (reference step_id)
```

#### 1.3 Update `useTimelineStepCrud.ts`

Update `addStepWithPersist`:
```typescript
// BEFORE: Create question, then step with question_id
const questionResult = await createQuestionForStep(...);
const step = { ...newStep, question_id: questionResult.questionId };
await createFormSteps({ inputs: [step] });

// AFTER: Create step, then question with step_id
const stepResult = await createFormSteps({ inputs: [newStep] });
if (requiresQuestion(stepType)) {
  await createQuestionForStep({ stepId: stepResult.id, ... });
}
```

**Effort:** Medium | **Risk:** Medium (changes creation flow)

---

### Phase 2: Break Up Large Composables (SRP)

**Goal:** No composable exceeds 300 lines. Single responsibility per file.

#### 2.1 Split `useTimelineEditor.ts` (389 → ~150 lines)

Extract:
```
useTimelineEditor.ts (389 lines)
├── useTimelineState.ts      # steps[], originalSteps[], isDirty
├── useTimelineSelection.ts  # selectedIndex, selectStep() (already exists: 93 lines)
├── useTimelineCrud.ts       # Thin wrapper delegating to useTimelineStepCrud
└── useTimelineEditor.ts     # Compose above + form context only (~150 lines)
```

#### 2.2 Split `useTimelineBranching.ts` (415 → ~100 lines each)

Extract:
```
useTimelineBranching.ts (415 lines)
├── useBranchingConfig.ts    # branchingConfig state, enable/disable
├── useBranchingFlowUI.ts    # flowFocus, expandedFlow (UI state)
├── useBranchingDetection.ts # Auto-detect from steps (already exists: 117 lines)
└── useBranchingDisable.ts   # Disable operations (already exists: 162 lines)
```

#### 2.3 Split `useSaveFormSteps.ts` (495 → delegate to entities)

This composable does too much. Refactor to:
```typescript
// BEFORE: One composable handles everything
async function saveFormWithSteps() {
  await saveForm();
  await saveSteps();
  await saveQuestions();
  await saveFlows();
  await saveBranching();
}

// AFTER: Orchestrator delegates to entity composables
async function saveFormWithSteps() {
  await formPersistence.save(formData);
  await stepPersistence.saveAll(steps);
  await questionPersistence.saveAll(questions);
  await flowPersistence.saveAll(flows);
}
```

#### 2.4 Split `useCreateFormWithSteps.ts` (451 → ~200 lines)

Extract wizard-specific logic:
```
useCreateFormWithSteps.ts (451 lines)
├── useFormCreationOrchestrator.ts  # Sequence: form→flows→steps→questions
├── useBranchingSetup.ts            # Post-creation branching config
└── useWizardFormSave.ts            # Wizard-specific save handling
```

**Effort:** High | **Risk:** Low (pure refactoring, no behavior change)

---

### Phase 3: Step Type Registry (OCP)

**Goal:** Add new step types by adding to registry, not modifying code.

#### 3.1 Create Registry in Entity Layer

```typescript
// entities/formStep/config/stepTypeRegistry.ts

export interface StepTypeConfig {
  type: StepType;
  label: string;
  icon: string;
  requiresQuestion: boolean;
  defaultContent: () => StepContent;
  editor: Component;
  canBeBranchPoint: boolean;
}

export const stepTypeRegistry: Record<StepType, StepTypeConfig> = {
  welcome: {
    type: 'welcome',
    label: 'Welcome',
    icon: 'hand-wave',
    requiresQuestion: false,
    defaultContent: () => ({ headline: 'Welcome!', ... }),
    editor: WelcomeStepEditor,
    canBeBranchPoint: false,
  },
  rating: {
    type: 'rating',
    label: 'Rating',
    icon: 'star',
    requiresQuestion: true,
    defaultContent: () => ({ headline: 'How would you rate us?' }),
    editor: RatingStepEditor,
    canBeBranchPoint: true,
  },
  // ... all step types
};
```

#### 3.2 Replace Switch Statements

```typescript
// BEFORE (stepOperations.ts)
switch (type) {
  case 'welcome': return createWelcomeContent();
  case 'rating': return createRatingContent();
  ...
}

// AFTER
import { stepTypeRegistry } from '@/entities/formStep';
return stepTypeRegistry[type].defaultContent();
```

#### 3.3 Update `useStepQuestionService.ts`

```typescript
// BEFORE
function requiresQuestion(stepType: StepType): boolean {
  return stepType === 'question' || stepType === 'rating';
}

// AFTER
import { stepTypeRegistry } from '@/entities/formStep';
function requiresQuestion(stepType: StepType): boolean {
  return stepTypeRegistry[stepType].requiresQuestion;
}
```

**Effort:** Medium | **Risk:** Low

---

### Phase 4: Interface Segregation (ISP)

**Goal:** Eliminate the god composable. Consumers import focused composables directly.

#### 4.1 Decompose `useTimelineEditor` Into Independent Composables

The problem with grouping returns is that `useTimelineEditor` still orchestrates everything. Instead, **delete the orchestrator** and have components import what they need directly.

```
BEFORE (God Composable Pattern):
┌─────────────────────────────────────────────────────┐
│ useTimelineEditor (singleton)                       │
│   └── returns 50+ items to ALL consumers            │
└─────────────────────────────────────────────────────┘
         ↑               ↑               ↑
    Component A     Component B     Component C
    (needs 5)       (needs 3)       (needs 10)

AFTER (Focused Composables Pattern):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ useTimeline  │ │ useTimeline  │ │ useTimeline  │
│ State        │ │ Selection    │ │ StepCrud     │
└──────────────┘ └──────────────┘ └──────────────┘
       ↑                ↑                ↑
  Component A      Component B      Component C
  (imports 1)      (imports 1)      (imports 2)
```

#### 4.2 Three-Layer Modular Architecture

Decompose into **State**, **Operations**, and **Persistence** layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 3: PERSISTENCE                         │
│  Async, side-effects, GraphQL mutations                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │useStepSave  │ │useQuestion  │ │useFlowSave  │               │
│  │             │ │Save         │ │             │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              ↑ calls
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 2: OPERATIONS                          │
│  Pure logic, array manipulations, no side-effects               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │useStep      │ │useSelection │ │useBranching │ │useDesign  │ │
│  │Operations   │ │Operations   │ │Operations   │ │Operations │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↑ mutates
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 1: STATE (Stores)                      │
│  Pure reactive state, no logic, no side-effects                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │useSteps     │ │useSelection │ │useBranching │ │useDesign  │ │
│  │Store        │ │Store        │ │Store        │ │Store      │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.3 Layer 1: State Stores (Pure Reactive State)

Each store holds ONE piece of state. No logic, no side-effects.

```typescript
// stores/useStepsStore.ts
export const useStepsStore = createSharedComposable(() => {
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);

  // Computed derivations only - no mutations
  const isDirty = computed(() => !isEqual(steps.value, originalSteps.value));
  const stepCount = computed(() => steps.value.length);
  const stepIds = computed(() => steps.value.map(s => s.id));

  return { steps, originalSteps, isDirty, stepCount, stepIds };
});

// stores/useSelectionStore.ts
export const useSelectionStore = createSharedComposable(() => {
  const selectedIndex = ref(0);
  const selectedStepId = ref<string | null>(null);

  return { selectedIndex, selectedStepId };
});

// stores/useBranchingStore.ts
export const useBranchingStore = createSharedComposable(() => {
  const config = ref<BranchingConfig>(DEFAULT_BRANCHING_CONFIG);
  const flowFocus = ref<FlowType>('shared');
  const expandedFlows = ref<Set<string>>(new Set());

  const isEnabled = computed(() => config.value.enabled);
  const threshold = computed(() => config.value.threshold);

  return { config, flowFocus, expandedFlows, isEnabled, threshold };
});

// stores/useDesignStore.ts
export const useDesignStore = createSharedComposable(() => {
  const config = ref<FormDesignConfig>(DEFAULT_DESIGN_CONFIG);

  const primaryColor = computed(() => config.value.primaryColor);
  const logoUrl = computed(() => config.value.logoUrl);

  return { config, primaryColor, logoUrl };
});

// stores/useFormContextStore.ts
export const useFormContextStore = createSharedComposable(() => {
  const formId = ref<string | null>(null);
  const formName = ref('');
  const organizationId = ref<string | null>(null);

  return { formId, formName, organizationId };
});
```

#### 4.4 Layer 2: Operations (Pure Logic)

Operations mutate state but have NO side-effects (no API calls).

```typescript
// operations/useStepOperations.ts
export function useStepOperations() {
  const stepsStore = useStepsStore();
  const selectionStore = useSelectionStore();

  function addStep(step: FormStep, position?: number) {
    const idx = position ?? stepsStore.steps.value.length;
    stepsStore.steps.value.splice(idx, 0, step);
    selectionStore.selectedIndex.value = idx;
  }

  function removeStep(stepId: string) {
    const idx = stepsStore.steps.value.findIndex(s => s.id === stepId);
    if (idx !== -1) {
      stepsStore.steps.value.splice(idx, 1);
      // Adjust selection if needed
      if (selectionStore.selectedIndex.value >= stepsStore.steps.value.length) {
        selectionStore.selectedIndex.value = Math.max(0, stepsStore.steps.value.length - 1);
      }
    }
  }

  function updateStep(stepId: string, updates: Partial<FormStep>) {
    const step = stepsStore.steps.value.find(s => s.id === stepId);
    if (step) Object.assign(step, updates);
  }

  function moveStep(fromIndex: number, toIndex: number) {
    const [step] = stepsStore.steps.value.splice(fromIndex, 1);
    stepsStore.steps.value.splice(toIndex, 0, step);
    selectionStore.selectedIndex.value = toIndex;
  }

  function reorderSteps(stepIds: string[]) {
    const stepMap = new Map(stepsStore.steps.value.map(s => [s.id, s]));
    stepsStore.steps.value = stepIds.map(id => stepMap.get(id)!).filter(Boolean);
  }

  return { addStep, removeStep, updateStep, moveStep, reorderSteps };
}

// operations/useSelectionOperations.ts
export function useSelectionOperations() {
  const stepsStore = useStepsStore();
  const selectionStore = useSelectionStore();

  const selectedStep = computed(() =>
    stepsStore.steps.value[selectionStore.selectedIndex.value]
  );
  const canGoNext = computed(() =>
    selectionStore.selectedIndex.value < stepsStore.steps.value.length - 1
  );
  const canGoPrev = computed(() =>
    selectionStore.selectedIndex.value > 0
  );

  function select(index: number) {
    selectionStore.selectedIndex.value = Math.max(0,
      Math.min(index, stepsStore.steps.value.length - 1)
    );
  }
  function selectById(stepId: string) {
    const idx = stepsStore.steps.value.findIndex(s => s.id === stepId);
    if (idx !== -1) select(idx);
  }
  function selectNext() { if (canGoNext.value) select(selectionStore.selectedIndex.value + 1); }
  function selectPrev() { if (canGoPrev.value) select(selectionStore.selectedIndex.value - 1); }

  return { selectedStep, canGoNext, canGoPrev, select, selectById, selectNext, selectPrev };
}

// operations/useBranchingOperations.ts
export function useBranchingOperations() {
  const branchingStore = useBranchingStore();
  const stepsStore = useStepsStore();

  function enable(ratingStepId: string, threshold: number = 4) {
    branchingStore.config.value = {
      enabled: true,
      ratingStepId,
      threshold,
    };
  }

  function disable() {
    branchingStore.config.value = DEFAULT_BRANCHING_CONFIG;
  }

  function setFlowFocus(flow: FlowType) {
    branchingStore.flowFocus.value = flow;
  }

  function toggleFlowExpanded(flowId: string) {
    const set = branchingStore.expandedFlows.value;
    set.has(flowId) ? set.delete(flowId) : set.add(flowId);
  }

  function detectFromSteps(): BranchingConfig | null {
    // Pure detection logic
    const ratingStep = stepsStore.steps.value.find(s => s.step_type === 'rating');
    if (!ratingStep) return null;
    // ... detection logic
  }

  return { enable, disable, setFlowFocus, toggleFlowExpanded, detectFromSteps };
}

// operations/useDesignOperations.ts
export function useDesignOperations() {
  const designStore = useDesignStore();

  function updatePrimaryColor(color: string) {
    designStore.config.value = { ...designStore.config.value, primaryColor: color };
  }

  function updateLogo(url: string | null) {
    designStore.config.value = { ...designStore.config.value, logoUrl: url };
  }

  function updateDesign(updates: Partial<FormDesignConfig>) {
    designStore.config.value = { ...designStore.config.value, ...updates };
  }

  return { updatePrimaryColor, updateLogo, updateDesign };
}
```

#### 4.5 Layer 3: Persistence (Side-Effects)

Persistence composables handle async operations and call entity mutations.

```typescript
// persistence/useStepPersistence.ts
export function useStepPersistence() {
  const stepsStore = useStepsStore();
  const formContext = useFormContextStore();
  const { createFormSteps } = useCreateFormSteps();
  const { deleteFormSteps } = useDeleteFormSteps();
  const { upsertFormSteps } = useUpsertFormSteps();

  async function persistAdd(step: FormStep) {
    const result = await createFormSteps({
      inputs: [{
        flow_id: step.flow_id,
        organization_id: formContext.organizationId.value!,
        step_type: step.step_type,
        step_order: step.step_order,
        content: step.content,
      }],
    });
    return result[0];
  }

  async function persistRemove(stepId: string) {
    await deleteFormSteps({ ids: [stepId] });
  }

  async function persistUpdate(stepId: string, updates: Partial<FormStep>) {
    await upsertFormSteps({
      inputs: [{ id: stepId, ...updates }],
    });
  }

  async function persistReorder(steps: FormStep[]) {
    await upsertFormSteps({
      inputs: steps.map((s, i) => ({ id: s.id, step_order: i })),
    });
  }

  async function persistAll() {
    const dirty = getDirtySteps(stepsStore.steps.value, stepsStore.originalSteps.value);
    if (dirty.length > 0) {
      await upsertFormSteps({ inputs: dirty });
    }
  }

  return { persistAdd, persistRemove, persistUpdate, persistReorder, persistAll };
}

// persistence/useQuestionPersistence.ts
export function useQuestionPersistence() {
  const formContext = useFormContextStore();
  const { createFormQuestion } = useCreateFormQuestion();
  const { updateFormQuestion } = useUpdateFormQuestion();

  async function persistCreate(stepId: string, questionData: Partial<FormQuestion>) {
    return await createFormQuestion({
      input: {
        step_id: stepId,  // New schema: question references step
        organization_id: formContext.organizationId.value!,
        ...questionData,
      },
    });
  }

  async function persistUpdate(questionId: string, updates: Partial<FormQuestion>) {
    await updateFormQuestion({ id: questionId, ...updates });
  }

  return { persistCreate, persistUpdate };
}
```

#### 4.6 Composed Actions (Optional Convenience Layer)

For common multi-step workflows, create thin action composables:

```typescript
// actions/useAddStepAction.ts
export function useAddStepAction() {
  const stepOps = useStepOperations();
  const stepPersist = useStepPersistence();
  const questionPersist = useQuestionPersistence();
  const { requiresQuestion } = stepTypeRegistry;

  async function addStepWithPersist(type: StepType, flowId: string, position?: number) {
    // 1. Create step in DB first (new ownership model)
    const stepData = createDefaultStep(type, flowId, position);
    const persistedStep = await stepPersist.persistAdd(stepData);

    // 2. If step type requires question, create it with step_id
    if (requiresQuestion(type)) {
      await questionPersist.persistCreate(persistedStep.id, {
        question_text: getDefaultQuestionText(type),
        question_type_id: 'text_long',
      });
    }

    // 3. Update local state
    stepOps.addStep(persistedStep, position);

    return persistedStep;
  }

  return { addStepWithPersist };
}

// actions/useRemoveStepAction.ts
export function useRemoveStepAction() {
  const stepOps = useStepOperations();
  const stepPersist = useStepPersistence();
  const branchingStore = useBranchingStore();

  async function removeStepWithPersist(stepId: string) {
    // Check if step is branch point
    if (branchingStore.config.value.ratingStepId === stepId) {
      throw new Error('Cannot remove branch point step. Disable branching first.');
    }

    // 1. Persist deletion (cascades to question via FK)
    await stepPersist.persistRemove(stepId);

    // 2. Update local state
    stepOps.removeStep(stepId);
  }

  return { removeStepWithPersist };
}
```

#### 4.7 Component Usage Examples

```typescript
// StepsSidebar.vue - Read-only display
const { steps, stepCount } = useStepsStore();
const { selectedIndex } = useSelectionStore();
const { select } = useSelectionOperations();

// StepEditor.vue - Edit selected step
const { selectedStep } = useSelectionOperations();
const { updateStep } = useStepOperations();

// AddStepButton.vue - Add with persistence
const { addStepWithPersist } = useAddStepAction();

// BranchingPanel.vue - Branching only
const { isEnabled, threshold } = useBranchingStore();
const { enable, disable } = useBranchingOperations();

// DesignPanel.vue - Design only
const { primaryColor, logoUrl } = useDesignStore();
const { updatePrimaryColor, updateLogo } = useDesignOperations();

// FormStudioPage.vue - Initialize stores
const stepsStore = useStepsStore();
const formContext = useFormContextStore();
const selectionStore = useSelectionStore();

onMounted(async () => {
  const data = await loadFormData(formId);
  stepsStore.steps.value = data.steps;
  stepsStore.originalSteps.value = structuredClone(data.steps);
  formContext.formId.value = data.id;
  formContext.organizationId.value = data.organization_id;
  selectionStore.selectedIndex.value = 0;
});
```

#### 4.8 Dependency Rules

```
Layer 3 (Persistence) → can import → Layer 2 (Operations), Layer 1 (Stores), Entities
Layer 2 (Operations)  → can import → Layer 1 (Stores) only
Layer 1 (Stores)      → can import → Nothing (pure state)

Actions               → can import → All layers (convenience wrappers)
Components            → can import → Any layer directly
```

#### 4.9 File Structure

```
features/createForm/composables/
├── stores/
│   ├── useStepsStore.ts
│   ├── useSelectionStore.ts
│   ├── useBranchingStore.ts
│   ├── useDesignStore.ts
│   ├── useFormContextStore.ts
│   └── index.ts
├── operations/
│   ├── useStepOperations.ts
│   ├── useSelectionOperations.ts
│   ├── useBranchingOperations.ts
│   ├── useDesignOperations.ts
│   └── index.ts
├── persistence/
│   ├── useStepPersistence.ts
│   ├── useQuestionPersistence.ts
│   ├── useFlowPersistence.ts
│   ├── useFormPersistence.ts
│   └── index.ts
├── actions/
│   ├── useAddStepAction.ts
│   ├── useRemoveStepAction.ts
│   ├── useMoveStepAction.ts
│   ├── useSaveAllAction.ts
│   └── index.ts
└── index.ts
```

#### 4.10 Delete Legacy Composables

After migration, delete:
- `useTimelineEditor.ts` (god composable)
- `useTimelineStepCrud.ts` (replaced by operations + persistence + actions)
- `useSaveFormSteps.ts` (replaced by persistence layer)
- `useStepState.ts` (replaced by stores)

**Benefits:**
- **True separation of concerns**: State, logic, and I/O are isolated
- **Testability**: Stores and operations are pure, easy to unit test
- **Reusability**: Operations work on any state, not just the singleton
- **Flexibility**: Components pick exactly what they need from any layer
- **Debugging**: Clear data flow - stores → operations → persistence
- **No god objects**: Each piece has ONE job

**Effort:** High | **Risk:** Medium (requires systematic migration)

---

### Phase 5: Cleanup

**Goal:** Remove dead code, consolidate patterns.

#### 5.1 Remove Legacy Code

Delete `composables/_legacy/` folder (438 lines):
- `useFormEditor.ts` - replaced by timeline editor
- `useFormSections.ts` - replaced by new page structure

#### 5.2 Standardize Handler Patterns

Current `handlers.ts` has 5 repetitive factory functions. Extract generic pattern:

```typescript
// shared/composables/useEntitySaveHandler.ts
export function createSaveHandler<T>(
  mutationFn: (data: T) => Promise<void>,
  dirtyTracker: DirtyTracker,
  entityType: string,
) {
  return async (entities: T[]) => {
    const dirtyIds = dirtyTracker.getDirty(entityType);
    const toSave = entities.filter(e => dirtyIds.has(e.id));
    await Promise.all(toSave.map(mutationFn));
    dirtyTracker.clear(entityType, dirtyIds);
  };
}
```

**Effort:** Low | **Risk:** Low

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Composables > 300 lines | 5 | 0 |
| `useTimelineEditor` return size | 50+ | <15 per group |
| Files to modify for new step type | 5+ | 1 (registry) |
| Legacy code lines | 438 | 0 |
| GraphQL fragments updated | 0/3 | 3/3 |
| Codegen passing | N/A | Yes |

---

## Phase Summary

| Phase | Scope | Effort | Risk | Status |
|-------|-------|--------|------|--------|
| **0.1** | Database migrations | High | High | ✅ Complete |
| **0.2-0.5** | GraphQL updates + Codegen | Medium | Medium | ✅ Complete |
| **1** | Creation order (step → question) | Medium | Medium | 🔲 Pending (next step) |
| **2** | Break up large composables (SRP) | High | Low | 🔲 Pending (requires Phase 1) |
| **3** | Step type registry (OCP) | Medium | Low | 🔲 Pending (independent) |
| **4** | Interface segregation (ISP) | Medium | Low | 🔲 Pending (requires Phase 2) |
| **5** | Cleanup legacy code | Low | Low | 🔲 Pending (requires Phase 2) |

**Next step:** Phase 1 - Update TypeScript composables to use new schema (step → question creation order).

---

## Consequences

### Positive

- **Schema-code alignment** — Code matches ADR-013 ownership model
- **Maintainable composables** — All under 300 lines
- **Extensible step types** — Registry pattern, OCP compliance
- **Focused interfaces** — Consumers get only what they need
- **No dead code** — Legacy folder removed

### Negative

- **Significant migration effort** — Phase 0-1 require careful coordination
- **Breaking changes** — GraphQL types change, codegen required
- **Testing overhead** — Creation flow changes need thorough testing

### Risks

| Risk | Mitigation |
|------|------------|
| Codegen breaks builds | Run codegen in CI before merge |
| Creation order bugs | Write integration tests for form creation |
| Missed GraphQL updates | Search for all `form_id` usages in `.gql` files |

---

## References

- `docs/adr/013-form-entities-schema-refactoring/adr.md` — Schema specification
- `apps/web/CLAUDE.md` — FSD and composable rules
- [Feature-Sliced Design](https://feature-sliced.design/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
