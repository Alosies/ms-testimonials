# Organizations Table Documentation

## Doc Connections
**ID**: `table-organizations`

2025-12-30-1200 IST

**Parent ReadMes**:
- `db-layer-2-multitenancy` - Layer 2 Multi-Tenancy tables

**Related ReadMes**:
- `table-users` - Organization creator reference
- `table-organization-plans` - Subscription records for this org
- `table-organization-roles` - Member role assignments

---

## Migration Sync
**Last Migration**: `1767030326000_2025_12_29_2315__organizations__create_table`
**Status**: ✅ Current

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767030326000_2025_12_29_2315__organizations__create_table` | 2025-12-29 | Initial table creation - tenant boundary |

## Overview

Organizations are the tenant boundary for multi-tenancy. All business entities (forms, testimonials, widgets) belong to organizations. Plan subscriptions are managed via `organization_plans` table rather than direct FK to plans.

### Key Design Decisions
- **Tenant isolation**: Organization is the multi-tenancy boundary
- **Subscription via junction**: Uses `organization_plans` for subscription records
- **Settings JSONB**: Only for UI preferences (theme, locale), not business logic
- **Slug validation**: Lowercase alphanumeric with hyphens only
- **Soft delete**: `is_active` flag instead of hard deletes

## Relationships

**Object Relationships** (Many-to-One):
- `created_by_user` → `users.id` - User who created the org

**Array Relationships** (One-to-Many):
- `organization_plans` ← `organization_plans.organization_id` - Subscription records
- `organization_roles` ← `organization_roles.organization_id` - Member role assignments

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
