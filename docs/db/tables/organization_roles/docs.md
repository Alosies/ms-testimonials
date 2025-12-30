# Organization Roles Table Documentation

## Doc Connections
**ID**: `table-organization-roles`

2025-12-30-1200 IST

**Parent ReadMes**:
- `db-layer-2-multitenancy` - Layer 2 Multi-Tenancy tables

**Related ReadMes**:
- `table-users` - Member user and inviter references
- `table-organizations` - Organization this role applies to
- `table-roles` - Role definition with permissions

---

## Migration Sync
**Last Migration**: `1767030446000_2025_12_29_2317__organization_roles__create_table`
**Status**: ✅ Current

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767030446000_2025_12_29_2317__organization_roles__create_table` | 2025-12-29 | Initial table - user-org-role junction with invitation workflow |

## Overview

User-Organization-Role junction table. Each user can have **one role per organization**. Supports invitation workflow with `invited_by`, `invited_at`, and `joined_at` tracking. Users can have a default organization marked with `is_default_org`.

### Key Design Decisions
- **Single role per org**: Unlike some systems, one role per user-organization pair
- **Role by lookup**: `role_id` references roles table - app must lookup by `role.unique_name`
- **Default org tracking**: `is_default_org` with unique partial index (one per user)
- **Invitation workflow**: `invited_by`, `invited_at` for audit, `joined_at` for membership
- **Soft delete**: `is_active` flag for membership revocation

### Invitation Flow
1. Inviter creates record with `invited_by`, `invited_at`
2. Invitee accepts, `joined_at` gets set
3. To revoke, set `is_active = false`

## Relationships

**Object Relationships** (Many-to-One):
- `user` → `users.id` - Member user
- `organization` → `organizations.id` - Organization
- `role` → `roles.id` - Assigned role
- `inviter` → `users.id` - Who invited this member

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
