-- =====================================================
-- Rollback: Remove flow_membership from form_steps
-- =====================================================

-- Drop index
DROP INDEX IF EXISTS public.idx_form_steps_flow_membership;

-- Drop constraint
ALTER TABLE public.form_steps
DROP CONSTRAINT IF EXISTS chk_form_steps_flow_membership;

-- Drop column
ALTER TABLE public.form_steps
DROP COLUMN IF EXISTS flow_membership;
