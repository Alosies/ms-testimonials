-- =====================================================
-- credit_transactions: Add customer_google_id Column
-- =====================================================
-- Purpose: Records the Google ID (sub claim) of public form customers
-- who trigger AI operations, enabling audit trails and per-customer rate limiting.
-- NULL for authenticated user operations or anonymous submissions.

-- Google ID of the customer who triggered this AI operation via public form.
-- NULL for authenticated user operations or anonymous submissions.
ALTER TABLE public.credit_transactions
    ADD COLUMN customer_google_id TEXT;

COMMENT ON COLUMN public.credit_transactions.customer_google_id IS
  'Google ID (sub claim) of the customer who triggered this AI operation. NULL for authenticated user or anonymous operations.';

-- Partial index for per-customer rate limiting queries:
-- COUNT by (form_id, customer_google_id) within time window
CREATE INDEX idx_credit_transactions_customer_form
  ON public.credit_transactions (form_id, customer_google_id, created_at DESC)
  WHERE customer_google_id IS NOT NULL;

COMMENT ON INDEX public.idx_credit_transactions_customer_form IS
  'Supports per-customer generation limit queries: COUNT by (form_id, customer_google_id) within time window.';
