-- =====================================================
-- credit_reservations: Add customer_google_id Column
-- =====================================================
-- Purpose: Records the Google ID (sub claim) of public form customers
-- at reservation time. Copied to credit_transactions on settlement.
-- NULL for authenticated user operations or anonymous submissions.

-- Google ID of the customer. Copied to credit_transactions on settlement.
ALTER TABLE public.credit_reservations
    ADD COLUMN customer_google_id TEXT;

COMMENT ON COLUMN public.credit_reservations.customer_google_id IS
  'Google ID (sub claim) of the customer. Copied to credit_transactions on settlement.';
