# Form Question Responses Table Documentation

## Doc Connections
**ID**: `table-form_question_responses`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-form_submissions` - Responses belong to submissions
- `table-form_questions` - Responses answer questions
- `table-organizations` - Org-scoped for multi-tenancy

---

## Overview

Raw form submission responses with typed answer columns for different data types. This is internal data used for AI testimonial assembly, not displayed directly on widgets. One response per question per submission.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078372000_2025_12_30_1236__form_question_responses__create_table` | Create table with typed answer columns |

## Relationships

### Object Relationships (Many-to-One)
- `submission` -> form_submissions via submission_id
- `question` -> form_questions via question_id
- `organization` -> organizations via organization_id
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
None

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
