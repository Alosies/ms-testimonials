# Flows - Schema Reference

**Last Updated**: 2026-01-12-1050 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `form_id` | TEXT | NOT NULL | - | FK to forms - parent form |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary for RLS |
| `name` | TEXT | NOT NULL | - | Human-readable name (e.g., "Shared Steps", "Testimonial Flow") |
| `flow_type` | TEXT | NOT NULL | - | Type: 'shared' or 'branch' |
| `is_primary` | BOOLEAN | NOT NULL | `false` | True for the main flow (exactly one per form) |
| `branch_question_id` | TEXT | NULL | - | FK to form_questions - question for branch condition |
| `branch_field` | TEXT | NULL | - | Response column to evaluate (answer_integer, etc.) |
| `branch_operator` | TEXT | NULL | - | Comparison operator (greater_than_or_equal_to, etc.) |
| `branch_value` | JSONB | NULL | - | Comparison value {type, value} |
| `display_order` | SMALLINT | NOT NULL | `0` | Order for UI display (shared=0, branches=1,2,...) |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp when created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp of last modification |

## Ownership Hierarchy (ADR-013)

Flows belong to forms. Each form has exactly one primary flow.

```
form → flow (is_primary=true) → steps → questions
     → flow (is_primary=false) → steps → questions
```

## Primary Key
- `flows_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `fk_flows_form_id` - FOREIGN KEY (`form_id`) REFERENCES `forms(id)` ON DELETE CASCADE
- `fk_flows_organization_id` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE RESTRICT
- `fk_flows_branch_question` - FOREIGN KEY (`branch_question_id`) REFERENCES `form_questions(id)` ON DELETE RESTRICT

## Unique Constraints
- `flows_form_name_unique` - UNIQUE (`form_id`, `name`)
- `idx_flows_primary_per_form` - UNIQUE (`form_id`) WHERE is_primary = true (partial)

## Check Constraints
- `chk_flows_flow_type` - flow_type IN ('shared', 'branch')
- `chk_flows_branch_field` - Valid response column names
- `chk_flows_branch_operator` - Valid comparison operators
- `chk_flows_primary_no_branch` - Primary flows have no branch conditions
- `chk_flows_branch_requires_conditions` - Branch flows require conditions

## Indexes
- `idx_flows_form_id` - BTREE (`form_id`)
- `idx_flows_organization_id` - BTREE (`organization_id`)
- `idx_flows_form_order` - BTREE (`form_id`, `display_order`)
- `idx_flows_branch_question_id` - BTREE (`branch_question_id`) WHERE NOT NULL

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp
