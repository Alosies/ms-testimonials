---
name: ralph-manager
description: Create and manage Ralph workspaces from ADRs or specs. Generates PRD tasks, workspace metadata, and progress tracking. Can invoke /ralph-loop plugin directly. Triggers on "workspace", "prd", "create workspace".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite, Skill
---

# Ralph Manager Skill

Create and manage workspaces for Ralph autonomous loops. This skill handles workspace setup and can directly invoke the `/ralph-loop` plugin.

## Quick Reference

```bash
# Create new workspace from ADR/spec
/ralph-manager docs/adr/009-flows-table.md

# Create with custom name
/ralph-manager docs/adr/009-flows-table.md --name flows-table

# Continue/check existing workspace
/ralph-manager --continue ralph/workspaces/flows-table_2026-01-10/
```

After workspace creation, you'll be asked:
1. **Start plugin loop** - Invokes `/ralph-loop` automatically
2. **Show AFK command** - Displays `make ralph-afk` command for terminal
3. **Review PRD** - Shows the generated prd.json
4. **Cancel** - Exit without running

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
New:      Parse args → Detect agent → Create workspace → Generate PRD → Ask user → Execute or Show command
Continue: Validate → Detect agent → Check handoff → Update metadata → Ask user → Execute or Show command
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

## Invoking /ralph-loop

When user selects "Start plugin loop", use the Skill tool:

```
Skill tool with:
  skill: "ralph-loop"
  args: "Read ralph/workspaces/{folder}/prd.json and implement the next task where passes:false. Follow acceptance criteria exactly. Run pnpm typecheck to verify. Update prd.json (set passes:true) and progress.txt when complete. Output <promise>ALL-TASKS-COMPLETE</promise> when all tasks pass." --max-iterations 20 --completion-promise "ALL-TASKS-COMPLETE"
```

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
/ralph-manager --continue ralph/workspaces/flows-table_2026-01-10/
```

## Completion Signal

When all stories have `passes: true`:
```
<promise>ALL-TASKS-COMPLETE</promise>
```
