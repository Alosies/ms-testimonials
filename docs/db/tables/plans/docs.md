# Plans Table Documentation

## Doc Connections
**ID**: `table-plans`

2025-12-30-1200 IST

**Parent ReadMes**:
- `db-layer-2-multitenancy` - Layer 2 Multi-Tenancy tables

**Related ReadMes**:
- `table-plan-prices` - Multi-currency pricing for plans
- `table-organization-plans` - Subscription records using this plan

---

## Migration Sync
**Last Migration**: `1767030206000_2025_12_29_2313__plans__create_table`
**Status**: ✅ Current

### Migration History

| Migration | Date | Summary |
|-----------|------|----------|
| `1767030206000_2025_12_29_2313__plans__create_table` | 2025-12-29 | Initial table creation with plan templates, limits, and seed data |

## Overview

Plan templates defining features and limits. Pricing is stored separately in `plan_prices` for multi-currency support. Plans use the `unique_name` + `name` pattern where `unique_name` is used for code comparisons and `name` is the display label.

### Key Design Decisions
- **Pricing separated**: No price columns here - see `plan_prices` table
- **Unlimited represented by -1**: `max_*` columns use -1 for unlimited
- **Soft delete via is_active**: Plans can be deactivated but not deleted
- **unique_name pattern**: Code uses `unique_name`, UI shows `name`

### Seed Data
| unique_name | name | testimonials | forms | widgets | members | branding |
|-------------|------|--------------|-------|---------|---------|----------|
| `free` | Free | 50 | 1 | 1 | 1 | true |
| `pro` | Pro | unlimited | 5 | unlimited | 1 | false |
| `team` | Team | unlimited | unlimited | unlimited | 3 | false |

## Relationships

**Array Relationships** (One-to-Many):
- `plan_prices` → `plan_prices.plan_id` - Multi-currency pricing
- `organization_plans` → `organization_plans.plan_id` - Subscriptions

## Documentation Files

- [Schema Reference](schema.md) - Table structure and constraints
- [GraphQL Examples](graphql.md) - CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
