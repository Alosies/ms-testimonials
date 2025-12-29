-- =====================================================
-- Users Table Rollback
-- =====================================================

-- Remove trigger
SELECT remove_updated_at_trigger('users', 'public');

-- Drop indexes
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_active;

-- Drop table
DROP TABLE IF EXISTS public.users CASCADE;
