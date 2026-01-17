# Creating Journey Tests

Guide for writing comprehensive journey tests.

## What is a Journey Test?

A single test that validates all critical functionality in one continuous flow:
- One setup, one teardown
- Sequential validation of features
- Maximum efficiency for CI

## When to Use

- After major commits
- Before merging to main branch
- CI quick-check pipeline

## Template

```typescript
/**
 * {Feature} Journey Test
 *
 * Validates all critical {feature} functionality in one continuous flow.
 *
 * ## If This Test Fails
 * Run focused tests to pinpoint:
 * - focused-tests/core.spec.ts
 * - focused-tests/navigation.spec.ts
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { create{Feature}Page } from '@e2e/shared';
import { create{Feature}Actions } from '@e2e/features/{feature}/actions';

test('{feature} complete journey', async ({ authedPage, branchedFormViaApi }) => {
  const page = create{Feature}Page(authedPage);
  const actions = create{Feature}Actions(page);

  // ==========================================
  // 1. SETUP / LOAD
  // ==========================================
  await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

  await expect(page.mainContainer).toBeVisible();

  // ==========================================
  // 2. FIRST FUNCTIONALITY
  // ==========================================
  await actions.select.selectStep(firstStep.id);

  // ==========================================
  // 3. SECOND FUNCTIONALITY
  // ==========================================
  await actions.nav.navigateDown();

  // ==========================================
  // 4. THIRD FUNCTIONALITY
  // ==========================================
  // ...continue through all critical paths

  // ==========================================
  // JOURNEY COMPLETE
  // ==========================================
});
```

## Best Practices

### 1. Use Most Complete Fixture

Use `branchedFormViaApi` if it covers all features:

```typescript
test('journey', async ({ authedPage, branchedFormViaApi }) => {
  // branchedFormViaApi has both regular and branching features
});
```

### 2. Section Comments

Use clear section headers:

```typescript
// ==========================================
// 3. KEYBOARD NAVIGATION
// ==========================================
```

### 3. Light Assertions

Journey tests verify "did it work?", not detailed state:

```typescript
// Good: Light assertion
await expect(page.panel).toBeVisible();

// Save detailed assertions for focused tests
```

### 4. Single Test Per Feature

One comprehensive test, not multiple small ones:

```typescript
// Good: One complete journey
test('form studio complete journey', async () => { ... });

// Bad: Multiple journey tests
test('journey part 1', async () => { ... });
test('journey part 2', async () => { ... });
```

### 5. Document Focused Test References

```typescript
/**
 * ## If This Test Fails
 * Run focused tests to pinpoint:
 * - focused-tests/core.spec.ts
 * - focused-tests/navigation.spec.ts
 */
```

## Coverage Checklist

A journey test should cover:

- [ ] Initial load/setup
- [ ] Primary user interactions (click, type)
- [ ] Keyboard navigation (if applicable)
- [ ] State changes (add, delete, update)
- [ ] All major UI panels/sections
- [ ] Branch paths (if applicable)
