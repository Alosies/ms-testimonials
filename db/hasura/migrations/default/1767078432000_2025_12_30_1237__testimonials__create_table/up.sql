-- =====================================================
-- Testimonials Table Creation
-- =====================================================
-- Purpose: Displayable testimonial entity - curated quote, rating, customer info
-- Dependencies: nanoid, updated_at, organizations, form_submissions, users

CREATE TABLE public.testimonials (
    -- Primary key
    id                      TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & relationships
    organization_id         TEXT NOT NULL,
    submission_id           TEXT,

    -- Workflow status
    status                  TEXT NOT NULL DEFAULT 'pending',

    -- The displayable content
    content                 TEXT,
    rating                  SMALLINT,

    -- Customer info (copied from submission OR entered manually for imports)
    customer_name           TEXT NOT NULL,
    customer_email          TEXT NOT NULL,
    customer_title          TEXT,
    customer_company        TEXT,
    customer_avatar_url     TEXT,
    customer_linkedin_url   TEXT,
    customer_twitter_url    TEXT,

    -- Source tracking
    source                  TEXT NOT NULL DEFAULT 'form',
    source_metadata         JSONB,

    -- Approval audit trail
    approved_by             TEXT,
    approved_at             TIMESTAMPTZ,
    rejected_by             TEXT,
    rejected_at             TIMESTAMPTZ,
    rejection_reason        TEXT,

    -- Audit: who & when
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by              TEXT,

    -- Constraints
    CONSTRAINT testimonials_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT testimonials_submission_fk
        FOREIGN KEY (submission_id) REFERENCES public.form_submissions(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_approved_by_fk
        FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_rejected_by_fk
        FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT testimonials_rating_check
        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    CONSTRAINT testimonials_source_check
        CHECK (source IN ('form', 'import', 'manual')),
    CONSTRAINT testimonials_email_format
        CHECK (customer_email ~* '^.+@.+\..+$'),
    CONSTRAINT testimonials_linkedin_url_format
        CHECK (customer_linkedin_url IS NULL OR customer_linkedin_url ~* '^https?://(www\.)?linkedin\.com/'),
    CONSTRAINT testimonials_twitter_url_format
        CHECK (customer_twitter_url IS NULL OR customer_twitter_url ~* '^https?://(www\.)?(twitter\.com|x\.com)/')
);

-- Indexes
CREATE INDEX idx_testimonials_org ON public.testimonials(organization_id);
CREATE INDEX idx_testimonials_submission ON public.testimonials(submission_id) WHERE submission_id IS NOT NULL;
CREATE INDEX idx_testimonials_status ON public.testimonials(organization_id, status);
CREATE INDEX idx_testimonials_approved ON public.testimonials(organization_id, created_at DESC) WHERE status = 'approved';

-- Trigger
SELECT add_updated_at_trigger('testimonials', 'public');

-- Table comment
COMMENT ON TABLE public.testimonials IS 'Displayable testimonial entity - quote, rating, customer info. Widgets display these.';

-- Column comments
COMMENT ON COLUMN public.testimonials.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.testimonials.organization_id IS 'FK to organizations - tenant boundary for isolation';
COMMENT ON COLUMN public.testimonials.submission_id IS 'FK to form_submissions - NULL for imports/manual. Access form via submission.form_id';
COMMENT ON COLUMN public.testimonials.status IS 'Workflow: pending (new), approved (shown on widgets), rejected (hidden)';
COMMENT ON COLUMN public.testimonials.content IS 'The testimonial quote - AI-assembled from form responses or imported text';
COMMENT ON COLUMN public.testimonials.rating IS 'Star rating 1-5. Copied from form response or entered manually';
COMMENT ON COLUMN public.testimonials.customer_name IS 'Full name displayed on widgets. Copied from submission or entered for imports';
COMMENT ON COLUMN public.testimonials.customer_email IS 'Email for follow-up. NOT displayed on widgets';
COMMENT ON COLUMN public.testimonials.customer_title IS 'Job title displayed on widgets (e.g., "Product Manager")';
COMMENT ON COLUMN public.testimonials.customer_company IS 'Company name displayed on widgets (e.g., "Acme Inc")';
COMMENT ON COLUMN public.testimonials.customer_avatar_url IS 'Profile photo URL displayed on widgets';
COMMENT ON COLUMN public.testimonials.customer_linkedin_url IS 'LinkedIn profile URL - clickable social proof link';
COMMENT ON COLUMN public.testimonials.customer_twitter_url IS 'Twitter/X profile URL - clickable social proof link';
COMMENT ON COLUMN public.testimonials.source IS 'Origin: form (via submission), import (Twitter/LinkedIn), manual (typed by owner)';
COMMENT ON COLUMN public.testimonials.source_metadata IS 'Import metadata (tweet_id, original_url, etc.). JSONB appropriate here';
COMMENT ON COLUMN public.testimonials.approved_by IS 'FK to users - who approved. NULL if pending/rejected';
COMMENT ON COLUMN public.testimonials.approved_at IS 'When approved. NULL if pending/rejected';
COMMENT ON COLUMN public.testimonials.rejected_by IS 'FK to users - who rejected. NULL if pending/approved';
COMMENT ON COLUMN public.testimonials.rejected_at IS 'When rejected. NULL if pending/approved';
COMMENT ON COLUMN public.testimonials.rejection_reason IS 'Internal note. Not shown to customer';
COMMENT ON COLUMN public.testimonials.created_at IS 'When created. Immutable';
COMMENT ON COLUMN public.testimonials.updated_at IS 'Last modification. Auto-updated by trigger';
COMMENT ON COLUMN public.testimonials.updated_by IS 'FK to users - who last modified. NULL until first update';
