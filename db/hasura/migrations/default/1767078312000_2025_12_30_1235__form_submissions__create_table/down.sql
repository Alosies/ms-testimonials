-- =====================================================
-- Form Submissions Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('form_submissions', 'public');

DROP INDEX IF EXISTS public.idx_form_submissions_org;
DROP INDEX IF EXISTS public.idx_form_submissions_form;
DROP INDEX IF EXISTS public.idx_form_submissions_submitted;

DROP TABLE IF EXISTS public.form_submissions CASCADE;
