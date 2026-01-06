-- =====================================================
-- Flows Table Rollback
-- =====================================================
-- Purpose: Reverts the flows table creation.
-- This migration removes the flows table and all associated
-- indexes, constraints, and triggers.

-- =========================================================================
-- Remove Trigger
-- =========================================================================
SELECT remove_updated_at_trigger('flows', 'public');

-- =========================================================================
-- Drop Indexes
-- =========================================================================
DROP INDEX IF EXISTS public.idx_flows_form_order;
DROP INDEX IF EXISTS public.idx_flows_organization_id;
DROP INDEX IF EXISTS public.idx_flows_form_id;

-- =========================================================================
-- Drop Table (cascades constraints and foreign keys)
-- =========================================================================
DROP TABLE IF EXISTS public.flows CASCADE;
