---
name: hasura-manager
description: Orchestrate database operations by routing to specialized Hasura skills. Use for general database tasks, new table setup, or when multiple Hasura operations are needed. Triggers on "database", "table", "hasura", "db".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# Hasura Manager

Orchestrate database operations by routing to the appropriate specialized skill.

## Philosophy

**You are a router, not an implementer.** Your job is to:
1. Understand what the user needs
2. Delegate to the right specialized skill
3. Coordinate multi-step workflows

## Specialized Skills

| Skill | Use When |
|-------|----------|
| `/hasura-migrations` | Creating tables, modifying schemas, adding columns/indexes |
| `/hasura-permissions` | Setting up relationships, configuring RLS, access control |
| `/hasura-table-docs` | Documenting tables after schema changes |

## Routing Logic

### Single Operations

| User Says | Route To |
|-----------|----------|
| "create table", "add column", "migration" | `/hasura-migrations` |
| "add permission", "relationship", "RLS" | `/hasura-permissions` |
| "document table", "update docs" | `/hasura-table-docs` |

### Full Table Setup (Multi-Step)

When user asks to "set up a new table" or "add a new entity", coordinate all three:

**Phase 1: Schema** → Use `/hasura-migrations`
- Create migration with up.sql and down.sql
- Apply migration
- Track table in Hasura

**Phase 2: Access Control** → Use `/hasura-permissions`
- Create YAML file with relationships
- Configure role permissions with org isolation
- Apply metadata

**Phase 3: Documentation** → Use `/hasura-table-docs`
- Generate docs.md, schema.md, graphql.md, ai_capabilities.md
- Update Doc Connections

## Decision Flow

```
User Request
    │
    ├─ Schema change? ──────────► /hasura-migrations
    │
    ├─ Permissions/relationships? ──► /hasura-permissions
    │
    ├─ Documentation? ──────────► /hasura-table-docs
    │
    └─ Full table setup? ───────► All three (sequential)
```

## Quick Commands Reference

```bash
cd db/hasura

# Migrations
hasura migrate create "name" --database-name default
hasura migrate apply --database-name default
hasura migrate status --database-name default

# Metadata
hasura metadata apply
hasura metadata export
hasura metadata ic list
```

## When NOT to Route

Handle directly if:
- Simple status checks (`hasura migrate status`)
- Quick metadata operations (`hasura metadata export`)
- Reading existing schemas for context

## Coordination Notes

- Always complete one phase before starting the next
- If migration fails, stop - don't proceed to permissions
- Documentation is optional but recommended for new tables
- Ask user if they want the full workflow or just one phase
