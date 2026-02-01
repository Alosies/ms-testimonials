-- =====================================================
-- Plan AI Capabilities Junction Table Creation
-- =====================================================
-- Purpose: Junction table linking subscription plans to AI capabilities they can access.
--          Enables fine-grained control over which AI features each plan tier can use.
-- Dependencies: nanoid utility-function, updated_at utility-function, plans table, ai_capabilities table

CREATE TABLE public.plan_ai_capabilities (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Foreign Keys
    -- =========================================================================

    -- FK to plans table. Identifies which subscription plan this capability belongs to.
    -- Cascade deletes when plan is removed.
    plan_id TEXT NOT NULL,

    -- FK to ai_capabilities table. Identifies which AI capability is being linked.
    -- Cascade deletes when capability is removed.
    ai_capability_id TEXT NOT NULL,

    -- =========================================================================
    -- Configuration Fields
    -- =========================================================================

    -- Whether this capability is enabled for this plan.
    -- Allows disabling without removing the row (soft disable).
    is_enabled BOOLEAN NOT NULL DEFAULT true,

    -- Maximum requests per minute for this capability on this plan.
    -- NULL means unlimited (no rate limiting).
    rate_limit_rpm INT,

    -- Maximum requests per day for this capability on this plan.
    -- NULL means unlimited (no daily cap).
    rate_limit_rpd INT,

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
    -- Unique Constraint
    -- =========================================================================
    -- Each plan can only have one entry per AI capability.
    UNIQUE (plan_id, ai_capability_id)
);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to subscription plan with cascade delete.
-- When plan is deleted, its capability links are removed.
ALTER TABLE public.plan_ai_capabilities
    ADD CONSTRAINT fk_plan_ai_capabilities_plan_id
    FOREIGN KEY (plan_id) REFERENCES public.plans(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to AI capability with cascade delete.
-- When capability is deleted, its plan links are removed.
ALTER TABLE public.plan_ai_capabilities
    ADD CONSTRAINT fk_plan_ai_capabilities_ai_capability_id
    FOREIGN KEY (ai_capability_id) REFERENCES public.ai_capabilities(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying all AI capabilities belonging to a plan.
-- Primary access pattern: "Get all AI capabilities for plan X"
CREATE INDEX idx_plan_ai_capabilities_plan_id ON public.plan_ai_capabilities(plan_id);

-- Index for querying all plans that have a specific AI capability.
-- Access pattern: "Get all plans that include capability Y"
CREATE INDEX idx_plan_ai_capabilities_ai_capability_id ON public.plan_ai_capabilities(ai_capability_id);

-- =========================================================================
-- Triggers
-- =========================================================================

-- Automatically update updated_at timestamp on any modification.
SELECT add_updated_at_trigger('plan_ai_capabilities', 'public');

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.plan_ai_capabilities IS
  'Junction table linking subscription plans to AI capabilities they can access. Enables fine-grained control over which AI features each plan tier can use, with optional rate limiting.';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.plan_ai_capabilities.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.plan_ai_capabilities.plan_id IS
  'FK to plans table. Identifies which subscription plan this capability belongs to. Cascade deletes when plan is removed.';

COMMENT ON COLUMN public.plan_ai_capabilities.ai_capability_id IS
  'FK to ai_capabilities table. Identifies which AI capability is being linked. Cascade deletes when capability is removed.';

COMMENT ON COLUMN public.plan_ai_capabilities.is_enabled IS
  'Whether this capability is enabled for this plan. Allows disabling without removing the row (soft disable).';

COMMENT ON COLUMN public.plan_ai_capabilities.rate_limit_rpm IS
  'Maximum requests per minute for this capability on this plan. NULL means unlimited (no rate limiting).';

COMMENT ON COLUMN public.plan_ai_capabilities.rate_limit_rpd IS
  'Maximum requests per day for this capability on this plan. NULL means unlimited (no daily cap).';

COMMENT ON COLUMN public.plan_ai_capabilities.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

COMMENT ON COLUMN public.plan_ai_capabilities.updated_at IS
  'Timestamp of last modification. Automatically updated by database trigger on any column change.';

-- Constraint comments
COMMENT ON CONSTRAINT fk_plan_ai_capabilities_plan_id ON public.plan_ai_capabilities IS
  'Links record to subscription plan. CASCADE DELETE removes links when plan is deleted.';

COMMENT ON CONSTRAINT fk_plan_ai_capabilities_ai_capability_id ON public.plan_ai_capabilities IS
  'Links record to AI capability. CASCADE DELETE removes links when capability is deleted.';

COMMENT ON CONSTRAINT plan_ai_capabilities_plan_id_ai_capability_id_key ON public.plan_ai_capabilities IS
  'Ensures each plan can only have one entry per AI capability.';

-- Index comments
COMMENT ON INDEX idx_plan_ai_capabilities_plan_id IS
  'Supports querying all AI capabilities for a specific plan.';

COMMENT ON INDEX idx_plan_ai_capabilities_ai_capability_id IS
  'Supports querying all plans that include a specific AI capability.';
