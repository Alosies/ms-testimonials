-- =====================================================
-- Rollback: Remove flow_id column from form_steps
-- =====================================================
-- Purpose: Reverts the addition of flow_id column.

-- =========================================================================
-- Drop Indexes
-- =========================================================================

DROP INDEX IF EXISTS public.idx_form_steps_flow_order;
DROP INDEX IF EXISTS public.idx_form_steps_flow_id;

-- =========================================================================
-- Drop Column
-- =========================================================================

ALTER TABLE public.form_steps
DROP COLUMN IF EXISTS flow_id;
