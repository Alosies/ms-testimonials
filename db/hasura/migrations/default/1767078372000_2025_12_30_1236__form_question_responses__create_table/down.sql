-- =====================================================
-- Form Question Responses Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('form_question_responses', 'public');

DROP INDEX IF EXISTS public.idx_form_question_responses_org;
DROP INDEX IF EXISTS public.idx_form_question_responses_submission;
DROP INDEX IF EXISTS public.idx_form_question_responses_question;
DROP INDEX IF EXISTS public.idx_form_question_responses_rating;

DROP TABLE IF EXISTS public.form_question_responses CASCADE;
