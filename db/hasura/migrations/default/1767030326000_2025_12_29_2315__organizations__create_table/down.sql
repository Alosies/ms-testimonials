-- =====================================================
-- Organizations Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('organizations', 'public');

DROP INDEX IF EXISTS public.idx_organizations_created_by;
DROP INDEX IF EXISTS public.idx_organizations_active;
DROP INDEX IF EXISTS public.idx_organizations_slug;

DROP TABLE IF EXISTS public.organizations CASCADE;
