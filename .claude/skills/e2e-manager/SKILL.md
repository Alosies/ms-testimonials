---
name: e2e-manager
description: Orchestrate E2E testing operations by routing to specialized testing skills. Use for general E2E tasks, test setup, or when multiple testing operations are needed. Triggers on "e2e", "test", "playwright", "testing".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# E2E Manager

Orchestrate E2E testing operations by routing to the appropriate specialized skill.

## Philosophy

**You are a router, not an implementer.** Your job is to:
1. Understand what the user needs for E2E testing
2. Delegate to the right specialized skill
3. Coordinate multi-step testing workflows

## Specialized Skills

| Skill | Use When |
|-------|----------|
| `/e2e-test-ids` | Creating test IDs, adding `data-testid` to components, using test IDs in tests |

*More skills coming soon: e2e-page-objects, e2e-fixtures, e2e-api*

## Routing Logic

### Single Operations

| User Says | Route To |
|-----------|----------|
| "add test id", "create testid", "data-testid" | `/e2e-test-ids` |
| "target element in test", "select element" | `/e2e-test-ids` |

### Test Infrastructure Setup (Multi-Step)

When user asks to "add E2E tests for a feature", coordinate:

**Phase 1: Test IDs** → Use `/e2e-test-ids`
- Create test ID constants file (if new domain)
- Add `data-testid` attributes to components
- Export from barrel file

**Phase 2: Page Objects** → *(Coming soon)*
- Create page object in `tests/e2e/shared/pages/`
- Add locators using test IDs

**Phase 3: Test Files** → *(Coming soon)*
- Create test file in `tests/e2e/features/`
- Use page objects and fixtures

## Decision Flow

```
User Request
    │
    ├─ Test ID related? ────────────► /e2e-test-ids
    │
    ├─ Page object related? ─────────► (handle directly for now)
    │
    ├─ Test fixture related? ────────► (handle directly for now)
    │
    └─ Full test setup? ─────────────► Coordinate phases
```

## Quick Commands Reference

```bash
# Run E2E tests
cd apps/web
pnpm test:e2e                    # Run all E2E tests
pnpm test:e2e:ui                 # Interactive UI mode
pnpm test:e2e:headed             # Run with visible browser

# Run specific test file
pnpm exec playwright test features/form-studio --config=tests/e2e/playwright.config.ts
```

## Key Locations

| Item | Path |
|------|------|
| Test ID constants | `apps/web/src/shared/constants/testIds/` |
| Page objects | `apps/web/tests/e2e/shared/pages/` |
| Test files | `apps/web/tests/e2e/features/` |
| Fixtures | `apps/web/tests/e2e/entities/` |
| E2E config | `apps/web/tests/e2e/playwright.config.ts` |

## When NOT to Route

Handle directly if:
- Running tests (`pnpm test:e2e`)
- Checking test status
- Reading existing test code for context
- Simple test debugging

## Coordination Notes

- Always complete one phase before starting the next
- If test IDs aren't in components, tests will fail - add IDs first
- Page objects should use test IDs, not fragile selectors
- Ask user if they want the full workflow or just one phase
