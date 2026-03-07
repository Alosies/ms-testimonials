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

## Environment Setup

E2E tests must run reliably across dev, QA, and CI environments. The following environment variables are required.

### API-Side (Backend)

These env vars gate whether E2E fixture routes are registered. If `E2E_API_SECRET` is not set, all `/e2e/*` routes are disabled — this is the production safety mechanism.

| Variable | Required | Description |
|----------|----------|-------------|
| `E2E_API_SECRET` | Yes (32+ chars) | Shared secret for `X-E2E-Token` auth header |
| `E2E_USER_ID` | Yes | Pre-seeded user ID that owns test data |
| `E2E_ORGANIZATION_ID` | Yes | Pre-seeded org ID for tenant isolation |

### Playwright-Side (Test Runner)

| Variable | Default | Description |
|----------|---------|-------------|
| `E2E_BASE_URL` | `http://localhost:4173` (Vite preview) | Frontend URL for browser navigation |
| `E2E_API_URL` | `http://localhost:4000` | API URL for fixture HTTP calls |
| `E2E_API_SECRET` | — | Must match API-side secret |
| `E2E_USER_EMAIL` | Hardcoded default | Login credentials for `authedPage` fixture |
| `E2E_USER_PASSWORD` | Hardcoded default | Login credentials for `authedPage` fixture |

### Per-Environment Configuration

| Variable | Dev (local) | QA | Production |
|----------|------------|-----|------------|
| `E2E_BASE_URL` | `http://localhost:3001` | QA frontend URL | **N/A — never run** |
| `E2E_API_URL` | `http://localhost:4001` | QA API URL | **N/A** |
| `E2E_API_SECRET` | Local dev secret | QA secret | **NOT SET** (routes disabled) |
| `E2E_USER_EMAIL` | Dev test user | QA test user | **N/A** |
| `E2E_USER_PASSWORD` | Dev test user | QA test user | **N/A** |

**Production safety:** E2E routes are completely disabled when `E2E_API_SECRET` is not set (checked by `isE2EConfigured()` in `api/src/features/e2e-support/middleware/e2e.ts`). The route handler returns an empty Hono app — no endpoints are registered.

**Prerequisites per environment:**
1. A dedicated E2E test user must exist (email/password for login)
2. That user must belong to an organization (provides `E2E_ORGANIZATION_ID`)
3. The organization must have the `E2E_USER_ID` as owner

---

## Layer 1: E2E API — Widget Fixtures (Backend)

Widget tests require API-based fixtures for reliable, fast test data creation. Without them, tests depend on UI flows for setup which is slow and fragile — cascading failures from unrelated UI changes can break widget tests. This follows the same pattern established for form fixtures.

### Endpoints Required

| Method | Path | Purpose |
|--------|------|---------|
| `POST /e2e/widgets` | Create a widget with approved testimonials | Primary fixture endpoint |
| `DELETE /e2e/widgets/:id` | Hard-delete a widget and its created testimonials | Cleanup in teardown |

All endpoints are protected by `e2eAuthMiddleware` (validates `X-E2E-Token` header) and use `E2E_USER_ID` / `E2E_ORGANIZATION_ID` from environment.

**Design decision:** Testimonial creation is internal to the widget CRUD — not a separate endpoint. The `POST /e2e/widgets` handler creates approved testimonials, then attaches them to the widget. The `DELETE /e2e/widgets/:id` handler deletes both the widget and the testimonials it created. This keeps the lifecycle simple: the widget fixture owns everything it creates.

---

### API-Side: File Structure

Following the `e2e-support/` resource convention from `CLAUDE.md`:

```
api/src/features/e2e-support/widgets/
├── routes.ts       # HTTP handlers: createWidget, deleteWidget
├── crud.ts         # DB operations: createTestWidget(), deleteTestWidget()
│                   #   internally creates testimonials + junction rows
├── types.ts        # TestWidgetResult, CreateTestWidgetInput
├── constants.ts    # DEFAULT_WIDGET_SETTINGS, MOCK_TESTIMONIALS
└── index.ts        # Barrel exports
```

Testimonial creation is internal to `crud.ts` — no separate `testimonials/` resource needed. The widget fixture owns the full lifecycle: create testimonials → create widget → attach via junction → return IDs. Deletion reverses: delete widget (cascade removes junction rows) → delete testimonials.

---

### API-Side: Types (`widgets/types.ts`)

```typescript
import type { WidgetType } from '@testimonials/core';

/**
 * Input for creating a test widget via E2E API.
 * Mirrors fields from CreateWidgetRequestSchema but simplified.
 */
export interface CreateTestWidgetInput {
  name: string;
  type: WidgetType;
  /** Number of approved testimonials to create and attach (default: 3) */
  testimonialCount?: number;
  /** Override default settings for this type */
  settings?: Record<string, unknown>;
}

/**
 * Result from creating a test widget.
 * Contains all data tests need for assertions.
 */
export interface TestWidgetResult {
  widgetId: string;
  widgetName: string;
  type: WidgetType;
  /** IDs of testimonials created and attached to this widget */
  testimonialIds: string[];
  /** Number of testimonials attached */
  testimonialCount: number;
}
```

**Required DB fields handled by CRUD (not in input):**

| Field | Source | Table |
|-------|--------|-------|
| `organization_id` | `env.E2E_ORGANIZATION_ID` | `widgets`, `testimonials`, `widget_testimonials` |
| `created_by` | `env.E2E_USER_ID` | `widgets` |
| `customer_name` | `MOCK_TESTIMONIALS[i].customer_name` | `testimonials` |
| `customer_email` | `MOCK_TESTIMONIALS[i].customer_email` | `testimonials` |
| `status` | Hardcoded `'approved'` | `testimonials` |
| `display_order` | Sequential `i + 1` | `widget_testimonials` |

---

### API-Side: Constants (`widgets/constants.ts`)

```typescript
import type { WidgetType } from '@testimonials/core';
import {
  marqueeSettingsDefaults,
  ratingBadgeSettingsDefaults,
  avatarsBarSettingsDefaults,
  toastPopupSettingsDefaults,
} from '@testimonials/core';

/**
 * Default settings per widget type for E2E fixtures.
 * Uses the same defaults as the production code.
 */
export const DEFAULT_WIDGET_SETTINGS: Record<WidgetType, Record<string, unknown>> = {
  wall_of_love: {},
  carousel: {},
  single_quote: {},
  marquee: marqueeSettingsDefaults,
  rating_badge: ratingBadgeSettingsDefaults,
  avatars_bar: avatarsBarSettingsDefaults,
  toast_popup: toastPopupSettingsDefaults,
};

/**
 * Mock testimonial data for realistic test fixtures.
 * Rotates through these when creating multiple testimonials.
 *
 * All required DB columns are satisfied:
 * - customer_name: NOT NULL
 * - customer_email: NOT NULL, must match email format check
 * - content: testimonial text
 * - rating: 1-5 (satisfies rating_check constraint)
 */
export const MOCK_TESTIMONIALS = [
  {
    customer_name: 'Alice Johnson',
    customer_email: 'alice@e2e-test.com',
    content: 'This product completely transformed our workflow. Highly recommend!',
    rating: 5,
  },
  {
    customer_name: 'Bob Smith',
    customer_email: 'bob@e2e-test.com',
    content: 'Great experience from start to finish. The support team was incredible.',
    rating: 4,
  },
  {
    customer_name: 'Carol Williams',
    customer_email: 'carol@e2e-test.com',
    content: 'Simple to set up and the results speak for themselves.',
    rating: 5,
  },
  {
    customer_name: 'David Chen',
    customer_email: 'david@e2e-test.com',
    content: 'Exactly what we needed. Clean interface and powerful features.',
    rating: 4,
  },
  {
    customer_name: 'Eva Martinez',
    customer_email: 'eva@e2e-test.com',
    content: 'Been using it for months now. Best decision we made this year.',
    rating: 5,
  },
];
```

---

### API-Side: CRUD Operations (`widgets/crud.ts`)

```typescript
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { env } from '@/shared/config/env';
import { DEFAULT_WIDGET_SETTINGS, MOCK_TESTIMONIALS } from './constants';
import type { CreateTestWidgetInput, TestWidgetResult } from './types';

/**
 * Create a test widget with approved testimonials.
 *
 * Steps:
 * 1. Create approved testimonials (cycling through MOCK_TESTIMONIALS)
 * 2. Create the widget via insert_widgets_one
 * 3. Attach testimonials via widget_testimonials junction table
 * 4. Return result with all created IDs
 *
 * Uses executeGraphQLAsAdmin to bypass RLS.
 *
 * Required DB fields set internally:
 * - widgets: organization_id (env), created_by (env), settings (defaults)
 * - testimonials: organization_id (env), status='approved',
 *   customer_name, customer_email (from MOCK_TESTIMONIALS)
 * - widget_testimonials: organization_id (env),
 *   display_order (sequential: 1, 2, 3...)
 */
export async function createTestWidget(
  input: CreateTestWidgetInput
): Promise<TestWidgetResult> {
  const count = input.testimonialCount ?? 3;
  const testimonialIds: string[] = [];

  // 1. Create approved testimonials
  for (let i = 0; i < count; i++) {
    const mockData = MOCK_TESTIMONIALS[i % MOCK_TESTIMONIALS.length];
    // insert_testimonials_one with:
    //   organization_id: env.E2E_ORGANIZATION_ID
    //   status: 'approved'
    //   customer_name: mockData.customer_name
    //   customer_email: mockData.customer_email
    //   content: mockData.content
    //   rating: mockData.rating
    //   source: 'manual'
    testimonialIds.push(/* created testimonial ID */);
  }

  // 2. Create widget
  // insert_widgets_one with:
  //   organization_id: env.E2E_ORGANIZATION_ID
  //   created_by: env.E2E_USER_ID
  //   name: input.name
  //   type: input.type
  //   settings: input.settings ?? DEFAULT_WIDGET_SETTINGS[input.type]
  //   form_id: null  (org-wide widget, not scoped to a form)
  //   is_active: true
  const widgetId = /* created widget ID */;

  // 3. Attach testimonials via junction table
  // insert_widget_testimonials with:
  //   objects: testimonialIds.map((tid, index) => ({
  //     organization_id: env.E2E_ORGANIZATION_ID,
  //     widget_id: widgetId,
  //     testimonial_id: tid,
  //     display_order: index + 1,    // ← sequential to satisfy unique constraint
  //     added_by: env.E2E_USER_ID,
  //   }))

  // 4. Return result
  return { widgetId, widgetName: input.name, type: input.type, testimonialIds, testimonialCount: count };
}

/**
 * Hard-delete a test widget AND its created testimonials.
 *
 * Deletion order:
 * 1. Fetch testimonial IDs from widget_testimonials junction
 * 2. Delete widget (CASCADE removes junction rows)
 * 3. Delete the testimonials by IDs
 *
 * This ensures no orphaned test data remains in any environment.
 */
export async function deleteTestWidget(widgetId: string): Promise<boolean> {
  // 1. Query widget_testimonials to get testimonial_ids for this widget
  // 2. delete_widgets_by_pk (cascade deletes junction rows)
  // 3. delete_testimonials where id in testimonialIds
  // Returns false if widget not found
}
```

---

### API-Side: Route Handlers (`widgets/routes.ts`)

```typescript
import type { Context } from 'hono';
import { createTestWidget, deleteTestWidget } from './crud';

/**
 * POST /e2e/widgets
 * Create a test widget with approved testimonials for E2E testing.
 *
 * Internally creates testimonials + widget + junction rows.
 * All created data is owned by E2E_USER_ID / E2E_ORGANIZATION_ID.
 *
 * Request body:
 * {
 *   "name": "E2E Marquee Widget",
 *   "type": "marquee",
 *   "testimonialCount": 3,     // optional, default 3
 *   "settings": { ... }        // optional, overrides defaults
 * }
 *
 * Response (201):
 * {
 *   "widgetId": "abc123",
 *   "widgetName": "E2E Marquee Widget",
 *   "type": "marquee",
 *   "testimonialIds": ["t1", "t2", "t3"],
 *   "testimonialCount": 3
 * }
 */
export async function createWidget(c: Context) {
  const body = await c.req.json();
  const { name, type, testimonialCount, settings } = body;

  if (!name || !type) {
    return c.json({ error: 'name and type are required' }, 400);
  }

  const result = await createTestWidget({ name, type, testimonialCount, settings });
  return c.json(result, 201);
}

/**
 * DELETE /e2e/widgets/:id
 * Hard-delete a test widget AND its created testimonials.
 *
 * Ensures no orphaned test data remains in the database.
 *
 * Response (200): { "success": true, "widgetId": "abc123" }
 * Response (404): { "error": "Widget not found" }
 */
export async function deleteWidget(c: Context) {
  const widgetId = c.req.param('id');

  if (!widgetId) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  const deleted = await deleteTestWidget(widgetId);

  if (!deleted) {
    return c.json({ error: 'Widget not found' }, 404);
  }

  return c.json({ success: true, widgetId });
}
```

---

### API-Side: GraphQL Operations Required

Create `.gql` files in `api/src/features/e2e-support/widgets/graphql/`:

| Operation | Mutation | Returns |
|-----------|----------|---------|
| `CreateTestTestimonial` | `insert_testimonials_one` | `id` |
| `CreateTestWidget` | `insert_widgets_one` | `id`, `name`, `type` |
| `InsertWidgetTestimonials` | `insert_widget_testimonials` | `affected_rows` |
| `GetWidgetTestimonialIds` | `widget_testimonials` (query) | `testimonial_id` |
| `DeleteTestWidget` | `delete_widgets_by_pk` | `id` |
| `DeleteTestTestimonials` | `delete_testimonials` (where `id._in`) | `affected_rows` |

These use `executeGraphQLAsAdmin` which bypasses Hasura RLS — same pattern as form fixtures.

---

### API-Side: Route Registration

```typescript
// api/src/routes/e2e.ts — add to createE2ERoutes()

// POST /e2e/widgets - Create test widget with testimonials
app.post('/widgets', createWidget);

// DELETE /e2e/widgets/:id - Delete test widget + its testimonials
app.delete('/widgets/:id', deleteWidget);
```

```typescript
// api/src/features/e2e-support/index.ts — add exports
export { createWidget, deleteWidget } from './widgets';
```

---

### Playwright-Side: Entity Structure

```
apps/web/tests/e2e/entities/widget/
├── types.ts                    # TestWidgetData, CreateWidgetResponse
├── fixtures/
│   ├── widget-api.ts           # createTestWidget(), deleteTestWidget()
│   └── widget-fixtures.ts      # Playwright fixture definitions
└── index.ts                    # Barrel exports
```

### Playwright-Side: Types (`entities/widget/types.ts`)

```typescript
import type { WidgetType } from '@testimonials/core';

/**
 * Response from E2E API widget creation.
 * Mirrors API response shape.
 */
export interface CreateWidgetResponse {
  widgetId: string;
  widgetName: string;
  type: WidgetType;
  testimonialIds: string[];
  testimonialCount: number;
}

/**
 * Full widget data available in test fixtures.
 * Enriched with URLs computed on the Playwright side.
 */
export interface TestWidgetData {
  id: string;
  name: string;
  type: WidgetType;
  /** Builder URL: /{orgSlug}/widgets/{urlSlug} */
  builderUrl: string;
  orgSlug: string;
  /** IDs of testimonials attached to this widget */
  testimonialIds: string[];
  testimonialCount: number;
}
```

### Playwright-Side: Factory Functions (`fixtures/widget-api.ts`)

```typescript
import { testApiRequest } from '../../../shared';
import { createEntityUrlSlug } from '@/shared/urls';
import type { CreateWidgetResponse, TestWidgetData } from '../types';
import type { WidgetType } from '@testimonials/core';

/**
 * Create a test widget via E2E API.
 *
 * Fast path (~200ms) — bypasses UI builder entirely.
 * Creates widget + attaches approved testimonials.
 *
 * @param orgSlug - Organization slug (for building builderUrl)
 * @param options - Widget configuration
 * @returns Full widget data including builder URL
 *
 * @example
 * ```ts
 * const widget = await createTestWidget('my-org', { type: 'marquee' });
 * await page.goto(widget.builderUrl);
 * ```
 */
export async function createTestWidget(
  orgSlug: string,
  options?: {
    type?: WidgetType;          // default: 'wall_of_love'
    name?: string;
    testimonialCount?: number;  // default: 3
    settings?: Record<string, unknown>;
  }
): Promise<TestWidgetData> {
  const widgetName = options?.name || `E2E Widget ${Date.now()}`;
  const widgetType = options?.type || 'wall_of_love';

  const result = await testApiRequest<CreateWidgetResponse>('POST', '/widgets', {
    name: widgetName,
    type: widgetType,
    testimonialCount: options?.testimonialCount ?? 3,
    settings: options?.settings,
  });

  // Build builderUrl using the same URL pattern the app uses
  const urlSlug = createEntityUrlSlug(result.widgetName, result.widgetId);
  const builderUrl = `/${orgSlug}/widgets/${urlSlug}`;

  return {
    id: result.widgetId,
    name: result.widgetName,
    type: result.type,
    builderUrl,
    orgSlug,
    testimonialIds: result.testimonialIds,
    testimonialCount: result.testimonialCount,
  };
}

/**
 * Delete a test widget via E2E API.
 */
export async function deleteTestWidget(widgetId: string): Promise<void> {
  await testApiRequest('DELETE', `/widgets/${widgetId}`);
}
```

### Playwright-Side: Fixtures (`fixtures/widget-fixtures.ts`)

```typescript
import { test as appTest } from '../../../app/fixtures';
import { createTestWidget, deleteTestWidget } from './widget-api';
import type { TestWidgetData } from '../types';

export interface WidgetFixtures {
  /** Widget created via E2E API (fast) — default type: wall_of_love */
  widgetViaApi: TestWidgetData;
  /** Marquee widget via E2E API */
  marqueeWidgetViaApi: TestWidgetData;
  /** Toast popup widget via E2E API */
  toastWidgetViaApi: TestWidgetData;
}

export const test = appTest.extend<WidgetFixtures>({
  widgetViaApi: async ({ orgSlug }, use) => {
    const widget = await createTestWidget(orgSlug);
    await use(widget);
    try {
      await deleteTestWidget(widget.id);
    } catch (error) {
      console.warn(`Failed to cleanup widget ${widget.id}:`, error);
    }
  },

  marqueeWidgetViaApi: async ({ orgSlug }, use) => {
    const widget = await createTestWidget(orgSlug, { type: 'marquee' });
    await use(widget);
    try {
      await deleteTestWidget(widget.id);
    } catch (error) {
      console.warn(`Failed to cleanup marquee widget ${widget.id}:`, error);
    }
  },

  toastWidgetViaApi: async ({ orgSlug }, use) => {
    const widget = await createTestWidget(orgSlug, { type: 'toast_popup' });
    await use(widget);
    try {
      await deleteTestWidget(widget.id);
    } catch (error) {
      console.warn(`Failed to cleanup toast widget ${widget.id}:`, error);
    }
  },
});

export { expect } from '@playwright/test';
```

### Playwright-Side: Usage in Tests

```typescript
// Import widget fixtures instead of base app fixtures
import { test, expect } from '../../entities/widget/fixtures';

test('marquee settings persist after save', async ({ authedPage, marqueeWidgetViaApi }) => {
  // Navigate directly to widget builder — no UI creation needed
  await authedPage.goto(marqueeWidgetViaApi.builderUrl);

  // Widget already has testimonials attached and type set
  // Just modify settings and verify persistence
});
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

/** Assert the selected type option is marked as selected */
async expectTypeSelected(type: WidgetType) {
  const option = page.locator(
    `[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`
  );
  await expect(option).toHaveAttribute('data-selected', 'true');
},

/** Assert the type option is NOT selected */
async expectTypeNotSelected(type: WidgetType) {
  const option = page.locator(
    `[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`
  );
  await expect(option).not.toHaveAttribute('data-selected', 'true');
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

**New data attribute for selection state:**

Add `data-selected` attribute to `WidgetTypeSelector.vue` type option buttons:

```vue
<button
  :data-testid="widgetsTestIds.typeOption"
  :data-widget-type="type.value"
  :data-selected="state.type === type.value ? 'true' : undefined"
  ...
>
```

This decouples test assertions from CSS styling (e.g., `ring-2`) which can change independently.

**Existing test IDs that already work for new types:**
- `widgetsTestIds.typeOption` + `data-widget-type` attribute — already handles all 7 types
- `widgetsTestIds.typeSelector` — wraps all categories
- All existing builder/embed modal IDs remain valid

---

## Layer 4: Test Specs

### Test 1: `focused-tests/widget-types.spec.ts`

**Purpose:** Verify the categorized type selector renders all 7 types correctly.

**Fixtures needed:** None (no saved data — uses `authedPage` and `orgSlug` from base fixtures)

**Test steps:**

```
widget-types.spec.ts
├── 'categorized type selector'
│   ├── Step: navigate to /{orgSlug}/widgets → click "Create Widget" button
│   │   └── Widget builder opens with default type 'wall_of_love'
│   ├── Step: verify 3 category headings visible
│   │   └── Assert: 'Section Widgets', 'Micro Widgets', 'Ambient Widgets'
│   ├── Step: verify 7 type option buttons
│   │   └── Assert: count === 7
│   ├── Step: click each type and verify selection
│   │   ├── Click 'marquee' → assert data-selected="true" on that button
│   │   ├── Click 'rating_badge' → assert data-selected="true"
│   │   ├── Click 'avatars_bar' → assert data-selected="true"
│   │   └── Click 'toast_popup' → assert data-selected="true"
│   └── Step: verify previous selection deselects
│       └── Click 'wall_of_love' → assert 'toast_popup' no longer has data-selected
```

**Estimated duration:** ~5s

---

### Test 2: `focused-tests/widget-type-settings.spec.ts`

**Purpose:** Verify type-specific settings sections show/hide correctly when switching types.

**Fixtures needed:** None (no saved data — uses `authedPage` and `orgSlug` from base fixtures)

**Test steps:**

```
widget-type-settings.spec.ts
├── 'type-specific settings visibility'
│   ├── Step: navigate to /{orgSlug}/widgets → click "Create Widget" → switch to Design tab
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

**Fixtures needed:** `marqueeWidgetViaApi`, `toastWidgetViaApi` (auto-cleanup in teardown)

**Test steps:**

```
widget-type-settings-persistence.spec.ts
├── 'marquee settings persist after save'
│   ├── Fixture: marqueeWidgetViaApi (pre-created via API)
│   ├── Step: navigate to widget builder via builderUrl
│   │   ├── Switch to Design tab
│   │   ├── Set direction to 'right' (click right button)
│   │   └── Set card style to 'full' (click full button)
│   ├── Step: save widget
│   ├── Step: reload page (navigate to builderUrl again)
│   │   ├── Switch to Design tab
│   │   ├── Assert: direction 'right' button is selected (data-selected)
│   │   └── Assert: card style 'full' button is selected (data-selected)
│   └── Teardown: auto-deleted by fixture
│
├── 'toast popup settings persist after save'
│   ├── Fixture: toastWidgetViaApi (pre-created via API)
│   ├── Step: navigate to widget builder via builderUrl
│   │   ├── Switch to Design tab
│   │   ├── Set position to 'top-right' (click top-right button)
│   │   └── Set animation to 'fade' (click fade button)
│   ├── Step: save widget
│   ├── Step: reload page (navigate to builderUrl again)
│   │   ├── Switch to Design tab
│   │   ├── Assert: position 'Top Right' button is selected (data-selected)
│   │   └── Assert: animation 'fade' button is selected (data-selected)
│   └── Teardown: auto-deleted by fixture
```

**Estimated duration:** ~15s (two save/reload cycles, no UI widget creation)

---

### Test 4: `focused-tests/widget-embed-types.spec.ts`

**Purpose:** Verify embed code modal shows correct type attribute and toast guidance note.

**Fixtures needed:** `marqueeWidgetViaApi`, `toastWidgetViaApi` (auto-cleanup in teardown)

**Test steps:**

```
widget-embed-types.spec.ts
├── 'marquee embed code contains correct type'
│   ├── Fixture: marqueeWidgetViaApi (pre-created via API)
│   ├── Step: navigate to widget builder via builderUrl
│   ├── Step: open embed modal
│   │   ├── Assert: embed code contains 'data-testimonials-widget="marquee"'
│   │   ├── Assert: embed code contains '/embed/widgets.js'
│   │   └── Assert: toast placement note NOT visible
│   └── Teardown: auto-deleted by fixture
│
├── 'toast_popup embed code shows placement note'
│   ├── Fixture: toastWidgetViaApi (pre-created via API)
│   ├── Step: navigate to widget builder via builderUrl
│   ├── Step: open embed modal
│   │   ├── Assert: embed code contains 'data-testimonials-widget="toast_popup"'
│   │   └── Assert: toast placement note IS visible (amber callout)
│   └── Teardown: auto-deleted by fixture
```

**Estimated duration:** ~10s

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

### New Files — API (E2E Fixtures)

```
api/src/features/e2e-support/widgets/
├── routes.ts                               # POST /widgets, DELETE /widgets/:id
├── crud.ts                                 # createTestWidget(), deleteTestWidget()
│                                           #   (internally creates/deletes testimonials)
├── types.ts                                # TestWidgetResult, CreateTestWidgetInput
├── constants.ts                            # DEFAULT_WIDGET_SETTINGS, MOCK_TESTIMONIALS
├── graphql/
│   ├── CreateTestTestimonial.gql           # insert_testimonials_one
│   ├── CreateTestWidget.gql               # insert_widgets_one
│   ├── InsertWidgetTestimonials.gql       # insert_widget_testimonials (bulk)
│   ├── GetWidgetTestimonialIds.gql        # query widget_testimonials for cleanup
│   ├── DeleteTestWidget.gql               # delete_widgets_by_pk
│   └── DeleteTestTestimonials.gql         # delete_testimonials where id._in
└── index.ts                                # Barrel exports
```

### New Files — Playwright (Entity + Specs)

```
apps/web/tests/e2e/entities/widget/
├── types.ts                                # TestWidgetData, CreateWidgetResponse
├── fixtures/
│   ├── widget-api.ts                       # createTestWidget(), deleteTestWidget()
│   └── widget-fixtures.ts                  # Playwright fixture definitions
└── index.ts                                # Barrel exports

apps/web/tests/e2e/features/widgets/focused-tests/
├── widget-types.spec.ts                    # Type selection & categories
├── widget-type-settings.spec.ts            # Settings visibility per type
├── widget-type-settings-persistence.spec.ts # Settings save/load roundtrip
└── widget-embed-types.spec.ts              # Embed code per type + toast note
```

### Modified Files

```
api/src/routes/e2e.ts                                     # Register widget routes
api/src/features/e2e-support/index.ts                     # Export new handlers
apps/web/tests/e2e/shared/pages/widgets.page.ts           # Expand selectType(), add helpers
apps/web/tests/e2e/features/widgets/journey-tests/widgets.spec.ts  # Use 'marquee' type
apps/web/src/shared/constants/testIds/widgets.ts           # Add embedToastNote
apps/web/src/features/widgetBuilder/ui/WidgetEmbedModal.vue  # Add data-testid for toast note
apps/web/src/features/widgetBuilder/ui/WidgetTypeSelector.vue  # Add data-selected attribute
```

---

## Implementation Order

| # | Task | Dependencies | Est. Duration |
|---|------|-------------|---------------|
| 1 | **API: Create `e2e-support/widgets/`** — GraphQL operations, crud, types, constants, routes | None | 30 min |
| 2 | **API: Register routes** in `e2e.ts` + exports in `index.ts` | #1 | 5 min |
| 3 | **Playwright: Create `entities/widget/`** — types, widget-api, widget-fixtures | #2 | 15 min |
| 4 | Add `embedToastNote` test ID + apply to WidgetEmbedModal | None | 5 min |
| 5 | Add `data-selected` attribute to WidgetTypeSelector | None | 5 min |
| 6 | Update `widgets.page.ts` — expand `selectType()`, add helpers | #5 | 10 min |
| 7 | Create `widget-types.spec.ts` | #6 | 15 min |
| 8 | Create `widget-type-settings.spec.ts` | #6 | 15 min |
| 9 | Create `widget-type-settings-persistence.spec.ts` | #3, #6 | 20 min |
| 10 | Create `widget-embed-types.spec.ts` | #3, #4, #6 | 15 min |
| 11 | Update journey test to use `marquee` | #6 | 5 min |
| 12 | Run all widget tests, fix failures | #7-11 | Variable |

**Parallelization:**
- Steps 1 (API) and 4-5 (test IDs, data-selected attr) can run in parallel
- Steps 7-8 (no fixtures needed) can start after step 6
- Steps 9-10 (need fixtures) must wait for step 3

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
| API fixture endpoints need GraphQL operations | Create 6 minimal .gql files; reuse existing `executeGraphQLAsAdmin` pattern |
| `widget_testimonials_order_unique` constraint | CRUD sets explicit sequential `display_order: index + 1` |
| Testimonial data not seeded before widget creation | Widget CRUD creates testimonials first, then widget, then junction rows (ordered) |
| Orphaned test data in QA/dev environments | `DELETE /e2e/widgets/:id` deletes widget + its testimonials (full cleanup) |
| Type selection assertion coupled to CSS | Use `data-selected` attribute instead of `ring-2` class check |
| Type-specific settings selectors are fragile | Use text-based selectors matching visible labels |
| Toast popup preview is non-interactive | Only assert visibility, don't test toast timing |
| Journey test change could cause regression | Only change the type, keep all other steps identical |
| New tests increase CI time | Tests are fast with API fixtures (~40s total for 4 specs) |
| E2E routes accidentally active in production | Gated by `isE2EConfigured()` — requires `E2E_API_SECRET` env var |

---

## Acceptance Criteria

### API Fixtures
- [ ] `POST /e2e/widgets` creates approved testimonials + widget + junction rows in one call
- [ ] `DELETE /e2e/widgets/:id` deletes widget AND its created testimonials (no orphaned data)
- [ ] Junction rows have sequential `display_order` (no unique constraint violation)
- [ ] All required DB fields set correctly (`organization_id`, `created_by`, `status='approved'`, etc.)
- [ ] Widget fixtures follow `e2e-support/` folder convention (routes, crud, types, constants, index)

### Playwright Entity
- [ ] `entities/widget/` entity created with types, fixtures, and barrel exports
- [ ] `widgetViaApi`, `marqueeWidgetViaApi`, `toastWidgetViaApi` fixtures work with auto-cleanup
- [ ] Fixtures pass in all configured environments (dev, QA)

### UI Changes
- [ ] `data-selected` attribute added to `WidgetTypeSelector.vue` type option buttons
- [ ] `data-testid` added to toast embed note in `WidgetEmbedModal.vue`

### Test Specs
- [ ] Page object supports all 7 widget types in `selectType()`
- [ ] `widget-types.spec.ts` — 7 types visible in 3 categories, selection works
- [ ] `widget-type-settings.spec.ts` — correct settings section appears per type
- [ ] `widget-type-settings-persistence.spec.ts` — marquee and toast settings survive save/reload
- [ ] `widget-embed-types.spec.ts` — embed code has correct type, toast note visible
- [ ] Journey test updated to cover `marquee` type

### Quality
- [ ] All existing widget tests still pass (no regressions)
- [ ] All new tests pass in headless mode
- [ ] `pnpm test:e2e` passes with no failures
