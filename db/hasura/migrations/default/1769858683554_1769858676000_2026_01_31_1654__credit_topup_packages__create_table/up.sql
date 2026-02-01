-- =====================================================
-- Credit Topup Packages Table Creation
-- =====================================================
-- Purpose: Define purchasable credit bundles that users can buy.
--          Credits are added to bonus_credits on purchase.
-- Dependencies: nanoid utility-function

CREATE TABLE public.credit_topup_packages (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Business Fields
    -- =========================================================================

    -- Unique identifier for the package, used internally and for API references.
    -- Examples: 'starter', 'popular', 'power'
    unique_name TEXT NOT NULL UNIQUE,

    -- Human-readable display name shown to users in the UI.
    -- Examples: 'Starter Pack', 'Popular Pack', 'Power Pack'
    name TEXT NOT NULL,

    -- Optional description explaining the package benefits.
    -- Example: 'Perfect for trying out AI features'
    description TEXT,

    -- Number of credits included in this package.
    -- Examples: 100, 500, 2000
    credits INT NOT NULL,

    -- Price in USD cents (e.g., 999 = $9.99).
    -- Using cents avoids floating-point precision issues.
    price_usd_cents INT NOT NULL,

    -- Auto-calculated price per credit for comparison purposes.
    -- Formula: (price_usd_cents / 100) / credits
    -- Stored as DECIMAL for precision in comparisons.
    price_per_credit DECIMAL(10,4) GENERATED ALWAYS AS (price_usd_cents::DECIMAL / 100 / credits) STORED,

    -- Whether this package is currently available for purchase.
    -- Inactive packages are hidden from the storefront but preserved for history.
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Order in which packages appear in the UI (lower = first).
    -- Used for sorting packages on the purchase page.
    display_order INT NOT NULL DEFAULT 0,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this package was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for efficiently querying active packages ordered by display_order.
-- Primary access pattern: "Get all active packages for storefront"
CREATE INDEX idx_credit_topup_packages_active_order
ON public.credit_topup_packages (display_order)
WHERE is_active = true;

-- =========================================================================
-- Seed Data
-- =========================================================================

INSERT INTO public.credit_topup_packages (unique_name, name, description, credits, price_usd_cents, display_order) VALUES
('starter', 'Starter Pack', 'Perfect for trying out AI features', 100, 999, 1),
('popular', 'Popular Pack', 'Best value for regular users', 500, 3999, 2),
('power', 'Power Pack', 'For power users and teams', 2000, 12999, 3);

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.credit_topup_packages IS
  'Purchasable credit bundles. Credits are added to bonus_credits on purchase.';

-- Column comments
COMMENT ON COLUMN public.credit_topup_packages.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.credit_topup_packages.unique_name IS
  'Unique identifier for the package, used internally and for API references. Examples: starter, popular, power.';

COMMENT ON COLUMN public.credit_topup_packages.name IS
  'Human-readable display name shown to users in the UI. Examples: Starter Pack, Popular Pack.';

COMMENT ON COLUMN public.credit_topup_packages.description IS
  'Optional description explaining the package benefits shown on the purchase page.';

COMMENT ON COLUMN public.credit_topup_packages.credits IS
  'Number of credits included in this package. Added to bonus_credits on purchase.';

COMMENT ON COLUMN public.credit_topup_packages.price_usd_cents IS
  'Price in USD cents (e.g., 999 = $9.99). Using cents avoids floating-point precision issues.';

COMMENT ON COLUMN public.credit_topup_packages.price_per_credit IS
  'Auto-calculated price per credit for comparison. Formula: (price_usd_cents / 100) / credits.';

COMMENT ON COLUMN public.credit_topup_packages.is_active IS
  'Whether this package is currently available for purchase. Inactive packages are hidden but preserved.';

COMMENT ON COLUMN public.credit_topup_packages.display_order IS
  'Order in which packages appear in the UI (lower = first). Used for sorting on purchase page.';

COMMENT ON COLUMN public.credit_topup_packages.created_at IS
  'Timestamp when this package was first created. Set automatically, never modified.';

-- Index comment
COMMENT ON INDEX idx_credit_topup_packages_active_order IS
  'Supports efficiently querying active packages ordered by display_order for storefront.';
