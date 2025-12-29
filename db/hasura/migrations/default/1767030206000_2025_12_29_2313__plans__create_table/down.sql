-- =====================================================
-- Plans Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('plans', 'public');

DROP INDEX IF EXISTS public.idx_plans_active;
DROP INDEX IF EXISTS public.idx_plans_unique_name;

DROP TABLE IF EXISTS public.plans CASCADE;
