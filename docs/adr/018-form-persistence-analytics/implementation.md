# ADR-018 Implementation

## Doc Connections
**ID**: `adr-018-implementation`

2026-01-20 IST

**Parent ReadMes**:
- `adr-018-form-persistence-analytics` - Parent ADR

---

## Implementation Status

**Status**: Complete
**Implemented**: 2026-01-20

---

## Files Created

### Database

| File | Purpose |
|------|---------|
| `db/hasura/migrations/default/1768799538000_.../up.sql` | Create `form_analytics_events` table |
| `db/hasura/migrations/default/1768799538000_.../down.sql` | Rollback migration |
| `db/hasura/metadata/.../public_form_analytics_events.yaml` | Hasura permissions (anonymous INSERT) |

### API

| File | Purpose |
|------|---------|
| `api/src/routes/analytics.ts` | Route definition with OpenAPI spec |
| `api/src/features/analytics/trackEvent/index.ts` | Event tracking handler |
| `api/src/entities/formAnalyticsEvent/index.ts` | Entity exports |
| `api/src/entities/formAnalyticsEvent/graphql/insertFormAnalyticsEvent.gql` | GraphQL mutation |
| `api/src/shared/schemas/analytics.ts` | Zod validation schemas |

### Frontend

| File | Purpose |
|------|---------|
| `apps/web/src/features/publicForm/composables/useFormPersistence.ts` | localStorage persistence |
| `apps/web/src/features/publicForm/composables/useFormAnalytics.ts` | Analytics event tracking |
| `apps/web/src/features/publicForm/models/persistence.ts` | Persistence types |
| `apps/web/src/features/publicForm/models/analytics.ts` | Analytics types |
| `apps/web/src/features/publicForm/models/index.ts` | Model exports |

---

## Files Modified

| File | Changes |
|------|---------|
| `api/src/index.ts` | Register analytics routes |
| `apps/web/src/features/publicForm/composables/usePublicFormFlow.ts` | Integrate persistence & analytics |
| `apps/web/src/features/publicForm/composables/index.ts` | Export new composables |
| `apps/web/src/features/publicForm/ui/PublicFormFlow.vue` | Pass formId/organizationId props |
| `apps/web/src/pages/f/[urlSlug].vue` | Extract organizationId, pass to component |

---

## Implementation Checklist

### Phase 1: Database & API

- [x] Create `form_analytics_events` table migration
- [x] Add indexes for analytics queries
- [x] Add table/column comments
- [x] Create Hasura metadata with anonymous INSERT
- [x] Create Zod schemas for request/response
- [x] Implement `POST /analytics/events` handler
- [x] Register route in `api/src/index.ts`
- [x] Run codegen for GraphQL types

### Phase 2: Frontend Composables

- [x] Create `useFormPersistence` composable
  - [x] Session ID generation (UUID v4)
  - [x] localStorage save/restore
  - [x] 7-day expiry check
  - [x] Debounced auto-save (500ms)
  - [x] Clear on submission
- [x] Create `useFormAnalytics` composable
  - [x] `trackFormStarted()`
  - [x] `trackStepCompleted()`
  - [x] `trackFormSubmitted()`
  - [x] `trackFormResumed()`
  - [x] `sendEventViaBeacon()` for abandonment
  - [x] `setupUnloadHandler()` for beforeunload
- [x] Move types to `models/` folder (FSD compliance)

### Phase 3: Integration

- [x] Integrate composables in `usePublicFormFlow`
  - [x] Initialize on mount
  - [x] Track form started/resumed
  - [x] Track step completion in `goToNext()`
  - [x] Handle submission with analytics + clear state
  - [x] Setup abandonment tracking
- [x] Update `PublicFormFlow.vue` props
- [x] Update `[urlSlug].vue` page to pass organizationId

### Phase 4: Bug Fixes

- [x] Fix Submit button showing "Continue" on step before Thank You
  - Added `isStepBeforeThankYou` computed property
  - Updated button logic in template

---

## Event Types Implementation

| Event | Trigger | Implementation |
|-------|---------|----------------|
| `form_started` | User lands on form | `onMounted()` in `usePublicFormFlow` |
| `step_completed` | User advances past step | `goToNext()` in `usePublicFormFlow` |
| `step_skipped` | User skips optional step | Type defined, no caller (future use) |
| `form_submitted` | Form completed | `handleSubmission()` in `usePublicFormFlow` |
| `form_abandoned` | Page unload without submit | `beforeunload` handler via Beacon API |
| `form_resumed` | User returns to saved form | `onMounted()` when `restoreState()` succeeds |

---

## Testing Notes

### Manual Testing

1. **Form Started**: Open a public form, check `form_analytics_events` table
2. **Step Completed**: Navigate through steps, verify events logged
3. **Form Resumed**: Fill partially, close tab, reopen - should restore + log resume
4. **Form Submitted**: Complete form, verify submission event + localStorage cleared
5. **Form Abandoned**: Fill partially, close tab - verify abandonment event via Beacon

### E2E Testing

For Playwright tests, block analytics requests to avoid polluting data:

```typescript
await page.route('**/analytics/**', route => route.fulfill({ status: 200 }));
```

---

## Known Limitations

1. **Single device only**: localStorage doesn't sync across devices
2. **Browser-specific**: Private browsing or cleared storage loses progress
3. **7-day expiry**: Forms started but not completed after 7 days start fresh
4. **`step_skipped` not used**: Event type exists but no optional steps implemented yet

---

## Future Enhancements

1. **Analytics Dashboard**: UI for viewing funnel data, abandonment rates
2. **Optional Steps**: Implement `step_skipped` event when feature is added
3. **Cross-device Resume**: Server-side persistence with email verification
4. **Rate Limiting**: Add rate limits per ADR-019 recommendations
