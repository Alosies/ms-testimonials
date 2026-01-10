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
