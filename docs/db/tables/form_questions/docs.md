# Form Questions Table Documentation

## Doc Connections
**ID**: `table-form_questions`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-forms` - Questions belong to forms
- `table-question_types` - Questions reference question types
- `table-question_options` - Choice questions have options
- `table-form_question_responses` - Questions receive responses
- `table-organizations` - Org-scoped for multi-tenancy

---

## Overview

Form questions with typed validation rules linked to specific question types. Explicit columns instead of JSONB for type safety and queryability. Supports validation constraints based on question type capabilities.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078192000_2025_12_30_1233__form_questions__create_table` | Create table with typed validation columns |

## Relationships

### Object Relationships (Many-to-One)
- `form` -> forms via form_id
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
