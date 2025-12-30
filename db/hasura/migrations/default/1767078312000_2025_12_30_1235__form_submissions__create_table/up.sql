-- =====================================================
-- Form Submissions Table Creation
-- =====================================================
-- Purpose: Raw form submission event capturing submitter info
-- Dependencies: nanoid, updated_at, organizations, forms, users

CREATE TABLE public.form_submissions (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & relationships
    organization_id     TEXT NOT NULL,
    form_id             TEXT NOT NULL,

    -- Submitter info (captured at submission time - source of truth)
    submitter_name      TEXT NOT NULL,
    submitter_email     TEXT NOT NULL,
    submitter_title     TEXT,
    submitter_company   TEXT,
    submitter_avatar_url TEXT,
    submitter_linkedin_url TEXT,
    submitter_twitter_url TEXT,

    -- Timestamps
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          TEXT,

    -- Constraints
    CONSTRAINT form_submissions_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT form_submissions_form_fk
        FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE,
    CONSTRAINT form_submissions_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT form_submissions_email_format
        CHECK (submitter_email ~* '^.+@.+\..+$'),
    CONSTRAINT form_submissions_linkedin_url_format
        CHECK (submitter_linkedin_url IS NULL OR submitter_linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
    CONSTRAINT form_submissions_twitter_url_format
        CHECK (submitter_twitter_url IS NULL OR submitter_twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/')
);

-- Indexes
CREATE INDEX idx_form_submissions_org ON public.form_submissions(organization_id);
CREATE INDEX idx_form_submissions_form ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted ON public.form_submissions(organization_id, submitted_at DESC);

-- Trigger
SELECT add_updated_at_trigger('form_submissions', 'public');

-- Table comment
COMMENT ON TABLE public.form_submissions IS 'Raw form submission event - submitter info lives here, responses in form_question_responses';

-- Column comments
COMMENT ON COLUMN public.form_submissions.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.form_submissions.organization_id IS 'FK to organizations - tenant boundary for isolation';
COMMENT ON COLUMN public.form_submissions.form_id IS 'FK to forms - which form was submitted';
COMMENT ON COLUMN public.form_submissions.submitter_name IS 'Full name of person who submitted. Source of truth for customer identity';
COMMENT ON COLUMN public.form_submissions.submitter_email IS 'Email for follow-up. NOT displayed publicly on widgets';
COMMENT ON COLUMN public.form_submissions.submitter_title IS 'Job title like "Product Manager". Copied to testimonial for display';
COMMENT ON COLUMN public.form_submissions.submitter_company IS 'Company name like "Acme Inc". Copied to testimonial for display';
COMMENT ON COLUMN public.form_submissions.submitter_avatar_url IS 'Profile photo URL. From Gravatar or upload';
COMMENT ON COLUMN public.form_submissions.submitter_linkedin_url IS 'LinkedIn profile URL for social proof verification';
COMMENT ON COLUMN public.form_submissions.submitter_twitter_url IS 'Twitter/X profile URL for social proof verification';
COMMENT ON COLUMN public.form_submissions.submitted_at IS 'When customer submitted the form. Immutable';
COMMENT ON COLUMN public.form_submissions.created_at IS 'Record creation timestamp. Same as submitted_at';
COMMENT ON COLUMN public.form_submissions.updated_at IS 'Last modification. Auto-updated by trigger';
COMMENT ON COLUMN public.form_submissions.updated_by IS 'FK to users - who made admin edits. NULL until first update';
