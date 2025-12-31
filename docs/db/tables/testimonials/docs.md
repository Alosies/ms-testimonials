# Testimonials Table Documentation

## Doc Connections
**ID**: `table-testimonials`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-form_submissions` - Testimonials link to submissions
- `table-widget_testimonials` - Testimonials displayed in widgets
- `table-organizations` - Org-scoped for multi-tenancy
- `table-users` - Approved/rejected by users

---

## Overview

The displayable testimonial entity containing the curated quote, rating, and customer information. This is what widgets display. Can be created from form submissions, imported from external sources, or manually entered.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078432000_2025_12_30_1237__testimonials__create_table` | Create table with status workflow and source tracking |

## Relationships

### Object Relationships (Many-to-One)
- `organization` -> organizations via organization_id
- `submission` -> form_submissions via submission_id
- `approver` -> users via approved_by
- `rejecter` -> users via rejected_by
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
- `widget_placements` <- widget_testimonials via testimonial_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
