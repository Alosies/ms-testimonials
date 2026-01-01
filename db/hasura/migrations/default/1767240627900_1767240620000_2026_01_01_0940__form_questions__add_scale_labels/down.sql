-- =====================================================
-- Remove Scale Label Columns from form_questions
-- =====================================================

ALTER TABLE public.form_questions DROP COLUMN IF EXISTS scale_min_label;
ALTER TABLE public.form_questions DROP COLUMN IF EXISTS scale_max_label;
