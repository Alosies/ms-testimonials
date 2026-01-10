-- =====================================================
-- Step Deletion Cascades to Question
-- =====================================================
-- Purpose: When a step is deleted, also delete its associated question.
--          This prevents orphan questions (questions not linked to any step).
--
-- ADR Reference: ADR-009 Flows Table Branching Architecture, Edge Case 4
--
-- Design:
--   - Steps and questions have 1:1 relationship (each step has at most one question)
--   - FK direction: step.question_id → form_questions.id (step references question)
--   - Problem: Deleting step leaves orphan question
--   - Solution: AFTER DELETE trigger cascades step deletion to question
--   - Safety: If question is a branch point (referenced by flows.branch_question_id),
--     the DELETE is blocked by ON DELETE RESTRICT FK constraint
--
-- Flow:
--   1. User deletes step
--   2. AFTER DELETE trigger fires
--   3. Trigger attempts to delete associated question
--   4a. If question is NOT a branch point → question deleted
--   4b. If question IS a branch point → FK RESTRICT blocks, transaction fails
--
-- Dependencies: form_steps table, form_questions table, flows.branch_question_id FK

-- =========================================================================
-- 1. Create Trigger Function
-- =========================================================================

-- Function to cascade step deletion to its associated question.
-- Runs AFTER DELETE to ensure step is fully removed first.
-- The question DELETE may be blocked by flows.branch_question_id FK RESTRICT.
CREATE OR REPLACE FUNCTION delete_step_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Only delete if question_id is not null.
  -- Some step types (welcome, thank_you) don't have questions.
  IF OLD.question_id IS NOT NULL THEN
    -- Attempt to delete the question.
    -- This DELETE will be BLOCKED if:
    --   - Question is referenced by flows.branch_question_id (FK RESTRICT)
    -- The blocking causes the entire transaction to fail,
    -- effectively preventing the step deletion.
    DELETE FROM public.form_questions WHERE id = OLD.question_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 2. Create Trigger
-- =========================================================================

-- AFTER DELETE trigger ensures step is fully deleted before cascading.
-- FOR EACH ROW processes each deleted step individually.
CREATE TRIGGER trg_form_steps_delete_question
AFTER DELETE ON public.form_steps
FOR EACH ROW
EXECUTE FUNCTION delete_step_question();

-- =========================================================================
-- 3. Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON FUNCTION delete_step_question() IS
  'Cascade step deletion to its associated question. Blocked by FK RESTRICT if question is a branch point.';

COMMENT ON TRIGGER trg_form_steps_delete_question ON public.form_steps IS
  'AFTER DELETE trigger that deletes the step question. If question is a branch point, FK RESTRICT blocks deletion.';
