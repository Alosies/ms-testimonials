-- =====================================================
-- Credit Reservations - Remove Audit Context Columns (Rollback)
-- =====================================================

-- Drop indexes first
DROP INDEX IF EXISTS public.idx_credit_reservations_user_id;
DROP INDEX IF EXISTS public.idx_credit_reservations_form_id;

-- Drop foreign key constraints
ALTER TABLE public.credit_reservations
    DROP CONSTRAINT IF EXISTS fk_credit_reservations_user_id;

ALTER TABLE public.credit_reservations
    DROP CONSTRAINT IF EXISTS fk_credit_reservations_form_id;

-- Drop columns
ALTER TABLE public.credit_reservations
    DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.credit_reservations
    DROP COLUMN IF EXISTS user_display_name;

ALTER TABLE public.credit_reservations
    DROP COLUMN IF EXISTS form_id;

ALTER TABLE public.credit_reservations
    DROP COLUMN IF EXISTS form_name;
