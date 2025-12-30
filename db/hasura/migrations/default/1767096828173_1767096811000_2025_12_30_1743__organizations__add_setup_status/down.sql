-- =====================================================
-- Organizations: Remove setup_status Column (Rollback)
-- =====================================================

-- Remove column from organizations table
ALTER TABLE public.organizations
DROP COLUMN IF EXISTS setup_status;

-- Drop enum type
DROP TYPE IF EXISTS public.organization_setup_status;
