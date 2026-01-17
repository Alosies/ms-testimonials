# Creating Tests for a New Feature

Step-by-step guide for adding E2E tests to a new feature.

## 1. Create Folder Structure

```bash
mkdir -p apps/web/tests/e2e/features/{feature-name}/actions
mkdir -p apps/web/tests/e2e/features/{feature-name}/focused-tests
mkdir -p apps/web/tests/e2e/features/{feature-name}/journey-tests
```

## 2. Create Actions Index

`actions/index.ts`:

```typescript
import type { {Feature}Page } from '@e2e/shared/pages/{feature}.page';
import { createSetupActions } from './setup.actions';

export function create{Feature}Actions(page: {Feature}Page) {
  return {
    setup: createSetupActions(page),
  };
}

export type {Feature}Actions = ReturnType<typeof create{Feature}Actions>;
```

## 3. Create Setup Actions

`actions/setup.actions.ts`:

```typescript
import type { {Feature}Page } from '@e2e/shared/pages/{feature}.page';

export function createSetupActions(page: {Feature}Page) {
  return {
    async load(url: string) {
      await page.page.goto(url);
      await page.expectLoaded();
    },
  };
}
```

## 4. Create Journey Test

`journey-tests/{feature}.spec.ts`:

```typescript
import { test, expect } from '@e2e/entities/form/fixtures';
import { create{Feature}Page } from '@e2e/shared';
import { create{Feature}Actions } from '@e2e/features/{feature-name}/actions';

test('{feature} complete journey', async ({ authedPage, formViaApi }) => {
  const page = create{Feature}Page(authedPage);
  const actions = create{Feature}Actions(page);

  // 1. LOAD
  await actions.setup.load(formViaApi.studioUrl);

  // 2. FIRST FUNCTIONALITY
  // ...

  // 3. SECOND FUNCTIONALITY
  // ...

  // JOURNEY COMPLETE
});
```

## 5. Add Focused Tests As Needed

`focused-tests/core.spec.ts`:

```typescript
import { test, expect } from '@e2e/entities/form/fixtures';
import { create{Feature}Page } from '@e2e/shared';
import { create{Feature}Actions } from '@e2e/features/{feature-name}/actions';

test.describe('{Feature} Core', () => {
  test('specific functionality', async ({ authedPage, formViaApi }) => {
    const page = create{Feature}Page(authedPage);
    const actions = create{Feature}Actions(page);

    await actions.setup.load(formViaApi.studioUrl);

    // Detailed assertions for this specific feature
  });
});
```

## 6. Expand Actions As Needed

Add new action files as the feature grows:

```
actions/
├── index.ts
├── setup.actions.ts
├── navigation.actions.ts   # Add when needed
├── selection.actions.ts    # Add when needed
└── crud.actions.ts         # Add when needed
```
