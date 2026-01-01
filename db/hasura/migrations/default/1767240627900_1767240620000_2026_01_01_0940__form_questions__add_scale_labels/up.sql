-- =====================================================
-- Add Scale Label Columns to form_questions
-- =====================================================
-- Purpose: Allow customization of Linear Scale endpoint labels
-- e.g., "Low"/"High", "Strongly disagree"/"Strongly agree"

-- Add scale_min_label column
ALTER TABLE public.form_questions
ADD COLUMN scale_min_label TEXT;

-- Add scale_max_label column
ALTER TABLE public.form_questions
ADD COLUMN scale_max_label TEXT;

-- Documentation
COMMENT ON COLUMN public.form_questions.scale_min_label IS 'Custom label for minimum value on Linear Scale (e.g., "Low", "Strongly disagree"). NULL uses default "Low"';
COMMENT ON COLUMN public.form_questions.scale_max_label IS 'Custom label for maximum value on Linear Scale (e.g., "High", "Strongly agree"). NULL uses default "High"';
