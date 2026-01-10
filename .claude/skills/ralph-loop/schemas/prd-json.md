# prd.json Schema

Product Requirements Document in JSON format. Serves as both scope definition and progress tracker.

## Schema

```json
{
  "project": "string",
  "branchName": "string",
  "description": "string",
  "prdDocument": "string (path to source spec)",
  "userStories": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "acceptanceCriteria": ["string"],
      "priority": "number",
      "passes": "boolean",
      "notes": "string"
    }
  ]
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `project` | string | Project name (e.g., "ms-testimonials") |
| `branchName` | string | Git branch for this work |
| `description` | string | Feature summary |
| `prdDocument` | string | Path to source ADR/spec |
| `userStories` | array | List of implementation tasks |

### User Story Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier with prefix (e.g., "DB-001") |
| `title` | string | Short task name |
| `description` | string | User story format description |
| `acceptanceCriteria` | string[] | Specific, testable conditions |
| `priority` | number | Execution order (lower = first) |
| `passes` | boolean | Completion flag |
| `notes` | string | Learnings, blockers, context |

## Story ID Prefixes

| Prefix | Category |
|--------|----------|
| DB- | Database migrations |
| GQL- | GraphQL operations |
| TS- | TypeScript types |
| BE- | Backend/API |
| FE- | Frontend |
| TEST- | Tests |

## Story Sizing Rules

1. **Single context window** - Each story should complete in one iteration
2. **Clear acceptance** - Specific, testable criteria
3. **Verification command** - Always end with `pnpm typecheck passes` or similar
4. **Ordered by dependency** - Database first, then GraphQL, then frontend

## Example

```json
{
  "project": "ms-testimonials",
  "branchName": "yellow/flows-table",
  "description": "ADR-009: Flows Table for Branching Architecture",
  "prdDocument": "docs/adr/009-flows-table-branching-architecture.md",
  "userStories": [
    {
      "id": "DB-001",
      "title": "Create flows table migration",
      "description": "As a developer, I need the flows table to store branching paths for forms.",
      "acceptanceCriteria": [
        "Create migration file at db/hasura/migrations/default/",
        "Table has: id, form_id, organization_id, name, flow_type",
        "Table has: branch_question_id, branch_field, branch_operator, branch_value",
        "Proper constraints and indexes",
        "hasura migrate apply --database-name default succeeds",
        "pnpm typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "DB-002",
      "title": "Add flow_id column to form_steps",
      "description": "As a developer, I need form_steps to reference flows.",
      "acceptanceCriteria": [
        "Add flow_id TEXT column to form_steps",
        "Column is nullable initially (for backfill)",
        "Add index on flow_id",
        "Migration applies successfully",
        "pnpm typecheck passes"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    },
    {
      "id": "GQL-001",
      "title": "Create GraphQL operations for flows",
      "description": "As a developer, I need GraphQL queries and mutations for flows.",
      "acceptanceCriteria": [
        "Create GetFlowsByFormId query",
        "Create InsertFlow, UpdateFlow, DeleteFlow mutations",
        "pnpm codegen:web succeeds",
        "pnpm typecheck passes"
      ],
      "priority": 3,
      "passes": false,
      "notes": ""
    }
  ]
}
```

## Acceptance Criteria Best Practices

### Good Criteria

```json
"acceptanceCriteria": [
  "Migration file created at db/hasura/migrations/default/",
  "Table has: id (TEXT, nanoid), form_id (TEXT), name (TEXT)",
  "UNIQUE constraint on (form_id, name)",
  "hasura migrate apply --database-name default succeeds",
  "pnpm typecheck passes"
]
```

### Bad Criteria

```json
"acceptanceCriteria": [
  "Create the table",
  "Make it work",
  "Should be good"
]
```

## Notes Field Usage

Use for:
- Learnings discovered during implementation
- Blockers encountered
- Links to relevant code
- Gotchas for future reference

```json
"notes": "Used ON DELETE RESTRICT for branch_question_id FK to prevent orphaned conditions. See ADR lines 107-109 for rationale."
```
