# Users Table Documentation

## Doc Connections
**ID**: `table-users`

2025-12-30-1200 IST

**Parent ReadMes**:
- `db-layer-1-auth` - Layer 1 Authentication tables

**Related ReadMes**:
- `table-user-identities` - Federated auth identities for users
- `table-organization-roles` - User membership in organizations

---

## Migration Sync
**Last Migration**: `1767004710000_2025_12_29_1608__users__create_table`
**Status**: ✅ Current

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767004710000_2025_12_29_1608__users__create_table` | 2025-12-29 | Initial table creation with provider-agnostic design, NanoID primary key, email verification, locale/timezone support |

## Overview

The users table stores provider-agnostic user profiles. Unlike traditional approaches that tie users to a specific auth provider (e.g., `supabase_id`), this design uses a federated identity pattern where auth providers are tracked separately in `user_identities`.

### Key Design Decisions
- **No provider lock-in**: No `supabase_id` or similar provider-specific columns
- **Canonical email**: Single source of truth for user email
- **Soft deletes**: `is_active` flag instead of hard deletes
- **Internationalization ready**: `locale` and `timezone` columns

## Relationships

**Array Relationships** (One-to-Many):
- `identities` → `user_identities.user_id` - Auth provider identities

**Referenced By** (Layer 2+):
- `organizations.created_by` - Organization creator
- `organization_roles.user_id` - User role assignments

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
