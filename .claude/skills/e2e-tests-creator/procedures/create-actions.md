# Creating Reusable Actions

Guide for creating DRY, reusable action helpers.

## When to Create Actions

Create actions when:
- Same operation appears in multiple tests
- Operation has multiple steps (click + wait + verify)
- Journey and focused tests share common flows

## Action File Pattern

```typescript
// actions/{category}.actions.ts
import { expect } from '@playwright/test';
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestFormData } from '@e2e/entities/form/types';

export function create{Category}Actions(studio: StudioPage) {
  return {
    /**
     * Brief description of what this action does
     */
    async actionName(requiredParam: string, optionalParam?: string) {
      // 1. Perform the action
      await studio.someMethod(requiredParam);

      // 2. Wait for UI to settle
      await studio.waitForScrollSettle();

      // 3. Basic verification (optional param)
      if (optionalParam) {
        await studio.expectSomething(optionalParam);
      }
    },

    /**
     * Action with return value
     */
    async getCount(): Promise<number> {
      return await studio.getStepCount();
    },
  };
}
```

## Composing in Index

```typescript
// actions/index.ts
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import { createSetupActions } from './setup.actions';
import { createSelectionActions } from './selection.actions';
import { createNavigationActions } from './navigation.actions';

export function createStudioActions(studio: StudioPage) {
  return {
    /** Setup and loading actions */
    setup: createSetupActions(studio),

    /** Step selection actions */
    select: createSelectionActions(studio),

    /** Keyboard navigation */
    nav: createNavigationActions(studio),
  };
}

export type StudioActions = ReturnType<typeof createStudioActions>;

// Re-export for granular imports
export { createSetupActions } from './setup.actions';
export { createSelectionActions } from './selection.actions';
export { createNavigationActions } from './navigation.actions';
```

## Action Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `setup` | Load, initialize | `loadStudio()`, `loadWithSteps()` |
| `selection` | Select elements | `selectStep()`, `clickThroughSteps()` |
| `navigation` | Keyboard nav | `navigateDown()`, `navigateUp()` |
| `branching` | Branch switching | `switchToImprovement()` |
| `management` | CRUD operations | `addStep()`, `deleteStep()` |
| `verification` | Complex assertions | `expectInBranch()` |

## Best Practices

### 1. Actions Verify Success

Each action should include basic "did it work?" checks:

```typescript
async selectStep(stepId: string) {
  await studio.selectStepById(stepId);
  await studio.waitForScrollSettle();
  await studio.expectSidebarStepSelected(stepId);  // Basic verification
}
```

### 2. Optional Verification Parameters

Allow callers to specify expected outcomes:

```typescript
async navigateDown(expectedStepId?: string) {
  await studio.navigateDown();
  await studio.waitForScrollSettle();
  if (expectedStepId) {
    await studio.expectSidebarStepSelected(expectedStepId);
  }
}
```

### 3. Return Useful Values

```typescript
async addStep(type: string): Promise<number> {
  const initialCount = await studio.getStepCount();
  await studio.addStep(type);
  await studio.expectStepCount(initialCount + 1);
  return initialCount + 1;  // Return new count
}
```

### 4. Use Type Imports

```typescript
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestFormData, TestStep } from '@e2e/entities/form/types';
```

## Import Pattern

Always use `@e2e/*` aliases:

```typescript
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestFormData } from '@e2e/entities/form/types';
```
