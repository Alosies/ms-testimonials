-- =====================================================
-- Plan Quality Level Models Junction Table Creation
-- =====================================================
-- Purpose: Junction table linking plan-capability-quality combinations to specific
--          LLM models. Replaces the TEXT[] allowed_models column in
--          plan_ai_capability_quality_levels with proper normalization.
-- Dependencies: nanoid utility-function, plan_ai_capability_quality_levels table, llm_models table

CREATE TABLE public.plan_quality_level_models (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Junction Fields
    -- =========================================================================

    -- FK to plan_ai_capability_quality_levels table.
    -- Links to a specific plan-capability-quality combination.
    -- Cascade deletes when the parent record is removed.
    plan_ai_capability_quality_level_id TEXT NOT NULL,

    -- FK to llm_models table. Links to a specific AI model.
    -- Cascade deletes when the model is removed.
    llm_model_id TEXT NOT NULL,

    -- =========================================================================
    -- Business Fields
    -- =========================================================================

    -- Whether this model is the default choice for this quality level.
    -- Only one model per quality level should be marked as default.
    is_default BOOLEAN NOT NULL DEFAULT false,

    -- Priority order for fallback selection. Lower numbers = higher priority.
    -- Used when primary model is unavailable or rate-limited.
    -- Example: priority 0 = primary, priority 1 = first fallback, etc.
    priority INT NOT NULL DEFAULT 0,

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

-- Ensure each quality level can only have each model once.
-- A quality level can have multiple models, but each model is unique per quality level.
ALTER TABLE public.plan_quality_level_models
    ADD CONSTRAINT uq_pqlm_quality_level_model
    UNIQUE (plan_ai_capability_quality_level_id, llm_model_id);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to plan_ai_capability_quality_levels with cascade delete.
-- When a quality level config is deleted, its model mappings are removed.
ALTER TABLE public.plan_quality_level_models
    ADD CONSTRAINT fk_pqlm_plan_ai_capability_quality_level_id
    FOREIGN KEY (plan_ai_capability_quality_level_id) REFERENCES public.plan_ai_capability_quality_levels(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to llm_models with cascade delete.
-- When a model is deleted, references to it are removed.
ALTER TABLE public.plan_quality_level_models
    ADD CONSTRAINT fk_pqlm_llm_model_id
    FOREIGN KEY (llm_model_id) REFERENCES public.llm_models(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying all models for a specific quality level configuration.
-- Primary access pattern: "What models are available for this plan-capability-quality combo?"
CREATE INDEX idx_pqlm_plan_ai_capability_quality_level_id
    ON public.plan_quality_level_models(plan_ai_capability_quality_level_id);

-- Index for querying all quality level configurations that use a specific model.
-- Useful for: "Which plan configurations include model X?"
CREATE INDEX idx_pqlm_llm_model_id
    ON public.plan_quality_level_models(llm_model_id);

-- Partial index for quickly finding the default model for each quality level.
-- Used when selecting which model to use for an AI operation.
CREATE INDEX idx_pqlm_default
    ON public.plan_quality_level_models(plan_ai_capability_quality_level_id, is_default)
    WHERE is_default = true;

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.plan_quality_level_models IS
  'Junction table linking plan-capability-quality combinations to allowed LLM models. Replaces the TEXT[] allowed_models column with proper normalization. Enables default model selection and fallback ordering.';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.plan_quality_level_models.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.plan_quality_level_models.plan_ai_capability_quality_level_id IS
  'FK to plan_ai_capability_quality_levels table. Links to a specific plan-capability-quality combination. Cascade deletes when the parent record is removed.';

COMMENT ON COLUMN public.plan_quality_level_models.llm_model_id IS
  'FK to llm_models table. Links to a specific AI model. Cascade deletes when the model is removed.';

COMMENT ON COLUMN public.plan_quality_level_models.is_default IS
  'Whether this model is the default choice for this quality level. Only one model per quality level should be marked as default. Used for automatic model selection.';

COMMENT ON COLUMN public.plan_quality_level_models.priority IS
  'Priority order for fallback selection. Lower numbers = higher priority (0 = primary). Used when primary model is unavailable or rate-limited.';

COMMENT ON COLUMN public.plan_quality_level_models.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

-- Constraint comments
COMMENT ON CONSTRAINT uq_pqlm_quality_level_model ON public.plan_quality_level_models IS
  'Ensures each quality level configuration can only reference each model once.';

COMMENT ON CONSTRAINT fk_pqlm_plan_ai_capability_quality_level_id ON public.plan_quality_level_models IS
  'Links to plan_ai_capability_quality_levels. CASCADE DELETE removes model mappings when quality level config is deleted.';

COMMENT ON CONSTRAINT fk_pqlm_llm_model_id ON public.plan_quality_level_models IS
  'Links to llm_models. CASCADE DELETE removes mappings when model is deleted.';

-- Index comments
COMMENT ON INDEX idx_pqlm_plan_ai_capability_quality_level_id IS
  'Supports querying all models available for a specific plan-capability-quality combination.';

COMMENT ON INDEX idx_pqlm_llm_model_id IS
  'Supports querying all quality level configurations that include a specific model.';

COMMENT ON INDEX idx_pqlm_default IS
  'Partial index for quickly finding the default model for each quality level configuration.';
