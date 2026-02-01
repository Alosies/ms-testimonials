-- =====================================================
-- Initialize Credit Balances for Existing Organizations
-- =====================================================
-- Purpose: Data migration to set up credit balances and initial transactions
--          for all existing organizations in the system.
-- ADR Reference: ADR-023 AI Capabilities Plan Integration (T2.10)
--
-- This migration:
-- 1. Creates organization_credit_balances records for all existing orgs
-- 2. Creates initial plan_allocation transactions
-- 3. Creates welcome bonus (promo_bonus) transactions per plan tier
--
-- Welcome Bonus per Plan:
-- - Free: 10 bonus credits
-- - Pro: 25 bonus credits
-- - Team: 50 bonus credits

-- =========================================================================
-- Step 1: Insert organization_credit_balances for existing organizations
-- =========================================================================
-- This is idempotent - only inserts for orgs that don't already have a balance record.
-- monthly_credits comes from the org's current plan via organization_plans.
-- bonus_credits starts with the welcome bonus based on plan tier.

INSERT INTO public.organization_credit_balances (
    organization_id,
    monthly_credits,
    bonus_credits,
    period_start,
    period_end
)
SELECT
    o.id AS organization_id,
    -- Get monthly_ai_credits from organization_plans (cached value from plan)
    COALESCE(op.monthly_ai_credits, 0) AS monthly_credits,
    -- Welcome bonus based on plan tier
    CASE
        WHEN p.unique_name = 'free' THEN 10
        WHEN p.unique_name = 'pro' THEN 25
        WHEN p.unique_name = 'team' THEN 50
        ELSE 0
    END AS welcome_bonus,
    NOW() AS period_start,
    NOW() + INTERVAL '1 month' AS period_end
FROM public.organizations o
-- Join to get the active organization_plan
JOIN public.organization_plans op ON op.organization_id = o.id
    AND op.status IN ('trial', 'active')
-- Join to get the plan details
JOIN public.plans p ON p.id = op.plan_id
-- Only insert if credit balance doesn't already exist
WHERE NOT EXISTS (
    SELECT 1
    FROM public.organization_credit_balances ocb
    WHERE ocb.organization_id = o.id
);

-- =========================================================================
-- Step 2: Create initial plan_allocation transactions
-- =========================================================================
-- Records the monthly credit allocation as the first transaction.
-- balance_after = monthly_credits + bonus_credits (total starting balance)

INSERT INTO public.credit_transactions (
    organization_id,
    transaction_type,
    credits_amount,
    balance_after,
    description
)
SELECT
    ocb.organization_id,
    'plan_allocation' AS transaction_type,
    ocb.monthly_credits AS credits_amount,
    -- Balance after = monthly + bonus (total available)
    ocb.monthly_credits + ocb.bonus_credits AS balance_after,
    'Initial monthly credit allocation' AS description
FROM public.organization_credit_balances ocb
-- Only create transaction if one doesn't already exist for this org
WHERE NOT EXISTS (
    SELECT 1
    FROM public.credit_transactions ct
    WHERE ct.organization_id = ocb.organization_id
    AND ct.transaction_type = 'plan_allocation'
)
-- Only for orgs with monthly credits > 0
AND ocb.monthly_credits > 0;

-- =========================================================================
-- Step 3: Create initial promo_bonus transactions (welcome bonus)
-- =========================================================================
-- Records the welcome bonus credits as a separate transaction.
-- Only for orgs that have bonus_credits > 0.

INSERT INTO public.credit_transactions (
    organization_id,
    transaction_type,
    credits_amount,
    balance_after,
    description
)
SELECT
    ocb.organization_id,
    'promo_bonus' AS transaction_type,
    ocb.bonus_credits AS credits_amount,
    -- Balance after = monthly + bonus (total available)
    ocb.monthly_credits + ocb.bonus_credits AS balance_after,
    'Welcome bonus credits' AS description
FROM public.organization_credit_balances ocb
-- Only for orgs with bonus credits
WHERE ocb.bonus_credits > 0
-- Only create if transaction doesn't already exist
AND NOT EXISTS (
    SELECT 1
    FROM public.credit_transactions ct
    WHERE ct.organization_id = ocb.organization_id
    AND ct.transaction_type = 'promo_bonus'
    AND ct.description = 'Welcome bonus credits'
);

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON TABLE public.organization_credit_balances IS
  'Tracks credit balance state for each organization. One row per org. Initialized with monthly allocation from plan and welcome bonus. ADR-023.';

-- =========================================================================
-- Verification Queries (for manual checking after migration)
-- =========================================================================
-- Run these queries to verify the migration was successful:
--
-- Check organization_credit_balances created:
-- SELECT COUNT(*) FROM public.organization_credit_balances;
--
-- Check balances by plan:
-- SELECT p.unique_name, COUNT(ocb.id), AVG(ocb.monthly_credits), AVG(ocb.bonus_credits)
-- FROM public.organization_credit_balances ocb
-- JOIN public.organization_plans op ON op.organization_id = ocb.organization_id
-- JOIN public.plans p ON p.id = op.plan_id
-- GROUP BY p.unique_name;
--
-- Check transactions created:
-- SELECT transaction_type, COUNT(*) FROM public.credit_transactions GROUP BY transaction_type;
