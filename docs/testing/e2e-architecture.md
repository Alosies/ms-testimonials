# E2E Tests Architecture

End-to-end tests for the Testimonials web application using Playwright.
Tests follow **Feature-Sliced Design (FSD)** architecture to mirror the main application structure.

## Directory Structure

```
apps/web/tests/e2e/
├── app/                      # App-level setup and configuration
│   ├── fixtures.ts           # Playwright test fixtures (auth, orgSlug)
│   └── index.ts              # Barrel exports
│
├── entities/                 # Data fixtures & mocks (mirrors app entities)
│   ├── form/
│   │   ├── types.ts          # Form-related type definitions
│   │   ├── fixtures/         # Playwright fixtures + API utilities
│   │   │   ├── form-fixtures.ts  # Playwright fixtures (formViaApi, formViaUi)
│   │   │   ├── form-api.ts       # API utilities (createTestForm, deleteTestForm)
│   │   │   └── index.ts
│   │   ├── mocks/            # Static constants & mock data
│   │   │   ├── empty-form.ts
│   │   │   ├── full-form.ts
│   │   │   └── index.ts
│   │   └── index.ts          # Barrel exports
│   ├── organization/
│   │   ├── types.ts
│   │   ├── fixtures/
│   │   │   ├── get-by-slug.ts
│   │   │   └── index.ts
│   │   ├── mocks/
│   │   │   ├── test-org.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts              # Barrel exports for all entities
│
├── features/                 # Tests organized by feature (mirrors app features)
│   ├── auth/
│   │   └── login.spec.ts     # Authentication tests
│   ├── forms-list/
│   │   └── forms-list.spec.ts # Forms list page tests
│   └── form-studio/
│       └── studio.spec.ts    # Form builder/studio tests
│
├── shared/                   # Shared utilities and abstractions
│   ├── api/
│   │   ├── test-api-client.ts # HTTP client for Test API
│   │   └── index.ts
│   ├── pages/                # Page objects
│   │   ├── forms.page.ts
│   │   ├── studio.page.ts
│   │   ├── form-creation.page.ts
│   │   └── index.ts
│   └── index.ts              # Barrel exports for all shared modules
│
├── playwright.config.ts      # Playwright configuration
└── .env                      # Test environment variables
```

## FSD Layer Rules

Following the same principles as the main application:

1. **Higher layers import from lower layers** (never reverse)
   - `features/` → imports from `entities/`, `shared/`, `app/`
   - `entities/` → imports from `shared/`
   - `shared/` → standalone, no imports from higher layers
   - `app/` → composes from `entities/` and `shared/`

2. **Each layer has a specific purpose**:
   - `app/` - Playwright fixtures, global test configuration
   - `entities/` - Test data fixtures and types
   - `features/` - Actual test files organized by feature
   - `shared/` - Reusable page objects, API clients, utilities

---

## Entity Structure

```
entities/form/
├── types.ts              # Type definitions (TestFormData, TestStep, TestQuestion)
├── fixtures/             # Playwright fixtures + API utilities
│   ├── form-fixtures.ts  # Playwright fixtures (formViaApi, formViaUi)
│   ├── form-api.ts       # API utilities (createTestForm, deleteTestForm)
│   └── index.ts
└── index.ts              # Barrel exports
```

---

## Available Fixtures

### App Fixtures (from `app/fixtures`)

```ts
interface AppFixtures {
  authedPage: Page;   // Authenticated page with logged-in user
  orgSlug: string;    // Organization slug from URL
}
```

### Form Fixtures (from `entities/form/fixtures`)

```ts
interface FormFixtures extends AppFixtures {
  formViaApi: TestFormData;  // Form created via E2E API (fast, ~1s)
  formViaUi: TestFormData;   // Form created via UI with AI (slow, ~30s)
}

// TestFormData includes all created data for assertions
interface TestFormData {
  id: string;
  name: string;
  studioUrl: string;
  orgSlug: string;
  flowId: string;
  steps: TestStep[];  // Full step data with questions
}
```

---

## Writing New Tests

### 1. Add Test File to Feature Folder

Create tests in a feature folder that mirrors the app feature:

```ts
// features/my-feature/my-feature.spec.ts
import { test, expect } from '../../entities/form/fixtures';
import { createMyPageObject } from '../../shared';

test.describe('My Feature', () => {
  test('should do something', async ({ authedPage, formViaApi }) => {
    // Use actual data returned by the fixture
    await authedPage.goto(formViaApi.studioUrl);

    // Assert using created data (not hardcoded values)
    expect(formViaApi.steps.length).toBe(3);
  });
});
```

### 2. Choosing the Right Import

```ts
// Tests that only need authentication:
import { test, expect } from '../../app/fixtures';

test('dashboard loads', async ({ authedPage, orgSlug }) => { ... });

// Tests that need a form:
import { test, expect } from '../../entities/form/fixtures';

test('studio loads', async ({ authedPage, formViaApi }) => { ... });
```

### 3. Using Page Objects

Page objects are in `shared/pages/`:

```ts
import { createStudioPage, createFormsPage } from '../../shared';

test('example', async ({ authedPage }) => {
  const studio = createStudioPage(authedPage);
  await studio.goto('org-slug', 'form-slug');
  await studio.expectLoaded();
  await studio.addStep('Question');
});
```

### 4. Using Fixture Data (Factory Pattern)

Tests should use actual data returned by fixtures, not hardcoded constants.
This follows the **factory pattern** used by most testing frameworks.

```ts
test('form has correct steps', async ({ authedPage, formViaApi }) => {
  const studio = createStudioPage(authedPage);
  await authedPage.goto(formViaApi.studioUrl);

  // Good: Use actual data from fixture
  await studio.expectStepCount(formViaApi.steps.length);

  // Good: Assert question text using returned data
  const ratingStep = formViaApi.steps.find(s => s.stepType === 'rating');
  const question = ratingStep?.questions[0];
  await expect(page.getByText(question.questionText)).toBeVisible();
});

// Bad: Hardcoded values that may drift from actual data
await studio.expectStepCount(5);  // What if API changes?
```

**Why factory pattern?**
- Tests use what was actually created
- No sync issues between constants and API
- Self-documenting tests

---

## Adding New Entities

When adding a new entity (e.g., `testimonial`):

1. Create folder structure:
   ```
   entities/testimonial/
   ├── types.ts              # Type definitions
   ├── fixtures/
   │   ├── testimonial-api.ts      # API utilities
   │   ├── testimonial-fixtures.ts # Playwright fixtures
   │   └── index.ts
   └── index.ts
   ```

2. Add types (include all data for assertions):
   ```ts
   // entities/testimonial/types.ts
   export interface TestTestimonialData {
     id: string;
     content: string;
     authorName: string;
     formId: string;
   }
   ```

3. Add API utilities:
   ```ts
   // entities/testimonial/fixtures/testimonial-api.ts
   import { testApiRequest } from '../../../shared';
   import type { TestTestimonialData } from '../types';

   export async function createTestTestimonial(
     formId: string
   ): Promise<TestTestimonialData> {
     // API returns full created data for test assertions
     return testApiRequest<TestTestimonialData>('POST', '/testimonials', { formId });
   }
   ```

4. Export from barrel files:
   ```ts
   // entities/testimonial/index.ts
   export type { TestTestimonialData } from './types';
   export { createTestTestimonial } from './fixtures';
   ```

5. Re-export from `entities/index.ts`

---

## Adding New Page Objects

When adding a page object for a new page:

1. Create file: `shared/pages/my-page.page.ts`
2. Export from: `shared/pages/index.ts`
3. Re-export from: `shared/index.ts`

Example:

```ts
// shared/pages/testimonials.page.ts
import { Page, expect } from '@playwright/test';

export function createTestimonialsPage(page: Page) {
  return {
    page,

    async goto(orgSlug: string) {
      await page.goto(`/${orgSlug}/testimonials`);
    },

    async expectLoaded() {
      await expect(page.getByTestId('testimonials-list')).toBeVisible();
    },
  };
}

export type TestimonialsPage = ReturnType<typeof createTestimonialsPage>;
```

---

## Fixture Naming Conventions

Playwright fixtures should be named as **nouns** describing what you receive, not actions.

### Naming Pattern

```
{entity}Via{Method}
```

| Pattern | Example | Description |
|---------|---------|-------------|
| `{entity}ViaApi` | `formViaApi` | Entity created via E2E API (fast) |
| `{entity}ViaUi` | `formViaUi` | Entity created via UI (slow) |

### Why Nouns, Not Actions

Playwright's built-in fixtures use nouns:
- `page` - a Page object
- `context` - a BrowserContext
- `browser` - a Browser instance

Follow the same pattern:

```ts
// Good: Nouns describing what you receive
formViaApi      // you get a form (created via API)
formViaUi       // you get a form (created via UI)
authedPage      // you get an authenticated page

// Bad: Action-oriented names
testForm        // sounds like "test the form"
createForm      // sounds like a function call
```

### Fixture Lifecycle

Fixtures handle setup and teardown automatically:

```ts
formViaApi: async ({ orgSlug }, use) => {
  // SETUP: runs before test
  const formData = await createTestForm(orgSlug);

  await use(formData);  // TEST RUNS HERE

  // TEARDOWN: runs after test (pass or fail)
  await deleteTestForm(formData.id);
}
```

### Adding New Entity Fixtures

When creating fixtures for a new entity:

```ts
// entities/testimonial/fixtures/testimonial-fixtures.ts
export interface TestimonialFixtures {
  testimonialViaApi: TestTestimonialData;
}

export const test = formTest.extend<TestimonialFixtures>({
  testimonialViaApi: async ({ formViaApi }, use) => {
    const testimonial = await createTestTestimonial(formViaApi.id);
    await use(testimonial);
    await deleteTestTestimonial(testimonial.id);
  },
});
```

---

## E2E API

The E2E API (`api/src/routes/e2e.ts`) provides fast test data setup:

- Bypasses authentication (uses `X-E2E-Token` header)
- Bypasses RLS (uses admin Hasura client)
- Creates deterministic test data (no AI generation)
- Uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID from env vars

Available endpoints:
- `GET /e2e/organizations/:slug` - Get organization by slug
- `POST /e2e/forms` - Create form with steps
- `DELETE /e2e/forms/:id` - Delete form
- `POST /e2e/cleanup` - Clean up old test data

---

## Best Practices

1. **Use API fixtures when possible** - `formViaApi` is ~30x faster than `formViaUi`
2. **Factory pattern for test data** - Use actual returned data for assertions, not hardcoded constants
3. **Mirror app structure** - Feature folders should match app feature folders
4. **Page objects for UI** - All UI interactions go through page objects
5. **Clean imports** - Import from barrel exports (`../../shared`, `../../entities`)
6. **Noun-based fixture names** - Name fixtures as nouns (`formViaApi`), not actions (`testForm`)

---

## Related Documentation

- [Test IDs](./test-ids.md) - Centralized test ID system
- [Running Tests](./running-tests.md) - Commands and environment setup
