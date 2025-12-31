# Widget Testimonials Table Documentation

## Doc Connections
**ID**: `table-widget_testimonials`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-widgets` - Junction links widgets
- `table-testimonials` - Junction links testimonials
- `table-organizations` - Org-scoped for multi-tenancy
- `table-users` - Added by users

---

## Overview

Many-to-many junction table linking widgets to testimonials with display ordering and featured flag. Each testimonial can appear in multiple widgets, and each widget can show multiple testimonials.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078552000_2025_12_30_1239__widget_testimonials__create_table` | Create junction table with ordering |

## Relationships

### Object Relationships (Many-to-One)
- `widget` -> widgets via widget_id
- `testimonial` -> testimonials via testimonial_id
- `organization` -> organizations via organization_id
- `added_by_user` -> users via added_by

### Array Relationships (One-to-Many)
None

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
