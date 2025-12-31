# Widget Testimonials - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `widget_id` | TEXT | NOT NULL | - | FK to widgets - which widget contains this |
| `testimonial_id` | TEXT | NOT NULL | - | FK to testimonials - which testimonial is displayed |
| `display_order` | SMALLINT | NOT NULL | - | Order in widget display, unique per widget |
| `is_featured` | BOOLEAN | NOT NULL | `false` | Highlighted/pinned testimonial |
| `added_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | When testimonial was added to widget |
| `added_by` | TEXT | NULL | - | FK to users - who added this |

## Primary Key
- `widget_testimonials_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `widget_testimonials_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `widget_testimonials_widget_fk` - FOREIGN KEY (`widget_id`) REFERENCES `widgets(id)` ON DELETE CASCADE
- `widget_testimonials_testimonial_fk` - FOREIGN KEY (`testimonial_id`) REFERENCES `testimonials(id)` ON DELETE CASCADE
- `widget_testimonials_added_by_fk` - FOREIGN KEY (`added_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Unique Constraints
- `widget_testimonials_unique` - UNIQUE (`widget_id`, `testimonial_id`)
- `widget_testimonials_order_unique` - UNIQUE (`widget_id`, `display_order`)

## Indexes
- `idx_widget_testimonials_org` - BTREE (`organization_id`)
- `idx_widget_testimonials_widget` - BTREE (`widget_id`)
- `idx_widget_testimonials_testimonial` - BTREE (`testimonial_id`)
- `idx_widget_testimonials_order` - BTREE (`widget_id`, `display_order`)
