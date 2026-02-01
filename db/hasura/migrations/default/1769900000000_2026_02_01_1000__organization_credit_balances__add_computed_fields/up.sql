-- =====================================================
-- Credit Computed Field Functions
-- =====================================================
-- Purpose: Wrapper functions for Hasura computed fields on organization_credit_balances.
--          These functions take a table row as input and call the underlying credit functions.
-- Dependencies: get_available_credits, get_spendable_credits, get_used_this_period functions
-- ADR Reference: ADR-023 AI Capabilities Plan Integration

-- =========================================================================
-- Function: ocb_available_credits (Computed Field)
-- =========================================================================
-- Wrapper for get_available_credits that takes organization_credit_balances row.
-- Used as a Hasura computed field on organization_credit_balances table.

CREATE OR REPLACE FUNCTION public.ocb_available_credits(balance_row public.organization_credit_balances)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN public.get_available_credits(balance_row.organization_id);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.ocb_available_credits(public.organization_credit_balances) IS
    'Computed field: Returns available credits (monthly + bonus - reserved - used) for the organization.';

-- =========================================================================
-- Function: ocb_spendable_credits (Computed Field)
-- =========================================================================
-- Wrapper for get_spendable_credits that takes organization_credit_balances row.
-- Used as a Hasura computed field on organization_credit_balances table.

CREATE OR REPLACE FUNCTION public.ocb_spendable_credits(balance_row public.organization_credit_balances)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN public.get_spendable_credits(balance_row.organization_id);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.ocb_spendable_credits(public.organization_credit_balances) IS
    'Computed field: Returns spendable credits (available + overdraft) for the organization.';

-- =========================================================================
-- Function: ocb_used_this_period (Computed Field)
-- =========================================================================
-- Wrapper for get_used_this_period that takes organization_credit_balances row.
-- Used as a Hasura computed field on organization_credit_balances table.

CREATE OR REPLACE FUNCTION public.ocb_used_this_period(balance_row public.organization_credit_balances)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN public.get_used_this_period(balance_row.organization_id);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.ocb_used_this_period(public.organization_credit_balances) IS
    'Computed field: Returns credits consumed during the current billing period.';
