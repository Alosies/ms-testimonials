-- =====================================================
-- Credit Transactions - Add Audit Context Columns
-- =====================================================
-- Purpose: Add user and form context to credit transactions for audit transparency.
--          Uses snapshot pattern: stores both FK (for navigation) and display name
--          (for historical accuracy when entities are renamed/deleted).
-- ADR Reference: ADR-023 AI Capabilities Plan Integration (Decision 8: Audit Log Snapshot Pattern)

-- =========================================================================
-- User Context Columns
-- =========================================================================

-- FK to users table. Who triggered this transaction.
-- NULL for anonymous operations (testimonial submissions) and system operations.
-- SET NULL on delete preserves audit history when user is deleted.
ALTER TABLE public.credit_transactions
    ADD COLUMN user_id TEXT;

-- Snapshot of user display name at transaction time.
-- Preserved even if user is deleted or email changes.
-- Values: "john@company.com", "Anonymous", "System"
ALTER TABLE public.credit_transactions
    ADD COLUMN user_display_name TEXT;

-- =========================================================================
-- Form Context Columns
-- =========================================================================

-- FK to forms table. Which form this operation relates to.
-- NULL for non-form operations (topups, monthly allocations, admin adjustments).
-- SET NULL on delete preserves audit history when form is deleted.
ALTER TABLE public.credit_transactions
    ADD COLUMN form_id TEXT;

-- Snapshot of form name at transaction time.
-- Preserved even if form is renamed or deleted.
-- Example: "Product Feedback Form", "Customer Survey"
ALTER TABLE public.credit_transactions
    ADD COLUMN form_name TEXT;

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to user with SET NULL on delete.
-- Preserves transaction history when user is deleted.
ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_user_id
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to form with SET NULL on delete.
-- Preserves transaction history when form is deleted.
ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_form_id
    FOREIGN KEY (form_id) REFERENCES public.forms(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for filtering transactions by user.
-- Partial index excludes system operations (NULL user_id).
CREATE INDEX idx_credit_transactions_user_id
ON public.credit_transactions (user_id)
WHERE user_id IS NOT NULL;

-- Index for filtering transactions by form.
-- Partial index excludes non-form operations (NULL form_id).
CREATE INDEX idx_credit_transactions_form_id
ON public.credit_transactions (form_id)
WHERE form_id IS NOT NULL;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.credit_transactions.user_id IS
  'FK to users table. Who triggered this transaction. NULL for anonymous/system operations. SET NULL on delete preserves history.';

COMMENT ON COLUMN public.credit_transactions.user_display_name IS
  'Snapshot of user email/name at transaction time. Preserved when user deleted. Values: email, "Anonymous", "System".';

COMMENT ON COLUMN public.credit_transactions.form_id IS
  'FK to forms table. Which form this operation relates to. NULL for non-form operations. SET NULL on delete preserves history.';

COMMENT ON COLUMN public.credit_transactions.form_name IS
  'Snapshot of form name at transaction time. Preserved when form renamed/deleted. Example: "Product Feedback Form".';

COMMENT ON CONSTRAINT fk_credit_transactions_user_id ON public.credit_transactions IS
  'Links to user who triggered transaction. SET NULL on delete preserves audit history.';

COMMENT ON CONSTRAINT fk_credit_transactions_form_id ON public.credit_transactions IS
  'Links to form this operation relates to. SET NULL on delete preserves audit history.';

COMMENT ON INDEX idx_credit_transactions_user_id IS
  'Supports filtering transactions by user. Partial index excludes system operations.';

COMMENT ON INDEX idx_credit_transactions_form_id IS
  'Supports filtering transactions by form. Partial index excludes non-form operations.';
