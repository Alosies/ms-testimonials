# Test IDs System

Centralized test ID management for reliable E2E test selectors.

## Philosophy: Separation of Concerns

We use **two types of data attributes** for different purposes:

| Attribute | Purpose | Owned By | Selector |
|-----------|---------|----------|----------|
| `data-testid` | **Component type** - "What UI element is this?" | Test infrastructure | `getByTestId()` |
| `data-{entity}-id` | **Domain identifier** - "Which business entity?" | Business domain | `[data-step-id="..."]` |

### Why Two Attributes?

**`data-testid`** identifies the UI component type:
- Managed by test infrastructure
- Static value (same for all instances)
- Example: `studio-sidebar-step-card`

**`data-{entity}-id`** identifies the specific business entity:
- Has semantic meaning beyond tests (debugging, analytics, accessibility)
- Dynamic value (actual entity ID from database)
- Example: `data-step-id="abc123"`

### Example: Step Cards

```vue
<div
  :data-testid="studioTestIds.sidebarStepCard"
  :data-step-id="step.id"
>
```

### Playwright Usage

```typescript
// Select ALL sidebar step cards (by component type)
page.getByTestId('studio-sidebar-step-card')

// Select SPECIFIC step card (by domain ID)
page.locator('[data-step-id="abc123"]')

// Select specific sidebar card (most precise - combines both)
page.locator('[data-testid="studio-sidebar-step-card"][data-step-id="abc123"]')
```

### When to Use Each

| Scenario | Use |
|----------|-----|
| Count all cards of a type | `data-testid` |
| Target specific entity | `data-{entity}-id` |
| Verify entity in correct location | Both combined |
| Entity ID needed beyond tests | `data-{entity}-id` |

### Common Domain Identifiers

| Attribute | Entity | Example |
|-----------|--------|---------|
| `data-step-id` | Form step | `data-step-id="qZeAaikbrQ4E"` |
| `data-form-id` | Form | `data-form-id="abc123"` |
| `data-flow-type` | Flow type | `data-flow-type="testimonial"` |
| `data-question-id` | Question | `data-question-id="xyz789"` |

---

## File Structure

```bash
apps/web/src/shared/constants/testIds/
├── index.ts       # Barrel exports
├── auth.ts        # Auth-related test IDs
├── forms.ts       # Forms list test IDs
├── studio.ts      # Form studio test IDs
└── wizard.ts      # Form wizard test IDs
```

### Imports

```typescript
// In Vue components
import { studioTestIds } from '@/shared/constants/testIds';

// In E2E tests
import { studioTestIds } from '@/shared/constants/testIds';
```

---

## Creating Test ID Files

### New Domain File

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

## Adding Test IDs to Vue Components

### Static Elements (Component Type Only)

For elements without a domain entity, use only `data-testid`:

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

### Entity Elements (Both Attributes)

For elements representing domain entities, use **both** attributes:

```vue
<template>
  <div
    v-for="step in steps"
    :key="step.id"
    :data-testid="studioTestIds.sidebarStepCard"
    :data-step-id="step.id"
  >
    {{ step.name }}
  </div>
</template>

<script setup lang="ts">
import { studioTestIds } from '@/shared/constants/testIds';
</script>
```

### Index-Based Elements (No Entity ID)

For elements identified by position (not domain entity):

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
import { studioTestIds } from '@/shared/constants/testIds';

const props = defineProps<{
  step: { id: string; name: string };
}>();
</script>

<template>
  <div
    :data-testid="studioTestIds.canvasStepCard"
    :data-step-id="props.step.id"
  >
    {{ props.step.name }}
  </div>
</template>
```

---

## Using Test IDs in E2E Tests

### Page Objects

**Location**: `apps/web/tests/e2e/shared/pages/{domain}.page.ts`

```typescript
import { Page } from '@playwright/test';
import { studioTestIds } from '@/shared/constants/testIds';

export function createStudioPage(page: Page) {
  return {
    page,

    // Component type locators (all instances)
    sidebar: page.getByTestId(studioTestIds.sidebar),
    stepCards: page.getByTestId(studioTestIds.sidebarStepCard),

    // Static element assertions
    async expectSidebarVisible() {
      await page.getByTestId(studioTestIds.sidebar).waitFor();
    },

    // Entity-based locators (specific instance by domain ID)
    getSidebarStepCard(stepId: string) {
      return page.locator(`[data-testid="${studioTestIds.sidebarStepCard}"][data-step-id="${stepId}"]`);
    },

    getCanvasStepCard(stepId: string) {
      return page.locator(`[data-testid="${studioTestIds.canvasStepCard}"][data-step-id="${stepId}"]`);
    },

    // Actions using entity IDs
    async selectStepById(stepId: string) {
      await this.getSidebarStepCard(stepId).click();
    },

    // Index-based locators (for position-based elements)
    async clickChip(index: number) {
      await page.getByTestId(wizardTestIds.chip(index)).click();
    },
  };
}
```

### Test Files

```typescript
import { test, expect } from '@playwright/test';
import { studioTestIds, wizardTestIds } from '@/shared/constants/testIds';

test('should select focus areas', async ({ page }) => {
  // Index-based selection
  await page.getByTestId(wizardTestIds.chip(0)).click();
  await page.getByTestId(wizardTestIds.chip(1)).click();

  // Assertions
  await expect(page.getByTestId(studioTestIds.sidebar)).toBeVisible();
});

test('should navigate to specific step', async ({ page, formViaApi }) => {
  const stepId = formViaApi.steps[0].id;

  // Entity-based selection (using domain ID)
  const sidebarCard = page.locator(
    `[data-testid="${studioTestIds.sidebarStepCard}"][data-step-id="${stepId}"]`
  );
  await sidebarCard.click();

  // Verify canvas scrolled to correct step
  const canvasCard = page.locator(
    `[data-testid="${studioTestIds.canvasStepCard}"][data-step-id="${stepId}"]`
  );
  await expect(canvasCard).toBeInViewport();
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

### DO Use Test IDs For

- Elements targeted by E2E tests
- Dynamic content where text changes (different languages, user-generated)
- Lists/repeating elements (use index or ID function)
- Complex components where role-based selectors are ambiguous

### DON'T Use Test IDs For

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
- [ ] **If element represents a domain entity**: Add `:data-{entity}-id` attribute
- [ ] Import test IDs in page object or test file
- [ ] Verify with Playwright: `page.getByTestId(testId)`

### Decision: Do I Need `data-{entity}-id`?

```
Does this element represent a business entity (step, form, question, etc.)?
    │
    ├─ Yes → Add both: data-testid + data-{entity}-id
    │        Example: step card, form item, testimonial card
    │
    └─ No → Use only data-testid
             Example: buttons, containers, static UI elements
```

---

## Troubleshooting

### Test ID Not Found

1. Check import path is correct
2. Verify component has `:data-testid` (not just `data-testid`)
3. Check barrel export in `index.ts`
4. Use browser DevTools to inspect element

### Dynamic Test ID Issues

```typescript
// Wrong: String concatenation in template
:data-testid="'wizard-chip-' + index"

// Correct: Use centralized function
:data-testid="wizardTestIds.chip(index)"
```

### TypeScript Errors

Ensure type is exported:
```typescript
// index.ts
export type { WizardTestId } from './wizard';
```
