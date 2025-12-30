---
name: hasura-permissions
description: Configure Hasura table relationships and permissions via YAML files. Use when setting up permissions, adding relationships, or configuring row-level security for organization isolation. Triggers on "permission", "relationship", "RLS", "access control".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Hasura Permissions & Relationships

Configure Hasura table relationships and row-level permissions for multi-tenant organization isolation.

## Quick Reference

```bash
cd db/hasura
hasura metadata apply      # Apply YAML changes
hasura metadata ic list    # Check for issues
hasura metadata export     # Export to YAML
```

## Files

- **Table YAML**: `db/hasura/metadata/databases/default/tables/public_{table_name}.yaml`
- **Registry**: `db/hasura/metadata/databases/default/tables/tables.yaml`

## Role Hierarchy

| Role | Access Level |
|------|--------------|
| `owner` | Full access + billing + org deletion |
| `admin` | Full access except billing |
| `member` | Manage forms, testimonials, widgets |
| `viewer` | Read-only |
| `anonymous` | Public form submission, widget viewing |

See: `db/hasura/migrations/default/*roles*/up.sql` for permission column definitions.

## Core Pattern: Organization Isolation

**All org-scoped roles MUST filter by organization_id:**

```yaml
filter:
  organization_id:
    _eq: X-Hasura-Organization-Id
```

## Reference Documents

For detailed patterns, read these files when needed:

1. **Schema Reference**: `db/CLAUDE.md` - Database schema and conventions
2. **Role Permissions**: `db/hasura/migrations/default/*roles*/up.sql` - Role definitions
3. **Existing Tables**: `db/hasura/metadata/databases/default/tables/public_*.yaml`

## Workflow

### 1. Read Existing Pattern

```bash
# Check an existing table for pattern reference
cat db/hasura/metadata/databases/default/tables/public_users.yaml
```

### 2. Create/Edit YAML File

File: `db/hasura/metadata/databases/default/tables/public_{table_name}.yaml`

### 3. Apply Changes

```bash
hasura metadata apply
hasura metadata ic list  # Verify no inconsistencies
```

### 4. Export (updates tables.yaml registry)

```bash
hasura metadata export
```

## YAML Structure

```yaml
table:
  name: {table_name}
  schema: public

# Many-to-one (this table has FK)
object_relationships:
  - name: organization
    using:
      foreign_key_constraint_on: organization_id

# One-to-many (other table has FK to this)
array_relationships:
  - name: items
    using:
      foreign_key_constraint_on:
        column: parent_id
        table:
          name: child_table
          schema: public

# Read permissions
select_permissions:
  - role: owner
    permission:
      columns: '*'
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      allow_aggregations: true

# Create permissions
insert_permissions:
  - role: owner
    permission:
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id
      columns: '*'

# Edit permissions
update_permissions:
  - role: owner
    permission:
      columns: '*'
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id

# Delete permissions
delete_permissions:
  - role: owner
    permission:
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
```

## Tables by Organization Filter Type

### Direct `organization_id` column
Filter on own column: `organization_id: _eq: X-Hasura-Organization-Id`

Tables: `organizations`, `forms`, `widgets`, `widget_testimonials`

### Indirect via relationship
Filter via parent: `form: organization_id: _eq: X-Hasura-Organization-Id`

Tables: `form_questions`, `question_options`, `form_submissions`, `form_question_responses`, `testimonials`

## Checklist

Before applying:
- [ ] Valid YAML (no tabs, proper indentation)
- [ ] All roles have org filter (except anonymous public access)
- [ ] Object relationships point to valid FK constraints
- [ ] Array relationships reference correct child tables

After applying:
- [ ] `hasura metadata ic list` shows no inconsistencies
- [ ] Hasura console shows permission checkmarks
