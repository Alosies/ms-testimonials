-- =====================================================
-- Organization Plans: Add monthly_ai_credits Column
-- =====================================================
-- Purpose: Cache the monthly AI credit allocation from the plan
-- This allows org-specific allocations for enterprise deals and
-- provides quick access without joining to plans table.

-- =========================================================================
-- Add Column
-- =========================================================================

-- Cached copy of monthly AI credits from the linked plan.
-- Used for quick access and to allow org-specific overrides for enterprise deals.
ALTER TABLE public.organization_plans
ADD COLUMN monthly_ai_credits INT NOT NULL DEFAULT 0;

-- =========================================================================
-- Populate Existing Records
-- =========================================================================

-- Copy the monthly_ai_credits value from the linked plan to existing org_plans
UPDATE public.organization_plans op
SET monthly_ai_credits = p.monthly_ai_credits
FROM public.plans p
WHERE op.plan_id = p.id;

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON COLUMN public.organization_plans.monthly_ai_credits IS
  'Cached copy of monthly AI credits from the plan. Updated on plan change. Used to track the org-specific allocation which may differ from plan default for enterprise deals.';
