# Test Organization Patterns

This document describes the test organization patterns used in the Testimonials E2E tests, including the distinction between journey tests and focused tests, and the reusable actions layer.

## Test Categories

E2E tests are organized into two categories:

| Category | Purpose | When to Run |
|----------|---------|-------------|
| **Journey Tests** | Complete user flow, one setup, sequential validation | Post-commit, pre-merge, CI |
| **Focused Tests** | Test specific features, detailed assertions | Debugging, feature development |

### Journey Tests

A **journey test** is a single comprehensive test that validates all critical functionality in one continuous flow.

**Characteristics:**
- One setup, one teardown (maximum efficiency)
- Validates the complete user journey
- Light assertions focused on "did it work?"
- Fast feedback for CI pipelines

**When to run:**
- After major commits
- Before merging to main branch
- CI quick-check pipeline

**Example structure:**
```ts
test('form studio complete journey', async ({ authedPage, branchedFormViaApi }) => {
  // 1. STUDIO LOADS CORRECTLY
  await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

  // 2. SIDEBAR CLICK NAVIGATION
  await actions.select.selectStep(welcomeStep.id);

  // 3. KEYBOARD NAVIGATION
  await actions.nav.navigateDown();

  // 4. BRANCH SWITCHING
  await actions.branch.switchToImprovement();

  // 5. ADD STEP
  await actions.manage.addStep('Question');

  // ... continues through all critical functionality
});
```

### Focused Tests

**Focused tests** are smaller, isolated tests that provide detailed assertions for debugging when journey tests fail.

**Characteristics:**
- Separate setup/teardown per test
- Detailed assertions for specific functionality
- Easier to pinpoint failures
- Good for feature development and debugging

**When to run:**
- When journey tests fail (to pinpoint issues)
- During feature development
- For detailed regression testing

**Example structure:**
```ts
test.describe('Keyboard Navigation', () => {
  test('arrow down navigates to next step', async ({ authedPage, formViaApi }) => {
    await actions.setup.loadWithSteps(formViaApi);

    await actions.select.selectStep(steps[0].id);
    await actions.nav.navigateDown(steps[1].id);

    // Detailed assertions
    await studio.expectCanvasStepInViewport(steps[1].id);
    await studio.expectSidebarStepSelected(steps[1].id);
  });
});
```

---

## Feature Test Structure

Each feature should organize tests into three folders:

```
features/{feature-name}/
├── actions/              # Reusable action helpers
│   ├── index.ts          # Composes all actions
│   ├── setup.actions.ts  # Load/initialize actions
│   ├── selection.actions.ts
│   ├── navigation.actions.ts
│   └── ...
├── focused-tests/        # Detailed debugging tests
│   ├── core.spec.ts
│   └── navigation.spec.ts
└── journey-tests/        # Complete workflow tests
    └── studio.spec.ts
```

---

## Actions Layer

The **actions layer** provides reusable action helpers that both journey tests and focused tests share. This ensures DRY (Don't Repeat Yourself) code while allowing different assertion levels.

### Why Actions?

Without actions, common operations are duplicated across tests:

```ts
// Without actions - duplicated in every test
await studio.selectStepById(stepId);
await studio.waitForScrollSettle();
await studio.expectSidebarStepSelected(stepId);

// With actions - reusable
await actions.select.selectStep(stepId);
```

### Action Module Structure

Actions are organized by functionality:

| Module | Purpose |
|--------|---------|
| `setup.actions.ts` | Load studio, initialize |
| `selection.actions.ts` | Select steps by ID/index |
| `navigation.actions.ts` | Keyboard up/down navigation |
| `branching.actions.ts` | Branch switching (left/right) |
| `management.actions.ts` | Add/delete steps |

### Creating Actions

Each action module follows this pattern:

```ts
// actions/navigation.actions.ts
import type { StudioPage } from '@e2e/shared/pages/studio.page';

export function createNavigationActions(studio: StudioPage) {
  return {
    /**
     * Navigate down to next step
     */
    async navigateDown(expectedStepId?: string) {
      await studio.navigateDown();
      await studio.waitForScrollSettle();
      if (expectedStepId) {
        await studio.expectSidebarStepSelected(expectedStepId);
      }
    },

    /**
     * Navigate down through N steps
     */
    async navigateDownSteps(count: number, finalStepId?: string) {
      for (let i = 0; i < count; i++) {
        await studio.navigateDown();
        await studio.waitForScrollSettle(200);
      }
      if (finalStepId) {
        await studio.expectSidebarStepSelected(finalStepId);
      }
    },
  };
}
```

### Composing Actions

The index file composes all action modules:

```ts
// actions/index.ts
import { createSetupActions } from './setup.actions';
import { createSelectionActions } from './selection.actions';
import { createNavigationActions } from './navigation.actions';
import { createBranchingActions } from './branching.actions';
import { createManagementActions } from './management.actions';

export function createStudioActions(studio: StudioPage) {
  return {
    setup: createSetupActions(studio),
    select: createSelectionActions(studio),
    nav: createNavigationActions(studio),
    branch: createBranchingActions(studio),
    manage: createManagementActions(studio),
  };
}
```

### Using Actions in Tests

```ts
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test('example', async ({ authedPage, formViaApi }) => {
  const studio = createStudioPage(authedPage);
  const actions = createStudioActions(studio);

  await actions.setup.loadWithSteps(formViaApi);
  await actions.select.selectStep(stepId);
  await actions.nav.navigateDown();
  await actions.branch.switchToImprovement();
  await actions.manage.addStep('Question');
});
```

---

## Actions vs Page Objects

| Layer | Purpose | Location |
|-------|---------|----------|
| **Page Objects** | Low-level UI interactions, element locators | `shared/pages/` |
| **Actions** | Higher-level user flows, feature-scoped | `features/{feature}/actions/` |

**Page Objects:**
- Generic, reusable across features
- Focus on "how to interact with UI"
- No business logic

**Actions:**
- Feature-specific
- Focus on "what the user does"
- Compose page object methods into meaningful flows

```ts
// Page object - low level
await studio.selectStepById(stepId);
await studio.waitForScrollSettle();
await studio.expectSidebarStepSelected(stepId);

// Action - higher level
await actions.select.selectStep(stepId);
```

---

## Path Aliases

Use `@e2e/*` aliases for clean imports:

```ts
// tsconfig.json paths
"@e2e/*": ["./*"],
"@e2e/entities/*": ["./entities/*"],
"@e2e/shared/*": ["./shared/*"],
"@e2e/features/*": ["./features/*"]
```

**Usage:**
```ts
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
```

---

## Running Tests

```bash
# Run journey tests only (fast CI feedback)
pnpm test:e2e features/form-studio/journey-tests/

# Run focused tests when journey fails
pnpm test:e2e features/form-studio/focused-tests/

# Run all form-studio tests
pnpm test:e2e features/form-studio/
```

---

## Best Practices

1. **Start with journey tests** - Write a journey test first to validate the complete flow
2. **Add focused tests for edge cases** - Use focused tests for boundary conditions and specific scenarios
3. **Share code via actions** - Never duplicate common operations between tests
4. **Actions verify success** - Each action should include basic "did it work?" checks
5. **Focused tests add detail** - Add extra assertions in focused tests for debugging
6. **One journey test per feature** - Use a single test covering all critical paths
7. **Use path aliases** - Keep imports clean with `@e2e/*` aliases

---

## Related Documentation

- [E2E Architecture](./e2e-architecture.md) - Overall test structure
- [Test IDs](./test-ids.md) - Centralized test ID system
- [Running Tests](./running-tests.md) - Commands and environment setup
