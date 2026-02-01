-- =====================================================
-- Organization Plans - Remove Pending Change Columns (Rollback)
-- =====================================================

-- Drop the partial index first
DROP INDEX IF EXISTS public.idx_organization_plans_pending_change;

-- Drop the columns (order matters - drop in reverse order of creation)
ALTER TABLE public.organization_plans
DROP COLUMN IF EXISTS pending_change_at;

ALTER TABLE public.organization_plans
DROP COLUMN IF EXISTS pending_plan_id;
