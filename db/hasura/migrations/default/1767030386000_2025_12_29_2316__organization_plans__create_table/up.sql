-- =====================================================
-- Organization Plans Table Creation
-- =====================================================
-- Purpose: Subscription records - plan values copied at subscription time
-- Dependencies: organizations table, plans table, users table

CREATE TABLE public.organization_plans (
    id                      TEXT NOT NULL DEFAULT generate_nanoid_12(),
    organization_id         TEXT NOT NULL,
    plan_id                 TEXT NOT NULL,

    -- Subscription status
    status                  TEXT NOT NULL DEFAULT 'active',
    billing_cycle           TEXT NOT NULL,
    currency_code           VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Timeline
    starts_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_ends_at  TIMESTAMPTZ,
    trial_ends_at           TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,

    -- COPIED from plan at subscription time (source of truth for this org)
    max_forms               INTEGER NOT NULL,
    max_testimonials        INTEGER NOT NULL,
    max_widgets             INTEGER NOT NULL,
    max_members             INTEGER NOT NULL,
    show_branding           BOOLEAN NOT NULL,
    price_in_base_unit      INTEGER NOT NULL,

    -- Override audit trail
    has_overrides           BOOLEAN NOT NULL DEFAULT false,
    override_reason         TEXT,
    overridden_by           TEXT,
    overridden_at           TIMESTAMPTZ,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT org_plans_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_plans_plan_fk
        FOREIGN KEY (plan_id) REFERENCES public.plans(id),
    CONSTRAINT org_plans_overridden_by_fk
        FOREIGN KEY (overridden_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT org_plans_status_check
        CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
    CONSTRAINT org_plans_billing_check
        CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    CONSTRAINT org_plans_currency_check
        CHECK (currency_code ~ '^[A-Z]{3}$')
);

-- Only one active/trial plan per organization
CREATE UNIQUE INDEX idx_org_plans_active
    ON public.organization_plans(organization_id)
    WHERE status IN ('trial', 'active');

-- Other indexes
CREATE INDEX idx_org_plans_org ON public.organization_plans(organization_id);
CREATE INDEX idx_org_plans_plan ON public.organization_plans(plan_id);
CREATE INDEX idx_org_plans_status ON public.organization_plans(status);
CREATE INDEX idx_org_plans_expiring ON public.organization_plans(current_period_ends_at)
    WHERE status = 'active' AND current_period_ends_at IS NOT NULL;

-- Trigger
SELECT add_updated_at_trigger('organization_plans', 'public');

-- Documentation
COMMENT ON TABLE public.organization_plans IS 'Subscription records - plan values copied at subscription time';
COMMENT ON COLUMN public.organization_plans.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.organization_plans.organization_id IS 'Organization this subscription belongs to';
COMMENT ON COLUMN public.organization_plans.plan_id IS 'Reference to original plan template for analytics/reporting';
COMMENT ON COLUMN public.organization_plans.status IS 'Subscription status: trial, active, cancelled, expired';
COMMENT ON COLUMN public.organization_plans.billing_cycle IS 'Billing frequency: monthly, yearly, lifetime';
COMMENT ON COLUMN public.organization_plans.currency_code IS 'ISO 4217 currency code for this subscription';
COMMENT ON COLUMN public.organization_plans.starts_at IS 'When subscription started';
COMMENT ON COLUMN public.organization_plans.current_period_ends_at IS 'When current billing period ends (NULL for lifetime)';
COMMENT ON COLUMN public.organization_plans.trial_ends_at IS 'When trial period ends (NULL if not on trial)';
COMMENT ON COLUMN public.organization_plans.cancelled_at IS 'When subscription was cancelled (NULL if active)';
COMMENT ON COLUMN public.organization_plans.max_forms IS 'Form limit copied from plan (may be overridden)';
COMMENT ON COLUMN public.organization_plans.max_testimonials IS 'Testimonial limit copied from plan (may be overridden)';
COMMENT ON COLUMN public.organization_plans.max_widgets IS 'Widget limit copied from plan (may be overridden)';
COMMENT ON COLUMN public.organization_plans.max_members IS 'Member limit copied from plan (may be overridden)';
COMMENT ON COLUMN public.organization_plans.show_branding IS 'Branding setting copied from plan (may be overridden)';
COMMENT ON COLUMN public.organization_plans.price_in_base_unit IS 'Actual price paid in smallest currency unit (cents/paise)';
COMMENT ON COLUMN public.organization_plans.has_overrides IS 'True if any limits differ from original plan template';
COMMENT ON COLUMN public.organization_plans.override_reason IS 'Audit trail: explanation for why overrides were applied';
COMMENT ON COLUMN public.organization_plans.overridden_by IS 'User who applied the overrides';
COMMENT ON COLUMN public.organization_plans.overridden_at IS 'When overrides were applied';
COMMENT ON COLUMN public.organization_plans.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.organization_plans.updated_at IS 'Timestamp when record was last updated';
