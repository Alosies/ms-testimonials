# Wait Patterns & Data-Load Guards

Reference for reviewing wait strategies in E2E tests. Arbitrary timeouts are always a code smell.

## Condition-Based Waits (Correct)

Always wait for a specific condition with an upper-bound timeout:

```typescript
// Wait for element state
await expect(button).toBeEnabled({ timeout: 10000 });
await expect(element).toBeVisible({ timeout: 5000 });
await expect(input).not.toHaveValue('', { timeout: 10000 });

// Wait for element to appear/disappear
await modal.waitFor({ timeout: 5000 });
await modal.waitFor({ state: 'hidden', timeout: 5000 });

// Wait for URL change
await page.waitForURL(/\/widgets\//, { timeout: 10000 });

// Wait for network
await page.waitForResponse(resp => resp.url().includes('/api/widgets'), { timeout: 10000 });

// Race conditions (first one wins)
await Promise.race([
  listPage.waitFor({ timeout: 10000 }),
  emptyState.waitFor({ timeout: 10000 }),
]).catch(() => {});
```

## Arbitrary Timeouts (Anti-Pattern)

```typescript
// ❌ Bad: Arbitrary timeout
await page.waitForTimeout(1000);
await page.waitForTimeout(2000);

// ❌ Bad: Sleep after save
await saveButton.click();
await page.waitForTimeout(1000);  // "wait for save to complete"

// ✅ Good: Condition-based wait after save
await saveButton.click();
await expect(saveButton).toBeEnabled({ timeout: 10000 });
```

**Only acceptable use of waitForTimeout**: When testing time-dependent behavior like animations or debounce, and even then prefer animation-end events or condition checks.

## Data-Load Guards

When navigating to a page that loads data from an API (especially fixture-created data), always wait for the data to populate before interacting.

### The Problem

```typescript
// ❌ Bad: Navigates to fixture URL, immediately interacts
await page.goto(widgetUrl);
await widgets.selectType('marquee');  // Widget data not loaded yet!
// Type selector resets when data loads, test fails
```

### The Solution

```typescript
// ✅ Good: Wait for data to populate before interacting
await page.goto(widgetUrl);
await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
// Now the widget data has loaded from API
await widgets.selectType('marquee');
```

### When Data-Load Guards Are Needed

| Scenario | Guard |
|----------|-------|
| Navigate to fixture-created entity | `not.toHaveValue('')` on a populated field |
| Navigate to list page | `waitFor` on list or empty state |
| After save + navigate back | `waitFor` on expected element |
| After delete + navigate | `waitFor` on updated list |

### Common Guard Patterns

```typescript
// Widget builder - wait for name to load
await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });

// List page - wait for either list or empty state
await Promise.race([
  listPage.waitFor({ timeout: 10000 }),
  emptyState.waitFor({ timeout: 10000 }),
]).catch(() => {});

// Form studio - wait for canvas to render
await expect(studio.canvas).toBeVisible({ timeout: 10000 });
```

## Save Operation Waits

After clicking save, wait for the operation to complete:

```typescript
// ✅ Good: Button disables during save, re-enables when done
await saveButton.click();
await expect(saveButton).toBeEnabled({ timeout: 10000 });

// ✅ Good: Toast notification appears
await saveButton.click();
await expect(page.getByTestId(testIds.successToast)).toBeVisible({ timeout: 5000 });

// ❌ Bad: Arbitrary wait
await saveButton.click();
await page.waitForTimeout(1000);
```

## Navigation Waits

After navigation actions, wait for the destination to be ready:

```typescript
// ✅ Good: Wait for destination page
await navLink.click();
await builderPage.waitFor({ timeout: 10000 });

// ✅ Good: Wait for URL pattern
await listItem.click();
await page.waitForURL(/\/widgets\/\w+/, { timeout: 10000 });
```
