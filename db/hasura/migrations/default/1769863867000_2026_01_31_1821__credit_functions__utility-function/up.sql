-- =====================================================
-- Credit Calculation Functions
-- =====================================================
-- Purpose: SQL functions for credit calculations used by the API.
--          These functions aggregate credit usage and compute available balances.
-- Dependencies: organization_credit_balances, credit_transactions tables
-- ADR Reference: ADR-023 AI Capabilities Plan Integration (T2.6)

-- =========================================================================
-- Function: get_used_this_period
-- =========================================================================
-- Returns the absolute value of credits consumed during the current billing period.
-- Aggregates ai_consumption transactions between period_start and period_end.
--
-- Parameters:
--   org_id TEXT - The organization ID to check
--
-- Returns:
--   DECIMAL - Absolute value of credits consumed (always positive)
--   Returns 0 if organization not found or no consumption

CREATE OR REPLACE FUNCTION public.get_used_this_period(org_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    result DECIMAL(10,2);
    period_start_ts TIMESTAMPTZ;
    period_end_ts TIMESTAMPTZ;
BEGIN
    -- Get the billing period bounds for this organization
    SELECT period_start, period_end
    INTO period_start_ts, period_end_ts
    FROM public.organization_credit_balances
    WHERE organization_id = org_id;

    -- If organization not found, return 0
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Sum the absolute value of ai_consumption transactions within the billing period
    -- credits_amount is negative for consumption, so we use ABS()
    SELECT COALESCE(SUM(ABS(credits_amount)), 0)
    INTO result
    FROM public.credit_transactions
    WHERE organization_id = org_id
      AND transaction_type = 'ai_consumption'
      AND created_at >= period_start_ts
      AND created_at < period_end_ts;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================================
-- Function: get_available_credits
-- =========================================================================
-- Returns the credits available for use (before overdraft).
-- Formula: monthly_credits + bonus_credits - reserved_credits - used_this_period
--
-- Parameters:
--   org_id TEXT - The organization ID to check
--
-- Returns:
--   DECIMAL - Available credits (can be negative if overused)
--   Returns 0 if organization not found

CREATE OR REPLACE FUNCTION public.get_available_credits(org_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    result DECIMAL(10,2);
    monthly DECIMAL(10,2);
    bonus DECIMAL(10,2);
    reserved DECIMAL(10,2);
    used DECIMAL(10,2);
BEGIN
    -- Get the credit balance values for this organization
    SELECT monthly_credits, bonus_credits, reserved_credits
    INTO monthly, bonus, reserved
    FROM public.organization_credit_balances
    WHERE organization_id = org_id;

    -- If organization not found, return 0
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Get credits used this period
    used := public.get_used_this_period(org_id);

    -- Calculate available: total pool minus reserved and used
    result := monthly + bonus - reserved - used;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================================
-- Function: get_spendable_credits
-- =========================================================================
-- Returns the maximum credits that can be spent (including overdraft).
-- This is what the API uses to check if an operation can proceed.
-- Formula: get_available_credits(org_id) + overdraft_limit
--
-- Parameters:
--   org_id TEXT - The organization ID to check
--
-- Returns:
--   DECIMAL - Spendable credits (available + overdraft allowance)
--   Returns 0 if organization not found

CREATE OR REPLACE FUNCTION public.get_spendable_credits(org_id TEXT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    result DECIMAL(10,2);
    available DECIMAL(10,2);
    overdraft DECIMAL(10,2);
BEGIN
    -- Get overdraft limit for this organization
    SELECT overdraft_limit
    INTO overdraft
    FROM public.organization_credit_balances
    WHERE organization_id = org_id;

    -- If organization not found, return 0
    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    -- Get available credits
    available := public.get_available_credits(org_id);

    -- Add overdraft allowance
    result := available + overdraft;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================================
-- Index: Covering index for efficient consumption aggregation
-- =========================================================================
-- Partial covering index that includes credits_amount to enable index-only scans
-- for the get_used_this_period function. This avoids table lookups when summing
-- consumption within a billing period.
--
-- Query pattern: SUM(credits_amount) WHERE organization_id = ?
--                AND transaction_type = 'ai_consumption'
--                AND created_at BETWEEN ? AND ?

CREATE INDEX idx_credit_transactions_consumption_covering
ON public.credit_transactions (organization_id, created_at)
INCLUDE (credits_amount)
WHERE transaction_type = 'ai_consumption';

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Function comments
COMMENT ON FUNCTION public.get_used_this_period(TEXT) IS
  'Returns the absolute value of credits consumed during the current billing period for an organization. Aggregates ai_consumption transactions between period_start and period_end. Returns 0 if organization not found.';

COMMENT ON FUNCTION public.get_available_credits(TEXT) IS
  'Returns credits available for use: monthly_credits + bonus_credits - reserved_credits - used_this_period. Can be negative if overused. Returns 0 if organization not found.';

COMMENT ON FUNCTION public.get_spendable_credits(TEXT) IS
  'Returns maximum credits that can be spent including overdraft allowance: get_available_credits() + overdraft_limit. Used by API to check if operations can proceed. Returns 0 if organization not found.';

-- Index comment
COMMENT ON INDEX idx_credit_transactions_consumption_covering IS
  'Partial covering index for efficient ai_consumption aggregation. Includes credits_amount for index-only scans when computing used_this_period.';
