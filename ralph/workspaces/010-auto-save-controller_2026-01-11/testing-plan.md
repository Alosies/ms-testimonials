# Testing Plan: ADR-010 Centralized Auto-Save Controller

> Comprehensive E2E testing strategy using Playwright MCP for the auto-save system.

**Workspace:** `ralph/workspaces/010-auto-save-controller_2026-01-11/`
**MCP:** `playwright-yellow` (based on worktree folder)
**Created:** 2026-01-11

---

## Testing Strategy Overview

### Test Categories

| Category | Focus | Priority |
|----------|-------|----------|
| **Debouncing** | Verify 500ms debounce batches rapid typing | Critical |
| **ID Tracking** | Verify correct entity saved when switching | Critical |
| **Save Status UI** | Verify status indicator transitions | High |
| **Navigation Guard** | Verify unsaved changes warning | High |
| **Error Recovery** | Verify dirty state restored on failure | High |
| **Parallel Saves** | Verify multiple entity types save correctly | Medium |

### Test Environment Setup

```typescript
// apps/web/e2e/fixtures/auto-save.ts
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  // Navigate to form studio with a test form
  studioPage: async ({ page }, use) => {
    // Login and navigate to form studio
    await page.goto('/forms/test-form-slug/studio');
    await page.waitForLoadState('networkidle');
    await use(page);
  },
});

export { expect };
```

---

## Test Suite 1: Debouncing Behavior

### TEST-DB-001: Single Save After Typing

**Purpose:** Verify typing triggers exactly one save after 500ms debounce.

```typescript
test('typing triggers single save after 500ms debounce', async ({ studioPage }) => {
  const page = studioPage;

  // Set up network interception
  const saveRequests: Request[] = [];
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms') || body?.query?.includes('upsert_form_questions')) {
      saveRequests.push(route.request());
    }
    await route.continue();
  });

  // Find form name input and type
  const formNameInput = page.getByTestId('form-name-input');
  await formNameInput.fill('New Form Name');

  // Immediately after typing, no save should have fired
  expect(saveRequests.length).toBe(0);

  // Wait 300ms - still within debounce window
  await page.waitForTimeout(300);
  expect(saveRequests.length).toBe(0);

  // Wait another 300ms (total 600ms) - debounce should have fired
  await page.waitForTimeout(300);
  expect(saveRequests.length).toBe(1);
});
```

### TEST-DB-002: Rapid Typing Batches Into Single Save

**Purpose:** Verify multiple keystrokes within 500ms result in single save.

```typescript
test('rapid typing batches into single save', async ({ studioPage }) => {
  const page = studioPage;

  const saveRequests: Request[] = [];
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms')) {
      saveRequests.push(route.request());
    }
    await route.continue();
  });

  const formNameInput = page.getByTestId('form-name-input');

  // Type slowly with pauses less than 500ms
  await formNameInput.pressSequentially('Hello', { delay: 100 }); // 400ms total
  await page.waitForTimeout(100); // 500ms since start
  await formNameInput.pressSequentially(' World', { delay: 100 }); // Resets debounce

  // Wait for debounce to complete
  await page.waitForTimeout(600);

  // Should only be ONE save with final value
  expect(saveRequests.length).toBe(1);

  const body = saveRequests[0].postDataJSON();
  expect(body.variables.changes.name).toBe('Hello World');
});
```

### TEST-DB-003: Debounce Resets On Continued Typing

**Purpose:** Verify debounce timer resets when user continues typing.

```typescript
test('debounce resets on continued typing', async ({ studioPage }) => {
  const page = studioPage;

  let saveCount = 0;
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms')) {
      saveCount++;
    }
    await route.continue();
  });

  const formNameInput = page.getByTestId('form-name-input');

  // Type, wait 400ms (not enough for debounce), type more
  await formNameInput.fill('First');
  await page.waitForTimeout(400);
  expect(saveCount).toBe(0); // Debounce not fired yet

  await formNameInput.fill('First Second'); // Resets debounce
  await page.waitForTimeout(400);
  expect(saveCount).toBe(0); // Still not fired

  await formNameInput.fill('First Second Third'); // Resets again
  await page.waitForTimeout(600); // Now wait for full debounce

  expect(saveCount).toBe(1); // Only one save with final value
});
```

---

## Test Suite 2: ID Tracking (Entity Switching)

### TEST-ID-001: Question Switch Within Debounce Window

**Purpose:** Verify correct question is saved when switching within 500ms.

```typescript
test('switching questions within debounce saves correct question', async ({ studioPage }) => {
  const page = studioPage;

  const savedQuestionIds: string[] = [];
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('upsert_form_questions')) {
      const inputs = body.variables.inputs;
      inputs.forEach((input: any) => savedQuestionIds.push(input.id));
    }
    await route.continue();
  });

  // Click on first question (Question A)
  const questionA = page.getByTestId('step-card-question-a');
  await questionA.click();

  // Get Question A's ID from data attribute
  const questionAId = await questionA.getAttribute('data-question-id');

  // Type in question text
  const questionTextInput = page.getByTestId('question-text-input');
  await questionTextInput.fill('Updated Question A Text');

  // Immediately switch to Question B (within 500ms)
  const questionB = page.getByTestId('step-card-question-b');
  await questionB.click();

  // Wait for debounce to fire
  await page.waitForTimeout(600);

  // Verify Question A was saved, NOT Question B
  expect(savedQuestionIds).toContain(questionAId);
  expect(savedQuestionIds.length).toBe(1);
});
```

### TEST-ID-002: Multiple Entity Types Dirty

**Purpose:** Verify multiple dirty entity types are all saved correctly.

```typescript
test('multiple entity types save in parallel', async ({ studioPage }) => {
  const page = studioPage;

  const savedEntities = { forms: 0, questions: 0, options: 0 };
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms')) savedEntities.forms++;
    if (body?.query?.includes('upsert_form_questions')) savedEntities.questions++;
    if (body?.query?.includes('upsert_question_options')) savedEntities.options++;
    await route.continue();
  });

  // Edit form name
  await page.getByTestId('form-name-input').fill('New Name');

  // Edit question text
  await page.getByTestId('step-card-question-a').click();
  await page.getByTestId('question-text-input').fill('New Question');

  // Edit option label
  await page.getByTestId('option-0-label').fill('New Option');

  // Wait for debounce
  await page.waitForTimeout(600);

  // All three entity types should have been saved
  expect(savedEntities.forms).toBe(1);
  expect(savedEntities.questions).toBe(1);
  expect(savedEntities.options).toBe(1);
});
```

### TEST-ID-003: Option Watcher Tracks Correct Option

**Purpose:** Verify editing one option only saves that specific option.

```typescript
test('editing option saves only that option', async ({ studioPage }) => {
  const page = studioPage;

  const savedOptionIds: string[] = [];
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('upsert_question_options')) {
      body.variables.inputs.forEach((input: any) => savedOptionIds.push(input.id));
    }
    await route.continue();
  });

  // Click on a multiple choice question
  await page.getByTestId('step-card-multiple-choice').click();

  // Edit second option
  const option2 = page.getByTestId('option-1-label');
  const option2Id = await option2.getAttribute('data-option-id');
  await option2.fill('Updated Option 2');

  // Wait for debounce
  await page.waitForTimeout(600);

  // Only option 2 should be saved
  expect(savedOptionIds).toEqual([option2Id]);
});
```

---

## Test Suite 3: Save Status UI

### TEST-UI-001: Status Transitions

**Purpose:** Verify save status indicator shows correct states.

```typescript
test('save status shows correct transitions', async ({ studioPage }) => {
  const page = studioPage;

  const statusIndicator = page.getByTestId('save-status-indicator');

  // Initially should be idle
  await expect(statusIndicator).toHaveAttribute('data-status', 'idle');

  // Type to trigger save
  await page.getByTestId('form-name-input').fill('Test Name');

  // Should show 'saving' during debounce/save
  await page.waitForTimeout(500);
  await expect(statusIndicator).toHaveAttribute('data-status', 'saving');

  // Wait for save to complete
  await page.waitForTimeout(200);
  await expect(statusIndicator).toHaveAttribute('data-status', 'saved');

  // After 2 seconds, should return to idle
  await page.waitForTimeout(2100);
  await expect(statusIndicator).toHaveAttribute('data-status', 'idle');
});
```

### TEST-UI-002: Error Status On Network Failure

**Purpose:** Verify status shows error when save fails.

```typescript
test('save status shows error on network failure', async ({ studioPage }) => {
  const page = studioPage;

  // Mock network failure for GraphQL
  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms')) {
      await route.abort('failed');
    } else {
      await route.continue();
    }
  });

  const statusIndicator = page.getByTestId('save-status-indicator');

  // Type to trigger save
  await page.getByTestId('form-name-input').fill('Test Name');

  // Wait for save attempt
  await page.waitForTimeout(600);

  // Should show error status
  await expect(statusIndicator).toHaveAttribute('data-status', 'error');
});
```

---

## Test Suite 4: Navigation Guard

### TEST-NAV-001: No Warning Without Changes

**Purpose:** Verify no warning when navigating without unsaved changes.

```typescript
test('no warning when navigating without unsaved changes', async ({ studioPage }) => {
  const page = studioPage;

  let dialogShown = false;
  page.on('dialog', async (dialog) => {
    dialogShown = true;
    await dialog.accept();
  });

  // Navigate away without making changes
  await page.getByTestId('nav-dashboard').click();

  // Should navigate without dialog
  await expect(page).toHaveURL(/\/dashboard/);
  expect(dialogShown).toBe(false);
});
```

### TEST-NAV-002: Warning With Unsaved Changes

**Purpose:** Verify confirmation dialog when navigating with unsaved changes.

```typescript
test('warning shown when navigating with unsaved changes', async ({ studioPage }) => {
  const page = studioPage;

  // Type something to create unsaved changes
  await page.getByTestId('form-name-input').fill('Unsaved Change');

  // Set up dialog handler to dismiss (stay on page)
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('unsaved changes');
    await dialog.dismiss();
  });

  // Try to navigate away
  await page.getByTestId('nav-dashboard').click();

  // Should still be on studio page
  await expect(page).toHaveURL(/\/studio/);
});
```

### TEST-NAV-003: Confirm Leave With Unsaved Changes

**Purpose:** Verify navigation proceeds when user confirms leave.

```typescript
test('navigation proceeds when user confirms leave', async ({ studioPage }) => {
  const page = studioPage;

  // Type something to create unsaved changes
  await page.getByTestId('form-name-input').fill('Unsaved Change');

  // Set up dialog handler to accept (leave page)
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  // Navigate away
  await page.getByTestId('nav-dashboard').click();

  // Should be on dashboard
  await expect(page).toHaveURL(/\/dashboard/);
});
```

---

## Test Suite 5: Error Recovery

### TEST-ERR-001: Dirty State Restored On Failure

**Purpose:** Verify dirty state is preserved when save fails.

```typescript
test('dirty state restored on save failure', async ({ studioPage }) => {
  const page = studioPage;

  let failNextRequest = true;
  let saveAttempts = 0;

  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms')) {
      saveAttempts++;
      if (failNextRequest) {
        failNextRequest = false;
        await route.abort('failed');
      } else {
        await route.continue();
      }
    } else {
      await route.continue();
    }
  });

  // Type to trigger save
  await page.getByTestId('form-name-input').fill('Test Name');

  // Wait for first save attempt (will fail)
  await page.waitForTimeout(600);
  expect(saveAttempts).toBe(1);

  // Type again to trigger retry
  await page.getByTestId('form-name-input').fill('Test Name Updated');
  await page.waitForTimeout(600);

  // Should have attempted save again
  expect(saveAttempts).toBe(2);

  // Verify status is now 'saved' (second attempt succeeded)
  const statusIndicator = page.getByTestId('save-status-indicator');
  await expect(statusIndicator).toHaveAttribute('data-status', 'saved');
});
```

### TEST-ERR-002: Original + New Changes Saved After Recovery

**Purpose:** Verify both original and new changes are saved after error recovery.

```typescript
test('original and new changes saved after error recovery', async ({ studioPage }) => {
  const page = studioPage;

  let failNextRequest = true;
  let lastSavedName = '';

  await page.route('**/graphql', async (route) => {
    const body = route.request().postDataJSON();
    if (body?.query?.includes('update_forms')) {
      if (failNextRequest) {
        failNextRequest = false;
        await route.abort('failed');
      } else {
        lastSavedName = body.variables.changes.name;
        await route.continue();
      }
    } else {
      await route.continue();
    }
  });

  // First edit (will fail to save)
  await page.getByTestId('form-name-input').fill('First Edit');
  await page.waitForTimeout(600);

  // Second edit (should save both)
  await page.getByTestId('form-name-input').fill('Second Edit');
  await page.waitForTimeout(600);

  // The saved value should be the latest
  expect(lastSavedName).toBe('Second Edit');
});
```

---

## Test Data Requirements

### Required Test Form Structure

The test form should have:
- Form with name, product_name, product_description fields
- At least 2 questions (for switching tests)
- At least 1 multiple choice question with 2+ options
- At least 2 steps (for step switching tests)
- At least 1 flow with name (for flow tests)

### Data Attributes Needed

Add these `data-testid` attributes to components:

```vue
<!-- FormEditorHeader.vue -->
<div data-testid="save-status-indicator" :data-status="saveStatus">
  {{ statusText }}
</div>

<!-- Form name input -->
<input data-testid="form-name-input" v-model="form.name" />

<!-- Question text input -->
<input data-testid="question-text-input" v-model="question.question_text" />

<!-- Step card -->
<div
  data-testid="step-card-question-a"
  :data-question-id="question.id"
>

<!-- Option inputs -->
<input
  data-testid="option-0-label"
  :data-option-id="option.id"
  v-model="option.option_label"
/>

<!-- Navigation -->
<a data-testid="nav-dashboard" href="/dashboard">Dashboard</a>
```

---

## Playwright MCP Usage

Since this is the `ms-testimonials-yellow` worktree, use `playwright-yellow` MCP.

### Example MCP Calls

```typescript
// Navigate to form studio
mcp__playwright-yellow__browser_navigate({ url: 'http://localhost:5173/forms/test-slug/studio' });

// Take snapshot to see current state
mcp__playwright-yellow__browser_snapshot({});

// Click on element
mcp__playwright-yellow__browser_click({
  element: 'Form name input',
  ref: 'input[data-testid="form-name-input"]'
});

// Type text
mcp__playwright-yellow__browser_type({
  element: 'Form name input',
  ref: 'input[data-testid="form-name-input"]',
  text: 'New Form Name'
});

// Check network requests
mcp__playwright-yellow__browser_network_requests({});

// Wait for specific time
mcp__playwright-yellow__browser_wait_for({ time: 0.6 }); // 600ms
```

---

## Test Execution Order

1. **Unit tests first** (if applicable): Test useDirtyTracker in isolation
2. **Debouncing tests**: Verify core timing behavior
3. **ID tracking tests**: Verify entity switching works
4. **Save status tests**: Verify UI feedback
5. **Navigation guard tests**: Verify user protection
6. **Error recovery tests**: Verify resilience

---

## Known Limitations

1. **beforeunload event**: Cannot be fully tested in Playwright due to browser security
2. **Real network timing**: May need to adjust timeouts for CI environment
3. **Parallel test execution**: Tests that mock network should use isolated browser contexts

---

## Success Criteria

All tests pass with:
```bash
pnpm test:e2e --grep "auto-save"
```

Zero flaky tests - all timing should be deterministic with proper waits.
