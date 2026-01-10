# Ralph File Formats

Reference documentation for Ralph Wiggum file structures.

## workspace.json

Metadata file tracking agent ownership, handoffs, and workspace status.

### Schema

```json
{
  "feature": "string",
  "createdAt": "ISO 8601 timestamp",
  "createdBy": "yellow | green | blue",
  "primaryAgent": "yellow | green | blue",
  "status": "active | paused | completed | archived",
  "sourceDocument": "string (path to ADR/spec)",
  "handoffs": [
    {
      "from": "yellow | green | blue",
      "to": "yellow | green | blue",
      "at": "ISO 8601 timestamp",
      "reason": "string",
      "lastCompletedStory": "string (story ID)"
    }
  ]
}
```

### Example

```json
{
  "feature": "flows-table",
  "createdAt": "2026-01-10T08:30:00Z",
  "createdBy": "yellow",
  "primaryAgent": "green",
  "status": "active",
  "sourceDocument": "docs/adr/009-flows-table-branching-architecture.md",
  "handoffs": [
    {
      "from": "yellow",
      "to": "green",
      "at": "2026-01-10T14:30:00Z",
      "reason": "continuation",
      "lastCompletedStory": "DB-003"
    }
  ]
}
```

### Key Fields

| Field | Purpose |
|-------|---------|
| `createdBy` | Agent that created the workspace |
| `primaryAgent` | Current owner - updated on handoffs |
| `status` | Workspace lifecycle state |
| `handoffs` | History of agent transfers |

---

## prd.json

The Product Requirements Document in JSON format. Serves as both scope definition and progress tracker.

### Schema

```json
{
  "project": "string",
  "branchName": "string",
  "description": "string",
  "prdDocument": "string (optional - path to detailed spec)",
  "userStories": [
    {
      "id": "string (e.g., DB-001, FE-002)",
      "title": "string",
      "description": "string (user story format preferred)",
      "acceptanceCriteria": ["string[]"],
      "priority": "number (lower = higher priority)",
      "passes": "boolean (false = incomplete, true = done)",
      "notes": "string (learnings, blockers, context)"
    }
  ]
}
```

### Example

```json
{
  "project": "ms-testimonials",
  "branchName": "yellow/feature-x",
  "description": "Implement feature X with full test coverage",
  "userStories": [
    {
      "id": "DB-001",
      "title": "Create database migration",
      "description": "As a developer, I need the new table to store feature data.",
      "acceptanceCriteria": [
        "Migration file created at db/hasura/migrations/",
        "Table has required columns with proper types",
        "Migration applies successfully",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### Key Fields

| Field | Purpose |
|-------|---------|
| `id` | Unique story identifier, use prefixes (DB-, FE-, BE-, TS-) |
| `priority` | Execution order - Ralph picks lowest number first |
| `passes` | Completion flag - Ralph sets to `true` when done |
| `acceptanceCriteria` | Specific, testable conditions for completion |
| `notes` | Ralph writes learnings, blockers, or context here |

---

## progress.txt

Append-only session log documenting what Ralph attempted, learned, and encountered.

### Structure

```markdown
# Progress Log: [Feature Name]
# Started: YYYY-MM-DD
# Branch: branch-name

## Session Context

### Project Overview
- Brief project description
- Tech stack summary

### Key Patterns Discovered
- Pattern 1: Description
- Pattern 2: Description

### Critical Files
- File path 1: Purpose
- File path 2: Purpose

### Gotchas / Warnings
- Warning 1
- Warning 2

---
## Iteration Log

### Iteration N - [Date]
- [x] What was completed
- [ ] What was attempted but failed
- Learnings: What was discovered
- Blockers: What's blocking progress
- Next: What to do next iteration
```

### Why progress.txt Matters

Without it, each iteration must explore the entire repo to understand current state. Progress.txt short-circuits that exploration - Ralph reads it, sees what's done, and jumps straight into the next task.

### Best Practices

1. **Prepend reusable patterns** - Put discoveries at the top
2. **Append iteration logs** - Chronological history at bottom
3. **Delete when done** - It's session-specific, not permanent docs
4. **Be specific** - Include file paths, error messages, solutions

---

## ralph-once

Single iteration prompt file for HITL (Human-in-the-Loop) mode.

### Structure

```markdown
# Ralph-Once: [Feature Name]

You are implementing [feature description].

## Your Mission
[Clear statement of what to accomplish]

## Files to Read First
1. **PRD**: `scripts/ralph/prd.json`
2. **Progress**: `scripts/ralph/progress.txt`
3. **Spec**: `path/to/detailed-spec.md`

## Execution Steps

### 1. Select Task
- Read prd.json
- Find highest priority story where passes: false
- Announce what you're working on

### 2. Implement
- Follow acceptance criteria exactly
- Reference spec for details
- Use project conventions

### 3. Verify
- Run typecheck
- Run tests
- Apply migrations (if applicable)

### 4. Update Progress
If complete:
- Set passes: true in prd.json
- Append iteration log to progress.txt

If blocked:
- Update notes field with blocker
- Append failure details to progress.txt
- DO NOT mark passes: true

### 5. Signal Status
When story complete: STORY COMPLETE: [id]
When ALL complete: <promise>FEATURE-COMPLETE</promise>

## Quality Gates
- [ ] All acceptance criteria met
- [ ] Typecheck passes
- [ ] Tests pass (if applicable)

## Important Rules
1. One story at a time
2. Read before writing
3. Update progress.txt
4. Be precise - no over-engineering
```

---

## AGENTS.md (Optional)

Permanent conventions file containing coding patterns and style guidelines. Unlike progress.txt (session-specific), AGENTS.md persists across features.

### Structure

```markdown
# AGENTS.md

## Project Conventions

### Code Style
- Convention 1
- Convention 2

### Architecture
- Pattern 1
- Pattern 2

### Common Commands
- Command 1: Description
- Command 2: Description

### Gotchas
- Gotcha 1: How to avoid
- Gotcha 2: How to avoid
```

---

## Directory Layout

Recommended structure:

```
project-root/
├── ralph/
│   ├── ralph.sh              # CLI runner (optional)
│   ├── templates/
│   │   └── ralph-once        # Prompt template
│   └── workspaces/
│       └── feature-name_2026-01-10/
│           ├── workspace.json  # Agent metadata
│           ├── prd.json        # Task list
│           └── progress.txt    # Session log
├── AGENTS.md                 # Permanent conventions (optional)
└── docs/
    └── adr/
        └── feature-spec.md   # Source specification
```
