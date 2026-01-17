---
name: e2e-tests-creator
description: Create E2E tests following project conventions. Use when writing new Playwright tests, adding journey or focused tests, or creating action helpers. Triggers on "create e2e test", "write test", "add e2e", "new test".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# E2E Tests Creator

Create Playwright E2E tests following project architecture and conventions.

**Full documentation**: [docs/testing/](../../../docs/testing/)

---

## Quick Reference

```
apps/web/tests/e2e/
├── entities/             # Test data fixtures
├── features/{feature}/   # Tests organized by feature
│   ├── actions/          # Reusable action helpers
│   ├── focused-tests/    # Detailed debugging tests
│   └── journey-tests/    # Complete workflow tests
└── shared/               # Page objects, API clients
```

---

## Test Categories

| Type | Purpose | When |
|------|---------|------|
| **Journey** | Complete flow, one setup | CI, post-commit |
| **Focused** | Specific feature, detailed assertions | Debugging |

**Rule**: Write one journey test first, add focused tests for edge cases.

---

## Creating Tests

### 1. Choose Test Type

```
Journey test → features/{feature}/journey-tests/
Focused test → features/{feature}/focused-tests/
```

### 2. Import Pattern

```typescript
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
```

### 3. Test Structure

```typescript
test('descriptive name', async ({ authedPage, formViaApi }) => {
  const studio = createStudioPage(authedPage);
  // Destructure actions for cleaner code
  const { setup, select, manage } = createStudioActions(studio);

  await setup.loadWithSteps(formViaApi);
  await select.selectStep(stepId);
  await manage.editStep(stepId);
  // ...assertions
});
```

---

## Creating Actions

Actions provide DRY, reusable operations shared by journey and focused tests.

### Action File Pattern

```typescript
// actions/{category}.actions.ts
import type { StudioPage } from '@e2e/shared/pages/studio.page';

export function create{Category}Actions(studio: StudioPage) {
  return {
    async actionName(param?: string) {
      await studio.someMethod();
      await studio.waitForScrollSettle();
      if (param) {
        await studio.expectSomething(param);
      }
    },
  };
}
```

### Compose in Index

```typescript
// actions/index.ts
export function createStudioActions(studio: StudioPage) {
  return {
    setup: createSetupActions(studio),
    select: createSelectionActions(studio),
    nav: createNavigationActions(studio),
    // ...
  };
}
```

---

## Path Aliases

Always use `@e2e/*` aliases:

```typescript
import { test } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
```

---

## Fixtures

| Fixture | Speed | Use For |
|---------|-------|---------|
| `formViaApi` | Fast (~1s) | Most tests |
| `formViaUi` | Slow (~30s) | UI flow tests |
| `branchedFormViaApi` | Fast | Branch navigation |

```typescript
test('example', async ({ authedPage, formViaApi }) => {
  // formViaApi.steps contains actual created data
  const steps = formViaApi.steps ?? [];
});
```

---

## Detailed Guides

| Topic | Documentation |
|-------|---------------|
| Architecture & FSD | [e2e-architecture.md](../../../docs/testing/e2e-architecture.md) |
| Journey vs Focused | [test-organization.md](../../../docs/testing/test-organization.md) |
| Test IDs | [test-ids.md](../../../docs/testing/test-ids.md) |
| Running Tests | [running-tests.md](../../../docs/testing/running-tests.md) |

---

## Best Practices

### Selectors

**Always use `data-testid` attributes** - never use element selectors like `button`, `#id`, or CSS classes.

```typescript
// ✅ Good: data-testid selector
await stepCard.getByTestId(studioTestIds.welcomeTitle);

// ❌ Bad: element or class selectors
await page.locator('button');
await page.locator('#title');
await page.locator('.btn-primary');
```

### MVP Test Consolidation

For MVP, **combine closely related atomic tests** into one test. Leave a comment explaining this decision.

```typescript
/**
 * MVP: Combined test for all Welcome step fields (title, subtitle, buttonText).
 * In the future, these should be split into individual atomic tests.
 */
test('all fields auto-save correctly', async ({ ... }) => {
  // Test multiple related things in one test
});
```

### Auto-Save Testing Pattern

When testing auto-save functionality:
1. **Batch all edits together** - don't wait after each edit
2. **Wait for save once** at the end before reload
3. **Reload and verify** persistence

```typescript
// ✅ Good: batch edits, wait once
await actions.autoSave.fillWelcomeField('title', newTitle);
await actions.autoSave.fillWelcomeField('subtitle', newSubtitle);
await actions.autoSave.fillWelcomeField('buttonText', newButtonText);
await actions.autoSave.closeEditorAndWaitForSave();  // Wait once
await studio.page.reload();
// Verify all fields

// ❌ Bad: wait after each edit
await actions.autoSave.fillWelcomeField('title', newTitle);
await actions.autoSave.closeEditorAndWaitForSave();  // Unnecessary wait
await actions.autoSave.fillWelcomeField('subtitle', newSubtitle);
await actions.autoSave.closeEditorAndWaitForSave();  // Unnecessary wait
```

---

## Checklist

- [ ] Chose correct test type (journey vs focused)
- [ ] Used `@e2e/*` path aliases
- [ ] Used `data-testid` selectors (not element/class selectors)
- [ ] Created/used actions for reusable operations
- [ ] Used fixture data for assertions (not hardcoded values)
- [ ] Added to correct folder (`journey-tests/` or `focused-tests/`)
- [ ] Combined related tests for MVP (with comment explaining)
