# Organizations Schema Reference

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Table Structure

```sql
CREATE TABLE public.organizations (
    id              TEXT NOT NULL DEFAULT generate_nanoid_12(),
    name            TEXT NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    logo_url        TEXT,
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_by      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT organizations_slug_unique UNIQUE (slug),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    CONSTRAINT organizations_created_by_fk
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | Primary key (NanoID 12-char) |
| `name` | TEXT | NOT NULL | Organization display name |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL-friendly unique identifier for public URLs |
| `logo_url` | TEXT | NULL | Organization logo image URL |
| `settings` | JSONB | NOT NULL, DEFAULT '{}' | UI preferences only (theme, locale) - not business logic |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag - false means organization is deactivated |
| `created_by` | TEXT | NULL, FK | User who created this organization |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was last updated |

## Constraints

### Foreign Key Constraints
- `organizations_created_by_fk` - FOREIGN KEY (`created_by`) REFERENCES `users(id)` ON DELETE SET NULL

### Unique Constraints
- `organizations_slug_unique` - UNIQUE (`slug`)

### Check Constraints
- `organizations_slug_format` - Validates slug format (lowercase alphanumeric with hyphens)

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `organizations_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_organizations_slug` | `slug` | UNIQUE | Slug lookup |
| `idx_organizations_active` | `id` | Partial (WHERE is_active = true) | Active orgs filter |
| `idx_organizations_created_by` | `created_by` | B-tree | Creator lookup |

## Triggers

- `organizations_updated_at_trigger` - Auto-updates `updated_at` on record modification
