-- =====================================================
-- Remove form_id Column from Form Steps Table
-- =====================================================
-- Purpose: Steps belong to flows only. The form can be derived via
--          step.flow.form_id. Removing this denormalized column
--          establishes clean ownership hierarchy.
-- Dependencies: form_steps.flow_id exists and is the true parent

-- =========================================================================
-- Drop Constraints and Indexes
-- =========================================================================

-- Drop FK constraint (may have different names)
ALTER TABLE public.form_steps DROP CONSTRAINT IF EXISTS fk_form_steps_form_id;
ALTER TABLE public.form_steps DROP CONSTRAINT IF EXISTS form_steps_form_id_fkey;

-- Drop indexes that reference form_id
DROP INDEX IF EXISTS public.idx_form_steps_form_id;
DROP INDEX IF EXISTS public.idx_form_steps_form_order;

-- Drop unique constraint that includes form_id (if exists)
ALTER TABLE public.form_steps DROP CONSTRAINT IF EXISTS form_steps_flow_order_unique;

-- =========================================================================
-- Add New Constraint
-- =========================================================================

-- New unique constraint: (flow_id, step_order) only
-- Steps within a flow must have unique order.
ALTER TABLE public.form_steps
ADD CONSTRAINT form_steps_flow_order_unique
UNIQUE (flow_id, step_order);

-- =========================================================================
-- Drop Column
-- =========================================================================

ALTER TABLE public.form_steps DROP COLUMN IF EXISTS form_id;

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON TABLE public.form_steps IS
  'Form steps belong to flows. Derive form via step.flow.form_id. Clean ownership: flow → step.';

COMMENT ON CONSTRAINT form_steps_flow_order_unique ON public.form_steps IS
  'Ensures unique step ordering within each flow.';
