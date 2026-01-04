-- =====================================================
-- Rollback: Remove branching_config from forms
-- =====================================================

-- Drop column
ALTER TABLE public.forms
DROP COLUMN IF EXISTS branching_config;
