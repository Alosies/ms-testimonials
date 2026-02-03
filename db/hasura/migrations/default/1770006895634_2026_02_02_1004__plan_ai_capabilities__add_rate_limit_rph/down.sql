-- Rollback: Remove rate_limit_rph column from plan_ai_capabilities

ALTER TABLE public.plan_ai_capabilities
DROP COLUMN rate_limit_rph;
