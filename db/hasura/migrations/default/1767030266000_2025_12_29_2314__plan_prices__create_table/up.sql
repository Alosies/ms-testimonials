-- =====================================================
-- Plan Prices Table Creation
-- =====================================================
-- Purpose: Multi-currency pricing for plans (prices in smallest currency unit)
-- Dependencies: plans table

CREATE TABLE public.plan_prices (
    id                              TEXT NOT NULL DEFAULT generate_nanoid_12(),
    plan_id                         TEXT NOT NULL,
    currency_code                   VARCHAR(3) NOT NULL DEFAULT 'USD',
    price_monthly_in_base_unit      INTEGER NOT NULL DEFAULT 0,
    price_yearly_in_base_unit       INTEGER NOT NULL DEFAULT 0,
    price_lifetime_in_base_unit     INTEGER,
    is_active                       BOOLEAN NOT NULL DEFAULT true,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT plan_prices_plan_fk
        FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE,
    CONSTRAINT plan_prices_unique
        UNIQUE (plan_id, currency_code),
    CONSTRAINT plan_prices_currency_check
        CHECK (currency_code ~ '^[A-Z]{3}$')
);

-- Indexes
CREATE INDEX idx_plan_prices_plan ON public.plan_prices(plan_id);
CREATE INDEX idx_plan_prices_currency ON public.plan_prices(currency_code);

-- Trigger
SELECT add_updated_at_trigger('plan_prices', 'public');

-- Seed pricing
INSERT INTO plan_prices (plan_id, currency_code, price_monthly_in_base_unit, price_yearly_in_base_unit, price_lifetime_in_base_unit)
SELECT id, 'USD', 0, 0, NULL FROM plans WHERE unique_name = 'free'
UNION ALL
SELECT id, 'USD', 0, 0, 4900 FROM plans WHERE unique_name = 'pro'
UNION ALL
SELECT id, 'INR', 0, 0, 99900 FROM plans WHERE unique_name = 'pro'
UNION ALL
SELECT id, 'USD', 0, 0, 9900 FROM plans WHERE unique_name = 'team'
UNION ALL
SELECT id, 'INR', 0, 0, 199900 FROM plans WHERE unique_name = 'team';

-- Documentation
COMMENT ON TABLE public.plan_prices IS 'Multi-currency pricing - prices in smallest currency unit';
COMMENT ON COLUMN public.plan_prices.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.plan_prices.currency_code IS 'ISO 4217 currency code (USD, INR, EUR)';
COMMENT ON COLUMN public.plan_prices.price_monthly_in_base_unit IS 'Price in smallest unit: 4900 = $49.00 USD or 49.00 INR paise';
