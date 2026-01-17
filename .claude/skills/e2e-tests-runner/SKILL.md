---
name: e2e-tests-runner
description: Run Playwright E2E tests with correct configuration. Use when running tests, debugging test failures, or verifying changes. Triggers on "run tests", "run e2e", "playwright test", "verify tests".
allowed-tools: Bash, Read, Glob, Grep
---

# E2E Tests Runner

Run Playwright E2E tests with the correct configuration and environment setup.

## Quick Reference

```bash
# Working directory (REQUIRED)
cd apps/web

# Run all tests (dev server must be running on port 3001)
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts

# Run specific test file
E2E_BASE_URL=http://localhost:3001 pnpm playwright test features/auth --config=tests/e2e/playwright.config.ts

# Run with visible browser (headed mode)
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts --headed

# Run in interactive UI mode
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts --ui
```

## Critical Configuration

### Environment Variable

The `E2E_BASE_URL` environment variable **MUST** be set:

```bash
E2E_BASE_URL=http://localhost:3001
```

Without this, tests fail with: `Cannot navigate to invalid URL`

### Config Path

The `--config` flag **MUST** point to the correct location:

```bash
--config=tests/e2e/playwright.config.ts
```

The config file is located at `apps/web/tests/e2e/playwright.config.ts`, not in the root.

## Prerequisites

### 1. Dev Server Running

The web application must be running before tests can execute:

```bash
# Check if dev server is running
curl -s http://localhost:3001 > /dev/null && echo "Dev server is running" || echo "Dev server NOT running"

# Start dev server (from repo root)
pnpm dev
```

The web app typically runs on port 3000 or 3001. Check the actual port in the terminal output.

### 2. API Server Running

The API must be running for tests that interact with backend:

```bash
# API typically runs on port 4000
curl -s http://localhost:4000/health && echo "API is running" || echo "API NOT running"
```

## Command Variants

### Run All Tests

```bash
cd apps/web
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts
```

### Run Specific Feature

```bash
# Auth tests
E2E_BASE_URL=http://localhost:3001 pnpm playwright test features/auth --config=tests/e2e/playwright.config.ts

# Form studio tests
E2E_BASE_URL=http://localhost:3001 pnpm playwright test features/form-studio --config=tests/e2e/playwright.config.ts

# Forms list tests
E2E_BASE_URL=http://localhost:3001 pnpm playwright test features/forms-list --config=tests/e2e/playwright.config.ts
```

### Run Specific Test File

```bash
E2E_BASE_URL=http://localhost:3001 pnpm playwright test features/form-studio/studio.spec.ts --config=tests/e2e/playwright.config.ts
```

### Run Single Test by Name

```bash
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts -g "user can login"
```

### Debug Mode (Headed + Slow)

```bash
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts --headed --timeout=0
```

### Interactive UI Mode

```bash
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts --ui
```

## Test Locations

| Item | Path |
|------|------|
| Config | `apps/web/tests/e2e/playwright.config.ts` |
| Test specs | `apps/web/tests/e2e/features/` |
| Page objects | `apps/web/tests/e2e/shared/pages/` |
| Fixtures | `apps/web/tests/e2e/entities/` |
| App fixtures | `apps/web/tests/e2e/app/` |

## Troubleshooting

### Error: "Cannot navigate to invalid URL"

**Cause:** `E2E_BASE_URL` not set or incorrect.

**Fix:**
```bash
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts
```

### Error: Config file not found

**Cause:** Running from wrong directory or missing `--config` flag.

**Fix:**
```bash
cd apps/web
pnpm playwright test --config=tests/e2e/playwright.config.ts
```

### Error: Connection refused

**Cause:** Dev server not running.

**Fix:**
```bash
# Start dev server first (from repo root)
pnpm dev

# Then run tests
cd apps/web
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts
```

### Tests timing out

**Cause:** Network issues, slow startup, or missing API.

**Fix:**
```bash
# Increase timeout
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts --timeout=120000

# Or run in debug mode
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts --headed --timeout=0
```

### View Test Results

```bash
# Open HTML report
pnpm playwright show-report apps/web/tests/e2e/test-results/html
```

## Full Command Template

Copy-paste ready command:

```bash
cd /Users/alosiesgeorge/CodeRepositories/Fork/micro-saas/proj-testimonials/ms-testimonials-yellow/apps/web && E2E_BASE_URL=http://localhost:3001 pnpm playwright test --config=tests/e2e/playwright.config.ts
```

## Checklist Before Running

- [ ] Working directory is `apps/web`
- [ ] Dev server running on correct port (check with `curl`)
- [ ] `E2E_BASE_URL` set to correct URL
- [ ] `--config=tests/e2e/playwright.config.ts` flag included
- [ ] API server running (if tests need backend)
