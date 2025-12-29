-- =====================================================
-- Plans Table Creation
-- =====================================================
-- Purpose: Plan templates defining features and limits (pricing in plan_prices)
-- Dependencies: nanoid utility-function, updated_at utility-function

CREATE TABLE public.plans (
    id                  TEXT NOT NULL DEFAULT generate_nanoid_12(),
    unique_name         VARCHAR(50) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    max_testimonials    INTEGER NOT NULL,
    max_forms           INTEGER NOT NULL,
    max_widgets         INTEGER NOT NULL,
    max_members         INTEGER NOT NULL,
    show_branding       BOOLEAN NOT NULL DEFAULT true,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT plans_unique_name_unique UNIQUE (unique_name)
);

-- Indexes
CREATE INDEX idx_plans_unique_name ON public.plans(unique_name);
CREATE INDEX idx_plans_active ON public.plans(id) WHERE is_active = true;

-- Trigger
SELECT add_updated_at_trigger('plans', 'public');

-- Seed default plans
INSERT INTO plans (unique_name, name, description, max_testimonials, max_forms, max_widgets, max_members, show_branding) VALUES
    ('free', 'Free', 'Get started with testimonials', 50, 1, 1, 1, true),
    ('pro', 'Pro', 'For growing businesses', -1, 5, -1, 1, false),
    ('team', 'Team', 'For teams with multiple members', -1, -1, -1, 3, false);

-- Documentation
COMMENT ON TABLE public.plans IS 'Plan templates - features/limits only, pricing in plan_prices';
COMMENT ON COLUMN public.plans.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.plans.unique_name IS 'Slug for code comparisons (free, pro, team)';
COMMENT ON COLUMN public.plans.name IS 'Display-ready label for UI (Free, Pro, Team)';
COMMENT ON COLUMN public.plans.description IS 'Human-readable description of the plan';
COMMENT ON COLUMN public.plans.max_testimonials IS 'Maximum testimonials allowed (-1 = unlimited)';
COMMENT ON COLUMN public.plans.max_forms IS 'Maximum collection forms allowed (-1 = unlimited)';
COMMENT ON COLUMN public.plans.max_widgets IS 'Maximum display widgets allowed (-1 = unlimited)';
COMMENT ON COLUMN public.plans.max_members IS 'Maximum team members allowed (-1 = unlimited)';
COMMENT ON COLUMN public.plans.show_branding IS 'Whether to show "Powered by" branding on widgets';
COMMENT ON COLUMN public.plans.is_active IS 'Whether plan is available for new subscriptions';
COMMENT ON COLUMN public.plans.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.plans.updated_at IS 'Timestamp when record was last updated';
