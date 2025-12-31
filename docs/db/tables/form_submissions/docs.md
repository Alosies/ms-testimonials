# Form Submissions Table Documentation

## Doc Connections
**ID**: `table-form_submissions`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-forms` - Submissions belong to forms
- `table-form_question_responses` - Submissions have responses
- `table-testimonials` - Submissions generate testimonials
- `table-organizations` - Org-scoped for multi-tenancy

---

## Overview

Raw form submission events capturing submitter information (name, email, company, social links). This is the source of truth for customer identity. Responses are stored separately in form_question_responses.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078312000_2025_12_30_1235__form_submissions__create_table` | Create table with submitter info columns |

## Relationships

### Object Relationships (Many-to-One)
- `form` -> forms via form_id
- `organization` -> organizations via organization_id
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
- `responses` <- form_question_responses via submission_id
- `testimonials` <- testimonials via submission_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
