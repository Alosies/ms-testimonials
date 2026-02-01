-- =====================================================
-- Plan AI Capabilities Rollback
-- =====================================================
-- Purpose: Reverse the plan_ai_capabilities table creation
-- Removes: trigger, indexes, table (CASCADE handles FKs)

-- Remove updated_at trigger first
SELECT remove_updated_at_trigger('plan_ai_capabilities', 'public');

-- Drop indexes (optional - CASCADE on table will remove them, but explicit is clearer)
DROP INDEX IF EXISTS public.idx_plan_ai_capabilities_plan_id;
DROP INDEX IF EXISTS public.idx_plan_ai_capabilities_ai_capability_id;

-- Drop table with CASCADE to remove any remaining constraints
DROP TABLE IF EXISTS public.plan_ai_capabilities CASCADE;
