# ADR-017: Question Type Change Workflow

## Doc Connections
**ID**: `adr-017-question-type-change-workflow`

2026-01-18-1400 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-011-immediate-save-actions` - Immediate save pattern for discrete actions
- `adr-009-flows-table-branching` - Branching architecture (affects question dependencies)

---

## Status

**Proposed** - 2026-01-18

## Context

### Problem Statement

When a user changes the **question type** of an existing question in the form studio (e.g., from "Paragraph" to "Star rating"), different question types have different data requirements:

| Category | Fields | Used By |
|----------|--------|---------|
| **Text validation** | `min_length`, `max_length`, `validation_pattern` | text_short, text_long, text_email, text_url |
| **Rating validation** | `min_value`, `max_value`, `scale_min_label`, `scale_max_label` | rating_star, rating_scale |
| **Media config** | `allowed_file_types`, `max_file_size_kb` | media_file, media_video |
| **Choice options** | `question_options` (child table) | choice_single, choice_multiple, choice_dropdown |

### Current State

The current `handleQuestionTypeChange()` in `QuestionStepEditor.vue:104-133`:

1. **Only updates** `question_type_id` field
2. **Does NOT clear** incompatible validation fields
3. **Does NOT delete** orphaned `question_options` records
4. **Does NOT warn** the user about data loss

**Result**: Orphaned data remains in the database, and users have no visibility into what configuration will become invalid.

### Question Types Overview

The system supports 16 question types across 6 categories:

```
Text:     text_short, text_long, text_email, text_url
Choice:   choice_single, choice_multiple, choice_dropdown
Rating:   rating_star, rating_scale
Media:    media_file, media_video
Input:    input_date, input_time, input_switch, input_checkbox
Special:  special_hidden
```

### Data Transferability

When changing between question types, data falls into three categories:

| Data Type | Transferability |
|-----------|-----------------|
| **Common fields** (question_text, is_required, help_text, placeholder) | Always preserved |
| **Same-category fields** (e.g., text → text) | Mostly preserved |
| **Cross-category fields** (e.g., choice → rating) | Lost |
| **Question options** | Lost when changing away from choice types |

### Downstream Dependencies

The `form_questions` table has a critical downstream dependency:

```
form_questions.id  ←──  form_question_responses.question_id (FK)
```

If a question has existing responses (from form submissions), changing its type would:
- Invalidate response data (e.g., text response for a star rating question)
- Potentially orphan or corrupt response records

## Decision

### Approach: Delete + Recreate with Response Check

Instead of complex field-by-field cleanup, **delete the existing question and create a new one** with the new type, transferring compatible fields.

**Rationale**: Database FK cascades automatically handle cleanup of `question_options`. This is simpler, safer, and eliminates the possibility of orphaned data.

### Pre-condition: Check for Existing Responses

Before allowing a type change, check if the question has any responses:

- **No responses** → Allow type change with warning about options loss
- **Has responses** → Block type change, offer to delete responses first

### UX Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User opens Question Type dropdown                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Check: Does this question have responses?               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                    │                      │                     │
│                   YES                     NO                    │
│                    ▼                      ▼                     │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   │
│  │  Dropdown DISABLED       │   │  Dropdown ENABLED        │   │
│  │                          │   │                          │   │
│  │  Message: "Cannot change │   │  User selects new type   │   │
│  │  type: 12 responses      │   │           │              │   │
│  │  exist"                  │   │           ▼              │   │
│  │                          │   │  Warning dialog (if      │   │
│  │  [Delete Responses]      │   │  options will be lost)   │   │
│  │         │                │   │           │              │   │
│  │         ▼                │   │           ▼              │   │
│  │  Confirmation dialog:    │   │  Delete old question     │   │
│  │  "Permanently delete     │   │  Create new question     │   │
│  │   12 responses?"         │   │  with transferred fields │   │
│  │  [Cancel] [Delete]       │   │                          │   │
│  │         │                │   │                          │   │
│  │         ▼                │   │                          │   │
│  │  Delete responses        │   │                          │   │
│  │  Enable dropdown         │   │                          │   │
│  └──────────────────────────┘   └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### UI States

#### State 1: No Responses (Normal)

```
┌─────────────────────────────────────────────────────┐
│  Question Type                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  📝 Paragraph                            ▾    │  │  ← Enabled
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### State 2: Has Responses (Blocked)

```
┌─────────────────────────────────────────────────────┐
│  Question Type                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  📝 Paragraph                            ▾    │  │  ← Disabled (grayed)
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ⚠️ Type cannot be changed: 12 responses exist.    │
│     [Delete responses to change type]              │  ← Link/button
└─────────────────────────────────────────────────────┘
```

#### Warning Dialog: Options Will Be Lost

When changing from a choice type (choice_single, choice_multiple, choice_dropdown) to a non-choice type:

```
┌─────────────────────────────────────────────────────┐
│  Change Question Type                               │
│                                                     │
│  Changing to "Star rating" will delete:             │
│  • 4 answer options                                 │
│                                                     │
│  Question text and settings will be preserved.      │
│                                                     │
│              [Cancel]  [Change Type]                │
└─────────────────────────────────────────────────────┘
```

#### Confirmation Dialog: Delete Responses

```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Delete Question Responses?                      │
│                                                     │
│  This will permanently delete 12 responses          │
│  collected for this question. This action cannot    │
│  be undone.                                         │
│                                                     │
│  After deletion, you can change the question type.  │
│                                                     │
│              [Cancel]  [Delete Responses]           │
└─────────────────────────────────────────────────────┘
```

### Data Transfer Rules

When creating the new question, transfer these fields from the old question:

| Field | Transfer Rule |
|-------|---------------|
| `step_id` | Always transfer (maintains step association) |
| `display_order` | Always transfer (maintains position) |
| `question_text` | Always transfer |
| `question_key` | Always transfer |
| `is_required` | Always transfer |
| `help_text` | Always transfer |
| `placeholder` | Transfer if new type supports text input |
| `organization_id` | Always transfer (tenant boundary) |
| `min_length`, `max_length` | Only if new type is text category |
| `validation_pattern` | Only if new type supports pattern |
| `min_value`, `max_value` | Only if new type is rating category OR choice_multiple |
| `scale_min_label`, `scale_max_label` | Only if new type is rating_scale |
| `question_options` | Never transfer (recreate if needed for choice types) |

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         QuestionStepEditor.vue                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  handleQuestionTypeChange(newTypeId)                            │   │
│  │    │                                                            │   │
│  │    ├─► Check responseCount                                      │   │
│  │    │   └─► If > 0: Block, show "Delete responses" option        │   │
│  │    │                                                            │   │
│  │    ├─► Analyze data loss (options count)                        │   │
│  │    │   └─► If options > 0: Show warning dialog                  │   │
│  │    │                                                            │   │
│  │    └─► Call replaceQuestionWithNewType()                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              useQuestionTypeChange (NEW composable)                     │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  replaceQuestionWithNewType({ oldQuestionId, newTypeId })       │   │
│  │    │                                                            │   │
│  │    ├─► 1. Fetch old question data                               │   │
│  │    │                                                            │   │
│  │    ├─► 2. Calculate transferred fields                          │   │
│  │    │                                                            │   │
│  │    ├─► 3. Delete old question (CASCADE handles options)         │   │
│  │    │                                                            │   │
│  │    ├─► 4. Create new question with new type + transferred data  │   │
│  │    │                                                            │   │
│  │    └─► 5. Update step.question_id reference                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  deleteQuestionResponses(questionId)                            │   │
│  │    └─► Bulk delete form_question_responses for this question    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  getQuestionResponseCount(questionId)                           │   │
│  │    └─► Return count of responses for UI decision                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Entity Mutations (GraphQL)                          │
│                                                                         │
│  • delete_form_questions_by_pk (CASCADE deletes question_options)       │
│  • insert_form_questions_one (create with new type)                     │
│  • update_form_steps_by_pk (update question_id reference)               │
│  • delete_form_question_responses (bulk delete if user confirms)        │
│  • form_question_responses_aggregate (count query)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### GraphQL Operations

**CRITICAL**: All GraphQL operations MUST be validated against `tm-graph` MCP before implementation.

```bash
# Validation steps before creating .gql files:
# 1. mcp__tm-graph__get-type-info: { type_name: "form_question_responses_aggregate" }
# 2. mcp__tm-graph__list-mutations  # verify delete operations exist
# 3. mcp__tm-graph__search-schema: { query: "question_responses" }
```

#### 1. Get Response Count

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

#### 2. Delete Question Responses

```graphql
mutation DeleteQuestionResponses($questionId: String!) {
  delete_form_question_responses(
    where: { question_id: { _eq: $questionId } }
  ) {
    affected_rows
  }
}
```

#### 3. Replace Question (Delete + Create + Update Step)

```graphql
# Step 1: Delete old question (CASCADE handles options)
mutation DeleteFormQuestion($id: String!) {
  delete_form_questions_by_pk(id: $id) {
    id
  }
}

# Step 2: Create new question with new type
mutation CreateFormQuestion($input: form_questions_insert_input!) {
  insert_form_questions_one(object: $input) {
    id
    ...FormQuestionFields
  }
}

# Step 3: Update step to reference new question
mutation UpdateStepQuestionId($stepId: String!, $questionId: String!) {
  update_form_steps_by_pk(
    pk_columns: { id: $stepId }
    _set: { question_id: $questionId }
  ) {
    id
    question_id
  }
}
```

### Pure Function: Analyze Type Change

```typescript
// features/createForm/functions/analyzeQuestionTypeChange.ts

interface TypeChangeAnalysis {
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

  const willLoseTextValidation = isTextType(currentType) && !isTextType(newType);
  const willLoseRatingConfig = isRatingType(currentType) && !isRatingType(newType);

  return {
    willLoseOptions,
    optionCount: willLoseOptions ? optionCount : 0,
    willLoseTextValidation,
    willLoseRatingConfig,
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

### Pure Function: Calculate Transferred Fields

```typescript
// features/createForm/functions/getTransferableQuestionFields.ts

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
  if (newType.supports_max_length) {
    transferred.placeholder = oldQuestion.placeholder;
  }

  if (newType.supports_min_length) {
    transferred.min_length = oldQuestion.minLength;
  }

  if (newType.supports_max_length) {
    transferred.max_length = oldQuestion.maxLength;
  }

  if (newType.supports_pattern) {
    transferred.validation_pattern = oldQuestion.validationPattern;
  }

  if (newType.supports_min_value) {
    transferred.min_value = oldQuestion.minValue ?? newType.default_min_value;
  }

  if (newType.supports_max_value) {
    transferred.max_value = oldQuestion.maxValue ?? newType.default_max_value;
  }

  if (newType.unique_name === 'rating_scale') {
    transferred.scale_min_label = oldQuestion.scaleMinLabel;
    transferred.scale_max_label = oldQuestion.scaleMaxLabel;
  }

  return transferred;
}
```

## Implementation Requirements

### Confirmation Modals (Required)

**ALL delete operations MUST have a confirmation modal.** No silent deletes.

| Action | Modal | Confirm Button |
|--------|-------|----------------|
| Change type (loses options) | QuestionTypeChangeWarning | "Change Type" |
| Delete responses | DeleteResponsesConfirmation | "Delete Responses" |

### API Endpoint for Testing

An API endpoint is required to create mock responses for E2E tests:

```typescript
// POST /api/test/responses (development only)
{
  questionId: string;
  count: number;
  organizationId: string;
}
```

This enables the `formWithResponsesViaApi` test fixture.

### Skills Mapping

| Implementation Phase | Skills |
|---------------------|--------|
| Phase 0: E2E Tests | `/e2e-tests-creator`, `/e2e-test-ids` |
| Phase 1: GraphQL | `/graphql-code`, `tm-graph` MCP |
| Phase 4: UI Components | `/e2e-test-ids` |
| Phase 5: Integration | `/e2e-tests-runner`, `/code-review` |

See `implementation.md` for detailed implementation guide.

---

## Implementation Checklist

### Phase 0: E2E Tests (TDD - DONE)

- [x] Create test spec: `apps/web/tests/e2e/features/form-studio/focused-tests/question-type-change.spec.ts`
- [x] Create action helpers: `apps/web/tests/e2e/features/form-studio/actions/questionTypeChange.actions.ts`
- [x] Add test IDs to: `apps/web/src/shared/constants/testIds/studio.ts`
- [x] Update autosave actions with `getQuestionType()` helper
- [ ] Create fixture: `choiceQuestionFormViaApi` (form with choice question + options)
- [ ] Create fixture: `formWithResponsesViaApi` (form with actual responses)

### Phase 1: GraphQL Operations (~50 lines)

- [ ] Add `GetQuestionResponseCount` query to `formQuestion` entity
- [ ] Add `DeleteQuestionResponses` mutation to `formQuestion` entity
- [ ] Create composables: `useGetQuestionResponseCount`, `useDeleteQuestionResponses`

### Phase 2: Pure Functions (~80 lines)

- [ ] Create `analyzeQuestionTypeChange.ts` in `features/createForm/functions/`
- [ ] Create `getTransferableQuestionFields.ts` in `features/createForm/functions/`
- [ ] Add unit tests for both functions

### Phase 3: Composable (~120 lines)

- [ ] Create `useQuestionTypeChange.ts` in `features/createForm/composables/`
  - `replaceQuestionWithNewType()`
  - `deleteQuestionResponses()`
  - `getResponseCount()`
- [ ] Integrate with `useSaveLock` for save coordination

### Phase 4: UI Components (~150 lines)

- [ ] Create `QuestionTypeChangeWarning.vue` dialog component
- [ ] Create `DeleteResponsesConfirmation.vue` dialog component
- [ ] Update `QuestionStepEditor.vue`:
  - Add `responseCount` computed property
  - Add `hasResponses` computed property
  - Disable dropdown when `hasResponses`
  - Show warning message and delete button
  - Integrate warning dialog before type change

### Phase 5: Testing

- [ ] Unit tests for `analyzeQuestionTypeChange`
- [ ] Unit tests for `getTransferableQuestionFields`
- [ ] E2E test: Change type when no responses (happy path)
- [ ] E2E test: Verify options deleted when changing from choice type
- [ ] E2E test: Blocked when responses exist
- [ ] E2E test: Delete responses then change type

## Consequences

### Positive

1. **Data integrity** - No orphaned `question_options` records
2. **User awareness** - Clear warnings before data loss
3. **Simplicity** - Database cascades handle cleanup automatically
4. **Protection** - Cannot corrupt response data accidentally
5. **Explicit user control** - User must explicitly delete responses to proceed
6. **Predictable behavior** - Delete + create is atomic and well-understood

### Negative

1. **Question ID changes** - New question gets new ID (but step association maintained)
2. **Cannot preserve options** - When changing between choice types, user must recreate options
3. **Extra confirmation step** - Users with responses must confirm deletion first
4. **Response deletion is permanent** - No recovery once responses deleted

### Neutral

1. **Two-step process for forms with responses** - Delete responses, then change type
2. **Question_key preserved** - Semantic identifier maintained for analytics continuity

## Alternatives Considered

### Alternative 1: Database Trigger with Field Cleanup

Automatically clear incompatible fields when `question_type_id` changes.

```sql
CREATE TRIGGER cleanup_question_type_change
  BEFORE UPDATE ON form_questions
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_question_fields();
```

**Rejected because:**
- Complex trigger logic for all field combinations
- Still need frontend warning dialog
- Harder to test and debug
- Business logic split between DB and frontend
- Doesn't handle `question_options` cleanup elegantly

### Alternative 2: Soft Delete + Archive

Keep old question data, create new question, link both.

**Rejected because:**
- Over-engineered for the use case
- Adds complexity to data model
- Unclear when to clean up archived data
- Form building is iterative - users expect changes to be final

### Alternative 3: Block Type Change Entirely

Don't allow changing question type; user must delete and recreate manually.

**Rejected because:**
- Poor UX for common workflow
- User loses all settings (even transferable ones)
- Inconsistent with "edit in place" mental model

## References

- ADR-011: Immediate Save Actions (save lock pattern)
- ADR-009: Flows Table for Branching Architecture
- PostgreSQL FK CASCADE documentation
- `question_types` table schema (supports_* columns)
- [Implementation Guide](./implementation.md) - Detailed implementation steps with skills mapping
- `.claude/skills/graphql-code/SKILL.md` - GraphQL operations workflow
- `.claude/skills/e2e-tests-creator/SKILL.md` - E2E test patterns
- `.claude/skills/e2e-test-ids/SKILL.md` - Test ID management
