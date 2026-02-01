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

**Format:** `{timestamp}_{YYYY_MM_DD_HHMM}__{subject}__{action}`

```bash
# Get timestamp
echo "$(date +%s)000" && TZ='Asia/Kolkata' date '+%Y_%m_%d_%H%M'
```

### Two Migration Categories

**1. Table Migrations** - Changes to a specific table
```
{timestamp}_{date}__{table_name}__{action}
```

Examples:
```
1766994648000_2025_12_29_1320__users__create_table
1766994700000_2025_12_29_1321__forms__add_theme_column
1769900000000_2026_02_01_1000__organization_credit_balances__add_computed_fields
```

**2. Standalone Utility Functions** - Shared functions used across tables
```
{timestamp}_{date}__{function_name}__utility-function
```

Examples:
```
1766994588000_2025_12_29_1319__nanoid__utility-function
1766994648000_2025_12_29_1320__updated_at__utility-function
1769863867000_2026_01_31_1821__credit_functions__utility-function
```

### When to Use Each

| Scenario | Pattern | Example |
|----------|---------|---------|
| New table | `{table}__create_table` | `users__create_table` |
| Add column to table | `{table}__add_column` | `forms__add_theme_column` |
| Add computed fields to table | `{table}__add_computed_fields` | `organization_credit_balances__add_computed_fields` |
| Add trigger to table | `{table}__add_trigger` | `testimonials__add_status_trigger` |
| Shared utility function | `{function}__utility-function` | `nanoid__utility-function` |
| Group of related utilities | `{group}__utility-function` | `credit_functions__utility-function` |

### Action Keywords

**Table actions:**
- `create_table` - New table
- `alter_table` - Modify structure
- `add_column` - Add fields
- `add_index` - Performance indexes
- `add_foreign_key` - Relationships
- `add_computed_fields` - Hasura computed fields (wrapper functions)
- `add_trigger` - Table-specific triggers
- `add_constraint` - Check constraints, unique constraints

**Standalone actions:**
- `utility-function` - Shared database functions (nanoid, timestamps, calculations)

## Standard Table Template

```sql
-- =====================================================
-- {Table Name} Table Creation
-- =====================================================
-- Purpose: {description}
-- Dependencies: nanoid utility-function, updated_at utility-function

CREATE TABLE public.{table_name} (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Business Fields
    -- =========================================================================

    -- Human-readable name for display in UI.
    -- Example: "My First Form", "Customer Feedback"
    name TEXT NOT NULL,

    -- =========================================================================
    -- Ownership
    -- =========================================================================

    -- FK to users table. Identifies the owner of this record.
    -- Cascade deletes when user is removed.
    user_id TEXT NOT NULL,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this record was first created.
    -- Set automatically by DEFAULT, never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp of last modification.
    -- Automatically updated by database trigger on any column change.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id)
);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to owner user with cascade delete.
-- When user is deleted, their {table_name} records are removed.
ALTER TABLE public.{table_name}
    ADD CONSTRAINT fk_{table_name}_user_id
    FOREIGN KEY (user_id) REFERENCES public.users(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying all {table_name} belonging to a user.
-- Primary access pattern: "Get all {table_name} for user X"
CREATE INDEX idx_{table_name}_user_id ON public.{table_name}(user_id);

-- Index for sorting by creation date (newest first).
-- Used for dashboard listings and activity feeds.
CREATE INDEX idx_{table_name}_created_at ON public.{table_name}(created_at DESC);

-- =========================================================================
-- Triggers
-- =========================================================================

-- Automatically update updated_at timestamp on any modification.
SELECT add_updated_at_trigger('{table_name}', 'public');

-- =========================================================================
-- Documentation (Database COMMENTS)
-- =========================================================================

-- Table comment
COMMENT ON TABLE public.{table_name} IS
  '{Full description of table purpose and relationships}';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.{table_name}.id IS
  'Primary key using NanoID 12-character format for URL-safe, collision-resistant identification.';

COMMENT ON COLUMN public.{table_name}.name IS
  'Human-readable name for display in UI. Examples: "My First Form", "Customer Feedback".';

COMMENT ON COLUMN public.{table_name}.user_id IS
  'FK to users table. Owner of this record. Cascade deletes when user is removed.';

COMMENT ON COLUMN public.{table_name}.created_at IS
  'Timestamp when this record was first created. Set automatically, never modified.';

COMMENT ON COLUMN public.{table_name}.updated_at IS
  'Timestamp of last modification. Automatically updated by database trigger on any column change.';

-- Constraint comments
COMMENT ON CONSTRAINT fk_{table_name}_user_id ON public.{table_name} IS
  'Links record to owner user. CASCADE DELETE removes records when user is deleted.';

-- Index comments (optional but recommended)
COMMENT ON INDEX idx_{table_name}_user_id IS
  'Supports querying all {table_name} for a specific user.';

COMMENT ON INDEX idx_{table_name}_created_at IS
  'Supports sorting by creation date (newest first) for listings.';
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

## Documentation Requirements (CRITICAL)

**Every column MUST have TWO forms of documentation:**

### 1. Inline SQL Comments
Add comments directly in the CREATE TABLE or ALTER TABLE statement:

```sql
CREATE TABLE public.flows (
    -- Primary key using NanoID 12-character format
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- FK to parent form. Cascade deletes when form is removed.
    form_id TEXT NOT NULL,

    -- User-defined flow name displayed in form editor UI
    name TEXT NOT NULL,

    -- Flow behavior: 'shared' (always shown) or 'branch' (conditional)
    flow_type TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Database COMMENT Statements
Add persistent comments stored in PostgreSQL system catalog:

```sql
-- Table comment
COMMENT ON TABLE public.flows IS
  'Defines branching paths for forms. Each form has flows that determine step visibility.';

-- Column comments (REQUIRED for every column)
COMMENT ON COLUMN public.flows.id IS
  'Primary key using NanoID 12-character format for URL-safe identification.';

COMMENT ON COLUMN public.flows.form_id IS
  'FK to forms table. Cascade deletes when parent form is removed.';

COMMENT ON COLUMN public.flows.name IS
  'User-defined flow name displayed in form editor (e.g., "Testimonial Flow").';

COMMENT ON COLUMN public.flows.flow_type IS
  'Flow behavior type: shared (always shown) or branch (conditional based on response).';

-- Constraint comments
COMMENT ON CONSTRAINT chk_flows_flow_type ON public.flows IS
  'Ensures flow_type is either shared or branch.';

-- Index comments (optional but recommended)
COMMENT ON INDEX idx_flows_form_id IS
  'Supports querying all flows for a specific form.';
```

### Why Both?

| Type | Purpose | Visibility |
|------|---------|------------|
| **Inline comments** | Help developers reading migration files | Source code only |
| **COMMENT ON** | Help developers using psql, Hasura console, DB tools | Database catalog |

### Comment Content Guidelines

- **Be specific** - Explain the business purpose, not just the data type
- **Include constraints** - Mention CHECK constraints, valid values, defaults
- **Document relationships** - Explain FK behavior (CASCADE, RESTRICT, etc.)
- **Add examples** - For enum-like columns, show example values

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
- [ ] Migration name follows convention: `{timestamp}_{YYYY_MM_DD_HHMM}__{table}__{action}`
- [ ] up.sql is complete and correct
- [ ] down.sql properly reverses changes
- [ ] Foreign key targets exist
- [ ] Required fields included (id, timestamps)
- [ ] Indexes added for foreign keys
- [ ] Inline SQL comments for every column
- [ ] COMMENT ON statements for table, columns, constraints, indexes

After applying:
- [ ] Status shows "Present Present": `hasura migrate status --database-name default`
- [ ] Table tracked in Hasura (for new tables)
- [ ] Permissions updated in YAML: `db/hasura/metadata/databases/default/tables/public_{table}.yaml`
- [ ] Relationships added (object/array) for new FKs
- [ ] Metadata applied: `hasura metadata apply`
- [ ] Inconsistencies checked: `hasura metadata ic list`
- [ ] Metadata exported: `hasura metadata export`
- [ ] GraphQL schema updated (run codegen if frontend needs types)
