-- =====================================================
-- Credit Reservations Table Creation
-- =====================================================
-- Purpose: Tracks credit reservations for in-flight AI operations.
--          Reservations hold credits during operation execution to ensure
--          credits are available before the operation completes.
-- Dependencies: nanoid utility-function, updated_at utility-function,
--               organizations table, ai_capabilities table, quality_levels table

CREATE TABLE public.credit_reservations (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Foreign Keys
    -- =========================================================================

    -- FK to organizations table. Links reservation to an organization.
    -- Cascade deletes when organization is removed.
    organization_id TEXT NOT NULL,

    -- FK to ai_capabilities table. Identifies the AI capability being used.
    -- Cascade deletes when capability is removed.
    ai_capability_id TEXT NOT NULL,

    -- FK to quality_levels table. Identifies the quality level for the operation.
    -- Cascade deletes when quality level is removed.
    quality_level_id TEXT NOT NULL,

    -- =========================================================================
    -- Reservation Details
    -- =========================================================================

    -- Number of credits reserved for this operation.
    -- Based on the capability's cost at the selected quality level.
    reserved_credits DECIMAL(10,2) NOT NULL,

    -- Current status of the reservation.
    -- pending: operation in-flight, credits held
    -- settled: operation completed successfully, credits deducted
    -- released: operation cancelled/failed, credits returned
    -- expired: timed out without settling, credits returned
    status TEXT NOT NULL DEFAULT 'pending',

    -- Unique key to prevent duplicate reservations for the same request.
    -- Usually the client request ID or operation correlation ID.
    idempotency_key TEXT NOT NULL UNIQUE,

    -- When this reservation expires if not settled.
    -- Expired reservations are automatically released by cleanup jobs.
    expires_at TIMESTAMPTZ NOT NULL,

    -- Actual credits used after operation completes (set on settle).
    -- May differ from reserved_credits if actual usage varies.
    settled_credits DECIMAL(10,2),

    -- Reason for releasing the reservation without settling.
    -- Examples: "user_cancelled", "operation_failed", "timeout"
    release_reason TEXT,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this reservation was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp of last modification.
    -- Automatically updated by database trigger on any column change.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),

    -- =========================================================================
    -- Constraints
    -- =========================================================================

    -- Ensures status is one of the valid values.
    CONSTRAINT chk_reservation_status CHECK (status IN ('pending', 'settled', 'released', 'expired')),

    -- Ensures reserved credits is always positive.
    CONSTRAINT chk_reserved_credits_positive CHECK (reserved_credits > 0)
);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to organization with cascade delete.
-- When organization is deleted, their reservations are removed.
ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to AI capability with cascade delete.
-- When capability is deleted, associated reservations are removed.
ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_ai_capability_id
    FOREIGN KEY (ai_capability_id) REFERENCES public.ai_capabilities(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to quality level with cascade delete.
-- When quality level is deleted, associated reservations are removed.
ALTER TABLE public.credit_reservations
    ADD CONSTRAINT fk_credit_reservations_quality_level_id
    FOREIGN KEY (quality_level_id) REFERENCES public.quality_levels(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying all reservations for an organization.
-- Primary access pattern: "Get all reservations for org X"
CREATE INDEX idx_credit_reservations_org
ON public.credit_reservations (organization_id);

-- Partial index for cleanup job to find expired pending reservations.
-- Only indexes pending reservations for efficient cleanup queries.
CREATE INDEX idx_credit_reservations_cleanup
ON public.credit_reservations (status, expires_at)
WHERE status = 'pending';

-- =========================================================================
-- Triggers
-- =========================================================================

-- Automatically update updated_at timestamp on any modification.
SELECT add_updated_at_trigger('credit_reservations', 'public');

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.credit_reservations IS
  'Tracks credit reservations for in-flight AI operations. Reservations hold credits during operation execution.';

-- Column comments
COMMENT ON COLUMN public.credit_reservations.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.credit_reservations.organization_id IS
  'FK to organizations table. Links reservation to an organization. Cascade deletes when organization is removed.';

COMMENT ON COLUMN public.credit_reservations.ai_capability_id IS
  'FK to ai_capabilities table. Identifies the AI capability being used. Cascade deletes when capability is removed.';

COMMENT ON COLUMN public.credit_reservations.quality_level_id IS
  'FK to quality_levels table. Identifies the quality level for the operation. Cascade deletes when quality level is removed.';

COMMENT ON COLUMN public.credit_reservations.reserved_credits IS
  'Number of credits reserved for this operation. Based on the capability cost at the selected quality level.';

COMMENT ON COLUMN public.credit_reservations.status IS
  'Reservation status: pending (in-flight), settled (completed successfully), released (cancelled/failed), expired (timed out)';

COMMENT ON COLUMN public.credit_reservations.idempotency_key IS
  'Unique key to prevent duplicate reservations for the same request. Usually the client request ID.';

COMMENT ON COLUMN public.credit_reservations.expires_at IS
  'When this reservation expires if not settled. Expired reservations are automatically released by cleanup jobs.';

COMMENT ON COLUMN public.credit_reservations.settled_credits IS
  'Actual credits used after operation completes (set on settle). May differ from reserved_credits if actual usage varies.';

COMMENT ON COLUMN public.credit_reservations.release_reason IS
  'Reason for releasing the reservation without settling. Examples: user_cancelled, operation_failed, timeout.';

COMMENT ON COLUMN public.credit_reservations.created_at IS
  'Timestamp when this reservation was first created. Set automatically, never modified.';

COMMENT ON COLUMN public.credit_reservations.updated_at IS
  'Timestamp of last modification. Automatically updated by database trigger on any column change.';

-- Constraint comments
COMMENT ON CONSTRAINT chk_reservation_status ON public.credit_reservations IS
  'Ensures status is one of: pending, settled, released, expired.';

COMMENT ON CONSTRAINT chk_reserved_credits_positive ON public.credit_reservations IS
  'Ensures reserved_credits is always positive (greater than zero).';

COMMENT ON CONSTRAINT fk_credit_reservations_organization_id ON public.credit_reservations IS
  'Links reservation to organization. CASCADE DELETE removes reservations when organization is deleted.';

COMMENT ON CONSTRAINT fk_credit_reservations_ai_capability_id ON public.credit_reservations IS
  'Links reservation to AI capability. CASCADE DELETE removes reservations when capability is deleted.';

COMMENT ON CONSTRAINT fk_credit_reservations_quality_level_id ON public.credit_reservations IS
  'Links reservation to quality level. CASCADE DELETE removes reservations when quality level is deleted.';

-- Index comments
COMMENT ON INDEX idx_credit_reservations_org IS
  'Supports querying all reservations for a specific organization.';

COMMENT ON INDEX idx_credit_reservations_cleanup IS
  'Partial index for cleanup job to efficiently find expired pending reservations.';
