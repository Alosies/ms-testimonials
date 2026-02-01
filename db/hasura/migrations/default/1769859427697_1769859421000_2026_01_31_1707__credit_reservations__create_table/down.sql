-- =====================================================
-- Credit Reservations Table Rollback
-- =====================================================

-- Remove updated_at trigger
SELECT remove_updated_at_trigger('credit_reservations', 'public');

-- Remove indexes
DROP INDEX IF EXISTS public.idx_credit_reservations_cleanup;
DROP INDEX IF EXISTS public.idx_credit_reservations_org;

-- Drop the table (this will also remove foreign keys and constraints)
DROP TABLE IF EXISTS public.credit_reservations CASCADE;
