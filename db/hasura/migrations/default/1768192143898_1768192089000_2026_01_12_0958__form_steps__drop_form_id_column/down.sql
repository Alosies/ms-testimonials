-- =====================================================
-- Restore form_id Column to Form Steps Table
-- =====================================================

-- Add column back
ALTER TABLE public.form_steps ADD COLUMN form_id TEXT;

-- Add FK constraint
ALTER TABLE public.form_steps
ADD CONSTRAINT fk_form_steps_form_id
FOREIGN KEY (form_id) REFERENCES public.forms(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add index
CREATE INDEX idx_form_steps_form_id ON public.form_steps(form_id);
