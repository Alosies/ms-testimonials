-- =====================================================
-- LLM Models Table Rollback
-- =====================================================

-- Drop indexes first
DROP INDEX IF EXISTS public.idx_llm_models_quality_tier_order;
DROP INDEX IF EXISTS public.idx_llm_models_is_active;
DROP INDEX IF EXISTS public.idx_llm_models_provider_quality_tier;

-- Drop table (CASCADE handles constraints and seed data)
DROP TABLE IF EXISTS public.llm_models CASCADE;
