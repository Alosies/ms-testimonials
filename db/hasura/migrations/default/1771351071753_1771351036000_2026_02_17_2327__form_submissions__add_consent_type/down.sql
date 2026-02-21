-- =====================================================
-- Form Submissions: Remove consent_type Column (Rollback)
-- =====================================================

ALTER TABLE public.form_submissions
    DROP CONSTRAINT IF EXISTS chk_form_submissions_consent_type;

ALTER TABLE public.form_submissions
    DROP COLUMN IF EXISTS consent_type;
