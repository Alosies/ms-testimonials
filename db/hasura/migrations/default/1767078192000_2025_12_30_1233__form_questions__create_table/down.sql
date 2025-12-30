-- =====================================================
-- Form Questions Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('form_questions', 'public');

DROP INDEX IF EXISTS public.idx_form_questions_org;
DROP INDEX IF EXISTS public.idx_form_questions_form;
DROP INDEX IF EXISTS public.idx_form_questions_type;
DROP INDEX IF EXISTS public.idx_form_questions_order;

DROP TABLE IF EXISTS public.form_questions CASCADE;
