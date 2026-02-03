-- =====================================================
-- Rollback: Restore Original get_available_credits
-- =====================================================
-- Restores the original formula that subtracted used_this_period.
-- This had a double-counting bug but is needed for rollback.

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

COMMENT ON FUNCTION public.get_available_credits(TEXT) IS
  'Returns credits available for use: monthly_credits + bonus_credits - reserved_credits - used_this_period. Can be negative if overused. Returns 0 if organization not found.';
