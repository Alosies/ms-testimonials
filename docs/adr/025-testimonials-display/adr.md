# ADR-025: Testimonials Display (List & Detail Views)

## Doc Connections
**ID**: `adr-025-testimonials-display`

2026-02-21 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `prd-testimonials-mvp` - MVP feature requirements (Dashboard: view all testimonials, Approve/reject)
- `adr-022-form-dashboard` - Form dashboard analytics and sub-page patterns
- `adr-024-widgets-v1` - Widget builder and testimonial selection UI

---

## Status

**Proposed** - 2026-02-21

- 2026-02-21: Research completed, initial proposal

---

## Context

### The Problem

After testimonials are collected through forms and assembled (manually or via AI), users need a way to:
1. **View all testimonials** across the organization in one place
2. **View form-specific testimonials** scoped to a single collection form
3. **Approve, reject, or manage** testimonial status in a streamlined workflow
4. **Inspect individual testimonials** with full detail (customer info, source answers, audit trail)

Currently, both the organization-level testimonials page (`/:org/testimonials`) and the form-scoped testimonials page (`/:org/forms/:urlSlug/testimonials`) are placeholder stubs with TODO comments.

### Business Value

| Value | Description |
|-------|-------------|
| **Approval workflow** | Users must review and approve testimonials before they appear in widgets |
| **Quality control** | Filter by status, rating, and source to find the best testimonials |
| **Form attribution** | See which forms generate the most and best testimonials |
| **Operational clarity** | Central hub for all testimonial management reduces context switching |

### Existing Infrastructure

The following is already in place:
- **Database schema**: `testimonials` table with status workflow, customer fields, submission relationship
- **Hasura metadata**: Full CRUD permissions for org roles, anonymous read for approved only
- **GraphQL operations**: `GetTestimonials`, `GetTestimonial`, `GetTestimonialsStats` queries with `TestimonialBasic` fragment
- **Entity composables**: `useGetTestimonials`, `useGetTestimonial`, `useGetTestimonialsStats`
- **Routing**: `goToTestimonials()`, `goToFormTestimonials()`, `getTestimonialPath()` all defined
- **Page stubs**: Both page files exist with placeholder content
- **Sidebar navigation**: "Testimonials" menu item wired to `/:org/testimonials`

### Key Schema Relationship: Testimonials to Forms

Testimonials connect to forms **through the `form_submissions` table**:

```
testimonials.submission_id → form_submissions.id → form_submissions.form_id → forms.id
```

This means:
- A testimonial has a `submission_id` FK to `form_submissions`
- The `form_submissions` table has a `form_id` FK to `forms`
- To filter testimonials by form, we traverse: `testimonials → submission → form`
- Testimonials with `source = 'manual'` or `source = 'import'` may have `submission_id = NULL` (no form association)

The Hasura relationship chain is:
- `testimonials.submission` (object relationship) → `form_submissions`
- `form_submissions.form` (object relationship) → `forms`

---

## Decision

### Two Display Contexts, One Shared Component

Build a **single reusable `TestimonialsList` feature** that powers both display contexts:

| Context | Route | Scope | Filter |
|---------|-------|-------|--------|
| **Organization Hub** | `/:org/testimonials` | All testimonials in the org | None (shows all) |
| **Form Sub-page** | `/:org/forms/:urlSlug/testimonials` | Testimonials from one form | `submission.form_id = :formId` |

The feature component receives an optional `formId` prop. When provided, it filters testimonials to that form only.

### Layout: Table with Detail Panel

Use a **sortable table with sticky detail panel**, following the same pattern established by the Forms list page (`FormsTable.vue`). The detail panel on the right provides full testimonial information, making card-based layouts redundant visual weight. Tables are more space-efficient, support column sorting, and are consistent with the forms list.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Testimonials                                                        │
│  Manage and approve customer testimonials                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─ All 24 ─┬─ Pending 5 ─┬─ Approved 16 ─┬─ Rejected 3 ─┐  🔍    │
│  └──────────┴─────────────┴───────────────┴──────────────┘          │
│                                                                      │
├──────────────────────────────────────┬───────────────────────────────┤
│  Table (2/3)                         │  Detail Panel (1/3)           │
│                                      │  (sticky, lg+ screens)       │
│  CUSTOMER ↕  CONTENT   RATING STATUS │                               │
│  ─────────────────────────────────── │  ┌───────────────────────┐   │
│  [A] John    "This pro… ★★★★★ ●Pend │  │ [Avatar]              │   │
│      Acme Co                         │  │ John Doe              │   │
│  ─────────────────────────────────── │  │ CEO, Acme Corp        │   │
│  [J] Jane    "Best inv… ★★★★☆ ✓Appr │  │ john@acme.com         │   │
│      TechCo                          │  ├───────────────────────┤   │
│  ─────────────────────────────────── │  │ ★★★★★                 │   │
│  [M] Mike    "Good ser… —     ✗Reje  │  │ "This product changed │   │
│      StartUp                         │  │  how we do business…" │   │
│                                      │  ├───────────────────────┤   │
│                                      │  │ Source: Form          │   │
│                                      │  │ Status: Pending       │   │
│                                      │  │ [✓ Approve] [✗ Reject]│   │
│                                      │  └───────────────────────┘   │
│                                      │                               │
└──────────────────────────────────────┴───────────────────────────────┘
```

**On mobile (< lg):** The detail panel is hidden. Clicking a row navigates to the testimonial detail page (`/:org/testimonials/:urlSlug`).

---

### Data Fetching Strategy

#### Organization-Level: Hasura GraphQL

Use Hasura GraphQL for the testimonials list. This aligns with the Data Layer Decision Tree — it's a READ operation with RLS filtering.

**New GraphQL Query: `GetTestimonialsWithSubmission`**

The existing `GetTestimonials` query and `TestimonialBasic` fragment do not include the submission/form relationship. We need to extend the fragment or create a new one that includes the form name for attribution:

```graphql
fragment TestimonialWithForm on testimonials {
  ...TestimonialBasic
  submission {
    id
    form_id
    form {
      id
      name
    }
  }
}
```

**New Query: `GetFormTestimonials`**

For form-scoped view, filter through the submission relationship:

```graphql
query GetFormTestimonials($organizationId: String!, $formId: String!, $limit: Int) {
  testimonials(
    where: {
      organization_id: { _eq: $organizationId }
      submission: { form_id: { _eq: $formId } }
    }
    order_by: { created_at: desc }
    limit: $limit
  ) {
    ...TestimonialWithForm
  }
}
```

**Stats Query: `GetFormTestimonialsStats`**

Reuse the existing `GetTestimonialsStats` pattern but add form filtering:

```graphql
query GetFormTestimonialsStats($organizationId: String!, $formId: String!) {
  total: testimonials_aggregate(
    where: {
      organization_id: { _eq: $organizationId }
      submission: { form_id: { _eq: $formId } }
    }
  ) { aggregate { count } }
  # ... same pattern for pending, approved, rejected
}
```

#### Mutations: Approve/Reject via Hasura

Testimonial status updates are simple single-entity mutations — ideal for Hasura:

```graphql
mutation ApproveTestimonial($id: String!, $approvedBy: String!) {
  update_testimonials_by_pk(
    pk_columns: { id: $id }
    _set: {
      status: "approved"
      approved_by: $approvedBy
      approved_at: "now()"
    }
  ) {
    id
    status
    approved_by
    approved_at
  }
}

mutation RejectTestimonial($id: String!, $rejectedBy: String!, $reason: String) {
  update_testimonials_by_pk(
    pk_columns: { id: $id }
    _set: {
      status: "rejected"
      rejected_by: $rejectedBy
      rejected_at: "now()"
      rejection_reason: $reason
    }
  ) {
    id
    status
    rejected_by
    rejected_at
    rejection_reason
  }
}
```

---

### Table Columns

Each testimonial row in the table shows:

| Column | Content | Responsive |
|--------|---------|------------|
| **Customer** | Avatar/initials + name + "at Company" subtitle | Always visible |
| **Content** | Truncated single-line text | Hidden on sm |
| **Rating** | Filled/empty star icons (3.5 size) | Hidden on md |
| **Status** | Colored dot + label (amber=pending, green=approved, red=rejected) | Always visible |
| **Date** | Relative time (Today, Yesterday, X days ago) | Hidden on lg |

- Column headers are sortable (Customer, Rating, Status, Date); Content is not sortable
- Selected row gets `bg-primary/5` highlight + left border accent
- Approve/reject actions are handled via the detail panel (no inline actions)

### Detail Panel Component

The sticky side panel shows full testimonial details when a row is selected:

| Section | Content |
|---------|---------|
| **Customer Profile** | Avatar (large), name, title, company, email, social links (LinkedIn, Twitter) |
| **Testimonial Content** | Full text (no truncation), rating stars |
| **Source Info** | Source type (form/import/manual), form name + link, submission date |
| **Status & Audit** | Current status badge, approved/rejected by + timestamp, rejection reason |
| **Actions** | Approve, Reject (with reason modal), Edit (future), Delete (with confirmation) |

### Testimonial Detail Page

For the `/:org/testimonials/:urlSlug` route, show a full-page version of the detail panel. This is used:
- On mobile (no side panel available)
- When linked from other parts of the app (dashboard, notifications)
- For deep-linking and bookmarking

The detail page follows the `FormSubpageLayout` pattern but scoped to testimonials, with a back button to `/:org/testimonials`.

---

### Status Filter Tabs

Follow the same pattern as the Form Responses page:

```typescript
const statusOptions: Array<{ value: TestimonialStatus | 'all'; label: string; count: number }> = [
  { value: 'all', label: 'All', count: stats.total },
  { value: 'pending', label: 'Pending', count: stats.pending },
  { value: 'approved', label: 'Approved', count: stats.approved },
  { value: 'rejected', label: 'Rejected', count: stats.rejected },
];
```

Tabs show counts from the stats query. Clicking a tab filters the list.

### Search

Client-side text search across `content`, `customer_name`, `customer_company`. For MVP, no server-side search — the full list is fetched and filtered locally. Given expected data volumes (< 1000 testimonials per org in early stages), this is acceptable.

### Sorting

Default sort: `created_at desc` (newest first).

Optional sort toggle for:
- **Newest first** (default)
- **Oldest first**
- **Highest rated**

---

### Rejection Workflow

When rejecting a testimonial, show a small modal/dialog:

```
┌────────────────────────────────────┐
│  Reject Testimonial            [X] │
├────────────────────────────────────┤
│                                    │
│  Reason (optional):               │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  This is an internal note and     │
│  won't be shared with the         │
│  customer.                        │
│                                    │
│              [Cancel]  [Reject]    │
└────────────────────────────────────┘
```

The rejection reason is stored in `rejection_reason` for internal reference.

---

### Empty States

| Context | Message |
|---------|---------|
| **No testimonials at all (org)** | "No testimonials yet. Share your collection forms to start receiving testimonials." + CTA to Forms page |
| **No testimonials for form** | "No testimonials collected from this form yet. Share the form link to start collecting." + Copy link button |
| **No results for filter** | "No [pending/approved/rejected] testimonials" + Clear filter button |
| **No search results** | "No testimonials matching '[query]'" + Clear search button |

---

### Organization vs Form Scoped: Key Differences

| Aspect | Organization (`/:org/testimonials`) | Form (`/:org/forms/:urlSlug/testimonials`) |
|--------|-------------------------------------|---------------------------------------------|
| **Layout** | `AuthLayout` (full page) | `FormSubpageLayout` (sub-page with header) |
| **Header** | Page title "Testimonials" | `FormSubpageHeader` with back button |
| **Query** | `GetTestimonials` (all org) | `GetFormTestimonials` (filtered by form_id) |
| **Form attribution** | Shown on each row ("via Form Name") | Hidden (redundant — already scoped) |
| **Stats** | Org-wide counts | Form-specific counts |
| **Empty state CTA** | Link to Forms list | Copy form share link |

---

## Alternatives Considered

### Alternative 1: Card-Based Layout

**Approach:** Display testimonials as vertical cards in a list, similar to the Form Responses page.

**Rejected because:**
- The detail panel already shows full testimonial content, making cards redundant visual weight
- Cards are tall, showing only a few testimonials at once — poor scannability
- No support for column sorting without additional UI
- Tables are consistent with the Forms list page pattern and more space-efficient

### Alternative 2: Masonry Grid (Like Wall of Love Widget)

**Approach:** Display testimonials in a Pinterest-style masonry grid.

**Rejected because:**
- Masonry is great for display/public-facing, but poor for management workflow
- No natural place for action buttons (approve/reject)
- Difficult to scan sequentially
- No way to show detail panel alongside
- The dashboard is a management tool, not a public showcase

### Alternative 3: Separate Detail Page Only (No Side Panel)

**Approach:** Clicking a testimonial always navigates to a separate page.

**Rejected because:**
- Too many page transitions for approval workflow
- Users often review multiple testimonials in sequence
- Side panel allows quick scanning without losing list context
- The Form Responses page proves this pattern works well for sequential review

### Alternative 4: Full-Page Detail Panel (No List)

**Approach:** Show one testimonial at a time with prev/next navigation.

**Rejected because:**
- No overview of total volume
- Can't quickly scan to find specific testimonials
- Status filter tabs lose value without the list
- Better suited for a dedicated "review queue" feature (post-MVP)

### Alternative 5: Direct `form_id` Column on Testimonials

**Approach:** Add a `form_id` FK column directly on the `testimonials` table instead of traversing through `form_submissions`.

**Deferred because:**
- The data already exists through the submission relationship
- Adding a denormalized `form_id` creates a maintenance burden (keep in sync)
- Hasura can filter through nested relationships efficiently
- If query performance becomes an issue, we can add this as an optimization later with a migration

---

## Implementation Plan

### Phase 1: Data Layer (GraphQL + Composables)

1. Create `TestimonialWithForm` fragment extending `TestimonialBasic` with submission/form data
2. Create `GetTestimonialsWithForm` query (org-level, with submission.form)
3. Create `GetFormTestimonials` query (form-scoped, filtered by form_id)
4. Create `GetFormTestimonialsStats` query
5. Create `ApproveTestimonial` mutation
6. Create `RejectTestimonial` mutation
7. Create composables: `useGetTestimonialsWithForm`, `useGetFormTestimonials`, `useGetFormTestimonialsStats`, `useApproveTestimonial`, `useRejectTestimonial`
8. Run GraphQL codegen to generate TypeScript types
9. Export new types from testimonial entity models

### Phase 2: Shared Feature Components

1. Create `features/testimonialsList/` feature directory
2. Build `TestimonialsTable.vue` — sortable table shell with column headers
3. Build `TestimonialsTableRow.vue` — individual table row with avatar, content, rating, status, date
4. Build `TestimonialDetailPanel.vue` — sticky side panel with full details and actions
5. Build `TestimonialsListFeature.vue` — main feature composing table + panel + filters + search
6. Build `TestimonialsEmptyState.vue` — empty state with contextual messaging
7. Build `TestimonialsTableSkeleton.vue` — loading skeleton matching table columns
8. Build `RejectTestimonialModal.vue` — rejection reason dialog
9. Create `useTestimonialsTableState.ts` — composable for filter/sort/search/selection state

### Phase 3: Page Integration

1. Update `[org]/testimonials/index.vue` — wire up `TestimonialsListFeature` with org-level data
2. Update `[org]/forms/[urlSlug]/testimonials.vue` — wire up with form-scoped data
3. Implement `[org]/testimonials/[urlSlug].vue` — full-page testimonial detail
4. Add mobile-responsive behavior (hide panel < lg, row click navigates to detail page)

### Phase 4: Polish

1. Optimistic UI updates for approve/reject (instant status change, rollback on error)
2. Toast notifications for actions (approved, rejected, deleted)
3. Keyboard shortcuts for power users (j/k to navigate, a to approve, r to reject) — post-MVP
4. Infinite scroll or pagination for large lists — post-MVP (client-side filter is sufficient for MVP)

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Core workflow complete** | Users can review, approve, and reject testimonials end-to-end |
| **Consistent UX** | Follows established table pattern from Forms list and 2:1 split panel layout |
| **Reusable components** | `TestimonialsTable` pattern consistent with `FormsTable`; detail panel reusable in dashboard |
| **Minimal new infrastructure** | Leverages existing GraphQL queries, Hasura permissions, and routing |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **Client-side search** | Sufficient for MVP volumes; can add server-side later via Drizzle (ADR-021) |
| **No bulk actions** | Single approve/reject for now; bulk operations as post-MVP |
| **No testimonial editing** | Edit capability deferred; approve/reject covers MVP needs |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Nested relationship filter performance | Low | Medium | Hasura optimizes joins; add `form_id` column to testimonials if needed |
| Large testimonial lists on org page | Low (early stage) | Medium | Pagination/infinite scroll post-MVP |
| Mobile UX without detail panel | Medium | Low | Full-page detail as fallback; mobile is secondary for dashboard |

---

## File Structure

### GraphQL Operations

```
apps/web/src/entities/testimonial/graphql/
├── fragments/
│   ├── TestimonialBasic.gql          # ✅ EXISTS
│   └── TestimonialWithForm.gql       # 🔲 NEW - extends Basic with submission.form
├── queries/
│   ├── getTestimonials.gql           # ✅ EXISTS (org-level, basic fragment)
│   ├── getTestimonial.gql            # ✅ EXISTS
│   ├── getTestimonialsStats.gql      # ✅ EXISTS
│   ├── getTestimonialsWithForm.gql   # 🔲 NEW - org-level with form data
│   ├── getFormTestimonials.gql       # 🔲 NEW - form-scoped
│   └── getFormTestimonialsStats.gql  # 🔲 NEW - form-scoped stats
└── mutations/
    ├── approveTestimonial.gql        # 🔲 NEW
    └── rejectTestimonial.gql         # 🔲 NEW
```

### Composables

```
apps/web/src/entities/testimonial/composables/
├── queries/
│   ├── useGetTestimonials.ts             # ✅ EXISTS
│   ├── useGetTestimonial.ts              # ✅ EXISTS
│   ├── useGetTestimonialsStats.ts        # ✅ EXISTS
│   ├── useGetTestimonialsWithForm.ts     # 🔲 NEW
│   ├── useGetFormTestimonials.ts         # 🔲 NEW
│   └── useGetFormTestimonialsStats.ts    # 🔲 NEW
├── mutations/
│   ├── useApproveTestimonial.ts          # 🔲 NEW
│   └── useRejectTestimonial.ts           # 🔲 NEW
└── index.ts                              # ✅ EXISTS (update exports)
```

### Feature Components

```
apps/web/src/features/testimonialsList/
├── ui/
│   ├── TestimonialsListFeature.vue       # Main feature component
│   ├── TestimonialsTable.vue             # Sortable table shell
│   ├── TestimonialsTableRow.vue          # Individual table row
│   ├── TestimonialsTableSkeleton.vue     # Loading skeleton
│   ├── TestimonialDetailPanel.vue        # Side panel
│   ├── TestimonialsEmptyState.vue        # Empty states
│   └── RejectTestimonialModal.vue        # Rejection dialog
├── composables/
│   └── useTestimonialsTableState.ts      # Filter/sort/search state
├── models/
│   └── index.ts                          # SortColumn, SortDirection types
└── index.ts                              # Public exports
```

### Pages

```
apps/web/src/pages/[org]/
├── testimonials/
│   ├── index.vue                         # ✅ EXISTS (update: wire feature)
│   └── [urlSlug].vue                     # ✅ EXISTS (update: full detail page)
└── forms/[urlSlug]/
    └── testimonials.vue                  # ✅ EXISTS (update: wire feature)
```

---

## References

### Internal
- `apps/web/src/pages/[org]/forms/[urlSlug]/responses.vue` — Reference implementation for 2:1 split layout pattern
- `apps/web/src/features/formResponses/` — Reference for table state composable, filtering, and empty states
- `apps/web/src/entities/testimonial/` — Existing entity with queries and composables
- `docs/adr/022-form-dashboard/adr.md` — Form dashboard patterns
- `docs/adr/024-widgets-v1/adr.md` — Widget builder (will reuse TestimonialCard for testimonial picker)
