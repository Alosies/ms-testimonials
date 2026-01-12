# Flows Table Documentation

## Doc Connections
**ID**: `table-flows`

2026-01-12-1050 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-forms` - Flows belong to forms
- `table-form_steps` - Flows contain steps
- `table-form_questions` - Branch flows reference questions
- `table-organizations` - Org-scoped for multi-tenancy

---

## Overview

Defines branching paths for forms. Each form has one primary flow (always shown) and zero or more branch flows (conditional based on rating or other responses). Enables rating-based testimonial/improvement branching and future NPS segmentation.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767693641260__flows__create_table` | Create table with flow_type and branch_condition JSONB |
| `1768018541454__flows__add_branch_columns` | Flatten JSONB to columns (branch_question_id, branch_field, branch_operator, branch_value) |
| `1768192103990__flows__add_is_primary_column` | Add is_primary boolean with unique constraint (ADR-013) |

## Relationships

### Object Relationships (Many-to-One)
- `form` -> forms via form_id (parent - CASCADE delete)
- `organization` -> organizations via organization_id
- `branch_question` -> form_questions via branch_question_id (RESTRICT delete)

### Array Relationships (One-to-Many)
- `steps` <- form_steps via flow_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
