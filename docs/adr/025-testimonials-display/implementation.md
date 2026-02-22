# ADR-025: Testimonials Display - Implementation Plan

**Date**: 2026-02-21
**Status**: Proposed
**Aligned with**: ADR-022 (Form Dashboard patterns), ADR-024 (Widgets v1)

---

## Current Infrastructure Assessment

The following components are **already implemented**:

| Component | Location | Status |
|-----------|----------|--------|
| Testimonials table | `db/hasura/migrations/` | ✅ Full schema with status workflow |
| Hasura permissions | `db/hasura/metadata/.../public_testimonials.yaml` | ✅ CRUD for org roles, anonymous read |
| `TestimonialBasic` fragment | `entities/testimonial/graphql/fragments/` | ✅ All fields except submission/form |
| `GetTestimonials` query | `entities/testimonial/graphql/queries/` | ✅ Org-level, basic fragment |
| `GetTestimonial` query | `entities/testimonial/graphql/queries/` | ✅ By PK |
| `GetTestimonialsStats` query | `entities/testimonial/graphql/queries/` | ✅ Aggregate counts by status |
| `useGetTestimonials` | `entities/testimonial/composables/queries/` | ✅ Apollo composable |
| `useGetTestimonial` | `entities/testimonial/composables/queries/` | ✅ Apollo composable |
| `useGetTestimonialsStats` | `entities/testimonial/composables/queries/` | ✅ Apollo composable |
| Entity types | `entities/testimonial/models/` | ✅ `Testimonial`, `TestimonialItem`, `TestimonialStatus` |
| Routing utilities | `shared/routing/composables/useRouting.ts` | ✅ `goToTestimonials()`, `goToFormTestimonials()`, `getTestimonialPath()` |
| Page stubs | `pages/[org]/testimonials/`, `pages/[org]/forms/[urlSlug]/testimonials.vue` | ✅ Placeholders with routing |
| Sidebar navigation | `features/sidebar/` | ✅ "Testimonials" menu item |
| `FormSubpageLayout` | `layouts/FormSubpageLayout.vue` | ✅ Consistent sub-page wrapper |
| `FormSubpageHeader` | `features/formDashboard/ui/` | ✅ Back button + title + actions slot |
| Hasura relationship chain | `testimonials → submission → form` | ✅ Object relationships defined |

---

## Skill Assignments Overview

Each implementation phase maps to one or more skills from `.claude/skills/`:

| Phase | Primary Skill | Supporting Skills |
|-------|--------------|-------------------|
| **Phase 1**: GraphQL Operations | `/graphql-code` | — |
| **Phase 2**: Entity Composables | `/graphql-code` | — |
| **Phase 3**: Feature Components | Manual (Vue/TS) | — |
| **Phase 4**: Page Integration | Manual (Vue/TS) | — |
| **Phase 5**: Polish & UX | Manual (Vue/TS) | — |
| **Phase 5a**: API Backend (Submission) | `/api-creator` | — |
| **Phase 5b**: Frontend Input Cards | Manual (Vue/TS) | — |
| **Phase 5c**: Submission Wiring | Manual (Vue/TS) | — |
| **Phase 6**: Verify & Review | `/code-review` | `/api-code-review` |
| **Phase 7**: Test IDs & E2E | `/e2e-manager` | `/e2e-test-ids`, `/e2e-tests-creator` |
| **Phase 8**: Commit | `/create-commits` | — |

**Skills NOT needed** (infrastructure already exists):
- `/hasura-migrations` — Testimonials table already exists with full schema
- `/hasura-permissions` — CRUD permissions already configured for all org roles
- `/hasura-table-docs` — Table documentation not changing
- `/api-manager` — No API routing decisions needed

---

## Implementation Phases

### Phase 1: GraphQL Operations (Entity Layer)

> **Skill**: `/graphql-code`
>
> This skill handles: creating .gql files, validating against Hasura schema via `tm-graph` MCP tools, running `pnpm codegen:web`, creating composables, and exporting through entity `index.ts`.

**Goal**: Create the GraphQL fragments, queries, and mutations needed for testimonial display and management.

**Invoke**: `/graphql-code` with the following instructions:

#### 1.1 — Fragment: `TestimonialWithForm`

**File**: `apps/web/src/entities/testimonial/graphql/fragments/TestimonialWithForm.gql`

```graphql
#import "./TestimonialBasic.gql"

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

**Why**: The existing `TestimonialBasic` fragment lacks form attribution data. The org-level view needs to show "via [Form Name]" on each card.

**Validation**: Use `tm-graph` MCP → `get-type-info` for `testimonials` to confirm `submission` relationship exists and `form_submissions` has `form` object relationship.

#### 1.2 — Query: `GetTestimonialsWithForm`

**File**: `apps/web/src/entities/testimonial/graphql/queries/getTestimonialsWithForm.gql`

```graphql
#import "../fragments/TestimonialWithForm.gql"

query GetTestimonialsWithForm($organizationId: String!, $limit: Int) {
  testimonials(
    where: { organization_id: { _eq: $organizationId } }
    order_by: { created_at: desc }
    limit: $limit
  ) {
    ...TestimonialWithForm
  }
}
```

#### 1.3 — Query: `GetFormTestimonials`

**File**: `apps/web/src/entities/testimonial/graphql/queries/getFormTestimonials.gql`

```graphql
#import "../fragments/TestimonialWithForm.gql"

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

**Note**: Filters through nested relationship `submission.form_id`. Hasura generates efficient JOINs for this. Validate with `tm-graph` that nested `where` on `submission.form_id` is supported.

#### 1.4 — Query: `GetFormTestimonialsStats`

**File**: `apps/web/src/entities/testimonial/graphql/queries/getFormTestimonialsStats.gql`

```graphql
query GetFormTestimonialsStats($organizationId: String!, $formId: String!) {
  total: testimonials_aggregate(
    where: {
      organization_id: { _eq: $organizationId }
      submission: { form_id: { _eq: $formId } }
    }
  ) {
    aggregate {
      count
    }
  }
  pending: testimonials_aggregate(
    where: {
      organization_id: { _eq: $organizationId }
      submission: { form_id: { _eq: $formId } }
      status: { _eq: "pending" }
    }
  ) {
    aggregate {
      count
    }
  }
  approved: testimonials_aggregate(
    where: {
      organization_id: { _eq: $organizationId }
      submission: { form_id: { _eq: $formId } }
      status: { _eq: "approved" }
    }
  ) {
    aggregate {
      count
    }
  }
  rejected: testimonials_aggregate(
    where: {
      organization_id: { _eq: $organizationId }
      submission: { form_id: { _eq: $formId } }
      status: { _eq: "rejected" }
    }
  ) {
    aggregate {
      count
    }
  }
}
```

#### 1.5 — Mutation: `ApproveTestimonial`

**File**: `apps/web/src/entities/testimonial/graphql/mutations/approveTestimonial.gql`

```graphql
#import "../fragments/TestimonialBasic.gql"

mutation ApproveTestimonial($id: String!, $approvedBy: String!) {
  update_testimonials_by_pk(
    pk_columns: { id: $id }
    _set: {
      status: "approved"
      approved_by: $approvedBy
      approved_at: "now()"
      rejected_by: null
      rejected_at: null
      rejection_reason: null
    }
  ) {
    ...TestimonialBasic
  }
}
```

**Note**: Clears rejection fields when approving (in case a previously rejected testimonial is re-approved).

**Validation**: Use `tm-graph` → `list-mutations` to confirm `update_testimonials_by_pk` exists and accepts `_set` with these fields.

#### 1.6 — Mutation: `RejectTestimonial`

**File**: `apps/web/src/entities/testimonial/graphql/mutations/rejectTestimonial.gql`

```graphql
#import "../fragments/TestimonialBasic.gql"

mutation RejectTestimonial($id: String!, $rejectedBy: String!, $rejectionReason: String) {
  update_testimonials_by_pk(
    pk_columns: { id: $id }
    _set: {
      status: "rejected"
      rejected_by: $rejectedBy
      rejected_at: "now()"
      rejection_reason: $rejectionReason
      approved_by: null
      approved_at: null
    }
  ) {
    ...TestimonialBasic
  }
}
```

#### 1.7 — Run GraphQL Codegen

```bash
pnpm codegen:web
```

This generates TypeScript types for all new operations in `apps/web/src/shared/graphql/generated/operations.ts`.

**`/graphql-code` Tasks**:
1. Validate schema relationships with `tm-graph` MCP tools (`get-type-info` for `testimonials`, `form_submissions`, `forms`)
2. Create `TestimonialWithForm.gql` fragment
3. Create `getTestimonialsWithForm.gql` query
4. Create `getFormTestimonials.gql` query
5. Create `getFormTestimonialsStats.gql` query
6. Create `approveTestimonial.gql` mutation
7. Create `rejectTestimonial.gql` mutation
8. Run `pnpm codegen:web` to generate types
9. Verify codegen output has all new Document/Query/Mutation types

---

### Phase 2: Entity Composables

> **Skill**: `/graphql-code` (continued)
>
> The `/graphql-code` skill also handles creating composables from generated types, following the entity composable patterns.

**Goal**: Create Apollo composables for the new queries and mutations.

#### 2.1 — `useGetTestimonialsWithForm`

**File**: `apps/web/src/entities/testimonial/composables/queries/useGetTestimonialsWithForm.ts`

**Pattern** (from existing `useGetTestimonials.ts`):
```typescript
import { useQuery } from '@vue/apollo-composable';
import { computed, type Ref } from 'vue';
import { GetTestimonialsWithFormDocument } from '@/shared/graphql/generated/operations';

export function useGetTestimonialsWithForm(
  variables: Ref<{ organizationId: string; limit?: number }>
) {
  const { result, loading, error, refetch } = useQuery(
    GetTestimonialsWithFormDocument,
    variables,
    { fetchPolicy: 'cache-and-network' }
  );

  const testimonials = computed(() => result.value?.testimonials ?? []);
  const isLoading = computed(() => loading.value && !result.value);

  return { testimonials, loading, isLoading, error, refetch, result };
}
```

**Critical `/graphql-code` rules**:
- Variables must use `computed()` directly, never `ref(computed.value)`
- Safe data extraction with `?? []` or `?? null` fallbacks
- Type extraction from queries, not fragments

#### 2.2 — `useGetFormTestimonials`

**File**: `apps/web/src/entities/testimonial/composables/queries/useGetFormTestimonials.ts`

Same pattern as above, but with `formId` in variables.

#### 2.3 — `useGetFormTestimonialsStats`

**File**: `apps/web/src/entities/testimonial/composables/queries/useGetFormTestimonialsStats.ts`

**Pattern** (from existing `useGetTestimonialsStats.ts`):
```typescript
// Returns parsed stats object: { total, pending, approved, rejected }
const stats = computed<TestimonialsStats>(() => ({
  total: result.value?.total?.aggregate?.count ?? 0,
  pending: result.value?.pending?.aggregate?.count ?? 0,
  approved: result.value?.approved?.aggregate?.count ?? 0,
  rejected: result.value?.rejected?.aggregate?.count ?? 0,
}));
```

#### 2.4 — `useApproveTestimonial`

**File**: `apps/web/src/entities/testimonial/composables/mutations/useApproveTestimonial.ts`

```typescript
import { useMutation } from '@vue/apollo-composable';
import { ApproveTestimonialDocument } from '@/shared/graphql/generated/operations';

export function useApproveTestimonial() {
  const { mutate, loading, error, onDone, onError } = useMutation(
    ApproveTestimonialDocument
  );

  async function approveTestimonial(id: string, approvedBy: string) {
    return mutate({ id, approvedBy });
  }

  return { approveTestimonial, loading, error, onDone, onError };
}
```

#### 2.5 — `useRejectTestimonial`

**File**: `apps/web/src/entities/testimonial/composables/mutations/useRejectTestimonial.ts`

Same pattern, with `rejectionReason` parameter.

#### 2.6 — Update Entity Models & Exports

**File**: `apps/web/src/entities/testimonial/models/queries.ts` — Add new types:
```typescript
export type TestimonialWithFormItem = GetTestimonialsWithFormQuery['testimonials'][number];
export type TestimonialSubmission = NonNullable<TestimonialWithFormItem['submission']>;
export type TestimonialForm = NonNullable<TestimonialSubmission['form']>;
```

**File**: `apps/web/src/entities/testimonial/models/mutations.ts` — Add mutation types:
```typescript
export type ApproveTestimonialResult = NonNullable<ApproveTestimonialMutation['update_testimonials_by_pk']>;
export type RejectTestimonialResult = NonNullable<RejectTestimonialMutation['update_testimonials_by_pk']>;
```

**File**: `apps/web/src/entities/testimonial/composables/index.ts` — Add new exports.

**File**: `apps/web/src/entities/testimonial/index.ts` — Add new exports.

**`/graphql-code` Tasks**:
1. Create `useGetTestimonialsWithForm.ts`
2. Create `useGetFormTestimonials.ts`
3. Create `useGetFormTestimonialsStats.ts`
4. Create `useApproveTestimonial.ts`
5. Create `useRejectTestimonial.ts`
6. Update `models/queries.ts` with new types
7. Create `models/mutations.ts` with mutation types
8. Update `composables/index.ts` barrel exports
9. Update entity `index.ts` barrel exports

---

### Phase 3: Feature Components

> **Skill**: Manual implementation (Vue 3 + TypeScript + Tailwind)
>
> No specialized skill needed — standard Vue component development following FSD conventions and project patterns from `features/formResponses/`.

**Goal**: Build the `testimonialsList` feature with all UI components.

**Directory**: `apps/web/src/features/testimonialsList/`

#### 3.1 — State Composable: `useTestimonialsListState`

**File**: `apps/web/src/features/testimonialsList/composables/useTestimonialsListState.ts`

**Pattern** (from `useFormResponsesTableState.ts`):

```typescript
import { ref, computed, type Ref } from 'vue';
import type { TestimonialStatus, TestimonialWithFormItem } from '@/entities/testimonial';

type SortOption = 'newest' | 'oldest' | 'highest_rated';

export function useTestimonialsListState(
  testimonials: Ref<TestimonialWithFormItem[]>
) {
  const statusFilter = ref<TestimonialStatus | 'all'>('all');
  const searchQuery = ref('');
  const sortOption = ref<SortOption>('newest');
  const selectedTestimonialId = ref<string | null>(null);

  const filteredTestimonials = computed(() => {
    let result = testimonials.value;

    // Status filter
    if (statusFilter.value !== 'all') {
      result = result.filter(t => t.status === statusFilter.value);
    }

    // Search filter (client-side)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(t =>
        t.content?.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_company?.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortOption.value) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest_rated':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  });

  const selectedTestimonial = computed(() =>
    testimonials.value.find(t => t.id === selectedTestimonialId.value) ?? null
  );

  const hasFilteredResults = computed(() => filteredTestimonials.value.length > 0);

  function setStatusFilter(status: TestimonialStatus | 'all') {
    statusFilter.value = status;
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query;
  }

  function selectTestimonial(id: string) {
    selectedTestimonialId.value = id;
  }

  return {
    statusFilter,
    searchQuery,
    sortOption,
    selectedTestimonialId,
    filteredTestimonials,
    selectedTestimonial,
    hasFilteredResults,
    setStatusFilter,
    setSearchQuery,
    selectTestimonial,
  };
}
```

#### 3.2 — `TestimonialsStatsBar.vue`

**File**: `apps/web/src/features/testimonialsList/ui/TestimonialsStatsBar.vue`

Props:
```typescript
interface Props {
  stats: TestimonialsStats;
  loading?: boolean;
}
```

4 compact stat cards in a row:
- **Total** — neutral color (gray)
- **Pending** — amber/warning color
- **Approved** — green/success color
- **Rejected** — red/destructive color

Each card shows the count with a small label. On loading, show skeleton pulses.

#### 3.3 — `TestimonialCard.vue`

**File**: `apps/web/src/features/testimonialsList/ui/TestimonialCard.vue`

Props:
```typescript
interface Props {
  testimonial: TestimonialWithFormItem;
  isSelected?: boolean;
  showFormAttribution?: boolean;  // true for org-level, false for form-scoped
}

const emit = defineEmits<{
  select: [id: string];
  approve: [id: string];
  reject: [id: string];
}>();
```

**Component structure** (~100 lines):
```html
<div class="rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
     :class="{ 'border-primary ring-1 ring-primary/20': isSelected }">
  <!-- Top row: Rating + Status badge -->
  <!-- Content excerpt (truncated) -->
  <!-- Customer info: avatar + name + title/company -->
  <!-- Bottom row: Form attribution + relative time -->
  <!-- Quick actions: Approve/Reject for pending -->
</div>
```

**Key details**:
- Content truncated to 150 chars with CSS `line-clamp-3`
- Avatar with initials fallback using first letter of name
- Status badge: amber dot + "Pending", green check + "Approved", red x + "Rejected"
- Quick action buttons only shown for `status === 'pending'`
- Form attribution only shown when `showFormAttribution` is true

#### 3.4 — `TestimonialDetailPanel.vue`

**File**: `apps/web/src/features/testimonialsList/ui/TestimonialDetailPanel.vue`

Props:
```typescript
interface Props {
  testimonial: TestimonialWithFormItem | null;
}

const emit = defineEmits<{
  approve: [id: string];
  reject: [id: string, reason?: string];
}>();
```

**Sections**:
1. **Customer Profile**: Large avatar, name, title, company, email (mailto link), social links (LinkedIn/Twitter icons)
2. **Content**: Full testimonial text, rating stars
3. **Source Info**: Source type badge (form/import/manual), form name with link, submission date
4. **Status & Audit**: Status badge, approved/rejected by and timestamp, rejection reason (if any)
5. **Actions**: Approve button (green), Reject button (red, opens modal), future: Edit, Delete

**Empty state**: When `testimonial` is null, show "Select a testimonial to view details" placeholder.

#### 3.5 — `TestimonialsEmptyState.vue`

**File**: `apps/web/src/features/testimonialsList/ui/TestimonialsEmptyState.vue`

Props:
```typescript
interface Props {
  context: 'org' | 'form';
  formRef?: FormRef;  // Only for form context
}
```

Context-specific messaging:
- **org**: "No testimonials yet" + "Share your collection forms to start receiving testimonials" + CTA to Forms page
- **form**: "No testimonials from this form yet" + "Share the form link to start collecting" + Copy link button

#### 3.6 — `TestimonialsCardSkeleton.vue`

**File**: `apps/web/src/features/testimonialsList/ui/TestimonialsCardSkeleton.vue`

3 skeleton cards with pulsing animation:
- Rating stars placeholder
- 3 lines of text placeholder
- Avatar circle + name/company text placeholders

#### 3.7 — `RejectTestimonialModal.vue`

**File**: `apps/web/src/features/testimonialsList/ui/RejectTestimonialModal.vue`

Props:
```typescript
interface Props {
  isOpen: boolean;
  testimonialId: string;
}

const emit = defineEmits<{
  confirm: [id: string, reason: string];
  cancel: [];
}>();
```

Simple modal with:
- Title: "Reject Testimonial"
- Optional textarea for rejection reason
- Helper text: "This is an internal note and won't be shared with the customer."
- Cancel + Reject buttons

Use the project's existing dialog/modal patterns if available, or a simple overlay.

#### 3.8 — `TestimonialsListFeature.vue`

**File**: `apps/web/src/features/testimonialsList/ui/TestimonialsListFeature.vue`

This is the **main orchestrator component** used by both page contexts.

Props:
```typescript
interface Props {
  formId?: string;  // When provided, scopes to this form
}
```

**Responsibilities**:
- Decides which query to use based on `formId` prop
- Manages state via `useTestimonialsListState`
- Handles approve/reject actions via mutation composables
- Composes: stats bar, filter tabs, search input, card list, detail panel
- Auto-selects first testimonial when list loads
- Responsive: hides detail panel on `< lg` screens

**Component structure** (~200 lines):

```html
<template>
  <!-- Stats Bar -->
  <TestimonialsStatsBar :stats="stats" :loading="isLoading" />

  <!-- Filters row: status tabs + search + sort -->
  <div class="flex items-center justify-between">
    <!-- Status filter tabs (same pattern as responses page) -->
    <!-- Search input -->
    <!-- Sort dropdown -->
  </div>

  <!-- Loading state -->
  <TestimonialsCardSkeleton v-if="isLoading" />

  <!-- Empty state -->
  <TestimonialsEmptyState v-else-if="testimonials.length === 0" :context="formId ? 'form' : 'org'" />

  <!-- Content: 2:1 split -->
  <div v-else class="flex gap-6">
    <!-- Card list (2/3) -->
    <div class="flex-[2] space-y-3">
      <TestimonialCard
        v-for="t in filteredTestimonials"
        :key="t.id"
        :testimonial="t"
        :is-selected="t.id === selectedTestimonialId"
        :show-form-attribution="!formId"
        @select="selectTestimonial"
        @approve="handleApprove"
        @reject="openRejectModal"
      />
      <!-- No filter results -->
      <div v-if="!hasFilteredResults">...</div>
    </div>

    <!-- Detail panel (1/3, lg+ only) -->
    <div class="flex-1 hidden lg:block">
      <div class="sticky top-0 max-h-[calc(100vh-12rem)]">
        <TestimonialDetailPanel
          :testimonial="selectedTestimonial"
          @approve="handleApprove"
          @reject="openRejectModal"
        />
      </div>
    </div>
  </div>

  <!-- Reject modal -->
  <RejectTestimonialModal
    :is-open="rejectModalOpen"
    :testimonial-id="rejectTargetId"
    @confirm="handleReject"
    @cancel="closeRejectModal"
  />
</template>
```

#### 3.9 — Feature Barrel Export

**File**: `apps/web/src/features/testimonialsList/index.ts`

```typescript
export { default as TestimonialsListFeature } from './ui/TestimonialsListFeature.vue';
export { default as TestimonialCard } from './ui/TestimonialCard.vue';
export { default as TestimonialDetailPanel } from './ui/TestimonialDetailPanel.vue';
// Export card + panel for reuse in widget builder testimonial picker (ADR-024)
```

**Tasks**:
1. Create `features/testimonialsList/` directory
2. Create `useTestimonialsListState.ts` composable
3. Create `TestimonialsStatsBar.vue`
4. Create `TestimonialCard.vue`
5. Create `TestimonialDetailPanel.vue`
6. Create `TestimonialsEmptyState.vue`
7. Create `TestimonialsCardSkeleton.vue`
8. Create `RejectTestimonialModal.vue`
9. Create `TestimonialsListFeature.vue` (main orchestrator)
10. Create `index.ts` barrel export

---

### Phase 4: Page Integration

> **Skill**: Manual implementation (Vue pages)
>
> Standard page wiring — no specialized skill needed.

**Goal**: Wire the feature component into both page contexts.

#### 4.1 — Organization Testimonials Page

**File**: `apps/web/src/pages/[org]/testimonials/index.vue`

```vue
<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { TestimonialsListFeature } from '@/features/testimonialsList';

definePage({
  meta: { requiresAuth: true },
});
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-foreground">Testimonials</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage and approve customer testimonials across all forms.
        </p>
      </div>

      <TestimonialsListFeature />
    </div>
  </AuthLayout>
</template>
```

**Note**: No `formId` prop → org-level scope.

#### 4.2 — Form Testimonials Page

**File**: `apps/web/src/pages/[org]/forms/[urlSlug]/testimonials.vue`

```vue
<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { extractEntityIdFromSlug } from '@/shared/urls';
import { FormSubpageHeader } from '@/features/formDashboard';
import FormSubpageLayout from '@/layouts/FormSubpageLayout.vue';
import { TestimonialsListFeature } from '@/features/testimonialsList';

definePage({
  meta: { requiresAuth: true },
});

const route = useRoute();

const urlSlug = computed(() => route.params.urlSlug as string);
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value));
const formId = computed(() => entityInfo.value?.entityId ?? null);

const formRef = computed(() => ({
  id: formId.value ?? '',
  name: entityInfo.value?.slug ?? 'form',
}));
</script>

<template>
  <FormSubpageLayout>
    <div v-if="!entityInfo?.isValid" class="text-destructive">
      Invalid form URL
    </div>
    <template v-else-if="formId">
      <FormSubpageHeader
        :form-ref="formRef"
        title="Testimonials"
        subtitle="Testimonials collected from this form"
      />

      <TestimonialsListFeature :form-id="formId" />
    </template>
  </FormSubpageLayout>
</template>
```

#### 4.3 — Testimonial Detail Page

**File**: `apps/web/src/pages/[org]/testimonials/[urlSlug].vue`

Full-page detail view for mobile and deep-linking:

```vue
<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { extractEntityIdFromSlug } from '@/shared/urls';
import { useGetTestimonial } from '@/entities/testimonial';
import { useRouting } from '@/shared/routing';
import { TestimonialDetailPanel } from '@/features/testimonialsList';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

definePage({
  meta: { requiresAuth: true },
});

const route = useRoute();
const { goToTestimonials } = useRouting();

const urlSlug = computed(() => route.params.urlSlug as string);
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value));
const testimonialId = computed(() => entityInfo.value?.entityId ?? '');

const variables = computed(() => ({ testimonialId: testimonialId.value }));
const { testimonial, loading, isLoading } = useGetTestimonial(variables);
</script>

<template>
  <AuthLayout>
    <div class="p-6 max-w-3xl mx-auto">
      <!-- Back button -->
      <Button variant="ghost" size="sm" class="mb-4" @click="goToTestimonials()">
        <Icon icon="heroicons:arrow-left" class="h-4 w-4 mr-2" />
        Back to Testimonials
      </Button>

      <!-- Loading -->
      <div v-if="isLoading" class="animate-pulse space-y-4">
        <!-- Skeleton -->
      </div>

      <!-- Detail panel (full width, no side constraint) -->
      <TestimonialDetailPanel
        v-else
        :testimonial="testimonial"
        @approve="handleApprove"
        @reject="handleReject"
      />
    </div>
  </AuthLayout>
</template>
```

**Tasks**:
1. Update `pages/[org]/testimonials/index.vue` — wire `TestimonialsListFeature`
2. Update `pages/[org]/forms/[urlSlug]/testimonials.vue` — wire with `formId` prop
3. Update `pages/[org]/testimonials/[urlSlug].vue` — full-page detail view

---

### Phase 5: Polish & UX Refinement

> **Skill**: Manual implementation (Vue/TS)

**Goal**: Add optimistic updates, toast notifications, and responsive behavior.

#### 5.1 — Optimistic UI for Approve/Reject

In `TestimonialsListFeature.vue`, after calling the mutation:
- Immediately update the local status in the card (optimistic)
- Show success toast: "Testimonial approved" / "Testimonial rejected"
- On error: revert the status and show error toast

Apollo Client cache updates handle this naturally with `update` callbacks on mutations.

#### 5.2 — Toast Notifications

Use the project's toast system (if exists) or a simple notification:
- **Approve**: "Testimonial by [name] approved" (green)
- **Reject**: "Testimonial by [name] rejected" (red)
- **Error**: "Failed to update testimonial. Please try again." (red)

#### 5.3 — Mobile Responsive Behavior

- `< lg`: Hide detail panel entirely
- Card click on mobile: Navigate to `/:org/testimonials/:urlSlug` detail page
- Filter tabs: Horizontally scrollable on small screens

#### 5.4 — Auto-Select First Testimonial

Follow the same pattern from `responses.vue`:
```typescript
watch(
  () => filteredTestimonials.value,
  (newList) => {
    if (newList.length > 0 && !selectedTestimonialId.value) {
      selectedTestimonialId.value = newList[0].id;
    }
  },
  { immediate: true }
);
```

**Tasks**:
1. Add optimistic UI updates for approve/reject mutations
2. Add toast notifications for actions
3. Implement mobile responsive behavior (hide panel, navigate on click)
4. Add auto-select first testimonial

---

### Phase 5a: API Backend — Submission Endpoint

> **Skill**: `/api-creator`
>
> Creates the POST /testimonials endpoint with Zod validation and Drizzle transaction.

**Goal**: Persist form submissions (contact, submission, question responses, testimonial) atomically.

**Key Schema Finding**: `form_submissions` uses `contact_id` → `contacts` table. Anonymous Hasura role can't insert into `contacts` or `testimonials`, so this must use an API endpoint with Drizzle transaction.

#### 5a.1 — Zod Schemas

**File**: `api/src/features/submissions/schemas.ts`

Request body validates: `formId`, `organizationId`, `contact` (email required, name/jobTitle/etc optional), `consentType`, `questionResponses[]`, `testimonialContent`, `rating`.

#### 5a.2 — Drizzle Transaction

**File**: `api/src/features/submissions/operations/submitForm.ts`

Follows `settleCredits.ts` transaction pattern:
1. Upsert contact (`ON CONFLICT(org_id, email)` → increment `submission_count`, update `last_seen_at`)
2. Insert `form_submission` (with `contact_id`)
3. Batch insert `form_question_responses`
4. Insert `testimonial` (if content or rating provided, `status='pending'`, `source='form'`)

#### 5a.3 — Types & Barrel Export

**Files**: `api/src/features/submissions/types.ts`, `api/src/features/submissions/index.ts`

#### 5a.4 — Route Handler

**File**: `api/src/routes/testimonials.ts` — Replaced `POST /` stub with Zod validation + `submitForm()` call + error handling.

---

### Phase 5b: Frontend — Contact Info & Consent Input

> **Skill**: Manual (Vue/TS)

**Goal**: Make `contact_info` and `consent` steps interactive in the public form.

#### 5b.1 — ContactInfoInputCard

**File**: `apps/web/src/shared/stepCards/ui/ContactInfoInputCard.vue`

- Reads `content.enabledFields` and `content.requiredFields`
- Renders text/email inputs for each enabled field (skips `photo` for MVP)
- `defineModel<Record<string, string>>()` for v-model

#### 5b.2 — ConsentStepCard v-model

**File**: `apps/web/src/shared/stepCards/ui/ConsentStepCard.vue`

- Added `defineModel<string>()` for `'public' | 'private'`
- Radio buttons with click handlers + selected state styling

#### 5b.3 — Response Bindings

**File**: `apps/web/src/features/publicForm/composables/useStepResponseBindings.ts`

Added `contactInfoResponse` (object) and `consentResponse` (string) computed bindings.

#### 5b.4 — PublicFormFlow Template

**File**: `apps/web/src/features/publicForm/ui/PublicFormFlow.vue`

- Imported `ContactInfoInputCard`
- Added `v-else-if` for `contact_info` step with v-model
- Added `v-else-if` for `consent` step with v-model

---

### Phase 5c: Frontend — Submission Wiring

> **Skill**: Manual (Vue/TS)

**Goal**: Wire the public form to call the submission API on form completion.

#### 5c.1 — Submission API Composable

**Files**: `apps/web/src/shared/api/submissions/` (follows `useApiForAI.ts` pattern)

- `useApiForSubmissions()` — calls `POST /testimonials`
- `models/index.ts` — request/response types
- `index.ts` — barrel export

#### 5c.2 — handleSubmission Wiring

**File**: `apps/web/src/features/publicForm/composables/usePublicFormFlow.ts`

- Added `onSubmit` callback to `UsePublicFormFlowOptions`
- `buildSubmissionPayload()` iterates `visibleSteps`, extracts data by step type
- `handleSubmission()` calls `onSubmit(payload)` before analytics/cleanup

**File**: `apps/web/src/features/publicForm/ui/PublicFormFlow.vue`

- Initialized `useApiForSubmissions()` at setup root
- Passed `onSubmit` callback to `usePublicFormFlow`

---

### Phase 6: Code Review & Verification

> **Skill**: `/code-review`
>
> The `/code-review` skill performs senior engineer review for Vue 3, TypeScript, GraphQL, Tailwind, and FSD architecture. It auto-routes API files to `/api-code-review` and E2E test files to `/e2e-code-review`.

**Goal**: Validate all new code against project conventions before committing.

**Invoke**: `/code-review` after staging all changes.

**What it checks (relevant to this ADR)**:

| Check | What to Verify |
|-------|----------------|
| **FSD layer imports** | Feature components only import from entities/shared, never cross-feature |
| **Types from models/ only** | No type exports from composables or UI components |
| **Generated GraphQL types** | All types extracted from codegen, no manual recreation |
| **Composables at setup root** | No `useXxx()` calls inside callbacks or conditionals |
| **`toRefs()` for stores** | Any Pinia store usage uses `toRefs()` for reactive properties |
| **Component size** | All `.vue` files under 250 lines, composables under 300 lines |
| **Page thin wrappers** | Page files only render features, no business logic |
| **Tailwind-first** | No unnecessary `<style>` blocks |
| **`defineModel()`** | Used for any v-model bindings |

**Tasks**:
1. Stage all changes: `git add` relevant files
2. Run `/code-review`
3. Fix any issues flagged
4. Re-run until clean

---

### Phase 7: Test IDs & E2E Tests

> **Skills**: `/e2e-manager` → routes to `/e2e-test-ids` and `/e2e-tests-creator`

**Goal**: Add test IDs to new components and create E2E tests for the testimonials workflow.

#### 7.1 — Add Test IDs

> **Skill**: `/e2e-test-ids`
>
> Creates centralized test ID constants and adds `data-testid` attributes to components.

**Test IDs needed**:

| Component | Test ID | Purpose |
|-----------|---------|---------|
| `TestimonialsStatsBar` | `testimonials-stats-total`, `testimonials-stats-pending`, etc. | Verify stat counts |
| `TestimonialCard` | `testimonial-card-{id}` | Select specific card |
| Status filter tabs | `testimonials-filter-all`, `testimonials-filter-pending`, etc. | Click filters |
| Search input | `testimonials-search` | Type search queries |
| Approve button (card) | `testimonial-approve-{id}` | Quick approve |
| Reject button (card) | `testimonial-reject-{id}` | Quick reject |
| Detail panel | `testimonial-detail-panel` | Verify panel shows |
| Reject modal | `testimonial-reject-modal` | Interact with modal |
| Empty state | `testimonials-empty-state` | Verify empty |

**Tasks**:
1. Run `/e2e-test-ids` to create centralized test ID definitions
2. Add `data-testid` attributes to all interactive elements in new components

#### 7.2 — Create E2E Tests

> **Skill**: `/e2e-tests-creator`
>
> Creates Playwright E2E tests following project conventions (journey vs focused, fixtures, action helpers).

**Test scenarios**:

**Journey Test: Testimonial Approval Workflow**
1. Navigate to `/:org/testimonials`
2. Verify stats bar shows correct counts
3. Click "Pending" filter tab
4. Select a pending testimonial card
5. Verify detail panel shows testimonial content
6. Click "Approve" on a pending testimonial
7. Verify status changes to "Approved"
8. Verify stats update

**Journey Test: Testimonial Rejection Workflow**
1. Navigate to `/:org/testimonials`
2. Click "Reject" on a pending testimonial
3. Enter rejection reason in modal
4. Confirm rejection
5. Verify status changes to "Rejected"

**Focused Test: Form-Scoped Testimonials**
1. Navigate to `/:org/forms/:urlSlug/testimonials`
2. Verify only testimonials from that form are shown
3. Verify form attribution is hidden (redundant in form scope)

**Focused Test: Search & Filter**
1. Navigate to `/:org/testimonials`
2. Type in search box
3. Verify results filter
4. Clear search
5. Switch between status tabs
6. Verify counts match

**Tasks**:
1. Run `/e2e-tests-creator` for testimonial approval journey test
2. Run `/e2e-tests-creator` for testimonial rejection journey test
3. Run `/e2e-tests-creator` for form-scoped focused test
4. Run `/e2e-tests-creator` for search & filter focused test
5. Run `/e2e-tests-runner` to verify all tests pass

---

### Phase 8: Commit

> **Skill**: `/create-commits`
>
> Creates atomic commits with ADR references following project conventions. Determines commit type, formats message, and includes co-author.

**Goal**: Create atomic, well-structured commits for each logical change.

**Recommended commit sequence**:

| Order | Scope | Message | Files |
|-------|-------|---------|-------|
| 1 | `web, ADR-025` | `feat(web, ADR-025): add testimonial GraphQL operations and composables` | `.gql` files, composables, models, entity exports |
| 2 | `web, ADR-025` | `feat(web, ADR-025): add testimonials list feature with approval workflow` | `features/testimonialsList/` (all UI + composables) |
| 3 | `web, ADR-025` | `feat(web, ADR-025): wire testimonials display into pages` | `pages/[org]/testimonials/`, `pages/[org]/forms/[urlSlug]/testimonials.vue` |
| 4 | `api+web, ADR-025` | `feat(api+web, ADR-025): add form submission persistence endpoint and wiring` | `api/features/submissions/`, `shared/api/submissions/`, `stepCards/`, `publicForm/` |
| 5 | `web, ADR-025` | `feat(web, ADR-025): add testimonials E2E test IDs and tests` | Test ID files, E2E test files |

**Invoke**: `/create-commits` for each logical commit after staging the relevant files.

**Commit format** (from skill conventions):
```
feat(web, ADR-025): add testimonial GraphQL operations and composables

Add TestimonialWithForm fragment, GetFormTestimonials query, and
approve/reject mutations. Create entity composables for all new
operations with generated TypeScript types.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## File Structure Summary

### Entity Layer (Data)

```
apps/web/src/entities/testimonial/
├── graphql/
│   ├── fragments/
│   │   ├── TestimonialBasic.gql              # ✅ EXISTS
│   │   └── TestimonialWithForm.gql           # ✅ DONE — /graphql-code
│   ├── queries/
│   │   ├── getTestimonials.gql               # ✅ EXISTS
│   │   ├── getTestimonial.gql                # ✅ EXISTS
│   │   ├── getTestimonialsStats.gql          # ✅ EXISTS
│   │   ├── getTestimonialsWithForm.gql       # ✅ DONE — /graphql-code
│   │   ├── getFormTestimonials.gql           # ✅ DONE — /graphql-code
│   │   └── getFormTestimonialsStats.gql      # ✅ DONE — /graphql-code
│   └── mutations/
│       ├── approveTestimonial.gql            # ✅ DONE — /graphql-code
│       └── rejectTestimonial.gql             # ✅ DONE — /graphql-code
├── composables/
│   ├── queries/
│   │   ├── useGetTestimonials.ts             # ✅ EXISTS
│   │   ├── useGetTestimonial.ts              # ✅ EXISTS
│   │   ├── useGetTestimonialsStats.ts        # ✅ EXISTS
│   │   ├── useGetTestimonialsWithForm.ts     # ✅ DONE — /graphql-code
│   │   ├── useGetFormTestimonials.ts         # ✅ DONE — /graphql-code
│   │   └── useGetFormTestimonialsStats.ts    # ✅ DONE — /graphql-code
│   ├── mutations/
│   │   ├── useApproveTestimonial.ts          # ✅ DONE — /graphql-code
│   │   └── useRejectTestimonial.ts           # ✅ DONE — /graphql-code
│   └── index.ts                              # ✅ UPDATED — /graphql-code
├── models/
│   ├── index.ts                              # ✅ UPDATED — /graphql-code
│   ├── queries.ts                            # ✅ UPDATED — /graphql-code
│   └── mutations.ts                          # ✅ DONE — /graphql-code
└── index.ts                                  # ✅ EXISTS (no changes needed)
```

### API Layer (Submission Persistence)

```
api/src/features/submissions/                  # ✅ DONE — Phase 5a
├── schemas.ts                                 # ✅ Zod request/response schemas
├── types.ts                                   # ✅ SQL row types
├── operations/
│   └── submitForm.ts                          # ✅ Drizzle transaction (contact + submission + responses + testimonial)
└── index.ts                                   # ✅ Barrel export

api/src/routes/
└── testimonials.ts                            # ✅ UPDATED — POST / handler wired
```

### Shared Layer (Submission Wiring)

```
apps/web/src/shared/
├── api/
│   ├── submissions/                           # ✅ DONE — Phase 5c
│   │   ├── models/
│   │   │   └── index.ts                       # ✅ Request/response types
│   │   ├── useApiForSubmissions.ts            # ✅ REST composable
│   │   └── index.ts                           # ✅ Barrel export
│   └── index.ts                               # ✅ UPDATED — submissions re-export
└── stepCards/ui/
    ├── ContactInfoInputCard.vue               # ✅ DONE — Phase 5b (interactive input)
    └── ConsentStepCard.vue                    # ✅ UPDATED — Phase 5b (added v-model)
```

### Feature Layer (UI)

```
apps/web/src/features/testimonialsList/       # ✅ DONE — Manual
├── ui/
│   ├── TestimonialsListFeature.vue           # ✅ Main orchestrator
│   ├── TestimonialCard.vue                   # ✅ Individual card
│   ├── TestimonialDetailPanel.vue            # ✅ Side panel
│   ├── TestimonialsStatsBar.vue              # ✅ Stats counters
│   ├── TestimonialsEmptyState.vue            # ✅ Empty states
│   ├── TestimonialsCardSkeleton.vue          # ✅ Loading skeleton
│   └── RejectTestimonialModal.vue            # ✅ Rejection dialog
├── composables/
│   └── useTestimonialsListState.ts           # ✅ Filter/sort/search state
└── index.ts                                  # ✅ Barrel export
```

### Page Layer (Integration)

```
apps/web/src/pages/[org]/
├── testimonials/
│   ├── index.vue                             # ✅ DONE — Manual
│   └── [urlSlug].vue                         # ✅ DONE — Manual
└── forms/[urlSlug]/
    └── testimonials.vue                      # ✅ DONE — Manual
```

### E2E Tests

```
e2e/                                          # 🔲 NEW — /e2e-tests-creator
├── tests/
│   ├── testimonials-approval.journey.spec.ts
│   ├── testimonials-rejection.journey.spec.ts
│   ├── testimonials-form-scoped.focused.spec.ts
│   └── testimonials-search-filter.focused.spec.ts
└── actions/
    └── testimonials.actions.ts               # Reusable test helpers
```

---

## Key Patterns to Follow

### 1. Organization Isolation (Hasura RLS)

All queries automatically filter by `organization_id` via Hasura permissions (`X-Hasura-Organization-Id` header). No additional filtering needed in GraphQL variables for org isolation — but we do pass `organizationId` for explicit clarity.

### 2. Composable Setup Rules (Critical)

All composables **must be called at setup root**, never inside callbacks:

```typescript
// ✅ Correct: Called at setup root
const { approveTestimonial } = useApproveTestimonial();
const handleApprove = async (id: string) => {
  await approveTestimonial(id, currentUserId);
};

// ❌ Wrong: Called inside handler
const handleApprove = async (id: string) => {
  const { approveTestimonial } = useApproveTestimonial(); // WRONG!
  await approveTestimonial(id, currentUserId);
};
```

### 3. Type Safety via Generated Types

Never manually define types that come from GraphQL codegen:

```typescript
// ✅ Correct: Extract from generated query types
export type TestimonialWithFormItem = GetTestimonialsWithFormQuery['testimonials'][number];

// ❌ Wrong: Manual type definition
export interface TestimonialWithFormItem {
  id: string;
  content: string;
  // ... manual recreation
}
```

### 4. Apollo Cache Updates for Mutations

Approve/reject mutations return the updated fragment, which Apollo uses to update the cache automatically. No manual cache manipulation needed for single-entity updates.

### 5. Responsive Detail Panel Pattern

Follow `responses.vue` exactly:
```html
<!-- Detail panel hidden on mobile -->
<div class="flex-1 min-w-0 hidden lg:block">
  <div class="sticky top-0 max-h-[calc(100vh-12rem)] rounded-xl border border-border bg-card p-4">
    <TestimonialDetailPanel :testimonial="selectedTestimonial" />
  </div>
</div>
```

### 6. `/graphql-code` Composable Rules

From the skill's critical patterns:
- Variables must use `computed()` directly, never `ref(computed.value)`
- Safe data extraction: `result.value?.testimonials ?? []`
- Type extraction from **queries**, not fragments
- JSONB fields require strict Zod schemas (not applicable here)

---

## Dependencies

### Already Available

- `@vue/apollo-composable` — Apollo Client composables
- `@testimonials/ui` — Button, Dialog, Badge components
- `@testimonials/icons` — Icon component
- Vue Router, Pinia, Tailwind CSS — Core framework

### No New Dependencies Required

All required packages are already installed.

---

## Checklist

### Phase 1: GraphQL Operations — `/graphql-code`
- [x] Validate schema with `tm-graph` MCP tools
- [x] Create `TestimonialWithForm.gql` fragment
- [x] Create `getTestimonialsWithForm.gql` query
- [x] Create `getFormTestimonials.gql` query
- [x] Create `getFormTestimonialsStats.gql` query
- [x] Create `approveTestimonial.gql` mutation
- [x] Create `rejectTestimonial.gql` mutation
- [x] Run `pnpm codegen:web` successfully

### Phase 2: Entity Composables — `/graphql-code`
- [x] Create `useGetTestimonialsWithForm.ts`
- [x] Create `useGetFormTestimonials.ts`
- [x] Create `useGetFormTestimonialsStats.ts`
- [x] Create `useApproveTestimonial.ts`
- [x] Create `useRejectTestimonial.ts`
- [x] Update entity models and exports

### Phase 3: Feature Components — Manual
- [x] Create `useTestimonialsListState.ts` composable
- [x] Create `TestimonialsStatsBar.vue`
- [x] Create `TestimonialCard.vue`
- [x] Create `TestimonialDetailPanel.vue`
- [x] Create `TestimonialsEmptyState.vue`
- [x] Create `TestimonialsCardSkeleton.vue`
- [x] Create `RejectTestimonialModal.vue`
- [x] Create `TestimonialsListFeature.vue`
- [x] Create feature barrel export

### Phase 4: Page Integration — Manual
- [x] Update org testimonials page (`index.vue`)
- [x] Update form testimonials page (`testimonials.vue`)
- [x] Update testimonial detail page (`[urlSlug].vue`)

### Phase 5: Polish — Manual
- [x] Toast notifications (integrated into TestimonialsListFeature)
- [x] Mobile responsive behavior (detail panel hidden on < lg)
- [x] Auto-select first testimonial
- [ ] Optimistic UI for approve/reject (deferred — refetch used instead)

### Phase 5a: API Backend — `/api-creator`
- [x] Create Zod schemas (`api/src/features/submissions/schemas.ts`)
- [x] Create Drizzle transaction operation (`api/src/features/submissions/operations/submitForm.ts`)
- [x] Create types and barrel export
- [x] Wire `POST /testimonials` route handler with validation + error handling

### Phase 5b: Frontend Input Cards — Manual
- [x] Create `ContactInfoInputCard.vue` with v-model and field rendering
- [x] Add v-model to `ConsentStepCard.vue` with interactive radio buttons
- [x] Add `contactInfoResponse` and `consentResponse` to `useStepResponseBindings.ts`
- [x] Wire `ContactInfoInputCard` and `ConsentStepCard` into `PublicFormFlow.vue`

### Phase 5c: Submission Wiring — Manual
- [x] Create `useApiForSubmissions` composable (`shared/api/submissions/`)
- [x] Add `onSubmit` callback to `UsePublicFormFlowOptions`
- [x] Implement `buildSubmissionPayload()` in `usePublicFormFlow.ts`
- [x] Wire `useApiForSubmissions` in `PublicFormFlow.vue`
- [x] Export from `shared/api/index.ts`

### Phase 6: Code Review — `/code-review`
- [ ] Stage all changes
- [ ] Run `/code-review`
- [ ] Fix flagged issues
- [ ] Re-run until clean

### Phase 7: Test IDs & E2E — `/e2e-manager`
- [ ] Add test IDs to components (`/e2e-test-ids`)
- [ ] Create approval journey test (`/e2e-tests-creator`)
- [ ] Create rejection journey test (`/e2e-tests-creator`)
- [ ] Create form-scoped focused test (`/e2e-tests-creator`)
- [ ] Create search & filter focused test (`/e2e-tests-creator`)
- [ ] Run all E2E tests (`/e2e-tests-runner`)

### Phase 8: Commit — `/create-commits`
- [ ] Commit 1: GraphQL operations + composables
- [ ] Commit 2: Feature components
- [ ] Commit 3: Page integration
- [ ] Commit 4: E2E test IDs + tests

---

## References

- [ADR-022: Form Dashboard](../022-form-dashboard/adr.md) — Dashboard component patterns, TanStack Query usage
- [ADR-024: Widgets v1](../024-widgets-v1/adr.md) — Widget builder reuses `TestimonialCard` for picker
- `apps/web/src/pages/[org]/forms/[urlSlug]/responses.vue` — Reference for 2:1 split layout
- `apps/web/src/features/formResponses/` — Reference for table state composable pattern
- `apps/web/src/entities/testimonial/` — Existing entity layer
