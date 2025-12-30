-- =====================================================
-- Widget Testimonials Junction Table Creation
-- =====================================================
-- Purpose: Many-to-many junction between widgets and testimonials with ordering
-- Dependencies: nanoid, organizations, widgets, testimonials, users

CREATE TABLE public.widget_testimonials (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & relationships (many-to-many junction)
    organization_id     TEXT NOT NULL,
    widget_id           TEXT NOT NULL,
    testimonial_id      TEXT NOT NULL,

    -- Display settings
    display_order       SMALLINT NOT NULL,
    is_featured         BOOLEAN NOT NULL DEFAULT false,

    -- Audit trail
    added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    added_by            TEXT,

    -- Constraints
    CONSTRAINT widget_testimonials_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_widget_fk
        FOREIGN KEY (widget_id) REFERENCES public.widgets(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES public.testimonials(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_added_by_fk
        FOREIGN KEY (added_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT widget_testimonials_unique
        UNIQUE (widget_id, testimonial_id),
    CONSTRAINT widget_testimonials_order_unique
        UNIQUE (widget_id, display_order)
);

-- Indexes
CREATE INDEX idx_widget_testimonials_org ON public.widget_testimonials(organization_id);
CREATE INDEX idx_widget_testimonials_widget ON public.widget_testimonials(widget_id);
CREATE INDEX idx_widget_testimonials_testimonial ON public.widget_testimonials(testimonial_id);
CREATE INDEX idx_widget_testimonials_order ON public.widget_testimonials(widget_id, display_order);

-- Table comment
COMMENT ON TABLE public.widget_testimonials IS 'Widget-Testimonial many-to-many junction with ordering and featured flag';

-- Column comments
COMMENT ON COLUMN public.widget_testimonials.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.widget_testimonials.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN public.widget_testimonials.widget_id IS 'FK to widgets - which widget contains this testimonial';
COMMENT ON COLUMN public.widget_testimonials.testimonial_id IS 'FK to testimonials - which testimonial is displayed';
COMMENT ON COLUMN public.widget_testimonials.display_order IS 'Order in widget display. Unique per widget, starts at 1';
COMMENT ON COLUMN public.widget_testimonials.is_featured IS 'Highlighted/pinned testimonial. Shows differently in UI (e.g., larger card)';
COMMENT ON COLUMN public.widget_testimonials.added_at IS 'When testimonial was added to widget';
COMMENT ON COLUMN public.widget_testimonials.added_by IS 'FK to users - who added this. NULL if auto-added on approval';
