-- =====================================================
-- Credit Calculation Functions - Rollback
-- =====================================================
-- Purpose: Remove credit calculation functions and supporting index.
-- ADR Reference: ADR-023 AI Capabilities Plan Integration (T2.6)

-- =========================================================================
-- Drop Index
-- =========================================================================
-- Must drop index before dropping functions (no direct dependency, but cleanup order)

DROP INDEX IF EXISTS public.idx_credit_transactions_consumption_covering;

-- =========================================================================
-- Drop Functions
-- =========================================================================
-- Drop in reverse order of creation (though no dependencies between them)

DROP FUNCTION IF EXISTS public.get_spendable_credits(TEXT);
DROP FUNCTION IF EXISTS public.get_available_credits(TEXT);
DROP FUNCTION IF EXISTS public.get_used_this_period(TEXT);
