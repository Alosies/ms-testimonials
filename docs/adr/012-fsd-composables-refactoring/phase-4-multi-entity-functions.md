# Phase 4: Extract Multi-Entity Functions

## Overview

**Effort:** Medium
**Risk:** Low
**Dependencies:** Phase 1 (types in entities)

Extract functions that orchestrate multiple entities to the feature layer's `functions/` folder.

---

## Problem Statement

The FSD layer rule states:
- **Entities do NOT import from other entities**
- Functions needing 2+ entity types belong in feature layer

Currently, some functions in entities or composables orchestrate multiple entities, violating this rule.

---

## FSD Function Placement Rule

```
If function needs 1 entity type  → entities/{entity}/functions/
If function needs 2+ entity types → features/{feature}/functions/
```

---

## Tasks

### Task 4.1: Identify Multi-Entity Functions

**Goal:** Find functions that work with multiple entities

**Candidates to Analyze:**

| Function | Location | Entity Dependencies | Target |
|----------|----------|---------------------|--------|
| `buildStepsFromQuestions` | composable | formStep, formQuestion, flow | features/createForm/functions |
| `createQuestionForStep` | composable | formStep, formQuestion | features/createForm/functions |
| `calculateStepOrdering` | composable | formStep, flow | features/createForm/functions |
| `validateBranchingConfig` | composable | formStep, flow, form | features/createForm/functions |

**Commands:**
```bash
# Find functions that import from multiple entities
grep -rn "from '@/entities/" apps/web/src/features/createForm/composables/ | \
  awk -F: '{print $1}' | sort | uniq -c | sort -rn
```

---

### Task 4.2: Create Feature Functions Folder

**Goal:** Set up folder structure

**Create:**
```
apps/web/src/features/createForm/functions/
├── index.ts
├── buildStepsFromQuestions.ts
├── createQuestionForStep.ts
├── calculateStepOrdering.ts
└── validateBranchingConfig.ts
```

---

### Task 4.3: Extract buildStepsFromQuestions

**Goal:** Move step-building logic from `useCreateFormWithSteps` to standalone function

**File:** `apps/web/src/features/createForm/functions/buildStepsFromQuestions.ts`

```typescript
import type { AIQuestion, StepContent, FlowMembership } from '@/shared/api';
import type { FormStep } from '@/entities/formStep';
import type { FormQuestion } from '@/entities/formQuestion';
import { getStepTypeDefaultContent } from '@/entities/formStep';
import { getDefaultWelcomeContent, getDefaultThankYouContent } from '../constants/wizardConfig';

export interface BuildStepsParams {
  formId: string;
  organizationId: string;
  userId: string;
  conceptName: string;
  createdQuestions: readonly FormQuestion[];
  originalQuestions: readonly AIQuestion[];
  stepContent: StepContent | null;
  flowMap: Map<FlowMembership, string>;
}

export interface FormStepInput {
  form_id: string;
  organization_id: string;
  created_by: string;
  step_type: string;
  step_order: number;
  question_id: string | null;
  content: Record<string, unknown>;
  flow_id: string;
  flow_membership: FlowMembership;
  is_active: boolean;
}

/**
 * Build form steps array for insertion with branching support
 *
 * Creates steps with proper flow_id:
 * - Shared: welcome + questions before/including branch point
 * - Testimonial: questions after branch + consent + thank_you
 * - Improvement: questions after branch + thank_you
 *
 * Uses per-flow step_order: UNIQUE(form_id, flow_id, step_order)
 *
 * @example
 * ```ts
 * const stepInputs = buildStepsFromQuestions({
 *   formId: form.id,
 *   organizationId: org.id,
 *   userId: user.id,
 *   conceptName: 'Product Testimonials',
 *   createdQuestions,
 *   originalQuestions,
 *   stepContent: aiContext?.step_content ?? null,
 *   flowMap,
 * });
 *
 * await createFormSteps({ inputs: stepInputs });
 * ```
 */
export function buildStepsFromQuestions(params: BuildStepsParams): FormStepInput[] {
  const {
    formId,
    organizationId,
    userId,
    conceptName,
    createdQuestions,
    originalQuestions,
    stepContent,
    flowMap,
  } = params;

  const steps: FormStepInput[] = [];

  // Per-flow step ordering (each flow starts at 0)
  const flowStepOrder: Record<FlowMembership, number> = {
    shared: 0,
    testimonial: 0,
    improvement: 0,
  };

  // Helper to create a step with per-flow ordering
  const createStep = (
    stepType: string,
    flowMembership: FlowMembership,
    content: Record<string, unknown>,
    questionId: string | null = null
  ): FormStepInput => {
    const flowId = flowMap.get(flowMembership);
    if (!flowId) {
      throw new Error(`Flow not found for membership: ${flowMembership}`);
    }
    return {
      form_id: formId,
      organization_id: organizationId,
      created_by: userId,
      step_type: stepType,
      step_order: flowStepOrder[flowMembership]++,
      question_id: questionId,
      content,
      flow_id: flowId,
      flow_membership: flowMembership,
      is_active: true,
    };
  };

  // 1. Welcome step (shared)
  const welcomeContent = getDefaultWelcomeContent(conceptName);
  steps.push(createStep('welcome', 'shared', welcomeContent));

  // 2a. Shared questions (including branch point)
  for (let i = 0; i < createdQuestions.length; i++) {
    const originalQuestion = originalQuestions[i];
    if (originalQuestion.flow_membership !== 'shared') continue;

    const createdQuestion = createdQuestions[i];
    const isRating = originalQuestion.question_type_id.startsWith('rating');
    const stepType = isRating ? 'rating' : 'question';

    steps.push(createStep(stepType, 'shared', {}, createdQuestion.id));
  }

  // 3a. Testimonial questions
  for (let i = 0; i < createdQuestions.length; i++) {
    const originalQuestion = originalQuestions[i];
    if (originalQuestion.flow_membership !== 'testimonial') continue;

    const createdQuestion = createdQuestions[i];
    steps.push(createStep('question', 'testimonial', {}, createdQuestion.id));
  }

  // 3b. Consent step (testimonial flow only)
  const consentContent = buildConsentContent(stepContent);
  steps.push(createStep('consent', 'testimonial', consentContent));

  // 3c. Thank you step (testimonial flow)
  const testimonialThankYouContent = getDefaultThankYouContent();
  steps.push(createStep('thank_you', 'testimonial', testimonialThankYouContent));

  // 4a. Improvement questions
  for (let i = 0; i < createdQuestions.length; i++) {
    const originalQuestion = originalQuestions[i];
    if (originalQuestion.flow_membership !== 'improvement') continue;

    const createdQuestion = createdQuestions[i];
    steps.push(createStep('question', 'improvement', {}, createdQuestion.id));
  }

  // 4b. Thank you step (improvement flow)
  const improvementThankYouContent = buildImprovementThankYouContent(stepContent);
  steps.push(createStep('thank_you', 'improvement', improvementThankYouContent));

  return steps;
}

function buildConsentContent(stepContent: StepContent | null): Record<string, unknown> {
  if (stepContent?.consent) {
    return {
      title: stepContent.consent.title,
      description: stepContent.consent.description,
      options: {
        public: {
          label: stepContent.consent.public_label,
          description: stepContent.consent.public_description,
        },
        private: {
          label: stepContent.consent.private_label,
          description: stepContent.consent.private_description,
        },
      },
    };
  }

  return {
    title: 'One last thing...',
    description: 'Would you like us to share your testimonial publicly?',
    options: {
      public: {
        label: 'Yes, share publicly',
        description: 'Your testimonial may be featured on our website',
      },
      private: {
        label: 'Keep it private',
        description: 'Only the team will see your feedback',
      },
    },
  };
}

function buildImprovementThankYouContent(stepContent: StepContent | null): Record<string, unknown> {
  if (stepContent?.improvement_thank_you) {
    return {
      title: stepContent.improvement_thank_you.title,
      subtitle: stepContent.improvement_thank_you.message,
    };
  }

  return {
    title: 'Thank you for your feedback',
    subtitle: 'We take your feedback seriously and will work to improve.',
  };
}
```

---

### Task 4.4: Extract calculateStepOrdering

**Goal:** Extract step reordering logic

**File:** `apps/web/src/features/createForm/functions/calculateStepOrdering.ts`

```typescript
import type { FormStep } from '@/entities/formStep';
import type { FlowMembership } from '@/entities/flow';

export interface ReorderResult {
  /** Steps with updated step_order values */
  reorderedSteps: FormStep[];
  /** IDs of steps that need to be updated in database */
  changedStepIds: string[];
}

/**
 * Calculate new step ordering after a drag-and-drop reorder
 *
 * Handles per-flow ordering constraint: UNIQUE(form_id, flow_id, step_order)
 *
 * @param steps - All steps in the timeline
 * @param fromIndex - Original position of moved step
 * @param toIndex - New position for moved step
 * @returns Steps with updated ordering and list of changed IDs
 */
export function calculateStepOrdering(
  steps: FormStep[],
  fromIndex: number,
  toIndex: number
): ReorderResult {
  if (fromIndex === toIndex) {
    return { reorderedSteps: steps, changedStepIds: [] };
  }

  const movedStep = steps[fromIndex];
  const targetFlow = movedStep.flow_membership;

  // Get steps in same flow
  const flowSteps = steps.filter(s => s.flow_membership === targetFlow);
  const otherSteps = steps.filter(s => s.flow_membership !== targetFlow);

  // Find positions within flow
  const fromFlowIndex = flowSteps.findIndex(s => s.id === movedStep.id);
  const toFlowIndex = Math.min(
    Math.max(0, toIndex - steps.filter((s, i) => i < toIndex && s.flow_membership !== targetFlow).length),
    flowSteps.length - 1
  );

  // Reorder within flow
  const reorderedFlowSteps = [...flowSteps];
  reorderedFlowSteps.splice(fromFlowIndex, 1);
  reorderedFlowSteps.splice(toFlowIndex, 0, movedStep);

  // Assign new step_order values
  const changedStepIds: string[] = [];
  const updatedFlowSteps = reorderedFlowSteps.map((step, index) => {
    if (step.step_order !== index) {
      changedStepIds.push(step.id);
      return { ...step, step_order: index };
    }
    return step;
  });

  // Merge back with other flows
  const reorderedSteps = [...otherSteps, ...updatedFlowSteps]
    .sort((a, b) => {
      // Sort by flow first, then step_order
      const flowOrder = { shared: 0, testimonial: 1, improvement: 2 };
      const flowDiff = flowOrder[a.flow_membership] - flowOrder[b.flow_membership];
      if (flowDiff !== 0) return flowDiff;
      return a.step_order - b.step_order;
    });

  return { reorderedSteps, changedStepIds };
}
```

---

### Task 4.5: Extract validateBranchingConfig

**Goal:** Extract branching validation logic

**File:** `apps/web/src/features/createForm/functions/validateBranchingConfig.ts`

```typescript
import type { FormStep } from '@/entities/formStep';
import type { BranchingConfig } from '@/entities/form';

export interface BranchingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate branching configuration against current steps
 *
 * Checks:
 * - Rating step exists if branching enabled
 * - Rating step is in shared flow
 * - Threshold is within valid range (1-10)
 * - Branch flows have required steps
 */
export function validateBranchingConfig(
  config: BranchingConfig,
  steps: FormStep[]
): BranchingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.enabled) {
    return { isValid: true, errors, warnings };
  }

  // Check rating step exists
  const ratingStep = steps.find(s => s.id === config.ratingStepId);
  if (!ratingStep) {
    errors.push('Rating step not found');
    return { isValid: false, errors, warnings };
  }

  // Check rating step is in shared flow
  if (ratingStep.flow_membership !== 'shared') {
    errors.push('Rating step must be in shared flow');
  }

  // Check threshold range
  if (config.threshold < 1 || config.threshold > 10) {
    errors.push('Threshold must be between 1 and 10');
  }

  // Check branch flows have content
  const testimonialSteps = steps.filter(s => s.flow_membership === 'testimonial');
  const improvementSteps = steps.filter(s => s.flow_membership === 'improvement');

  if (testimonialSteps.length === 0) {
    warnings.push('Testimonial branch has no steps');
  }

  if (improvementSteps.length === 0) {
    warnings.push('Improvement branch has no steps');
  }

  // Check for thank_you steps in each branch
  if (!testimonialSteps.some(s => s.step_type === 'thank_you')) {
    warnings.push('Testimonial branch missing thank you step');
  }

  if (!improvementSteps.some(s => s.step_type === 'thank_you')) {
    warnings.push('Improvement branch missing thank you step');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

### Task 4.6: Create Functions Index

**Goal:** Export all functions

**File:** `apps/web/src/features/createForm/functions/index.ts`

```typescript
export { buildStepsFromQuestions } from './buildStepsFromQuestions';
export type { BuildStepsParams, FormStepInput } from './buildStepsFromQuestions';

export { calculateStepOrdering } from './calculateStepOrdering';
export type { ReorderResult } from './calculateStepOrdering';

export { validateBranchingConfig } from './validateBranchingConfig';
export type { BranchingValidationResult } from './validateBranchingConfig';
```

---

### Task 4.7: Update Composables to Use Functions

**Goal:** Replace inline logic with extracted functions

**File:** `useCreateFormWithSteps.ts`

**Before:**
```typescript
// 6. Create form_steps with branching support
const stepInputs = buildFormSteps(
  form.id,
  currentOrganizationId.value!,
  // ... inline function defined in same file
);
```

**After:**
```typescript
import { buildStepsFromQuestions } from '../../functions';

// 6. Create form_steps with branching support
const stepInputs = buildStepsFromQuestions({
  formId: form.id,
  organizationId: currentOrganizationId.value!,
  userId: currentUserId.value!,
  conceptName: params.conceptName,
  createdQuestions,
  originalQuestions: params.questions,
  stepContent: params.aiContext?.step_content ?? null,
  flowMap,
});
```

---

### Task 4.8: Run Verification

**Commands:**
```bash
# Verify no entity-to-entity imports
grep -r "from '@/entities/" apps/web/src/entities/ | grep -v "from '@/entities/[^/]*/\|index.ts"

# Type check
pnpm typecheck

# Build
pnpm build
```

---

## Acceptance Criteria

- [ ] `features/createForm/functions/` folder created
- [ ] `buildStepsFromQuestions` extracted to functions folder
- [ ] `calculateStepOrdering` extracted to functions folder
- [ ] `validateBranchingConfig` extracted to functions folder
- [ ] Functions have comprehensive JSDoc comments
- [ ] At least one composable updated to use extracted function
- [ ] No entity-to-entity imports exist
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes

---

## Next Phase

After completion, proceed to: **Phase 5: Split useTimelineEditor**
