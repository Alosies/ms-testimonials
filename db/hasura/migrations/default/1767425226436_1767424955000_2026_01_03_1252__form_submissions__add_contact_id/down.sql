-- =====================================================
-- Form Submissions: Remove Contact Reference (Rollback)
-- =====================================================
-- Removes the contact_id column from form_submissions

-- Drop index first
DROP INDEX IF EXISTS public.idx_form_submissions_contact_id;

-- Drop foreign key constraint
ALTER TABLE public.form_submissions
    DROP CONSTRAINT IF EXISTS fk_form_submissions_contact_id;

-- Drop column
ALTER TABLE public.form_submissions
    DROP COLUMN IF EXISTS contact_id;
