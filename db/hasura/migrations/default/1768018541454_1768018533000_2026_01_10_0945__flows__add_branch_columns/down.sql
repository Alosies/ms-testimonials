-- =====================================================
-- Remove Flattened Branch Columns from Flows
-- =====================================================

-- Restore legacy column
ALTER TABLE public.flows
ADD COLUMN branch_condition JSONB;

-- Drop FK constraint
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS fk_flows_branch_question;

-- Drop CHECK constraints
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_branch_field;
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_branch_operator;
ALTER TABLE public.flows DROP CONSTRAINT IF EXISTS chk_flows_condition_completeness;

-- Drop index
DROP INDEX IF EXISTS public.idx_flows_branch_question_id;

-- Drop columns
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_question_id;
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_field;
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_operator;
ALTER TABLE public.flows DROP COLUMN IF EXISTS branch_value;
