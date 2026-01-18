# ADR-017: Implementation Guide

## Doc Connections
**ID**: `adr-017-implementation`

2026-01-18-1600 IST

**Parent**:
- `adr-017-question-type-change-workflow` - Main ADR document

---

## Implementation Status

| Phase | Description | Status | Skills |
|-------|-------------|--------|--------|
| Phase 0 | E2E Tests (TDD) | 🟡 Partial | `/e2e-tests-creator`, `/e2e-test-ids` |
| Phase 1 | GraphQL Operations | ⬜ Not Started | `/graphql-code`, `tm-graph` MCP |
| Phase 2 | Pure Functions | ⬜ Not Started | - |
| Phase 3 | Composable | ⬜ Not Started | - |
| Phase 4 | UI Components | ⬜ Not Started | `/e2e-test-ids` |
| Phase 5 | Integration | ⬜ Not Started | `/e2e-tests-runner` |

**Legend**: ✅ Complete | 🟡 Partial | ⬜ Not Started

---

## Critical Implementation Rules

### 1. GraphQL Validation with tm-graph MCP

**ALL GraphQL operations MUST be validated against the tm-graph MCP before creating `.gql` files.**

```bash
# Before creating any GraphQL operation:
# 1. Use tm-graph MCP to verify table/field exists
# 2. Check field types and relationships
# 3. Verify aggregate functions are available
```

| Operation | tm-graph Validation Command |
|-----------|---------------------------|
| Response count query | `get-type-info` → `form_question_responses_aggregate` |
| Delete responses mutation | `list-mutations` → find `delete_form_question_responses` |
| Delete question mutation | `list-mutations` → find `delete_form_questions_by_pk` |

### 2. Confirmation Modals for All Deletes

**ALL delete operations MUST have a confirmation modal before execution.**

| Delete Operation | Confirmation Component | Test ID |
|-----------------|----------------------|---------|
| Delete question responses | `DeleteResponsesConfirmation.vue` | `deleteResponsesConfirmDialog` |
| Delete question (on type change) | `QuestionTypeChangeWarning.vue` | `questionTypeChangeWarningDialog` |

### 3. API Requirements for Testing

**Backend endpoint needed for test fixtures:**

| Endpoint | Purpose | Priority |
|----------|---------|----------|
| `POST /api/test/responses` | Create mock responses for a question | Required for E2E tests |

```typescript
// Required endpoint for formWithResponsesViaApi fixture
POST /api/test/responses
Body: {
  questionId: string;
  count: number;        // Number of mock responses to create
  organizationId: string;
}
Response: { created: number }
```

**Note**: This endpoint should only be available in test/development environments.

---

## Phase 0: E2E Tests (TDD)

### Status: 🟡 Partial

Tests are written but will fail until the feature is implemented.

### Skills Used

| Skill | Purpose |
|-------|---------|
| `/e2e-tests-creator` | Create test spec following project patterns |
| `/e2e-test-ids` | Add test IDs to `studio.ts` constants |

### Test File

```
apps/web/tests/e2e/features/form-studio/focused-tests/question-type-change.spec.ts
```

### Test Cases

| # | Test Name | Status | Notes |
|---|-----------|--------|-------|
| 1 | `can change question type when no responses exist` | 🔴 Failing | Happy path |
| 2 | `shows warning when changing from choice type with options` | 🔴 Failing | Needs `choiceQuestionFormViaApi` fixture |
| 3 | `blocks type change when responses exist` | 🔴 Failing | Needs `formWithResponsesViaApi` fixture |
| 4 | `can delete responses to enable type change` | 🔴 Failing | Needs `formWithResponsesViaApi` fixture |
| 5 | `preserves common fields after type change` | 🔴 Failing | Data transfer validation |
| 6 | `can cancel type change from warning dialog` | 🔴 Failing | Needs `choiceQuestionFormViaApi` fixture |

### Action Helpers Created

```
apps/web/tests/e2e/features/form-studio/actions/questionTypeChange.actions.ts
```

**Functions available:**
- `expectTypeDropdownDisabled()` / `expectTypeDropdownEnabled()`
- `selectTypeWithWarning(typeKey)`
- `expectWarningDialogVisible()` / `expectWarningDialogHidden()`
- `expectWarningMessage(text)`
- `confirmTypeChange()` / `cancelTypeChange()`
- `expectResponsesBlockMessage(count)`
- `expectDeleteResponsesButtonVisible()`
- `clickDeleteResponses()`
- `expectDeleteResponsesDialogVisible()`
- `confirmDeleteResponses()` / `cancelDeleteResponses()`
- `getOptionCount()`
- `expectOptionsHidden()` / `expectOptionsVisible()`

### Test IDs Added

```typescript
// In: apps/web/src/shared/constants/testIds/studio.ts

// Question type change workflow (ADR-017)
questionTypeDropdown: 'question-editor-type-dropdown',
questionOptionsSection: 'question-editor-options-section',
questionOptionItem: 'question-editor-option-item',

// Warning dialog
questionTypeChangeWarningDialog: 'question-type-change-warning-dialog',
questionTypeChangeConfirmButton: 'question-type-change-confirm-button',
questionTypeChangeCancelButton: 'question-type-change-cancel-button',

// Responses block
questionTypeResponsesBlockMessage: 'question-type-responses-block-message',
deleteQuestionResponsesButton: 'delete-question-responses-button',

// Delete responses dialog
deleteResponsesConfirmDialog: 'delete-responses-confirm-dialog',
deleteResponsesConfirmButton: 'delete-responses-confirm-button',
deleteResponsesCancelButton: 'delete-responses-cancel-button',
```

### Fixtures Needed

| Fixture | File | Status | Dependencies |
|---------|------|--------|-------------|
| `choiceQuestionFormViaApi` | `entities/form/fixtures/choiceQuestionForm.fixture.ts` | ⬜ Not Created | None |
| `formWithResponsesViaApi` | `entities/form/fixtures/formWithResponses.fixture.ts` | ⬜ Not Created | **API endpoint** |

#### API Endpoint Required for `formWithResponsesViaApi`

The `formWithResponsesViaApi` fixture requires a backend endpoint to create mock responses:

```typescript
// api/routes/test.routes.ts (development only)
app.post('/api/test/responses', async (c) => {
  const { questionId, count, organizationId } = await c.req.json();

  // Create mock responses
  const responses = Array.from({ length: count }, (_, i) => ({
    id: nanoid(),
    question_id: questionId,
    organization_id: organizationId,
    response_value: `Mock response ${i + 1}`,
    created_at: new Date().toISOString(),
  }));

  await db.insert(form_question_responses).values(responses);
  return c.json({ created: count });
});
```

**Security**: This endpoint should be:
- Only available in development/test environments
- Protected by environment check
- Not deployed to production

### Running Tests

```bash
# Run all question type change tests (will fail until feature implemented)
cd apps/web
pnpm test:e2e --grep "Question Type Change"

# Run in UI mode for debugging
pnpm test:e2e:ui --grep "Question Type Change"
```

---

## Phase 1: GraphQL Operations

### Status: ⬜ Not Started

### Skills Used

| Skill | Purpose |
|-------|---------|
| `/graphql-code` | Create .gql files and composables |
| `tm-graph` MCP | Validate schema before codegen |

### tm-graph MCP Validation Steps

Before creating any GraphQL operation, run these validations:

```bash
# 1. Verify form_question_responses_aggregate exists
mcp__tm-graph__get-type-info: { type_name: "form_question_responses_aggregate" }

# 2. Check available mutations
mcp__tm-graph__list-mutations
# Look for: delete_form_question_responses, delete_form_questions_by_pk

# 3. Verify aggregate count field structure
mcp__tm-graph__get-type-info: { type_name: "form_question_responses_aggregate_fields" }
```

### Files to Create/Modify

#### 1.1 Response Count Query

**File**: `apps/web/src/entities/formQuestion/graphql/queries/GetQuestionResponseCount.gql`

```graphql
query GetQuestionResponseCount($questionId: String!) {
  form_question_responses_aggregate(
    where: { question_id: { _eq: $questionId } }
  ) {
    aggregate {
      count
    }
  }
}
```

#### 1.2 Delete Responses Mutation

**File**: `apps/web/src/entities/formQuestion/graphql/mutations/DeleteQuestionResponses.gql`

```graphql
mutation DeleteQuestionResponses($questionId: String!) {
  delete_form_question_responses(
    where: { question_id: { _eq: $questionId } }
  ) {
    affected_rows
  }
}
```

#### 1.3 Query Composable

**File**: `apps/web/src/entities/formQuestion/composables/queries/useGetQuestionResponseCount.ts`

```typescript
import { useQuery } from '@vue/apollo-composable';
import { GetQuestionResponseCountDocument } from '@/shared/graphql/generated/operations';

export function useGetQuestionResponseCount(questionId: Ref<string>) {
  const { result, loading, error } = useQuery(
    GetQuestionResponseCountDocument,
    () => ({ questionId: questionId.value }),
    { fetchPolicy: 'network-only' }
  );

  const count = computed(() =>
    result.value?.form_question_responses_aggregate?.aggregate?.count ?? 0
  );

  return { count, loading, error };
}
```

#### 1.4 Mutation Composable

**File**: `apps/web/src/entities/formQuestion/composables/mutations/useDeleteQuestionResponses.ts`

```typescript
import { useMutation } from '@vue/apollo-composable';
import { DeleteQuestionResponsesDocument } from '@/shared/graphql/generated/operations';

export function useDeleteQuestionResponses() {
  const { mutate, loading, error } = useMutation(DeleteQuestionResponsesDocument);

  const deleteResponses = async (questionId: string) => {
    const result = await mutate({ questionId });
    return result?.data?.delete_form_question_responses?.affected_rows ?? 0;
  };

  return { deleteResponses, loading, error };
}
```

### Checklist

- [ ] **Validate with tm-graph MCP** before writing queries/mutations
  - [ ] Verify `form_question_responses_aggregate` type exists
  - [ ] Verify `delete_form_question_responses` mutation exists
  - [ ] Check field types match expected usage
- [ ] Create `GetQuestionResponseCount.gql`
- [ ] Create `DeleteQuestionResponses.gql`
- [ ] Run `pnpm codegen:web` to generate TypeScript types
- [ ] Create `useGetQuestionResponseCount.ts`
- [ ] Create `useDeleteQuestionResponses.ts`
- [ ] Export from `entities/formQuestion/index.ts`

---

## Phase 2: Pure Functions

### Status: ⬜ Not Started

### Files to Create

#### 2.1 Analyze Type Change

**File**: `apps/web/src/features/createForm/functions/analyzeQuestionTypeChange.ts`

```typescript
export interface TypeChangeAnalysis {
  willLoseOptions: boolean;
  optionCount: number;
  willLoseTextValidation: boolean;
  willLoseRatingConfig: boolean;
  requiresWarning: boolean;
}

export function analyzeQuestionTypeChange(
  currentType: string,
  newType: string,
  currentQuestion: { options?: unknown[] }
): TypeChangeAnalysis {
  const isCurrentChoice = isChoiceType(currentType);
  const isNewChoice = isChoiceType(newType);

  const willLoseOptions = isCurrentChoice && !isNewChoice;
  const optionCount = currentQuestion.options?.length ?? 0;

  return {
    willLoseOptions,
    optionCount: willLoseOptions ? optionCount : 0,
    willLoseTextValidation: isTextType(currentType) && !isTextType(newType),
    willLoseRatingConfig: isRatingType(currentType) && !isRatingType(newType),
    requiresWarning: willLoseOptions && optionCount > 0,
  };
}

function isChoiceType(type: string): boolean {
  return ['choice_single', 'choice_multiple', 'choice_dropdown'].includes(type);
}

function isTextType(type: string): boolean {
  return ['text_short', 'text_long', 'text_email', 'text_url'].includes(type);
}

function isRatingType(type: string): boolean {
  return ['rating_star', 'rating_scale'].includes(type);
}
```

#### 2.2 Get Transferable Fields

**File**: `apps/web/src/features/createForm/functions/getTransferableQuestionFields.ts`

```typescript
import type { QuestionType } from '@/entities/questionType';

export function getTransferableQuestionFields(
  oldQuestion: FormQuestion,
  newTypeId: string,
  questionTypes: QuestionType[]
): Partial<FormQuestionInsertInput> {
  const newType = questionTypes.find(t => t.id === newTypeId);
  if (!newType) throw new Error(`Unknown question type: ${newTypeId}`);

  const transferred: Partial<FormQuestionInsertInput> = {
    // Always transfer
    step_id: oldQuestion.stepId,
    display_order: oldQuestion.displayOrder,
    question_text: oldQuestion.questionText,
    question_key: oldQuestion.questionKey,
    is_required: oldQuestion.isRequired,
    help_text: oldQuestion.helpText,
    organization_id: oldQuestion.organizationId,
    question_type_id: newTypeId,
  };

  // Conditionally transfer based on new type's capabilities
  if (newType.supportsMaxLength) {
    transferred.placeholder = oldQuestion.placeholder;
    transferred.max_length = oldQuestion.maxLength;
  }

  if (newType.supportsMinLength) {
    transferred.min_length = oldQuestion.minLength;
  }

  if (newType.supportsPattern) {
    transferred.validation_pattern = oldQuestion.validationPattern;
  }

  if (newType.supportsMinValue) {
    transferred.min_value = oldQuestion.minValue ?? newType.defaultMinValue;
  }

  if (newType.supportsMaxValue) {
    transferred.max_value = oldQuestion.maxValue ?? newType.defaultMaxValue;
  }

  if (newType.uniqueName === 'rating_scale') {
    transferred.scale_min_label = oldQuestion.scaleMinLabel;
    transferred.scale_max_label = oldQuestion.scaleMaxLabel;
  }

  return transferred;
}
```

### Checklist

- [ ] Create `analyzeQuestionTypeChange.ts`
- [ ] Create `getTransferableQuestionFields.ts`
- [ ] Export from `features/createForm/functions/index.ts`
- [ ] Add unit tests (optional but recommended)

---

## Phase 3: Composable

### Status: ⬜ Not Started

### File to Create

**File**: `apps/web/src/features/createForm/composables/immediateSave/useQuestionTypeChange.ts`

```typescript
import { useDeleteFormQuestion, useCreateFormQuestion } from '@/entities/formQuestion';
import { useUpdateFormStep } from '@/entities/formStep';
import { useDeleteQuestionResponses, useGetQuestionResponseCount } from '@/entities/formQuestion';
import { useSaveLock, useSaveIndicator } from '../autoSave';
import { getTransferableQuestionFields } from '../../functions';

export function useQuestionTypeChange() {
  const { deleteFormQuestion } = useDeleteFormQuestion();
  const { createFormQuestion } = useCreateFormQuestion();
  const { updateFormStep } = useUpdateFormStep();
  const { deleteResponses } = useDeleteQuestionResponses();
  const { withLock } = useSaveLock();
  const { withSaveIndicator } = useSaveIndicator();

  /**
   * Replace a question with a new one of a different type.
   * Transfers compatible fields, deletes old question (CASCADE handles options).
   */
  const replaceQuestionWithNewType = async (params: {
    oldQuestion: FormQuestion;
    newTypeId: string;
    stepId: string;
    questionTypes: QuestionType[];
  }) => {
    const { oldQuestion, newTypeId, stepId, questionTypes } = params;

    return withSaveIndicator(() =>
      withLock('question-type-change', async () => {
        // 1. Calculate transferred fields
        const transferredFields = getTransferableQuestionFields(
          oldQuestion,
          newTypeId,
          questionTypes
        );

        // 2. Create new question with new type
        const newQuestion = await createFormQuestion(transferredFields);

        // 3. Update step to reference new question
        await updateFormStep({
          id: stepId,
          changes: { question_id: newQuestion.id },
        });

        // 4. Delete old question (CASCADE handles options)
        await deleteFormQuestion({ id: oldQuestion.id });

        return newQuestion;
      })
    );
  };

  /**
   * Delete all responses for a question.
   * Call this before changing type when responses exist.
   */
  const deleteQuestionResponses = async (questionId: string) => {
    return withSaveIndicator(() =>
      withLock('delete-responses', async () => {
        return await deleteResponses(questionId);
      })
    );
  };

  return {
    replaceQuestionWithNewType,
    deleteQuestionResponses,
  };
}
```

### Checklist

- [ ] Create `useQuestionTypeChange.ts`
- [ ] Export from `features/createForm/composables/index.ts`
- [ ] Integrate with `useSaveLock` for save coordination

---

## Phase 4: UI Components

### Status: ⬜ Not Started

### Skills Used

| Skill | Purpose |
|-------|---------|
| `/e2e-test-ids` | Verify all new components have test IDs |

### Confirmation Modal Requirements

**CRITICAL**: All delete operations require user confirmation via modal dialogs.

| Action | Modal | Confirm Button Text | Cancel Action |
|--------|-------|---------------------|---------------|
| Change type (losing options) | `QuestionTypeChangeWarning.vue` | "Change Type" | Revert to original type |
| Delete responses | `DeleteResponsesConfirmation.vue` | "Delete Responses" | Keep responses, dropdown stays disabled |

### Files to Create/Modify

#### 4.1 Warning Dialog Component (Confirmation Modal)

**File**: `apps/web/src/features/createForm/ui/dialogs/QuestionTypeChangeWarning.vue`

```vue
<script setup lang="ts">
import { AlertDialog, AlertDialogContent, AlertDialogHeader,
         AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
         AlertDialogCancel, AlertDialogAction } from '@testimonials/ui';
import { studioTestIds } from '@/shared/constants/testIds';

interface Props {
  open: boolean;
  optionCount: number;
  newTypeName: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <AlertDialog :open="open">
    <AlertDialogContent :data-testid="studioTestIds.questionTypeChangeWarningDialog">
      <AlertDialogHeader>
        <AlertDialogTitle>Change Question Type</AlertDialogTitle>
        <AlertDialogDescription>
          Changing to "{{ newTypeName }}" will delete:
          <ul class="mt-2 list-disc pl-5">
            <li>{{ optionCount }} answer option{{ optionCount > 1 ? 's' : '' }}</li>
          </ul>
          <p class="mt-2">Question text and settings will be preserved.</p>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :data-testid="studioTestIds.questionTypeChangeCancelButton"
          @click="emit('cancel')"
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          :data-testid="studioTestIds.questionTypeChangeConfirmButton"
          @click="emit('confirm')"
        >
          Change Type
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

#### 4.2 Delete Responses Dialog Component (Confirmation Modal)

**File**: `apps/web/src/features/createForm/ui/dialogs/DeleteResponsesConfirmation.vue`

**CRITICAL**: This modal MUST appear before any response deletion occurs.

```vue
<script setup lang="ts">
import { AlertDialog, AlertDialogContent, AlertDialogHeader,
         AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
         AlertDialogCancel, AlertDialogAction } from '@testimonials/ui';
import { studioTestIds } from '@/shared/constants/testIds';

interface Props {
  open: boolean;
  responseCount: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <AlertDialog :open="open">
    <AlertDialogContent :data-testid="studioTestIds.deleteResponsesConfirmDialog">
      <AlertDialogHeader>
        <AlertDialogTitle class="text-destructive">
          Delete Question Responses?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete {{ responseCount }} response{{ responseCount > 1 ? 's' : '' }}
          collected for this question. This action cannot be undone.
          <p class="mt-2">After deletion, you can change the question type.</p>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          :data-testid="studioTestIds.deleteResponsesCancelButton"
          @click="emit('cancel')"
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          :data-testid="studioTestIds.deleteResponsesConfirmButton"
          variant="destructive"
          @click="emit('confirm')"
        >
          Delete Responses
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
```

#### 4.3 Update QuestionStepEditor

**File**: `apps/web/src/features/createForm/ui/stepEditor/editors/QuestionStepEditor.vue`

**Changes needed:**
1. Add `responseCount` prop or fetch it
2. Add computed `hasResponses`
3. Disable type dropdown when `hasResponses`
4. Show block message with "Delete responses" button
5. Integrate warning dialog for options loss
6. Call `replaceQuestionWithNewType` instead of `setQuestionType`

### Checklist

- [ ] Create `QuestionTypeChangeWarning.vue`
- [ ] Create `DeleteResponsesConfirmation.vue`
- [ ] Update `QuestionStepEditor.vue`:
  - [ ] Add response count fetching/prop
  - [ ] Add disabled state for dropdown
  - [ ] Add block message UI
  - [ ] Add "Delete responses" button
  - [ ] Integrate warning dialog
  - [ ] Update `handleQuestionTypeChange` to use new composable
- [ ] Add `data-testid` attributes to all new elements

---

## Phase 5: Integration & Testing

### Status: ⬜ Not Started

### Skills Used

| Skill | Purpose |
|-------|---------|
| `/e2e-tests-runner` | Run Playwright tests with correct configuration |
| `/code-review` | Review implementation before merge |

### Prerequisites

1. **API endpoint for mock responses** must be implemented first
2. All fixtures must be created
3. All phases 1-4 must be complete

### Checklist

- [ ] **API**: Implement `POST /api/test/responses` endpoint
- [ ] Create `choiceQuestionFormViaApi` fixture
- [ ] Create `formWithResponsesViaApi` fixture (depends on API endpoint)
- [ ] Run all E2E tests and verify they pass
  ```bash
  pnpm test:e2e --grep "Question Type Change"
  ```
- [ ] Manual testing of all scenarios
- [ ] Code review using `/code-review` skill

---

## File Summary

### New Files to Create

| File | Phase | Purpose |
|------|-------|---------|
| `entities/formQuestion/graphql/queries/GetQuestionResponseCount.gql` | 1 | Query |
| `entities/formQuestion/graphql/mutations/DeleteQuestionResponses.gql` | 1 | Mutation |
| `entities/formQuestion/composables/queries/useGetQuestionResponseCount.ts` | 1 | Query composable |
| `entities/formQuestion/composables/mutations/useDeleteQuestionResponses.ts` | 1 | Mutation composable |
| `features/createForm/functions/analyzeQuestionTypeChange.ts` | 2 | Pure function |
| `features/createForm/functions/getTransferableQuestionFields.ts` | 2 | Pure function |
| `features/createForm/composables/immediateSave/useQuestionTypeChange.ts` | 3 | Feature composable |
| `features/createForm/ui/dialogs/QuestionTypeChangeWarning.vue` | 4 | UI component |
| `features/createForm/ui/dialogs/DeleteResponsesConfirmation.vue` | 4 | UI component |
| `tests/e2e/entities/form/fixtures/choiceQuestionForm.fixture.ts` | 5 | Test fixture |
| `tests/e2e/entities/form/fixtures/formWithResponses.fixture.ts` | 5 | Test fixture |

### Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `entities/formQuestion/index.ts` | 1 | Export new composables |
| `features/createForm/functions/index.ts` | 2 | Export new functions |
| `features/createForm/composables/index.ts` | 3 | Export new composable |
| `features/createForm/ui/stepEditor/editors/QuestionStepEditor.vue` | 4 | Major update |

### Already Created (Phase 0)

| File | Status |
|------|--------|
| `tests/e2e/features/form-studio/focused-tests/question-type-change.spec.ts` | ✅ Created |
| `tests/e2e/features/form-studio/actions/questionTypeChange.actions.ts` | ✅ Created |
| `tests/e2e/features/form-studio/actions/index.ts` | ✅ Updated |
| `tests/e2e/features/form-studio/actions/autosave.actions.ts` | ✅ Updated |
| `src/shared/constants/testIds/studio.ts` | ✅ Updated |
| `docs/adr/017-question-type-change-workflow/adr.md` | ✅ Updated |

---

## Dependencies

```
Phase 0 (Tests)     ──────────────────────────────────────────►
                                                               │
Phase 1 (GraphQL)   ─────────►                                 │
                              │                                │
Phase 2 (Functions) ─────────►├───► Phase 3 (Composable) ────►├──► Phase 5 (Integration)
                              │                                │
Phase 4 (UI)        ──────────┘────────────────────────────────┘
```

- Phase 1 & 2 can be done in parallel
- Phase 3 depends on Phase 1 & 2
- Phase 4 can start after Phase 1 (for basic UI) but needs Phase 3 for full integration
- Phase 5 requires all other phases

---

## Notes

### TDD Workflow

1. **RED**: Tests are written and failing (current state)
2. **GREEN**: Implement minimum code to make tests pass
3. **REFACTOR**: Clean up code while keeping tests green

### Key Design Decisions

1. **Delete + Recreate**: Instead of complex field cleanup, we delete the old question and create a new one. Database cascades handle `question_options` cleanup.

2. **Response Protection**: If a question has responses, the type dropdown is disabled. Users must explicitly delete responses first.

3. **Warning Dialog**: Only shown when changing FROM a choice type that has options. Other type changes proceed without warning.

4. **Common Field Transfer**: Question text, is_required, help_text, and other common fields are preserved across type changes.

### Critical Rules

1. **GraphQL Validation**: ALL GraphQL operations MUST be validated with `tm-graph` MCP before creating `.gql` files.

2. **Confirmation Modals**: ALL delete operations MUST show a confirmation modal. No silent deletes.

3. **Skills Usage**: Use appropriate skills for each phase:
   - `/graphql-code` for GraphQL operations
   - `/e2e-test-ids` for adding test IDs
   - `/e2e-tests-creator` for new tests
   - `/e2e-tests-runner` for running tests
   - `/code-review` before merging

4. **API Dependencies**: The `formWithResponsesViaApi` fixture requires an API endpoint to create mock responses.

---

## Skills Reference

| Skill | When to Use |
|-------|-------------|
| `/graphql-code` | Creating .gql files, composables, validating with tm-graph |
| `/e2e-test-ids` | Adding `data-testid` attributes to components |
| `/e2e-tests-creator` | Writing new Playwright test specs |
| `/e2e-tests-runner` | Running and debugging E2E tests |
| `/code-review` | Reviewing implementation before merge |
