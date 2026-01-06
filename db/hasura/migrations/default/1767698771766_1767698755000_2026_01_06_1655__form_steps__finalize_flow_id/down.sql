-- =====================================================
-- Rollback: Revert flow_id finalization on form_steps
-- =====================================================
-- Purpose: Undoes the finalization of flow_id column.
--          Restores original unique constraint and removes FK.

-- =========================================================================
-- 1. Drop New Unique Constraint
-- =========================================================================
ALTER TABLE public.form_steps
DROP CONSTRAINT IF EXISTS form_steps_flow_order_unique;

-- =========================================================================
-- 2. Restore Old Unique Constraint
-- =========================================================================
-- Restore original: (form_id, step_order) for global ordering
ALTER TABLE public.form_steps
ADD CONSTRAINT form_steps_form_order_unique UNIQUE (form_id, step_order);

-- =========================================================================
-- 3. Drop Foreign Key Constraint
-- =========================================================================
ALTER TABLE public.form_steps
DROP CONSTRAINT IF EXISTS fk_form_steps_flow_id;

-- =========================================================================
-- 4. Make flow_id Nullable Again
-- =========================================================================
ALTER TABLE public.form_steps
ALTER COLUMN flow_id DROP NOT NULL;
