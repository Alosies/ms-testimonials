---
name: e2e-test-ids
description: Create and manage centralized test IDs for E2E testing. Use when adding data-testid attributes to components or using test IDs in Playwright tests. Triggers on "test id", "testid", "data-testid", "e2e selector".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# E2E Test IDs Skill

Create and manage centralized test IDs for reliable E2E test selectors.

---

## Quick Reference

```bash
# Test IDs location
apps/web/src/shared/constants/testIds/
├── index.ts       # Barrel exports
├── auth.ts        # Auth-related test IDs
├── forms.ts       # Forms list test IDs
├── studio.ts      # Form studio test IDs
└── wizard.ts      # Form wizard test IDs

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

## 1. Test ID File Structure

### Create New Domain File

**Location**: `apps/web/src/shared/constants/testIds/{domain}.ts`

```typescript
export const {domain}TestIds = {
  // Group 1: Container elements
  container: '{domain}-container',
  list: '{domain}-list',

  // Group 2: Interactive elements
  submitButton: '{domain}-submit-button',
  cancelButton: '{domain}-cancel-button',

  // Group 3: Dynamic elements (use functions)
  listItem: (id: string) => `{domain}-list-item-${id}`,
  chip: (index: number) => `{domain}-chip-${index}`,
} as const;

export type {Domain}TestId = typeof {domain}TestIds;
```

### Update Barrel Export

**File**: `apps/web/src/shared/constants/testIds/index.ts`

```typescript
export { studioTestIds } from './studio';
export { authTestIds } from './auth';
export { formsTestIds } from './forms';
export { {domain}TestIds } from './{domain}';  // Add new export

export type { StudioTestId } from './studio';
export type { AuthTestId } from './auth';
export type { FormsTestId } from './forms';
export type { {Domain}TestId } from './{domain}';  // Add type export
```

---

## 2. Add Test IDs to Vue Components

### Static Elements

```vue
<template>
  <div :data-testid="studioTestIds.sidebar">
    <button :data-testid="studioTestIds.submitButton">
      Submit
    </button>
  </div>
</template>

<script setup lang="ts">
import { studioTestIds } from '@/shared/constants/testIds';
</script>
```

### Dynamic Elements (Lists, Indexes)

```vue
<template>
  <div
    v-for="(item, index) in items"
    :key="item.id"
    :data-testid="wizardTestIds.chip(index)"
  >
    {{ item.label }}
  </div>
</template>

<script setup lang="ts">
import { wizardTestIds } from '@/shared/constants/testIds';
</script>
```

### With Props

```vue
<script setup lang="ts">
import { wizardTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  index: number;
}>();
</script>

<template>
  <button :data-testid="wizardTestIds.chip(props.index)">
    {{ label }}
  </button>
</template>
```

---

## 3. Use Test IDs in E2E Tests

### Page Objects

**Location**: `apps/web/tests/e2e/shared/pages/{domain}.page.ts`

```typescript
import { Page } from '@playwright/test';
import { studioTestIds } from '@/shared/constants/testIds';

export function createStudioPage(page: Page) {
  return {
    page,

    // Static locators
    async expectSidebarVisible() {
      await page.getByTestId(studioTestIds.sidebar).waitFor();
    },

    // Dynamic locators
    async clickChip(index: number) {
      await page.getByTestId(wizardTestIds.chip(index)).click();
    },

    // Multiple selections
    async selectChips(indices: number[]) {
      for (const index of indices) {
        await page.getByTestId(wizardTestIds.chip(index)).click();
      }
    },
  };
}
```

### Test Files

```typescript
import { test, expect } from '@playwright/test';
import { studioTestIds, wizardTestIds } from '@/shared/constants/testIds';

test('should select focus areas', async ({ page }) => {
  // Direct usage
  await page.getByTestId(wizardTestIds.chip(0)).click();
  await page.getByTestId(wizardTestIds.chip(1)).click();

  // Assertions
  await expect(page.getByTestId(studioTestIds.sidebar)).toBeVisible();
});
```

---

## Naming Conventions

### Test ID Format

**Pattern**: `{domain}-{element}-{qualifier}`

| Part | Description | Examples |
|------|-------------|----------|
| `{domain}` | Feature/page area | `studio`, `auth`, `forms`, `wizard` |
| `{element}` | UI element type | `button`, `input`, `list`, `card`, `chip` |
| `{qualifier}` | Specific identifier | `submit`, `cancel`, `email`, `step` |

### Examples

| Test ID | Meaning |
|---------|---------|
| `auth-login-submit-button` | Submit button on login form |
| `studio-sidebar-step-card` | Step card in studio sidebar |
| `wizard-focus-area-chip-0` | First focus area chip in wizard |
| `forms-list-item-abc123` | Form list item with ID abc123 |

### Static vs Dynamic

| Type | Use When | Pattern |
|------|----------|---------|
| **Static** | Single element on page | `property: 'domain-element'` |
| **Dynamic** | Multiple similar elements | `property: (id) => \`domain-element-${id}\`` |

---

## Existing Test ID Files

### auth.ts
```typescript
authTestIds = {
  loginForm, loginEmailInput, loginPasswordInput,
  loginSubmitButton, loginErrorMessage,
  signupForm, signupEmailInput, signupPasswordInput, signupSubmitButton
}
```

### forms.ts
```typescript
formsTestIds = {
  formsList, formsListItem, formsCreateButton, formsEmptyState,
  createFormModal, createFormNameInput, createFormSubmitButton, createFormCancelButton
}
```

### studio.ts
```typescript
studioTestIds = {
  sidebar, canvas, propertiesPanel, header,
  sidebarStepCard, sidebarAddButton,
  canvasStepCard, canvasEmptyState, canvasAddButton,
  headerSaveStatus, headerBackButton, headerPreviewButton, headerFormTitle,
  stepTypeMenu, stepTypeOption: (type) => `studio-step-type-${type}`,
  propertiesTitleInput, propertiesDescriptionInput
}
```

### wizard.ts
```typescript
wizardTestIds = {
  focusAreasContainer,
  focusAreaChip: (index) => `wizard-focus-area-chip-${index}`
}
```

---

## When to Use Test IDs

### ✅ DO Use Test IDs For:

- Elements targeted by E2E tests
- Dynamic content where text changes (different languages, user-generated)
- Lists/repeating elements (use index or ID function)
- Complex components where role-based selectors are ambiguous

### ❌ DON'T Use Test IDs For:

- Elements easily targeted by accessible roles (`getByRole('button', { name: 'Submit' })`)
- Static text that won't change (`getByText('Welcome')`)
- Form inputs with labels (`getByLabel('Email')`)

### Decision Flow

```
Can I use getByRole() reliably?
    │
    ├─ Yes → Use role-based selector (preferred)
    │
    └─ No → Does text/label change based on context?
              │
              ├─ Yes → Use test ID
              │
              └─ No → Use getByText() or getByLabel()
```

---

## Checklist

When adding test IDs:

- [ ] Create/update file in `apps/web/src/shared/constants/testIds/`
- [ ] Follow naming convention: `{domain}-{element}-{qualifier}`
- [ ] Use function for dynamic elements: `(id) => \`...-${id}\``
- [ ] Export from `index.ts` barrel file
- [ ] Add `:data-testid` to Vue component
- [ ] Import test IDs in page object or test file
- [ ] Verify with Playwright: `page.getByTestId(testId)`

---

## Troubleshooting

### Test ID Not Found

1. Check import path is correct
2. Verify component has `:data-testid` (not just `data-testid`)
3. Check barrel export in `index.ts`
4. Use browser DevTools to inspect element

### Dynamic Test ID Issues

```typescript
// ❌ Wrong: String concatenation in template
:data-testid="'wizard-chip-' + index"

// ✅ Correct: Use centralized function
:data-testid="wizardTestIds.chip(index)"
```

### TypeScript Errors

Ensure type is exported:
```typescript
// index.ts
export type { WizardTestId } from './wizard';
```
