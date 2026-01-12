-- =====================================================
-- Remove Cascade Trigger from Form Steps Table
-- =====================================================
-- Purpose: The trigger that deleted questions when steps were deleted
--          is no longer needed. The FK cascade on form_questions.step_id
--          now handles this automatically.
-- Dependencies: form_questions.step_id FK with CASCADE exists

-- =========================================================================
-- Drop Trigger and Function
-- =========================================================================

-- Drop the trigger
DROP TRIGGER IF EXISTS trg_form_steps_delete_question ON public.form_steps;

-- Drop the function (may have different names)
DROP FUNCTION IF EXISTS delete_step_question();
DROP FUNCTION IF EXISTS fn_form_steps_delete_question();

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON TABLE public.form_steps IS
  'Form steps belong to flows. Question deletion handled by FK cascade on form_questions.step_id.';
