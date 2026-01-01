-- =====================================================
-- Plan Question Types Rollback
-- =====================================================

-- Remove trigger
SELECT remove_updated_at_trigger('plan_question_types', 'public');

-- Drop indexes
DROP INDEX IF EXISTS public.idx_plan_question_types_plan_id;
DROP INDEX IF EXISTS public.idx_plan_question_types_question_type_id;

-- Drop table (CASCADE removes constraints and seed data)
DROP TABLE IF EXISTS public.plan_question_types CASCADE;
