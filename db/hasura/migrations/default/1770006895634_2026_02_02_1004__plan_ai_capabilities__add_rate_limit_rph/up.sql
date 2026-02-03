-- Add rate_limit_rph (requests per hour) column to plan_ai_capabilities
-- ADR Reference: ADR-023 AI Capabilities Plan Integration

ALTER TABLE public.plan_ai_capabilities
ADD COLUMN rate_limit_rph INT;

COMMENT ON COLUMN public.plan_ai_capabilities.rate_limit_rph IS
  'Maximum requests per hour for this capability on this plan. NULL means unlimited.';
