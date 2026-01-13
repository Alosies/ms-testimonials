# ADR-015: E2E Testing Architecture

## Doc Connections
**ID**: `adr-015-e2e-testing-architecture`

2026-01-13

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

---

## Status

**Accepted** - 2026-01-13

---

## Context

The testimonials application needs E2E testing to ensure critical user flows work. However, as an MVP:

- **UI changes frequently** — over-investment in tests creates maintenance burden
- **Features may be cut** — tests for removed features are waste
- **Speed matters** — can't spend days setting up test infrastructure
- **Core flows matter most** — edge cases can wait

### Goals

1. **Catch breaking changes** to critical user flows
2. **Minimal maintenance burden** as UI evolves
3. **Quick to write** new tests when needed
4. **Easy to delete** tests when features change

---

## Decision

Implement a **lightweight, pragmatic testing approach** using Playwright with minimal abstractions.

### Principles

1. **Test critical paths, not everything** — One smoke test beats 50 brittle unit tests
2. **Lightweight Page Objects** — Centralize selectors, but don't over-abstract
3. **Add tests incrementally** — Start minimal, expand when features stabilize
4. **Delete freely** — Tests for removed features should be removed immediately

---

## Architecture

### Phase 1: MVP (Current)

```
apps/web/tests/
└── e2e/
    ├── playwright.config.ts     # Basic config
    ├── fixtures.ts              # Auth fixture
    ├── pages/                   # Lightweight page objects
    │   ├── studio.page.ts
    │   └── auth.page.ts
    └── tests/
        └── smoke.spec.ts        # Critical path test(s)
```

### Phase 2: Post-MVP (When Features Stabilize)

```
apps/web/tests/
└── e2e/
    ├── config/
    │   └── playwright.config.ts
    ├── fixtures/
    │   ├── auth.fixture.ts
    │   └── test-data.fixture.ts
    ├── pages/
    │   ├── studio/
    │   │   ├── studio.page.ts
    │   │   ├── sidebar.component.ts
    │   │   └── canvas.component.ts
    │   └── auth.page.ts
    └── tests/
        ├── smoke.spec.ts
        ├── studio/
        │   ├── sidebar.spec.ts
        │   ├── canvas.spec.ts
        │   └── step-crud.spec.ts
        └── auth/
            └── login.spec.ts
```

---

## Implementation

### Centralized Test IDs

Test IDs live in `shared/` so both Vue components and Playwright tests import from the same source.

```typescript
// apps/web/src/shared/constants/testIds/studio.ts
export const studioTestIds = {
  // Layout
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

  // Step type menu
  stepTypeMenu: 'studio-step-type-menu',
  stepTypeOption: (type: string) => `studio-step-type-${type}`,

  // Properties panel elements
  propertiesPanelTitle: 'studio-properties-title-input',
  propertiesPanelDescription: 'studio-properties-description-input',
} as const;
```

```typescript
// apps/web/src/shared/constants/testIds/index.ts
export { studioTestIds } from './studio';
export { authTestIds } from './auth';
export { formsTestIds } from './forms';

// Barrel export for convenience
export * from './studio';
export * from './auth';
export * from './forms';
```

**Usage in Vue Component:**

```vue
<!-- TimelineSidebar.vue -->
<script setup lang="ts">
import { studioTestIds } from '@/shared/constants/testIds';
</script>

<template>
  <aside :data-testid="studioTestIds.sidebar">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      :data-testid="studioTestIds.sidebarStepCard"
      :data-selected="index === selectedIndex"
    >
      {{ step.title }}
    </div>
    <button :data-testid="studioTestIds.sidebarAddButton">
      Add Step
    </button>
  </aside>
</template>
```

**Usage in Playwright Test:**

```typescript
// apps/web/tests/e2e/pages/studio.page.ts
import { Page, expect } from '@playwright/test';
import { studioTestIds } from '../../src/shared/constants/testIds';

export function createStudioPage(page: Page) {
  // Locators using centralized test IDs
  const sidebar = page.getByTestId(studioTestIds.sidebar);
  const canvas = page.getByTestId(studioTestIds.canvas);
  const stepCards = page.getByTestId(studioTestIds.sidebarStepCard);
  const addStepButton = page.getByTestId(studioTestIds.sidebarAddButton);
  const saveStatus = page.getByTestId(studioTestIds.headerSaveStatus);
  const propertiesPanel = page.getByTestId(studioTestIds.propertiesPanel);

  return {
    page,
    sidebar,
    canvas,
    stepCards,
    addStepButton,
    saveStatus,
    propertiesPanel,

    async goto(orgSlug: string, formSlug: string) {
      await page.goto(`/${orgSlug}/forms/${formSlug}/studio`);
      await sidebar.waitFor();
    },

    async selectStep(index: number) {
      await stepCards.nth(index).click();
    },

    async addStep(type: string) {
      await addStepButton.click();
      await page.getByTestId(studioTestIds.stepTypeOption(type)).click();
    },

    async expectLoaded() {
      await expect(sidebar).toBeVisible();
      await expect(canvas).toBeVisible();
    },

    async expectStepCount(count: number) {
      await expect(stepCards).toHaveCount(count);
    },

    async expectSaved() {
      await expect(saveStatus).toContainText('Saved');
    },
  };
}

export type StudioPage = ReturnType<typeof createStudioPage>;
```

**Benefits:**
- **No typos** — IDE autocomplete for test IDs
- **Single source of truth** — Change once, updates everywhere
- **Refactor-friendly** — Rename a test ID, TypeScript catches all usages
- **Self-documenting** — See all test IDs for a feature in one file

### Test ID Naming Convention

**Format:** `{feature}-{component}-{element?}-{variant?}`

```
feature    : studio, auth, forms, widgets, dashboard
component  : sidebar, canvas, header, modal, form
element    : button, input, card, list, item (optional)
variant    : selected, disabled, loading, error (optional)
```

**Examples:**

| Test ID | Meaning |
|---------|---------|
| `studio-sidebar` | Studio feature, sidebar component |
| `studio-sidebar-step-card` | Step card inside sidebar |
| `studio-sidebar-add-button` | Add button inside sidebar |
| `studio-canvas-empty-state` | Empty state in canvas |
| `auth-login-form` | Login form in auth feature |
| `auth-login-submit-button` | Submit button in login form |
| `forms-list-item` | Item in forms list |
| `forms-create-modal` | Create form modal |

**Rules:**

1. **Prefix with feature** — Prevents collisions across features
2. **Use kebab-case** — `step-card` not `stepCard`
3. **Be specific** — `sidebar-add-button` not just `add-button`
4. **Avoid positional words** — `step-card` not `first-step-card` (use nth() in tests)
5. **Dynamic IDs use functions** — `stepTypeOption: (type) => \`studio-step-type-${type}\``

**Anti-patterns:**

```typescript
// BAD - Too generic, will collide
testIds = {
  button: 'button',
  card: 'card',
  list: 'list',
}

// BAD - Positional, brittle
testIds = {
  firstStep: 'first-step',
  secondStep: 'second-step',
}

// BAD - Mixed case
testIds = {
  stepCard: 'stepCard',      // Should be 'step-card'
  AddButton: 'AddButton',    // Should be 'add-button'
}

// GOOD
testIds = {
  sidebar: 'studio-sidebar',
  stepCard: 'studio-sidebar-step-card',
  addButton: 'studio-sidebar-add-button',
}
```

**When to add a test ID:**

| Add test ID | Skip test ID |
|-------------|--------------|
| Interactive elements (buttons, inputs) | Decorative elements |
| Containers you need to query | Wrapper divs |
| Dynamic content areas | Static text |
| Elements with state (selected, loading) | Pure styling elements |

---

### Playwright Configuration

```typescript
// apps/web/tests/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'pnpm dev:web',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Auth Fixture

```typescript
// apps/web/tests/e2e/fixtures.ts
import { test as base, Page } from '@playwright/test';

// Extend base test with authenticated page
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    // Login once, reuse for all tests
    await page.goto('/login');
    await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|forms/);

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Smoke Test

```typescript
// apps/web/tests/e2e/tests/smoke.spec.ts
import { test, expect } from '../fixtures';
import { createStudioPage } from '../pages/studio.page';

test.describe('Critical Path', () => {

  test('user can create form, add steps, and save', async ({ authedPage }) => {
    // Navigate to forms
    await authedPage.goto('/dashboard');
    await authedPage.click('text=Forms');

    // Create new form
    await authedPage.click('text=New Form');
    await authedPage.fill('[name="name"]', `Test Form ${Date.now()}`);
    await authedPage.click('text=Create');

    // Verify studio loads
    const studio = createStudioPage(authedPage);
    await studio.expectLoaded();

    // Should have default steps
    await studio.expectStepCount(4); // welcome, rating, question, thank_you

    // Select a step
    await studio.selectStep(1);
    await expect(studio.propertiesPanel).toBeVisible();

    // Add a step
    await studio.addStep('question');
    await studio.expectStepCount(5);

    // Verify auto-save
    await studio.expectSaved();
  });

});
```

---

## Test Data Strategy

### MVP: Use Real Test Account

```bash
# .env.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
TEST_ORG_SLUG=test-org
```

### Post-MVP: API-Based Setup

```typescript
// fixtures/test-data.fixture.ts
import { test as base } from './fixtures';

// Helper to create test form via API
async function createTestForm(page: Page) {
  // Use API or GraphQL to create form
  const response = await page.request.post('/api/forms', {
    data: { name: `Test Form ${Date.now()}` }
  });
  return response.json();
}

async function deleteTestForm(page: Page, formId: string) {
  await page.request.delete(`/api/forms/${formId}`);
}

export const test = base.extend<{ testForm: { id: string; slug: string; orgSlug: string } }>({
  testForm: async ({ authedPage }, use) => {
    const form = await createTestForm(authedPage);

    await use(form);

    await deleteTestForm(authedPage, form.id);
  },
});
```

---

## What NOT to Test (MVP)

| Skip | Reason |
|------|--------|
| Every UI variant | UI will change |
| Error states | Happy path first |
| Edge cases | Core flow matters |
| All step types | Test 1-2, assume others work |
| Responsive layouts | Desktop first |
| Multiple browsers | Chrome only for now |

---

## When to Add More Tests

| Trigger | Action |
|---------|--------|
| Bug in production | Add regression test |
| Feature stabilizes | Add targeted tests |
| Critical flow added | Add smoke test |
| Refactoring planned | Add tests before refactor |

---

## Migration Path

### Now (MVP)
1. Install Playwright
2. Create basic config
3. Write 1 smoke test
4. Run in CI on PR

### Later (Post-MVP)
1. Expand page objects when selectors duplicate
2. Add feature-specific test files
3. Add test data fixtures
4. Consider Cucumber if team grows

---

## AI-Assisted Test Generation

### Playwright MCP Server

The project has Playwright MCP servers configured (`playwright-yellow`, `playwright-green`, `playwright-blue`). These enable AI-assisted testing:

```
Prompt: "Navigate to the form studio, click on step 2, verify it's selected"
→ AI executes actions via MCP and can generate test code
```

**How it works:**
1. MCP takes accessibility snapshots of the page
2. AI understands the UI structure
3. AI generates Playwright code from natural language

**Usage for test creation:**
1. Describe the test scenario in natural language
2. AI executes and validates via MCP
3. Extract generated code into page objects

### Playwright Code Gen

Record interactions to scaffold tests:

```bash
# Opens browser, records your clicks, generates code
npx playwright codegen http://localhost:3001

# Record with specific viewport
npx playwright codegen --viewport-size=1280,720 http://localhost:3001

# Generate code in specific language
npx playwright codegen --target=javascript http://localhost:3001
```

**Workflow:**
1. Run codegen
2. Perform the user flow manually
3. Copy generated code
4. Refactor into page object pattern

### Selector Priority

Playwright recommends this priority (most to least resilient):

```typescript
// 1. BEST: User-facing attributes (accessibility)
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Email address')
page.getByPlaceholder('Enter your email')
page.getByText('Welcome back')

// 2. GOOD: Test IDs (our approach)
page.getByTestId('studio-sidebar-step-card')

// 3. OKAY: CSS selectors (when necessary)
page.locator('.step-card')

// 4. AVOID: XPath, complex selectors
page.locator('//div[@class="container"]/div[2]/button')
```

**Our approach:** Combine test IDs (explicit, controlled) with role-based selectors (accessible, resilient).

```typescript
// Example: Use role within a test ID container
const sidebar = page.getByTestId(studioTestIds.sidebar);
const addButton = sidebar.getByRole('button', { name: 'Add Step' });
```

---

## Package Setup

```bash
# Install
cd apps/web
pnpm add -D @playwright/test

# Initialize
npx playwright install chromium

# Add scripts to package.json
```

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

---

## Consequences

### Positive

- **Minimal overhead** — Quick to set up and maintain
- **Catches regressions** — Critical path always tested
- **Easy to update** — When UI changes, update one page object
- **Scales gradually** — Add complexity only when needed

### Negative

- **Limited coverage** — Only critical paths tested
- **Manual testing still needed** — For edge cases and new features

### Acceptable for MVP

- We're trading coverage for speed
- We'll expand post-MVP when features stabilize
- One good smoke test > 50 untested features

---

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
