-- =====================================================
-- Roles Table Rollback
-- =====================================================

-- Remove trigger
SELECT remove_updated_at_trigger('roles', 'public');

-- Drop table (CASCADE will remove any FK references)
DROP TABLE IF EXISTS public.roles CASCADE;
