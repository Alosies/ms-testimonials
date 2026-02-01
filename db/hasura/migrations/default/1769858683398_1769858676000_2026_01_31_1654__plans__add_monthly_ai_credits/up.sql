-- =====================================================
-- Add monthly_ai_credits column to plans table
-- =====================================================
-- Purpose: Track the number of AI credits allocated per billing period for each plan.
-- This enables the AI credits system for features like testimonial assembly,
-- smart prompts, and other AI-powered capabilities.

-- =========================================================================
-- Add Column
-- =========================================================================

-- Number of AI credits allocated per billing period.
-- Default is 0 for backward compatibility with existing plans.
ALTER TABLE public.plans
ADD COLUMN monthly_ai_credits INT NOT NULL DEFAULT 0;

-- =========================================================================
-- Update Existing Plans with Credit Allocations
-- =========================================================================

-- Free plan: 10 credits/month (limited AI usage)
UPDATE public.plans SET monthly_ai_credits = 10 WHERE unique_name = 'free';

-- Pro plan: 500 credits/month (standard AI usage)
UPDATE public.plans SET monthly_ai_credits = 500 WHERE unique_name = 'pro';

-- Team plan: 2000 credits/month (high-volume AI usage)
UPDATE public.plans SET monthly_ai_credits = 2000 WHERE unique_name = 'team';

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.plans.monthly_ai_credits IS
  'Number of AI credits allocated per billing period for this plan. Free=10, Pro=500, Team=2000. Credits are consumed by AI features like testimonial assembly and smart prompts.';
