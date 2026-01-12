-- =====================================================
-- Restore Cascade Trigger to Form Steps Table
-- =====================================================

-- Recreate trigger function
CREATE OR REPLACE FUNCTION delete_step_question()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.question_id IS NOT NULL THEN
    DELETE FROM public.form_questions WHERE id = OLD.question_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trg_form_steps_delete_question
AFTER DELETE ON public.form_steps
FOR EACH ROW
EXECUTE FUNCTION delete_step_question();

COMMENT ON FUNCTION delete_step_question IS
  'Deletes the associated question when a step is deleted.';
