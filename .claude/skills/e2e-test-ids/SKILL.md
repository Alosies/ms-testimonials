---
name: e2e-test-ids
description: Create and manage centralized test IDs for E2E testing. Use when adding data-testid attributes to components or using test IDs in Playwright tests. Triggers on "test id", "testid", "data-testid", "e2e selector".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# E2E Test IDs Skill

Create and manage centralized test IDs for reliable E2E test selectors.

**Full documentation**: [docs/testing/test-ids.md](../../../docs/testing/test-ids.md)

---

## Quick Reference

```bash
# Test IDs location
apps/web/src/shared/constants/testIds/

# Import in Vue components
import { studioTestIds } from '@/shared/constants/testIds';

# Import in E2E tests
import { studioTestIds } from '@/shared/constants/testIds';
```

---

## Workflow

```
1. Create/update test ID file → 2. Add to Vue component → 3. Use in E2E test
```

---

## Essential Patterns

### Two-Attribute Pattern

Use **both** attributes for elements representing domain entities:

```vue
<div
  :data-testid="studioTestIds.sidebarStepCard"
  :data-step-id="step.id"
>
```

| Attribute | Purpose |
|-----------|---------|
| `data-testid` | Component type (static) |
| `data-{entity}-id` | Domain entity (dynamic) |

### Playwright Selectors

```typescript
// All cards of a type
page.getByTestId('studio-sidebar-step-card')

// Specific entity
page.locator('[data-step-id="abc123"]')

// Both combined (most precise)
page.locator('[data-testid="studio-sidebar-step-card"][data-step-id="abc123"]')
```

---

## Creating Test IDs

### 1. Create File

`apps/web/src/shared/constants/testIds/{domain}.ts`:

```typescript
export const {domain}TestIds = {
  container: '{domain}-container',
  submitButton: '{domain}-submit-button',
  listItem: (id: string) => `{domain}-list-item-${id}`,
} as const;
```

### 2. Export from Barrel

`apps/web/src/shared/constants/testIds/index.ts`:

```typescript
export { {domain}TestIds } from './{domain}';
```

### 3. Add to Component

```vue
<div :data-testid="domainTestIds.container">
```

---

## Naming Convention

**Pattern**: `{domain}-{element}-{qualifier}`

Examples:
- `auth-login-submit-button`
- `studio-sidebar-step-card`
- `wizard-focus-area-chip-0`

---

## Detailed Documentation

For complete information see [docs/testing/test-ids.md](../../../docs/testing/test-ids.md):

- Philosophy and separation of concerns
- All existing test ID files
- Page object patterns
- Decision flows
- Troubleshooting
