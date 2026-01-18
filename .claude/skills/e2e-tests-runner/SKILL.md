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

# Get port for current worktree (yellow=3001, green=3002, blue=3003)
source ../../scripts/get-agent-port.sh

# Run all tests
E2E_BASE_URL=$E2E_BASE_URL pnpm test:e2e

# Run smoke tests only (~1 minute)
E2E_BASE_URL=$E2E_BASE_URL pnpm test:e2e:smoke

# Run specific test file
E2E_BASE_URL=$E2E_BASE_URL pnpm playwright test features/auth --config=tests/e2e/playwright.config.ts

# Run with visible browser (headed mode)
E2E_BASE_URL=$E2E_BASE_URL pnpm test:e2e:headed

# Run in interactive UI mode
E2E_BASE_URL=$E2E_BASE_URL pnpm test:e2e:ui
```

## Port Configuration

Each worktree runs on a different port to allow parallel development:

| Worktree | Port | E2E_BASE_URL |
|----------|------|--------------|
| yellow | 3001 | `http://localhost:3001` |
| green | 3002 | `http://localhost:3002` |
| blue | 3003 | `http://localhost:3003` |
| parent | 3000 | `http://localhost:3000` |

**Auto-detect port:** Use `scripts/get-agent-port.sh`
```bash
source ../../scripts/get-agent-port.sh  # Sets E2E_BASE_URL
# or
E2E_BASE_URL=http://localhost:$(../../scripts/get-agent-port.sh) pnpm test:e2e
```

## Critical Configuration

### Environment Variable

The `E2E_BASE_URL` environment variable **MUST** be set to the correct port for your worktree.

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
E2E_BASE_URL=http://localhost:3001 pnpm test:e2e
```

### Run Smoke Tests

Quick validation suite (~1 minute) - includes journey tests and combined autosave tests:

```bash
E2E_BASE_URL=http://localhost:3001 pnpm test:e2e:smoke
```

### Run Tests by Tag

```bash
# Run only @smoke tagged tests
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --grep @smoke --config=tests/e2e/playwright.config.ts

# Run only @autosave tagged tests
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --grep @autosave --config=tests/e2e/playwright.config.ts

# Exclude tests with a specific tag
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --grep-invert @slow --config=tests/e2e/playwright.config.ts

# Run tests with multiple tags (OR logic)
E2E_BASE_URL=http://localhost:3001 pnpm playwright test --grep "@smoke|@autosave" --config=tests/e2e/playwright.config.ts
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

## Test Tags

Tests are organized with tags for selective running:

| Tag | Purpose | When to Run |
|-----|---------|-------------|
| `@smoke` | Critical path tests (journey + combined) | Every PR, quick validation |
| `@autosave` | Auto-save functionality tests | When modifying auto-save |

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `test:e2e` | `pnpm test:e2e` | Run all tests |
| `test:e2e:smoke` | `pnpm test:e2e:smoke` | Run @smoke tests only (~1 min) |
| `test:e2e:ui` | `pnpm test:e2e:ui` | Interactive UI mode |
| `test:e2e:headed` | `pnpm test:e2e:headed` | Visible browser |
| `test:e2e:debug` | `pnpm test:e2e:debug` | Debug mode |

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
