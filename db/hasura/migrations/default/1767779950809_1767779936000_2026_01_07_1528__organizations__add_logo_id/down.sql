-- =====================================================
-- Organizations: Remove logo_id Foreign Key (Rollback)
-- =====================================================

-- Drop index first
DROP INDEX IF EXISTS public.idx_organizations_logo_id;

-- Drop foreign key constraint
ALTER TABLE public.organizations
    DROP CONSTRAINT IF EXISTS fk_organizations_logo_id;

-- Drop the column
ALTER TABLE public.organizations
    DROP COLUMN IF EXISTS logo_id;
