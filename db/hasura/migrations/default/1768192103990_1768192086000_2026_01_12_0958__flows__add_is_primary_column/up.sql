-- =====================================================
-- Add is_primary Column to Flows Table
-- =====================================================
-- Purpose: Explicitly mark the primary flow per form instead of using
--          flow_type = 'shared' convention. Enables database-level
--          constraint for exactly one primary flow per form.
-- Dependencies: flows table exists

-- =========================================================================
-- Add Column
-- =========================================================================

-- Boolean flag indicating if this is the primary (main) flow for the form.
-- Primary flows are always shown to respondents; branch flows are conditional.
ALTER TABLE public.flows
ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT false;

-- =========================================================================
-- Constraints
-- =========================================================================

-- Partial unique index: ensures exactly one primary flow per form.
-- Multiple branch flows (is_primary = false) are allowed per form.
CREATE UNIQUE INDEX idx_flows_primary_per_form
ON public.flows (form_id)
WHERE is_primary = true;

-- Check constraint: primary flows cannot have branch conditions.
-- If is_primary is true, all branch-related columns must be NULL.
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_primary_no_branch
CHECK (
  NOT is_primary OR (
    branch_question_id IS NULL AND
    branch_operator IS NULL AND
    branch_value IS NULL
  )
);

-- Check constraint: branch flows must have conditions.
-- If is_primary is false, branch_question_id and branch_operator are required.
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_branch_requires_conditions
CHECK (
  is_primary OR (
    branch_question_id IS NOT NULL AND
    branch_operator IS NOT NULL
    -- branch_value can be NULL for operators like 'is_empty'
  )
);

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON COLUMN public.flows.is_primary IS
  'Boolean flag marking the primary flow. Each form has exactly one primary flow (enforced by partial unique index). Primary flows are always shown; branch flows are conditional.';

COMMENT ON INDEX idx_flows_primary_per_form IS
  'Ensures exactly one primary flow per form. Allows multiple branch flows.';

COMMENT ON CONSTRAINT chk_flows_primary_no_branch ON public.flows IS
  'Primary flows cannot have branch conditions (branch_question_id, branch_operator, branch_value must be NULL).';

COMMENT ON CONSTRAINT chk_flows_branch_requires_conditions ON public.flows IS
  'Branch flows (is_primary = false) must have branch_question_id and branch_operator set.';
