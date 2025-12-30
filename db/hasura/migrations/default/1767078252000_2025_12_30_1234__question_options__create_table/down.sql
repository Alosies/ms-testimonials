-- =====================================================
-- Question Options Table Rollback
-- =====================================================

DROP INDEX IF EXISTS public.idx_question_options_org;
DROP INDEX IF EXISTS public.idx_question_options_question;
DROP INDEX IF EXISTS public.idx_question_options_order;

DROP TABLE IF EXISTS public.question_options CASCADE;
