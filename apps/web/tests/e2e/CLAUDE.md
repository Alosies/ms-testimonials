# E2E Tests Architecture

This directory contains end-to-end tests for the Testimonials web application using Playwright.
The tests follow **Feature-Sliced Design (FSD)** architecture to mirror the main application structure.

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
│   │   ├── fixtures/         # API-based test data creation
│   │   │   ├── create-form.ts
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
├── .env                      # Test environment variables
└── CLAUDE.md                 # This documentation
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
   - `entities/` - Test data fixtures (API calls) and mocks (static constants)
   - `features/` - Actual test files organized by feature
   - `shared/` - Reusable page objects, API clients, utilities

## Entity Structure

Each entity has two sub-folders:

| Folder | Purpose | Example |
|--------|---------|---------|
| `fixtures/` | API-based test data creation/deletion | `createTestForm()` |
| `mocks/` | Static constants for assertions | `FULL_FORM_STEP_COUNT` |

```
entities/form/
├── types.ts              # Type definitions
├── fixtures/             # API-based (creates real data)
│   ├── create-form.ts    # createTestForm, deleteTestForm
│   └── index.ts
├── mocks/                # Static (no API calls)
│   ├── empty-form.ts     # EMPTY_FORM_MOCK
│   ├── full-form.ts      # FULL_FORM_MOCK, FULL_FORM_STEP_COUNT
│   └── index.ts
└── index.ts              # Barrel exports
```

## Writing New Tests

### 1. Add Test File to Feature Folder

Create tests in a feature folder that mirrors the app feature:

```ts
// features/my-feature/my-feature.spec.ts
import { test, expect } from '../../app/fixtures';
import { createMyPageObject } from '../../shared';
import { SOME_MOCK_CONSTANT } from '../../entities';

test.describe('My Feature', () => {
  test('should do something', async ({ authedPage, testFormFast }) => {
    // Test implementation
  });
});
```

### 2. Available Fixtures

```ts
interface TestFixtures {
  // Authenticated page with logged-in user
  authedPage: Page;

  // Organization slug from URL
  orgSlug: string;

  // Form created via UI with AI (slow, ~30s)
  testForm: TestFormData;

  // Form created via Test API (fast, ~1s)
  testFormFast: TestFormData;
}
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

### 4. Using Mock Constants

```ts
import { FULL_FORM_STEP_COUNT } from '../../entities';

test('form has correct steps', async ({ authedPage, testFormFast }) => {
  const studio = createStudioPage(authedPage);
  await authedPage.goto(testFormFast.studioUrl);
  await studio.expectStepCount(FULL_FORM_STEP_COUNT);
});
```

## Adding New Entities

When adding a new entity (e.g., `testimonial`):

1. Create folder structure:
   ```
   entities/testimonial/
   ├── types.ts
   ├── fixtures/
   │   ├── create-testimonial.ts
   │   └── index.ts
   ├── mocks/
   │   ├── sample-testimonial.ts
   │   └── index.ts
   └── index.ts
   ```

2. Add types:
   ```ts
   // entities/testimonial/types.ts
   export interface TestTestimonial {
     id: string;
     content: string;
     formId: string;
   }
   ```

3. Add fixtures (API-based):
   ```ts
   // entities/testimonial/fixtures/create-testimonial.ts
   import { testApiRequest } from '../../../shared';
   import type { TestTestimonial } from '../types';

   export async function createTestTestimonial(
     formId: string
   ): Promise<TestTestimonial> {
     return testApiRequest<TestTestimonial>('POST', '/testimonials', { formId });
   }
   ```

4. Add mocks (static):
   ```ts
   // entities/testimonial/mocks/sample-testimonial.ts
   import type { TestTestimonial } from '../types';

   export const SAMPLE_TESTIMONIAL_MOCK: Omit<TestTestimonial, 'id'> = {
     content: 'Great product!',
     formId: 'test-form-id',
   };
   ```

5. Export from barrel files:
   ```ts
   // entities/testimonial/index.ts
   export type { TestTestimonial } from './types';
   export { createTestTestimonial } from './fixtures';
   export { SAMPLE_TESTIMONIAL_MOCK } from './mocks';
   ```

6. Re-export from `entities/index.ts`

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

## Environment Variables

Create `.env` file in `apps/web/tests/e2e/`:

```bash
# E2E API authentication
E2E_API_URL=http://localhost:4000
E2E_API_SECRET=<your-secret>

# E2E user credentials
E2E_USER_EMAIL=test@example.com
E2E_USER_PASSWORD=testpassword

# App URL
E2E_BASE_URL=http://localhost:3001
```

## Running Tests

```bash
# From project root
pnpm test:e2e              # Run all E2E tests

# From apps/web
cd apps/web
pnpm exec playwright test  # Run all tests
pnpm exec playwright test features/form-studio  # Run specific feature
pnpm exec playwright test --ui  # Interactive mode
```

## Best Practices

1. **Use fast fixtures when possible** - `testFormFast` is ~30x faster than `testForm`
2. **Mirror app structure** - Feature folders should match app feature folders
3. **Page objects for UI** - All UI interactions go through page objects
4. **Fixtures for real data** - Use `entities/{entity}/fixtures/` for API-based setup
5. **Mocks for constants** - Use `entities/{entity}/mocks/` for static test data
6. **Clean imports** - Import from barrel exports (`../../shared`, `../../entities`)
