---
name: e2e-code-review
description: Review E2E test code for Playwright best practices. Use when reviewing test files, before merging E2E changes, or when user asks to review e2e/test code.
allowed-tools: Bash, Read, Glob, Grep
---

# E2E Code Review

Review Playwright E2E tests for project conventions and best practices.

## Workflow

### Step 1: Get Changes
```bash
git diff --staged --name-only | grep -E "tests/e2e|\.spec\.ts"
git diff --staged -- "*.spec.ts"
```

### Step 2: Review Against Checklist
Check each test file against the checklist below.

### Step 3: Run Tests
```bash
cd apps/web

# Get port for current worktree (yellow=3001, green=3002, blue=3003)
source ../../scripts/get-agent-port.sh

# Run changed test files
E2E_BASE_URL=$E2E_BASE_URL pnpm playwright test {changed-files} --config=tests/e2e/playwright.config.ts

# Or run smoke tests
E2E_BASE_URL=$E2E_BASE_URL pnpm test:e2e:smoke
```

### Step 4: Report Results
Use the output format at the bottom. Include test execution results.

---

## Quick Checklist

### Structure
- [ ] **Correct folder** - journey-tests/ or focused-tests/
- [ ] **Path aliases** - `@e2e/*` not relative paths
- [ ] **Fixture imports** - from `@e2e/entities/{entity}/fixtures`
- [ ] **Actions used** - reusable operations in actions/, not inline

### Selectors
- [ ] **data-testid only** - no element/class/id selectors
- [ ] **Test IDs from constants** - `studioTestIds.xxx` not string literals
- [ ] **Two-attribute pattern** for entities - `data-testid` + `data-{entity}-id`

```typescript
// ✅ Good
stepCard.getByTestId(studioTestIds.welcomeTitle)
studio.getCanvasStepCard(stepId)  // uses data-step-id

// ❌ Bad
page.locator('button')
page.locator('#title')
page.locator('.step-card')
```

### Test Patterns
- [ ] **Fixture data for assertions** - not hardcoded values
- [ ] **Actions verify success** - include basic "did it work?" checks
- [ ] **Wait after UI changes** - `waitForScrollSettle()` or similar
- [ ] **No flaky waits** - avoid arbitrary `waitForTimeout()` unless necessary

```typescript
// ✅ Good: Use fixture data
const questionStep = formViaApi.steps.find(s => s.stepType === 'question')!;
await expect(stepCard).toContainText(questionStep.title);

// ❌ Bad: Hardcoded values
await expect(stepCard).toContainText('My Question');
```

### Tags
- [ ] **@smoke on journey tests** - for quick CI validation
- [ ] **@smoke on combined tests** - tests that cover full flows
- [ ] **Feature tags** - `@autosave`, `@navigation`, etc. for filtering

```typescript
// ✅ Good
test.describe('Feature', { tag: '@smoke' }, () => { ... });
test('combined test', { tag: '@smoke' }, async () => { ... });
```

### Auto-Save Tests
- [ ] **Batch edits together** - don't close/reload after each field
- [ ] **Single wait before reload** - `closeEditorAndWaitForSave()` once
- [ ] **Verify all fields after reload** - not between edits

### Actions Quality
- [ ] **Single responsibility** - one action = one logical operation
- [ ] **Optional verification params** - `async navigateDown(expectedId?: string)`
- [ ] **Return useful values** - counts, states for assertions
- [ ] **Type imports** - `import type { StudioPage }` not value imports

---

## Output Format

```markdown
## E2E Code Review Results

### Test Execution
- **Status**: ✅ Passed / ❌ Failed
- **Tests Run**: {count}
- **Duration**: {time}
- **Failed Tests**: {list if any}

### Code Review Summary
- **Files Reviewed**: {count}
- **Issues**: {critical} Critical, {warning} Warnings

### Critical Issues

#### [CRITICAL] {Category}: {Title}
**File**: `{path}`:{line}
**Issue**: {description}
**Fix**: {how to fix}

### Warnings

#### [WARNING] {Category}: {Title}
**File**: `{path}`:{line}
**Issue**: {description}

### Passed Checks
- {what was verified}
```

---

## References

For detailed patterns, see:
- `apps/web/tests/e2e/CLAUDE.md` - E2E directory overview
- `.claude/skills/e2e-tests-creator/SKILL.md` - Test creation patterns
- `.claude/skills/e2e-tests-runner/SKILL.md` - Running tests, tags
