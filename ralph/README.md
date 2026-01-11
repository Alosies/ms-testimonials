# Ralph Loop - Autonomous Development Workflows

Ralph Loop automates multi-step implementations from ADRs, specs, or PRD documents. Two workflow options are available depending on your needs.

## Quick Start

### New Feature (Two-Step Process)

```bash
# Step 1: Create workspace from ADR/spec (in Claude Code)
/ralph-loop docs/adr/010-auto-save.md --name auto-save

# Step 2: Run AFK mode (in terminal, after workspace exists)
./ralph/ralph.sh --max 20 --prd ralph/workspaces/auto-save_2026-01-11/prd.json
```

### Continue Existing Workspace

```bash
# Option A: AFK Mode (terminal) - using make
make ralph-afk PRD=ralph/workspaces/my-feature_2026-01-10/prd.json MAX=20

# Option B: Interactive (Claude Code)
/ralph-loop --continue ralph/workspaces/my-feature_2026-01-10/
```

> **Note**: The shell script requires an existing workspace with `prd.json`. Use the skill first to create workspaces from ADRs/specs, or create them manually.

## Workflow Comparison

| Aspect | Shell Script (AFK) | Skill (Interactive) |
|--------|-------------------|---------------------|
| Command | `./ralph/ralph.sh` | `/ralph-loop` |
| Runs where | Terminal | Claude Code session |
| Autonomy | Fully autonomous | Story-by-story with prompts |
| Context | Fresh each iteration | Maintains conversation |
| Best for | Long-running tasks, overnight | Quick iterations, debugging |

---

## Workflow 1: Shell Script (AFK Mode)

Fully autonomous execution that runs outside Claude Code, spawning new Claude sessions for each iteration.

### Prerequisites

- `claude` CLI installed and in PATH
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
./ralph/ralph.sh --once --prd ralph/workspaces/my-feature_2026-01-10/prd.json
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

### How It Works

1. Reads PRD and progress files
2. Substitutes variables into `templates/ralph-once`
3. Pipes prompt to `claude -p -` (non-interactive mode)
4. Checks for completion signal in progress file
5. Repeats until complete or max iterations reached

### When to Use

- Overnight or long-running tasks
- When you don't want to monitor progress
- Batch processing multiple stories
- CI/CD integration

---

## Workflow 2: Skill Mode (Interactive)

Runs inside your Claude Code session with full conversation context.

### Usage

```bash
# Continue existing workspace
/ralph-loop --continue ralph/workspaces/my-feature_2026-01-10/

# Create new workspace from spec
/ralph-loop docs/adr/009-flows-table.md

# Create with custom name
/ralph-loop docs/adr/009-flows-table.md --name flows-table
```

### How It Works

1. Reads workspace files (prd.json, progress.txt)
2. Finds next incomplete story (`passes: false`)
3. Implements and verifies the story
4. Updates progress and marks complete
5. Signals status and waits for "continue"

### When to Use

- Debugging complex implementations
- When you want to review each step
- When context between stories matters
- Interactive problem-solving

### Continuing the Loop

After each story completes, say:
- "continue" - proceed to next story
- "stop" - pause the loop
- Ask questions about the implementation

---

## Directory Structure

```
ralph/
├── README.md              # This file
├── ralph.sh               # Shell script for AFK mode
├── templates/
│   └── ralph-once         # Iteration prompt template
└── workspaces/
    └── {feature}_{date}/
        ├── workspace.json # Agent metadata, handoffs
        ├── prd.json       # Task list with passes field
        └── progress.txt   # Session log
```

---

## Creating a Workspace

### Option A: Using the Skill

```bash
/ralph-loop docs/adr/010-auto-save.md --name auto-save
```

This will:
1. Parse the ADR/spec document
2. Generate a PRD with user stories
3. Create workspace folder with all files
4. Start executing the first story

### Option B: Manual Creation

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

3. Create empty `progress.txt`:
   ```bash
   echo "# Progress Log" > ralph/workspaces/my-feature_*/progress.txt
   ```

4. Run with shell script or skill

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
/ralph-loop --continue ralph/workspaces/my-feature_2026-01-10/
```

---

## Completion Signal

Both workflows use the same completion signal. When all stories have `passes: true`:

```
<promise>ALL-TASKS-COMPLETE</promise>
```

The shell script checks for this in `progress.txt` to exit the loop.

---

## Troubleshooting

### Shell script says "envsubst not found"

```bash
# macOS
brew install gettext

# Linux
apt-get install gettext
```

### Shell script says "claude CLI not found"

Install Claude Code CLI. The `claude` command must be in your PATH.

### Stories not being marked complete

Check that verification commands pass:
- `pnpm typecheck`
- `hasura migrate apply --database-name default`
- `pnpm codegen:web`

### Loop stops unexpectedly

1. Check `progress.txt` for errors
2. Check PRD `notes` field for blocker details
3. Run in HITL mode (`--once`) to debug interactively
