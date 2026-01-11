# Continue Workspace Procedure

Resume an existing Ralph workspace, handling agent handoffs.

## Usage

```bash
/ralph-manager --continue ralph/workspaces/flows-table_2026-01-10/
```

---

## Step 1: Validate Workspace

Check that the workspace path exists and contains required files:

```
ralph/workspaces/{name}/
├── workspace.json   # Required
├── prd.json         # Required
└── progress.txt     # Required
```

If any file is missing, report error and exit.

---

## Step 2: Detect Current Agent

Determine which agent is running by checking the working directory path:

```
Path contains "ms-testimonials-yellow" → agent: "yellow"
Path contains "ms-testimonials-green"  → agent: "green"
Path contains "ms-testimonials-blue"   → agent: "blue"
```

---

## Step 3: Check for Handoff

Read `workspace.json` and compare `primaryAgent` with current agent.

**If same agent:** No handoff needed, proceed to Step 5.

**If different agent:** Record handoff (Step 4).

---

## Step 4: Record Handoff

When a different agent continues the workspace:

### 4a. Find last completed story

Read `prd.json` and find the last story where `passes: true`:
```javascript
const lastCompleted = userStories
  .filter(s => s.passes)
  .sort((a, b) => b.priority - a.priority)[0];
```

### 4b. Update workspace.json

Add handoff record and update primaryAgent:

```json
{
  "feature": "flows-table",
  "createdAt": "2026-01-10T08:30:00Z",
  "createdBy": "yellow",
  "primaryAgent": "green",
  "status": "active",
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

### 4c. Log handoff in progress.txt

Append to progress.txt:

```markdown
---

### Handoff: yellow → green (2026-01-10 14:30)
- Last completed: DB-003
- Remaining: 9 stories
- Reason: continuation
```

---

## Step 5: Show Workspace Status

Display current state and ask what to do next:

```
=== Continuing Ralph Workspace ===

Feature:    {feature-name}
Agent:      {current-agent} (was: {previous-agent})
Workspace:  ralph/workspaces/{folder-name}/
Progress:   {completed}/{total} stories

Completed:
  ✓ [DB-001] Create flows table migration
  ✓ [DB-002] Add flow_id column
  ✓ [DB-003] Backfill existing data

Remaining:
  1. [DB-004] Make flow_id required
  2. [GQL-001] Create GraphQL operations
  ...
```

**Use AskUserQuestion tool:**

```json
{
  "questions": [{
    "question": "What would you like to do next?",
    "header": "Action",
    "multiSelect": false,
    "options": [
      {
        "label": "Start plugin loop (Recommended)",
        "description": "Invoke /ralph-loop to continue autonomous execution"
      },
      {
        "label": "Show AFK command",
        "description": "Display terminal command for background execution"
      },
      {
        "label": "Review PRD",
        "description": "Show current prd.json status"
      },
      {
        "label": "Review progress",
        "description": "Show progress.txt log"
      },
      {
        "label": "Cancel",
        "description": "Exit without running"
      }
    ]
  }]
}
```

---

## Step 6: Execute Based on Selection

### If "Start plugin loop" selected:

Use the **Skill tool** to invoke `/ralph-loop`:

```json
{
  "skill": "ralph-loop",
  "args": "\"Read ralph/workspaces/{folder-name}/prd.json and implement the next task where passes:false. Follow acceptance criteria exactly. Run pnpm typecheck to verify. Update prd.json (set passes:true) and progress.txt when complete. Output <promise>ALL-TASKS-COMPLETE</promise> when all tasks pass.\" --max-iterations 20 --completion-promise \"ALL-TASKS-COMPLETE\""
}
```

### If "Show AFK command" selected:

Display the command for the user to copy:

```
Run this in your terminal for autonomous execution:

make ralph-afk PRD=ralph/workspaces/{folder-name}/prd.json MAX=10
```

### If "Review PRD" or "Review progress" selected:

Read and display the requested file, then return to Step 5 to ask again.

### If "Cancel" selected:

Exit the skill with message: "Workspace ready. Run `/ralph-manager --continue ralph/workspaces/{folder-name}/` to continue later."
