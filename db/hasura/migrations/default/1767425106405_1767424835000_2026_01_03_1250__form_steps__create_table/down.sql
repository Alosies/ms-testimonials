-- =====================================================
-- Form Steps Table Rollback
-- =====================================================
-- Removes the form_steps table and all associated objects

-- Remove the updated_at trigger first
SELECT remove_updated_at_trigger('form_steps', 'public');

-- Drop indexes
DROP INDEX IF EXISTS public.idx_form_steps_form_order;
DROP INDEX IF EXISTS public.idx_form_steps_organization_id;
DROP INDEX IF EXISTS public.idx_form_steps_question_id;
DROP INDEX IF EXISTS public.idx_form_steps_form_id;

-- Drop table (CASCADE handles foreign key constraints)
DROP TABLE IF EXISTS public.form_steps CASCADE;
