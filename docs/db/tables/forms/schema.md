# Forms - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `created_by` | TEXT | NOT NULL | - | FK to users - user who created this form |
| `updated_by` | TEXT | NULL | - | FK to users - user who last modified |
| `name` | TEXT | NOT NULL | - | Form display name shown in dashboard |
| `slug` | TEXT | NOT NULL | - | URL-friendly identifier for public form link |
| `product_name` | TEXT | NOT NULL | - | Name of product being reviewed |
| `product_description` | TEXT | NULL | - | AI context for question generation |
| `settings` | JSONB | NOT NULL | `'{}'::jsonb` | UI preferences (theme colors, branding) |
| `is_active` | BOOLEAN | NOT NULL | `true` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp when form was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp of last modification |

## Primary Key
- `forms_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `forms_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `forms_created_by_fk` - FOREIGN KEY (`created_by`) REFERENCES `users(id)` ON DELETE SET NULL
- `forms_updated_by_fk` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Unique Constraints
- `forms_slug_per_org_unique` - UNIQUE (`organization_id`, `slug`)

## Check Constraints
- `forms_slug_format` - slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'

## Indexes
- `idx_forms_org` - BTREE (`organization_id`)
- `idx_forms_slug` - BTREE (`organization_id`, `slug`)
- `idx_forms_active` - BTREE (`organization_id`) WHERE is_active = true

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp
