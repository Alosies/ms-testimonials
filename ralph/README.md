# Ralph Loop - Autonomous Development Workflows

Ralph Loop automates multi-step implementations from ADRs, specs, or PRD documents. Three workflow options are available.

## Quick Start

### Recommended: Use /ralph-manager (One Command)

```bash
# Create workspace and auto-start loop (in Claude Code)
/ralph-manager docs/adr/010-auto-save.md --name auto-save

# → Creates workspace
# → Asks: "Start plugin loop?"
# → Select yes → automatically invokes /ralph-loop
```

### Manual: Official Plugin Directly

```bash
# If you already have a workspace, run the plugin directly
/ralph-loop "Read ralph/workspaces/auto-save_2026-01-11/prd.json and implement tasks. Output <promise>ALL-TASKS-COMPLETE</promise> when done." --max-iterations 20 --completion-promise "ALL-TASKS-COMPLETE"
```

### Alternative: AFK Mode (Terminal)

```bash
# After workspace is created, run in terminal for fully autonomous execution
make ralph-afk PRD=ralph/workspaces/auto-save_2026-01-11/prd.json MAX=20
```

---

## Workflow Comparison

| Aspect | Official Plugin | Shell Script (AFK) |
|--------|-----------------|-------------------|
| Command | `/ralph-loop` | `make ralph-afk` |
| Runs where | Inside Claude Code | Terminal (external) |
| Output | Live in session | Stream JSON |
| Context | Persists across iterations | Fresh each iteration |
| Best for | Interactive monitoring | Overnight/background |

---

## Workflow 1: Official Plugin (Recommended)

The `ralph-wiggum` plugin runs loops inside Claude Code with live output and persistent context.

### Prerequisites

Install the plugin (one-time):
```bash
claude plugin marketplace add anthropics/claude-code
claude plugin install ralph-wiggum
```

### Usage

```bash
# Start a loop
/ralph-loop "<prompt>" --max-iterations <n> --completion-promise "<text>"

# Cancel active loop
/cancel-ralph
```

### Example Commands

After creating a workspace with `/ralph-manager`:

```bash
# Basic loop
/ralph-loop "Read ralph/workspaces/my-feature_2026-01-11/prd.json and implement the next incomplete task. Update progress.txt with learnings. Output <promise>ALL-TASKS-COMPLETE</promise> when all tasks pass." --max-iterations 20 --completion-promise "ALL-TASKS-COMPLETE"

# With specific instructions
/ralph-loop "Read ralph/workspaces/my-feature_2026-01-11/prd.json. For each task: implement, run pnpm typecheck, mark passes:true if successful. Output <promise>DONE</promise> when complete." --max-iterations 30 --completion-promise "DONE"
```

### When to Use

- Interactive development with live feedback
- When you want to monitor progress
- Debugging and iterative refinement
- When context between iterations matters

---

## Workflow 2: Shell Script (AFK Mode)

Fully autonomous execution in terminal, spawning new Claude sessions for each iteration.

### Prerequisites

- Claude Code CLI installed at `~/.claude/local/claude`
- `envsubst` available (`brew install gettext` on macOS)

### Usage

```bash
# Using make (recommended)
make ralph-afk PRD=ralph/workspaces/my-feature_2026-01-10/prd.json
make ralph-afk PRD=ralph/workspaces/my-feature_2026-01-10/prd.json MAX=20

# HITL mode - single iteration
make ralph-once PRD=ralph/workspaces/my-feature_2026-01-10/prd.json

# Direct script usage
./ralph/ralph.sh --max 20 --prd ralph/workspaces/my-feature_2026-01-10/prd.json
```

### Make Commands

| Command | Description |
|---------|-------------|
| `make ralph-afk PRD=<path>` | Run AFK mode (default 5 iterations) |
| `make ralph-afk PRD=<path> MAX=20` | Run AFK mode with custom max iterations |
| `make ralph-once PRD=<path>` | Run single iteration (HITL mode) |

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --prd PATH` | Path to PRD JSON file | Required |
| `-r, --progress PATH` | Path to progress file | Same dir as PRD |
| `-c, --complete TEXT` | Completion signal text | `ALL-TASKS-COMPLETE` |
| `-m, --max N` | Maximum iterations | 10 |
| `-o, --once` | Single iteration (HITL) | false |

### Custom CLI Command

If your Claude CLI has a different name:

```bash
# One-time usage
CLAUDE_CMD=cc make ralph-afk PRD=ralph/workspaces/my-feature/prd.json

# Or export in your shell profile (~/.zshrc)
export CLAUDE_CMD=cc
```

### When to Use

- Overnight or long-running tasks
- Background processing
- CI/CD integration
- When you don't need to monitor

---

## Creating Workspaces

Use the `/ralph-manager` skill to create workspaces from ADRs or specs:

```bash
# Create new workspace from ADR/spec
/ralph-manager docs/adr/010-auto-save.md

# Create with custom name
/ralph-manager docs/adr/010-auto-save.md --name auto-save

# Check/continue existing workspace
/ralph-manager --continue ralph/workspaces/auto-save_2026-01-11/
```

After creating the workspace, `/ralph-manager` will ask what to do next:

| Option | Description |
|--------|-------------|
| **Start plugin loop** | Automatically invokes `/ralph-loop` to begin execution |
| **Show AFK command** | Displays `make ralph-afk` command to copy |
| **Review PRD** | Shows generated prd.json before running |
| **Cancel** | Exit without running |

Selecting "Start plugin loop" will directly invoke the `/ralph-loop` plugin - no copy/paste needed.

### Manual Creation

1. Create workspace folder:
   ```bash
   mkdir -p ralph/workspaces/my-feature_$(date +%Y-%m-%d)
   ```

2. Create `prd.json`:
   ```json
   {
     "feature": "my-feature",
     "prdDocument": "docs/adr/xxx.md",
     "userStories": [
       {
         "id": "TASK-001",
         "title": "First task",
         "priority": 1,
         "passes": false,
         "acceptanceCriteria": ["Criterion 1", "Criterion 2"]
       }
     ]
   }
   ```

3. Create `progress.txt`:
   ```bash
   echo "# Progress Log" > ralph/workspaces/my-feature_*/progress.txt
   ```

---

## Directory Structure

```
ralph/
├── README.md              # This file
├── ralph.sh               # Shell script for AFK mode
├── templates/
│   └── ralph-once         # Iteration prompt template (AFK mode)
└── workspaces/
    └── {feature}_{date}/
        ├── workspace.json # Agent metadata, handoffs
        ├── prd.json       # Task list with passes field
        └── progress.txt   # Session log
```

---

## Cross-Agent Sharing

Workspaces can be shared between agents (yellow, green, blue) via git:

```bash
# After completing a story
git add ralph/workspaces/
git commit -m "ralph(yellow): complete TASK-001 for my-feature"
git push

# Other agent picks up
git pull
/ralph-manager --continue ralph/workspaces/my-feature_2026-01-10/
```

---

## Completion Signal

Both workflows use the same completion signal. When all stories have `passes: true`:

```
<promise>ALL-TASKS-COMPLETE</promise>
```

---

## Troubleshooting

### Plugin not found

```bash
# Add Anthropic marketplace and install
claude plugin marketplace add anthropics/claude-code
claude plugin install ralph-wiggum
```

### Shell script says "envsubst not found"

```bash
# macOS
brew install gettext

# Linux
apt-get install gettext
```

### Shell script says "Claude CLI not found"

The script checks: `CLAUDE_CMD` env var → `claude` in PATH → `~/.claude/local/claude`

```bash
export CLAUDE_CMD=cc  # if using alias
```

### Loop stops unexpectedly

1. Check `progress.txt` for errors
2. Check PRD `notes` field for blocker details
3. Run with `--max-iterations 1` to debug single iteration
