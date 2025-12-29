-- =====================================================
-- Organization Plans Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('organization_plans', 'public');

DROP INDEX IF EXISTS public.idx_org_plans_expiring;
DROP INDEX IF EXISTS public.idx_org_plans_status;
DROP INDEX IF EXISTS public.idx_org_plans_plan;
DROP INDEX IF EXISTS public.idx_org_plans_org;
DROP INDEX IF EXISTS public.idx_org_plans_active;

DROP TABLE IF EXISTS public.organization_plans CASCADE;
