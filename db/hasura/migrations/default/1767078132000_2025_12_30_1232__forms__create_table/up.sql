-- =====================================================
-- Forms Table Creation
-- =====================================================
-- Purpose: Testimonial collection forms with AI context
-- Dependencies: nanoid, updated_at, organizations, users

CREATE TABLE public.forms (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & multi-tenancy
    organization_id     TEXT NOT NULL,

    -- Audit: who & when
    created_by          TEXT NOT NULL,
    updated_by          TEXT,

    -- Form identity
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL,

    -- AI context (Infer, Don't Ask philosophy)
    product_name        TEXT NOT NULL,
    product_description TEXT,

    -- UI preferences
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- State & timestamps
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT forms_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT forms_created_by_fk
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT forms_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT forms_slug_per_org_unique
        UNIQUE (organization_id, slug),
    CONSTRAINT forms_slug_format
        CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

-- Indexes
CREATE INDEX idx_forms_org ON public.forms(organization_id);
CREATE INDEX idx_forms_slug ON public.forms(organization_id, slug);
CREATE INDEX idx_forms_active ON public.forms(organization_id) WHERE is_active = true;

-- Trigger
SELECT add_updated_at_trigger('forms', 'public');

-- Table comment
COMMENT ON TABLE public.forms IS 'Testimonial collection forms - questions normalized to form_questions table';

-- Column comments
COMMENT ON COLUMN public.forms.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.forms.organization_id IS 'FK to organizations - tenant boundary for multi-tenancy isolation';
COMMENT ON COLUMN public.forms.created_by IS 'FK to users - user who created this form';
COMMENT ON COLUMN public.forms.updated_by IS 'FK to users - user who last modified. NULL until first update';
COMMENT ON COLUMN public.forms.name IS 'Form display name shown in dashboard (e.g., "Product Feedback Form")';
COMMENT ON COLUMN public.forms.slug IS 'URL-friendly identifier for public form link (/f/{slug}). Lowercase alphanumeric with hyphens';
COMMENT ON COLUMN public.forms.product_name IS 'Name of product being reviewed - used in question templates (e.g., "How did {product} help?")';
COMMENT ON COLUMN public.forms.product_description IS 'AI context for question generation - enables "Infer, Don''t Ask" philosophy';
COMMENT ON COLUMN public.forms.settings IS 'UI preferences only (theme colors, branding) - NOT business logic. JSONB appropriate here';
COMMENT ON COLUMN public.forms.is_active IS 'Soft delete flag. False = form disabled, public link returns 404';
COMMENT ON COLUMN public.forms.created_at IS 'Timestamp when form was created. Immutable after insert';
COMMENT ON COLUMN public.forms.updated_at IS 'Timestamp of last modification. Auto-updated by trigger';
