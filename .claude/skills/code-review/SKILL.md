---
name: code-review
description: Review staged code before commit. Senior engineer review for Vue 3, TypeScript, GraphQL, Tailwind, FSD architecture. Use when running /code-review, before committing, or when user asks for code review.
allowed-tools: Bash, Read, Glob, Grep
---

# Code Review Skill

Senior software engineer review for Vue 3 + TypeScript + GraphQL + Tailwind projects following FSD architecture.

## Workflow

### Step 1: Get Staged Changes
```bash
git diff --staged --name-only  # List changed files
git diff --staged              # Full diff for review
```

### Step 2: Analyze by Category
Review each changed file against the checklist below.

### Step 3: Report Issues
Use the output format below. Include file:line references and severity levels.

---

## Quick Checklist

### Vue 3
- [ ] `defineModel()` for v-model (not props+emit pattern)
- [ ] `toRefs()` when destructuring Pinia stores
- [ ] Composition API used (not Options API)
- [ ] `computed()` for derived state
- [ ] Refs unwrapped with `.value` correctly

### TypeScript
- [ ] Generated GraphQL types from `@/shared/graphql/generated/operations`
- [ ] Types extracted from queries: `Query['field'][number]`
- [ ] No `any` or unjustified type assertions
- [ ] Return types on exported functions

### GraphQL
- [ ] Generated composables used (not raw .gql imports)
- [ ] Features use entity composables (not direct GraphQL)
- [ ] `enabled` ref for conditional queries
- [ ] Safe extraction: `?? []` or `?? null`

### FSD Architecture
- [ ] Layer imports: pages → features → entities → shared
- [ ] Types exported only from `models/` folders
- [ ] Composables in `composables/` folders with `useXxx` naming
- [ ] No cross-feature imports

### Component Size & Structure
- [ ] **Max 250 lines per Vue component** - refactor if exceeded (child components or composables)
- [ ] **Max 300 lines per composable** - refactor if exceeded (smaller composables or shared utilities)
- [ ] **Page files are thin wrappers** - only render components + high-level conditionals (no business logic)

### Tailwind
- [ ] Tailwind classes used (not custom CSS)
- [ ] Custom CSS only for: `content: attr()`, CSS variables, animations

### Security
- [ ] No hardcoded secrets or API keys
- [ ] No `console.log` with sensitive data
- [ ] No `v-html` with user input
- [ ] Input validation present

---

## Output Format

```markdown
## Code Review Results

### Summary
- **Files Reviewed**: {count}
- **Issues**: {critical} Critical, {warning} Warnings, {info} Info

### Critical Issues (Must Fix)

#### [CRITICAL] {Category}: {Title}
**File**: `{path}`:{line}
**Issue**: {description}
**Fix**: {how to fix}

### Warnings (Should Fix)

#### [WARNING] {Category}: {Title}
**File**: `{path}`:{line}
**Issue**: {description}

### Passed Checks
- {what was verified}
```

---

## References

Project documentation:
- `/apps/web/CLAUDE.md` - FSD architecture, composables, GraphQL patterns
