-- =====================================================
-- Credit Transactions - Remove Audit Context Columns (Rollback)
-- =====================================================

-- Drop indexes first
DROP INDEX IF EXISTS public.idx_credit_transactions_user_id;
DROP INDEX IF EXISTS public.idx_credit_transactions_form_id;

-- Drop foreign key constraints
ALTER TABLE public.credit_transactions
    DROP CONSTRAINT IF EXISTS fk_credit_transactions_user_id;

ALTER TABLE public.credit_transactions
    DROP CONSTRAINT IF EXISTS fk_credit_transactions_form_id;

-- Drop columns
ALTER TABLE public.credit_transactions
    DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.credit_transactions
    DROP COLUMN IF EXISTS user_display_name;

ALTER TABLE public.credit_transactions
    DROP COLUMN IF EXISTS form_id;

ALTER TABLE public.credit_transactions
    DROP COLUMN IF EXISTS form_name;
