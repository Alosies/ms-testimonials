# Question Options Table Documentation

## Doc Connections
**ID**: `table-question_options`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-form_questions` - Options belong to questions
- `table-organizations` - Org-scoped for multi-tenancy
- `table-users` - Created by users

---

## Overview

Predefined choices for choice-type questions (radio, checkbox, dropdown). Each option has a stored value and display label with configurable ordering and default selection.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078252000_2025_12_30_1234__question_options__create_table` | Create table for choice question options |

## Relationships

### Object Relationships (Many-to-One)
- `question` -> form_questions via question_id
- `organization` -> organizations via organization_id
- `creator` -> users via created_by

### Array Relationships (One-to-Many)
None

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
