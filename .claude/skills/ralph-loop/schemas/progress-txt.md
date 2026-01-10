# progress.txt Template

Append-only session log documenting what Ralph attempted, learned, and encountered.

## Purpose

Without progress.txt, each iteration must explore the entire repo to understand current state. Progress.txt short-circuits that exploration - Ralph reads it, sees what's done, and jumps straight into the next task.

## Template

```markdown
# Progress Log: {Feature Name}
# Started: {YYYY-MM-DD}
# Branch: {agent}/{feature-name}
# Workspace: ralph/workspaces/{folder-name}/

## Session Context

### Project Overview
- Testimonials: Testimonial collection and display tool
- Tech Stack: Vue 3 + TypeScript + Tailwind, Hono.js API, Hasura GraphQL, PostgreSQL
- Package Manager: pnpm

### Key Patterns
- FSD Architecture: Types exported from models/ folders only
- GraphQL: Use generated types from @/shared/graphql/generated/operations
- Hasura: db/hasura/migrations/default/, db/hasura/metadata/
- Codegen: pnpm codegen:web
- Typecheck: pnpm typecheck

### Critical Files
- {file-path}: {purpose}
- {file-path}: {purpose}

### Gotchas / Warnings
- {warning}
- {warning}

### Source Document
{path-to-source-document}

---
## Iteration Log

### Iteration 0 - Setup ({date})
- [x] Workspace created
- [x] PRD generated with {N} stories
- Next: {first-story-id}

```

## Iteration Log Format

### Successful Iteration

```markdown
### Iteration {N} - {story-id} ({date})
- [x] {story-title}
- Files: {list of files changed}
- Learnings: {patterns discovered}
- Next: {next-story-id}
```

### Blocked Iteration

```markdown
### Iteration {N} - {story-id} ({date}) [BLOCKED]
- [ ] {story-title}
- Blocker: {what went wrong}
- Attempted: {what was tried}
- Resolution: {how to proceed}
```

### Handoff Record

```markdown
---

### Handoff: {from-agent} → {to-agent} ({date} {time})
- Last completed: {story-id}
- Remaining: {count} stories
- Reason: continuation
```

## Best Practices

1. **Prepend reusable patterns** - Put discoveries at the top in Session Context
2. **Append iteration logs** - Chronological history at bottom
3. **Be specific** - Include file paths, error messages, solutions
4. **Update Critical Files** - Add important files as you discover them
5. **Log gotchas** - Help future iterations avoid same issues

## Example: After Several Iterations

```markdown
# Progress Log: flows-table
# Started: 2026-01-10
# Branch: yellow/flows-table
# Workspace: ralph/workspaces/flows-table_2026-01-10/

## Session Context

### Project Overview
- Testimonials: Testimonial collection and display tool
- Tech Stack: Vue 3 + TypeScript + Tailwind, Hono.js API, Hasura GraphQL, PostgreSQL
- Package Manager: pnpm

### Key Patterns
- FSD Architecture: Types exported from models/ folders only
- GraphQL: Use generated types from @/shared/graphql/generated/operations
- Hasura: db/hasura/migrations/default/, db/hasura/metadata/
- Codegen: pnpm codegen:web
- Typecheck: pnpm typecheck
- Entity composables: Follow CoursePads patterns in useFlow.ts

### Critical Files
- db/hasura/migrations/default/1736502000000_create_flows/up.sql: Flows table
- apps/web/src/entities/flow/: Flow entity (FSD)
- docs/adr/009-flows-table-branching-architecture.md: Source spec

### Gotchas / Warnings
- branch_question_id FK uses ON DELETE RESTRICT (not CASCADE)
- BranchValue JSONB requires explicit type field
- flow_membership column is legacy - use flow_id

### Source Document
docs/adr/009-flows-table-branching-architecture.md

---
## Iteration Log

### Iteration 0 - Setup (2026-01-10)
- [x] Workspace created
- [x] PRD generated with 12 stories
- Next: DB-001

### Iteration 1 - DB-001 (2026-01-10)
- [x] Create flows table migration
- Files: db/hasura/migrations/default/1736502000000_create_flows/
- Learnings: Used CHECK constraints for flow_type and operators
- Next: DB-002

### Iteration 2 - DB-002 (2026-01-10)
- [x] Add flow_id column to form_steps
- Files: db/hasura/migrations/default/1736502100000_add_flow_id/
- Learnings: Column nullable for backfill phase
- Next: DB-003

---

### Handoff: yellow → green (2026-01-10 14:30)
- Last completed: DB-003
- Remaining: 9 stories
- Reason: continuation

### Iteration 4 - DB-004 (2026-01-10)
- [x] Make flow_id required and add FK
- Files: db/hasura/migrations/default/1736502300000_flow_id_required/
- Learnings: ON DELETE CASCADE for steps when flow deleted
- Next: DB-005
```
