---
name: hasura-migrations
description: Create and apply Hasura database migrations following project patterns. Use when creating tables, modifying schemas, adding columns/indexes, or applying migrations. Triggers on "migration", "hasura", "create table", "schema".
allowed-tools: Bash, Read, Write, Glob, Grep
---

# Hasura Migration Skill

Create, apply, and manage database migrations for the Testimonials platform following established patterns.

## Quick Reference

```bash
# Working directory (REQUIRED)
cd db/hasura

# Create migration
hasura migrate create "{name}" --database-name default

# Apply migrations
hasura migrate apply --database-name default

# Check status
hasura migrate status --database-name default

# Rollback
hasura migrate apply --type down --version {version} --database-name default
```

## Migration Naming Convention

**Format:** `{timestamp}_{YYYY_MM_DD_HHMM}__{table_name}__{action}`

```bash
# Get timestamp
echo "$(date +%s)000" && TZ='Asia/Kolkata' date '+%Y_%m_%d_%H%M'

# Examples
1766994588000_2025_12_29_1319__nanoid__utility-function
1766994648000_2025_12_29_1320__users__create_table
1766994700000_2025_12_29_1321__forms__add_theme_column
```

**Action Keywords:**
- `utility-function` - Database functions
- `create_table` - New tables
- `alter_table` - Modify structure
- `add_column` - Add fields
- `add_index` - Performance indexes
- `add_foreign_key` - Relationships

## Standard Table Template

```sql
-- =====================================================
-- {Table Name} Table Creation
-- =====================================================
-- Purpose: {description}
-- Dependencies: nanoid utility-function, updated_at utility-function

CREATE TABLE public.{table_name} (
    -- Primary key (NanoID)
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- Business fields
    name TEXT NOT NULL,

    -- User ownership
    user_id TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- Foreign keys
ALTER TABLE public.{table_name}
    ADD CONSTRAINT fk_{table_name}_user_id
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX idx_{table_name}_user_id ON public.{table_name}(user_id);
CREATE INDEX idx_{table_name}_created_at ON public.{table_name}(created_at DESC);

-- Trigger
SELECT add_updated_at_trigger('{table_name}', 'public');

-- Documentation
COMMENT ON TABLE public.{table_name} IS '{description}';
COMMENT ON COLUMN public.{table_name}.id IS 'Primary key (NanoID 12-char)';
```

## Down Migration Template

```sql
-- =====================================================
-- {Table Name} Rollback
-- =====================================================

SELECT remove_updated_at_trigger('{table_name}', 'public');

DROP INDEX IF EXISTS public.idx_{table_name}_user_id;
DROP INDEX IF EXISTS public.idx_{table_name}_created_at;

DROP TABLE IF EXISTS public.{table_name} CASCADE;
```

## Workflow

### 1. Create Migration Files

```bash
cd db/hasura

# Generate timestamp
TIMESTAMP=$(date +%s)000
DATE=$(TZ='Asia/Kolkata' date '+%Y_%m_%d_%H%M')

# Create migration folder
hasura migrate create "${TIMESTAMP}_${DATE}__users__create_table" --database-name default
```

### 2. Write SQL

Edit the generated files:
- `migrations/default/{name}/up.sql` - Apply changes
- `migrations/default/{name}/down.sql` - Rollback changes

### 3. Review Before Applying

**ALWAYS** verify:
- SQL syntax is correct
- Down migration reverses up migration
- Foreign key references exist
- Follows naming conventions

### 4. Apply Migration

```bash
hasura migrate apply --database-name default
hasura migrate status --database-name default
```

### 5. Track Table in Hasura

```bash
curl -X POST \
  https://graphql.testimonial.brownforge.com/v1/metadata \
  -H "x-hasura-admin-secret: {admin_secret}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pg_track_table",
    "args": {
      "source": "default",
      "table": {"name": "{table_name}", "schema": "public"}
    }
  }'
```

### 6. Export Metadata

```bash
hasura metadata export
```

## NanoID Variants

Use the appropriate NanoID length based on security requirements:

| Function | Length | Use Case |
|----------|--------|----------|
| `generate_nanoid_12()` | 12 chars | Standard entities (users, forms, testimonials) |
| `generate_nanoid_16()` | 16 chars | Security-critical (user_identities, API keys, tokens) |

## Entity Patterns (Testimonials)

### Layer 1: Authentication (No FKs)
- **users** - Provider-agnostic user profiles (email, display_name, locale)
- **user_identities** - Federated auth (provider, provider_user_id) - uses `generate_nanoid_16()`
- **roles** - Permission definitions with explicit boolean columns (can_manage_*)

### Layer 2: Multi-Tenancy (Users FK)
- **plans** - Subscription tiers with explicit limit columns
- **organizations** - Multi-tenant workspaces (owned by user)
- **organization_roles** - Junction: user + organization + role

### Layer 3: Business Entities (Org FK)
- **forms** - Collection forms with slug for public URLs
- **form_questions** - Normalized questions (not JSONB)
- **testimonials** - Customer testimonials with status workflow
- **testimonial_answers** - Normalized answers linked to questions
- **widgets** - Embeddable display widgets
- **widget_testimonials** - Junction table with display_order

### JSONB Policy
Only use JSONB for:
- Provider metadata from auth providers (truly dynamic)
- Third-party webhook payloads
- Configuration blobs that are write-once, read-whole

**Never use JSONB for:**
- Queryable business data (questions, answers)
- Data requiring constraints/validation
- Data needing foreign key relationships

## Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Tables | `snake_case` | `testimonials` |
| Columns | `snake_case` | `customer_email` |
| Indexes | `idx_{table}_{col}` | `idx_forms_slug` |
| Foreign Keys | `fk_{table}_{col}` | `fk_forms_user_id` |
| Constraints | `chk_{table}_{rule}` | `chk_forms_slug_format` |

## Required Fields

All tables MUST have:

```sql
id TEXT NOT NULL DEFAULT generate_nanoid_12(),
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
```

Most tables need:

```sql
user_id TEXT NOT NULL,  -- Owner reference
```

## Troubleshooting

### Migration Failed
```bash
hasura migrate status --database-name default
hasura migrate apply --type down --version {version} --database-name default
```

### Table Not Tracked
```bash
# Track via API (see step 5 above)
```

### Metadata Issues
```bash
hasura metadata ic status
hasura metadata ic drop
hasura metadata export
```

## Checklist

Before applying:
- [ ] Working directory is `db/hasura`
- [ ] Migration name follows convention
- [ ] up.sql is complete and correct
- [ ] down.sql properly reverses changes
- [ ] Foreign key targets exist
- [ ] Required fields included (id, timestamps)
- [ ] Indexes added for foreign keys

After applying:
- [ ] Status shows "Present Present"
- [ ] Table tracked in Hasura
- [ ] GraphQL schema updated
- [ ] Metadata exported
