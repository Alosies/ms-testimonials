# Question Options - Schema Reference

**Last Updated**: 2025-12-31-1651 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary |
| `question_id` | TEXT | NOT NULL | - | FK to form_questions - must be choice-type |
| `option_value` | VARCHAR(100) | NOT NULL | - | Stored value saved in responses |
| `option_label` | TEXT | NOT NULL | - | Display text shown to customer |
| `display_order` | SMALLINT | NOT NULL | - | Order in option list, unique per question |
| `is_default` | BOOLEAN | NOT NULL | `false` | Pre-selected when form loads |
| `is_active` | BOOLEAN | NOT NULL | `true` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp when created |
| `created_by` | TEXT | NOT NULL | - | FK to users - user who created |

## Primary Key
- `question_options_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `question_options_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `question_options_question_fk` - FOREIGN KEY (`question_id`) REFERENCES `form_questions(id)` ON DELETE CASCADE
- `question_options_created_by_fk` - FOREIGN KEY (`created_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Unique Constraints
- `question_options_value_per_question_unique` - UNIQUE (`question_id`, `option_value`)
- `question_options_order_per_question_unique` - UNIQUE (`question_id`, `display_order`)

## Indexes
- `idx_question_options_org` - BTREE (`organization_id`)
- `idx_question_options_question` - BTREE (`question_id`)
- `idx_question_options_order` - BTREE (`question_id`, `display_order`)
