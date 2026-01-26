# ADR-022: Form Dashboard - Implementation Plan

**Date**: 2026-01-25
**Status**: Implemented
**Aligned with**: ADR-021 (API Service Data Layer Architecture)

---

## Current Infrastructure Assessment

The following ADR-021 components are **already implemented**:

| Component | Location | Status |
|-----------|----------|--------|
| Drizzle Client | `api/src/db/index.ts` | ✅ Lazy init, connection pooling |
| Generated Schema | `api/src/db/schema/generated/schema.ts` | ✅ All tables including `formAnalyticsEvents` |
| Auth Middleware | `api/src/shared/middleware/auth.ts` | ✅ Extracts `organizationId` from JWT |
| OpenAPIHono Routes | `api/src/routes/*.ts` | ✅ Pattern established |
| Type Export Pattern | `api/src/shared/schemas/*.ts` | ✅ Zod → inferred types |
| REST Client | `apps/web/src/shared/api/rest/` | ✅ Typed fetch with `useApi()` |
| TanStack Query | `apps/web/src/app/providers/queryClient.ts` | ✅ Configured |
| Entity API Pattern | `apps/web/src/entities/media/api/` | ✅ Reference implementation |

---

## Implementation Phases

### Phase 1: API Schema & Types

**Goal**: Define dashboard request/response schemas following established patterns.

**File**: `api/src/shared/schemas/dashboard.ts`

```typescript
// Types needed:
// - Period enum (7d, 30d, 90d)
// - SessionStats (total, completed, abandoned, rate, avgTime)
// - FunnelStep (stepIndex, stepType, sessions, dropoff)
// - AudienceBreakdown (device, location)
// - RatingDistribution (avg, distribution)
// - DashboardResponse (combines all above)
```

**Tasks**:
1. Create `api/src/shared/schemas/dashboard.ts` with Zod + OpenAPI schemas
2. Define `PeriodSchema`, `SessionStatsSchema`, `FunnelStepSchema`
3. Define `AudienceDataSchema`, `RatingDataSchema`
4. Define `DashboardResponseSchema` combining all sections
5. Export all inferred types (`type X = z.infer<typeof XSchema>`)

**Reference**: `api/src/shared/schemas/media.ts` for pattern

---

### Phase 2: Dashboard Feature Module (API)

**Goal**: Implement Drizzle queries for dashboard data.

**Directory**: `api/src/features/dashboard/`

```
api/src/features/dashboard/
├── index.ts                    # Barrel export
├── queries/
│   ├── getSessionStats.ts      # Key metrics
│   ├── getFunnelData.ts        # Step-by-step funnel
│   ├── getAudienceData.ts      # Device + location
│   └── getRatingData.ts        # From testimonials table
├── utils/
│   ├── calculateBenchmark.ts   # Expected completion rate
│   └── formatMetrics.ts        # Safe division, edge cases
└── types.ts                    # Internal types if needed
```

**Key Query Patterns** (per ADR-021 & ADR-022):

```typescript
// ALWAYS include organizationId filter (tenant isolation)
.where(
  and(
    eq(formAnalyticsEvents.formId, formId),
    eq(formAnalyticsEvents.organizationId, organizationId)  // REQUIRED
  )
)
```

**Tasks**:
1. Create `getSessionStats.ts` - COUNT DISTINCT sessions, completion rate
2. Create `getFunnelData.ts` - Step progression with dropoff calculation
3. Create `getAudienceData.ts` - Device (isMobile) and location (country)
4. Create `getRatingData.ts` - AVG rating from testimonials, distribution
5. Create `calculateBenchmark.ts` - Step weights → expected completion
6. Create `formatMetrics.ts` - Safe percentage, edge case handling

**Reference**: ADR-022 SQL queries section

---

### Phase 3: Dashboard Route (API)

**Goal**: Create OpenAPI-documented endpoint.

**File**: `api/src/routes/dashboard.ts`

**Endpoint**: `GET /dashboard/forms/:formId`

**Query Params**: `period` (7d | 30d | 90d)

**Response**: Combined dashboard data

**Tasks**:
1. Create `api/src/routes/dashboard.ts` using `createRoute()` pattern
2. Add auth middleware (`authMiddleware`)
3. Implement handler calling all query functions in parallel
4. Export route types (`export type DashboardRoutes = typeof dashboard`)
5. Register in `api/src/routes/index.ts`
6. Mount in `api/src/index.ts`

**Auth Pattern** (from `auth.ts`):
```typescript
const { organizationId } = c.get('auth');
if (!organizationId) {
  return c.json({ error: 'Organization context required' }, 403);
}
```

---

### Phase 4: Frontend API Composable

**Goal**: Type-safe API client for dashboard.

**File**: `apps/web/src/features/formDashboard/api/useApiForDashboard.ts`

**Pattern** (from `useApiForMedia.ts`):
```typescript
import { useApi } from '@/shared/api/rest';
import type { DashboardResponse, Period } from '@api/shared/schemas/dashboard';

export function useApiForDashboard() {
  const api = useApi();

  async function getFormDashboard(
    formId: string,
    period: Period = '30d'
  ): Promise<DashboardResponse> {
    return api.get<DashboardResponse>(
      `/dashboard/forms/${formId}`,
      { period }
    );
  }

  return { getFormDashboard };
}
```

**Tasks**:
1. Create `apps/web/src/features/formDashboard/api/useApiForDashboard.ts`
2. Import types from `@api/shared/schemas/dashboard`
3. Implement `getFormDashboard(formId, period)` method

---

### Phase 5: TanStack Query Composable

**Goal**: Reactive data fetching with caching.

**File**: `apps/web/src/features/formDashboard/composables/useFormDashboard.ts`

**Pattern**:
```typescript
import { computed, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { useApiForDashboard } from '../api/useApiForDashboard';
import type { Period } from '@api/shared/schemas/dashboard';

export function useFormDashboard(
  formId: Ref<string>,
  period: Ref<Period>
) {
  const { getFormDashboard } = useApiForDashboard();

  const query = useQuery({
    queryKey: computed(() => ['form-dashboard', formId.value, period.value]),
    queryFn: () => getFormDashboard(formId.value, period.value),
    enabled: computed(() => !!formId.value),
  });

  return {
    dashboard: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

**Tasks**:
1. Create `apps/web/src/features/formDashboard/composables/useFormDashboard.ts`
2. Use TanStack Query with computed query key
3. Handle loading and error states

---

### Phase 6: Dashboard UI Components

**Goal**: Build visualization components.

**Directory**: `apps/web/src/features/formDashboard/ui/`

```
apps/web/src/features/formDashboard/ui/
├── FormDashboard.vue           # Main container
├── FormDashboardMetrics.vue    # 5 metric cards row
├── FormDashboardMetricCard.vue # Individual metric with benchmark
├── FormDashboardFunnel.vue     # Step funnel visualization
├── FormDashboardAudience.vue   # Device + location panels
├── FormDashboardRatings.vue    # Star rating + distribution
├── FormDashboardSkeleton.vue   # Loading state
└── FormDashboardEmpty.vue      # No data state
```

**Tasks**:
1. Create `FormDashboardMetricCard.vue` - Value + benchmark comparison
2. Create `FormDashboardMetrics.vue` - 5-card row layout
3. Create `FormDashboardFunnel.vue` - Step bars with dropoff
4. Create `FormDashboardAudience.vue` - Device breakdown + country list
5. Create `FormDashboardRatings.vue` - Star display + bar chart
6. Create `FormDashboardSkeleton.vue` - Loading skeleton
7. Create `FormDashboardEmpty.vue` - Empty state with CTA
8. Create `FormDashboard.vue` - Main container composing all

**Helper Functions** (`features/formDashboard/functions/`):
- `formatMetricValue.ts` - Percentage, time, number formatting
- `getMetricSentiment.ts` - positive/negative/neutral from benchmark
- `calculateDropoff.ts` - Step-over-step dropoff percentage

---

### Phase 7: Page Integration

**Goal**: Integrate dashboard into form overview page.

**File**: `apps/web/src/pages/[org]/forms/[urlSlug]/index.vue`

**Tasks**:
1. Import `FormDashboard` component
2. Add period selector (7d | 30d | 90d)
3. Connect to route params
4. Handle loading/error states

---

## File Structure Summary

### API

```
api/src/
├── shared/schemas/
│   └── dashboard.ts                  # NEW: Zod schemas + types
├── features/dashboard/               # NEW: Feature module
│   ├── index.ts
│   ├── queries/
│   │   ├── getSessionStats.ts
│   │   ├── getFunnelData.ts
│   │   ├── getAudienceData.ts
│   │   └── getRatingData.ts
│   └── utils/
│       ├── calculateBenchmark.ts
│       └── formatMetrics.ts
├── routes/
│   ├── dashboard.ts                  # NEW: GET /dashboard/forms/:formId
│   └── index.ts                      # UPDATE: Add dashboard export
└── index.ts                          # UPDATE: Mount dashboard route
```

### Frontend

```
apps/web/src/features/formDashboard/  # NEW: Feature module
├── api/
│   └── useApiForDashboard.ts
├── composables/
│   └── useFormDashboard.ts
├── functions/
│   ├── formatMetricValue.ts
│   ├── getMetricSentiment.ts
│   └── calculateDropoff.ts
├── ui/
│   ├── FormDashboard.vue
│   ├── FormDashboardMetrics.vue
│   ├── FormDashboardMetricCard.vue
│   ├── FormDashboardFunnel.vue
│   ├── FormDashboardAudience.vue
│   ├── FormDashboardRatings.vue
│   ├── FormDashboardSkeleton.vue
│   └── FormDashboardEmpty.vue
├── models/
│   └── index.ts                      # Re-export types from @api
└── index.ts                          # Barrel export
```

---

## Key Patterns to Follow

### 1. Organization Isolation (Critical)

Every Drizzle query MUST include `organizationId` filter:

```typescript
// ✅ CORRECT
.where(and(
  eq(formAnalyticsEvents.formId, formId),
  eq(formAnalyticsEvents.organizationId, organizationId)
))

// ❌ WRONG - Cross-tenant data leak
.where(eq(formAnalyticsEvents.formId, formId))
```

### 2. Type Flow (ADR-021)

```
Zod Schema (api/src/shared/schemas/dashboard.ts)
    ↓ z.infer<>
Type Export (export type X = z.infer<typeof XSchema>)
    ↓ import type
Frontend (import type { X } from '@api/shared/schemas/dashboard')
```

### 3. Auth Context Extraction

```typescript
const { organizationId } = c.get('auth');
if (!organizationId) {
  return c.json({ error: 'Organization context required' }, 403);
}
```

### 4. Safe Calculations (Edge Cases)

```typescript
// Always check for division by zero
function safePercentage(num: number, denom: number): number | null {
  if (denom === 0 || !isFinite(denom)) return null;
  return Math.round((num / denom) * 1000) / 10; // 1 decimal
}

// Check insufficient data
if (totalSessions < 5) {
  return { ...stats, showBenchmark: false, caveat: `Based on ${totalSessions} sessions` };
}
```

### 5. Parallel API Calls

```typescript
// Fetch all dashboard sections in parallel
const [stats, funnel, audience, ratings] = await Promise.all([
  getSessionStats(db, formId, organizationId, periodDays),
  getFunnelData(db, formId, organizationId, periodDays),
  getAudienceData(db, formId, organizationId, periodDays),
  getRatingData(db, formId, organizationId, periodDays),
]);
```

---

## Dependencies

### Already Installed

- `drizzle-orm`, `postgres` - API DB layer
- `@hono/zod-openapi` - API route schemas
- `@tanstack/vue-query` - Frontend data fetching

### No New Dependencies Required

All required packages are already in place per ADR-021 implementation.

---

## Testing Strategy

### API Unit Tests

```typescript
// api/src/features/dashboard/__tests__/getSessionStats.test.ts
describe('getSessionStats', () => {
  it('counts unique sessions correctly');
  it('calculates completion rate');
  it('respects organization isolation');
  it('handles zero sessions gracefully');
});
```

### Frontend Tests

```typescript
// apps/web/src/features/formDashboard/__tests__/
describe('useFormDashboard', () => {
  it('fetches dashboard data');
  it('handles loading state');
  it('handles error state');
});
```

---

## Checklist

### Phase 1: API Schema
- [x] Create `api/src/shared/schemas/dashboard.ts`
- [x] Define all Zod schemas with OpenAPI annotations
- [x] Export inferred types

### Phase 2: Dashboard Queries
- [x] Create `api/src/features/dashboard/` directory
- [x] Implement `getSessionStats.ts`
- [x] Implement `getFunnelData.ts`
- [x] Implement `getAudienceData.ts`
- [x] Implement `getRatingData.ts`
- [x] Implement `calculateBenchmark.ts`

### Phase 3: Dashboard Route
- [x] Create `api/src/routes/dashboard.ts`
- [x] Add auth middleware
- [x] Register in routes index
- [x] Mount in app

### Phase 4: Frontend API
- [x] Create `useApiForDashboard.ts`
- [x] Import types from `@api`

### Phase 5: TanStack Query
- [x] Create `useFormDashboard.ts`
- [x] Configure query caching

### Phase 6: UI Components
- [x] Create metric card component
- [x] Create metrics row
- [x] Create funnel visualization
- [x] Create audience panels
- [x] Create rating display
- [x] Create loading/empty states

### Phase 7: Integration
- [x] Update form overview page
- [x] Add period selector
- [ ] Test end-to-end (manual testing required)

---

## References

- [ADR-021: API Service Data Layer Architecture](../021-api-service-data-layer-architecture/adr.md)
- [ADR-022: Form Dashboard v1](./adr.md)
- Reference implementation: `api/src/routes/media.ts`, `apps/web/src/entities/media/api/`
