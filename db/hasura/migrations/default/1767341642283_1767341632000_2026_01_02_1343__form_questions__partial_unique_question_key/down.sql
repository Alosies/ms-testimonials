-- =====================================================
-- Form Questions - Rollback Partial Unique Index
-- =====================================================
-- Reverts to the original unique constraint that applies to all rows

-- Drop the partial unique index
DROP INDEX IF EXISTS public.form_questions_key_per_form_unique;

-- Restore the original unique constraint
ALTER TABLE public.form_questions
    ADD CONSTRAINT form_questions_key_per_form_unique
    UNIQUE (form_id, question_key);
