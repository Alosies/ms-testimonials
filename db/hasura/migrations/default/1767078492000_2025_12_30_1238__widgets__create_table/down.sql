-- =====================================================
-- Widgets Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('widgets', 'public');

DROP INDEX IF EXISTS public.idx_widgets_org;
DROP INDEX IF EXISTS public.idx_widgets_active;

DROP TABLE IF EXISTS public.widgets CASCADE;
