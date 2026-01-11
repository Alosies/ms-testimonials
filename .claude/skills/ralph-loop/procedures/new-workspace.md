# New Workspace Procedure

Create a new Ralph workspace from an ADR or spec document.

## Step 1: Parse Arguments

Extract from user input:
- **Source file**: Path to ADR, spec document, or existing prd.json
- **Feature name** (optional): Custom name, otherwise derive from filename

**Argument patterns:**
```
/ralph-loop <source-file>
/ralph-loop <source-file> --name <feature-name>
```

**Derive feature name from filename:**
```
docs/adr/009-flows-table-branching-architecture.md
→ feature: "009-flows-table-branching-architecture"
→ or with --name: "flows-table"
```

---

## Step 2: Detect Agent Color

Determine which agent is running by checking the working directory path:

```
Path contains "ms-testimonials-yellow" → agent: "yellow"
Path contains "ms-testimonials-green"  → agent: "green"
Path contains "ms-testimonials-blue"   → agent: "blue"
```

Store this for workspace.json creation.

---

## Step 3: Create Workspace Folder

Create timestamped workspace folder:

```
ralph/workspaces/{feature-name}_{YYYY-MM-DD}/
├── workspace.json   # Metadata (agent ownership, handoffs)
├── prd.json         # Task list (generated or copied)
└── progress.txt     # Session tracking
```

**Folder naming:**
- Feature name: lowercase, hyphens (e.g., `flows-table`)
- Date: local date in YYYY-MM-DD format
- Example: `flows-table_2026-01-10/`

**Create folder:**
```bash
WORKSPACE="ralph/workspaces/${FEATURE_NAME}_$(date +%Y-%m-%d)"
mkdir -p "$WORKSPACE"
```

---

## Step 4: Create workspace.json

See: `schemas/workspace-json.md` for full schema.

```json
{
  "feature": "flows-table",
  "createdAt": "2026-01-10T08:30:00Z",
  "createdBy": "yellow",
  "primaryAgent": "yellow",
  "status": "active",
  "sourceDocument": "docs/adr/009-flows-table.md",
  "handoffs": []
}
```

---

## Step 5: Generate or Copy PRD

### If source is prd.json:
Copy directly to workspace:
```bash
cp "$SOURCE_FILE" "$WORKSPACE/prd.json"
```

### If source is ADR/spec document:
Generate prd.json by analyzing the document. See: `schemas/prd-json.md` for full schema.

**Read the source document and extract:**
1. Feature description → `description` field
2. Implementation checklist items → `userStories` array
3. Acceptance criteria from requirements → `acceptanceCriteria` arrays

**Story ID Prefixes:**
| Prefix | Category |
|--------|----------|
| DB- | Database migrations |
| GQL- | GraphQL operations |
| TS- | TypeScript types |
| BE- | Backend/API |
| FE- | Frontend |
| TEST- | Tests |

**Story sizing rules:**
- Each story should complete in one context window
- Break large tasks into smaller pieces
- Always end with verification command (e.g., `pnpm typecheck passes`)

---

## Step 6: Create Progress File

See: `schemas/progress-txt.md` for full template.

Generate `progress.txt` with project context including:
- Feature name and start date
- Branch name (using agent color)
- Workspace path
- Project overview and tech stack
- Key patterns and conventions
- Path to source document
- Empty iteration log section

---

## Step 7: Confirm with User

Before starting, show workspace summary and ask for confirmation:

```
=== Ralph Workspace Created ===

Feature:    {feature-name}
Agent:      {yellow|green|blue}
Workspace:  ralph/workspaces/{folder-name}/
Source:     {source-file-path}
Stories:    {count} user stories

Story Overview:
  1. [DB-001] Create flows table migration
  2. [DB-002] Add flow_id column to form_steps
  3. [GQL-001] Create GraphQL operations
  ...

---
AFK Mode Command (run in terminal for autonomous execution):

  make ralph-afk PRD=ralph/workspaces/{folder-name}/prd.json

Or with more iterations:

  make ralph-afk PRD=ralph/workspaces/{folder-name}/prd.json MAX=10
---

Ready to start the loop?
```

**Use AskUserQuestion tool:**
```
Options:
- Start loop (begin with first story)
- Run AFK mode (show command and exit)
- Review PRD (show full prd.json)
- Edit stories (modify before starting)
- Cancel
```
