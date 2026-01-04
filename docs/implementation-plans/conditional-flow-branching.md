# Implementation Plan: Conditional Flow Branching

> Rating-based form flow that routes respondents to Testimonial or Improvement paths.

**PRD:** `docs/prd/conditional-flow-branching.md`
**Status:** In Progress
**Created:** January 4, 2026

---

## Overview

Implement side-by-side branched timeline view in the Studio editor, with runtime conditional navigation in the public form.

### Visual Approach: Side-by-Side Columns

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Welcome Step                           (shared)    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ⭐ Rating Step                      [Threshold: 4] │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│           ┌──────────────┴──────────────┐                   │
│           ▼                             ▼                   │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ 🟢 TESTIMONIAL   │      │ 🟠 IMPROVEMENT   │            │
│  │ (Rating ≥ 4)     │      │ (Rating < 4)     │            │
│  ├──────────────────┤      ├──────────────────┤            │
│  │ [Steps...]       │      │ [Steps...]       │            │
│  └──────────────────┘      └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema

### 1.1 Add flow_membership to form_steps

**File:** `db/hasura/migrations/default/TIMESTAMP_form_steps__add_flow_membership/up.sql`

```sql
-- Add flow membership column to form_steps
ALTER TABLE form_steps
ADD COLUMN flow_membership TEXT NOT NULL DEFAULT 'shared'
CHECK (flow_membership IN ('shared', 'testimonial', 'improvement'));

-- Add index for filtering by flow
CREATE INDEX idx_form_steps_flow_membership ON form_steps(form_id, flow_membership);

-- Comment
COMMENT ON COLUMN form_steps.flow_membership IS
  'Which flow this step belongs to: shared (all paths), testimonial (positive), or improvement (negative)';
```

**down.sql:**
```sql
DROP INDEX IF EXISTS idx_form_steps_flow_membership;
ALTER TABLE form_steps DROP COLUMN IF EXISTS flow_membership;
```

### 1.2 Add branching_config to forms

**File:** `db/hasura/migrations/default/TIMESTAMP_forms__add_branching_config/up.sql`

```sql
-- Add branching configuration to forms
ALTER TABLE forms
ADD COLUMN branching_config JSONB NOT NULL DEFAULT '{"enabled": false, "threshold": 4, "ratingStepId": null}';

-- Comment
COMMENT ON COLUMN forms.branching_config IS
  'Branching configuration: { enabled: boolean, threshold: number, ratingStepId: string | null }';
```

**down.sql:**
```sql
ALTER TABLE forms DROP COLUMN IF EXISTS branching_config;
```

### 1.3 Update Hasura Metadata

**File:** `db/hasura/metadata/databases/default/tables/public_form_steps.yaml`

Add to select_permissions columns:
```yaml
- flow_membership
```

Add to insert_permissions columns:
```yaml
- flow_membership
```

Add to update_permissions columns:
```yaml
- flow_membership
```

**File:** `db/hasura/metadata/databases/default/tables/public_forms.yaml`

Add to select/insert/update permissions columns:
```yaml
- branching_config
```

---

## Phase 2: TypeScript Types

### 2.1 Update Step Types

**File:** `apps/web/src/shared/stepCards/models/stepContent.ts`

```typescript
// Add flow membership type
export type FlowMembership = 'shared' | 'testimonial' | 'improvement';

// Update FormStep interface
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

  // NEW: Flow membership for branching
  flowMembership: FlowMembership;

  // Local UI state
  isNew?: boolean;
  isModified?: boolean;
}
```

### 2.2 Add Branching Config Type

**File:** `apps/web/src/entities/form/models/branchingConfig.ts`

```typescript
export interface BranchingConfig {
  enabled: boolean;
  threshold: number;  // e.g., 4 means >=4 is testimonial path
  ratingStepId: string | null;  // Which step triggers the branch
}

export const DEFAULT_BRANCHING_CONFIG: BranchingConfig = {
  enabled: false,
  threshold: 4,
  ratingStepId: null,
};

// Flow metadata for UI
export interface FlowMetadata {
  id: FlowMembership;
  label: string;
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon: string;
}

export const FLOW_METADATA: Record<Exclude<FlowMembership, 'shared'>, FlowMetadata> = {
  testimonial: {
    id: 'testimonial',
    label: 'Testimonial Flow',
    description: 'Rating ≥ threshold',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-400',
    icon: 'heroicons:face-smile',
  },
  improvement: {
    id: 'improvement',
    label: 'Improvement Flow',
    description: 'Rating < threshold',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-400',
    icon: 'heroicons:chat-bubble-left-right',
  },
};
```

### 2.3 Update Form Entity

**File:** `apps/web/src/entities/form/models/index.ts`

Export the new types:
```typescript
export * from './branchingConfig';
```

---

## Phase 3: GraphQL Updates

### 3.1 Update GetForm Query

**File:** `apps/web/src/entities/form/graphql/queries/getForm.gql`

Add `branching_config` to the query:
```graphql
query GetForm($id: String!) {
  forms_by_pk(id: $id) {
    id
    name
    slug
    # ... existing fields
    branching_config  # ADD THIS
  }
}
```

### 3.2 Update GetFormSteps Query

**File:** `apps/web/src/entities/formStep/graphql/queries/getFormSteps.gql`

Add `flow_membership` to the query:
```graphql
query GetFormSteps($formId: String!) {
  form_steps(
    where: { form_id: { _eq: $formId }, is_active: { _eq: true } }
    order_by: { step_order: asc }
  ) {
    id
    form_id
    step_type
    step_order
    question_id
    content
    tips
    is_active
    flow_membership  # ADD THIS
    question {
      id
      question_text
      question_type {
        id
        unique_name
        category
      }
    }
  }
}
```

### 3.3 Update Mutations

**File:** `apps/web/src/entities/formStep/graphql/mutations/createFormSteps.gql`

Ensure `flow_membership` is included in insert:
```graphql
mutation CreateFormSteps($objects: [form_steps_insert_input!]!) {
  insert_form_steps(objects: $objects) {
    returning {
      id
      form_id
      step_type
      step_order
      question_id
      content
      tips
      is_active
      flow_membership  # ADD THIS
    }
  }
}
```

### 3.4 Add UpdateForm Mutation for Branching Config

**File:** `apps/web/src/entities/form/graphql/mutations/updateFormBranchingConfig.gql`

```graphql
mutation UpdateFormBranchingConfig($id: String!, $branchingConfig: jsonb!) {
  update_forms_by_pk(
    pk_columns: { id: $id }
    _set: { branching_config: $branchingConfig }
  ) {
    id
    branching_config
  }
}
```

### 3.5 Run Codegen

```bash
pnpm codegen:web
```

---

## Phase 4: Timeline Editor Updates

### 4.1 Update useTimelineEditor Composable

**File:** `apps/web/src/features/createForm/composables/timeline/useTimelineEditor.ts`

Add branching-aware step management:

```typescript
import type { BranchingConfig, FlowMembership } from '@/entities/form';

// Add to state
const branchingConfig = ref<BranchingConfig>({
  enabled: false,
  threshold: 4,
  ratingStepId: null,
});

// Computed: Get steps by flow
const sharedSteps = computed(() =>
  steps.value.filter(s => s.flowMembership === 'shared')
);

const testimonialSteps = computed(() =>
  steps.value.filter(s => s.flowMembership === 'testimonial')
);

const improvementSteps = computed(() =>
  steps.value.filter(s => s.flowMembership === 'improvement')
);

// Computed: Find branch point (rating step that triggers branching)
const branchPointIndex = computed(() => {
  if (!branchingConfig.value.enabled || !branchingConfig.value.ratingStepId) {
    return -1;
  }
  return steps.value.findIndex(s => s.id === branchingConfig.value.ratingStepId);
});

// Computed: Steps before branch point (always shared)
const stepsBeforeBranch = computed(() => {
  if (branchPointIndex.value === -1) return steps.value;
  return steps.value.slice(0, branchPointIndex.value + 1);
});

// Add step to specific flow
function addStepToFlow(
  stepType: StepType,
  flow: FlowMembership,
  afterIndex?: number
) {
  const newStep = createDefaultStep(stepType);
  newStep.flowMembership = flow;

  // Calculate position within flow
  const flowSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
  const insertIndex = afterIndex !== undefined
    ? afterIndex + 1
    : flowSteps.length;

  // Add to steps array at correct position
  // ... implementation
}

// Enable branching with default improvement steps
function enableBranching(ratingStepId: string) {
  branchingConfig.value = {
    enabled: true,
    threshold: 4,
    ratingStepId,
  };

  // Mark rating step as shared (branch point)
  const ratingStep = steps.value.find(s => s.id === ratingStepId);
  if (ratingStep) {
    ratingStep.flowMembership = 'shared';
  }

  // Mark all steps after rating as testimonial by default
  const ratingIndex = steps.value.findIndex(s => s.id === ratingStepId);
  steps.value.slice(ratingIndex + 1).forEach(step => {
    step.flowMembership = 'testimonial';
  });

  // Add default improvement flow steps
  addDefaultImprovementSteps();
}

function addDefaultImprovementSteps() {
  const defaultSteps: Partial<FormStep>[] = [
    {
      stepType: 'question',
      flowMembership: 'improvement',
      content: {},
      tips: ['Be honest - your feedback helps us improve'],
      // Will need to create a question for this
    },
    {
      stepType: 'thank_you',
      flowMembership: 'improvement',
      content: {
        title: 'Thank you for your feedback',
        message: 'We take your feedback seriously and will work to improve.',
        showSocialShare: false,
      },
      tips: [],
    },
  ];

  // Add steps to improvement flow
  defaultSteps.forEach(step => {
    // ... create and add step
  });
}

function disableBranching() {
  branchingConfig.value = {
    enabled: false,
    threshold: 4,
    ratingStepId: null,
  };

  // Remove improvement flow steps
  steps.value = steps.value.filter(s => s.flowMembership !== 'improvement');

  // Mark all remaining steps as shared
  steps.value.forEach(step => {
    step.flowMembership = 'shared';
  });
}

// Export new functions and state
return {
  // ... existing exports
  branchingConfig,
  sharedSteps,
  testimonialSteps,
  improvementSteps,
  branchPointIndex,
  stepsBeforeBranch,
  enableBranching,
  disableBranching,
  addStepToFlow,
};
```

### 4.2 Create FlowColumn Component

**File:** `apps/web/src/features/createForm/ui/formEditPage/FlowColumn.vue`

```vue
<script setup lang="ts">
import type { FormStep, FlowMembership } from '@/shared/stepCards/models';
import { FLOW_METADATA } from '@/entities/form';
import TimelineStepCard from './TimelineStepCard.vue';
import TimelineConnector from './TimelineConnector.vue';

const props = defineProps<{
  flow: Exclude<FlowMembership, 'shared'>;
  steps: FormStep[];
  selectedIndex: number | null;
}>();

const emit = defineEmits<{
  selectStep: [stepId: string];
  addStep: [flow: FlowMembership, afterIndex?: number];
}>();

const metadata = computed(() => FLOW_METADATA[props.flow]);
</script>

<template>
  <div
    class="flex-1 rounded-lg border-2 p-4"
    :class="[metadata.borderClass, metadata.bgClass]"
  >
    <!-- Flow Header -->
    <div class="mb-4 flex items-center gap-2">
      <Icon :name="metadata.icon" class="h-5 w-5" :class="metadata.colorClass" />
      <h3 class="font-semibold" :class="metadata.colorClass">
        {{ metadata.label }}
      </h3>
      <span class="text-sm text-gray-500">
        ({{ metadata.description }})
      </span>
    </div>

    <!-- Steps -->
    <div class="space-y-2">
      <template v-for="(step, index) in steps" :key="step.id">
        <TimelineStepCard
          :step="step"
          :index="index"
          :is-selected="step.id === selectedIndex"
          :flow-color="flow"
          @click="emit('selectStep', step.id)"
        />

        <TimelineConnector
          v-if="index < steps.length - 1"
          :flow="flow"
          @insert="emit('addStep', flow, index)"
        />
      </template>
    </div>

    <!-- Add Step Button -->
    <button
      class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-sm transition-colors hover:border-solid"
      :class="[metadata.borderClass, metadata.colorClass]"
      @click="emit('addStep', flow)"
    >
      <Icon name="heroicons:plus" class="h-4 w-4" />
      Add Step
    </button>
  </div>
</template>
```

### 4.3 Create BranchedTimelineCanvas Component

**File:** `apps/web/src/features/createForm/ui/formEditPage/BranchedTimelineCanvas.vue`

```vue
<script setup lang="ts">
import { useTimelineEditor } from '../../composables/timeline/useTimelineEditor';
import TimelineStepCard from './TimelineStepCard.vue';
import TimelineConnector from './TimelineConnector.vue';
import FlowColumn from './FlowColumn.vue';

const {
  steps,
  branchingConfig,
  stepsBeforeBranch,
  testimonialSteps,
  improvementSteps,
  branchPointIndex,
  selectedIndex,
  selectStep,
  addStepToFlow,
} = useTimelineEditor();
</script>

<template>
  <div class="flex flex-col gap-4 p-6">
    <!-- Shared Steps (before branch point) -->
    <div class="space-y-2">
      <template v-for="(step, index) in stepsBeforeBranch" :key="step.id">
        <TimelineStepCard
          :step="step"
          :index="index"
          :is-selected="index === selectedIndex"
          @click="selectStep(index)"
        />

        <!-- Show connector unless it's the branch point -->
        <TimelineConnector
          v-if="index < stepsBeforeBranch.length - 1"
          @insert="addStep('shared', index)"
        />
      </template>
    </div>

    <!-- Branch Point Indicator -->
    <div
      v-if="branchingConfig.enabled && branchPointIndex >= 0"
      class="relative flex items-center justify-center py-4"
    >
      <div class="absolute inset-x-0 top-1/2 h-px bg-gray-300" />
      <div class="relative flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
        <Icon name="heroicons:arrows-pointing-out" class="h-4 w-4" />
        Branches based on rating
        <span class="text-violet-500">(threshold: {{ branchingConfig.threshold }})</span>
      </div>
    </div>

    <!-- Branched Flows (side by side) -->
    <div
      v-if="branchingConfig.enabled"
      class="flex gap-6"
    >
      <!-- Testimonial Flow (Left) -->
      <FlowColumn
        flow="testimonial"
        :steps="testimonialSteps"
        :selected-index="selectedIndex"
        @select-step="selectStep"
        @add-step="addStepToFlow"
      />

      <!-- Improvement Flow (Right) -->
      <FlowColumn
        flow="improvement"
        :steps="improvementSteps"
        :selected-index="selectedIndex"
        @select-step="selectStep"
        @add-step="addStepToFlow"
      />
    </div>
  </div>
</template>
```

### 4.4 Update TimelineCanvas to Support Branching

**File:** `apps/web/src/features/createForm/ui/formEditPage/TimelineCanvas.vue`

```vue
<script setup lang="ts">
import { useTimelineEditor } from '../../composables/timeline/useTimelineEditor';
import BranchedTimelineCanvas from './BranchedTimelineCanvas.vue';
import LinearTimelineCanvas from './LinearTimelineCanvas.vue'; // Rename existing

const { branchingConfig } = useTimelineEditor();
</script>

<template>
  <BranchedTimelineCanvas v-if="branchingConfig.enabled" />
  <LinearTimelineCanvas v-else />
</template>
```

---

## Phase 5: Branching Toggle UI

### 5.1 Add Branching Toggle to Rating Step Editor

**File:** `apps/web/src/features/createForm/ui/stepEditor/editors/RatingStepEditor.vue`

Add a toggle when editing a rating step:

```vue
<template>
  <div class="space-y-6">
    <!-- Existing rating config... -->

    <!-- Branching Toggle -->
    <div class="rounded-lg border border-violet-200 bg-violet-50 p-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-violet-900">Conditional Branching</h4>
          <p class="text-sm text-violet-700">
            Route respondents to different paths based on their rating
          </p>
        </div>
        <Switch
          :model-value="isBranchPoint"
          @update:model-value="toggleBranching"
        />
      </div>

      <!-- Threshold selector (when enabled) -->
      <div v-if="isBranchPoint" class="mt-4 flex items-center gap-4">
        <label class="text-sm font-medium text-violet-800">
          Threshold:
        </label>
        <select
          v-model="threshold"
          class="rounded-md border-violet-300 text-sm"
        >
          <option :value="3">≥3 Testimonial, &lt;3 Improvement</option>
          <option :value="4">≥4 Testimonial, &lt;4 Improvement</option>
          <option :value="5">5 only Testimonial, &lt;5 Improvement</option>
        </select>
      </div>
    </div>
  </div>
</template>
```

---

## Phase 6: Public Form Flow

### 6.1 Update usePublicFormFlow

**File:** `apps/web/src/features/publicForm/composables/usePublicFormFlow.ts`

```typescript
import type { BranchingConfig, FlowMembership } from '@/entities/form';

export function usePublicFormFlow(
  steps: Ref<FormStep[]>,
  branchingConfig: Ref<BranchingConfig>
) {
  const currentStepIndex = ref(0);
  const responses = ref<Record<string, unknown>>({});

  // Track which flow path we're on (determined after rating step)
  const currentFlow = ref<FlowMembership | null>(null);

  // Get steps for current flow
  const flowSteps = computed(() => {
    if (!branchingConfig.value.enabled || !currentFlow.value) {
      // Linear mode or flow not yet determined
      return steps.value.filter(s => s.flowMembership === 'shared');
    }

    // Return shared steps + flow-specific steps
    return steps.value.filter(s =>
      s.flowMembership === 'shared' ||
      s.flowMembership === currentFlow.value
    ).sort((a, b) => a.stepOrder - b.stepOrder);
  });

  const currentStep = computed(() => flowSteps.value[currentStepIndex.value]);

  function goToNext() {
    const current = currentStep.value;

    // Check if this is the branch point (rating step)
    if (
      branchingConfig.value.enabled &&
      current.id === branchingConfig.value.ratingStepId
    ) {
      // Determine flow based on rating response
      const rating = responses.value[current.id] as number;
      const threshold = branchingConfig.value.threshold;

      currentFlow.value = rating >= threshold ? 'testimonial' : 'improvement';
    }

    // Move to next step
    if (currentStepIndex.value < flowSteps.value.length - 1) {
      currentStepIndex.value++;
    }
  }

  function goToPrevious() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;

      // If going back past branch point, reset flow
      const branchPointStep = steps.value.find(
        s => s.id === branchingConfig.value.ratingStepId
      );
      if (branchPointStep && currentStep.value.stepOrder <= branchPointStep.stepOrder) {
        currentFlow.value = null;
      }
    }
  }

  // Progress calculation
  const progress = computed(() => {
    return ((currentStepIndex.value + 1) / flowSteps.value.length) * 100;
  });

  return {
    currentStep,
    currentStepIndex,
    currentFlow,
    flowSteps,
    progress,
    responses,
    goToNext,
    goToPrevious,
    setResponse: (stepId: string, value: unknown) => {
      responses.value[stepId] = value;
    },
  };
}
```

---

## Phase 7: Default Improvement Flow

### 7.1 Default Steps Configuration

**File:** `apps/web/src/features/createForm/constants/defaultImprovementSteps.ts`

```typescript
import type { StepType, StepContent } from '@/shared/stepCards/models';

interface DefaultStepConfig {
  stepType: StepType;
  content: StepContent;
  tips: string[];
  questionConfig?: {
    questionText: string;
    placeholder: string;
    helpText?: string;
    questionTypeId: string;  // 'text_long'
  };
}

export const DEFAULT_IMPROVEMENT_STEPS: DefaultStepConfig[] = [
  {
    stepType: 'question',
    content: {},
    tips: ['Be honest - your feedback helps us improve'],
    questionConfig: {
      questionText: "What aspect of your experience didn't meet expectations?",
      placeholder: 'Please share what went wrong...',
      helpText: 'Your honest feedback helps us improve',
      questionTypeId: 'text_long',
    },
  },
  {
    stepType: 'question',
    content: {},
    tips: ['Specific suggestions are most helpful'],
    questionConfig: {
      questionText: 'What could we do differently to improve?',
      placeholder: 'Share your suggestions...',
      questionTypeId: 'text_long',
    },
  },
  {
    stepType: 'thank_you',
    content: {
      title: 'Thank you for your feedback',
      message: 'We take your feedback seriously and will work to improve. We appreciate you taking the time to help us get better.',
      showSocialShare: false,
    },
    tips: [],
  },
];
```

---

## Implementation Order

### Step 1: Database Schema (Do First)
1. Create migration for `flow_membership` column
2. Create migration for `branching_config` column
3. Update Hasura metadata
4. Apply migrations

### Step 2: TypeScript Types
1. Add `FlowMembership` type
2. Update `FormStep` interface
3. Add `BranchingConfig` type
4. Export from entity models

### Step 3: GraphQL
1. Update queries to include new fields
2. Add mutation for branching config
3. Run codegen

### Step 4: Timeline Editor Core
1. Update `useTimelineEditor` with branching state
2. Add flow-aware step management functions
3. Add enable/disable branching functions

### Step 5: UI Components
1. Create `FlowColumn` component
2. Create `BranchedTimelineCanvas` component
3. Update `TimelineCanvas` to switch modes
4. Add branching toggle to `RatingStepEditor`

### Step 6: Public Form
1. Update `usePublicFormFlow` for conditional navigation
2. Test flow switching based on rating

### Step 7: Polish
1. Add default improvement steps
2. Test end-to-end
3. Handle edge cases

---

## Phase 8: Keyboard Navigation

### 8.1 Update useKeyboardNavigation

**File:** `apps/web/src/features/createForm/composables/timeline/useKeyboardNavigation.ts`

Add branching-aware navigation:

```typescript
// At branch point (rating step), left/right arrows switch between flows
function handleKeyDown(event: KeyboardEvent) {
  const { key, metaKey, ctrlKey } = event;
  const modifier = metaKey || ctrlKey;

  // Existing up/down navigation...

  // NEW: At branch point, left/right switches flow focus
  if (branchingConfig.value.enabled && selectedIndex.value === branchPointIndex.value) {
    if (key === 'ArrowRight') {
      // Focus first step in improvement flow
      focusFlow('improvement');
      event.preventDefault();
    } else if (key === 'ArrowLeft') {
      // Focus first step in testimonial flow
      focusFlow('testimonial');
      event.preventDefault();
    }
  }

  // When in a flow column, left/right can switch to other column
  if (branchingConfig.value.enabled && currentFlowFocus.value) {
    if (key === 'ArrowLeft' && currentFlowFocus.value === 'improvement') {
      switchToFlow('testimonial');
      event.preventDefault();
    } else if (key === 'ArrowRight' && currentFlowFocus.value === 'testimonial') {
      switchToFlow('improvement');
      event.preventDefault();
    }
  }
}

// Track which flow column has focus
const currentFlowFocus = ref<'testimonial' | 'improvement' | null>(null);

function focusFlow(flow: 'testimonial' | 'improvement') {
  currentFlowFocus.value = flow;
  const flowSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
  if (flowSteps.length > 0) {
    selectStep(steps.value.indexOf(flowSteps[0]));
  }
}

function switchToFlow(flow: 'testimonial' | 'improvement') {
  const otherFlowSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
  const currentIndexInFlow = /* calculate */;
  // Try to select same relative position in other flow
  const targetIndex = Math.min(currentIndexInFlow, otherFlowSteps.length - 1);
  selectStep(steps.value.indexOf(otherFlowSteps[targetIndex]));
  currentFlowFocus.value = flow;
}
```

### 8.2 Add Keyboard Hint at Branch Point

**File:** `apps/web/src/features/createForm/ui/formEditPage/BranchedTimelineCanvas.vue`

Add keyboard hints near the branch point:

```vue
<!-- Branch Point Indicator -->
<div
  v-if="branchingConfig.enabled && branchPointIndex >= 0"
  class="relative flex flex-col items-center justify-center py-4"
>
  <div class="absolute inset-x-0 top-1/2 h-px bg-gray-300" />
  <div class="relative flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">
    <Icon name="heroicons:arrows-pointing-out" class="h-4 w-4" />
    Branches based on rating
  </div>

  <!-- Keyboard hints -->
  <div class="mt-2 flex items-center gap-4 text-xs text-gray-500">
    <span class="flex items-center gap-1">
      <kbd class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600">←</kbd>
      Testimonial
    </span>
    <span class="flex items-center gap-1">
      <kbd class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600">→</kbd>
      Improvement
    </span>
  </div>
</div>
```

---

## Testing Checklist

- [ ] Migrations apply cleanly
- [ ] GraphQL queries return `flow_membership` and `branching_config`
- [ ] Enable branching on a rating step works
- [ ] Steps are correctly assigned to flows
- [ ] Side-by-side view renders correctly
- [ ] Can add/edit/remove steps in each flow
- [ ] Public form navigates to correct flow based on rating
- [ ] Progress bar calculates correctly for each flow
- [ ] Disable branching removes improvement steps
- [ ] Default improvement steps are created

---

## Files to Modify

### Database
- `db/hasura/migrations/default/TIMESTAMP_form_steps__add_flow_membership/up.sql`
- `db/hasura/migrations/default/TIMESTAMP_form_steps__add_flow_membership/down.sql`
- `db/hasura/migrations/default/TIMESTAMP_forms__add_branching_config/up.sql`
- `db/hasura/migrations/default/TIMESTAMP_forms__add_branching_config/down.sql`
- `db/hasura/metadata/databases/default/tables/public_form_steps.yaml`
- `db/hasura/metadata/databases/default/tables/public_forms.yaml`

### Types
- `apps/web/src/shared/stepCards/models/stepContent.ts`
- `apps/web/src/entities/form/models/branchingConfig.ts` (new)
- `apps/web/src/entities/form/models/index.ts`

### GraphQL
- `apps/web/src/entities/form/graphql/queries/getForm.gql`
- `apps/web/src/entities/formStep/graphql/queries/getFormSteps.gql`
- `apps/web/src/entities/formStep/graphql/mutations/createFormSteps.gql`
- `apps/web/src/entities/form/graphql/mutations/updateFormBranchingConfig.gql` (new)

### Composables
- `apps/web/src/features/createForm/composables/timeline/useTimelineEditor.ts`
- `apps/web/src/features/publicForm/composables/usePublicFormFlow.ts`

### Components
- `apps/web/src/features/createForm/ui/formEditPage/FlowColumn.vue` (new)
- `apps/web/src/features/createForm/ui/formEditPage/BranchedTimelineCanvas.vue` (new)
- `apps/web/src/features/createForm/ui/formEditPage/TimelineCanvas.vue`
- `apps/web/src/features/createForm/ui/stepEditor/editors/RatingStepEditor.vue`

### Constants
- `apps/web/src/features/createForm/constants/defaultImprovementSteps.ts` (new)
- `apps/web/src/entities/form/models/branchingConfig.ts` (FLOW_METADATA)
