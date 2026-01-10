# Skill Map

Task prefix to skill mapping for Ralph loops.

## By Task Prefix

| Prefix | Skill | Description |
|--------|-------|-------------|
| DB- | `/hasura-migrations` | Database migrations, table changes, columns, indexes |
| GQL- | `/graphql-code` | GraphQL operations, queries, mutations, composables |
| PERM- | `/hasura-permissions` | Hasura permissions, relationships, RLS |
| TS- | - | TypeScript types (no skill, manual) |
| BE- | - | Backend/API (no skill, manual) |
| FE- | - | Frontend components (no skill, manual) |
| TEST- | - | Tests (no skill, manual) |

## Before Every Commit

| Skill | When |
|-------|------|
| `/code-review` | Before committing any changes |

## Usage

When implementing a story, check its prefix and invoke the corresponding skill if available.

```
Working on [DB-001]: Create flows table
→ Use /hasura-migrations skill
→ Before commit: Use /code-review skill
```
