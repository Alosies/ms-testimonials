-- =====================================================
-- Add step_id Column to Form Questions Table
-- =====================================================
-- Purpose: Invert the step-question relationship. Instead of steps
--          referencing questions (question_id), questions now reference
--          steps (step_id). This enables proper cascade delete and
--          cleaner ownership hierarchy.
-- Dependencies: form_questions table, form_steps table exist

-- =========================================================================
-- Add Column
-- =========================================================================

-- FK to the step that owns this question.
-- Nullable because steps can exist without questions (welcome, thank_you, consent).
-- When a step is deleted, the question is automatically deleted (CASCADE).
ALTER TABLE public.form_questions
ADD COLUMN step_id TEXT;

-- =========================================================================
-- Foreign Key
-- =========================================================================

-- Cascade delete: when step is deleted, question is deleted.
-- Cascade update: if step ID changes, update the reference.
ALTER TABLE public.form_questions
ADD CONSTRAINT fk_form_questions_step_id
FOREIGN KEY (step_id) REFERENCES public.form_steps(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for efficient lookups by step_id.
CREATE INDEX idx_form_questions_step_id
ON public.form_questions(step_id);

-- Unique constraint: one question per step (1:1 relationship).
-- Partial index: only applies when step_id is not null.
CREATE UNIQUE INDEX idx_form_questions_step_id_unique
ON public.form_questions (step_id)
WHERE step_id IS NOT NULL;

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON COLUMN public.form_questions.step_id IS
  'FK to form_steps. The step that owns this question. Nullable for steps without questions (welcome, thank_you, consent). CASCADE delete removes question when step is deleted.';

COMMENT ON CONSTRAINT fk_form_questions_step_id ON public.form_questions IS
  'Links question to parent step. CASCADE DELETE removes question when step is deleted.';

COMMENT ON INDEX idx_form_questions_step_id IS
  'Supports querying questions by step.';

COMMENT ON INDEX idx_form_questions_step_id_unique IS
  'Enforces 1:1 relationship between steps and questions (one question per step).';
