-- =====================================================
-- Widgets Table Creation
-- =====================================================
-- Purpose: Embeddable widgets for displaying testimonials
-- Dependencies: nanoid, updated_at, organizations, users

CREATE TABLE public.widgets (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership
    organization_id     TEXT NOT NULL,
    created_by          TEXT NOT NULL,

    -- Widget identity
    name                TEXT NOT NULL,
    type                TEXT NOT NULL,
    theme               TEXT NOT NULL DEFAULT 'light',

    -- Display settings (explicit columns, not JSONB)
    show_ratings        BOOLEAN NOT NULL DEFAULT true,
    show_dates          BOOLEAN NOT NULL DEFAULT false,
    show_company        BOOLEAN NOT NULL DEFAULT true,
    show_avatar         BOOLEAN NOT NULL DEFAULT true,
    max_display         SMALLINT,

    -- Type-specific settings (JSONB appropriate - truly varies by type)
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- State & audit
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          TEXT,

    -- Constraints
    CONSTRAINT widgets_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT widgets_created_by_fk
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT widgets_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT widgets_type_check
        CHECK (type IN ('wall_of_love', 'carousel', 'single_quote')),
    CONSTRAINT widgets_theme_check
        CHECK (theme IN ('light', 'dark'))
);

-- Indexes
CREATE INDEX idx_widgets_org ON public.widgets(organization_id);
CREATE INDEX idx_widgets_active ON public.widgets(organization_id) WHERE is_active = true;

-- Trigger
SELECT add_updated_at_trigger('widgets', 'public');

-- Table comment
COMMENT ON TABLE public.widgets IS 'Embeddable widgets - testimonial selections in junction table';

-- Column comments
COMMENT ON COLUMN public.widgets.id IS 'Primary key - NanoID 12-char unique identifier. Used in embed code';
COMMENT ON COLUMN public.widgets.organization_id IS 'FK to organizations - tenant boundary for isolation';
COMMENT ON COLUMN public.widgets.created_by IS 'FK to users - user who created this widget';
COMMENT ON COLUMN public.widgets.name IS 'Display name in dashboard (e.g., "Homepage Carousel", "Footer Wall")';
COMMENT ON COLUMN public.widgets.type IS 'Layout type: wall_of_love (grid), carousel (slider), single_quote (featured)';
COMMENT ON COLUMN public.widgets.theme IS 'Color scheme: light (white bg) or dark (dark bg)';
COMMENT ON COLUMN public.widgets.show_ratings IS 'Whether to display star ratings on testimonial cards';
COMMENT ON COLUMN public.widgets.show_dates IS 'Whether to display submission dates. Usually false for evergreen feel';
COMMENT ON COLUMN public.widgets.show_company IS 'Whether to display customer company name below name';
COMMENT ON COLUMN public.widgets.show_avatar IS 'Whether to display customer avatar/photo';
COMMENT ON COLUMN public.widgets.max_display IS 'Maximum testimonials to display. NULL = show all selected';
COMMENT ON COLUMN public.widgets.settings IS 'Type-specific UI settings - JSONB appropriate. E.g., carousel_speed, columns';
COMMENT ON COLUMN public.widgets.is_active IS 'Soft delete flag. False = embed script returns empty widget';
COMMENT ON COLUMN public.widgets.created_at IS 'Timestamp when widget was created. Immutable';
COMMENT ON COLUMN public.widgets.updated_at IS 'Last modification timestamp. Auto-updated by trigger';
COMMENT ON COLUMN public.widgets.updated_by IS 'FK to users - who last modified. NULL until first update';
