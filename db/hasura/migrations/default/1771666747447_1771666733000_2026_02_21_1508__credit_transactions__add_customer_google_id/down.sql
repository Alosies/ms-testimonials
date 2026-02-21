DROP INDEX IF EXISTS public.idx_credit_transactions_customer_form;
ALTER TABLE public.credit_transactions DROP COLUMN IF EXISTS customer_google_id;
