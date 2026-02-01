-- =====================================================
-- LLM Models Table Creation
-- =====================================================
-- Purpose: Catalog of AI models with provider metadata and pricing.
--          Normalizes model data from api/src/shared/libs/ai/providers.ts
--          Used by plan_quality_level_models junction to specify which
--          models are available at each quality tier for each plan.
-- Dependencies: nanoid utility-function

-- =========================================================================
-- Table Definition
-- =========================================================================

CREATE TABLE public.llm_models (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Model Identification
    -- =========================================================================

    -- Composite unique identifier combining provider and model.
    -- Format: 'provider/model_id' (e.g., 'openai/gpt-4o-mini', 'google/gemini-2.0-flash')
    -- Used as a stable reference across the system.
    unique_name TEXT NOT NULL UNIQUE,

    -- Provider identifier. Must be one of: 'openai', 'google', 'anthropic'.
    -- Matches the AIProvider type in api/src/shared/libs/ai/providers.ts
    provider TEXT NOT NULL,

    -- Actual API model ID used when calling the provider.
    -- Examples: 'gpt-4o-mini', 'gemini-2.0-flash', 'claude-3-5-haiku-latest'
    model_id TEXT NOT NULL,

    -- =========================================================================
    -- Display & Classification
    -- =========================================================================

    -- Human-readable display name for UI.
    -- Examples: 'GPT-4o Mini', 'Gemini 2.0 Flash', 'Claude 3.5 Haiku'
    display_name TEXT NOT NULL,

    -- Quality tier classification. Must be: 'fast', 'balanced', or 'powerful'.
    -- Represents the PRIMARY tier this model serves.
    -- Note: Some models like gpt-4o serve multiple tiers (balanced + powerful).
    quality_tier TEXT NOT NULL,

    -- =========================================================================
    -- Pricing & Context
    -- =========================================================================

    -- USD per 1 million input tokens. NULL if pricing not available.
    -- Used for credit cost calculations.
    input_cost_per_million DECIMAL(10,4),

    -- USD per 1 million output tokens. NULL if pricing not available.
    -- Used for credit cost calculations.
    output_cost_per_million DECIMAL(10,4),

    -- Maximum context window in tokens. NULL if not specified.
    -- Used for input validation and model selection.
    context_window INT,

    -- =========================================================================
    -- Lifecycle Management
    -- =========================================================================

    -- Whether the model is currently active and available for use.
    -- Set to false to soft-disable without removing data.
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Timestamp when the model was deprecated by the provider.
    -- NULL means the model is current and not deprecated.
    deprecated_at TIMESTAMPTZ,

    -- FK to the recommended replacement model when this one is deprecated.
    -- NULL if no replacement or if model is not deprecated.
    replacement_model_id TEXT,

    -- Display order for UI sorting within the same quality tier.
    -- Lower numbers appear first.
    display_order INT NOT NULL DEFAULT 0,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this record was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =========================================================================
-- Constraints
-- =========================================================================

-- Ensure provider is one of the supported values
ALTER TABLE public.llm_models
    ADD CONSTRAINT chk_llm_models_provider
    CHECK (provider IN ('openai', 'google', 'anthropic'));

-- Ensure quality_tier is one of the supported values
ALTER TABLE public.llm_models
    ADD CONSTRAINT chk_llm_models_quality_tier
    CHECK (quality_tier IN ('fast', 'balanced', 'powerful'));

-- Self-referential FK for replacement model
ALTER TABLE public.llm_models
    ADD CONSTRAINT fk_llm_models_replacement
    FOREIGN KEY (replacement_model_id) REFERENCES public.llm_models(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for filtering by provider and quality tier.
-- Primary access pattern: "Get all models for provider X at quality tier Y"
CREATE INDEX idx_llm_models_provider_quality_tier
    ON public.llm_models(provider, quality_tier);

-- Partial index for active models.
-- Used when listing available models for selection.
CREATE INDEX idx_llm_models_is_active
    ON public.llm_models(is_active)
    WHERE is_active = true;

-- Index for display ordering within quality tier.
CREATE INDEX idx_llm_models_quality_tier_order
    ON public.llm_models(quality_tier, display_order);

-- =========================================================================
-- Seed Data
-- =========================================================================
-- Models from api/src/shared/libs/ai/providers.ts MODEL_CONFIG
-- 7 unique models across 3 providers

-- OpenAI Models
INSERT INTO public.llm_models (unique_name, provider, model_id, display_name, quality_tier, input_cost_per_million, output_cost_per_million, context_window, display_order) VALUES
    ('openai/gpt-4o-mini', 'openai', 'gpt-4o-mini', 'GPT-4o Mini', 'fast', 0.1500, 0.6000, 128000, 1),
    ('openai/gpt-4o', 'openai', 'gpt-4o', 'GPT-4o', 'balanced', 2.5000, 10.0000, 128000, 2);

-- Google Models
INSERT INTO public.llm_models (unique_name, provider, model_id, display_name, quality_tier, input_cost_per_million, output_cost_per_million, context_window, display_order) VALUES
    ('google/gemini-2.0-flash', 'google', 'gemini-2.0-flash', 'Gemini 2.0 Flash', 'fast', 0.1000, 0.4000, 1048576, 1),
    ('google/gemini-2.5-flash', 'google', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'balanced', 0.1500, 0.6000, 1048576, 2),
    ('google/gemini-2.5-pro', 'google', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'powerful', 1.2500, 5.0000, 1048576, 3);

-- Anthropic Models
INSERT INTO public.llm_models (unique_name, provider, model_id, display_name, quality_tier, input_cost_per_million, output_cost_per_million, context_window, display_order) VALUES
    ('anthropic/claude-3-5-haiku-latest', 'anthropic', 'claude-3-5-haiku-latest', 'Claude 3.5 Haiku', 'fast', 0.8000, 4.0000, 200000, 1),
    ('anthropic/claude-sonnet-4-20250514', 'anthropic', 'claude-sonnet-4-20250514', 'Claude Sonnet 4', 'balanced', 3.0000, 15.0000, 200000, 2);

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.llm_models IS
  'Catalog of AI models with provider metadata and pricing. Normalizes model configuration from providers.ts for database-driven model selection. Referenced by plan_quality_level_models junction to define which models are available for each plan/quality tier combination.';

-- Column comments
COMMENT ON COLUMN public.llm_models.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.llm_models.unique_name IS
  'Composite unique identifier in format "provider/model_id" (e.g., "openai/gpt-4o-mini"). Used as stable reference across the system.';

COMMENT ON COLUMN public.llm_models.provider IS
  'Provider identifier. Valid values: openai, google, anthropic. Matches AIProvider type in providers.ts.';

COMMENT ON COLUMN public.llm_models.model_id IS
  'Actual API model ID used when calling the provider (e.g., "gpt-4o-mini", "gemini-2.0-flash").';

COMMENT ON COLUMN public.llm_models.display_name IS
  'Human-readable display name for UI (e.g., "GPT-4o Mini", "Gemini 2.0 Flash").';

COMMENT ON COLUMN public.llm_models.quality_tier IS
  'Quality tier classification: fast, balanced, or powerful. Represents PRIMARY tier for this model. Some models may serve multiple tiers.';

COMMENT ON COLUMN public.llm_models.input_cost_per_million IS
  'Cost in USD per 1 million input tokens. NULL if pricing not available. Used for credit cost calculations.';

COMMENT ON COLUMN public.llm_models.output_cost_per_million IS
  'Cost in USD per 1 million output tokens. NULL if pricing not available. Used for credit cost calculations.';

COMMENT ON COLUMN public.llm_models.context_window IS
  'Maximum context window in tokens. NULL if not specified. Used for input validation.';

COMMENT ON COLUMN public.llm_models.is_active IS
  'Whether model is currently active and available. Set false to soft-disable without removing data.';

COMMENT ON COLUMN public.llm_models.deprecated_at IS
  'Timestamp when model was deprecated by provider. NULL means model is current.';

COMMENT ON COLUMN public.llm_models.replacement_model_id IS
  'FK to recommended replacement model when deprecated. NULL if not deprecated or no replacement.';

COMMENT ON COLUMN public.llm_models.display_order IS
  'Display order for UI sorting within same quality tier. Lower numbers appear first.';

COMMENT ON COLUMN public.llm_models.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

-- Constraint comments
COMMENT ON CONSTRAINT chk_llm_models_provider ON public.llm_models IS
  'Ensures provider is one of: openai, google, anthropic.';

COMMENT ON CONSTRAINT chk_llm_models_quality_tier ON public.llm_models IS
  'Ensures quality_tier is one of: fast, balanced, powerful.';

COMMENT ON CONSTRAINT fk_llm_models_replacement ON public.llm_models IS
  'Self-referential FK to replacement model. SET NULL if replacement is deleted.';

-- Index comments
COMMENT ON INDEX idx_llm_models_provider_quality_tier IS
  'Supports filtering by provider and quality tier combination.';

COMMENT ON INDEX idx_llm_models_is_active IS
  'Partial index for efficiently querying active models only.';

COMMENT ON INDEX idx_llm_models_quality_tier_order IS
  'Supports display ordering within quality tier for UI listings.';
