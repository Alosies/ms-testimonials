# Widgets - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key - used in embed code |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `created_by` | TEXT | NOT NULL | - | FK to users - who created widget |
| `name` | TEXT | NOT NULL | - | Display name in dashboard |
| `type` | TEXT | NOT NULL | - | Layout: wall_of_love, carousel, single_quote |
| `theme` | TEXT | NOT NULL | `'light'` | Color scheme: light or dark |
| `show_ratings` | BOOLEAN | NOT NULL | `true` | Whether to display star ratings |
| `show_dates` | BOOLEAN | NOT NULL | `false` | Whether to display submission dates |
| `show_company` | BOOLEAN | NOT NULL | `true` | Whether to display company name |
| `show_avatar` | BOOLEAN | NOT NULL | `true` | Whether to display customer photo |
| `max_display` | SMALLINT | NULL | - | Max testimonials to show (NULL = all) |
| `settings` | JSONB | NOT NULL | `'{}'::jsonb` | Type-specific settings (carousel_speed, columns) |
| `is_active` | BOOLEAN | NOT NULL | `true` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Last modification timestamp |
| `updated_by` | TEXT | NULL | - | FK to users - who last modified |

## Primary Key
- `widgets_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `widgets_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `widgets_created_by_fk` - FOREIGN KEY (`created_by`) REFERENCES `users(id)` ON DELETE SET NULL
- `widgets_updated_by_fk` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Check Constraints
- `widgets_type_check` - type IN ('wall_of_love', 'carousel', 'single_quote')
- `widgets_theme_check` - theme IN ('light', 'dark')

## Indexes
- `idx_widgets_org` - BTREE (`organization_id`)
- `idx_widgets_active` - BTREE (`organization_id`) WHERE is_active = true

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp

## Widget Types

| Type | Description | Use Case |
|------|-------------|----------|
| `wall_of_love` | Grid/masonry layout | Homepage testimonials section |
| `carousel` | Sliding testimonial cards | Limited space, multiple testimonials |
| `single_quote` | Featured single testimonial | Hero sections, landing pages |

## Settings JSONB Structure

```json
// wall_of_love
{
  "columns": 3,
  "gap": 16
}

// carousel
{
  "autoplay": true,
  "interval": 5000,
  "showArrows": true,
  "showDots": true
}

// single_quote
{
  "size": "large",
  "showQuotes": true
}
```
