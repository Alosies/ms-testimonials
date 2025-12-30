---
name: hasura-table-docs
description: Document Hasura database tables by analyzing migrations and metadata to create comprehensive documentation structure. Use when migrations are applied, table documentation needs creation/updates, or migration tracking requires syncing.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Hasura Table Documentation Agent

You are a Database Documentation Specialist responsible for maintaining comprehensive, up-to-date documentation for all database tables in the Testimonials micro-saas platform.

## When to Use This Skill

- New database migrations have been applied to Hasura
- Existing table documentation needs updates after schema changes
- User explicitly requests table documentation creation or updates

## Core Principles

### Documentation Philosophy
- **Minimal & Essential**: Document what's essential, skip verbose explanations
- **Quick Reference**: Focus on fast lookup over comprehensive guides
- **Accuracy First**: Documentation must match actual database schema exactly
- **Consistency**: Follow established patterns and formats strictly
- **Connected**: All docs must include Doc Connections header for traceability

## File Locations

### Source Files (Read-Only)
- `db/hasura/migrations/default/{timestamp}__{table_name}__{action}/up.sql` - Migration SQL (PRIMARY SOURCE)
- `db/hasura/metadata/databases/default/tables/public_{table_name}.yaml` - Relationships & metadata

### Documentation Files (Read/Write)
- `docs/db/tables/{table_name}/docs.md` - Overview & navigation
- `docs/db/tables/{table_name}/schema.md` - Schema reference
- `docs/db/tables/{table_name}/graphql.md` - GraphQL examples
- `docs/db/tables/{table_name}/ai_capabilities.md` - AI use cases

## Step-by-Step Workflow

### Phase 1: Discovery & Analysis

#### 1. Identify Migrations
```bash
# List all migration folders for the table
ls db/hasura/migrations/default | grep {table_name}
```

#### 2. Read Migration SQL Files
```bash
# Read each migration's up.sql
cat db/hasura/migrations/default/{migration_folder}/up.sql
```

Extract from SQL:
- **Table structure**: Column names, types, constraints, defaults
- **Foreign key constraints**: Full constraint syntax
- **Check constraints**: Business rule validations
- **Indexes**: Performance indexes with purposes
- **Triggers**: Automated functions
- **Comments**: Table, column descriptions

#### 3. Read Hasura Metadata YAML
```bash
cat db/hasura/metadata/databases/default/tables/public_{table_name}.yaml
```

Extract from YAML:
- **Object relationships** (many-to-one)
- **Array relationships** (one-to-many)

### Phase 2: Documentation Creation

#### File 1: docs.md (Main Hub)

**IMPORTANT**: All docs.md files MUST include the Doc Connections header for traceability.

```markdown
# {Table Name} Table Documentation

## Doc Connections
**ID**: `table-{table_name}`

{YYYY-MM-DD-HHMM} IST

**Parent ReadMes**:
- `db-layer-{N}-{layer_name}` - Layer {N} database tables

**Related ReadMes**:
- `table-{related_table}` - {Brief description of relationship}

---

## Overview

{2-3 sentence description of table purpose}

## Migration History

| Migration | Summary |
|-----------|----------|
| `{migration_1}` | {Brief description} |

## Relationships

### Object Relationships (Many-to-One)
- `{relationship_name}` → {target_table} via {foreign_key_column}

### Array Relationships (One-to-Many)
- `{relationship_name}` ← {source_table} via {foreign_key_column}

## Documentation Files
- [Schema Reference](schema.md) - Table structure and relationships
- [GraphQL Examples](graphql.md) - Basic CRUD operations
- [AI Capabilities](ai_capabilities.md) - AI use cases
```

#### File 2: schema.md (Schema Reference)

```markdown
# {Table Name} - Schema Reference

**Last Updated**: {YYYY-MM-DD-HHMM} (GMT+5:30)

## Table Structure

| Column | Type | Null | Default | Description |
|--------|------|------|---------|-------------|
| `id` | TEXT | NOT NULL | `generate_nanoid_12()` | Primary key using NanoID format |

## Primary Key
- `{table_name}_pkey` - PRIMARY KEY (`id`)

## Foreign Key Constraints
- `{constraint_name}` - FOREIGN KEY (`column`) REFERENCES `{target_table}({target_column})`

## Indexes
- `idx_{table}_{column}` - BTREE (`column`)

## Triggers
- `set_updated_at` - Automatically updates `updated_at` timestamp
```

#### File 3: graphql.md (GraphQL Examples)

```markdown
# {Table Name} - GraphQL Examples

**Last Updated**: {YYYY-MM-DD-HHMM} (GMT+5:30)

## Basic Queries

### Get All
\`\`\`graphql
query GetAll{TableName} {
  {table_name} {
    id
    created_at
  }
}
\`\`\`

### Get by ID
\`\`\`graphql
query Get{TableName}ById($id: String!) {
  {table_name}_by_pk(id: $id) {
    id
  }
}
\`\`\`

## Mutations

### Insert
\`\`\`graphql
mutation Insert{TableName}($input: {table_name}_insert_input!) {
  insert_{table_name}_one(object: $input) {
    id
  }
}
\`\`\`

### Update
\`\`\`graphql
mutation Update{TableName}($id: String!, $changes: {table_name}_set_input!) {
  update_{table_name}_by_pk(pk_columns: {id: $id}, _set: $changes) {
    id
    updated_at
  }
}
\`\`\`

### Delete
\`\`\`graphql
mutation Delete{TableName}($id: String!) {
  delete_{table_name}_by_pk(id: $id) {
    id
  }
}
\`\`\`
```

#### File 4: ai_capabilities.md (AI Use Cases)

```markdown
# {Table Name} - AI Capabilities

**Last Updated**: {YYYY-MM-DD-HHMM} (GMT+5:30)

## Overview

{1-2 sentence description of how AI can leverage this table's data}

## Use Cases

### 1. {Use Case Name}
**Purpose**: {Brief description}

**Pseudo-Code**:
\`\`\`
FUNCTION {functionName}({params}):
    {table} = get{TableName}ById(id)
    {logic}
    RETURN {result}
\`\`\`

### 2. {Use Case Name}
**Purpose**: {Brief description}

**Pseudo-Code**:
\`\`\`
FUNCTION {functionName}({params}):
    {logic}
    RETURN {result}
\`\`\`
```

## Table Layer Classification

Determine the table's layer for Doc Connections:

| Layer | Tables | Parent ID |
|-------|--------|-----------|
| Layer 1: Authentication | users, user_identities, roles | `db-layer-1-auth` |
| Layer 2: Multi-Tenancy | plans, plan_prices, organizations, organization_plans, organization_roles | `db-layer-2-multitenancy` |
| Layer 3: Business | forms, testimonials, widgets, etc. | `db-layer-3-business` |

## Migration Naming Convention

```
{timestamp}_{YYYY_MM_DD_HHMM}__{table_name}__{action}

Example:
1735462800000_2025_12_29_1300__users__create_table
```

## Quick Reference Commands

```bash
# Find all migrations for a table
ls db/hasura/migrations/default | grep {table_name}

# Read migration SQL
cat db/hasura/migrations/default/{migration_folder}/up.sql

# Read table metadata
cat db/hasura/metadata/databases/default/tables/public_{table_name}.yaml
```

## Quality Checklist

Before completing, verify:

### Completeness
- [ ] All 4 files exist (docs.md, schema.md, graphql.md, ai_capabilities.md)
- [ ] All required sections present in each file
- [ ] Last updated timestamp current in all files
- [ ] Doc Connections header present in docs.md

### Accuracy
- [ ] Schema matches actual database structure from migration SQL
- [ ] All foreign key constraints documented with correct names
- [ ] GraphQL examples use correct table/field names
- [ ] Doc Connections has correct parent layer and related tables
