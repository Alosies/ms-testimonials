-- =====================================================
-- Forms: Remove Status Column (Rollback)
-- =====================================================

-- Drop index
DROP INDEX IF EXISTS public.idx_forms_organization_status;

-- Drop column (constraint is dropped automatically with the column)
ALTER TABLE public.forms
DROP COLUMN IF EXISTS status;
