-- =====================================================
-- Form Questions - Convert to Partial Unique Index
-- =====================================================
-- Purpose: Allow deactivated questions to not block new questions with the same key
-- This enables soft-delete + regeneration workflow without unique constraint violations
--
-- Before: UNIQUE (form_id, question_key) - blocks all duplicates regardless of is_active
-- After:  UNIQUE (form_id, question_key) WHERE is_active = true - only active questions must be unique

-- Drop the existing unique constraint
ALTER TABLE public.form_questions
    DROP CONSTRAINT IF EXISTS form_questions_key_per_form_unique;

-- Create partial unique index (only applies to active questions)
CREATE UNIQUE INDEX form_questions_key_per_form_unique
    ON public.form_questions (form_id, question_key)
    WHERE is_active = true;

-- Add comment explaining the partial index
COMMENT ON INDEX public.form_questions_key_per_form_unique IS
    'Ensures unique question_key per form, but only for active questions. Deactivated questions are excluded.';
