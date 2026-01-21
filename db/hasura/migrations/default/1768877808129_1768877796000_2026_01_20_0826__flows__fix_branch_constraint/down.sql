-- =====================================================
-- Rollback: Restore Original chk_flows_branch_requires_conditions
-- =====================================================
-- Restores the original constraint that required non-primary flows
-- to have branch conditions.

-- Drop the updated constraint
ALTER TABLE public.flows
DROP CONSTRAINT IF EXISTS chk_flows_branch_requires_conditions;

-- Restore the original constraint
-- Original: if is_primary is false, branch_question_id and branch_operator are required
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_branch_requires_conditions
CHECK (
  is_primary OR (
    branch_question_id IS NOT NULL AND
    branch_operator IS NOT NULL
  )
);

COMMENT ON CONSTRAINT chk_flows_branch_requires_conditions ON public.flows IS
  'Branch flows (is_primary = false) must have branch_question_id and branch_operator set.';
