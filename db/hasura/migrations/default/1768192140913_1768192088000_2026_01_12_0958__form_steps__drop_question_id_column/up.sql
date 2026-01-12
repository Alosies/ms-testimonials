-- =====================================================
-- Remove question_id Column from Form Steps Table
-- =====================================================
-- Purpose: The step-question relationship has been inverted.
--          Questions now reference steps via step_id column.
--          This column is no longer needed.
-- Dependencies: form_questions.step_id column exists

-- =========================================================================
-- Drop Constraints and Indexes
-- =========================================================================

-- Drop FK constraint (may have different names depending on creation)
ALTER TABLE public.form_steps DROP CONSTRAINT IF EXISTS fk_form_steps_question_id;
ALTER TABLE public.form_steps DROP CONSTRAINT IF EXISTS form_steps_question_id_fkey;

-- Drop index
DROP INDEX IF EXISTS public.idx_form_steps_question_id;

-- =========================================================================
-- Drop Column
-- =========================================================================

ALTER TABLE public.form_steps DROP COLUMN IF EXISTS question_id;

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON TABLE public.form_steps IS
  'Form steps belong to flows. Questions now reference steps via form_questions.step_id (inverted relationship).';
