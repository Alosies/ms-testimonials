# ADR-024: Widgets v1

## Doc Connections
**ID**: `adr-024-widgets-v1`

2026-02-02 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `prd-testimonials-mvp` - MVP feature requirements (Widget types: Wall of Love, Carousel, Single Quote)

---

## Status

**Proposed** - 2026-02-02

- 2026-02-02: Research completed, initial proposal
- 2026-02-08: Reviewed — corrected data model to match implemented schema, added hybrid form scoping decision, added embed build strategy, positioned multi-form widgets as premium

---

## Context

### The Problem

After collecting testimonials, users need a way to display them on their websites. Currently, there is no widget system to:
1. Embed testimonials on external websites
2. Customize the appearance to match brand identity
3. Select which testimonials to display
4. Choose from different display formats (grid, carousel, single)

### Business Value

Widgets are a core monetization driver for testimonial platforms:

| Value | Description |
|-------|-------------|
| **Social proof display** | Convert website visitors with visible testimonials |
| **No-code embedding** | Non-technical users can add testimonials anywhere |
| **Brand consistency** | Customizable to match customer branding |
| **Premium features** | Branding removal, multi-form widgets, advanced customization as upsells |

### Competitive Analysis

We researched 4 major competitors (see `research.md`):

| Platform | Widget Count | Differentiator |
|----------|--------------|----------------|
| Testimonial.to | 7 | Simple, credit-based pricing |
| Senja.io | 23+ | Most variety, creator-focused |
| Famewall.io | 10 | Affordable, no-code focus |
| Shoutout.io | 5 | Video-first approach |

**Key Finding:** All competitors offer Wall of Love (Masonry), Carousel, and Single Quote as core widgets. These are the "must-have" basics.

---

## Decision

### Widget Types for MVP

Implement **three core widget types** that cover 90% of use cases:

#### 1. Wall of Love (Masonry Grid)

**Use case:** Dedicated testimonial pages, landing page sections

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ★★★★★       │ │ ★★★★☆       │ │ ★★★★★       │
│             │ │             │ │             │
│ "Great      │ │ "Changed    │ │ "Best tool  │
│  product!"  │ │  my life"   │ │  ever!"     │
│             │ └─────────────┘ │             │
│ [Avatar]    │ ┌─────────────┐ │ [Avatar]    │
│ John D.     │ │ ★★★★★       │ │ Jane S.     │
│ CEO, Acme   │ │             │ │ Founder     │
└─────────────┘ │ "Highly     │ └─────────────┘
┌─────────────┐ │  recommend" │ ┌─────────────┐
│ [Video]     │ │             │ │ ★★★★★       │
│             │ │ [Avatar]    │ │             │
│ ▶ Play      │ │ Mike R.     │ │ "Amazing!"  │
│             │ └─────────────┘ │             │
└─────────────┘                 └─────────────┘
```

**Features:**
- Pinterest-style masonry layout
- Responsive columns (1-4 based on viewport)
- Video testimonial thumbnails with play button
- Source platform icons (Twitter, LinkedIn, etc.)
- "Load more" pagination or infinite scroll

#### 2. Carousel

**Use case:** Hero sections, product pages, above-the-fold placements

```
┌──────────────────────────────────────────────────────┐
│  ←  ★★★★★                                         →  │
│                                                      │
│      "This product changed how we do business.       │
│       The support team is incredible and the         │
│       features are exactly what we needed."          │
│                                                      │
│      [Avatar] Sarah Johnson                          │
│               VP Marketing, TechCorp                 │
│                                                      │
│                    ● ○ ○ ○ ○                         │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Auto-advance with configurable interval
- Manual navigation (arrows + dots)
- Pause on hover
- Touch/swipe support on mobile
- Single or multi-card view options

#### 3. Single Quote

**Use case:** CTAs, pricing pages, email signatures, minimal footprint areas

```
┌──────────────────────────────────────────┐
│  ★★★★★                                   │
│                                          │
│  "Best investment we've made this year." │
│                                          │
│  [Avatar] Tom Wilson                     │
│           CEO, StartupXYZ                │
└──────────────────────────────────────────┘
```

**Features:**
- Highlight a single best testimonial
- Minimal footprint
- Optional rotation (show random on each load)
- Perfect for email embeds

---

### Customization Options

#### MVP Customizations

| Category | Options |
|----------|---------|
| **Theme** | Light / Dark / Auto (inherit from site) |
| **Colors** | Background color, Card color, Text color, Accent color |
| **Content** | Show/hide: Stars, Avatar, Date, Company, Source icon |
| **Layout** | Max items, Columns (grid), Card spacing |
| **Typography** | Font size (S/M/L), Font family (inherit/system/custom) |

#### Premium Customizations (Post-MVP)

| Category | Options |
|----------|---------|
| **Multi-form widgets** | Pull testimonials from any form in the org (org-wide scope) |
| **Branding** | Remove "Powered by" badge |
| **Filtering** | Filter by tags, rating, date range |
| **Animation** | Carousel speed, hover effects |
| **Advanced** | Custom CSS injection |

---

### Embed Implementation

Use **div + script approach with Shadow DOM**:

```html
<!-- User copies this to their site -->
<div
  data-testimonials-widget="wall-of-love"
  data-widget-id="wgt_abc123xyz"
></div>
<script async src="https://widget.testimonials.app/v1/embed.js"></script>
```

**Why this approach:**
- Simple copy-paste for users
- Shadow DOM isolates widget styles from host site
- No iframe restrictions
- Content is SEO-indexable
- Automatic height adjustment
- Dynamic updates without re-embedding

**Technical flow:**
1. Script loads and finds all `[data-testimonials-widget]` elements
2. Fetches widget config + testimonials from public API (`GET /public/widgets/:id`)
3. Renders widget inside Shadow DOM
4. Applies user's customization settings

#### Build & Deploy Strategy

The embed script is a **standalone package** (`packages/widget-embed/`) built with **Vite library mode**:

| Concern | Approach |
|---------|----------|
| **Build** | Vite library mode → single IIFE bundle (`embed.js`) with inlined CSS |
| **Bundle size** | Target < 30KB gzipped. No framework runtime — vanilla TS + DOM APIs |
| **Versioning** | URL-versioned: `/v1/embed.js`. Breaking changes → `/v2/embed.js` |
| **Hosting** | Served from API domain initially (`/public/embed/v1/embed.js`), CDN later |
| **Caching** | `Cache-Control: public, max-age=3600` for script. Widget data: `stale-while-revalidate` |
| **CORS** | Public API endpoint allows `*` origin for embed requests |
| **Error handling** | Graceful degradation — if API unreachable, show "Powered by" placeholder, never break host site |
| **Browser support** | ES2020+ (Shadow DOM supported in all modern browsers). No IE11 |

---

### Widget Scoping: Hybrid Form Approach

Widgets use a **hybrid scoping model** with an optional `form_id`:

| `form_id` | Scope | Behavior | Plan |
|-----------|-------|----------|------|
| **Set** | Form-scoped | Auto-includes all approved testimonials from that form. Testimonial picker scoped to that form | Free |
| **NULL** | Org-wide | Pulls testimonials from any form in the org. Testimonial picker shows all, grouped by form | Premium |

**Why hybrid:**
- **Simple default** — most users create one widget per form (pick form, done)
- **Power user unlock** — cross-form "Best of Company" showcases as a premium upsell
- **No schema debt** — optional FK is clean, no breaking changes later

**Builder UX flow:**
1. User selects a form (default, pre-selected if coming from a form page)
2. Testimonial picker scopes to that form's approved testimonials
3. Premium users see "All forms" option to unlock org-wide selection

### Widget Data Model

> **Note:** This reflects the implemented database schema. See migrations for authoritative DDL.

```
┌─────────────────────────────────────────────────────────────────┐
│ widgets                                                         │
├─────────────────────────────────────────────────────────────────┤
│ id                  TEXT PK  (nanoid_12)                        │
│ organization_id     TEXT FK  → organizations (tenant boundary)  │
│ form_id             TEXT FK  → forms (NULL = org-wide, premium) │
│ created_by          TEXT FK  → users                            │
│ name                TEXT     (e.g. "Homepage Carousel")         │
│ type                TEXT     CHECK (wall_of_love|carousel|      │
│                               single_quote)                    │
│ theme               TEXT     CHECK (light|dark) DEFAULT 'light' │
│ show_ratings        BOOLEAN  DEFAULT true                       │
│ show_dates          BOOLEAN  DEFAULT false                      │
│ show_company        BOOLEAN  DEFAULT true                       │
│ show_avatar         BOOLEAN  DEFAULT true                       │
│ max_display         SMALLINT (NULL = show all)                  │
│ settings            JSONB    DEFAULT '{}'  (type-specific)      │
│ is_active           BOOLEAN  DEFAULT true  (soft delete)        │
│ created_at          TIMESTAMPTZ                                 │
│ updated_at          TIMESTAMPTZ (auto-trigger)                  │
│ updated_by          TEXT FK  → users                            │
└─────────────────────────────────────────────────────────────────┘
         │ 1
         │
         │ M
┌─────────────────────────────────────────────────────────────────┐
│ widget_testimonials  (junction table)                           │
├─────────────────────────────────────────────────────────────────┤
│ id                  TEXT PK  (nanoid_12)                        │
│ organization_id     TEXT FK  → organizations (RLS boundary)     │
│ widget_id           TEXT FK  → widgets (CASCADE)                │
│ testimonial_id      TEXT FK  → testimonials (CASCADE)           │
│ display_order       SMALLINT (UNIQUE per widget)                │
│ is_featured         BOOLEAN  DEFAULT false                      │
│ added_at            TIMESTAMPTZ                                 │
│ added_by            TEXT FK  → users                            │
│                                                                 │
│ UNIQUE (widget_id, testimonial_id)                              │
│ UNIQUE (widget_id, display_order)                               │
└─────────────────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **Display toggles as columns, not JSONB** — `show_ratings`, `show_dates`, etc. are explicit boolean columns for Hasura permission control and query filtering
- **Junction table for testimonial selection** — not an array on the widget. Enables ordering (`display_order`), featuring (`is_featured`), and audit trail (`added_by`)
- **`settings` JSONB for type-specific config only** — truly varies by widget type (carousel speed, grid columns, etc.)

#### Settings JSONB Structure & Defaults

```typescript
// Wall of Love defaults
interface WallOfLoveSettings {
  columns: number;              // default: 3
  card_gap: number;             // default: 16 (px)
}

// Carousel defaults
interface CarouselSettings {
  autoplay: boolean;            // default: true
  autoplay_interval: number;    // default: 5000 (ms)
  show_navigation: boolean;     // default: true
}

// Single Quote defaults
interface SingleQuoteSettings {
  rotate: boolean;              // default: false
}

// Shared customization (all types, stored in JSONB)
interface SharedSettings {
  background_color?: string;    // default: theme-dependent
  card_color?: string;          // default: theme-dependent
  text_color?: string;          // default: theme-dependent
  accent_color?: string;        // default: theme-dependent
  font_size?: 'small' | 'medium' | 'large';  // default: 'medium'
}
```

**Default resolution:** When `settings` is `{}`, the embed script applies sensible defaults based on `theme` and `type`. Users only override what they customize.

---

### API Endpoints

```
POST   /widgets                  # Create widget
GET    /widgets                  # List org widgets
GET    /widgets/:id              # Get widget details
PUT    /widgets/:id              # Update widget
DELETE /widgets/:id              # Delete widget

# Public endpoint for embed
GET    /public/widgets/:id       # Get widget data for embedding
```

---

### Widget Builder UI

Located at `/:org/widgets/new` and `/:org/widgets/:id/edit`:

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Widgets                           [Save]        │
├─────────────────────────────┬───────────────────────────────┤
│  ALWAYS VISIBLE             │                               │
│                             │                               │
│  Widget Type:               │                               │
│  ┌──────────┐ ┌──────────┐  │                               │
│  │ Wall of  │ │ Carousel │  │                               │
│  │ Love ✓   │ │          │  │                               │
│  └──────────┘ └──────────┘  │                               │
│                             │                               │
│  Widget Name:               │                               │
│  [My Wall of Love_________] │                               │
│                             │       LIVE PREVIEW            │
│  ┌──────────────────────┐   │                               │
│  │ Content (2) │ Design │   │  ┌─────────┐ ┌─────────┐     │
│  ├──────────────────────┤   │  │ ★★★★★   │ │ ★★★★☆   │     │
│  │                      │   │  │ "Great!"│ │ "Nice"  │     │
│  │  Form:               │   │  │ John D. │ │ Jane S. │     │
│  │  [All forms ▼]       │   │  └─────────┘ └─────────┘     │
│  │                      │   │  ┌─────────┐                 │
│  │  Testimonials:       │   │  │ ★★★★★   │                 │
│  │  [✓] "Great!" - John │   │  │ "Wow!"  │                 │
│  │  [✓] "Nice" - Jane   │   │  │ Bob K.  │                 │
│  │  [ ] "Good" - Bob    │   │  └─────────┘                 │
│  │                      │   │                               │
│  │  2 of 3 selected     │   │                               │
│  └──────────────────────┘   │                               │
├─────────────────────────────┴───────────────────────────────┤
│                                              [Embed Code]   │
└─────────────────────────────────────────────────────────────┘
```

> Content tab (default) surfaces testimonial selection — the primary user action.
> Design tab contains theme, display toggles, max display, and active toggle.
> Widget type and name remain above tabs as foundational, always-visible controls.

---

### Embed Code Modal

After saving widget:

```
┌─────────────────────────────────────────────────────────────┐
│  Embed Your Widget                                     [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Copy this code and paste it into your website:             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ <div                                                │   │
│  │   data-testimonials-widget="wall-of-love"           │   │
│  │   data-widget-id="wgt_abc123xyz"                    │   │
│  │ ></div>                                             │   │
│  │ <script async                                       │   │
│  │   src="https://widget.testimonials.app/v1/embed.js" │   │
│  │ ></script>                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                              [Copy Code]    │
│                                                             │
│  Works with: Webflow, WordPress, Squarespace, Wix,          │
│              Framer, Notion, Carrd, and more                │
│                                                             │
│  [View Integration Guides]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Alternatives Considered

### Alternative 1: iframe-based Embedding

**Approach:** Serve widgets via iframes like Testimonial.to

**Rejected because:**
- Requires iframe resizer script for dynamic height
- SEO implications (content not indexable)
- Some platforms restrict iframes
- Less seamless integration with host site

### Alternative 2: React/Vue Component Library

**Approach:** Publish npm package for framework users

**Deferred because:**
- Limits audience to developers
- Multiple framework versions to maintain
- Simple script embed covers 95% of use cases
- Can add later for advanced integrations

### Alternative 3: More Widget Types in MVP

**Approach:** Launch with 6+ widget types

**Rejected because:**
- Delays MVP launch
- Core 3 widgets cover most needs
- Can iterate based on user feedback
- Competitors confirm these 3 are most used

### Alternative 4: Form-Scoped Only (No Org-Wide Widgets)

**Approach:** Every widget must be tied to exactly one form. No cross-form widgets.

**Rejected because:**
- Blocks "Best of Company" showcase use case entirely
- Forces users to create duplicate widgets per form for homepage
- Simpler initially, but creates schema debt if we add org-wide later
- Hybrid approach (optional `form_id`) gives us both with minimal extra complexity

### Alternative 5: Org-Wide Only (No Form Scoping)

**Approach:** Widgets are always org-scoped. Users pick testimonials from any form. This is what the current schema implements (no `form_id` column).

**Modified because:**
- Overwhelming testimonial picker for orgs with many forms
- No simple "show all from this form" default
- Most users think in terms of forms, not orgs
- Adding optional `form_id` gives a natural default scope without removing flexibility

### Alternative 6: No Shadow DOM (Direct DOM)

**Approach:** Inject styles directly into host page

**Rejected because:**
- Style conflicts with host site CSS
- Unpredictable appearance
- Hard to debug customer issues
- Shadow DOM provides clean isolation

---

## Implementation Plan

### Phase 1: Data Layer

> `widgets` and `widget_testimonials` tables + Hasura metadata already exist.

1. Add migration: `form_id` optional FK column on `widgets` table
2. Update Hasura metadata for `form_id` relationship and permissions
3. Create widget CRUD API endpoints (routes skeleton exists, needs handlers)
4. Create public widget data endpoint (`GET /public/widgets/:id` — returns widget config + testimonials in one response)
5. Add Zod validation schemas for widget settings JSONB
6. Create GraphQL mutations + mutation composables in web entity

### Phase 2: Widget Builder UI

1. Create widget list page (`/:org/widgets`)
2. Create widget builder page (`/:org/widgets/new`)
3. Implement form selector (dropdown, scopes testimonial picker)
4. Implement live preview component
5. Add testimonial selection UI (scoped by form, with ordering)
6. Implement embed code generation modal

### Phase 3: Embed Script & Rendering

1. Create `packages/widget-embed/` package with Vite library build config
2. Build loader.ts — find `[data-testimonials-widget]` elements, fetch data
3. Build renderer.ts — Shadow DOM setup, style injection
4. Create Wall of Love component (masonry grid, vanilla TS)
5. Create Carousel component (slider, touch/swipe)
6. Create Single Quote component
7. Add responsive behavior and loading states

### Phase 4: Polish

1. Error handling for embed failures (graceful degradation)
2. Caching headers for public endpoint and embed script
3. Widget analytics (impressions, optional)
4. Integration guides documentation

---

## E2E Test Data Seeding Plan

### Context

The widget builder E2E tests (`builder-tabs.spec.ts`) rely on pre-existing testimonials in the E2E account. This is fragile — tests break if data changes. We need to seed test testimonials via the API, following the established 3-layer pattern used by forms.

**Goal:** Tests that need testimonials get seeded data; tests that don't (empty state, save button validation) use the base fixture.

### Architecture: 3-Layer Seeding Pattern

Matches the existing form seeding infrastructure:

```
Layer 1: .gql files (api/src/entities/testimonial/graphql/)
         → pnpm codegen → typed documents in operations.ts

Layer 2: API e2e-support feature (api/src/features/e2e-support/testimonials/)
         → routes.ts (thin HTTP handlers) + crud.ts (executeGraphQLAsAdmin)

Layer 3: Client fixtures (apps/web/tests/e2e/entities/testimonial/)
         → API functions + Playwright fixture extension with setup/cleanup
```

### Layer 1: GraphQL Operations

**Create** `api/src/entities/testimonial/graphql/createTestTestimonial.gql`
- `insert_testimonials_one` mutation
- Variables: `organization_id`, `content`, `customer_name`, `customer_email`, `customer_company`, `rating` (smallint), `status`, `source`, `form_id`
- Returns: `id`, `content`, `customer_name`, `status`

**Create** `api/src/entities/testimonial/graphql/deleteTestTestimonial.gql`
- `delete_testimonials_by_pk` mutation
- Variable: `id`
- Returns: `id`

Then run `pnpm codegen` in `api/` to generate typed documents.

### Layer 2: API E2E Support

**Create** `api/src/features/e2e-support/testimonials/types.ts`
- `TestTestimonialInput` — content, customer_name, customer_email?, customer_company?, rating?, status?
- `TestTestimonialResult` — id, content, customer_name, status

**Create** `api/src/features/e2e-support/testimonials/crud.ts`
- `createTestTestimonial(orgId, input)` — calls `executeGraphQLAsAdmin(CreateTestTestimonialDocument, ...)`
- `deleteTestTestimonial(id)` — calls `executeGraphQLAsAdmin(DeleteTestTestimonialDocument, ...)`
- Defaults: `status: 'approved'`, `source: 'e2e_test'`

**Create** `api/src/features/e2e-support/testimonials/routes.ts`
- `createTestimonials(c: Context)` — POST handler, accepts `{ testimonials: TestTestimonialInput[] }`, creates all via `crud.ts`, returns array of results
- `deleteTestimonial(c: Context)` — DELETE handler by `:id` param
- Uses `env.E2E_ORGANIZATION_ID` (same as forms pattern)

**Create** `api/src/features/e2e-support/testimonials/index.ts` — barrel export

**Modify** `api/src/features/e2e-support/index.ts` — add testimonial exports

**Modify** `api/src/routes/e2e.ts` — register `POST /testimonials` and `DELETE /testimonials/:id`

### Layer 3: Client-Side Fixtures

**Create** `apps/web/tests/e2e/entities/testimonial/types.ts`
- `TestTestimonialData` — id, content, customer_name, customer_email, customer_company, rating, status
- `CreateTestimonialsResponse` — `{ testimonials: TestTestimonialData[] }`

**Create** `apps/web/tests/e2e/entities/testimonial/fixtures/testimonial-api.ts`
- `createTestTestimonials(overrides?)` — POST to `/testimonials` with default data
- `deleteTestTestimonial(id)` — DELETE to `/testimonials/:id`
- Default factory: 3 approved testimonials with distinct names

**Create** `apps/web/tests/e2e/entities/testimonial/fixtures/testimonial-fixtures.ts`
- Extends `appTest` with `testimonialsViaApi` fixture
- Setup: creates 3 testimonials → `await use(data)`
- Cleanup: deletes all created testimonials (try/catch per form pattern)

**Create** `apps/web/tests/e2e/entities/testimonial/index.ts` — barrel exports

**Modify** `apps/web/tests/e2e/entities/index.ts` — add testimonial entity exports

### Layer 4: Update Tests

**Modify** `apps/web/tests/e2e/features/widgets/focused-tests/builder-tabs.spec.ts`
- Import from testimonial fixtures instead of app fixtures
- Tests needing testimonials (badge, selection) use `testimonialsViaApi` fixture param
- Tests not needing testimonials (save button, design tab) use base `authedPage` only
- Use `testimonialsViaApi` data for assertions — no hardcoded names

### Default Seeded Data

3 testimonials with varied data for meaningful test coverage:

| # | customer_name | rating | content | status |
|---|--------------|--------|---------|--------|
| 1 | Alice Test | 5 | "Great product, highly recommend!" | approved |
| 2 | Bob Test | 4 | "Good experience overall." | approved |
| 3 | Carol Test | 5 | "Solid tool for our team." | approved |

All created with `source: 'e2e_test'` for easy identification and cleanup.

### Key Files Referenced

| File | Role |
|------|------|
| `api/src/features/e2e-support/forms/routes.ts` | Pattern source (thin route handlers) |
| `api/src/features/e2e-support/forms/crud/shared/primitives.ts` | Pattern source (executeGraphQLAsAdmin) |
| `api/codegen.ts` | Scans `src/**/*.gql` for codegen |
| `apps/web/tests/e2e/shared/api/test-api-client.ts` | `testApiRequest()` client |
| `apps/web/tests/e2e/entities/form/fixtures/form-fixtures.ts` | Playwright fixture pattern |
| `api/src/routes/e2e.ts` | Route registration |
| `api/src/features/e2e-support/index.ts` | E2E support barrel |

### Verification

1. `pnpm codegen` in `api/` — generates typed documents for new `.gql` files
2. `pnpm typecheck` — no type errors across api and web
3. Run `builder-tabs.spec.ts` — all 4 tests pass with seeded data, no hardcoded names
4. Verify cleanup: no leftover test testimonials after run

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Core feature complete** | Users can display testimonials anywhere |
| **Revenue enabler** | Premium features (multi-form widgets, branding removal) drive upgrades |
| **Market parity** | Matches competitor offerings |
| **Extensible foundation** | Easy to add more widget types later |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **Script maintenance** | Version the embed script, graceful degradation |
| **Cross-origin complexity** | Proper CORS setup, CDN for reliability |
| **Style isolation limits** | Document known edge cases, provide CSS escape hatch |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance on slow sites | Medium | Medium | Async loading, lazy images |
| Browser compatibility | Low | High | Test major browsers, polyfills |
| Widget abuse/hotlinking | Low | Low | Rate limiting, referrer checks |

---

## File Structure

### Database

```
db/hasura/migrations/default/
├── 1767078492000_...__widgets__create_table/           # ✅ EXISTS
│   └── up.sql
├── 1767078552000_...__widget_testimonials__create_table/ # ✅ EXISTS
│   └── up.sql
└── XXXXXX__widgets__add_form_id/                       # 🔲 TODO
    └── up.sql

db/hasura/metadata/databases/default/tables/
├── public_widgets.yaml                                 # ✅ EXISTS
└── public_widget_testimonials.yaml                     # ✅ EXISTS
```

### API

```
api/src/features/widgets/
├── routes.ts                    # CRUD endpoints
├── getWidget.ts                 # Get widget by ID
├── listWidgets.ts               # List org widgets
├── createWidget.ts              # Create widget
├── updateWidget.ts              # Update widget
├── deleteWidget.ts              # Delete widget
├── getPublicWidget.ts           # Public endpoint for embed
├── types.ts                     # Widget types
└── __tests__/
    └── routes.test.ts
```

### Web App

```
apps/web/src/
├── entities/widget/
│   ├── graphql/
│   │   ├── fragments/
│   │   │   └── WidgetBasic.gql         # ✅ EXISTS
│   │   ├── queries/
│   │   │   ├── getWidget.gql           # ✅ EXISTS
│   │   │   └── getWidgets.gql          # ✅ EXISTS
│   │   └── mutations/                  # 🔲 TODO
│   │       ├── createWidget.gql
│   │       ├── updateWidget.gql
│   │       └── deleteWidget.gql
│   ├── composables/
│   │   ├── queries/
│   │   │   ├── useGetWidget.ts         # ✅ EXISTS
│   │   │   └── useGetWidgets.ts        # ✅ EXISTS
│   │   ├── mutations/                  # 🔲 TODO
│   │   │   ├── useCreateWidget.ts
│   │   │   ├── useUpdateWidget.ts
│   │   │   └── useDeleteWidget.ts
│   │   └── index.ts                    # ✅ EXISTS
│   ├── models/
│   │   ├── index.ts                    # ✅ EXISTS (types)
│   │   └── queries.ts                  # ✅ EXISTS
│   └── index.ts                        # ✅ EXISTS
│
├── features/widgetBuilder/              # 🔲 TODO (entire feature)
│   ├── ui/
│   │   ├── WidgetBuilder.vue
│   │   ├── WidgetTypeSelector.vue
│   │   ├── WidgetFormSelector.vue
│   │   ├── WidgetSettingsPanel.vue
│   │   ├── WidgetPreview.vue
│   │   ├── WidgetTestimonialSelector.vue
│   │   └── WidgetEmbedModal.vue
│   ├── composables/
│   │   └── useWidgetBuilder.ts
│   └── index.ts
│
└── pages/[org]/widgets/
    ├── index.vue                        # ✅ EXISTS (skeleton)
    └── [urlSlug].vue                    # ✅ EXISTS (skeleton)
```

### Embed Script

```
packages/widget-embed/
├── src/
│   ├── index.ts                 # Entry point
│   ├── loader.ts                # Find & init widgets
│   ├── api.ts                   # Fetch widget data
│   ├── renderer.ts              # Shadow DOM setup
│   ├── components/
│   │   ├── WallOfLove.ts
│   │   ├── Carousel.ts
│   │   └── SingleQuote.ts
│   └── styles/
│       └── base.css
├── vite.config.ts               # Library build
└── package.json
```

---

## References

### Internal
- `research/research.md` - Competitor analysis and screenshots

### External
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Senja Widgets](https://senja.io/testimonial-widgets) - Competitor reference
- [Testimonial.to Widgets](https://testimonial.to/widgets) - Competitor reference
