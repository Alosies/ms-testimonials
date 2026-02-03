-- =====================================================
-- Fix get_available_credits Double-Counting Bug
-- =====================================================
-- Problem: Credits were being counted twice when calculating available balance.
--          The settlement process deducts from monthly_credits/bonus_credits,
--          but get_available_credits was ALSO subtracting used_this_period.
--
-- Before: available = monthly + bonus - reserved - used_this_period
--         (Double-counts because monthly/bonus already reduced by consumption)
--
-- After:  available = monthly + bonus - reserved
--         (Matches balance_after in transactions - single source of truth)
--
-- ADR Reference: ADR-023 AI Capabilities Plan Integration
-- Related: settleCredits.ts line 158-159

-- =========================================================================
-- Function: get_available_credits (FIXED)
-- =========================================================================
-- Returns the credits available for use (before overdraft).
-- Formula: monthly_credits + bonus_credits - reserved_credits
--
-- NOTE: used_this_period is NOT subtracted because credits are already
-- deducted from monthly_credits and bonus_credits during settlement.
-- This provides a single source of truth matching balance_after in transactions.
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

    -- Calculate available: total pool minus reserved
    -- NOTE: We do NOT subtract used_this_period here because:
    -- 1. Credits are already deducted from monthly/bonus during settlement
    -- 2. This matches balance_after computation in credit_transactions
    -- 3. used_this_period is kept for informational/audit purposes only
    result := monthly + bonus - reserved;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON FUNCTION public.get_available_credits(TEXT) IS
  'Returns credits available for use: monthly_credits + bonus_credits - reserved_credits. Credits consumed are already deducted from monthly/bonus during settlement, so used_this_period is NOT subtracted (that would double-count). Returns 0 if organization not found.';
