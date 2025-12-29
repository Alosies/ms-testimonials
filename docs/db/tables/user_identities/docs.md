# User Identities Table Documentation

## Migration Sync
**Last Migration**: `1767004770000_2025_12_29_1609__user_identities__create_table`
**Status**: ✅ Current
**Last Updated**: `2025-12-29-1630` (GMT+5:30)

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767004770000_2025_12_29_1609__user_identities__create_table` | 2025-12-29 | Initial table creation with federated auth support, 16-char NanoID for security, multiple provider support |

---

## Overview

The user_identities table implements a federated authentication pattern, allowing users to authenticate via multiple providers (Supabase, Google, GitHub, etc.) without vendor lock-in. Each user can have multiple identities, with one marked as primary.

### Key Design Decisions
- **16-char NanoID**: Security-critical table uses longer IDs
- **Multiple providers**: One user can link multiple auth providers
- **Primary identity**: One identity per user marked as primary
- **JSONB for metadata**: Provider-specific data stored as JSONB (appropriate use case)

## Relationships

**Object Relationships** (Many-to-One):
- `user` → `users.id` - Parent user account

**Referenced By**: None (leaf table)

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
