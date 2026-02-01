-- =====================================================
-- Organization Credit Balances Table Rollback
-- =====================================================

-- Remove the updated_at trigger first
SELECT remove_updated_at_trigger('organization_credit_balances', 'public');

-- Drop the index
DROP INDEX IF EXISTS public.idx_org_credit_balances_period_end;

-- Drop the table (CASCADE handles FK constraint)
DROP TABLE IF EXISTS public.organization_credit_balances CASCADE;
