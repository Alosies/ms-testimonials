-- =====================================================
-- Plan AI Capability Quality Levels Junction Table Rollback
-- =====================================================

-- Drop indexes (will be automatically dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS public.idx_pacql_quality_level_id;
DROP INDEX IF EXISTS public.idx_pacql_plan_ai_capability_id;

-- Drop table (CASCADE handles foreign key constraints)
DROP TABLE IF EXISTS public.plan_ai_capability_quality_levels CASCADE;
