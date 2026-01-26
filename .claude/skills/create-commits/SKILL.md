---
name: create-commits
description: Create atomic commits with ADR/PRD references following project conventions. Use when committing changes, after code review, or when user says "commit". Triggers on "commit", "create commit", "git commit".
allowed-tools: Bash, Read, Glob, Grep
---

# Create Commits

Create well-structured, atomic commits using **modified Conventional Commits** format with ADR/PRD references.

## Format Overview

This project extends [Conventional Commits](https://www.conventionalcommits.org/) with ADR/PRD tracking:

```
type(scope, ADR-XXX): description    # Feature/fix within ADR context
ADR-XXX: description                  # Major ADR-only implementation
type(scope): description              # Standard conventional commit
```

## Quick Reference

```bash
# 1. Check staged changes
git diff --staged --name-only
git diff --staged

# 2. Check recent commits for style
git log --oneline -5

# 3. Create commit with HEREDOC (preserves formatting)
git commit -m "$(cat <<'EOF'
Subject line here

Body paragraph here.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

## Commit Message Format

### Structure

```
<prefix>: <subject>

<body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Prefix Selection

Choose the prefix based on the work being committed:

| Scenario | Prefix | Example |
|----------|--------|---------|
| ADR-only (major feature) | `ADR-XXX` | `ADR-022: add form dashboard` |
| Feature + ADR | `feat(scope, ADR-XXX)` | `feat(web, ADR-017): add type change workflow` |
| Fix + ADR | `fix(scope, ADR-XXX)` | `fix(api, ADR-009): correct flow derivation` |
| Feature + PRD | `feat(scope, PRD-XXX)` | `feat(web, PRD-001): add onboarding flow` |
| New feature (no ADR/PRD) | `feat(scope)` | `feat(auth): add password reset` |
| Bug fix | `fix(scope)` | `fix(ui): fix button alignment` |
| Refactoring | `refactor(scope)` | `refactor(api): simplify handler` |
| Documentation | `docs` or `docs(scope)` | `docs: update README` |
| Chores/config | `chore(scope)` | `chore(deps): update packages` |
| Tests | `test(scope)` | `test(auth): add login tests` |

**When to use which ADR format:**
- `ADR-XXX:` — Large, multi-file ADR implementation (the ADR IS the feature)
- `type(scope, ADR-XXX):` — Smaller changes related to an ADR (feature/fix within ADR context)

### Scope Examples

| Scope | When to Use |
|-------|-------------|
| `web` | Frontend app changes |
| `api` | Backend API changes |
| `ui` | UI component library |
| `db` | Database/Hasura changes |
| `e2e` | E2E test changes |
| `deps` | Dependency updates |
| Feature name | Feature-specific (e.g., `auth`, `forms`, `studio`) |

## Workflow

### Step 1: Analyze Staged Changes

```bash
# List staged files
git diff --staged --name-only

# View full diff
git diff --staged

# Check for unstaged changes that might be related
git status
```

### Step 2: Determine Commit Type

**Decision tree:**

1. **Is this related to an ADR/PRD?**
   - **Yes, major implementation** (ADR IS the feature) → `ADR-XXX: description`
   - **Yes, smaller change** (feature/fix within ADR) → `type(scope, ADR-XXX): description`
   - **No** → Continue to step 2

2. **What type of change?**
   - New feature → `feat(scope):`
   - Bug fix → `fix(scope):`
   - Refactoring → `refactor(scope):`
   - Documentation → `docs:` or `docs(scope):`
   - Config/tooling → `chore(scope):`
   - Tests → `test(scope):`

### Step 3: Check Recent Commit Style

```bash
git log --oneline -10
```

Match the style of recent commits for consistency.

### Step 4: Write Commit Message

**Subject Line Rules:**
- Start with lowercase after prefix (e.g., `ADR-022: add` not `ADR-022: Add`)
- Use imperative mood: "add", "fix", "update" (not "added", "fixes", "updated")
- Max 72 characters
- No period at the end

**Body Rules:**
- Blank line after subject
- Explain WHAT changed and WHY (not HOW - that's in the code)
- Wrap at 72 characters
- Use bullet points for multiple changes

### Step 5: Create Commit

**ALWAYS use HEREDOC format** to preserve multi-line formatting:

```bash
git commit -m "$(cat <<'EOF'
ADR-022: add form dashboard feature

Add complete frontend feature for form analytics dashboard:

API layer:
- useApiForDashboard: type-safe REST client

UI components:
- FormDashboard: main container with period selector
- FormDashboardMetrics: key metrics cards row

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

### Step 6: Verify

```bash
git log -1  # Check the commit looks right
git status  # Verify working tree state
```

## Examples from This Project

### ADR Implementation (Multiple Files)

```
ADR-022: add form dashboard and subpages

Restructure form pages for dashboard-first experience:

index.vue:
- Replace responses view with FormDashboardPage
- Add quick actions for navigation to subpages

New subpages:
- analytics.vue: dedicated analytics dashboard with metrics
- testimonials.vue: placeholder for form-filtered testimonials

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### ADR Implementation (Single Focus)

```
ADR-022: add FormSubpageLayout component

Add consistent layout wrapper for form subpages with uniform
padding, max-width, and background. Used on: responses, analytics,
testimonials, widgets, settings pages.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Feature with ADR Reference

```
feat(web, ADR-017): update QuestionStepEditor for type change workflow

Implement type change with warnings and response blocking:
- Add response count check before type change
- Show warning dialog when changing from choice types with options
- Block type change when responses exist (with delete option)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Feature (No ADR)

```
feat(testimonial-write): add testimonial_write step type with AI/manual paths

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Refactoring

```
refactor(web): simplify FormEditorHeader back button

Replace "Exit Studio" text link with icon-only back button for
cleaner UI. Matches FormSubpageHeader pattern used across form
dashboard pages.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Chore

```
chore(web): configure @api path alias in tsconfig

Add path alias for importing types from API package schemas.
Enables type imports like: import type { X } from '@api/shared/schemas/dashboard'

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Bug Fix

```
fix(ui): fix timeline panel overflow scrolling in responses page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Atomic Commits (Critical)

**One logical change per commit.** Each commit should be:
- **Focused**: Single purpose, single responsibility
- **Complete**: The change works on its own (tests pass)
- **Reviewable**: Easy to understand in isolation

### Splitting Strategy

For large changesets, split by logical unit:

| Unit | Example Commits |
|------|-----------------|
| **By layer** | `feat(api, ADR-X): add endpoint` → `feat(web, ADR-X): add UI` |
| **By component** | `ADR-X: add FormDashboard` → `ADR-X: add FormMetrics` |
| **By concern** | `feat: add feature` → `test: add feature tests` → `docs: document feature` |

### Workflow for Multiple Changes

```bash
# 1. Stage only related files
git add src/features/formDashboard/

# 2. Create focused commit
git commit -m "ADR-022: add FormDashboard component"

# 3. Stage next logical unit
git add src/features/formDashboard/composables/

# 4. Create next commit
git commit -m "ADR-022: add useFormDashboard composable"
```

### Signs You Need to Split

- Subject line has "and" connecting unrelated things
- Changes span multiple features/ADRs
- Mix of refactoring + new features
- Commit touches >15-20 files across different concerns
- You need multiple paragraphs to explain what changed

### When One Large Commit is OK

- Tightly coupled changes that can't work independently
- Rename/move operations affecting many files
- Generated files (GraphQL codegen, etc.)

## Safety Rules

- **NEVER** use `--no-verify` unless explicitly requested
- **NEVER** amend commits without explicit request
- **NEVER** force push to main/dev branches
- **ALWAYS** verify staged changes before committing
- **ALWAYS** include the Co-Authored-By footer

## Finding the ADR/PRD Reference

If unsure which ADR/PRD applies:

```bash
# Check docs/adr for relevant ADRs
ls docs/adr/

# Search for ADR mentions in changed files
git diff --staged | grep -i "ADR-"

# Check recent commits touching same area
git log --oneline -20 -- <path-to-changed-files>
```

## Troubleshooting

### Pre-commit Hook Failure

If hooks fail, **DO NOT** use `--no-verify`. Instead:
1. Fix the issue
2. Stage the fix: `git add <fixed-files>`
3. Create a **NEW** commit (don't amend)

### Wrong Files Staged

```bash
git reset HEAD <file>  # Unstage specific file
git reset HEAD         # Unstage all
```
