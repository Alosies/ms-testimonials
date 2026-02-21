# ADR-024: Widgets v1 — Implementation Plan

| Field | Value |
|-------|-------|
| **ADR** | [024-widgets-v1](./adr.md) |
| **Status** | Draft |
| **Created** | 2026-02-21 |
| **Scope** | Full widget pipeline: data layer → builder UI → embed script → polish |

---

## Current State

| Component | Status | Details |
|-----------|--------|---------|
| `widgets` table | EXISTS | All columns except `form_id` |
| `widget_testimonials` table | EXISTS | Junction table with ordering |
| Hasura metadata (tables) | EXISTS | Relationships, RLS permissions for all roles |
| API route stub | EXISTS | `api/src/routes/widgets.ts` — plain Hono, no real handlers |
| API route registration | EXISTS | `api/src/index.ts:65` — `app.route('/widgets', widgetRoutes)` |
| GraphQL fragment | EXISTS | `WidgetBasic.gql` — missing `form_id` |
| GraphQL queries | EXISTS | `getWidget.gql`, `getWidgets.gql` |
| GraphQL mutations | MISSING | No `.gql` mutation files |
| Mutation composables | MISSING | No `useCreateWidget`, `useUpdateWidget`, `useDeleteWidget` |
| Entity models | PARTIAL | `queries.ts` exists, `mutations.ts` missing |
| Page stubs | EXISTS | `index.vue`, `new.vue`, `[urlSlug].vue` — skeleton only |
| Widget builder feature | MISSING | No `features/widgetBuilder/` |
| Widget list feature | MISSING | No `features/widgetsList/` |
| Embed package | MISSING | No `packages/widget-embed/` |
| Public widget endpoint | MISSING | No `/public/widgets/:id` route |

---

## Phase 1: Data Layer & API

> **Goal:** Complete the data layer, API CRUD, public endpoint, and GraphQL mutations so the builder UI has everything it needs.

### Step 1.1 — Add `form_id` column migration

**Skill:** `/hasura-migrations`

**Files:**
- CREATE: `db/hasura/migrations/default/XXXXXX__widgets__add_form_id/up.sql`
- CREATE: `db/hasura/migrations/default/XXXXXX__widgets__add_form_id/down.sql`

**Details:**
- Add `form_id TEXT` nullable column to `widgets`
- Add FK constraint: `REFERENCES forms(id) ON DELETE SET NULL`
- Add index on `form_id` for lookup performance

**Dependencies:** None

---

### Step 1.2 — Update Hasura metadata for `form_id`

**Skill:** `/hasura-permissions`

**Files:**
- MODIFY: `db/hasura/metadata/databases/default/tables/public_widgets.yaml`

**Details:**
- Add `form` object relationship (`form_id` → `forms.id`)
- Add `form_id` to `select_permissions` for `member`, `org_admin`, `owner` roles
- Add `form_id` to `insert_permissions` and `update_permissions` for writable roles
- Decide: anonymous role does NOT need `form_id` (embed uses public endpoint, not Hasura directly)

**Dependencies:** 1.1

---

### Step 1.3 — Update `WidgetBasic.gql` fragment

**Skill:** `/graphql-code`

**Files:**
- MODIFY: `apps/web/src/entities/widget/graphql/fragments/WidgetBasic.gql`

**Details:**
- Add `form_id` field to the fragment
- Run `pnpm codegen:web` to regenerate types

**Dependencies:** 1.2 (metadata must be applied first so Hasura exposes `form_id`)

---

### Step 1.4 — Create widget CRUD API feature

**Skill:** `/api-creator`

**Files:**
- CREATE: `api/src/features/widgets/index.ts` (barrel export)
- CREATE: `api/src/features/widgets/routes.ts` (OpenAPIHono routes with Zod schemas)
- CREATE: `api/src/features/widgets/handlers/createWidget.ts`
- CREATE: `api/src/features/widgets/handlers/getWidget.ts`
- CREATE: `api/src/features/widgets/handlers/listWidgets.ts`
- CREATE: `api/src/features/widgets/handlers/updateWidget.ts`
- CREATE: `api/src/features/widgets/handlers/deleteWidget.ts`
- CREATE: `api/src/features/widgets/schemas/widget.ts` (Zod schemas for settings JSONB, create/update payloads)
- MODIFY: `api/src/index.ts:65` — update import from `./routes/widgets` to `./features/widgets`
- DELETE: `api/src/routes/widgets.ts` (replaced by feature module)

**Details:**
- Follow `api/src/features/ai/assembleTestimonial/` pattern: handlers/, functions/, schemas/
- Use OpenAPIHono with Zod validation (not plain Hono)
- Endpoints: `GET /widgets`, `GET /widgets/:id`, `POST /widgets`, `PUT /widgets/:id`, `DELETE /widgets/:id`
- All endpoints require auth, scope by `organization_id` from JWT
- Zod schema for `settings` JSONB validates per widget type

**Dependencies:** None (can start in parallel with 1.1–1.3)

---

### Step 1.5 — Create public widget endpoint

**Skill:** `/api-creator`

**Files:**
- CREATE: `api/src/features/widgets/handlers/getPublicWidget.ts`
- MODIFY: `api/src/features/widgets/routes.ts` (add public route)
- MODIFY: `api/src/index.ts` — add `/public/widgets` route (unauthenticated)

**Details:**
- `GET /public/widgets/:id` — no auth required
- Returns: widget config + approved testimonials (with ordering from `widget_testimonials`)
- If `form_id` is set, fetch testimonials scoped to that form
- If `form_id` is null, fetch from `widget_testimonials` junction table
- Add `Cache-Control` headers (e.g., `public, max-age=60`)
- Add CORS headers for cross-origin embed usage

**Dependencies:** 1.4

---

### Step 1.6 — Create GraphQL mutations & composables

**Skill:** `/graphql-code`

**Files:**
- CREATE: `apps/web/src/entities/widget/graphql/mutations/createWidget.gql`
- CREATE: `apps/web/src/entities/widget/graphql/mutations/updateWidget.gql`
- CREATE: `apps/web/src/entities/widget/graphql/mutations/deleteWidget.gql`
- CREATE: `apps/web/src/entities/widget/composables/mutations/useCreateWidget.ts`
- CREATE: `apps/web/src/entities/widget/composables/mutations/useUpdateWidget.ts`
- CREATE: `apps/web/src/entities/widget/composables/mutations/useDeleteWidget.ts`
- CREATE: `apps/web/src/entities/widget/composables/mutations/index.ts`
- CREATE: `apps/web/src/entities/widget/models/mutations.ts`
- MODIFY: `apps/web/src/entities/widget/composables/index.ts` — add mutations export
- MODIFY: `apps/web/src/entities/widget/models/index.ts` — add mutations types export
- MODIFY: `apps/web/src/entities/widget/index.ts` — ensure re-exports

**Details:**
- `createWidget` mutation: `insert_widgets_one` returning `...WidgetBasic`
- `updateWidget` mutation: `update_widgets_by_pk` returning `...WidgetBasic`
- `deleteWidget` mutation: `delete_widgets_by_pk` returning `id`
- Run `pnpm codegen:web` after creating `.gql` files
- Composables follow existing patterns: `useMutation`, return `mutate`, `loading`, `error`
- Types extracted from generated operations (`CreateWidgetMutation`, etc.)

**Dependencies:** 1.3 (fragment must include `form_id` before mutations reference it)

---

### Step 1.7 — Widget testimonials GraphQL operations (optional)

**Skill:** `/graphql-code`

**Files:**
- CREATE: `apps/web/src/entities/widget/graphql/mutations/addWidgetTestimonials.gql`
- CREATE: `apps/web/src/entities/widget/graphql/mutations/removeWidgetTestimonials.gql`
- CREATE: `apps/web/src/entities/widget/graphql/queries/getWidgetTestimonials.gql`

**Details:**
- `addWidgetTestimonials`: `insert_widget_testimonials` (bulk insert with `on_conflict` ignore)
- `removeWidgetTestimonials`: `delete_widget_testimonials` by widget_id + testimonial_id(s)
- `getWidgetTestimonials`: query by widget_id, ordered by `display_order`, include testimonial content via relationship
- Add corresponding composables and types following same pattern as 1.6

**Dependencies:** 1.6

---

### Phase 1 Acceptance Criteria

- [ ] `form_id` column exists on `widgets` table with FK to `forms`
- [ ] Hasura metadata updated: `form` relationship, permissions include `form_id`
- [ ] `WidgetBasic.gql` includes `form_id`, codegen passes
- [ ] API CRUD endpoints work: create, read, update, delete widgets (authenticated)
- [ ] `GET /public/widgets/:id` returns widget config + testimonials (unauthenticated)
- [ ] GraphQL mutations work: create, update, delete via Apollo
- [ ] All mutation composables export correctly from entity barrel
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

---

## Phase 2: Widget Builder UI

> **Goal:** Build the full widget builder experience — list page, create/edit builder with type selector, settings, testimonial picker, live preview, and embed code modal.

### Step 2.1 — Widget list feature

**Skill:** `/code-review` (for review after implementation)

**Files:**
- CREATE: `apps/web/src/features/widgetsList/index.ts`
- CREATE: `apps/web/src/features/widgetsList/ui/WidgetsList.vue`
- CREATE: `apps/web/src/features/widgetsList/ui/WidgetCard.vue`
- MODIFY: `apps/web/src/pages/[org]/widgets/index.vue` — wire up `WidgetsList` component

**Details:**
- Display all widgets for the org in a grid/list layout
- Each card shows: name, type badge, testimonial count, active/inactive status
- "Create Widget" button links to `/widgets/new`
- Click card navigates to `/:org/widgets/:urlSlug` (edit page)
- Use `useGetWidgets` composable from entity layer
- Delete widget with confirmation dialog (use `useDeleteWidget`)

**Dependencies:** 1.6 (needs mutation composables for delete)

---

### Step 2.2 — Widget builder feature scaffold

**Skill:** `/code-review` (for review after implementation)

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/index.ts`
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetBuilder.vue` (main container)
- CREATE: `apps/web/src/features/widgetBuilder/composables/useWidgetBuilder.ts`

**Details:**
- `WidgetBuilder.vue` is the main layout: left panel (settings) + right panel (preview)
- `useWidgetBuilder` composable manages: widget state, dirty tracking, save/update logic
- Supports both create mode (`widgetId = null`) and edit mode (`widgetId` from route)
- In edit mode, loads existing widget via `useGetWidget`
- Save calls `useCreateWidget` or `useUpdateWidget` based on mode
- Max 250 lines per component — split into sub-components below

**Dependencies:** 1.6

---

### Step 2.3 — Widget type selector

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetTypeSelector.vue`

**Details:**
- Card-based selector for: Wall of Love, Carousel, Single Quote
- Each card shows a preview thumbnail/icon and description
- Shown as first step in create mode, or as editable field in edit mode
- Emits selected type to parent

**Dependencies:** 2.2

---

### Step 2.4 — Form selector

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetFormSelector.vue`

**Details:**
- Dropdown to select a form (optional, scopes testimonials)
- "All forms (org-wide)" option for null `form_id`
- Uses existing `useGetForms` composable from forms entity
- When form changes, reset testimonial selection

**Dependencies:** 2.2

---

### Step 2.5 — Settings panel

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetSettingsPanel.vue`

**Details:**
- Toggle switches: `show_ratings`, `show_dates`, `show_company`, `show_avatar`
- Theme selector: light/dark
- `max_display` number input
- Widget name text input
- Active/inactive toggle
- Settings vary by widget type (use `settings` JSONB for type-specific options)

**Dependencies:** 2.2

---

### Step 2.6 — Testimonial selector

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetTestimonialSelector.vue`

**Details:**
- List of approved testimonials (filtered by form if `form_id` set)
- Checkbox selection with drag-to-reorder for `display_order`
- "Featured" toggle per testimonial
- Uses `widget_testimonials` mutations to persist selections
- Scoped by form or org based on `form_id`

**Dependencies:** 1.7, 2.2

---

### Step 2.7 — Live preview

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetPreview.vue`
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/WallOfLovePreview.vue`
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/CarouselPreview.vue`
- CREATE: `apps/web/src/features/widgetBuilder/ui/previews/SingleQuotePreview.vue`

**Details:**
- Vue components (NOT the embed script) for live preview in the builder
- Renders based on current widget settings + selected testimonials
- Updates reactively as user changes settings
- Each preview component matches the visual output of the embed script
- Contained in an iframe-like preview panel with responsive width controls

**Dependencies:** 2.5, 2.6

---

### Step 2.8 — Embed code modal

**Files:**
- CREATE: `apps/web/src/features/widgetBuilder/ui/WidgetEmbedModal.vue`

**Details:**
- Shows after saving a widget (or via "Get Embed Code" button)
- Displays the embed snippet:
  ```html
  <div data-testimonials-widget="wall_of_love" data-widget-id="WIDGET_ID"></div>
  <script src="https://your-domain/embed/widgets.js" async></script>
  ```
- Copy-to-clipboard button
- Only available for saved (not new) widgets

**Dependencies:** 2.2

---

### Step 2.9 — Wire pages to features

**Skill:** `/code-review` (for final review)

**Files:**
- MODIFY: `apps/web/src/pages/[org]/widgets/index.vue` — render `WidgetsList`
- MODIFY: `apps/web/src/pages/[org]/widgets/new.vue` — render `WidgetBuilder` in create mode
- MODIFY: `apps/web/src/pages/[org]/widgets/[urlSlug].vue` — render `WidgetBuilder` in edit mode

**Details:**
- Pages are thin wrappers per project conventions
- `new.vue` passes no `widgetId` to builder
- `[urlSlug].vue` extracts `widgetId` via `extractEntityIdFromSlug` (already in skeleton)

**Dependencies:** 2.1, 2.2

---

### Phase 2 Acceptance Criteria

- [ ] Widget list page shows all org widgets with create/delete actions
- [ ] Widget builder opens in create mode from "new" page
- [ ] Widget builder opens in edit mode from existing widget
- [ ] Type selector works for all 3 widget types
- [ ] Form selector scopes testimonial picker
- [ ] Settings panel updates live preview reactively
- [ ] Testimonial selector allows pick, order, and feature
- [ ] Embed code modal shows correct snippet with widget ID
- [ ] All pages are thin wrappers, all logic in features/entities
- [ ] No component exceeds 250 lines
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

---

## Phase 3: Embed Script

> **Goal:** Build the embeddable widget script that customers paste into their sites. Vanilla TS, Shadow DOM, < 30KB gzipped.

### Step 3.1 — Package scaffold

**Files:**
- CREATE: `packages/widget-embed/package.json`
- CREATE: `packages/widget-embed/tsconfig.json`
- CREATE: `packages/widget-embed/vite.config.ts`
- CREATE: `packages/widget-embed/src/index.ts`

**Details:**
- `package.json`: name `@testimonials/widget-embed`, private, Vite build scripts
- Vite config: library mode, single IIFE output `widgets.js`, no external deps
- Entry point: `src/index.ts` — calls loader on `DOMContentLoaded`
- Target: ES2020, all dependencies bundled

**Dependencies:** None (can start in parallel with Phase 2)

---

### Step 3.2 — Loader

**Files:**
- CREATE: `packages/widget-embed/src/loader.ts`

**Details:**
- Finds all `[data-testimonials-widget]` elements on the page
- Extracts `data-widget-id` from each
- Calls API to fetch widget data
- Passes data to renderer
- Handles multiple widgets on same page
- Uses `MutationObserver` for dynamically added widgets (optional)

**Dependencies:** 3.1

---

### Step 3.3 — API client

**Files:**
- CREATE: `packages/widget-embed/src/api.ts`

**Details:**
- Fetches `GET /public/widgets/:id` from the API
- Configurable base URL (from script `src` attribute or `data-api-url`)
- Returns typed widget config + testimonials
- Error handling: returns null on failure (graceful degradation)
- Minimal fetch wrapper, no dependencies

**Dependencies:** 1.5 (public endpoint must exist)

---

### Step 3.4 — Shadow DOM renderer

**Files:**
- CREATE: `packages/widget-embed/src/renderer.ts`
- CREATE: `packages/widget-embed/src/styles/base.css`

**Details:**
- Creates Shadow DOM root on the target `<div>`
- Injects base styles into shadow root
- Selects correct component based on widget type
- Handles theme (light/dark) via CSS custom properties
- Shows loading state while fetching

**Dependencies:** 3.1

---

### Step 3.5 — Wall of Love component

**Files:**
- CREATE: `packages/widget-embed/src/components/WallOfLove.ts`

**Details:**
- Masonry-style grid layout (CSS columns or CSS grid)
- Renders testimonial cards: avatar, name, company, rating stars, quote text, date
- Responsive: 3 cols → 2 cols → 1 col based on container width
- Respects `show_ratings`, `show_dates`, `show_company`, `show_avatar`, `max_display`
- Pure vanilla TS — creates DOM elements programmatically

**Dependencies:** 3.4

---

### Step 3.6 — Carousel component

**Files:**
- CREATE: `packages/widget-embed/src/components/Carousel.ts`

**Details:**
- Horizontal slider with left/right navigation arrows
- Touch/swipe support for mobile
- Auto-play option (from `settings` JSONB)
- Dot indicators for current position
- Smooth CSS transitions
- Same testimonial card rendering as Wall of Love

**Dependencies:** 3.4

---

### Step 3.7 — Single Quote component

**Files:**
- CREATE: `packages/widget-embed/src/components/SingleQuote.ts`

**Details:**
- Displays one testimonial at a time
- Optional rotation (fade between testimonials on interval)
- Large quote styling with attribution
- Simplest component — good starting point

**Dependencies:** 3.4

---

### Step 3.8 — Error & loading states

**Files:**
- CREATE: `packages/widget-embed/src/components/LoadingState.ts`
- CREATE: `packages/widget-embed/src/components/ErrorState.ts`

**Details:**
- Loading: subtle skeleton/spinner shown while API call in progress
- Error: graceful message or hidden element (don't break host page)
- Empty state: message when no testimonials available

**Dependencies:** 3.4

---

### Phase 3 Acceptance Criteria

- [ ] `packages/widget-embed/` builds successfully via Vite
- [ ] Output is a single `widgets.js` IIFE file
- [ ] Bundle size < 30KB gzipped
- [ ] Loader finds and initializes widget divs
- [ ] API client fetches from public endpoint
- [ ] Shadow DOM isolates styles from host page
- [ ] Wall of Love renders masonry grid, responsive
- [ ] Carousel has navigation, touch support
- [ ] Single Quote displays with attribution
- [ ] Loading and error states work gracefully
- [ ] Works in Chrome, Firefox, Safari, Edge (latest)

---

## Phase 4: Polish & Testing

> **Goal:** Production-ready: caching, serving the embed script, E2E tests, and integration tests.

### Step 4.1 — Cache headers & CORS

**Skill:** `/api-code-review` (for review)

**Files:**
- MODIFY: `api/src/features/widgets/handlers/getPublicWidget.ts`
- MODIFY: API CORS configuration

**Details:**
- `Cache-Control: public, max-age=60, stale-while-revalidate=300` on public endpoint
- CORS: allow `*` origin for embed script requests
- ETag support for conditional requests (optional)

**Dependencies:** 1.5

---

### Step 4.2 — Serve embed script

**Files:**
- MODIFY: `api/src/index.ts` or create static file serving route
- MODIFY: build pipeline to copy `widget-embed` output

**Details:**
- Serve `widgets.js` from `/embed/widgets.js`
- `Cache-Control: public, max-age=3600` (1 hour)
- Consider CDN strategy for production
- Versioning: embed URL includes version or uses content hash

**Dependencies:** 3.1 (embed package must build)

---

### Step 4.3 — E2E tests: widget builder

**Skill:** `/e2e-tests-creator`

**Files:**
- CREATE: E2E test files for widget builder journey
- CREATE: Test actions for widget CRUD operations

**Details:**
- Test journey: create widget → configure → select testimonials → save → get embed code
- Test edit flow: load existing widget → modify settings → save
- Test delete flow: delete widget with confirmation
- Test list page: verify widgets display, navigation works
- Use `/e2e-test-ids` skill to add test IDs to components

**Dependencies:** Phase 2 complete

---

### Step 4.4 — E2E tests: embed script

**Skill:** `/e2e-tests-creator`

**Files:**
- CREATE: E2E test files for embed rendering

**Details:**
- Test: embed script loads and renders widget in a test HTML page
- Test: all 3 widget types render correctly
- Test: responsive behavior
- Test: error handling when widget ID is invalid
- Test: loading state appears then resolves

**Dependencies:** Phase 3 complete

---

### Step 4.5 — Integration tests: API

**Skill:** `/e2e-tests-runner` (for running), `/api-code-review` (for review)

**Files:**
- CREATE: `api/src/features/widgets/__tests__/routes.test.ts`

**Details:**
- Test CRUD operations on widgets endpoint
- Test public endpoint returns correct data
- Test auth: unauthenticated requests rejected on CRUD
- Test validation: invalid widget settings rejected

**Dependencies:** 1.4, 1.5

---

### Phase 4 Acceptance Criteria

- [ ] Public endpoint has proper cache headers
- [ ] CORS allows cross-origin embed requests
- [ ] Embed script served from `/embed/widgets.js`
- [ ] E2E tests pass for widget builder flows
- [ ] E2E tests pass for embed rendering
- [ ] API integration tests pass
- [ ] `pnpm typecheck` passes across all packages
- [ ] `pnpm lint` passes

---

## Parallelization Map

```
Phase 1:
  1.1 ──→ 1.2 ──→ 1.3 ──→ 1.6 ──→ 1.7
                              │
  1.4 ──→ 1.5                │
                              │
Phase 2:                      │
  2.1 ◄──────────────────────┘
  2.2 ◄──────────────────────┘
  2.3 ◄── 2.2
  2.4 ◄── 2.2
  2.5 ◄── 2.2
  2.6 ◄── 2.2 + 1.7
  2.7 ◄── 2.5 + 2.6
  2.8 ◄── 2.2
  2.9 ◄── 2.1 + 2.2

Phase 3 (can run in parallel with Phase 2):
  3.1 (no deps)
  3.2 ◄── 3.1
  3.3 ◄── 1.5
  3.4 ◄── 3.1
  3.5 ◄── 3.4
  3.6 ◄── 3.4
  3.7 ◄── 3.4
  3.8 ◄── 3.4

Phase 4:
  4.1 ◄── 1.5
  4.2 ◄── 3.1
  4.3 ◄── Phase 2
  4.4 ◄── Phase 3
  4.5 ◄── 1.4 + 1.5
```

### Parallel execution opportunities

| Parallel group | Steps | Prerequisite |
|---------------|-------|--------------|
| DB + API kickoff | 1.1 + 1.4 | None |
| Metadata + API handlers | 1.2 + 1.4 (continued) | 1.1 |
| Fragment + public endpoint | 1.3 + 1.5 | 1.2, 1.4 |
| Mutations + embed scaffold | 1.6 + 3.1 | 1.3 |
| Builder UI + embed internals | 2.1–2.9 + 3.2–3.8 | 1.6, 3.1 |
| Polish (all) | 4.1 + 4.2 + 4.5 | Various Phase 1/3 |
| E2E tests | 4.3 + 4.4 | Phase 2, Phase 3 |

---

## Skill Reference

Quick reference for which skill to invoke at each step.

| Step | Skill(s) | Purpose |
|------|----------|---------|
| 1.1 | `/hasura-migrations` | Create `form_id` migration with proper naming, SQL, tracking |
| 1.2 | `/hasura-permissions` | Update `public_widgets.yaml` relationships and permissions |
| 1.3 | `/graphql-code` | Update fragment, run codegen |
| 1.4 | `/api-creator` | Create feature module with OpenAPIHono + Zod |
| 1.5 | `/api-creator` | Add public endpoint handler |
| 1.6 | `/graphql-code` | Create mutation `.gql` files, codegen, composables |
| 1.7 | `/graphql-code` | Widget testimonials operations |
| 2.1–2.9 | `/code-review` | Review components after implementation |
| 2.6 | `/graphql-code` | If new queries needed for testimonial listing |
| 2.9 | `/code-review` | Final review of page wiring |
| 3.1–3.8 | (manual) | Vanilla TS — no specific skill, standard implementation |
| 4.1 | `/api-code-review` | Review cache/CORS configuration |
| 4.3 | `/e2e-tests-creator`, `/e2e-test-ids` | Create E2E tests + test IDs |
| 4.4 | `/e2e-tests-creator` | Embed rendering tests |
| 4.5 | `/e2e-tests-runner`, `/api-code-review` | Run and review API tests |
| All | `/create-commits` | Atomic commits per step: `ADR-024-{STEP}: description` |
| All | `/pw-auth` | Browser automation for manual verification |

---

## Key Files Summary

| Action | Path |
|--------|------|
| CREATE | `db/hasura/migrations/default/XXXXXX__widgets__add_form_id/up.sql` |
| CREATE | `db/hasura/migrations/default/XXXXXX__widgets__add_form_id/down.sql` |
| MODIFY | `db/hasura/metadata/databases/default/tables/public_widgets.yaml` |
| MODIFY | `apps/web/src/entities/widget/graphql/fragments/WidgetBasic.gql` |
| CREATE | `apps/web/src/entities/widget/graphql/mutations/createWidget.gql` |
| CREATE | `apps/web/src/entities/widget/graphql/mutations/updateWidget.gql` |
| CREATE | `apps/web/src/entities/widget/graphql/mutations/deleteWidget.gql` |
| CREATE | `apps/web/src/entities/widget/graphql/mutations/addWidgetTestimonials.gql` |
| CREATE | `apps/web/src/entities/widget/graphql/mutations/removeWidgetTestimonials.gql` |
| CREATE | `apps/web/src/entities/widget/graphql/queries/getWidgetTestimonials.gql` |
| CREATE | `apps/web/src/entities/widget/composables/mutations/*.ts` (3 files + index) |
| CREATE | `apps/web/src/entities/widget/models/mutations.ts` |
| MODIFY | `apps/web/src/entities/widget/composables/index.ts` |
| MODIFY | `apps/web/src/entities/widget/models/index.ts` |
| CREATE | `api/src/features/widgets/` (entire feature directory) |
| MODIFY | `api/src/index.ts` (update widget route import + add public route) |
| DELETE | `api/src/routes/widgets.ts` (replaced by feature module) |
| CREATE | `apps/web/src/features/widgetsList/` (list feature) |
| CREATE | `apps/web/src/features/widgetBuilder/` (builder feature) |
| MODIFY | `apps/web/src/pages/[org]/widgets/index.vue` |
| MODIFY | `apps/web/src/pages/[org]/widgets/new.vue` |
| MODIFY | `apps/web/src/pages/[org]/widgets/[urlSlug].vue` |
| CREATE | `packages/widget-embed/` (entire package) |

---

## Commit Convention

```
ADR-024-{STEP_ID}: {description} [{done|wip}]
```

Examples:
- `ADR-024-1.1: add form_id column migration to widgets [done]`
- `ADR-024-1.4: create widget CRUD API feature with OpenAPIHono [done]`
- `ADR-024-2.2: scaffold widget builder feature [done]`
- `ADR-024-3.1: scaffold widget-embed package with Vite lib mode [done]`
