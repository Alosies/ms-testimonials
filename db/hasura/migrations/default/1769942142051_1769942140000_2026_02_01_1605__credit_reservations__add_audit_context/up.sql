-- =====================================================
-- Credit Reservations - Add Audit Context Columns
-- =====================================================
-- Purpose: Add user and form context to credit reservations.
--          Context is captured at reserve time and copied to credit_transactions at settle time.
--          Uses snapshot pattern for historical accuracy.
-- ADR Reference: ADR-023 AI Capabilities Plan Integration (Decision 8: Audit Log Snapshot Pattern)

-- =========================================================================
-- User Context Columns
-- =========================================================================

-- FK to users table. Who initiated this reservation.
-- NULL for anonymous operations (testimonial submissions).
-- SET NULL on delete preserves reservation history when user is deleted.
ALTER TABLE public.credit_reservations
    ADD COLUMN user_id TEXT;

-- Snapshot of user display name at reservation time.
-- Copied to credit_transactions when settled.
-- Values: "john@company.com", "Anonymous"
ALTER TABLE public.credit_reservations
    ADD COLUMN user_display_name TEXT;

-- =========================================================================
-- Form Context Columns
-- =========================================================================

-- FK to forms table. Which form this operation relates to.
-- Required for AI operations as they always relate to a form.
-- SET NULL on delete preserves reservation history when form is deleted.
ALTER TABLE public.credit_reservations
    ADD COLUMN form_id TEXT;

-- Snapshot of form name at reservation time.
-- Copied to credit_transactions when settled.
-- Example: "Product Feedback Form", "Customer Survey"
ALTER TABLE public.credit_reservations
    ADD COLUMN form_name TEXT;

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to user with SET NULL on delete.
-- Preserves reservation history when user is deleted.
ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_user_id
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to form with SET NULL on delete.
-- Preserves reservation history when form is deleted.
ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_form_id
    FOREIGN KEY (form_id) REFERENCES public.forms(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for filtering reservations by user.
-- Useful for debugging user-specific reservation issues.
CREATE INDEX idx_credit_reservations_user_id
ON public.credit_reservations (user_id)
WHERE user_id IS NOT NULL;

-- Index for filtering reservations by form.
-- Useful for form-level credit usage analysis.
CREATE INDEX idx_credit_reservations_form_id
ON public.credit_reservations (form_id)
WHERE form_id IS NOT NULL;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

COMMENT ON COLUMN public.credit_reservations.user_id IS
  'FK to users table. Who initiated this reservation. NULL for anonymous operations. SET NULL on delete preserves history.';

COMMENT ON COLUMN public.credit_reservations.user_display_name IS
  'Snapshot of user email/name at reservation time. Copied to transaction on settle. Values: email, "Anonymous".';

COMMENT ON COLUMN public.credit_reservations.form_id IS
  'FK to forms table. Which form this operation relates to. SET NULL on delete preserves history.';

COMMENT ON COLUMN public.credit_reservations.form_name IS
  'Snapshot of form name at reservation time. Copied to transaction on settle. Example: "Product Feedback Form".';

COMMENT ON CONSTRAINT fk_credit_reservations_user_id ON public.credit_reservations IS
  'Links to user who initiated reservation. SET NULL on delete preserves history.';

COMMENT ON CONSTRAINT fk_credit_reservations_form_id ON public.credit_reservations IS
  'Links to form this operation relates to. SET NULL on delete preserves history.';

COMMENT ON INDEX idx_credit_reservations_user_id IS
  'Supports filtering reservations by user for debugging.';

COMMENT ON INDEX idx_credit_reservations_form_id IS
  'Supports filtering reservations by form for usage analysis.';
