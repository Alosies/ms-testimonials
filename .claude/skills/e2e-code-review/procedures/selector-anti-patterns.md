# Selector Anti-Patterns & Correct Patterns

Reference for reviewing E2E test selectors. All selectors must use `data-testid` attributes from centralized constants.

## Anti-Pattern Categories

### 1. CSS Class Assertions

CSS classes are styling concerns and change frequently. Never assert on them.

```typescript
// ❌ Bad: CSS class assertion
await expect(button).toHaveClass(/ring-2/);
await expect(card).toHaveClass(/bg-primary/);

// ✅ Good: data-selected attribute
await expect(button).toHaveAttribute('data-selected', 'true');
```

**Fix in Vue component:**
```vue
<button
  :data-selected="isSelected ? 'true' : undefined"
  :class="isSelected ? 'ring-2 ring-primary' : 'border-border'"
>
```

Use `undefined` (not `'false'`) so the attribute is absent when not selected.

### 2. getByRole / getByText

These selectors are fragile - text changes break tests, and role matching is ambiguous.

```typescript
// ❌ Bad: Role-based selectors
await page.getByRole('button', { name: 'Save' }).click();
await page.getByRole('tab', { name: 'Design' }).click();
await page.getByRole('navigation').getByRole('link', { name: 'Widgets' }).click();

// ✅ Good: Test ID selectors
await page.getByTestId(widgetsTestIds.builderSaveButton).click();
await page.getByTestId(widgetsTestIds.tabDesign).click();
await page.getByTestId(widgetsTestIds.navWidgets).click();
```

### 3. getByText

```typescript
// ❌ Bad: Text-based selectors
await expect(page.getByText('Marquee Settings')).toBeVisible();
page.getByText('Bottom Left').click();

// ✅ Good: Test ID with filter
await expect(page.getByTestId(testIds.settingsHeading).filter({ hasText: 'Marquee' })).toBeVisible();
page.getByTestId(testIds.toastPosition).filter({ hasText: 'Bottom Left' }).click();
```

### 4. Element/ID/Class Selectors

```typescript
// ❌ Bad: Raw CSS selectors
page.locator('button');
page.locator('#title');
page.locator('.step-card');
page.locator('input[type="text"]');

// ✅ Good: Test ID selectors
page.getByTestId(testIds.someButton);
page.getByTestId(testIds.title);
page.getByTestId(testIds.stepCard);
page.getByTestId(testIds.nameInput);
```

## The data-selected Pattern

For any UI element where tests need to verify selection state:

1. **Add to Vue component**: `:data-selected="condition ? 'true' : undefined"`
2. **Add test ID**: `:data-testid="testIds.optionName"`
3. **Assert in test**: `toHaveAttribute('data-selected', 'true')`

Common elements needing this pattern:
- Toggle buttons (theme light/dark, direction left/right)
- Option selectors (card style, position, animation)
- Type selectors (widget type, step type)
- Tab-like elements

## When getByTestId + filter Is Appropriate

Use `.filter({ hasText })` when multiple elements share the same test ID but differ by text content:

```typescript
// Multiple settings headings, differentiated by text
page.getByTestId(testIds.settingsHeading).filter({ hasText: 'Marquee' });

// Multiple position buttons, differentiated by label
page.getByTestId(testIds.toastPosition).filter({ hasText: 'Bottom Left' });
```

This is preferred over unique test IDs per variant because it keeps the test ID namespace clean.

## Missing Test ID Workflow

When a review finds a selector that doesn't use test IDs:

1. Check if a test ID already exists in the constants file
2. If not, add it to the appropriate `*TestIds` object in `src/shared/constants/testIds/`
3. Add `data-testid` to the Vue component
4. If selection state is tested, also add `data-selected`
5. Update the page object to use the new test ID
