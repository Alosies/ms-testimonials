# ADR-015 Implementation Plan

## Doc Connections
**ID**: `adr-015-implementation`

2026-01-13

**Parent**: `adr-015-e2e-testing-architecture`

---

## Overview

Sequential steps to implement E2E testing architecture. Each step is atomic and verifiable.

**Total Steps:** 7
**Estimated Effort:** ~2-3 hours

---

## Prerequisites

- [ ] Development server can run on `localhost:3001`
- [ ] Test user account exists for authentication
- [ ] Node.js 18+ installed

---

## Step 1: Install Playwright

**Goal:** Add Playwright as dev dependency and install browser.

**Actions:**
```bash
cd apps/web
pnpm add -D @playwright/test
npx playwright install chromium
```

**Verification:**
```bash
npx playwright --version
# Should output version number
```

**Files Changed:**
- `apps/web/package.json` (playwright dependency added)
- `apps/web/pnpm-lock.yaml`

---

## Step 2: Create Test ID Constants

**Goal:** Create centralized test ID constants in shared folder.

**Actions:**

Create directory:
```bash
mkdir -p apps/web/src/shared/constants/testIds
```

Create `apps/web/src/shared/constants/testIds/studio.ts`:
```typescript
export const studioTestIds = {
  // Layout containers
  sidebar: 'studio-sidebar',
  canvas: 'studio-canvas',
  propertiesPanel: 'studio-properties-panel',
  header: 'studio-header',

  // Sidebar elements
  sidebarStepCard: 'studio-sidebar-step-card',
  sidebarAddButton: 'studio-sidebar-add-button',

  // Canvas elements
  canvasStepCard: 'studio-canvas-step-card',
  canvasEmptyState: 'studio-canvas-empty-state',
  canvasAddButton: 'studio-canvas-add-button',

  // Header elements
  headerSaveStatus: 'studio-header-save-status',
  headerBackButton: 'studio-header-back-button',
  headerPreviewButton: 'studio-header-preview-button',
  headerFormTitle: 'studio-header-form-title',

  // Step type menu
  stepTypeMenu: 'studio-step-type-menu',
  stepTypeOption: (type: string) => `studio-step-type-${type}`,

  // Properties panel elements
  propertiesTitleInput: 'studio-properties-title-input',
  propertiesDescriptionInput: 'studio-properties-description-input',
} as const;

export type StudioTestId = typeof studioTestIds;
```

Create `apps/web/src/shared/constants/testIds/auth.ts`:
```typescript
export const authTestIds = {
  // Login page
  loginForm: 'auth-login-form',
  loginEmailInput: 'auth-login-email-input',
  loginPasswordInput: 'auth-login-password-input',
  loginSubmitButton: 'auth-login-submit-button',
  loginErrorMessage: 'auth-login-error-message',

  // Signup page
  signupForm: 'auth-signup-form',
  signupEmailInput: 'auth-signup-email-input',
  signupPasswordInput: 'auth-signup-password-input',
  signupSubmitButton: 'auth-signup-submit-button',
} as const;

export type AuthTestId = typeof authTestIds;
```

Create `apps/web/src/shared/constants/testIds/forms.ts`:
```typescript
export const formsTestIds = {
  // Forms list page
  formsList: 'forms-list',
  formsListItem: 'forms-list-item',
  formsCreateButton: 'forms-create-button',
  formsEmptyState: 'forms-empty-state',

  // Create form modal/page
  createFormModal: 'forms-create-modal',
  createFormNameInput: 'forms-create-name-input',
  createFormSubmitButton: 'forms-create-submit-button',
  createFormCancelButton: 'forms-create-cancel-button',
} as const;

export type FormsTestId = typeof formsTestIds;
```

Create `apps/web/src/shared/constants/testIds/index.ts`:
```typescript
export { studioTestIds } from './studio';
export { authTestIds } from './auth';
export { formsTestIds } from './forms';

export type { StudioTestId } from './studio';
export type { AuthTestId } from './auth';
export type { FormsTestId } from './forms';
```

**Verification:**
```bash
# TypeScript should compile without errors
cd apps/web && pnpm typecheck
```

**Files Created:**
- `apps/web/src/shared/constants/testIds/studio.ts`
- `apps/web/src/shared/constants/testIds/auth.ts`
- `apps/web/src/shared/constants/testIds/forms.ts`
- `apps/web/src/shared/constants/testIds/index.ts`

---

## Step 3: Create Playwright Configuration

**Goal:** Set up Playwright config file.

**Actions:**

Create directory:
```bash
mkdir -p apps/web/tests/e2e
```

Create `apps/web/tests/e2e/playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: './test-results/html' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev:web',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

**Verification:**
```bash
cd apps/web/tests/e2e && npx playwright test --config=playwright.config.ts --list
# Should show "no tests found" (expected at this point)
```

**Files Created:**
- `apps/web/tests/e2e/playwright.config.ts`

---

## Step 4: Create Test Fixtures

**Goal:** Set up auth fixture for authenticated tests.

**Actions:**

Create `apps/web/tests/e2e/fixtures.ts`:
```typescript
import { test as base, Page } from '@playwright/test';

// Test user credentials - use environment variables in CI
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
};

export interface TestFixtures {
  authedPage: Page;
}

export const test = base.extend<TestFixtures>({
  authedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');

    // Fill login form
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);

    // Submit and wait for redirect
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
    await page.waitForURL(/dashboard|forms|home/, { timeout: 10000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

**Verification:**
- File exists and TypeScript compiles

**Files Created:**
- `apps/web/tests/e2e/fixtures.ts`

---

## Step 5: Create Page Objects

**Goal:** Create functional page objects for studio and common pages.

**Actions:**

Create directory:
```bash
mkdir -p apps/web/tests/e2e/pages
```

Create `apps/web/tests/e2e/pages/studio.page.ts`:
```typescript
import { Page, expect } from '@playwright/test';
import { studioTestIds } from '../../../src/shared/constants/testIds';

export function createStudioPage(page: Page) {
  // Locators using centralized test IDs
  const sidebar = page.getByTestId(studioTestIds.sidebar);
  const canvas = page.getByTestId(studioTestIds.canvas);
  const stepCards = page.getByTestId(studioTestIds.sidebarStepCard);
  const addStepButton = page.getByTestId(studioTestIds.sidebarAddButton);
  const saveStatus = page.getByTestId(studioTestIds.headerSaveStatus);
  const propertiesPanel = page.getByTestId(studioTestIds.propertiesPanel);

  return {
    // Expose page and locators
    page,
    sidebar,
    canvas,
    stepCards,
    addStepButton,
    saveStatus,
    propertiesPanel,

    // Navigation
    async goto(orgSlug: string, formSlug: string) {
      await page.goto(`/${orgSlug}/forms/${formSlug}/studio`);
      await sidebar.waitFor({ timeout: 10000 });
    },

    // Actions
    async selectStep(index: number) {
      await stepCards.nth(index).click();
    },

    async addStep(type: string) {
      await addStepButton.click();
      await page.getByTestId(studioTestIds.stepTypeOption(type)).click();
    },

    // Assertions
    async expectLoaded() {
      await expect(sidebar).toBeVisible();
      await expect(canvas).toBeVisible();
    },

    async expectStepCount(count: number) {
      await expect(stepCards).toHaveCount(count);
    },

    async expectSaved() {
      await expect(saveStatus).toContainText(/saved/i);
    },

    async expectSaving() {
      await expect(saveStatus).toContainText(/saving/i);
    },
  };
}

export type StudioPage = ReturnType<typeof createStudioPage>;
```

Create `apps/web/tests/e2e/pages/forms.page.ts`:
```typescript
import { Page, expect } from '@playwright/test';
import { formsTestIds } from '../../../src/shared/constants/testIds';

export function createFormsPage(page: Page) {
  const formsList = page.getByTestId(formsTestIds.formsList);
  const formsListItems = page.getByTestId(formsTestIds.formsListItem);
  const createButton = page.getByTestId(formsTestIds.formsCreateButton);
  const emptyState = page.getByTestId(formsTestIds.formsEmptyState);

  return {
    page,
    formsList,
    formsListItems,
    createButton,
    emptyState,

    async goto() {
      await page.goto('/forms');
      // Wait for either forms list or empty state
      await Promise.race([
        formsList.waitFor({ timeout: 10000 }),
        emptyState.waitFor({ timeout: 10000 }),
      ]).catch(() => {
        // One of them should be visible
      });
    },

    async createForm(name: string) {
      await createButton.click();
      await page.getByTestId(formsTestIds.createFormNameInput).fill(name);
      await page.getByTestId(formsTestIds.createFormSubmitButton).click();
    },

    async expectFormCount(count: number) {
      await expect(formsListItems).toHaveCount(count);
    },

    async clickForm(index: number) {
      await formsListItems.nth(index).click();
    },
  };
}

export type FormsPage = ReturnType<typeof createFormsPage>;
```

Create `apps/web/tests/e2e/pages/index.ts`:
```typescript
export { createStudioPage } from './studio.page';
export { createFormsPage } from './forms.page';

export type { StudioPage } from './studio.page';
export type { FormsPage } from './forms.page';
```

**Verification:**
```bash
cd apps/web && pnpm typecheck
```

**Files Created:**
- `apps/web/tests/e2e/pages/studio.page.ts`
- `apps/web/tests/e2e/pages/forms.page.ts`
- `apps/web/tests/e2e/pages/index.ts`

---

## Step 6: Create Smoke Test

**Goal:** Create critical path smoke test.

**Actions:**

Create directory:
```bash
mkdir -p apps/web/tests/e2e/tests
```

Create `apps/web/tests/e2e/tests/smoke.spec.ts`:
```typescript
import { test, expect } from '../fixtures';
import { createStudioPage, createFormsPage } from '../pages';

test.describe('Smoke Tests', () => {
  test.describe('Critical Path', () => {
    test('user can access forms list after login', async ({ authedPage }) => {
      const formsPage = createFormsPage(authedPage);
      await formsPage.goto();

      // Should see either forms list or empty state
      const hasFormsList = await formsPage.formsList.isVisible().catch(() => false);
      const hasEmptyState = await formsPage.emptyState.isVisible().catch(() => false);

      expect(hasFormsList || hasEmptyState).toBe(true);
    });

    test('user can navigate to form studio', async ({ authedPage }) => {
      // This test assumes a form already exists
      // Skip if no forms exist
      const formsPage = createFormsPage(authedPage);
      await formsPage.goto();

      const formCount = await formsPage.formsListItems.count();
      if (formCount === 0) {
        test.skip(true, 'No forms exist to test studio navigation');
        return;
      }

      // Click first form
      await formsPage.clickForm(0);

      // Should navigate to studio or form detail
      await expect(authedPage).toHaveURL(/\/forms\/.*\/(studio|edit|detail)/);
    });
  });

  test.describe('Form Studio', () => {
    // This test requires a known form to exist
    // Update orgSlug and formSlug with actual test values
    const testFormConfig = {
      orgSlug: process.env.TEST_ORG_SLUG || 'test-org',
      formSlug: process.env.TEST_FORM_SLUG || 'test-form',
    };

    test.skip('studio loads with sidebar and canvas', async ({ authedPage }) => {
      const studio = createStudioPage(authedPage);
      await studio.goto(testFormConfig.orgSlug, testFormConfig.formSlug);

      await studio.expectLoaded();
    });

    test.skip('can select a step in sidebar', async ({ authedPage }) => {
      const studio = createStudioPage(authedPage);
      await studio.goto(testFormConfig.orgSlug, testFormConfig.formSlug);
      await studio.expectLoaded();

      const stepCount = await studio.stepCards.count();
      if (stepCount === 0) {
        test.skip(true, 'No steps exist in form');
        return;
      }

      await studio.selectStep(0);
      await expect(studio.propertiesPanel).toBeVisible();
    });
  });
});
```

**Verification:**
```bash
cd apps/web/tests/e2e && npx playwright test --config=playwright.config.ts --list
# Should list the smoke tests
```

**Files Created:**
- `apps/web/tests/e2e/tests/smoke.spec.ts`

---

## Step 7: Add NPM Scripts and Finalize

**Goal:** Add test scripts to package.json and create .gitignore for test artifacts.

**Actions:**

Update `apps/web/package.json` - add to scripts section:
```json
{
  "scripts": {
    "test:e2e": "playwright test --config=tests/e2e/playwright.config.ts",
    "test:e2e:ui": "playwright test --config=tests/e2e/playwright.config.ts --ui",
    "test:e2e:headed": "playwright test --config=tests/e2e/playwright.config.ts --headed",
    "test:e2e:debug": "playwright test --config=tests/e2e/playwright.config.ts --debug",
    "test:e2e:codegen": "playwright codegen http://localhost:3001"
  }
}
```

Create `apps/web/tests/e2e/.gitignore`:
```
# Test results
test-results/
playwright-report/

# Browser binaries (installed via npx playwright install)
# These are usually in ~/.cache/ms-playwright, not here
```

Create `apps/web/tests/e2e/.env.example`:
```bash
# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123

# Test data identifiers
TEST_ORG_SLUG=test-org
TEST_FORM_SLUG=test-form

# Base URL (optional, defaults to localhost:3001)
E2E_BASE_URL=http://localhost:3001
```

**Verification:**
```bash
cd apps/web

# List available tests
pnpm test:e2e --list

# Run tests (will skip studio tests until test IDs are added to components)
pnpm test:e2e
```

**Files Modified:**
- `apps/web/package.json`

**Files Created:**
- `apps/web/tests/e2e/.gitignore`
- `apps/web/tests/e2e/.env.example`

---

## Post-Implementation Tasks

After completing the above steps, these tasks remain:

### Add Test IDs to Vue Components

Components need `data-testid` attributes added. Example for `TimelineSidebar.vue`:

```vue
<template>
  <aside :data-testid="studioTestIds.sidebar">
    <div
      v-for="step in steps"
      :key="step.id"
      :data-testid="studioTestIds.sidebarStepCard"
    >
      ...
    </div>
    <button :data-testid="studioTestIds.sidebarAddButton">
      Add Step
    </button>
  </aside>
</template>

<script setup lang="ts">
import { studioTestIds } from '@/shared/constants/testIds';
</script>
```

### Create Test User

Ensure a test user account exists:
- Email: `test@example.com` (or as configured)
- Password: `testpassword123` (or as configured)
- Has access to at least one organization with forms

### Enable Skipped Tests

Once test IDs are added to components and test data exists:
1. Remove `.skip` from studio tests in `smoke.spec.ts`
2. Update `testFormConfig` with real test form values

---

## File Structure Summary

After implementation:

```
apps/web/
├── src/
│   └── shared/
│       └── constants/
│           └── testIds/
│               ├── studio.ts
│               ├── auth.ts
│               ├── forms.ts
│               └── index.ts
├── tests/
│   └── e2e/
│       ├── playwright.config.ts
│       ├── fixtures.ts
│       ├── .gitignore
│       ├── .env.example
│       ├── pages/
│       │   ├── studio.page.ts
│       │   ├── forms.page.ts
│       │   └── index.ts
│       └── tests/
│           └── smoke.spec.ts
└── package.json (updated with e2e scripts)
```

---

## Verification Checklist

- [ ] Playwright installed (`npx playwright --version`)
- [ ] Test IDs compile (`pnpm typecheck`)
- [ ] Config valid (`pnpm test:e2e --list`)
- [ ] Tests run (`pnpm test:e2e`)
- [ ] Scripts work (`pnpm test:e2e:ui`)
