-- =====================================================
-- Quality Levels Table Creation
-- =====================================================
-- Purpose: Defines AI quality tiers that determine model selection and credit costs.
--          Each capability can specify which quality levels it supports.
-- Dependencies: nanoid utility-function (for generate_nanoid_12)
-- ADR Reference: ADR-023 AI Capabilities Plan Integration

CREATE TABLE public.quality_levels (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Business Fields
    -- =========================================================================

    -- Machine-readable unique identifier for the quality level.
    -- Used in code and API calls. Examples: 'fast', 'enhanced', 'premium'
    unique_name TEXT NOT NULL UNIQUE,

    -- Human-readable display name shown in UI.
    -- Examples: 'Fast', 'Enhanced', 'Premium'
    name TEXT NOT NULL,

    -- Optional description explaining the quality level's characteristics.
    -- Example: 'Quick responses using efficient models'
    description TEXT,

    -- Order for display in UI dropdowns and lists.
    -- Lower numbers appear first. Used for consistent ordering.
    display_order INT NOT NULL DEFAULT 0,

    -- Multiplier applied to base credit cost when this quality is used.
    -- 1.0 = base cost, 1.5 = 50% more credits, 3.0 = triple credits.
    credit_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,

    -- Whether this quality level is currently available for use.
    -- Allows disabling quality levels without deleting them.
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this quality level was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for looking up quality levels by unique_name (API lookups).
-- Enforced uniqueness already creates an index, but explicit for clarity.
CREATE INDEX idx_quality_levels_unique_name ON public.quality_levels(unique_name);

-- Index for sorting by display order (UI presentation).
CREATE INDEX idx_quality_levels_display_order ON public.quality_levels(display_order);

-- Index for filtering active quality levels.
CREATE INDEX idx_quality_levels_is_active ON public.quality_levels(is_active);

-- =========================================================================
-- Seed Data
-- =========================================================================

INSERT INTO public.quality_levels (unique_name, name, description, display_order, credit_multiplier) VALUES
('fast', 'Fast', 'Quick responses using efficient models', 1, 1.0),
('enhanced', 'Enhanced', 'Better quality with smarter models', 2, 1.5),
('premium', 'Premium', 'Best quality using most capable models', 3, 3.0);

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.quality_levels IS
  'Defines AI quality tiers (fast, enhanced, premium) that determine model selection and credit costs. Each AI capability references quality levels to specify supported tiers. Part of ADR-023 AI Capabilities Plan Integration.';

-- Column comments
COMMENT ON COLUMN public.quality_levels.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.quality_levels.unique_name IS
  'Machine-readable unique identifier for the quality level. Used in code and API calls. Examples: fast, enhanced, premium.';

COMMENT ON COLUMN public.quality_levels.name IS
  'Human-readable display name shown in UI. Examples: Fast, Enhanced, Premium.';

COMMENT ON COLUMN public.quality_levels.description IS
  'Optional description explaining the quality level characteristics. Example: Quick responses using efficient models.';

COMMENT ON COLUMN public.quality_levels.display_order IS
  'Order for display in UI dropdowns and lists. Lower numbers appear first.';

COMMENT ON COLUMN public.quality_levels.credit_multiplier IS
  'Multiplier applied to base credit cost. 1.0 = base cost, 1.5 = 50% more credits, 3.0 = triple credits.';

COMMENT ON COLUMN public.quality_levels.is_active IS
  'Whether this quality level is currently available for use. Allows soft-disabling without deletion.';

COMMENT ON COLUMN public.quality_levels.created_at IS
  'Timestamp when this quality level was first created. Set automatically, never modified.';

-- Index comments
COMMENT ON INDEX idx_quality_levels_unique_name IS
  'Supports API lookups by unique_name (e.g., fast, enhanced, premium).';

COMMENT ON INDEX idx_quality_levels_display_order IS
  'Supports ordering quality levels for UI presentation.';

COMMENT ON INDEX idx_quality_levels_is_active IS
  'Supports filtering to show only active quality levels.';
