# Tables Documentation

## Overview

This directory contains detailed documentation for each database table in the Testimonials platform.

## Table Documentation Structure

Each table has its own folder with 4 documentation files:

| File | Purpose |
|------|---------|
| `docs.md` | Table overview, migration history, relationships |
| `schema.md` | SQL structure, columns, constraints, indexes |
| `graphql.md` | GraphQL query and mutation examples |
| `ai_capabilities.md` | AI use cases and integration points |

## Current Tables

### Layer 1: Authentication (No FKs)

| Table | Status | Description |
|-------|--------|-------------|
| [users](./users/) | ✅ Applied | Provider-agnostic user profiles |
| [user_identities](./user_identities/) | ✅ Applied | Federated auth identities |
| [roles](./roles/) | ✅ Applied | Permission definitions |

### Layer 2: Multi-Tenancy (Planned)

| Table | Status | Description |
|-------|--------|-------------|
| plans | 📋 Planned | Subscription plan definitions |
| organizations | 📋 Planned | Tenant/workspace entities |
| organization_roles | 📋 Planned | User-Org-Role junction |

### Layer 3: Business Entities (Planned)

| Table | Status | Description |
|-------|--------|-------------|
| forms | 📋 Planned | Collection forms |
| form_questions | 📋 Planned | Normalized questions |
| testimonials | 📋 Planned | Customer testimonials |
| testimonial_answers | 📋 Planned | Normalized answers |
| widgets | 📋 Planned | Display widgets |
| widget_testimonials | 📋 Planned | Widget-testimonial junction |

## Quick Reference

### Key Design Patterns

1. **NanoID Primary Keys**
   - 12-char: Standard entities
   - 16-char: Security-critical (user_identities)

2. **`unique_name` + `name` Pattern**
   - `unique_name`: Slug for code comparisons
   - `name`: Display label for UI

3. **Explicit Boolean Permissions**
   - `can_manage_*` columns instead of JSONB

4. **JSONB Policy**
   - Only for truly dynamic, provider-specific data
   - Never for queryable business data

### Common Columns

All tables include:
```sql
id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

## Contributing

When adding a new table:

1. Create folder: `tables/{table_name}/`
2. Create all 4 documentation files
3. Update `migration-tracking.json`
4. Update this README with new table entry
