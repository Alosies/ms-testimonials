# Plan Prices Schema Reference

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Table Structure

```sql
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
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | Primary key (NanoID 12-char) |
| `plan_id` | TEXT | NOT NULL, FK | Reference to the plan this price belongs to |
| `currency_code` | VARCHAR(3) | NOT NULL, DEFAULT 'USD' | ISO 4217 currency code (USD, INR, EUR) |
| `price_monthly_in_base_unit` | INTEGER | NOT NULL, DEFAULT 0 | Monthly price in smallest currency unit (cents/paise) |
| `price_yearly_in_base_unit` | INTEGER | NOT NULL, DEFAULT 0 | Yearly price in smallest currency unit (cents/paise) |
| `price_lifetime_in_base_unit` | INTEGER | NULL | Lifetime price in smallest currency unit (NULL if not offered) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether this price is currently active |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was last updated |

## Constraints

### Foreign Key Constraints
- `plan_prices_plan_fk` - FOREIGN KEY (`plan_id`) REFERENCES `plans(id)` ON DELETE CASCADE

### Unique Constraints
- `plan_prices_unique` - UNIQUE (`plan_id`, `currency_code`)

### Check Constraints
- `plan_prices_currency_check` - Validates ISO 4217 format (3 uppercase letters)

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `plan_prices_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_plan_prices_plan` | `plan_id` | B-tree | Plan lookup |
| `idx_plan_prices_currency` | `currency_code` | B-tree | Currency filter |

## Triggers

- `plan_prices_updated_at_trigger` - Auto-updates `updated_at` on record modification
