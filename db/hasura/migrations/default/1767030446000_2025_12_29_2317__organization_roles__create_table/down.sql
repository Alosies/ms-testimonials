-- =====================================================
-- Organization Roles Table Rollback
-- =====================================================

SELECT remove_updated_at_trigger('organization_roles', 'public');

DROP INDEX IF EXISTS public.idx_org_roles_one_default;
DROP INDEX IF EXISTS public.idx_org_roles_active;
DROP INDEX IF EXISTS public.idx_org_roles_role;
DROP INDEX IF EXISTS public.idx_org_roles_org;
DROP INDEX IF EXISTS public.idx_org_roles_user;

DROP TABLE IF EXISTS public.organization_roles CASCADE;
