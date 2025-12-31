# Widgets Table Documentation

## Doc Connections
**ID**: `table-widgets`

2025-12-31-1651 IST

**Parent ReadMes**:
- `db-layer-3-business` - Layer 3 business tables

**Related ReadMes**:
- `table-widget_testimonials` - Junction table for widget testimonials
- `table-testimonials` - Widgets display testimonials
- `table-organizations` - Org-scoped for multi-tenancy
- `table-users` - Created/updated by users

---

## Overview

Embeddable widgets for displaying approved testimonials on external websites. Supports three types: Wall of Love (grid), Carousel (slider), and Single Quote (featured). Display settings control what information is shown.

## Migration History

| Migration | Summary |
|-----------|----------|
| `1767078492000_2025_12_30_1238__widgets__create_table` | Create table with display settings and type-specific JSONB |

## Relationships

### Object Relationships (Many-to-One)
- `organization` -> organizations via organization_id
- `creator` -> users via created_by
- `updater` -> users via updated_by

### Array Relationships (One-to-Many)
- `testimonial_placements` <- widget_testimonials via widget_id

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
