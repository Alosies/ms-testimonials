-- =====================================================
-- AI Capabilities Table Rollback
-- =====================================================

-- Remove updated_at trigger
SELECT remove_updated_at_trigger('ai_capabilities', 'public');

-- Drop indexes (will be dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS public.idx_ai_capabilities_category;
DROP INDEX IF EXISTS public.idx_ai_capabilities_is_active;

-- Drop table (CASCADE removes any dependent objects)
DROP TABLE IF EXISTS public.ai_capabilities CASCADE;
