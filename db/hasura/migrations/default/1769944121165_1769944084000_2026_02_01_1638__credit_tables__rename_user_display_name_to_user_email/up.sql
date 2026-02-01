-- =====================================================
-- Rename user_display_name to user_email
-- =====================================================
-- Purpose: Rename audit context column for clarity
-- Tables: credit_transactions, credit_reservations
-- Reason: We store user email, not display name, for audit purposes
-- ADR Reference: ADR-023 AI Capabilities Plan Integration (Decision 8)

-- =========================================================================
-- credit_transactions: Rename column
-- =========================================================================

ALTER TABLE public.credit_transactions
    RENAME COLUMN user_display_name TO user_email;

-- Update column comment
COMMENT ON COLUMN public.credit_transactions.user_email IS
  'Email of user who initiated the operation (snapshot at transaction time). NULL for system/anonymous operations.';

-- =========================================================================
-- credit_reservations: Rename column
-- =========================================================================

ALTER TABLE public.credit_reservations
    RENAME COLUMN user_display_name TO user_email;

-- Update column comment
COMMENT ON COLUMN public.credit_reservations.user_email IS
  'Email of user who initiated the operation (snapshot at reservation time). NULL for system/anonymous operations.';
