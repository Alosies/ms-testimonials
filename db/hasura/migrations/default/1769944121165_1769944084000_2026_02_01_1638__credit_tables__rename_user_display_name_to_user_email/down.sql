-- =====================================================
-- Revert: Rename user_email back to user_display_name
-- =====================================================

-- =========================================================================
-- credit_transactions: Revert column rename
-- =========================================================================

ALTER TABLE public.credit_transactions
    RENAME COLUMN user_email TO user_display_name;

-- Restore original column comment
COMMENT ON COLUMN public.credit_transactions.user_display_name IS
  'Display name of user who initiated the operation (snapshot at transaction time). NULL for system/anonymous operations.';

-- =========================================================================
-- credit_reservations: Revert column rename
-- =========================================================================

ALTER TABLE public.credit_reservations
    RENAME COLUMN user_email TO user_display_name;

-- Restore original column comment
COMMENT ON COLUMN public.credit_reservations.user_display_name IS
  'Display name of user who initiated the operation (snapshot at reservation time). NULL for system/anonymous operations.';
