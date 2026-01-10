---
name: ralph-loop
description: Start autonomous Ralph Wiggum development loops. Creates timestamped workspace with PRD tasks, progress tracking, and iterative execution. Use when you want to automate multi-step implementations from ADRs, specs, or PRD documents. Triggers on "ralph", "loop", "autonomous", "iterate".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite
---

# Ralph Loop Skill

Autonomous development loops with workspace setup and cross-agent handoffs.

## Quick Reference

```bash
# New workspace from ADR/spec
/ralph-loop docs/adr/009-flows-table.md

# New workspace with custom name
/ralph-loop docs/adr/009-flows-table.md --name flows-table

# Continue existing workspace
/ralph-loop --continue ralph/workspaces/flows-table_2026-01-10/
```

## Directory Structure

```
ralph/
├── templates/ralph-once     # Iteration prompt template
└── workspaces/
    └── {feature}_{date}/
        ├── workspace.json   # Agent metadata, handoffs
        ├── prd.json         # Task list with passes field
        └── progress.txt     # Session log
```

## Workflow

```
New:      Parse args → Detect agent → Create workspace → Generate PRD → Confirm → Execute
Continue: Validate → Detect agent → Check handoff → Update metadata → Confirm → Execute
```

## Procedures

| Action | Read |
|--------|------|
| Create new workspace | `procedures/new-workspace.md` |
| Continue existing | `procedures/continue-workspace.md` |
| Execute loop | `procedures/execute-loop.md` |

## Schemas

| File | Read |
|------|------|
| workspace.json | `schemas/workspace-json.md` |
| prd.json | `schemas/prd-json.md` |
| progress.txt | `schemas/progress-txt.md` |

## References

| Topic | Read |
|-------|------|
| Task prefix → Skill mapping | `references/skill-map.md` |

## Agent Detection

Determine agent from working directory path:
- `ms-testimonials-yellow` → `yellow`
- `ms-testimonials-green` → `green`
- `ms-testimonials-blue` → `blue`

## Key Rules

1. **One story at a time** - Complete before moving to next
2. **Always verify** - Run typecheck before marking passes: true
3. **Update progress.txt** - Log learnings for future iterations
4. **Record handoffs** - Track agent transitions in workspace.json
5. **Use skills** - Invoke `/hasura-migrations`, `/graphql-code` as needed

## Cross-Agent Sharing

```bash
# After completing story
git add ralph/workspaces/
git commit -m "ralph(yellow): complete DB-001 for flows-table"
git push

# Other agent continues
git pull
/ralph-loop --continue ralph/workspaces/flows-table_2026-01-10/
```

## Completion Signal

When all stories have `passes: true`:
```
<promise>ALL-TASKS-COMPLETE</promise>
```
