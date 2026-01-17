---
name: ralph-manager
description: Create and manage Ralph workspaces from ADRs or specs. Generates PRD tasks, workspace metadata, and progress tracking for ralph-tui execution. Triggers on "workspace", "prd", "create workspace".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite
---

# Ralph Manager Skill

Create and manage workspaces for Ralph TUI execution. This skill prepares all files needed for `ralph-tui run`.

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
1. **Show run command (Recommended)** - Displays `ralph-tui run` command
2. **Review PRD** - Shows the generated prd.json
3. **Cancel** - Exit without running

## Ralph TUI Run Command

When user asks for the command to run ralph-tui, provide this format:

```bash
ralph-tui run --prd ralph/workspaces/{workspace-folder}/prd.json
```

The user runs this command in their terminal to start the autonomous execution loop.

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
New:      Parse args → Detect agent → Create workspace → Generate PRD → Ask user → Show run command
Continue: Validate → Detect agent → Check handoff → Update metadata → Ask user → Show run command
```

## Procedures

| Action | Read |
|--------|------|
| Create new workspace | `procedures/new-workspace.md` |
| Continue existing | `procedures/continue-workspace.md` |

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

1. **Generate valid prd.json** - Must be compatible with ralph-tui format
2. **Record handoffs** - Track agent transitions in workspace.json
3. **Include acceptance criteria** - Each task needs clear verification steps

## Cross-Agent Sharing

```bash
# After workspace setup
git add ralph/workspaces/
git commit -m "ralph(yellow): setup workspace for flows-table"
git push

# Other agent continues
git pull
/ralph-manager --continue ralph/workspaces/flows-table_2026-01-10/
```
