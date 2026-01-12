# Form Questions - Schema Reference

**Last Updated**: 2026-01-12-1045 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary for RLS |
| `step_id` | TEXT | NULL | - | FK to form_steps - parent step (1:1 relationship) |
| `question_type_id` | TEXT | NOT NULL | - | FK to question_types - determines input component |
| `question_key` | VARCHAR(50) | NOT NULL | - | Semantic identifier unique per form (problem, solution) |
| `question_text` | TEXT | NOT NULL | - | Display text shown to customer |
| `placeholder` | TEXT | NULL | - | Input placeholder hint |
| `help_text` | TEXT | NULL | - | Tooltip help text |
| `display_order` | SMALLINT | NOT NULL | - | Order in form |
| `is_required` | BOOLEAN | NOT NULL | `true` | Whether answer is mandatory |
| `min_length` | INTEGER | NULL | - | Minimum character count for text |
| `max_length` | INTEGER | NULL | - | Maximum character count for text |
| `min_value` | INTEGER | NULL | - | Minimum numeric value for ratings |
| `max_value` | INTEGER | NULL | - | Maximum numeric value for ratings |
| `validation_pattern` | TEXT | NULL | - | Regex pattern for validation |
| `allowed_file_types` | TEXT[] | NULL | - | Allowed MIME types (Post-MVP) |
| `max_file_size_kb` | INTEGER | NULL | - | Max file size in KB (Post-MVP) |
| `is_active` | BOOLEAN | NOT NULL | `true` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp when created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp of last modification |
| `updated_by` | TEXT | NULL | - | FK to users - who last modified |

## Ownership Hierarchy (ADR-013)

Questions belong to steps. Derive form via: `question.step.flow.form`

```
form → flow → step → question → options
```

## Primary Key
- `form_questions_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `form_questions_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `fk_form_questions_step_id` - FOREIGN KEY (`step_id`) REFERENCES `form_steps(id)` ON DELETE CASCADE ON UPDATE CASCADE
- `form_questions_type_fk` - FOREIGN KEY (`question_type_id`) REFERENCES `question_types(id)` ON DELETE RESTRICT
- `form_questions_updated_by_fk` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Unique Constraints
- `idx_form_questions_step_id_unique` - UNIQUE (`step_id`) WHERE step_id IS NOT NULL (1:1 with step)

## Check Constraints
- `form_questions_key_format` - question_key ~ '^[a-z][a-z0-9_]*$'
- `form_questions_length_check` - min_length IS NULL OR max_length IS NULL OR min_length <= max_length
- `form_questions_value_check` - min_value IS NULL OR max_value IS NULL OR min_value <= max_value

## Indexes
- `idx_form_questions_org` - BTREE (`organization_id`)
- `idx_form_questions_step_id` - BTREE (`step_id`)
- `idx_form_questions_type` - BTREE (`question_type_id`)

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp
