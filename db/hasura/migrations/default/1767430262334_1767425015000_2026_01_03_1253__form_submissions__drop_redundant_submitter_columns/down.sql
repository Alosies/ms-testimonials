-- =====================================================
-- Form Submissions: Restore Submitter Columns (Rollback)
-- =====================================================
-- Restores the submitter_* columns that were removed.
-- Note: Data cannot be automatically restored - columns will be empty.

-- Restore submitter_name column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_name TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_name IS 'Full name of person who submitted. Source of truth for customer identity';

-- Restore submitter_email column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_email TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_email IS 'Email for follow-up. NOT displayed publicly on widgets';

-- Restore submitter_title column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_title TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_title IS 'Job title like "Product Manager". Copied to testimonial for display';

-- Restore submitter_company column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_company TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_company IS 'Company name like "Acme Inc". Copied to testimonial for display';

-- Restore submitter_avatar_url column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_avatar_url TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_avatar_url IS 'Profile photo URL. From Gravatar or upload';

-- Restore submitter_linkedin_url column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_linkedin_url TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_linkedin_url IS 'LinkedIn profile URL for social proof verification';

-- Restore submitter_twitter_url column
ALTER TABLE public.form_submissions
    ADD COLUMN submitter_twitter_url TEXT;
COMMENT ON COLUMN public.form_submissions.submitter_twitter_url IS 'Twitter/X profile URL for social proof verification';
