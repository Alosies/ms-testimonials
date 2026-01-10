# Ralph Usage Guide

Practical guide for using Ralph Wiggum loops in this project.

## Quick Start

```bash
# HITL mode with default PRD
./scripts/ralph/ralph.sh --once

# HITL mode with custom PRD
./scripts/ralph/ralph.sh --once --prd docs/prd/my-feature.json

# AFK mode (20 iterations max)
./scripts/ralph/ralph.sh --max 20 --prd scripts/ralph/prd.json
```

## Setup Checklist

Before starting a Ralph session:

- [ ] PRD/ADR document ready with clear requirements
- [ ] PRD JSON file created (can be anywhere, passed via `--prd`)
- [ ] Progress file initialized (auto-created if missing)
- [ ] Feature branch created

## Creating User Stories

### Story Sizing

Stories should fit within a single context window. Break large tasks into smaller pieces.

**Too Large:**
```json
{
  "title": "Implement entire authentication system",
  "acceptanceCriteria": ["Everything works"]
}
```

**Right Size:**
```json
{
  "title": "Create users table migration",
  "acceptanceCriteria": [
    "Migration file at db/hasura/migrations/",
    "Columns: id, email, created_at, updated_at",
    "hasura migrate apply succeeds",
    "pnpm typecheck passes"
  ]
}
```

### Acceptance Criteria Best Practices

1. **Be specific** - Include exact commands to run
2. **Be testable** - Each criterion should be verifiable
3. **Include verification** - Always end with typecheck/test commands
4. **Reference specs** - Point to ADR sections for details

### Story ID Conventions

| Prefix | Category |
|--------|----------|
| DB- | Database migrations |
| GQL- | GraphQL operations |
| TS- | TypeScript types/utilities |
| BE- | Backend/API changes |
| FE- | Frontend components |
| TEST- | Test coverage |

## Running HITL Mode

### Step 1: Start Session

```bash
# Option A: Use the runner script (prints instructions)
./scripts/ralph/ralph.sh --once --prd path/to/your/prd.json

# Option B: Direct in Claude Code session
Read scripts/ralph/ralph-once and execute it.
Use PRD: path/to/your/prd.json
Use Progress: scripts/ralph/progress.txt
```

### Step 2: Watch and Guide

- Ralph announces which story it's working on
- Review code as it's written
- Intervene if going off-track
- Approve or reject changes

### Step 3: Verify Completion

When Ralph says "STORY COMPLETE":
1. Check prd.json was updated (passes: true)
2. Check progress.txt has iteration log
3. Review the code changes
4. Run verification commands yourself

### Step 4: Continue or Stop

```bash
# Continue to next story:
Continue with the next story from prd.json

# Stop session:
Stop here, we'll continue later
```

## Running AFK Mode

### With Official Plugin

```bash
# Install plugin first (see plugin docs)

# Run loop with safety limits
/ralph-loop "Read scripts/ralph/ralph-once and execute all stories" \
  --max-iterations 50 \
  --completion-promise "ADR-009-COMPLETE"
```

### With Custom Script

```bash
# scripts/ralph/ralph.sh
#!/bin/bash
MAX_ITERATIONS=${1:-10}
ITERATION=0

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  echo "=== Iteration $((ITERATION + 1)) of $MAX_ITERATIONS ==="

  # Run Claude with the prompt
  cat scripts/ralph/ralph-once | claude

  # Check for completion signal
  if grep -q "ADR-009-COMPLETE" scripts/ralph/progress.txt; then
    echo "All stories complete!"
    exit 0
  fi

  ITERATION=$((ITERATION + 1))
done

echo "Max iterations reached"
```

## Handling Common Situations

### Story is Blocked

Ralph should:
1. Update `notes` field in prd.json with blocker
2. Append details to progress.txt
3. NOT mark passes: true
4. Signal: "STORY BLOCKED: [id] - [reason]"

You should:
1. Review the blocker
2. Either resolve it yourself or update requirements
3. Continue session

### Story Partially Complete

Ralph should:
1. List what was completed vs remaining
2. Keep passes: false
3. Update notes with progress

You should:
1. Decide whether to split into smaller stories
2. Or continue from current state

### Typecheck/Test Fails

Ralph should:
1. Attempt to fix the error
2. If can't fix after reasonable attempts, log to notes
3. Keep passes: false

### Wrong Approach Taken

You should:
1. Stop the session
2. Revert changes if needed: `git checkout .`
3. Update ralph-once with clearer guidance
4. Update progress.txt with "Approach X didn't work because..."
5. Resume session

## Project-Specific Commands

### Database Changes
```bash
# Apply migration
cd db/hasura && hasura migrate apply --database-name default

# Apply metadata
cd db/hasura && hasura metadata apply

# Check migration status
cd db/hasura && hasura migrate status --database-name default
```

### GraphQL Changes
```bash
# Regenerate types
pnpm codegen:web

# Watch mode (during development)
pnpm codegen:web:watch
```

### Verification
```bash
# Typecheck all packages
pnpm typecheck

# Typecheck web only
pnpm exec vue-tsc --noEmit -p apps/web/tsconfig.app.json
```

## Tips for Success

### 1. Front-Load Context

Put important patterns and conventions in progress.txt BEFORE starting. Ralph reads this first.

### 2. Order Stories by Dependency

Database first, then GraphQL, then frontend. Ralph works in priority order.

### 3. Include Verification in Acceptance Criteria

Always end with "Typecheck passes" or "Tests pass" - this catches issues immediately.

### 4. Use Skills

Reference project skills in ralph-once:
- `/hasura-migrations` for database
- `/graphql-code` for GraphQL operations

### 5. Review Between Stories

In HITL mode, review each completed story before continuing. Catch issues early.

### 6. Keep progress.txt Clean

Delete session-specific notes after feature is complete. Keep only reusable patterns.

## Troubleshooting

### Ralph Keeps Failing Same Story

1. Check if acceptance criteria are realistic
2. Check if dependencies are met (previous stories complete)
3. Add more context to progress.txt
4. Break story into smaller pieces

### Ralph Over-Engineers

1. Add to ralph-once: "Be precise - no over-engineering"
2. Make acceptance criteria more specific
3. Add: "Only implement what's explicitly required"

### Context Window Exceeded

1. Stories are too large - break them down
2. Too much in progress.txt - trim to essentials
3. Too many files being read - be more specific about which files

### Ralph Goes Off-Track

1. Stop immediately
2. Review what went wrong
3. Add clarification to ralph-once
4. Add warning to progress.txt
5. Resume with clearer guidance
