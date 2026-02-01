-- =====================================================
-- Organization Plans - Add Pending Change Columns
-- =====================================================
-- Purpose: Add columns for scheduled plan downgrades that take effect at period end
-- Dependencies: plans table must exist

-- =========================================================================
-- Add Pending Plan Change Columns
-- =========================================================================

-- FK to plans table. Set when a downgrade is scheduled to take effect at period end.
-- NULL means no pending change scheduled.
ALTER TABLE public.organization_plans
ADD COLUMN pending_plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL;

-- Timestamp when the pending plan change should be applied.
-- Used by scheduled job to process pending changes at the right time.
ALTER TABLE public.organization_plans
ADD COLUMN pending_change_at TIMESTAMPTZ;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Partial index for the scheduled job that processes pending changes.
-- Only indexes rows with a pending change, making the scheduled job efficient.
CREATE INDEX idx_organization_plans_pending_change
ON public.organization_plans (pending_change_at)
WHERE pending_change_at IS NOT NULL;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.organization_plans.pending_plan_id IS
  'FK to plans table. Set when a downgrade is scheduled to take effect at period end. NULL means no pending change.';

COMMENT ON COLUMN public.organization_plans.pending_change_at IS
  'Timestamp when the pending plan change should be applied. Used by scheduled job to process changes at period end.';

COMMENT ON INDEX idx_organization_plans_pending_change IS
  'Partial index for efficiently querying pending plan changes. Used by scheduled job.';
