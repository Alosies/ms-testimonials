# Layer 2: Multi-Tenancy

**Tables:** plans, plan_prices, organizations, organization_plans, organization_roles

---

## 2.1 Plans Table

Plan templates defining features and limits only. Pricing is in `plan_prices` table.

```sql
CREATE TABLE public.plans (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    unique_name         VARCHAR(50) NOT NULL,   -- Slug for code comparisons (free, pro, team)
    name                VARCHAR(100) NOT NULL,  -- Display label for UI (Free, Pro, Team)
    description         TEXT,
    -- Explicit limit columns instead of JSONB
    max_testimonials    INTEGER NOT NULL,  -- -1 = unlimited
    max_forms           INTEGER NOT NULL,
    max_widgets         INTEGER NOT NULL,
    max_members         INTEGER NOT NULL,
    show_branding       BOOLEAN NOT NULL DEFAULT true,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT plans_unique_name_unique UNIQUE (unique_name)
);

SELECT add_updated_at_trigger('plans');

-- Seed default plans
INSERT INTO plans (unique_name, name, description, max_testimonials, max_forms, max_widgets, max_members, show_branding) VALUES
    ('free', 'Free', 'Get started with testimonials', 50, 1, 1, 1, true),
    ('pro', 'Pro', 'For growing businesses', -1, 5, -1, 1, false),
    ('team', 'Team', 'For teams with multiple members', -1, -1, -1, 3, false);

COMMENT ON TABLE plans IS 'Plan templates - features/limits only, pricing in plan_prices';
COMMENT ON COLUMN plans.unique_name IS 'Slug for code comparisons (free, pro, team)';
COMMENT ON COLUMN plans.name IS 'Display-ready label for UI (Free, Pro, Team)';
COMMENT ON COLUMN plans.max_testimonials IS '-1 means unlimited';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `unique_name` | VARCHAR(50) | NOT NULL, UNIQUE | Slug for code lookups |
| `name` | VARCHAR(100) | NOT NULL | Display label |
| `max_testimonials` | INTEGER | NOT NULL | Limit (-1 = unlimited) |
| `max_forms` | INTEGER | NOT NULL | Limit (-1 = unlimited) |
| `max_widgets` | INTEGER | NOT NULL | Limit (-1 = unlimited) |
| `max_members` | INTEGER | NOT NULL | Limit (-1 = unlimited) |
| `show_branding` | BOOLEAN | NOT NULL | Show "Powered by" badge |
| `is_active` | BOOLEAN | NOT NULL | Available for new subscriptions |

---

## 2.2 Plan Prices Table

Multi-currency pricing for plans. Prices stored in smallest currency unit (cents for USD, paise for INR).

```sql
CREATE TABLE public.plan_prices (
    id                              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    plan_id                         TEXT NOT NULL,
    currency_code                   VARCHAR(3) NOT NULL DEFAULT 'USD',  -- ISO 4217
    -- Prices in smallest currency unit (cents, paise, etc.)
    price_monthly_in_base_unit      INTEGER NOT NULL DEFAULT 0,
    price_yearly_in_base_unit       INTEGER NOT NULL DEFAULT 0,
    price_lifetime_in_base_unit     INTEGER,  -- NULL if not offered
    is_active                       BOOLEAN NOT NULL DEFAULT true,
    created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT plan_prices_plan_fk
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    CONSTRAINT plan_prices_unique
        UNIQUE (plan_id, currency_code),
    CONSTRAINT plan_prices_currency_check
        CHECK (currency_code ~ '^[A-Z]{3}$')
);

CREATE INDEX idx_plan_prices_plan ON plan_prices(plan_id);
CREATE INDEX idx_plan_prices_currency ON plan_prices(currency_code);

SELECT add_updated_at_trigger('plan_prices');

-- Seed pricing (after plans are seeded)
INSERT INTO plan_prices (plan_id, currency_code, price_monthly_in_base_unit, price_yearly_in_base_unit, price_lifetime_in_base_unit)
SELECT id, 'USD', 0, 0, NULL FROM plans WHERE unique_name = 'free'
UNION ALL
SELECT id, 'USD', 0, 0, 4900 FROM plans WHERE unique_name = 'pro'
UNION ALL
SELECT id, 'INR', 0, 0, 99900 FROM plans WHERE unique_name = 'pro'  -- ₹999
UNION ALL
SELECT id, 'USD', 0, 0, 9900 FROM plans WHERE unique_name = 'team'
UNION ALL
SELECT id, 'INR', 0, 0, 199900 FROM plans WHERE unique_name = 'team';  -- ₹1999

COMMENT ON TABLE plan_prices IS 'Multi-currency pricing - prices in smallest currency unit';
COMMENT ON COLUMN plan_prices.currency_code IS 'ISO 4217 currency code (USD, INR, EUR)';
COMMENT ON COLUMN plan_prices.price_monthly_in_base_unit IS 'Price in smallest unit: 4900 = $49.00 USD or ₹49.00 INR';
```

### Price Storage Convention

| Currency | Base Unit | Example |
|----------|-----------|---------|
| USD | cents | 4900 = $49.00 |
| INR | paise | 99900 = ₹999.00 |
| EUR | cents | 4500 = €45.00 |

---

## 2.3 Organizations Table

Tenant boundary. Plan subscription managed via `organization_plans` table.

```sql
CREATE TABLE public.organizations (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    name            TEXT NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    logo_url        TEXT,
    -- UI preferences only - not business logic
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_by      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT organizations_slug_unique UNIQUE (slug),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    CONSTRAINT organizations_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(id) WHERE is_active = true;

SELECT add_updated_at_trigger('organizations');

COMMENT ON TABLE organizations IS 'Tenant boundary - plan subscription via organization_plans';
COMMENT ON COLUMN organizations.settings IS 'UI preferences only (theme, locale) - not business logic';

-- Usage counts exposed via Hasura computed fields (no denormalization)
-- See computed-fields.md for implementation
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `name` | TEXT | NOT NULL | Organization name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| `logo_url` | TEXT | NULL | Logo image URL |
| `settings` | JSONB | NOT NULL | UI preferences only |
| `is_active` | BOOLEAN | NOT NULL | Soft delete flag |
| `created_by` | TEXT | FK → users | Creator user |

---

## 2.4 Organization Plans Table

Subscription records with plan values copied at subscription time. Supports overrides for custom deals.

```sql
CREATE TABLE public.organization_plans (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     TEXT NOT NULL,
    plan_id             TEXT NOT NULL,  -- Reference to original plan (for analytics)

    -- Subscription status
    status              TEXT NOT NULL DEFAULT 'active',
    billing_cycle       TEXT NOT NULL,
    currency_code       VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Timeline
    starts_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_ends_at TIMESTAMPTZ,  -- NULL for lifetime
    trial_ends_at       TIMESTAMPTZ,
    cancelled_at        TIMESTAMPTZ,

    -- COPIED from plan at subscription time (source of truth for this org)
    max_forms           INTEGER NOT NULL,
    max_testimonials    INTEGER NOT NULL,
    max_widgets         INTEGER NOT NULL,
    max_members         INTEGER NOT NULL,
    show_branding       BOOLEAN NOT NULL,
    price_in_base_unit  INTEGER NOT NULL,  -- Actual price paid in currency_code

    -- Override audit trail
    has_overrides       BOOLEAN NOT NULL DEFAULT false,
    override_reason     TEXT,
    overridden_by       TEXT,
    overridden_at       TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT org_plans_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_plans_plan_fk
        FOREIGN KEY (plan_id) REFERENCES plans(id),
    CONSTRAINT org_plans_overridden_by_fk
        FOREIGN KEY (overridden_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT org_plans_status_check
        CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
    CONSTRAINT org_plans_billing_check
        CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    CONSTRAINT org_plans_currency_check
        CHECK (currency_code ~ '^[A-Z]{3}$')
);

-- Only one active/trial plan per organization
CREATE UNIQUE INDEX idx_org_plans_active
    ON organization_plans(organization_id)
    WHERE status IN ('trial', 'active');

CREATE INDEX idx_org_plans_org ON organization_plans(organization_id);
CREATE INDEX idx_org_plans_status ON organization_plans(status);
CREATE INDEX idx_org_plans_expiring ON organization_plans(current_period_ends_at)
    WHERE status = 'active' AND current_period_ends_at IS NOT NULL;

SELECT add_updated_at_trigger('organization_plans');

COMMENT ON TABLE organization_plans IS 'Subscription records - plan values copied at subscription time';
COMMENT ON COLUMN organization_plans.plan_id IS 'Reference to original plan for analytics/reporting';
COMMENT ON COLUMN organization_plans.max_forms IS 'Copied from plan, may be overridden for custom deals';
COMMENT ON COLUMN organization_plans.has_overrides IS 'True if any limits differ from original plan';
COMMENT ON COLUMN organization_plans.override_reason IS 'Audit trail: why overrides were applied';
COMMENT ON COLUMN organization_plans.price_in_base_unit IS 'Actual price in smallest currency unit (cents/paise)';
```

### Subscription Statuses

| Status | Description |
|--------|-------------|
| `trial` | Trial period active |
| `active` | Paid subscription active |
| `cancelled` | User cancelled, access until period ends |
| `expired` | Subscription ended |

### Override Workflow

When applying custom limits:
1. Set `has_overrides = true`
2. Update specific limit columns (e.g., `max_testimonials`)
3. Record `override_reason` (e.g., "Enterprise deal - unlimited testimonials")
4. Set `overridden_by` to admin user ID
5. Set `overridden_at` to current timestamp

---

## 2.5 Organization Roles Table

User ↔ Organization ↔ Role junction table. A user can have different roles in different organizations.

```sql
CREATE TABLE public.organization_roles (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    user_id             TEXT NOT NULL,
    organization_id     TEXT NOT NULL,
    role_id             TEXT NOT NULL,  -- No default; app must lookup role by unique_name
    is_default_org      BOOLEAN NOT NULL DEFAULT false,  -- User's default organization
    is_active           BOOLEAN NOT NULL DEFAULT true,
    invited_by          TEXT,
    invited_at          TIMESTAMPTZ,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT org_roles_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_role_fk
        FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT org_roles_invited_by_fk
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT org_roles_unique
        UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_org_roles_user ON organization_roles(user_id);
CREATE INDEX idx_org_roles_org ON organization_roles(organization_id);
CREATE INDEX idx_org_roles_active ON organization_roles(user_id, organization_id)
    WHERE is_active = true;
CREATE UNIQUE INDEX idx_org_roles_one_default
    ON organization_roles(user_id) WHERE is_default_org = true;

SELECT add_updated_at_trigger('organization_roles');

COMMENT ON TABLE organization_roles IS 'User-Organization-Role junction - users can have different roles in different orgs';
COMMENT ON COLUMN organization_roles.role_id IS 'FK to roles - app must lookup role.id by role.unique_name';
```

### Role Assignment Pattern

```sql
-- Assign owner role to user when creating organization
INSERT INTO organization_roles (user_id, organization_id, role_id, is_default_org)
SELECT $user_id, $org_id, id, true
FROM roles WHERE unique_name = 'owner';
```
