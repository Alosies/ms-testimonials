-- =====================================================
-- Remove Step-Question Cascade Trigger
-- =====================================================

DROP TRIGGER IF EXISTS trg_form_steps_delete_question ON public.form_steps;
DROP FUNCTION IF EXISTS delete_step_question();
