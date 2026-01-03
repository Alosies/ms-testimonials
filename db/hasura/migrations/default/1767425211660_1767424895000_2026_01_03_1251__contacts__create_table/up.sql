-- =====================================================
-- Contacts Table Creation
-- =====================================================
-- Purpose: Normalized contact data for testimonial submitters.
--          Enables contact management, deduplication, and tracking of repeat submissions.
--          A contact is unique per email within an organization.
-- Dependencies: generate_nanoid_12(), add_updated_at_trigger(), organizations, forms

CREATE TABLE public.contacts (
    -- Primary key (NanoID 12-char)
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- Foreign key to organization. Establishes tenant boundary for multi-tenancy.
    -- All contacts are scoped to a single organization.
    organization_id TEXT NOT NULL,

    -- Primary identifier for the contact. Unique per organization.
    -- Used for deduplication when same person submits multiple testimonials.
    email TEXT NOT NULL,

    -- Whether the email has been verified (e.g., via confirmation link).
    -- Verified contacts may receive different treatment in displays.
    email_verified BOOLEAN NOT NULL DEFAULT false,

    -- Display name of the contact. May be collected from form submission
    -- or enriched from external sources.
    name TEXT,

    -- URL to the contact's profile photo or avatar.
    -- Used in testimonial displays for social proof.
    avatar_url TEXT,

    -- Professional title (e.g., "Senior Developer", "CEO").
    -- Adds credibility context to testimonials.
    job_title TEXT,

    -- Name of the company/organization the contact works for.
    -- Used for B2B testimonial displays.
    company_name TEXT,

    -- URL to the contact's company website.
    -- May be used for logo fetching or verification.
    company_website TEXT,

    -- URL to the contact's LinkedIn profile.
    -- Provides verification and professional context.
    linkedin_url TEXT,

    -- URL to the contact's Twitter/X profile.
    -- Used for social sharing and verification.
    twitter_url TEXT,

    -- How this contact record was created.
    -- 'form_submission': Created when someone submitted a testimonial form
    -- 'import': Bulk imported from external source (CSV, API)
    -- 'manual': Manually created by organization admin
    source TEXT NOT NULL DEFAULT 'form_submission' CHECK (source IN (
        'form_submission', 'import', 'manual'
    )),

    -- Foreign key to the first form this contact submitted.
    -- Used for attribution tracking to understand which forms generate contacts.
    source_form_id TEXT,

    -- Timestamp when this contact first interacted with the organization.
    -- Set on creation, never modified.
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp of the contact's most recent activity.
    -- Updated when they submit new testimonials or interact with forms.
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Count of testimonials/submissions from this contact.
    -- Incremented on each new submission for engagement tracking.
    submission_count INT NOT NULL DEFAULT 1,

    -- Timestamp when this contact record was created
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp when this contact was last modified (auto-updated by trigger)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),

    -- Ensure one contact per email per organization for deduplication
    CONSTRAINT contacts_org_email_unique UNIQUE (organization_id, email)
);

-- Foreign key: Link to organization with cascade delete (when org deleted, contacts go too)
ALTER TABLE public.contacts
    ADD CONSTRAINT fk_contacts_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: Link to source form (set null if form deleted, preserve contact)
ALTER TABLE public.contacts
    ADD CONSTRAINT fk_contacts_source_form_id
    FOREIGN KEY (source_form_id) REFERENCES public.forms(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for organization-based RLS queries
CREATE INDEX idx_contacts_organization_id ON public.contacts(organization_id);

-- Index for email lookups and deduplication checks
CREATE INDEX idx_contacts_email ON public.contacts(email);

-- Index for sorting contacts by recent activity
CREATE INDEX idx_contacts_last_seen_at ON public.contacts(last_seen_at DESC);

-- Trigger to automatically update updated_at timestamp on any modification
SELECT add_updated_at_trigger('contacts', 'public');

-- Table-level documentation
COMMENT ON TABLE public.contacts IS 'Normalized contact data for testimonial submitters. Enables contact management, deduplication across forms, and tracking of repeat submissions within an organization.';

-- Column-level documentation
COMMENT ON COLUMN public.contacts.id IS 'Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification.';
COMMENT ON COLUMN public.contacts.organization_id IS 'Foreign key to organizations table. Establishes tenant boundary - all contacts are scoped to a single organization for multi-tenancy isolation.';
COMMENT ON COLUMN public.contacts.email IS 'Primary identifier for the contact. Unique within each organization. Used for deduplication when same person submits multiple testimonials across different forms.';
COMMENT ON COLUMN public.contacts.email_verified IS 'Boolean flag indicating if email ownership has been confirmed via verification link. Verified contacts may receive preferential display treatment.';
COMMENT ON COLUMN public.contacts.name IS 'Display name of the contact. Collected from form submission contact_info step or enriched from external data sources like LinkedIn.';
COMMENT ON COLUMN public.contacts.avatar_url IS 'URL to profile photo or avatar image. Displayed alongside testimonials for visual social proof and authenticity.';
COMMENT ON COLUMN public.contacts.job_title IS 'Professional title or role (e.g., "VP of Engineering", "Founder"). Adds credibility context to testimonials, especially for B2B use cases.';
COMMENT ON COLUMN public.contacts.company_name IS 'Name of the company or organization where the contact works. Used for B2B testimonial displays and logo integration.';
COMMENT ON COLUMN public.contacts.company_website IS 'URL to the contact''s company website. May be used for automated logo fetching or company verification.';
COMMENT ON COLUMN public.contacts.linkedin_url IS 'URL to LinkedIn profile. Provides professional verification and enables social proof through platform recognition.';
COMMENT ON COLUMN public.contacts.twitter_url IS 'URL to Twitter/X profile. Used for social sharing integration and additional verification of contact identity.';
COMMENT ON COLUMN public.contacts.source IS 'Origin of this contact record: form_submission (created during testimonial submission), import (bulk CSV/API import), manual (admin created). Used for analytics and attribution.';
COMMENT ON COLUMN public.contacts.source_form_id IS 'Foreign key to forms table. References the first form through which this contact was acquired. Preserved even if form is later deleted (set null).';
COMMENT ON COLUMN public.contacts.first_seen_at IS 'Timestamp of first interaction with the organization. Set on creation and never modified. Used for cohort analysis and engagement metrics.';
COMMENT ON COLUMN public.contacts.last_seen_at IS 'Timestamp of most recent activity. Updated on each new submission or interaction. Used for identifying active vs dormant contacts.';
COMMENT ON COLUMN public.contacts.submission_count IS 'Running count of testimonials submitted by this contact. Incremented on each new submission. Identifies power users and repeat customers.';
COMMENT ON COLUMN public.contacts.created_at IS 'Timestamp when this contact record was first created. Set automatically on insert, never modified thereafter.';
COMMENT ON COLUMN public.contacts.updated_at IS 'Timestamp of last modification to this record. Automatically updated by database trigger on any column change.';
