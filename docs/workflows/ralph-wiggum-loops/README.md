# Ralph Wiggum Loops

> Autonomous AI development loops for Claude Code - "Iteration over Perfection"

## What is Ralph?

Ralph Wiggum is a technique for running AI coding agents in iterative loops until task completion. Named after The Simpsons character who persists despite setbacks, it embodies the philosophy of continuous iteration.

At its core, Ralph is simple:

```bash
while :; do cat PROMPT.md | claude-code; done
```

The modern implementation uses Claude Code's **Stop hook** to intercept exit attempts and re-feed the same prompt, creating a self-referential feedback loop within a single session.

## Core Concepts

### The Loop Mechanism

1. You provide a prompt with clear completion criteria
2. Claude works on the task
3. When Claude tries to exit, the Stop hook intercepts
4. The same prompt is re-fed to Claude
5. Claude sees modified files + git history from previous iterations
6. Loop continues until completion promise is output

### Memory Persistence

Each iteration starts with a fresh context window, but memory persists through:

| Memory Type | Purpose |
|-------------|---------|
| **Git history** | Code changes and commit messages |
| **prd.json** | Task list with completion status |
| **progress.txt** | Accumulated learnings and patterns |
| **AGENTS.md** | Permanent coding conventions |

### Two Operating Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **HITL (Human-in-the-Loop)** | Single iterations with human review | Learning Ralph, complex decisions, pair programming |
| **AFK (Away From Keyboard)** | Multiple iterations unattended | Overnight builds, mechanical tasks, greenfield projects |

## When to Use Ralph

### Good For

- Large refactors with clear success criteria
- Framework migrations (Jest → Vitest, etc.)
- TDD workflows where "all tests pass" is the goal
- Greenfield projects with well-defined specs
- Batch operations (documentation, code standardization)
- Test coverage expansion

### Not Good For

- Tasks requiring human judgment or design decisions
- Ambiguous requirements ("make it better")
- Security-sensitive code review
- Production debugging
- Architectural decisions

### The Golden Rule

> If you can precisely define "done", Ralph can iterate toward it.

## File Structure

```
ralph/
├── templates/
│   └── ralph-once        # Prompt template for iterations
├── workspaces/
│   ├── flows-table_2026-01-10/
│   │   ├── prd.json      # Task list
│   │   └── progress.txt  # Session log
│   └── feature-x_2026-01-12/
│       ├── prd.json
│       └── progress.txt
└── ralph.sh              # Optional CLI runner
```

## Quick Start

### Using the Skill (Recommended)

```bash
# Start from an ADR/spec document (auto-generates prd.json)
/ralph-loop docs/adr/009-flows-table-branching-architecture.md

# Start with custom feature name
/ralph-loop docs/adr/009-flows-table.md --name flows-table

# Continue a previous session
/ralph-loop --continue ralph/workspaces/flows-table_2026-01-10/
```

The skill automatically:
1. Creates timestamped workspace folder
2. Generates prd.json from your ADR/spec
3. Sets up progress.txt with project context
4. Asks for confirmation before starting
5. Executes the loop

### Using the Runner Script (Manual)

```bash
# HITL mode
./ralph/ralph.sh --once --prd ralph/workspaces/my-feature_2026-01-10/prd.json

# AFK mode (20 iterations)
./ralph/ralph.sh --max 20 --prd ralph/workspaces/my-feature_2026-01-10/prd.json

# See all options
./ralph/ralph.sh --help
```

### With Official Plugin (AFK Mode)

```bash
/ralph-loop "Your task here" --max-iterations 50 --completion-promise "COMPLETE"
```

## Cross-Agent Sharing

Workspaces are git-tracked and shared across agents (yellow/green/blue):

```bash
# Yellow agent creates workspace
/ralph-loop docs/adr/feature-x.md --name feature-x
git add ralph/workspaces/ && git commit -m "ralph: init feature-x workspace"

# Green agent continues
git pull
/ralph-loop --continue ralph/workspaces/feature-x_2026-01-10/
```

## Key Principles

1. **Iteration > Perfection** - Let the loop refine work over time
2. **Failures Are Data** - Use test failures to improve implementation
3. **Operator Skill Matters** - Success depends on writing good prompts
4. **Persistence Wins** - The loop handles retry logic automatically
5. **Right-Size Stories** - Tasks must fit within a single context window

## Real-World Results

- Created entire programming language ("cursed") over 3 months
- Y Combinator teams shipped 6+ repositories overnight
- $50k contract completed for ~$297 in API costs

## Cost Considerations

- 50-iteration loops on large codebases: $50-100+ in API credits
- Always set `--max-iterations` as safety net
- Monitor token usage on large repositories

## References

- [Official Plugin](https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum)
- [Original Technique](https://ghuntley.com/ralph/)
- [Snarktank Ralph](https://github.com/snarktank/ralph)
- [Tips for AI Coding](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
