# ADR-009 Phase 2: Flows Schema Migration & Frontend Integration

> Migrate `flows.branch_condition` JSONB to flattened columns and complete frontend migration from `flowMembership` to `flowId`.

**ADR:** `docs/adr/009-flows-table-branching-architecture.md`
**Phase 1:** `docs/implementation-plans/009-flows-table-branching-architecture.md`
**Status:** Not Started
**Created:** 2026-01-10

---

## Overview

Phase 1 established the `flows` table with a monolithic `branch_condition JSONB` column. ADR-009 has been updated to specify a **flattened columns approach** for better data integrity, queryability, and referential integrity.

### What's Already Done (Phase 1)

| Component | Status | Notes |
|-----------|--------|-------|
| `flows` table | ✅ Created | Uses old `branch_condition JSONB` schema |
| `form_steps.flow_id` | ✅ Added | NOT NULL with FK constraint |
| `flow_membership` CHECK | ✅ Dropped | Constraint removed, column still exists |
| Flow entity (basic) | ✅ Created | `useCreateFlows` composable exists |
| Frontend migration | ❌ Not started | 16+ files still use `flowMembership` |

### What Phase 2 Adds

| Component | Description |
|-----------|-------------|
| **Flattened columns** | `branch_question_id`, `branch_field`, `branch_operator`, `branch_value` |
| **FK constraint** | `branch_question_id` → `form_questions.id` with `ON DELETE RESTRICT` |
| **Cascade trigger** | `trg_form_steps_delete_question` for step→question cleanup |
| **Structured BranchValue** | Type-discriminated JSONB: `{type, value, minInclusive?, maxInclusive?}` |
| **Frontend migration** | Replace `flowMembership` with `flowId` in all composables |
| **Edge case handling** | Branch point deletion, question protection, conflict dialogs |

---

## Current vs Target Schema

### Current Schema (Phase 1)

```sql
flows:
├── branch_condition JSONB  -- {"field": "rating", "op": ">=", "value": 4}
```

### Target Schema (ADR-009)

```sql
flows:
├── branch_question_id TEXT     -- FK to form_questions (ON DELETE RESTRICT)
├── branch_field TEXT           -- 'answer_integer', 'answer_text', etc.
├── branch_operator TEXT        -- 'greater_than_or_equal_to', 'equals', etc.
├── branch_value JSONB          -- {"type": "number", "value": 4}
```

### Why Flattened Columns?

| Aspect | JSONB Blob | Flattened Columns |
|--------|------------|-------------------|
| **Referential integrity** | No FK possible | FK on `branch_question_id` |
| **Orphan prevention** | App must check | `ON DELETE RESTRICT` blocks |
| **Validation** | Runtime only | CHECK constraints enforce |
| **Queryability** | Expression indexes | Standard column indexes |

---

## Pre-Migration: Verify & Clean Up

Use `tm-graph` MCP to verify current state and clean up before migrations.

### Verify Current Schema

```graphql
# Check existing flows
query CheckFlows {
  flows {
    id
    form_id
    flow_type
    branch_condition
  }
}
```

### Delete Existing Flows (if any)

```graphql
# Delete all flows - starting fresh
mutation DeleteAllFlows {
  delete_flows(where: {}) {
    affected_rows
  }
}
```

### Verify After Migrations

```graphql
# Verify new columns exist and constraints work
query VerifySchema {
  flows {
    id
    flow_type
    branch_question_id
    branch_field
    branch_operator
    branch_value
  }
}
```

---

## Database Migrations

### Migration 1: Add Flattened Branch Columns

**Name:** `{timestamp}_{YYYY_MM_DD_HHMM}__flows__add_branch_columns`

> **Note:** No backfill needed - we're in development with no users. Clear existing flows via tm-graph MCP before applying.

**up.sql:**
```sql
-- =====================================================
-- Add Flattened Branch Columns to Flows
-- =====================================================
-- Purpose: Replace branch_condition JSONB with separate columns
--          for better data integrity and queryability.
--
-- ADR Reference: ADR-009 Flows Table Branching Architecture
--
-- New columns:
--   - branch_question_id: FK to form_questions (ON DELETE RESTRICT)
--   - branch_field: Response column name (answer_integer, answer_text, etc.)
--   - branch_operator: Comparison operator (greater_than_or_equal_to, etc.)
--   - branch_value: Structured JSONB value ({type, value, ...})
--
-- Dependencies: flows table, form_questions table

-- =========================================================================
-- 1. Add New Columns
-- =========================================================================

-- FK to the question whose answer determines branching.
-- NULL for shared flows (no condition).
-- Points to form_questions.id for branch flows.
ALTER TABLE public.flows
ADD COLUMN branch_question_id TEXT;

-- Response column to evaluate from form_question_responses table.
-- Maps directly to column names: answer_integer, answer_text, answer_boolean, answer_json.
-- NULL for shared flows.
ALTER TABLE public.flows
ADD COLUMN branch_field TEXT;

-- Comparison operator using verbose names for clarity.
-- Examples: greater_than_or_equal_to, less_than, equals, between, is_one_of.
-- NULL for shared flows.
ALTER TABLE public.flows
ADD COLUMN branch_operator TEXT;

-- Structured comparison value as type-discriminated JSONB.
-- Format: {type: "number"|"string"|"boolean"|"range"|"list", value: ...}
-- For range: {type: "range", min: N, max: N, minInclusive: bool, maxInclusive: bool}
-- NULL for shared flows or is_empty operator.
ALTER TABLE public.flows
ADD COLUMN branch_value JSONB;

-- =========================================================================
-- 2. Add CHECK Constraints
-- =========================================================================

-- Valid response field values (must match form_question_responses columns)
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_branch_field
CHECK (branch_field IS NULL OR branch_field IN (
  'answer_integer',   -- Star rating (1-5), NPS (0-10), scale values
  'answer_text',      -- Single choice option value, short/long text
  'answer_boolean',   -- Consent checkbox, yes/no questions
  'answer_json'       -- Multiple choice selected values array
));

-- Valid operator values (verbose names for clarity)
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_branch_operator
CHECK (branch_operator IS NULL OR branch_operator IN (
  'equals',                    -- Exact match (number, string, boolean)
  'not_equals',                -- Not equal to value
  'greater_than',              -- > value (numbers only)
  'greater_than_or_equal_to',  -- >= value (numbers only)
  'less_than',                 -- < value (numbers only)
  'less_than_or_equal_to',     -- <= value (numbers only)
  'between',                   -- Range check with explicit inclusivity
  'is_one_of',                 -- Value in list (numbers or strings)
  'contains',                  -- Text contains substring
  'is_empty'                   -- Value is null/empty
));

-- Condition completeness: shared flows have no condition, branch flows need complete condition
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_condition_completeness
CHECK (
  -- Shared flows: ALL branch columns must be NULL
  (flow_type = 'shared' AND branch_question_id IS NULL AND branch_field IS NULL AND branch_operator IS NULL AND branch_value IS NULL)
  OR
  -- Branch flows: question_id, field, and operator required; value can be NULL for is_empty
  (flow_type = 'branch' AND branch_question_id IS NOT NULL AND branch_field IS NOT NULL AND branch_operator IS NOT NULL)
);

-- =========================================================================
-- 3. Add Foreign Key Constraint
-- =========================================================================

-- Links branch condition to the question being evaluated.
-- RESTRICT prevents deleting questions that are branch points.
ALTER TABLE public.flows
ADD CONSTRAINT fk_flows_branch_question
FOREIGN KEY (branch_question_id) REFERENCES public.form_questions(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =========================================================================
-- 4. Add Index for branch_question_id
-- =========================================================================

-- Partial index for efficient lookup of flows by branch question.
-- Used when checking if a question can be deleted (FK lookup).
CREATE INDEX idx_flows_branch_question_id ON public.flows(branch_question_id)
WHERE branch_question_id IS NOT NULL;

-- =========================================================================
-- 5. Drop Legacy Column
-- =========================================================================

-- Remove the deprecated JSONB column.
ALTER TABLE public.flows
DROP COLUMN IF EXISTS branch_condition;

-- =========================================================================
-- 6. Documentation (Database COMMENTS)
-- =========================================================================

-- Column comments
COMMENT ON COLUMN public.flows.branch_question_id IS
  'FK to form_questions (ON DELETE RESTRICT). The question whose answer determines this branch. NULL for shared flows.';

COMMENT ON COLUMN public.flows.branch_field IS
  'Response column to evaluate. Valid values: answer_integer, answer_text, answer_boolean, answer_json. NULL for shared flows.';

COMMENT ON COLUMN public.flows.branch_operator IS
  'Comparison operator. Valid values: equals, not_equals, greater_than, greater_than_or_equal_to, less_than, less_than_or_equal_to, between, is_one_of, contains, is_empty. NULL for shared flows.';

COMMENT ON COLUMN public.flows.branch_value IS
  'Structured comparison value as JSONB. Format: {type: "number"|"string"|"boolean"|"range"|"list", value: ...}. NULL for shared flows or is_empty operator.';

-- Constraint comments
COMMENT ON CONSTRAINT chk_flows_branch_field ON public.flows IS
  'Ensures branch_field is a valid form_question_responses column name.';

COMMENT ON CONSTRAINT chk_flows_branch_operator ON public.flows IS
  'Ensures branch_operator is a valid comparison operator.';

COMMENT ON CONSTRAINT chk_flows_condition_completeness ON public.flows IS
  'Ensures shared flows have no branch condition, and branch flows have complete condition.';

COMMENT ON CONSTRAINT fk_flows_branch_question ON public.flows IS
  'FK to form_questions with ON DELETE RESTRICT. Prevents deleting questions used as branch points.';

-- Index comment
COMMENT ON INDEX idx_flows_branch_question_id IS
  'Partial index for efficient lookup of flows referencing a specific question.';
```

**down.sql:**
```sql
-- =====================================================
-- Remove Flattened Branch Columns from Flows
-- =====================================================

-- Restore legacy column
ALTER TABLE public.flows
ADD COLUMN branch_condition JSONB;

-- Drop FK constraint
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS fk_flows_branch_question;

-- Drop CHECK constraints
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_branch_field;
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_branch_operator;
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_condition_completeness;

-- Drop index
DROP INDEX IF EXISTS public.idx_flows_branch_question_id;

-- Drop columns
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_question_id;
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_field;
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_operator;
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_value;
```

---

### Migration 2: Step-Question Cascade Trigger

**Name:** `{timestamp}_{YYYY_MM_DD_HHMM}__form_steps__add_question_cascade_trigger`

**up.sql:**
```sql
-- =====================================================
-- Step Deletion Cascades to Question
-- =====================================================
-- Purpose: When a step is deleted, also delete its associated question.
--          This prevents orphan questions (questions not linked to any step).
--
-- ADR Reference: ADR-009 Flows Table Branching Architecture, Edge Case 4
--
-- Design:
--   - Steps and questions have 1:1 relationship (each step has at most one question)
--   - FK direction: step.question_id → form_questions.id (step references question)
--   - Problem: Deleting step leaves orphan question
--   - Solution: AFTER DELETE trigger cascades step deletion to question
--   - Safety: If question is a branch point (referenced by flows.branch_question_id),
--     the DELETE is blocked by ON DELETE RESTRICT FK constraint
--
-- Flow:
--   1. User deletes step
--   2. AFTER DELETE trigger fires
--   3. Trigger attempts to delete associated question
--   4a. If question is NOT a branch point → question deleted
--   4b. If question IS a branch point → FK RESTRICT blocks, transaction fails
--
-- Dependencies: form_steps table, form_questions table, flows.branch_question_id FK

-- =========================================================================
-- 1. Create Trigger Function
-- =========================================================================

-- Function to cascade step deletion to its associated question.
-- Runs AFTER DELETE to ensure step is fully removed first.
-- The question DELETE may be blocked by flows.branch_question_id FK RESTRICT.
CREATE OR REPLACE FUNCTION delete_step_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Only delete if question_id is not null.
  -- Some step types (welcome, thank_you) don't have questions.
  IF OLD.question_id IS NOT NULL THEN
    -- Attempt to delete the question.
    -- This DELETE will be BLOCKED if:
    --   - Question is referenced by flows.branch_question_id (FK RESTRICT)
    -- The blocking causes the entire transaction to fail,
    -- effectively preventing the step deletion.
    DELETE FROM public.form_questions WHERE id = OLD.question_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 2. Create Trigger
-- =========================================================================

-- AFTER DELETE trigger ensures step is fully deleted before cascading.
-- FOR EACH ROW processes each deleted step individually.
CREATE TRIGGER trg_form_steps_delete_question
AFTER DELETE ON public.form_steps
FOR EACH ROW
EXECUTE FUNCTION delete_step_question();

-- =========================================================================
-- 3. Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON FUNCTION delete_step_question() IS
  'Cascade step deletion to its associated question. Blocked by FK RESTRICT if question is a branch point.';

COMMENT ON TRIGGER trg_form_steps_delete_question ON public.form_steps IS
  'AFTER DELETE trigger that deletes the step question. If question is a branch point, FK RESTRICT blocks deletion.';
```

**down.sql:**
```sql
-- =====================================================
-- Remove Step-Question Cascade Trigger
-- =====================================================

DROP TRIGGER IF EXISTS trg_form_steps_delete_question ON public.form_steps;
DROP FUNCTION IF EXISTS delete_step_question();
```

---

## Hasura Permissions & Metadata

After applying migrations, update Hasura permissions for the new columns.

**Reference:** `.claude/skills/hasura-permissions/SKILL.md`

### Update flows.yaml Permissions

**File:** `db/hasura/metadata/databases/default/tables/public_flows.yaml`

Add the new columns to all roles' select, insert, and update permissions:

```yaml
table:
  name: flows
  schema: public

# ... existing relationships ...

select_permissions:
  - role: owner
    permission:
      columns:
        - id
        - form_id
        - organization_id
        - name
        - flow_type
        - display_order
        - created_at
        - updated_at
        # NEW: Flattened branch columns
        - branch_question_id
        - branch_field
        - branch_operator
        - branch_value
        # DEPRECATED: Remove after frontend migration
        - branch_condition
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      allow_aggregations: true

  # Repeat for: org_admin, member, viewer roles with same columns

insert_permissions:
  - role: owner
    permission:
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id
      columns:
        - form_id
        - organization_id
        - name
        - flow_type
        - display_order
        # NEW: Flattened branch columns
        - branch_question_id
        - branch_field
        - branch_operator
        - branch_value
        # DEPRECATED: Remove after frontend migration
        - branch_condition

  # Repeat for: org_admin, member roles

update_permissions:
  - role: owner
    permission:
      columns:
        - name
        - flow_type
        - display_order
        # NEW: Flattened branch columns
        - branch_question_id
        - branch_field
        - branch_operator
        - branch_value
        # DEPRECATED: Remove after frontend migration
        - branch_condition
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id

  # Repeat for: org_admin, member roles
```

### Add Object Relationship for branch_question

```yaml
object_relationships:
  - name: form
    using:
      foreign_key_constraint_on: form_id
  - name: organization
    using:
      foreign_key_constraint_on: organization_id
  # NEW: Relationship to branch question
  - name: branch_question
    using:
      foreign_key_constraint_on: branch_question_id
```

### Apply Changes

```bash
cd db/hasura

# Apply metadata changes
hasura metadata apply

# Check for inconsistencies
hasura metadata ic list

# If issues, drop and re-export
hasura metadata ic drop
hasura metadata export

# Reload metadata to pick up new columns
hasura metadata reload
```

### Permissions Checklist

After each migration:

- [ ] Migration applied: `hasura migrate apply --database-name default`
- [ ] Migration status verified: `hasura migrate status --database-name default`
- [ ] `public_flows.yaml` updated with new columns in all permissions
- [ ] `branch_question` object relationship added
- [ ] Metadata applied: `hasura metadata apply`
- [ ] Inconsistencies checked: `hasura metadata ic list`
- [ ] Metadata exported: `hasura metadata export`

---

## GraphQL Updates

### Update FlowBasic Fragment

**File:** `apps/web/src/entities/flow/graphql/fragments/FlowBasic.gql`

```graphql
fragment FlowBasic on flows {
  id
  form_id
  organization_id
  name
  flow_type
  display_order
  created_at
  updated_at

  # NEW: Flattened branch columns
  branch_question_id
  branch_field
  branch_operator
  branch_value

  # DEPRECATED: Keep during migration, remove after
  # branch_condition
}
```

### Add Query for Flows by Branch Question

**File:** `apps/web/src/entities/flow/graphql/queries/getFlowsByBranchQuestion.gql`

```graphql
#import "../fragments/FlowBasic.gql"

query GetFlowsByBranchQuestion($branchQuestionId: String!) {
  flows(where: { branch_question_id: { _eq: $branchQuestionId } }) {
    ...FlowBasic
    form {
      id
      name
    }
  }
}
```

### Add Mutation for Updating Single Flow

**File:** `apps/web/src/entities/flow/graphql/mutations/updateFlow.gql`

```graphql
#import "../fragments/FlowBasic.gql"

mutation UpdateFlow($flowId: String!, $_set: flows_set_input!) {
  update_flows_by_pk(pk_columns: { id: $flowId }, _set: $_set) {
    ...FlowBasic
  }
}
```

### Add Mutation for Deleting Single Flow

**File:** `apps/web/src/entities/flow/graphql/mutations/deleteFlow.gql`

```graphql
mutation DeleteFlow($flowId: String!) {
  delete_flows_by_pk(id: $flowId) {
    id
  }
}
```

---

## Type Definitions

### BranchValue Type (Structured JSONB)

**File:** `apps/web/src/entities/flow/models/branchValue.ts`

```typescript
/**
 * Structured value format for branch_value JSONB column.
 * The `type` field enables type-safe parsing and validation.
 * All fields are required - no optional/default values in storage.
 */
export type BranchValue =
  | { type: 'number'; value: number }
  | { type: 'string'; value: string }
  | { type: 'boolean'; value: boolean }
  | {
      type: 'range';
      min: number;
      max: number;
      minInclusive: boolean;  // Always explicit: true = includes min value
      maxInclusive: boolean;  // Always explicit: true = includes max value
    }
  | { type: 'list'; values: (number | string)[] }
  | null;  // For is_empty operator

/**
 * Response fields map to form_question_responses columns.
 */
export type ResponseField =
  | 'answer_integer'   // Star rating (1-5), NPS (0-10), scale values
  | 'answer_text'      // Single choice option value, short/long text
  | 'answer_boolean'   // Consent checkbox, yes/no questions
  | 'answer_json'      // Multiple choice selected values array
  ;

/**
 * Verbose operator names for clarity and self-documentation.
 */
export type BranchOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'greater_than_or_equal_to'
  | 'less_than'
  | 'less_than_or_equal_to'
  | 'between'
  | 'is_one_of'
  | 'contains'
  | 'is_empty'
  ;

/**
 * Flattened branch condition columns (stored on flows table).
 */
export interface FlowBranchCondition {
  branch_question_id: string | null;
  branch_field: ResponseField | null;
  branch_operator: BranchOperator | null;
  branch_value: BranchValue;
}
```

### Update Flow Models Index

**File:** `apps/web/src/entities/flow/models/index.ts`

```typescript
export type * from './queries';
export type * from './mutations';
export type * from './branchValue';

// Utility types
export type FlowType = 'shared' | 'branch';

/**
 * Legacy flow membership for backward compatibility during migration.
 * Derived from flow.flow_type and branch condition.
 */
export type FlowMembershipLegacy = 'shared' | 'testimonial' | 'improvement';
```

---

## Frontend Files to Modify

### Files Using flowMembership (16 files)

All these files need to be updated to use `flowId` instead of `flowMembership`:

| File | Changes Required |
|------|------------------|
| `composables/timeline/useBranchingDetection.ts` | Use `flowId` + flow relationship |
| `composables/timeline/useTimelineBranching.ts` | Create flows in DB, assign `flowId` |
| `composables/timeline/useBranchingDisable.ts` | Delete flows, reassign steps |
| `composables/timeline/useSaveFormSteps.ts` | Save `flow_id` not `flow_membership` |
| `composables/timeline/useFlowNavigation.ts` | Navigate by `flowId` |
| `composables/timeline/useStepOperations.ts` | Assign `flowId` to new steps |
| `composables/timeline/useTimelineEditor.ts` | Sync flow focus by `flowId` |
| `composables/useCreateFormWithSteps.ts` | Create flows, map `flowMembership` → `flowId` |
| `composables/useQuestionEditorPanel.ts` | Default `flowId` for new questions |
| `composables/useFormEditor.ts` | Default `flowId` for new steps |
| `composables/useCreateFormWizard.ts` | Set `flow_id` on wizard questions |
| `functions/stepTransform.ts` | Derive `flowMembership` from `flow` relation |
| `ui/wizard/screens/PreviewScreen.vue` | Group by `flowId` |
| `ui/wizard/components/PreviewStepCard.vue` | Display based on flow |
| `ui/wizard/components/BranchingFlowPreview.vue` | Render by flow |
| `ui/formStudio/TimelineSidebar.vue` | Flow indicators from `flow` relation |

---

## Edge Case Implementations

### 1. Question Deletion Protection

**File:** `apps/web/src/features/createForm/composables/useQuestionDeletion.ts`

```typescript
import type { Flow } from '@/entities/flow';

interface QuestionDeletionResult {
  canDelete: boolean;
  blockedBy?: {
    flows: Flow[];
    message: string;
  };
}

export function useQuestionDeletion() {
  const { flows: getFlowsByQuestion } = useGetFlowsByBranchQuestion();

  async function checkQuestionDeletion(questionId: string): Promise<QuestionDeletionResult> {
    const affectedFlows = await getFlowsByQuestion(questionId);

    if (affectedFlows.length > 0) {
      return {
        canDelete: false,
        blockedBy: {
          flows: affectedFlows,
          message: `This question is used for branching in ${affectedFlows.length} flow(s)`,
        },
      };
    }

    return { canDelete: true };
  }

  return { checkQuestionDeletion };
}
```

### 2. Branch Point Deletion Dialog

When deleting a step that contains the branch question, show dialog:

```typescript
interface BranchPointDeleteOptions {
  step: FormStep;
  branchFlows: Flow[];
  downstreamSteps: FormStep[];
}

type BranchPointDeleteChoice =
  | 'KEEP_FIRST_BRANCH'
  | 'KEEP_SECOND_BRANCH'
  | 'DELETE_ALL_BRANCHES'
  | 'CANCEL';

async function handleBranchPointDeletion(options: BranchPointDeleteOptions): Promise<void> {
  const choice = await showBranchPointDeleteDialog(options);

  switch (choice) {
    case 'KEEP_FIRST_BRANCH':
      // Convert first branch to shared, delete others
      await updateFlow({ flowId: options.branchFlows[0].id, _set: { flow_type: 'shared', ... } });
      for (const flow of options.branchFlows.slice(1)) {
        await deleteFlow({ flowId: flow.id });
      }
      break;
    // ... other cases
  }
}
```

### 3. Question Replacement Conflict

When changing a step's question, check if old question is a branch point:

```typescript
async function updateStepQuestion(stepId: string, newQuestionId: string): Promise<void> {
  const step = await getStep(stepId);
  const oldQuestionId = step.question_id;

  // Check if old question is used for branching
  const { canDelete, blockedBy } = await checkQuestionDeletion(oldQuestionId);

  if (!canDelete) {
    // Show conflict dialog with options:
    // 1. Update conditions to use new question
    // 2. Remove branching
    // 3. Cancel
    const choice = await showQuestionReplacementDialog(blockedBy);
    // Handle choice...
  }

  // Proceed with update
  await updateStep(stepId, { question_id: newQuestionId });
}
```

---

## Implementation Phases

### Phase 2.1: Database Migrations (Week 1)

1. [ ] Create Migration 1: Add flattened columns
2. [ ] Apply migration, verify backfill
3. [ ] Create Migration 2: Add FK constraint
4. [ ] Create Migration 3: Add cascade trigger
5. [ ] Update Hasura metadata for new columns
6. [ ] Run `hasura metadata export`

### Phase 2.2: GraphQL & Types (Week 1)

1. [ ] Update FlowBasic fragment with new columns
2. [ ] Add getFlowsByBranchQuestion query
3. [ ] Add updateFlow, deleteFlow mutations
4. [ ] Create BranchValue type definitions
5. [ ] Update flow models index
6. [ ] Run `pnpm codegen:web`

### Phase 2.3: Flow Composables (Week 2)

1. [ ] Create useGetFlowsByBranchQuestion
2. [ ] Create useUpdateFlow, useDeleteFlow
3. [ ] Update useCreateFlows to use new columns
4. [ ] Create deriveFlowMembership helper
5. [ ] Create createDefaultFlows with new schema

### Phase 2.4: Timeline Editor Migration (Week 2-3)

1. [ ] Update stepTransform.ts to include flowId
2. [ ] Update useTimelineBranching to create flows with new columns
3. [ ] Update useBranchingDisable to use flowId
4. [ ] Update useBranchingDetection to use flowId
5. [ ] Update useSaveFormSteps to save flow_id
6. [ ] Update useFlowNavigation
7. [ ] Update useStepOperations

### Phase 2.5: Edge Cases (Week 3)

1. [ ] Implement question deletion protection
2. [ ] Implement branch point deletion dialog
3. [ ] Implement question replacement conflict dialog
4. [ ] Add UI components for dialogs

### Phase 2.6: Public Form Runtime (Week 3)

1. [ ] Update flow evaluation to use new columns
2. [ ] Update evaluateBranchCondition for structured BranchValue
3. [ ] Test all operator types

### Phase 2.7: Testing & Cleanup (Week 4)

1. [ ] Test new form creation with branching
2. [ ] Test existing form editing
3. [ ] Test threshold changes
4. [ ] Test edge cases (deletion, replacement)
5. [ ] Migration 4: Drop branch_condition column (after stable)

---

## Testing Checklist

### Database

- [ ] Migration 1 applies without errors
- [ ] Backfill correctly converts existing branch_condition
- [ ] CHECK constraints reject invalid values
- [ ] FK constraint blocks deleting branch questions
- [ ] Cascade trigger deletes question when step deleted
- [ ] Cascade trigger blocked when question is branch point

### GraphQL

- [ ] FlowBasic fragment returns new columns
- [ ] getFlowsByBranchQuestion finds flows correctly
- [ ] updateFlow updates new columns
- [ ] deleteFlow removes flow (cascade to steps)

### Frontend

- [ ] Enable branching creates flows with new schema
- [ ] Disable branching deletes flows correctly
- [ ] Threshold change updates branch_value
- [ ] Step creation assigns correct flowId
- [ ] Step deletion triggers question cascade
- [ ] Branch point deletion shows dialog
- [ ] Question deletion shows protection warning

### Runtime

- [ ] evaluateBranchCondition handles all operators
- [ ] Structured BranchValue parsed correctly
- [ ] Range with explicit inclusivity works
- [ ] Correct flow determined at runtime

---

## Rollback Strategy

1. **Partial rollback:** Keep new columns but revert frontend to use branch_condition
2. **Full rollback:** Run down.sql for migrations in reverse order
3. **Data preservation:** branch_condition remains populated until Migration 4

---

## Future Work (Enabled by Phase 2)

| Feature | How It Works |
|---------|--------------|
| **Custom flow names** | Already supported via `flows.name` |
| **NPS 3-way branching** | Add 3 branch flows with appropriate `branch_value` |
| **Choice-based branching** | Set `branch_field: 'answer_text'` |
| **Yes/No branching** | Set `branch_field: 'answer_boolean'` |
| **Custom thresholds** | Update `branch_value` per flow |
| **Multiple branch points** | Add flows with different `branch_question_id` |
