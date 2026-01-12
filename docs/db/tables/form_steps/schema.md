# Form Steps - Schema Reference

**Last Updated**: 2026-01-12-1055 (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |
| `flow_id` | TEXT | NOT NULL | - | FK to flows - parent flow |
| `organization_id` | TEXT | NOT NULL | - | FK to organizations - tenant boundary for RLS |
| `step_type` | TEXT | NOT NULL | - | Type: welcome, question, rating, consent, contact_info, reward, thank_you |
| `step_order` | SMALLINT | NOT NULL | - | Zero-indexed position within the flow |
| `content` | JSONB | NOT NULL | `'{}'` | Type-specific configuration |
| `tips` | TEXT[] | NULL | `'{}'` | Helper text for question/rating steps |
| `flow_membership` | TEXT | NOT NULL | - | DEPRECATED: Legacy column, use flow_id |
| `is_active` | BOOLEAN | NOT NULL | `true` | Soft delete flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp when created |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | Timestamp of last modification |
| `created_by` | TEXT | NULL | - | FK to users - creator |
| `updated_by` | TEXT | NULL | - | FK to users - last modifier |

## Ownership Hierarchy (ADR-013)

Steps belong to flows. Questions belong to steps. Derive form via: `step.flow.form`

```
form → flow → step → question → options
```

## Primary Key
- `form_steps_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `fk_form_steps_flow_id` - FOREIGN KEY (`flow_id`) REFERENCES `flows(id)` ON DELETE CASCADE
- `fk_form_steps_organization_id` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE RESTRICT
- `fk_form_steps_created_by` - FOREIGN KEY (`created_by`) REFERENCES `users(id)` ON DELETE SET NULL
- `fk_form_steps_updated_by` - FOREIGN KEY (`updated_by`) REFERENCES `users(id)` ON DELETE SET NULL

## Unique Constraints
- `form_steps_flow_order_unique` - UNIQUE (`flow_id`, `step_order`)

## Check Constraints
- `form_steps_step_type_check` - step_type IN ('welcome', 'question', 'rating', 'consent', 'contact_info', 'reward', 'thank_you')

## Indexes
- `idx_form_steps_flow_id` - BTREE (`flow_id`)
- `idx_form_steps_organization_id` - BTREE (`organization_id`)

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp

## Content JSONB Schema by Step Type

| Step Type | Content Schema |
|-----------|---------------|
| `welcome` | `{ title, subtitle, buttonText }` |
| `question` | `{}` (uses form_questions) |
| `rating` | `{}` (uses form_questions) |
| `consent` | `{ title, description, options: { public, private } }` |
| `contact_info` | `{ title, subtitle, enabledFields[], requiredFields[] }` |
| `reward` | `{ title, description, rewardType, couponCode?, downloadUrl? }` |
| `thank_you` | `{ title, message, showSocialShare, redirectUrl? }` |
