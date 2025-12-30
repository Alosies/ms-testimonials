# Plan Prices Table Documentation

## Doc Connections
**ID**: `table-plan-prices`

2025-12-30-1200 IST

**Parent ReadMes**:
- `db-layer-2-multitenancy` - Layer 2 Multi-Tenancy tables

**Related ReadMes**:
- `table-plans` - Parent plan template

---

## Migration Sync
**Last Migration**: `1767030266000_2025_12_29_2314__plan_prices__create_table`
**Status**: ✅ Current

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767030266000_2025_12_29_2314__plan_prices__create_table` | 2025-12-29 | Initial table with multi-currency pricing support |

## Overview

Multi-currency pricing for plans. Prices are stored in smallest currency units (cents, paise) using the `_in_base_unit` suffix convention. Each plan can have multiple price entries for different currencies.

### Key Design Decisions
- **Base unit pricing**: All amounts in cents/paise (divide by 100 for display)
- **Multi-currency**: One row per plan+currency combination
- **Lifetime optional**: `price_lifetime_in_base_unit` can be NULL if not offered
- **Unique constraint**: One price per plan per currency

### Seed Data
| Plan | Currency | Monthly | Yearly | Lifetime |
|------|----------|---------|--------|----------|
| free | USD | $0 | $0 | - |
| pro | USD | $0 | $0 | $49 |
| pro | INR | ₹0 | ₹0 | ₹999 |
| team | USD | $0 | $0 | $99 |
| team | INR | ₹0 | ₹0 | ₹1999 |

## Relationships

**Object Relationships** (Many-to-One):
- `plan` → `plans.id` - Parent plan template

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
