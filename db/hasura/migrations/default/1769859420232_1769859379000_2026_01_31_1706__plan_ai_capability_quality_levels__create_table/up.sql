-- =====================================================
-- Plan AI Capability Quality Levels Junction Table Creation
-- =====================================================
-- Purpose: Junction table defining which quality levels are available for each
--          plan-capability combination, and which AI models are allowed at each
--          quality level.
-- Dependencies: nanoid utility-function, plan_ai_capabilities table, quality_levels table

CREATE TABLE public.plan_ai_capability_quality_levels (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Junction Fields
    -- =========================================================================

    -- FK to plan_ai_capabilities table. Links to a specific plan-capability combination.
    -- Cascade deletes when the plan-capability is removed.
    plan_ai_capability_id TEXT NOT NULL,

    -- FK to quality_levels table. Links to a specific quality tier.
    -- Cascade deletes when the quality level is removed.
    quality_level_id TEXT NOT NULL,

    -- =========================================================================
    -- Business Fields
    -- =========================================================================

    -- Array of model identifiers allowed at this quality level for this plan-capability.
    -- E.g., {"gpt-4o-mini", "gpt-4o"} for standard quality, {"gpt-4o", "o1"} for premium.
    -- Empty array means no models allowed (effectively disabling this quality level).
    allowed_models TEXT[] NOT NULL DEFAULT '{}',

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this record was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =========================================================================
-- Unique Constraints
-- =========================================================================

-- Ensure each plan-capability can only have one entry per quality level.
-- A plan-capability can support multiple quality levels, but each must be unique.
ALTER TABLE public.plan_ai_capability_quality_levels
    ADD CONSTRAINT uq_pacql_plan_ai_capability_quality
    UNIQUE (plan_ai_capability_id, quality_level_id);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to plan_ai_capabilities with cascade delete.
-- When a plan-capability is deleted, its quality level configurations are removed.
ALTER TABLE public.plan_ai_capability_quality_levels
    ADD CONSTRAINT fk_pacql_plan_ai_capability_id
    FOREIGN KEY (plan_ai_capability_id) REFERENCES public.plan_ai_capabilities(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to quality_levels with cascade delete.
-- When a quality level is deleted, references to it are removed.
ALTER TABLE public.plan_ai_capability_quality_levels
    ADD CONSTRAINT fk_pacql_quality_level_id
    FOREIGN KEY (quality_level_id) REFERENCES public.quality_levels(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying all quality levels for a specific plan-capability.
-- Primary access pattern: "What quality levels are available for this plan-capability?"
CREATE INDEX idx_pacql_plan_ai_capability_id
    ON public.plan_ai_capability_quality_levels(plan_ai_capability_id);

-- Index for querying all plan-capabilities that include a specific quality level.
-- Useful for: "Which plans offer premium quality for any capability?"
CREATE INDEX idx_pacql_quality_level_id
    ON public.plan_ai_capability_quality_levels(quality_level_id);

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.plan_ai_capability_quality_levels IS
  'Junction table defining which quality levels are available for each plan-capability combination, and which models are allowed at each quality level.';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.plan_ai_capability_quality_levels.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.plan_ai_capability_quality_levels.plan_ai_capability_id IS
  'FK to plan_ai_capabilities table. Links to a specific plan-capability combination. Cascade deletes when the plan-capability is removed.';

COMMENT ON COLUMN public.plan_ai_capability_quality_levels.quality_level_id IS
  'FK to quality_levels table. Links to a specific quality tier. Cascade deletes when the quality level is removed.';

COMMENT ON COLUMN public.plan_ai_capability_quality_levels.allowed_models IS
  'Array of model identifiers allowed at this quality level for this plan-capability. E.g., {"gpt-4o-mini", "gpt-4o"}';

COMMENT ON COLUMN public.plan_ai_capability_quality_levels.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

-- Constraint comments
COMMENT ON CONSTRAINT uq_pacql_plan_ai_capability_quality ON public.plan_ai_capability_quality_levels IS
  'Ensures each plan-capability can only have one entry per quality level.';

COMMENT ON CONSTRAINT fk_pacql_plan_ai_capability_id ON public.plan_ai_capability_quality_levels IS
  'Links to plan_ai_capabilities. CASCADE DELETE removes entries when plan-capability is deleted.';

COMMENT ON CONSTRAINT fk_pacql_quality_level_id ON public.plan_ai_capability_quality_levels IS
  'Links to quality_levels. CASCADE DELETE removes entries when quality level is deleted.';

-- Index comments
COMMENT ON INDEX idx_pacql_plan_ai_capability_id IS
  'Supports querying all quality levels available for a specific plan-capability.';

COMMENT ON INDEX idx_pacql_quality_level_id IS
  'Supports querying all plan-capabilities that include a specific quality level.';
