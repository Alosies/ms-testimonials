-- =====================================================
-- User Identities Table Rollback
-- =====================================================

-- Remove trigger
SELECT remove_updated_at_trigger('user_identities', 'public');

-- Drop indexes
DROP INDEX IF EXISTS public.idx_user_identities_user;
DROP INDEX IF EXISTS public.idx_user_identities_lookup;
DROP INDEX IF EXISTS public.idx_user_identities_one_primary;

-- Drop table
DROP TABLE IF EXISTS public.user_identities CASCADE;
