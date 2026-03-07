# ADR-027: Widget Types Expansion — Implementation Plan

| Field | Value |
|-------|-------|
| **ADR** | [027-widget-types-expansion](./adr.md) |
| **Status** | Complete |
| **Created** | 2026-02-23 |
| **Prerequisite** | ADR-024 (Widgets v1) must be implemented first |
| **Scope** | DB migration → entity types → embed components → builder UI → E2E tests |

---

## Current State

| Component | Status | Details |
|-----------|--------|---------|
| `widgets` table | DONE | `type` CHECK: all 7 types |
| `settings` JSONB column | DONE | Type-specific config for all 7 types |
| Widget entity types | DONE | `WidgetType` union includes all 7 types |
| Embed renderer | DONE | `renderer.ts` dispatches all 7 types |
| Embed components | DONE | All 7 components exist |
| Widget builder type selector | DONE | 3 categories: Section, Micro, Ambient |
| Widget builder settings panel | DONE | Type-specific settings for all 7 types |
| Widget builder preview | DONE | Preview components for all 7 types |
| New type DB support | DONE | CHECK constraint expanded to 7 types |
| New type entity models | DONE | Settings interfaces for all 4 new types |
| New type embed components | DONE | `Marquee.ts`, `RatingBadge.ts`, `AvatarsBar.ts`, `ToastPopup.ts` |
| New type builder UI | DONE | Category grouping, settings, previews for all new types |

---

## Phase 1: Data Layer

> **Goal:** Expand the database to accept new widget types and update all TypeScript types.

### Step 1.1 — Expand widget type CHECK constraint

**Skill:** `/hasura-migrations`

**Files:**
- CREATE: `db/hasura/migrations/default/XXXXXX__widgets__expand_type_check/up.sql`
- CREATE: `db/hasura/migrations/default/XXXXXX__widgets__expand_type_check/down.sql`

**Details:**
- Drop existing `widgets_type_check` constraint
- Recreate with all 7 types: `wall_of_love`, `carousel`, `single_quote`, `marquee`, `rating_badge`, `avatars_bar`, `toast_popup`
- Update column comment to document all types
- `down.sql` restores the original 3-type constraint (only safe if no rows use new types)

```sql
-- up.sql
ALTER TABLE public.widgets
  DROP CONSTRAINT IF EXISTS widgets_type_check;

ALTER TABLE public.widgets
  ADD CONSTRAINT widgets_type_check
  CHECK (type IN (
    'wall_of_love',
    'carousel',
    'single_quote',
    'marquee',
    'rating_badge',
    'avatars_bar',
    'toast_popup'
  ));

COMMENT ON COLUMN public.widgets.type IS
  'Layout type: wall_of_love (grid), carousel (slider), single_quote (featured), marquee (auto-scroll strip), rating_badge (compact rating), avatars_bar (hero social proof), toast_popup (floating notification)';
```

**Dependencies:** None

---

### Step 1.2 — Update Hasura metadata (if needed)

**Skill:** `/hasura-permissions`

**Files:**
- VERIFY: `db/hasura/metadata/databases/default/tables/public_widgets.yaml`

**Details:**
- Check if Hasura metadata has any enum-like constraint on the `type` column
- If yes, update the allowed values list to include the 4 new types
- If Hasura only relies on the DB CHECK constraint (likely), no metadata changes needed
- Verify existing permissions (select, insert, update) don't restrict the `type` column values

**Dependencies:** 1.1

---

### Step 1.3 — Update entity `WidgetType` and settings interfaces

**Skill:** `/graphql-code` (for codegen after type changes)

**Files:**
- MODIFY: `apps/web/src/entities/widget/models/index.ts`

**Details:**
- Expand `WidgetType` union:
  ```typescript
  export type WidgetType =
    | 'wall_of_love'
    | 'carousel'
    | 'single_quote'
    | 'marquee'
    | 'rating_badge'
    | 'avatars_bar'
    | 'toast_popup';
  ```
- Add new settings interfaces:
  ```typescript
  export interface MarqueeSettings {
    speed: number;                    // default: 30 (px/sec)
    direction: 'left' | 'right';     // default: 'left'
    pause_on_hover: boolean;          // default: true
    card_style: 'compact' | 'full';  // default: 'compact'
  }

  export interface RatingBadgeSettings {
    style: 'inline' | 'card';        // default: 'card'
    show_count: boolean;              // default: true
    show_average: boolean;            // default: true
    link_to_wall: string | null;      // default: null
  }

  export interface AvatarsBarSettings {
    max_avatars: number;              // default: 5
    overlap_px: number;               // default: 8
    size: 'small' | 'medium' | 'large'; // default: 'medium'
    label_template: string;           // default: 'Trusted by {count} happy customers'
    show_rating: boolean;             // default: true
  }

  export interface ToastPopupSettings {
    position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'; // default: 'bottom-left'
    display_duration: number;         // default: 8000 (ms)
    rotation_interval: number;        // default: 15000 (ms)
    delay_before_first: number;       // default: 3000 (ms)
    max_per_session: number;          // default: 5
    show_dismiss: boolean;            // default: true
    animate_in: 'slide' | 'fade';    // default: 'slide'
  }
  ```
- Update the unified `WidgetSettings` discriminated union (or record) to include new types
- Run `pnpm codegen:web` if GraphQL schema exposes the type enum

**Dependencies:** 1.1 (types should match DB constraint)

---

### Step 1.4 — Update API Zod schemas for widget settings

**Skill:** `/api-creator`

**Files:**
- MODIFY: `api/src/features/widgets/schemas/widget.ts` (or wherever Zod schemas live)

**Details:**
- Add Zod schemas for each new settings type:
  ```typescript
  const marqueeSettingsSchema = z.object({
    speed: z.number().min(5).max(200).default(30),
    direction: z.enum(['left', 'right']).default('left'),
    pause_on_hover: z.boolean().default(true),
    card_style: z.enum(['compact', 'full']).default('compact'),
  });

  const ratingBadgeSettingsSchema = z.object({
    style: z.enum(['inline', 'card']).default('card'),
    show_count: z.boolean().default(true),
    show_average: z.boolean().default(true),
    link_to_wall: z.string().url().nullable().default(null),
  });

  const avatarsBarSettingsSchema = z.object({
    max_avatars: z.number().min(1).max(20).default(5),
    overlap_px: z.number().min(0).max(24).default(8),
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    label_template: z.string().max(200).default('Trusted by {count} happy customers'),
    show_rating: z.boolean().default(true),
  });

  const toastPopupSettingsSchema = z.object({
    position: z.enum(['bottom-left', 'bottom-right', 'top-left', 'top-right']).default('bottom-left'),
    display_duration: z.number().min(2000).max(30000).default(8000),
    rotation_interval: z.number().min(5000).max(60000).default(15000),
    delay_before_first: z.number().min(0).max(30000).default(3000),
    max_per_session: z.number().min(1).max(50).default(5),
    show_dismiss: z.boolean().default(true),
    animate_in: z.enum(['slide', 'fade']).default('slide'),
  });
  ```
- Update the `widgetTypeSchema` enum to include `'marquee' | 'rating_badge' | 'avatars_bar' | 'toast_popup'`
- Update the discriminated settings validator to select schema by widget type

**Dependencies:** 1.1

---

### Step 1.5 — Update public widget endpoint for aggregate data

**Skill:** `/api-creator`

**Files:**
- MODIFY: `api/src/features/widgets/handlers/getPublicWidget.ts`

**Details:**
- For `rating_badge` type: compute `average_rating` and `total_count` from selected testimonials (or all approved if none selected) and include in response
- For `avatars_bar` type: include `avatar_url` (or initials data) and `total_count` in response
- For `toast_popup` type: include full testimonial data (same as carousel/wall) for rotation
- For `marquee` type: include full testimonial data (same as carousel) for continuous scroll
- Existing types (`wall_of_love`, `carousel`, `single_quote`) remain unchanged

**Dependencies:** 1.4

---

### Phase 1 Acceptance Criteria

- [x] DB migration applied: 7-type CHECK constraint on `widgets.type`
- [x] `WidgetType` union in entity models includes all 7 types
- [x] Settings interfaces defined for all 4 new types
- [x] API Zod schemas validate new widget type settings
- [x] Public endpoint returns aggregate data for badge/avatars types
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes

---

## Phase 2: Embed Script — Micro-Widgets (Marquee, Rating Badge, Avatars Bar)

> **Goal:** Build the 3 micro-widget embed components. These are inline widgets (same rendering paradigm as existing types).

### Step 2.1 — Rating Badge embed component

**Files:**
- CREATE: `packages/widget-embed/src/components/RatingBadge.ts`

**Details:**
- Simplest new component — no testimonial cards, just aggregate data
- Renders: star icons + average rating number + total count text
- Two styles: `inline` (single line) and `card` (with border/background)
- Optional link wrapping the badge (if `link_to_wall` set)
- Respects theme (light/dark) via CSS custom properties
- "Powered by" badge below in compact form
- Target: < 2KB component size

**Implementation:**
```
┌──────────────────────────────┐     ★★★★★  4.8/5 from 47 reviews
│  ⭐ 4.8  •  47 reviews       │     (inline style)
│  Powered by Testimonials     │
└──────────────────────────────┘
(card style)
```

**Dependencies:** 1.5 (public endpoint must return aggregate data)

---

### Step 2.2 — Avatars Bar embed component

**Files:**
- CREATE: `packages/widget-embed/src/components/AvatarsBar.ts`

**Details:**
- Renders overlapping circular avatars (images or initials fallback)
- "+N more" text after `max_avatars` count
- Label text below using `label_template` with `{count}` interpolation
- Optional aggregate rating display below avatars
- Responsive: stack vertically on very narrow containers
- Use `border-radius: 50%` and negative margin for overlap effect
- Handle missing avatar images gracefully (generate initials with background color)

**Implementation:**
```
[😊][😊][😊][😊][😊] +42 more
★★★★★  Trusted by 47 happy customers
```

**Dependencies:** 1.5

---

### Step 2.3 — Marquee embed component

**Files:**
- CREATE: `packages/widget-embed/src/components/Marquee.ts`
- CREATE: `packages/widget-embed/src/styles/marquee.css`

**Details:**
- Continuous horizontal scroll using CSS `@keyframes` animation (`translateX`)
- Duplicate the testimonial set for seamless infinite loop (append clone)
- Two card styles:
  - `compact`: single-line — stars + truncated quote + "— Name"
  - `full`: mini testimonial cards with avatar, name, company, truncated quote
- `pause_on_hover`: toggle `animation-play-state: paused` on hover
- `direction`: `left` (default) or `right` — reverse animation direction
- `speed` maps to `animation-duration` (lower = faster)
- Use `will-change: transform` for GPU acceleration
- No JavaScript animation loop — pure CSS for performance

**Key CSS pattern:**
```css
.marquee-track {
  display: flex;
  animation: marquee-scroll var(--duration) linear infinite;
  will-change: transform;
}
.marquee-track:hover {
  animation-play-state: paused; /* when pause_on_hover */
}
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

**Dependencies:** 1.5

---

### Step 2.4 — Register new types in renderer

**Files:**
- MODIFY: `packages/widget-embed/src/renderer.ts`

**Details:**
- Add `marquee`, `rating_badge`, `avatars_bar` to the type→component dispatch map
- Import new component modules
- No changes to Shadow DOM setup — same isolation applies

**Dependencies:** 2.1, 2.2, 2.3

---

### Phase 2 Acceptance Criteria

- [x] Rating Badge renders aggregate stars + count in both `inline` and `card` styles
- [x] Avatars Bar renders overlapping avatars with count and label text
- [x] Marquee scrolls continuously with pause-on-hover, both directions
- [x] All 3 components respect theme (light/dark)
- [x] All 3 components render inside Shadow DOM isolation
- [x] `renderer.ts` dispatches to new components correctly
- [x] Embed bundle size still < 35KB gzipped (allow modest increase from 30KB baseline)
- [x] Components work in Chrome, Firefox, Safari, Edge (latest)

---

## Phase 3: Embed Script — Toast Popup (Ambient Widget)

> **Goal:** Build the toast popup, which has a fundamentally different rendering paradigm (overlay, not inline).

### Step 3.1 — Toast Popup embed component

**Files:**
- CREATE: `packages/widget-embed/src/components/ToastPopup.ts`
- CREATE: `packages/widget-embed/src/styles/toast.css`

**Details:**
- **Different rendering model:** Does NOT render inside the target `<div>`. Instead:
  1. Target div is used only as a script hook (remains invisible)
  2. Component appends a fixed-position overlay to the Shadow DOM host
  3. Overlay sits in a corner of the viewport (`position: fixed`)
- **Rotation logic:**
  - Wait `delay_before_first` ms after page load
  - Show first testimonial for `display_duration` ms
  - Hide (animate out), wait `rotation_interval - display_duration` ms
  - Show next testimonial
  - Stop after `max_per_session` testimonials (track via `sessionStorage`)
- **Dismiss behavior:**
  - Close button (×) hides current toast
  - Optionally: dismiss permanently for session (set sessionStorage flag)
- **Animation:**
  - `slide`: slide in from edge of screen
  - `fade`: opacity transition
- **Click behavior:** Clicking the testimonial text could open a link (optional, future)
- **Content per toast:**
  - Star rating (if `show_ratings`)
  - Truncated quote text (2-3 lines max)
  - Customer name + company (if `show_company`)
  - Avatar (if `show_avatar`)

**Key implementation concerns:**
- `z-index` management: use a high but not max value (e.g., `999999`)
- Don't block user interaction with the page
- Respect `prefers-reduced-motion` media query — disable animations if set

**Dependencies:** 1.5

---

### Step 3.2 — Update loader for overlay widgets

**Files:**
- MODIFY: `packages/widget-embed/src/loader.ts`

**Details:**
- Add branching logic: when widget type is `toast_popup`, don't render inline
- Instead, create a separate container element for the overlay
- The target `<div>` gets `display: none` applied (or is used as data-only)
- The overlay container is appended outside the target's DOM position
- Handle cleanup: if the target div is removed, clean up the overlay too

**Dependencies:** 3.1

---

### Phase 3 Acceptance Criteria

- [x] Toast popup appears as fixed-position overlay in configured corner
- [x] Testimonials rotate at configured intervals
- [x] Session tracking limits toasts per page visit via `sessionStorage`
- [x] Dismiss button works (hides current toast)
- [x] Slide and fade animations work
- [x] `prefers-reduced-motion` disables animations
- [x] Toast doesn't block page interaction (click-through on overlay area)
- [x] Loader properly handles overlay vs inline rendering split
- [x] Cleanup works when target div is removed

---

## Phase 4: Widget Builder UI Updates

> **Goal:** Update the builder to support creating and configuring all 7 widget types.

### Step 4.1 — Update type selector with categories

**Skill:** `/code-review` (for review after implementation)

**Files:**
- MODIFY: `apps/web/src/features/widgetBuilder/ui/WidgetTypeSelector.vue`

**Details:**
- Reorganize from flat 3-item grid to **categorized layout**:
  - **Section Widgets**: Wall of Love, Carousel, Single Quote
  - **Micro Widgets**: Marquee Strip, Rating Badge, Avatars Bar
  - **Ambient Widgets**: Toast Popup
- Each category gets a heading label
- Each card shows: icon/thumbnail, name, 1-line description
- Type cards should convey the visual style (small preview illustration or icon)
- Keep selection behavior the same (click to select, emits to parent)

**Dependencies:** 1.3 (entity types must include new types)

---

### Step 4.2 — Add settings panel sections for new types

**Skill:** `/code-review` (for review after implementation)

**Files:**
- MODIFY: `apps/web/src/features/widgetBuilder/ui/WidgetSettingsPanel.vue`

**Details:**
- Add type-specific settings sections for each new widget type
- **Marquee settings:** speed slider, direction toggle (left/right), pause-on-hover checkbox, card style radio (compact/full)
- **Rating Badge settings:** style radio (inline/card), show count checkbox, show average checkbox, link-to-wall URL input
- **Avatars Bar settings:** max avatars number input, size radio (S/M/L), label template text input, show rating checkbox
- **Toast Popup settings:** position dropdown (4 corners), display duration slider, rotation interval slider, delay slider, max per session number input, show dismiss checkbox, animation radio (slide/fade)
- **Toggle visibility matrix:** Show/hide existing `show_ratings`, `show_dates`, `show_company`, `show_avatar` toggles based on widget type (see ADR toggle applicability table)
- If `WidgetSettingsPanel.vue` exceeds 250 lines, extract per-type settings into sub-components:
  - `MarqueeSettingsSection.vue`
  - `RatingBadgeSettingsSection.vue`
  - `AvatarsBarSettingsSection.vue`
  - `ToastPopupSettingsSection.vue`

**Dependencies:** 1.3, 4.1

---

### Step 4.3 — Add preview components for new types

**Skill:** `/code-review` (for review after implementation)

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/MarqueePreview.vue`
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/RatingBadgePreview.vue`
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/AvatarsBarPreview.vue`
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/ToastPopupPreview.vue`
- MODIFY: `apps/web/src/features/widgetBuilder/ui/WidgetPreview.vue`

**Details:**
- Each preview component is a **Vue component** (not the embed script) that visually represents how the widget will look when embedded
- **MarqueePreview:** Animated horizontal scroll of sample cards within the preview pane, using CSS animation
- **RatingBadgePreview:** Static render of badge in chosen style, updates reactively with settings
- **AvatarsBarPreview:** Row of sample avatars (use selected testimonial names for initials), updates with `max_avatars` setting
- **ToastPopupPreview:** Simulated corner popup within the preview pane (not actual viewport overlay). Show toast appearance in the configured corner position, with a "simulating..." label
- Update `WidgetPreview.vue` to dispatch to the correct preview component based on widget type
- All previews accept the current widget settings + selected testimonials as props

**Dependencies:** 4.2

---

### Step 4.4 — Update embed code generation

**Files:**
- MODIFY: `apps/web/src/features/widgetBuilder/ui/WidgetEmbedModal.vue`

**Details:**
- The embed snippet `data-testimonials-widget` attribute should use the new type values (`marquee`, `rating_badge`, `avatars_bar`, `toast_popup`)
- Add a note in the embed modal for `toast_popup` type: "This widget will appear as a floating notification. Place the code snippet anywhere on the page — it won't be visible at the insertion point."
- No structural changes to the embed code format — same `<div>` + `<script>` pattern

**Dependencies:** 4.1

---

### Phase 4 Acceptance Criteria

- [x] Type selector shows 7 types organized in 3 categories
- [x] Each new type has a complete settings panel section
- [x] Display toggle visibility is correct per widget type (toggle matrix)
- [x] Live preview works for all 4 new types
- [x] Toast popup preview shows simulated overlay within preview pane
- [x] Embed code modal generates correct snippet for new types
- [x] Toast embed modal includes placement guidance note
- [x] No component exceeds 250 lines
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes

---

## Phase 5: E2E Tests & Polish

> **Goal:** Verify everything works end-to-end and add test coverage.
>
> **Detailed testing plan:** [testing-plan.md](./testing-plan.md)

### Step 5.1 — Add test IDs for new widget type elements

**Skill:** `/e2e-test-ids`

**Files:**
- MODIFY: Centralized test ID constants file
- MODIFY: Widget builder components (add `data-testid` attributes)

**Details:**
- Add test IDs for:
  - Type selector category headings
  - Each of the 4 new type cards in the selector
  - Type-specific settings sections
  - Preview containers for each new type
- Follow existing test ID naming patterns

**Dependencies:** Phase 4

---

### Step 5.2 — E2E tests: new widget type creation flows

**Skill:** `/e2e-tests-creator`

**Files:**
- CREATE: E2E test file(s) for new widget types

**Details:**
- Test each new type creation journey:
  1. Navigate to widget builder → select new type → configure settings → save → verify embed code
- Test type-specific settings render correctly for each type
- Test preview updates reactively with settings changes
- Test that each new type produces a valid embed snippet
- Use seeded testimonials from existing E2E fixtures

**Dependencies:** 5.1

---

### Step 5.3 — E2E tests: embed rendering for new types

**Skill:** `/e2e-tests-creator`

**Files:**
- CREATE: E2E test file(s) for embed rendering

**Details:**
- Create a test HTML page that embeds widgets of each new type
- Verify:
  - Marquee renders and scrolls (animation class present)
  - Rating Badge shows correct aggregate numbers
  - Avatars Bar renders correct number of avatar elements
  - Toast Popup appears after delay, rotates, and can be dismissed
- Test responsive behavior for marquee and avatars bar

**Dependencies:** Phase 2, Phase 3

---

### Step 5.4 — Run full test suite and code review

**Skill:** `/e2e-tests-runner`, `/code-review`, `/e2e-code-review`

**Files:** N/A (running existing + new tests)

**Details:**
- Run all existing widget E2E tests to confirm no regressions
- Run new E2E tests from 5.2 and 5.3
- Code review all new/modified files
- Verify bundle size hasn't grown excessively (target: < 40KB gzipped with 7 types)

**Dependencies:** 5.2, 5.3

---

### Step 5.5 — Update table documentation

**Skill:** `/hasura-table-docs`

**Files:**
- MODIFY: Widget table documentation (if it exists)

**Details:**
- Update the `widgets` table documentation to reflect the expanded `type` CHECK constraint
- Document the new settings JSONB structures for each type
- Include the toggle applicability matrix

**Dependencies:** 1.1

---

### Phase 5 Acceptance Criteria

- [x] Test IDs added for all new widget builder elements
- [x] E2E tests pass for creating each new widget type
- [x] E2E tests pass for embed rendering of each new type
- [x] No regressions in existing widget tests
- [x] All code reviewed (Vue, TS, embed components)
- [x] E2E test code reviewed for Playwright best practices
- [x] Table documentation updated
- [x] Final `pnpm typecheck` and `pnpm lint` pass

---

## Parallelization Map

```
Phase 1:
  1.1 ──→ 1.2
  1.1 ──→ 1.3
  1.1 ──→ 1.4
  1.3 + 1.4 ──→ 1.5

Phase 2 (can start after 1.5):
  2.1 (RatingBadge)   ─┐
  2.2 (AvatarsBar)     ├──→ 2.4 (register in renderer)
  2.3 (Marquee)        ─┘

Phase 3 (can start after 1.5, parallel with Phase 2):
  3.1 (ToastPopup) ──→ 3.2 (loader update)

Phase 4 (can start after 1.3, parallel with Phase 2/3):
  4.1 (type selector) ──→ 4.2 (settings) ──→ 4.3 (previews)
  4.1 ──→ 4.4 (embed modal)

Phase 5 (after Phases 2-4):
  5.1 (test IDs) ──→ 5.2 (builder E2E)
  5.3 (embed E2E) ◄── Phase 2 + Phase 3
  5.4 (full test suite) ◄── 5.2 + 5.3
  5.5 (table docs) ◄── 1.1 (can run anytime)
```

### Parallel execution opportunities

| Parallel Group | Steps | Prerequisite |
|---------------|-------|--------------|
| DB + types | 1.1 (migration) | None |
| Entity + API types | 1.2 + 1.3 + 1.4 | 1.1 |
| All embed components | 2.1 + 2.2 + 2.3 + 3.1 | 1.5 |
| Builder UI + embed | 4.1–4.4 + 2.1–3.2 | 1.3 / 1.5 |
| E2E + docs | 5.1–5.3 + 5.5 | Phase 2–4 / 1.1 |

---

## Skill Reference

Quick reference for which skill to invoke at each step.

| Step | Skill(s) | Purpose |
|------|----------|---------|
| 1.1 | `/hasura-migrations` | Create CHECK constraint expansion migration |
| 1.2 | `/hasura-permissions` | Verify/update metadata for new type values |
| 1.3 | `/graphql-code` | Update entity types, run codegen |
| 1.4 | `/api-creator` | Add Zod schemas for new settings types |
| 1.5 | `/api-creator` | Update public endpoint for aggregate data |
| 2.1–2.3 | (manual) | Vanilla TS embed components — no specific skill |
| 2.4 | (manual) | Update renderer dispatch map |
| 3.1–3.2 | (manual) | Toast popup component + loader update |
| 4.1–4.4 | `/code-review` | Review Vue components after implementation |
| 5.1 | `/e2e-test-ids` | Add centralized test ID constants |
| 5.2 | `/e2e-tests-creator` | Create widget builder E2E tests |
| 5.3 | `/e2e-tests-creator` | Create embed rendering E2E tests |
| 5.4 | `/e2e-tests-runner`, `/code-review`, `/e2e-code-review` | Run tests + review |
| 5.5 | `/hasura-table-docs` | Update table documentation |
| All | `/create-commits` | Atomic commits: `ADR-027-{STEP}: description` |
| All | `/pw-auth` | Browser automation for manual verification |
| All | `/api-code-review` | Review API changes in steps 1.4, 1.5 |

---

## Key Files Summary

| Action | Path |
|--------|------|
| CREATE | `db/hasura/migrations/default/XXXXXX__widgets__expand_type_check/up.sql` |
| CREATE | `db/hasura/migrations/default/XXXXXX__widgets__expand_type_check/down.sql` |
| VERIFY | `db/hasura/metadata/databases/default/tables/public_widgets.yaml` |
| MODIFY | `apps/web/src/entities/widget/models/index.ts` |
| MODIFY | `api/src/features/widgets/schemas/widget.ts` |
| MODIFY | `api/src/features/widgets/handlers/getPublicWidget.ts` |
| CREATE | `packages/widget-embed/src/components/RatingBadge.ts` |
| CREATE | `packages/widget-embed/src/components/AvatarsBar.ts` |
| CREATE | `packages/widget-embed/src/components/Marquee.ts` |
| CREATE | `packages/widget-embed/src/components/ToastPopup.ts` |
| CREATE | `packages/widget-embed/src/styles/marquee.css` |
| CREATE | `packages/widget-embed/src/styles/toast.css` |
| MODIFY | `packages/widget-embed/src/renderer.ts` |
| MODIFY | `packages/widget-embed/src/loader.ts` |
| MODIFY | `apps/web/src/features/widgetBuilder/ui/WidgetTypeSelector.vue` |
| MODIFY | `apps/web/src/features/widgetBuilder/ui/WidgetSettingsPanel.vue` |
| MODIFY | `apps/web/src/features/widgetBuilder/ui/WidgetPreview.vue` |
| MODIFY | `apps/web/src/features/widgetBuilder/ui/WidgetEmbedModal.vue` |
| CREATE | `apps/web/src/features/widgetBuilder/ui/previews/MarqueePreview.vue` |
| CREATE | `apps/web/src/features/widgetBuilder/ui/previews/RatingBadgePreview.vue` |
| CREATE | `apps/web/src/features/widgetBuilder/ui/previews/AvatarsBarPreview.vue` |
| CREATE | `apps/web/src/features/widgetBuilder/ui/previews/ToastPopupPreview.vue` |
| CREATE | E2E test files for builder + embed rendering |

---

## Commit Convention

```
ADR-027-{STEP_ID}: {description} [{done|wip}]
```

Examples:
- `ADR-027-1.1: expand widget type CHECK constraint to 7 types [done]`
- `ADR-027-1.3: add WidgetType union and settings interfaces for new types [done]`
- `ADR-027-2.1: create RatingBadge embed component [done]`
- `ADR-027-2.3: create Marquee embed component with CSS animation [done]`
- `ADR-027-3.1: create ToastPopup embed component with overlay rendering [done]`
- `ADR-027-4.1: update type selector with categorized layout [done]`
- `ADR-027-5.2: add E2E tests for new widget type builder flows [done]`
