-- =====================================================
-- Credit Transactions Table Creation
-- =====================================================
-- Purpose: Immutable audit log of all credit changes for organizations.
--          Records consumption, allocations, purchases, adjustments, and expirations.
--          Used for billing reconciliation, usage analytics, and audit compliance.
-- Dependencies: nanoid utility-function, organizations table, ai_capabilities table, quality_levels table
-- ADR Reference: ADR-023 AI Capabilities Plan Integration

CREATE TABLE public.credit_transactions (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Organization Reference
    -- =========================================================================

    -- FK to organizations table. The organization this transaction belongs to.
    -- CASCADE DELETE removes transactions when organization is deleted.
    organization_id TEXT NOT NULL,

    -- =========================================================================
    -- AI Operation References (optional - NULL for non-AI transactions)
    -- =========================================================================

    -- FK to ai_capabilities table. Which AI capability was used.
    -- NULL for non-AI transactions like topups, adjustments, allocations.
    ai_capability_id TEXT,

    -- FK to quality_levels table. Which quality level was used.
    -- NULL for non-AI transactions.
    quality_level_id TEXT,

    -- =========================================================================
    -- Transaction Details
    -- =========================================================================

    -- Type of credit transaction. Determines sign constraints and business logic.
    -- Valid values: ai_consumption, plan_allocation, topup_purchase, promo_bonus,
    --               admin_adjustment, plan_change_adjustment, expiration
    transaction_type TEXT NOT NULL,

    -- Actual credits amount for this transaction.
    -- Positive for additions (allocations, purchases, bonuses).
    -- Negative for consumption and expiration.
    -- admin_adjustment can be either positive or negative.
    credits_amount DECIMAL(10,2) NOT NULL,

    -- Estimated credits before execution (for AI operations).
    -- Used to track estimation accuracy. NULL for non-AI transactions.
    estimated_credits DECIMAL(10,2),

    -- Computed difference between actual and estimated credits.
    -- Positive means operation used more than estimated, negative means less.
    -- NULL when estimated_credits is NULL.
    estimation_variance DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE WHEN estimated_credits IS NOT NULL
             THEN credits_amount - estimated_credits
             ELSE NULL
        END
    ) STORED,

    -- Running balance snapshot after this transaction.
    -- Provides point-in-time balance for reporting and reconciliation.
    balance_after DECIMAL(10,2) NOT NULL,

    -- Human-readable description of the transaction.
    -- Examples: "AI question generation", "Monthly credit allocation", "Credit pack purchase"
    description TEXT,

    -- =========================================================================
    -- External References (for AI operations and billing)
    -- =========================================================================

    -- External API request ID from the AI provider.
    -- Used for debugging and reconciliation with provider invoices.
    provider_request_id TEXT,

    -- Provider-specific metadata as JSONB.
    -- Contains: model name, token counts, latency, cost breakdown, etc.
    -- Appropriate use of JSONB: truly dynamic provider data.
    provider_metadata JSONB,

    -- Unique key for deduplication of transactions.
    -- Prevents duplicate charges from retries or network issues.
    -- NULL for transactions that don't need deduplication.
    idempotency_key TEXT,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this transaction was created.
    -- Set automatically by DEFAULT, never modified (immutable audit log).
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),

    -- =========================================================================
    -- Check Constraints
    -- =========================================================================

    -- Transaction type must be a valid value
    CONSTRAINT chk_credit_transactions_type CHECK (transaction_type IN (
        'ai_consumption',          -- AI operation usage (negative)
        'plan_allocation',         -- Monthly credit allocation (positive)
        'topup_purchase',          -- Credit pack purchase (positive)
        'promo_bonus',             -- Promotional credits (positive)
        'admin_adjustment',        -- Manual adjustment (positive or negative)
        'plan_change_adjustment',  -- Upgrade/downgrade adjustment (positive)
        'expiration'               -- Monthly credits expired (negative)
    )),

    -- Sign constraint based on transaction type
    -- ai_consumption and expiration MUST be negative
    -- All others MUST be positive EXCEPT admin_adjustment which can be either
    CONSTRAINT chk_credit_transactions_sign CHECK (
        (transaction_type IN ('ai_consumption', 'expiration') AND credits_amount < 0)
        OR (transaction_type IN ('plan_allocation', 'topup_purchase', 'promo_bonus', 'plan_change_adjustment') AND credits_amount > 0)
        OR (transaction_type = 'admin_adjustment')
    )
);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to organization with cascade delete.
-- When organization is deleted, their transaction history is removed.
ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to AI capability with SET NULL on delete.
-- Preserves transaction history even if capability is removed.
ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_ai_capability_id
    FOREIGN KEY (ai_capability_id) REFERENCES public.ai_capabilities(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Link to quality level with SET NULL on delete.
-- Preserves transaction history even if quality level is removed.
ALTER TABLE public.credit_transactions
    ADD CONSTRAINT fk_credit_transactions_quality_level_id
    FOREIGN KEY (quality_level_id) REFERENCES public.quality_levels(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Primary query pattern: Get all transactions for an org, ordered by time.
-- Used in credit history UI and for computing used_this_period.
CREATE INDEX idx_credit_transactions_org_time
ON public.credit_transactions (organization_id, created_at DESC);

-- Filter by transaction type for analytics.
-- Example: "Show all topup purchases" or "Show all AI consumption"
CREATE INDEX idx_credit_transactions_type
ON public.credit_transactions (transaction_type);

-- Filter AI operations by capability.
-- Partial index excludes non-AI transactions (NULL ai_capability_id).
CREATE INDEX idx_credit_transactions_capability
ON public.credit_transactions (ai_capability_id) WHERE ai_capability_id IS NOT NULL;

-- Idempotency key lookup for deduplication.
-- Partial unique index excludes NULL keys (most transactions).
CREATE UNIQUE INDEX idx_credit_transactions_idempotency
ON public.credit_transactions (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.credit_transactions IS
  'Immutable audit log of all credit changes for organizations. Records consumption, allocations, purchases, adjustments, and expirations. Used for billing reconciliation, usage analytics, and audit compliance. Part of ADR-023 AI Capabilities Plan Integration.';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.credit_transactions.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.credit_transactions.organization_id IS
  'FK to organizations table. The organization this transaction belongs to. CASCADE DELETE removes history when org is deleted.';

COMMENT ON COLUMN public.credit_transactions.ai_capability_id IS
  'FK to ai_capabilities table. Which AI capability was used. NULL for non-AI transactions (topups, allocations, adjustments).';

COMMENT ON COLUMN public.credit_transactions.quality_level_id IS
  'FK to quality_levels table. Which quality level was used. NULL for non-AI transactions.';

COMMENT ON COLUMN public.credit_transactions.transaction_type IS
  'Type of credit transaction: ai_consumption, plan_allocation, topup_purchase, promo_bonus, admin_adjustment, plan_change_adjustment, expiration.';

COMMENT ON COLUMN public.credit_transactions.credits_amount IS
  'Actual credits amount. Positive for additions (allocations, purchases). Negative for consumption/expiration. admin_adjustment can be either.';

COMMENT ON COLUMN public.credit_transactions.estimated_credits IS
  'Estimated credits before AI execution. Used to track estimation accuracy. NULL for non-AI transactions.';

COMMENT ON COLUMN public.credit_transactions.estimation_variance IS
  'Computed: credits_amount - estimated_credits. Positive = used more than estimated. NULL when estimated_credits is NULL.';

COMMENT ON COLUMN public.credit_transactions.balance_after IS
  'Running balance snapshot after this transaction. Provides point-in-time balance for reporting.';

COMMENT ON COLUMN public.credit_transactions.description IS
  'Human-readable description. Examples: AI question generation, Monthly credit allocation, Credit pack purchase.';

COMMENT ON COLUMN public.credit_transactions.provider_request_id IS
  'External API request ID from AI provider. For debugging and reconciliation with provider invoices.';

COMMENT ON COLUMN public.credit_transactions.provider_metadata IS
  'JSONB: Provider-specific data (model name, token counts, latency, cost breakdown). Appropriate use: truly dynamic provider data.';

COMMENT ON COLUMN public.credit_transactions.idempotency_key IS
  'Unique key for deduplication. Prevents duplicate charges from retries or network issues. NULL if not needed.';

COMMENT ON COLUMN public.credit_transactions.created_at IS
  'Timestamp when this transaction was created. Set automatically, never modified (immutable audit log).';

-- Constraint comments
COMMENT ON CONSTRAINT chk_credit_transactions_type ON public.credit_transactions IS
  'Ensures transaction_type is a valid value from the allowed set.';

COMMENT ON CONSTRAINT chk_credit_transactions_sign ON public.credit_transactions IS
  'Ensures credits_amount has correct sign based on transaction_type: negative for consumption/expiration, positive for additions.';

COMMENT ON CONSTRAINT fk_credit_transactions_organization_id ON public.credit_transactions IS
  'Links transaction to organization. CASCADE DELETE removes transactions when organization is deleted.';

COMMENT ON CONSTRAINT fk_credit_transactions_ai_capability_id ON public.credit_transactions IS
  'Links to AI capability used. SET NULL preserves transaction history if capability is deleted.';

COMMENT ON CONSTRAINT fk_credit_transactions_quality_level_id ON public.credit_transactions IS
  'Links to quality level used. SET NULL preserves transaction history if quality level is deleted.';

-- Index comments
COMMENT ON INDEX idx_credit_transactions_org_time IS
  'Primary query pattern: Get all transactions for an org, ordered by time DESC. Used for credit history UI.';

COMMENT ON INDEX idx_credit_transactions_type IS
  'Supports filtering by transaction type for analytics and reporting.';

COMMENT ON INDEX idx_credit_transactions_capability IS
  'Partial index for filtering AI operations by capability. Excludes non-AI transactions.';

COMMENT ON INDEX idx_credit_transactions_idempotency IS
  'Unique partial index for deduplication. Enforces uniqueness on non-NULL idempotency keys only.';
