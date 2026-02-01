-- =====================================================
-- Rollback: Initialize Credit Balances for Existing Organizations
-- =====================================================
-- Purpose: Removes the data created by the up migration.
-- This deletes credit balances and transactions created during initialization.
--
-- WARNING: This will delete credit transaction history. Only use for rollback
-- of initial data migration, not for production rollbacks after system is in use.

-- =========================================================================
-- Step 1: Delete welcome bonus transactions
-- =========================================================================
-- Delete the promo_bonus transactions created by the initialization.
-- Uses description to identify records created by this migration.

DELETE FROM public.credit_transactions
WHERE transaction_type = 'promo_bonus'
AND description = 'Welcome bonus credits';

-- =========================================================================
-- Step 2: Delete initial plan_allocation transactions
-- =========================================================================
-- Delete the initial plan_allocation transactions.
-- Uses description to identify records created by this migration.

DELETE FROM public.credit_transactions
WHERE transaction_type = 'plan_allocation'
AND description = 'Initial monthly credit allocation';

-- =========================================================================
-- Step 3: Delete organization_credit_balances records
-- =========================================================================
-- Delete all credit balance records.
-- This assumes we're only rolling back from an initial state where no other
-- balances should exist. In production with real data, this would be dangerous.

DELETE FROM public.organization_credit_balances;

-- =========================================================================
-- Notes
-- =========================================================================
-- After rollback, organizations will need to have their credit balances
-- recreated, either by re-running the up migration or through the normal
-- organization creation flow.
