# Roles Table Documentation

## Migration Sync
**Last Migration**: `1767004830000_2025_12_29_1610__roles__create_table`
**Status**: ✅ Current
**Last Updated**: `2025-12-29-1630` (GMT+5:30)

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767004830000_2025_12_29_1610__roles__create_table` | 2025-12-29 | Initial table creation with unique_name+name pattern, explicit permission columns, is_viewer flag, system role seeds (owner, admin, member, viewer) |

---

## Overview

The roles table defines permission sets using explicit boolean columns instead of JSONB. This design enables queryable, constrainable permissions while maintaining simplicity.

### Key Design Decisions
- **`unique_name` + `name` pattern**: Slug for code comparisons, display label for UI
- **Explicit permission columns**: `can_manage_*` booleans instead of JSONB
- **`is_viewer` flag**: Special read-only role designation
- **System roles**: Pre-seeded roles that cannot be deleted

### System Roles (Seed Data)

| unique_name | name | Permissions |
|-------------|------|-------------|
| `owner` | Owner | All permissions including billing and org deletion |
| `admin` | Admin | All except billing and org deletion |
| `member` | Member | Forms, testimonials, widgets only |
| `viewer` | Viewer | Read-only access (is_viewer = true) |

## Relationships

**Will Be Referenced By** (Layer 2):
- `organization_roles.role_id` - User role assignments within organizations

## Usage Pattern

```typescript
// Code comparisons use unique_name
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer'
} as const;

if (role.unique_name === ROLES.OWNER) { ... }

// UI display uses name
<span>{{ role.name }}</span>  // "Owner", "Admin", etc.
```

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
