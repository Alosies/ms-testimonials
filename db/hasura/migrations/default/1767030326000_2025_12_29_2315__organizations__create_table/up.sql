-- =====================================================
-- Organizations Table Creation
-- =====================================================
-- Purpose: Tenant boundary - plan subscription via organization_plans
-- Dependencies: users table

CREATE TABLE public.organizations (
    id              TEXT NOT NULL DEFAULT generate_nanoid_12(),
    name            TEXT NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    logo_url        TEXT,
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_by      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT organizations_slug_unique UNIQUE (slug),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    CONSTRAINT organizations_created_by_fk
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE UNIQUE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_active ON public.organizations(id) WHERE is_active = true;
CREATE INDEX idx_organizations_created_by ON public.organizations(created_by);

-- Trigger
SELECT add_updated_at_trigger('organizations', 'public');

-- Documentation
COMMENT ON TABLE public.organizations IS 'Tenant boundary - plan subscription via organization_plans';
COMMENT ON COLUMN public.organizations.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.organizations.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN public.organizations.settings IS 'UI preferences only (theme, locale) - not business logic';
