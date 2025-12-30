# Organization Plans Schema Reference

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Table Structure

```sql
CREATE TABLE public.organization_plans (
    id                      TEXT NOT NULL DEFAULT generate_nanoid_12(),
    organization_id         TEXT NOT NULL,
    plan_id                 TEXT NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'active',
    billing_cycle           TEXT NOT NULL,
    currency_code           VARCHAR(3) NOT NULL DEFAULT 'USD',
    starts_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_ends_at  TIMESTAMPTZ,
    trial_ends_at           TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    max_forms               INTEGER NOT NULL,
    max_testimonials        INTEGER NOT NULL,
    max_widgets             INTEGER NOT NULL,
    max_members             INTEGER NOT NULL,
    show_branding           BOOLEAN NOT NULL,
    price_in_base_unit      INTEGER NOT NULL,
    has_overrides           BOOLEAN NOT NULL DEFAULT false,
    override_reason         TEXT,
    overridden_by           TEXT,
    overridden_at           TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT org_plans_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_plans_plan_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id),
    CONSTRAINT org_plans_overridden_by_fk FOREIGN KEY (overridden_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT org_plans_status_check CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
    CONSTRAINT org_plans_billing_check CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    CONSTRAINT org_plans_currency_check CHECK (currency_code ~ '^[A-Z]{3}$')
);
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | Primary key (NanoID 12-char) |
| `organization_id` | TEXT | NOT NULL, FK | Organization this subscription belongs to |
| `plan_id` | TEXT | NOT NULL, FK | Reference to original plan template for analytics/reporting |
| `status` | TEXT | NOT NULL, DEFAULT 'active' | Subscription status: trial, active, cancelled, expired |
| `billing_cycle` | TEXT | NOT NULL | Billing frequency: monthly, yearly, lifetime |
| `currency_code` | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | ISO 4217 currency code for this subscription |
| `starts_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When subscription started |
| `current_period_ends_at` | TIMESTAMPTZ | NULL | When current billing period ends (NULL for lifetime) |
| `trial_ends_at` | TIMESTAMPTZ | NULL | When trial period ends (NULL if not on trial) |
| `cancelled_at` | TIMESTAMPTZ | NULL | When subscription was cancelled (NULL if active) |
| `max_forms` | INTEGER | NOT NULL | Form limit copied from plan (may be overridden) |
| `max_testimonials` | INTEGER | NOT NULL | Testimonial limit copied from plan (may be overridden) |
| `max_widgets` | INTEGER | NOT NULL | Widget limit copied from plan (may be overridden) |
| `max_members` | INTEGER | NOT NULL | Member limit copied from plan (may be overridden) |
| `show_branding` | BOOLEAN | NOT NULL | Branding setting copied from plan (may be overridden) |
| `price_in_base_unit` | INTEGER | NOT NULL | Actual price paid in smallest currency unit (cents/paise) |
| `has_overrides` | BOOLEAN | NOT NULL, DEFAULT false | True if any limits differ from original plan template |
| `override_reason` | TEXT | NULL | Audit trail: explanation for why overrides were applied |
| `overridden_by` | TEXT | NULL, FK | User who applied the overrides |
| `overridden_at` | TIMESTAMPTZ | NULL | When overrides were applied |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was last updated |

## Constraints

### Foreign Key Constraints
- `org_plans_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `org_plans_plan_fk` - FOREIGN KEY (`plan_id`) REFERENCES `plans(id)`
- `org_plans_overridden_by_fk` - FOREIGN KEY (`overridden_by`) REFERENCES `users(id)` ON DELETE SET NULL

### Check Constraints
- `org_plans_status_check` - status IN ('trial', 'active', 'cancelled', 'expired')
- `org_plans_billing_check` - billing_cycle IN ('monthly', 'yearly', 'lifetime')
- `org_plans_currency_check` - Validates ISO 4217 format

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `organization_plans_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_org_plans_active` | `organization_id` | UNIQUE Partial (WHERE status IN ('trial', 'active')) | One active sub per org |
| `idx_org_plans_org` | `organization_id` | B-tree | Organization lookup |
| `idx_org_plans_plan` | `plan_id` | B-tree | Plan lookup |
| `idx_org_plans_status` | `status` | B-tree | Status filter |
| `idx_org_plans_expiring` | `current_period_ends_at` | Partial (WHERE status = 'active') | Expiring subscriptions |

## Triggers

- `organization_plans_updated_at_trigger` - Auto-updates `updated_at` on record modification
