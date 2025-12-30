# Plans Schema Reference

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Table Structure

```sql
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
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | Primary key (NanoID 12-char) |
| `unique_name` | VARCHAR(50) | NOT NULL, UNIQUE | Slug for code comparisons (free, pro, team) |
| `name` | VARCHAR(100) | NOT NULL | Display-ready label for UI (Free, Pro, Team) |
| `description` | TEXT | NULL | Human-readable description of the plan |
| `max_testimonials` | INTEGER | NOT NULL | Maximum testimonials allowed (-1 = unlimited) |
| `max_forms` | INTEGER | NOT NULL | Maximum collection forms allowed (-1 = unlimited) |
| `max_widgets` | INTEGER | NOT NULL | Maximum display widgets allowed (-1 = unlimited) |
| `max_members` | INTEGER | NOT NULL | Maximum team members allowed (-1 = unlimited) |
| `show_branding` | BOOLEAN | NOT NULL, DEFAULT true | Whether to show "Powered by" branding on widgets |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Whether plan is available for new subscriptions |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was last updated |

## Constraints

### Unique Constraints
- `plans_unique_name_unique` - Ensures unique_name uniqueness

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `plans_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_plans_unique_name` | `unique_name` | B-tree | Lookup by slug |
| `idx_plans_active` | `id` | Partial (WHERE is_active = true) | Active plans filter |

## Triggers

- `plans_updated_at_trigger` - Auto-updates `updated_at` on record modification
