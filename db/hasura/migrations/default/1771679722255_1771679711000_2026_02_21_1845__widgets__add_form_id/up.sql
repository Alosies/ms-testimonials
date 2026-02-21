-- =====================================================
-- Widgets: Add form_id Column
-- =====================================================
-- Purpose: Add optional form scoping to widgets.
--          When form_id is set, the widget is scoped to testimonials
--          from that form (free tier default). When NULL, the widget
--          pulls from the entire organization (premium/manual selection).
-- Dependencies: widgets table, forms table

-- =========================================================================
-- Add Column
-- =========================================================================

-- Optional FK to forms table. Scopes testimonial selection to a single form.
-- NULL means org-wide widget (manual testimonial selection via widget_testimonials).
ALTER TABLE public.widgets
    ADD COLUMN form_id TEXT;

-- =========================================================================
-- Foreign Key
-- =========================================================================

-- Link to form with SET NULL on delete.
-- If the linked form is deleted, the widget becomes org-wide rather than breaking.
ALTER TABLE public.widgets
    ADD CONSTRAINT fk_widgets_form_id
    FOREIGN KEY (form_id) REFERENCES public.forms(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Index
-- =========================================================================

-- Index for querying widgets scoped to a specific form.
-- Access pattern: "Get all widgets for form X"
CREATE INDEX idx_widgets_form_id ON public.widgets(form_id)
    WHERE form_id IS NOT NULL;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.widgets.form_id IS
    'Optional FK to forms table. When set, widget is scoped to testimonials from this form (free tier default). NULL = org-wide widget with manual testimonial selection via widget_testimonials junction table.';

COMMENT ON CONSTRAINT fk_widgets_form_id ON public.widgets IS
    'Links widget to a form for scoped testimonial display. SET NULL on delete preserves the widget when the form is removed.';

COMMENT ON INDEX idx_widgets_form_id IS
    'Partial index for querying widgets scoped to a specific form. Excludes NULL form_id rows.';
