-- =====================================================
-- Remove form_id Column from Form Questions Table
-- =====================================================
-- Purpose: Questions belong to steps only. The form can be derived via
--          question.step.flow.form_id. Removing this denormalized column
--          establishes clean ownership hierarchy.
-- Dependencies: form_questions.step_id exists and is the true parent

-- =========================================================================
-- Drop Constraints and Indexes
-- =========================================================================

-- Drop FK constraint (may have different names)
ALTER TABLE public.form_questions DROP CONSTRAINT IF EXISTS form_questions_form_fk;
ALTER TABLE public.form_questions DROP CONSTRAINT IF EXISTS form_questions_form_id_fkey;
ALTER TABLE public.form_questions DROP CONSTRAINT IF EXISTS fk_form_questions_form_id;

-- Drop indexes that reference form_id
DROP INDEX IF EXISTS public.idx_form_questions_form;
DROP INDEX IF EXISTS public.idx_form_questions_form_id;
DROP INDEX IF EXISTS public.idx_form_questions_order;

-- Drop unique constraint that includes form_id (if exists)
ALTER TABLE public.form_questions DROP CONSTRAINT IF EXISTS form_questions_order_per_form_unique;

-- =========================================================================
-- Drop Column
-- =========================================================================

ALTER TABLE public.form_questions DROP COLUMN IF EXISTS form_id;

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON TABLE public.form_questions IS
  'Form questions belong to steps. Derive form via question.step.flow.form_id. Clean ownership: step → question.';
