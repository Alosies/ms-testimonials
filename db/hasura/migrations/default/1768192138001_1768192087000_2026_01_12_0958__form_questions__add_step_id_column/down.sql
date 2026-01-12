-- =====================================================
-- Remove step_id Column from Form Questions Table
-- =====================================================

-- Drop indexes
DROP INDEX IF EXISTS public.idx_form_questions_step_id_unique;
DROP INDEX IF EXISTS public.idx_form_questions_step_id;

-- Drop FK constraint
ALTER TABLE public.form_questions DROP CONSTRAINT IF EXISTS fk_form_questions_step_id;

-- Drop column
ALTER TABLE public.form_questions DROP COLUMN IF EXISTS step_id;
