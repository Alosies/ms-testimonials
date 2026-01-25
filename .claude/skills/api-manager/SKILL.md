---
name: api-manager
description: Orchestrate API development by routing to specialized skills. Use for general API tasks, endpoint creation, or when multiple API operations are needed. Triggers on "api", "endpoint", "rest", "hono".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# API Manager

Orchestrate API development by routing to the appropriate specialized skill.

## Philosophy

**You are a router, not an implementer.** Your job is to:
1. Understand what the user needs
2. Delegate to the right specialized skill
3. Coordinate multi-step workflows

## Specialized Skills

| Skill | Use When |
|-------|----------|
| `/api-creator` | Creating new REST endpoints with OpenAPIHono |
| `/graphql-code` | Creating GraphQL queries/mutations via Hasura |

## Routing Logic

### REST vs GraphQL Decision

```
User Request
    │
    ├─ Simple entity CRUD? ──────────► /graphql-code (Hasura)
    │
    ├─ Custom business logic? ───────► /api-creator (Hono REST)
    │
    ├─ Aggregations/analytics? ──────► /api-creator (Drizzle)
    │
    ├─ Real-time subscriptions? ─────► /graphql-code (Hasura)
    │
    └─ External API integration? ────► /api-creator (Hono REST)
```

### Single Operations

| User Says | Route To |
|-----------|----------|
| "create endpoint", "add API", "REST" | `/api-creator` |
| "query", "mutation", "GraphQL", "Hasura" | `/graphql-code` |
| "frontend API types", "type safety" | `/api-creator` (for type flow) |

### Full Feature Setup (Multi-Step)

When user asks to "add a new feature with API", coordinate:

**Phase 1: Data Layer**
- If simple CRUD → Use `/graphql-code` for Hasura
- If complex queries → Use `/api-creator` for Drizzle

**Phase 2: API Endpoint**
- Use `/api-creator` for REST endpoints

**Phase 3: Frontend Integration**
- Create composable with proper type imports

## Quick Reference

### REST Endpoint (Hono + OpenAPIHono)

```
api/src/
├── shared/schemas/{feature}.ts   # Zod schemas + types
├── routes/{feature}.ts           # OpenAPI routes
└── features/{feature}/           # Business logic
```

### GraphQL (Hasura)

```
apps/web/src/entities/{entity}/
├── graphql/                      # .gql files
├── models/                       # Types from codegen
└── composables/                  # Vue composables
```

## When NOT to Route

Handle directly if:
- Quick questions about API patterns
- Reading existing code for context
- Simple debugging help

## Documentation

- **Full API Guide**: [docs/api/README.md](../../../docs/api/README.md)
- **ADR-021**: [Data Layer Architecture](../../../docs/adr/021-api-service-data-layer-architecture/adr.md)

## Coordination Notes

- Always clarify REST vs GraphQL before starting
- For new entities, often need both (Hasura for CRUD, REST for custom logic)
- Frontend types must import from `@api/shared/schemas/` for REST endpoints
