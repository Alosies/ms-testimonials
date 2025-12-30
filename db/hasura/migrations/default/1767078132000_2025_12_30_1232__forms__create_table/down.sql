-- =====================================================
-- Forms Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('forms', 'public');

DROP INDEX IF EXISTS public.idx_forms_org;
DROP INDEX IF EXISTS public.idx_forms_slug;
DROP INDEX IF EXISTS public.idx_forms_active;

DROP TABLE IF EXISTS public.forms CASCADE;
