# Form Questions Table Documentation

## Doc Connections
**ID**: `table-form_questions`

2026-01-12-1045 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-form_steps` - Questions belong to steps (1:1 relationship)
- `table-question_types` - Questions reference question types
- `table-question_options` - Choice questions have options
- `table-form_question_responses` - Questions receive responses
- `table-organizations` - Org-scoped for multi-tenancy

---

## Overview

Form questions with typed validation rules linked to specific question types. Explicit columns instead of JSONB for type safety and queryability. Questions belong to steps (1:1 relationship) - derive form via `question.step.flow.form`.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078192000_2025_12_30_1233__form_questions__create_table` | Create table with typed validation columns |
| `1768192138001__form_questions__add_step_id_column` | Add step_id FK (ADR-013: invert step-question relationship) |
| `1768192146720__form_questions__drop_form_id_column` | Drop form_id (ADR-013: derive form via step.flow) |

## Relationships

### Object Relationships (Many-to-One)
- `step` -> form_steps via step_id (parent - CASCADE delete)
- `organization` -> organizations via organization_id
- `question_type` -> question_types via question_type_id
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
- `options` <- question_options via question_id
- `responses` <- form_question_responses via question_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
