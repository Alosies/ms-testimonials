-- =====================================================
-- Remove is_primary Column from Flows Table
-- =====================================================

-- Drop constraints first
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_branch_requires_conditions;
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_primary_no_branch;

-- Drop index
DROP INDEX IF EXISTS public.idx_flows_primary_per_form;

-- Drop column
ALTER TABLE public.flows DROP COLUMN IF EXISTS is_primary;
