# Organization Plans Table Documentation

## Doc Connections
**ID**: `table-organization-plans`

2025-12-30-1200 IST

**Parent ReadMes**:
- `db-layer-2-multitenancy` - Layer 2 Multi-Tenancy tables

**Related ReadMes**:
- `table-organizations` - Subscribing organization
- `table-plans` - Plan template for this subscription
- `table-users` - Override audit trail

---

## Migration Sync
**Last Migration**: `1767030386000_2025_12_29_2316__organization_plans__create_table`
**Status**: ✅ Current

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767030386000_2025_12_29_2316__organization_plans__create_table` | 2025-12-29 | Initial table with subscription management and override audit trail |

## Overview

Subscription records linking organizations to plans. Plan values (limits, features) are **copied at subscription time** making this table the source of truth for what an organization can do. This enables grandfathering and custom overrides.

### Key Design Decisions
- **Copy-on-subscribe**: Limits copied from plan, not referenced dynamically
- **Override audit trail**: `has_overrides`, `override_reason`, `overridden_by`, `overridden_at`
- **One active subscription**: Unique partial index on `status IN ('trial', 'active')`
- **Status workflow**: trial → active → cancelled/expired
- **Multi-currency**: `currency_code` + `price_in_base_unit` for actual price paid

### Status Values
| Status | Description |
|--------|-------------|
| `trial` | Trial period, may convert to active |
| `active` | Paid and current |
| `cancelled` | User cancelled, may still have access until period end |
| `expired` | No longer active, access revoked |

## Relationships

**Object Relationships** (Many-to-One):
- `organization` → `organizations.id` - Subscribing organization
- `plan` → `plans.id` - Original plan template (for analytics)
- `overridden_by_user` → `users.id` - Who applied overrides

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
