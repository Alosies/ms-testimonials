-- =====================================================
-- Widgets: Remove form_id Column (Rollback)
-- =====================================================

DROP INDEX IF EXISTS public.idx_widgets_form_id;

ALTER TABLE public.widgets
    DROP CONSTRAINT IF EXISTS fk_widgets_form_id;

ALTER TABLE public.widgets
    DROP COLUMN IF EXISTS form_id;
