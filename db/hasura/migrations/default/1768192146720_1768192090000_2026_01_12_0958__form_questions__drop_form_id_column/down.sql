-- =====================================================
-- Restore form_id Column to Form Questions Table
-- =====================================================

-- Add column back
ALTER TABLE public.form_questions ADD COLUMN form_id TEXT;

-- Add FK constraint
ALTER TABLE public.form_questions
ADD CONSTRAINT form_questions_form_fk
FOREIGN KEY (form_id) REFERENCES public.forms(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index
CREATE INDEX idx_form_questions_form ON public.form_questions(form_id);
