-- =====================================================
-- Question Types Table Rollback
-- =====================================================

DROP INDEX IF EXISTS public.idx_question_types_category;

DROP TABLE IF EXISTS public.question_types CASCADE;
