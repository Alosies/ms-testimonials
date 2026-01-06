-- =====================================================
-- Finalize flow_id column on form_steps
-- =====================================================
-- Purpose: Complete the flows migration by making flow_id required,
--          adding foreign key constraint, and updating unique constraint.
--
-- Changes:
--   1. Make flow_id NOT NULL
--   2. Add foreign key constraint to flows table
--   3. Update unique constraint from (form_id, step_order) to (form_id, flow_id, step_order)
--
-- Dependencies: flows table, flow_id column on form_steps

-- =========================================================================
-- 1. Make flow_id NOT NULL
-- =========================================================================
ALTER TABLE public.form_steps
ALTER COLUMN flow_id SET NOT NULL;

-- =========================================================================
-- 2. Add Foreign Key Constraint
-- =========================================================================
-- Link to flows table with cascade delete (when flow is deleted, its steps go too)
ALTER TABLE public.form_steps
ADD CONSTRAINT fk_form_steps_flow_id
FOREIGN KEY (flow_id) REFERENCES public.flows(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- 3. Update Unique Constraint
-- =========================================================================
-- Drop old constraint: (form_id, step_order)
-- This allowed only global ordering across all flows
ALTER TABLE public.form_steps
DROP CONSTRAINT IF EXISTS form_steps_form_order_unique;

-- Add new constraint: (form_id, flow_id, step_order)
-- This allows per-flow ordering: each flow can have steps 0, 1, 2...
ALTER TABLE public.form_steps
ADD CONSTRAINT form_steps_flow_order_unique UNIQUE (form_id, flow_id, step_order);

-- =========================================================================
-- Documentation
-- =========================================================================
COMMENT ON CONSTRAINT form_steps_flow_order_unique ON public.form_steps IS
  'Ensures step_order is unique within each flow of a form, enabling per-flow ordering.';

COMMENT ON CONSTRAINT fk_form_steps_flow_id ON public.form_steps IS
  'Links step to parent flow. Cascade deletes step when flow is removed.';
