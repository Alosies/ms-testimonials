-- =====================================================
-- Credit Transactions Table Rollback
-- =====================================================
-- Purpose: Removes the credit_transactions table and all associated objects.
-- Warning: This will delete all transaction history data.

-- =========================================================================
-- Drop Indexes
-- =========================================================================

DROP INDEX IF EXISTS public.idx_credit_transactions_idempotency;
DROP INDEX IF EXISTS public.idx_credit_transactions_capability;
DROP INDEX IF EXISTS public.idx_credit_transactions_type;
DROP INDEX IF EXISTS public.idx_credit_transactions_org_time;

-- =========================================================================
-- Drop Table (CASCADE removes constraints and foreign keys)
-- =========================================================================

DROP TABLE IF EXISTS public.credit_transactions CASCADE;
