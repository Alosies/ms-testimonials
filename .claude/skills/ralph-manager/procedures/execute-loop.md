# Execute Loop Procedure

Execute the Ralph loop for a workspace.

## Prerequisites

- Workspace exists with `workspace.json`, `prd.json`, `progress.txt`
- User has confirmed they want to start/continue

---

## Step 1: Announce Start

```
Starting Ralph loop for: {feature-name}
Agent: {current-agent}
Workspace: ralph/workspaces/{folder-name}/
PRD: {workspace}/prd.json
Progress: {workspace}/progress.txt
```

---

## Step 2: Read Prompt Template

Read the Ralph iteration template:
```
ralph/templates/ralph-once
```

---

## Step 3: Execute Iteration

For each iteration:

### 3a. Select Task

Read `prd.json` and find highest priority story where `passes: false`:

```javascript
const nextStory = userStories
  .filter(s => !s.passes)
  .sort((a, b) => a.priority - b.priority)[0];
```

Announce: `Working on [{story.id}]: {story.title}`

### 3b. Implement

Follow acceptance criteria exactly:
- Reference source document (`prdDocument` field) for details
- Use project conventions from CLAUDE.md
- Check task prefix and use matching skill (see `references/skill-map.md`)

### 3c. Verify

Run verification commands specified in acceptance criteria:
- `pnpm typecheck` - Type checking
- `hasura migrate apply --database-name default` - Database migrations
- `hasura metadata apply` - Hasura metadata
- `pnpm codegen:web` - GraphQL codegen

### 3d. Update Files

**If ALL acceptance criteria pass:**

1. Update `prd.json`: set `passes: true` for completed story
2. Append to `progress.txt`:
   ```markdown
   ### Iteration {N} - {story.id} - {date}
   - [x] {story.title}
   - Learnings: {any patterns discovered}
   - Files changed: {list of files}
   ```

**If blocked or failed:**

1. Update `prd.json`: add failure details to story's `notes` field
2. Append to `progress.txt`:
   ```markdown
   ### Iteration {N} - {story.id} - {date} [BLOCKED]
   - [ ] {story.title}
   - Blocker: {what went wrong}
   - Attempted: {what was tried}
   ```
3. DO NOT mark `passes: true`

---

## Step 4: Signal Status

### Story Complete

When current story is complete and verified:

```
STORY COMPLETE: {story.id}
Next story: {next-story.id} - {next-story.title}
```

### Story Blocked

When story cannot be completed:

```
STORY BLOCKED: {story.id}
Reason: {blocker description}
```

Ask user how to proceed:
- Skip and continue to next story
- Stop loop and investigate
- Retry with different approach

### All Stories Complete

When all stories have `passes: true`:

```
<promise>ALL-TASKS-COMPLETE</promise>

=== Ralph Loop Complete ===
Feature: {feature-name}
Stories completed: {total}
Duration: {time}
```

Update `workspace.json`: set `status: "completed"`

---

## Important Rules

1. **One story at a time** - Complete and verify before moving to next
2. **Read before writing** - Always read existing code before modifying
3. **Use the spec** - Reference prdDocument for detailed requirements
4. **Update progress.txt** - Future iterations need your learnings
5. **Be precise** - Follow acceptance criteria exactly, no over-engineering
6. **Use skills** - Invoke `/hasura-migrations`, `/graphql-code` as needed

---

## Cross-Agent Commit Pattern

After completing each story, suggest committing for cross-agent sharing:

```bash
git add ralph/workspaces/
git commit -m "ralph({agent}): complete {story.id} for {feature}"
git push
```

This allows other agents to pick up progress.
