-- =====================================================
-- Organization Credit Balances Table Creation
-- =====================================================
-- Purpose: Tracks credit balance state for each organization.
--          One row per organization. used_this_period is computed from credit_transactions.
-- Dependencies: nanoid utility-function, updated_at utility-function, organizations table

CREATE TABLE public.organization_credit_balances (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Organization Reference
    -- =========================================================================

    -- FK to organizations table. One balance record per organization.
    -- UNIQUE constraint ensures single balance per org.
    organization_id TEXT NOT NULL UNIQUE,

    -- =========================================================================
    -- Credit Balance Fields
    -- =========================================================================

    -- Credits allocated for the current billing period from the plan.
    -- Reset monthly when period_end is reached.
    monthly_credits DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Additional credits from purchases or promotions.
    -- Does NOT reset monthly - persists until used.
    bonus_credits DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Credits currently reserved for in-flight AI operations.
    -- Released on completion (deduct actual) or timeout (release back).
    reserved_credits DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- How far negative the available balance can go.
    -- Allows grace for metered operations that exceed limits slightly.
    overdraft_limit DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- =========================================================================
    -- Billing Period Fields
    -- =========================================================================

    -- Start of the current billing period.
    -- Used for calculating usage within the period.
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- End of the current billing period.
    -- When this is reached, monthly_credits are reset and period advances.
    period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this record was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp of last modification.
    -- Automatically updated by database trigger on any column change.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),

    -- =========================================================================
    -- Check Constraints
    -- =========================================================================

    -- Ensure all credit values are non-negative
    CONSTRAINT chk_monthly_credits_positive CHECK (monthly_credits >= 0),
    CONSTRAINT chk_bonus_credits_positive CHECK (bonus_credits >= 0),
    CONSTRAINT chk_reserved_credits_positive CHECK (reserved_credits >= 0),
    CONSTRAINT chk_overdraft_limit_positive CHECK (overdraft_limit >= 0)
);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to organization with cascade delete.
-- When organization is deleted, their credit balance is removed.
ALTER TABLE public.organization_credit_balances
    ADD CONSTRAINT fk_org_credit_balances_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for the monthly reset job to efficiently find expired periods.
-- Query pattern: "Find all balances where period_end <= NOW()"
CREATE INDEX idx_org_credit_balances_period_end
ON public.organization_credit_balances (period_end);

-- =========================================================================
-- Triggers
-- =========================================================================

-- Automatically update updated_at timestamp on any modification.
SELECT add_updated_at_trigger('organization_credit_balances', 'public');

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.organization_credit_balances IS
  'Tracks credit balance state for each organization. One row per org. used_this_period is computed from credit_transactions.';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.organization_credit_balances.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.organization_credit_balances.organization_id IS
  'FK to organizations table. UNIQUE constraint ensures one balance record per organization.';

COMMENT ON COLUMN public.organization_credit_balances.monthly_credits IS
  'Credits allocated for the current billing period from the plan. Reset monthly.';

COMMENT ON COLUMN public.organization_credit_balances.bonus_credits IS
  'Additional credits from purchases or promotions. Does not reset monthly.';

COMMENT ON COLUMN public.organization_credit_balances.reserved_credits IS
  'Credits currently reserved for in-flight AI operations. Released on completion or timeout.';

COMMENT ON COLUMN public.organization_credit_balances.overdraft_limit IS
  'How far negative the available balance can go. Provides grace for operations that slightly exceed limits.';

COMMENT ON COLUMN public.organization_credit_balances.period_start IS
  'Start of the current billing period. Used for calculating usage within the period.';

COMMENT ON COLUMN public.organization_credit_balances.period_end IS
  'End of the current billing period. When reached, monthly_credits are reset and period advances.';

COMMENT ON COLUMN public.organization_credit_balances.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

COMMENT ON COLUMN public.organization_credit_balances.updated_at IS
  'Timestamp of last modification. Automatically updated by database trigger on any column change.';

-- Constraint comments
COMMENT ON CONSTRAINT chk_monthly_credits_positive ON public.organization_credit_balances IS
  'Ensures monthly_credits cannot be negative.';

COMMENT ON CONSTRAINT chk_bonus_credits_positive ON public.organization_credit_balances IS
  'Ensures bonus_credits cannot be negative.';

COMMENT ON CONSTRAINT chk_reserved_credits_positive ON public.organization_credit_balances IS
  'Ensures reserved_credits cannot be negative.';

COMMENT ON CONSTRAINT chk_overdraft_limit_positive ON public.organization_credit_balances IS
  'Ensures overdraft_limit cannot be negative.';

COMMENT ON CONSTRAINT fk_org_credit_balances_organization_id ON public.organization_credit_balances IS
  'Links balance to organization. CASCADE DELETE removes balance when organization is deleted.';

-- Index comments
COMMENT ON INDEX idx_org_credit_balances_period_end IS
  'Supports monthly reset job to efficiently find expired billing periods.';
