# Running E2E Tests

Commands, environment setup, and troubleshooting for E2E tests.

## Prerequisites

Tests run against a **production build** for stability. The test runner will:
1. Build the app (`pnpm build`)
2. Start the preview server (`pnpm preview`)
3. Run tests against the built app

## Commands

From `apps/web` directory:

```bash
# Run all E2E tests (builds first)
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# Run with visible browser
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# Run specific feature
pnpm exec playwright test features/form-studio --config=tests/e2e/playwright.config.ts

# Run specific test file
pnpm exec playwright test features/auth/login.spec.ts --config=tests/e2e/playwright.config.ts
```

**Note:** First run will be slower due to build. Subsequent runs reuse the build if unchanged.

---

## Environment Variables

Create `.env` file in `apps/web/tests/e2e/`:

```bash
# E2E API authentication
E2E_API_URL=http://localhost:4000
E2E_API_SECRET=<your-secret>

# E2E user credentials
E2E_USER_EMAIL=test@example.com
E2E_USER_PASSWORD=testpassword

# App URL (preview server port)
E2E_BASE_URL=http://localhost:4173
```

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `E2E_API_URL` | URL of the API server |
| `E2E_API_SECRET` | Secret token for E2E API authentication |
| `E2E_USER_EMAIL` | Test user email for authentication |
| `E2E_USER_PASSWORD` | Test user password for authentication |
| `E2E_BASE_URL` | URL of the web app (preview server) |

---

## Troubleshooting

### Tests Fail to Start

1. **Check API is running**: `pnpm dev:api`
2. **Check preview server**: Tests should start it automatically, but you can run `pnpm preview` manually
3. **Verify .env file exists**: `apps/web/tests/e2e/.env`

### Authentication Failures

1. Check `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` are correct
2. Verify the test user exists in the database
3. Check API logs for auth errors

### Flaky Tests

1. **Use `formViaApi` instead of `formViaUi`** - API fixtures are more reliable
2. **Add explicit waits** - Use `await expect(locator).toBeVisible()` before interactions
3. **Use page objects** - Centralized waits and assertions

### Test Data Issues

1. **Clean up old data**: `POST /e2e/cleanup` endpoint
2. **Check E2E API logs** for creation errors
3. **Verify organization exists**: The E2E_ORGANIZATION_ID must exist

### Debugging

```bash
# Run with debug mode (pauses on failure)
pnpm test:e2e:debug

# Run with visible browser
pnpm test:e2e:headed

# Run with trace recording
pnpm exec playwright test --trace on --config=tests/e2e/playwright.config.ts
```

### View Test Reports

```bash
# Open last test report
pnpm exec playwright show-report
```

---

## CI/CD Notes

For CI environments:

1. Set all environment variables as secrets
2. Use headless mode (default)
3. Consider running tests in parallel with `--workers=auto`
4. Archive test artifacts (screenshots, videos) on failure

---

## Related Documentation

- [E2E Architecture](./e2e-architecture.md) - Test structure and patterns
- [Test IDs](./test-ids.md) - Selector strategy
