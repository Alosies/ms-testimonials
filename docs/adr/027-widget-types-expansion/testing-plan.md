# ADR-027: Widget Types Expansion — E2E Testing Plan

| Field | Value |
|-------|-------|
| **ADR** | [027-widget-types-expansion](./adr.md) |
| **Implementation** | [implementation-plan.md](./implementation-plan.md) |
| **Status** | Draft |
| **Created** | 2026-03-07 |
| **Phase** | 5 (E2E Tests & Polish) |

---

## Overview

This document details the E2E testing strategy for the 4 new widget types added in ADR-027: `marquee`, `rating_badge`, `avatars_bar`, and `toast_popup`. It covers test data fixtures, page object updates, test specs, and test IDs needed.

### What Needs E2E Testing

| Area | Reason |
|------|--------|
| Type selection & categories | New categorized layout with 7 types in 3 groups |
| Type-specific settings | 4 new settings sections render per type, values persist after save |
| Preview rendering | Each type shows its preview in the builder |
| Embed code generation | Embed modal shows correct `data-testimonials-widget` attribute per type |
| Toast popup embed note | Placement guidance note appears only for toast_popup |

### What Does NOT Need E2E Testing

| Area | Why |
|------|-----|
| Embed script rendering | Vanilla TS in `widget-embed` package — unit test territory |
| API aggregates computation | Tested via API integration tests |
| Zod schema validation | Tested via unit tests in `@testimonials/core` |
| Shadow DOM isolation | Already covered by existing widget E2E tests |

---

## Layer 1: E2E API — Widget Fixtures (Backend)

### Decision: Skip API Fixtures for Now

The existing widget journey test creates widgets through the UI builder and deletes via the delete button. For the new focused tests:

- **Tests 1-2** (type selection, settings visibility) don't need fixtures — they open the builder and interact without saving
- **Tests 3-4** (persistence, embed code) create widgets via UI, verify, and clean up via UI — same pattern as the existing journey test

**Recommendation:** Skip building `POST /e2e/widgets` API fixtures initially. If tests become too slow (>5s per widget creation via UI), revisit and add API fixtures following the form fixture pattern.

### Future API Fixture Design (If Needed)

If we later decide to add API-based widget fixtures:

```
api/src/features/e2e-support/widgets/
├── routes.ts       # POST /widgets (create), DELETE /widgets/:id
├── crud.ts         # createTestWidget(), deleteTestWidget()
├── types.ts        # CreateWidgetRequest, CreateWidgetResponse
├── constants.ts    # Default widget configs per type
└── index.ts
```

**Fixture interface:**
```typescript
interface TestWidgetData {
  id: string;
  name: string;
  type: WidgetType;
  builderUrl: string;   // /{orgSlug}/widgets/{id}
  orgSlug: string;
  testimonialCount: number;
}
```

**Factory function:**
```typescript
async function createTestWidget(orgSlug: string, options?: {
  type?: WidgetType;          // default: 'wall_of_love'
  name?: string;
  testimonialCount?: number;  // default: 3
}): Promise<TestWidgetData>
```

**Registration in E2E routes:**
```typescript
// api/src/routes/e2e.ts
app.post('/widgets', createWidget);
app.delete('/widgets/:id', deleteWidget);
```

---

## Layer 2: Page Object Updates

### File: `apps/web/tests/e2e/shared/pages/widgets.page.ts`

**Current limitation:** `selectType()` only accepts 3 types.

**Changes needed:**

```typescript
// BEFORE
async selectType(type: 'wall_of_love' | 'carousel' | 'single_quote') {

// AFTER — expand to all 7 types
async selectType(type: WidgetType) {
  await page.locator(
    `[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`
  ).click();
},
```

**New helper methods:**

```typescript
/** Get the visible type-specific settings section */
getTypeSettingsHeading(label: string): Locator {
  return page.getByText(label, { exact: true });
},

/** Assert a type category heading is visible */
async expectCategoryVisible(categoryLabel: string) {
  await expect(page.getByText(categoryLabel)).toBeVisible();
},

/** Count type option buttons */
async expectTypeOptionCount(count: number) {
  await expect(
    page.getByTestId(widgetsTestIds.typeOption)
  ).toHaveCount(count);
},

/** Assert the selected type option has ring highlight */
async expectTypeSelected(type: WidgetType) {
  const option = page.locator(
    `[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`
  );
  await expect(option).toHaveClass(/ring-2/);
},
```

---

## Layer 3: Test IDs

### New Test IDs Needed

Add to `apps/web/src/shared/constants/testIds/widgets.ts`:

```typescript
// Toast embed guidance note
embedToastNote: 'widget-embed-toast-note',
```

**Note:** Type-specific settings sections do NOT need dedicated test IDs — they can be located by their heading text (e.g., "Marquee Settings", "Toast Popup Settings") which is more readable and maintainable.

**Existing test IDs that already work for new types:**
- `widgetsTestIds.typeOption` + `data-widget-type` attribute — already handles all 7 types
- `widgetsTestIds.typeSelector` — wraps all categories
- All existing builder/embed modal IDs remain valid

---

## Layer 4: Test Specs

### Test 1: `focused-tests/widget-types.spec.ts`

**Purpose:** Verify the categorized type selector renders all 7 types correctly.

**Fixtures needed:** None (no saved data)

**Test steps:**

```
widget-types.spec.ts
├── 'categorized type selector'
│   ├── Step: navigate to widget builder
│   ├── Step: verify 3 category headings visible
│   │   └── Assert: 'Section Widgets', 'Micro Widgets', 'Ambient Widgets'
│   ├── Step: verify 7 type option buttons
│   │   └── Assert: count === 7
│   ├── Step: click each type and verify selection
│   │   ├── Click 'marquee' → assert ring class on that button
│   │   ├── Click 'rating_badge' → assert ring class
│   │   ├── Click 'avatars_bar' → assert ring class
│   │   └── Click 'toast_popup' → assert ring class
│   └── Step: verify previous selection deselects
│       └── Click 'wall_of_love' → assert 'toast_popup' no longer has ring class
```

**Estimated duration:** ~5s

---

### Test 2: `focused-tests/widget-type-settings.spec.ts`

**Purpose:** Verify type-specific settings sections show/hide correctly when switching types.

**Fixtures needed:** None (no saved data)

**Test steps:**

```
widget-type-settings.spec.ts
├── 'type-specific settings visibility'
│   ├── Step: navigate to builder, switch to Design tab
│   ├── Step: select 'marquee'
│   │   └── Assert: 'Marquee Settings' heading visible
│   │   └── Assert: direction, card style, pause on hover, speed controls visible
│   ├── Step: select 'rating_badge'
│   │   └── Assert: 'Marquee Settings' heading hidden
│   │   └── Assert: 'Rating Badge Settings' heading visible
│   │   └── Assert: style, show average, show count, link URL visible
│   ├── Step: select 'avatars_bar'
│   │   └── Assert: 'Rating Badge Settings' heading hidden
│   │   └── Assert: 'Avatars Bar Settings' heading visible
│   │   └── Assert: size, max avatars, overlap, show rating, label controls visible
│   ├── Step: select 'toast_popup'
│   │   └── Assert: 'Avatars Bar Settings' heading hidden
│   │   └── Assert: 'Toast Popup Settings' heading visible
│   │   └── Assert: position, animation, dismiss, duration, delay, interval, max controls visible
│   └── Step: select 'wall_of_love' (original type)
│       └── Assert: no type-specific settings heading visible
│       └── Assert: generic display options still visible (theme, show_ratings, etc.)
```

**Estimated duration:** ~8s

---

### Test 3: `focused-tests/widget-type-settings-persistence.spec.ts`

**Purpose:** Verify type-specific settings persist after save and are loaded on edit.

**Fixtures needed:** None (creates and deletes via UI)

**Test steps:**

```
widget-type-settings-persistence.spec.ts
├── 'marquee settings persist after save'
│   ├── Step: create marquee widget
│   │   ├── Fill name, select 'marquee' type
│   │   ├── Switch to Design tab
│   │   ├── Set direction to 'right' (click right button)
│   │   └── Set card style to 'full' (click full button)
│   ├── Step: save and navigate back to list
│   ├── Step: reopen widget for editing
│   │   ├── Switch to Design tab
│   │   ├── Assert: direction 'right' button has ring class
│   │   └── Assert: card style 'full' button has ring class
│   └── Step: cleanup — delete widget from list
│
├── 'toast popup settings persist after save'
│   ├── Step: create toast_popup widget
│   │   ├── Fill name, select 'toast_popup' type
│   │   ├── Switch to Design tab
│   │   ├── Set position to 'top-right' (click top-right button)
│   │   └── Set animation to 'fade' (click fade button)
│   ├── Step: save and navigate back to list
│   ├── Step: reopen widget for editing
│   │   ├── Switch to Design tab
│   │   ├── Assert: position 'Top Right' button has ring class
│   │   └── Assert: animation 'fade' button has ring class
│   └── Step: cleanup — delete widget from list
```

**Estimated duration:** ~25s (two save/reload cycles)

---

### Test 4: `focused-tests/widget-embed-types.spec.ts`

**Purpose:** Verify embed code modal shows correct type attribute and toast guidance note.

**Fixtures needed:** None (creates and deletes via UI)

**Test steps:**

```
widget-embed-types.spec.ts
├── 'embed code contains correct widget type for new types'
│   ├── Step: create and save a 'marquee' widget
│   ├── Step: open embed modal
│   │   ├── Assert: embed code contains 'data-testimonials-widget="marquee"'
│   │   ├── Assert: embed code contains '/embed/widgets.js'
│   │   └── Assert: toast placement note NOT visible
│   ├── Step: close modal, delete widget, cleanup
│   │
│   ├── Step: create and save a 'toast_popup' widget
│   ├── Step: open embed modal
│   │   ├── Assert: embed code contains 'data-testimonials-widget="toast_popup"'
│   │   └── Assert: toast placement note IS visible (amber callout)
│   └── Step: close modal, delete widget, cleanup
```

**Estimated duration:** ~20s

---

### Existing Tests: Update Journey Test

**File:** `features/widgets/journey-tests/widgets.spec.ts`

**Change:** Update the journey to use a new widget type (`marquee`) instead of `carousel` to get smoke-level coverage of a new type in the `@smoke` suite.

**Minimal change:**
```typescript
// Step 3: Configure widget settings
await widgets.selectType('marquee');  // was 'carousel'

// Step 5: Verify embed code
expect(codeText).toContain('data-testimonials-widget="marquee"');  // was 'carousel'

// Step 6: Verify type badge
await expect(...widgetCardType).toContainText('Marquee');  // was 'Carousel'
```

This gives free coverage of at least one new type in the smoke pipeline.

---

## File Structure Summary

### New Files

```
apps/web/tests/e2e/features/widgets/focused-tests/
├── widget-types.spec.ts                    # Type selection & categories
├── widget-type-settings.spec.ts            # Settings visibility per type
├── widget-type-settings-persistence.spec.ts # Settings save/load roundtrip
└── widget-embed-types.spec.ts              # Embed code per type + toast note
```

### Modified Files

```
apps/web/tests/e2e/shared/pages/widgets.page.ts          # Expand selectType(), add helpers
apps/web/tests/e2e/features/widgets/journey-tests/widgets.spec.ts  # Use 'marquee' type
apps/web/src/shared/constants/testIds/widgets.ts          # Add embedToastNote
apps/web/src/features/widgetBuilder/ui/WidgetEmbedModal.vue  # Add data-testid for toast note
```

---

## Implementation Order

| # | Task | Dependencies | Est. Duration |
|---|------|-------------|---------------|
| 1 | Add `embedToastNote` test ID + apply to WidgetEmbedModal | None | 5 min |
| 2 | Update `widgets.page.ts` — expand `selectType()`, add helpers | None | 10 min |
| 3 | Create `widget-types.spec.ts` | #2 | 15 min |
| 4 | Create `widget-type-settings.spec.ts` | #2 | 15 min |
| 5 | Create `widget-type-settings-persistence.spec.ts` | #2 | 20 min |
| 6 | Create `widget-embed-types.spec.ts` | #1, #2 | 15 min |
| 7 | Update journey test to use `marquee` | #2 | 5 min |
| 8 | Run all widget tests, fix failures | #3-7 | Variable |

**Parallelization:** Steps 3-6 can be written in parallel after step 2 completes.

---

## Selector Strategy

### Type Selection (Existing Pattern)

Uses the two-attribute pattern already established:

```html
<button data-testid="widget-type-option" data-widget-type="marquee">
```

```typescript
// Select specific type
page.locator('[data-testid="widget-type-option"][data-widget-type="marquee"]')
```

### Settings Sections (Text-Based)

Type-specific settings sections use heading text for location:

```typescript
// Locate by heading text — readable and stable
page.getByText('Marquee Settings', { exact: true })
page.getByText('Toast Popup Settings', { exact: true })
```

### Settings Controls (Label-Based)

Individual controls within settings sections are located by their label text:

```typescript
// Marquee direction buttons
page.getByText('Direction').locator('..').getByRole('button', { name: 'right' })

// Toast position grid
page.getByRole('button', { name: 'Top Right' })

// Toggles (existing pattern with Switch component)
page.getByText('Pause on hover').locator('..').locator('[role="switch"]')
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Settings persistence tests are slow (UI save/reload) | Accept for now; add API fixtures later if needed |
| Type-specific settings selectors are fragile | Use text-based selectors matching visible labels |
| Toast popup preview is non-interactive | Only assert visibility, don't test toast timing |
| Journey test change could cause regression | Only change the type, keep all other steps identical |
| New tests increase CI time | Tests are independent and short (~60s total for 4 specs) |

---

## Acceptance Criteria

- [ ] Page object supports all 7 widget types in `selectType()`
- [ ] `widget-types.spec.ts` — 7 types visible in 3 categories, selection works
- [ ] `widget-type-settings.spec.ts` — correct settings section appears per type
- [ ] `widget-type-settings-persistence.spec.ts` — marquee and toast settings survive save/reload
- [ ] `widget-embed-types.spec.ts` — embed code has correct type, toast note visible
- [ ] Journey test updated to cover `marquee` type
- [ ] All existing widget tests still pass (no regressions)
- [ ] All new tests pass in headless mode
- [ ] `pnpm test:e2e` passes with no failures
