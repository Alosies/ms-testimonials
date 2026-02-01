-- =====================================================
-- AI Capabilities Table Creation
-- =====================================================
-- Purpose: Catalog of AI features available in the platform with credit cost
--          estimates per quality level. Used for displaying AI capabilities
--          to users and calculating credit requirements.
-- Dependencies: nanoid utility-function, updated_at utility-function

CREATE TABLE public.ai_capabilities (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Business Fields
    -- =========================================================================

    -- Machine-readable unique identifier for the capability.
    -- Used in code to reference specific capabilities.
    -- Examples: 'question_generation', 'testimonial_assembly', 'testimonial_polish'
    unique_name TEXT NOT NULL UNIQUE,

    -- Human-readable display name shown in UI.
    -- Examples: 'Smart Question Generation', 'Testimonial Assembly'
    name TEXT NOT NULL,

    -- Detailed description of what this AI capability does.
    -- Shown to users to help them understand the feature.
    description TEXT,

    -- Category for grouping related capabilities in UI.
    -- Examples: 'forms', 'testimonials', 'general'
    category TEXT NOT NULL DEFAULT 'general',

    -- Icon identifier for displaying in UI (e.g., Lucide icon name).
    -- Example: 'sparkles', 'wand-2', 'message-square'
    icon TEXT,

    -- =========================================================================
    -- Credit Cost Estimates (per quality level)
    -- =========================================================================

    -- Estimated credits consumed when using 'fast' quality level.
    -- Fast uses smaller/cheaper models for quick responses.
    estimated_credits_fast DECIMAL(10,2) NOT NULL DEFAULT 1.0,

    -- Estimated credits consumed when using 'enhanced' quality level.
    -- Enhanced uses standard models with balanced quality/cost.
    estimated_credits_enhanced DECIMAL(10,2) NOT NULL DEFAULT 1.5,

    -- Estimated credits consumed when using 'premium' quality level.
    -- Premium uses the best models for highest quality output.
    estimated_credits_premium DECIMAL(10,2) NOT NULL DEFAULT 3.0,

    -- =========================================================================
    -- Status
    -- =========================================================================

    -- Whether this capability is currently available to users.
    -- Set to false to temporarily disable a capability.
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this record was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp of last modification.
    -- Automatically updated by database trigger on any column change.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =========================================================================
-- Indexes
-- =========================================================================

-- Unique index on unique_name is automatically created by UNIQUE constraint.

-- Index for filtering by category.
-- Used when displaying capabilities grouped by category.
CREATE INDEX idx_ai_capabilities_category ON public.ai_capabilities(category);

-- Index for filtering active capabilities.
-- Used when fetching only available capabilities.
CREATE INDEX idx_ai_capabilities_is_active ON public.ai_capabilities(is_active) WHERE is_active = true;

-- =========================================================================
-- Triggers
-- =========================================================================

-- Automatically update updated_at timestamp on any modification.
SELECT add_updated_at_trigger('ai_capabilities', 'public');

-- =========================================================================
-- Seed Data
-- =========================================================================

INSERT INTO public.ai_capabilities (unique_name, name, description, category, icon, estimated_credits_fast, estimated_credits_enhanced, estimated_credits_premium) VALUES
('question_generation', 'Smart Question Generation', 'AI-generated follow-up questions based on form context', 'forms', 'sparkles', 1.0, 1.5, 3.0),
('testimonial_assembly', 'Testimonial Assembly', 'Assembles customer answers into coherent testimonial', 'testimonials', 'wand-2', 2.0, 3.0, 6.0),
('testimonial_polish', 'Testimonial Polish', 'Improves grammar and flow of existing testimonials', 'testimonials', 'pen-tool', 1.0, 1.5, 3.0);

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.ai_capabilities IS
  'Catalog of AI features available in the platform. Defines each capability with display info and credit cost estimates per quality level. Used for UI display and credit calculation.';

-- Column comments
COMMENT ON COLUMN public.ai_capabilities.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.ai_capabilities.unique_name IS
  'Machine-readable unique identifier for the capability. Used in code to reference specific capabilities. Examples: question_generation, testimonial_assembly, testimonial_polish.';

COMMENT ON COLUMN public.ai_capabilities.name IS
  'Human-readable display name shown in UI. Examples: Smart Question Generation, Testimonial Assembly.';

COMMENT ON COLUMN public.ai_capabilities.description IS
  'Detailed description of what this AI capability does. Shown to users to help them understand the feature.';

COMMENT ON COLUMN public.ai_capabilities.category IS
  'Category for grouping related capabilities in UI. Examples: forms, testimonials, general. Defaults to general.';

COMMENT ON COLUMN public.ai_capabilities.icon IS
  'Icon identifier for displaying in UI (e.g., Lucide icon name). Examples: sparkles, wand-2, message-square.';

COMMENT ON COLUMN public.ai_capabilities.estimated_credits_fast IS
  'Estimated credits consumed when using fast quality level. Fast uses smaller/cheaper models for quick responses. Default: 1.0.';

COMMENT ON COLUMN public.ai_capabilities.estimated_credits_enhanced IS
  'Estimated credits consumed when using enhanced quality level. Enhanced uses standard models with balanced quality/cost. Default: 1.5.';

COMMENT ON COLUMN public.ai_capabilities.estimated_credits_premium IS
  'Estimated credits consumed when using premium quality level. Premium uses the best models for highest quality output. Default: 3.0.';

COMMENT ON COLUMN public.ai_capabilities.is_active IS
  'Whether this capability is currently available to users. Set to false to temporarily disable a capability. Default: true.';

COMMENT ON COLUMN public.ai_capabilities.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

COMMENT ON COLUMN public.ai_capabilities.updated_at IS
  'Timestamp of last modification. Automatically updated by database trigger on any column change.';

-- Index comments
COMMENT ON INDEX idx_ai_capabilities_category IS
  'Supports filtering capabilities by category for grouped display.';

COMMENT ON INDEX idx_ai_capabilities_is_active IS
  'Partial index for efficiently fetching only active capabilities.';
