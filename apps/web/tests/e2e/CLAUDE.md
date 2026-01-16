# E2E Tests

This directory contains end-to-end tests using Playwright.

**Full documentation**: [docs/testing/](../../../../docs/testing/)

## Quick Links

| Topic | Documentation |
|-------|---------------|
| Architecture & FSD patterns | [e2e-architecture.md](../../../../docs/testing/e2e-architecture.md) |
| Test IDs & selectors | [test-ids.md](../../../../docs/testing/test-ids.md) |
| Running tests | [running-tests.md](../../../../docs/testing/running-tests.md) |

## Directory Structure

```
apps/web/tests/e2e/
├── app/          # Playwright fixtures (auth, orgSlug)
├── entities/     # Test data fixtures (form, organization)
├── features/     # Test specs by feature
└── shared/       # Page objects, API clients
```

## Quick Start

```bash
# From apps/web
pnpm test:e2e           # Run all tests
pnpm test:e2e:ui        # Interactive UI mode
pnpm test:e2e:headed    # Visible browser
```

## Writing Tests

```ts
// Import fixtures based on what you need
import { test, expect } from '../../entities/form/fixtures';

test('example', async ({ authedPage, formViaApi }) => {
  await authedPage.goto(formViaApi.studioUrl);
  // Use formViaApi data for assertions
});
```

## Selector Strategy

Use **two attributes** for entity elements:

```vue
<div
  :data-testid="studioTestIds.sidebarStepCard"
  :data-step-id="step.id"
>
```

See [test-ids.md](../../../../docs/testing/test-ids.md) for complete selector patterns.
