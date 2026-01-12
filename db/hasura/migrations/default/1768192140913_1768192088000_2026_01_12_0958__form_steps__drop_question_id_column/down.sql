-- =====================================================
-- Restore question_id Column to Form Steps Table
-- =====================================================

-- Add column back
ALTER TABLE public.form_steps ADD COLUMN question_id TEXT;

-- Add FK constraint
ALTER TABLE public.form_steps
ADD CONSTRAINT fk_form_steps_question_id
FOREIGN KEY (question_id) REFERENCES public.form_questions(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index
CREATE INDEX idx_form_steps_question_id ON public.form_steps(question_id);
