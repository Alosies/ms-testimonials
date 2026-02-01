-- =====================================================
-- Plan Quality Level Models Rollback
-- =====================================================
-- Reverses the creation of the plan_quality_level_models junction table.

-- Drop indexes first
DROP INDEX IF EXISTS public.idx_pqlm_default;
DROP INDEX IF EXISTS public.idx_pqlm_llm_model_id;
DROP INDEX IF EXISTS public.idx_pqlm_plan_ai_capability_quality_level_id;

-- Drop the table (CASCADE will remove constraints automatically)
DROP TABLE IF EXISTS public.plan_quality_level_models CASCADE;
