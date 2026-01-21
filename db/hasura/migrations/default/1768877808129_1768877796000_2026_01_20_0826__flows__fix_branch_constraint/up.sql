-- =====================================================
-- Fix chk_flows_branch_requires_conditions Constraint
-- =====================================================
-- Purpose: Update constraint to allow shared flows without branch conditions.
--          The original constraint required ALL non-primary flows to have
--          branch conditions, but shared flows (like ending flows) should
--          not require conditions.
--
-- ADR Reference: ADR-018 Generic Flow Segments
--
-- Change: Only require branch conditions when flow_type = 'branch'

-- =========================================================================
-- Drop Old Constraint
-- =========================================================================

-- Remove the constraint that incorrectly requires non-primary flows to have conditions
ALTER TABLE public.flows
DROP CONSTRAINT IF EXISTS chk_flows_branch_requires_conditions;

-- =========================================================================
-- Add Updated Constraint
-- =========================================================================

-- Only branch flows require branch conditions.
-- Shared flows (intro, ending, etc.) never need branch conditions.
ALTER TABLE public.flows
ADD CONSTRAINT chk_flows_branch_requires_conditions
CHECK (
  CASE
    WHEN flow_type = 'branch'
    THEN branch_question_id IS NOT NULL AND branch_operator IS NOT NULL
    ELSE true
  END
);

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON CONSTRAINT chk_flows_branch_requires_conditions ON public.flows IS
  'Branch flows (flow_type = ''branch'') must have branch_question_id and branch_operator set. Shared flows have no such requirement.';
