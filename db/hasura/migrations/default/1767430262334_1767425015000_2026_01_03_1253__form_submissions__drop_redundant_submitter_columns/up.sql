-- =====================================================
-- Form Submissions: Drop Redundant Submitter Columns
-- =====================================================
-- Purpose: Removes submitter_* columns that are now redundant with the contacts table.
--          Contact information is now normalized in the contacts table and linked
--          via contact_id. This eliminates data duplication and ensures a single
--          source of truth for contact data.
--
-- Removed columns:
--   - submitter_name: Now stored in contacts.name
--   - submitter_email: Now stored in contacts.email
--   - submitter_title: Now stored in contacts.job_title
--   - submitter_company: Now stored in contacts.company_name
--   - submitter_avatar_url: Now stored in contacts.avatar_url
--   - submitter_linkedin_url: Now stored in contacts.linkedin_url
--   - submitter_twitter_url: Now stored in contacts.twitter_url
--
-- Note: testimonials.customer_* fields are NOT removed as they serve as
--       display fields that can be edited independently for widget rendering.
--
-- Dependencies: contacts table must exist, contact_id column must be added

-- Drop the redundant columns
ALTER TABLE public.form_submissions
    DROP COLUMN IF EXISTS submitter_name,
    DROP COLUMN IF EXISTS submitter_email,
    DROP COLUMN IF EXISTS submitter_title,
    DROP COLUMN IF EXISTS submitter_company,
    DROP COLUMN IF EXISTS submitter_avatar_url,
    DROP COLUMN IF EXISTS submitter_linkedin_url,
    DROP COLUMN IF EXISTS submitter_twitter_url;
