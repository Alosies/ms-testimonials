# Forms Table Documentation

## Doc Connections
**ID**: `table-forms`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-organizations` - Forms belong to organizations
- `table-form_questions` - Forms have many questions
- `table-form_submissions` - Forms receive submissions
- `table-users` - Created by/updated by users

---

## Overview

Testimonial collection forms with AI context for smart prompts. Each form belongs to an organization and contains questions defined in form_questions table. Forms include product context for AI-powered question generation.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078132000_2025_12_30_1232__forms__create_table` | Create forms table with AI context columns |

## Relationships

### Object Relationships (Many-to-One)
- `organization` -> organizations via organization_id
- `creator` -> users via created_by
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
- `questions` <- form_questions via form_id
- `submissions` <- form_submissions via form_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
