# ADR-018: Form Persistence & Analytics

## Doc Connections
**ID**: `adr-018-form-persistence-analytics`

2026-01-20 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-018-implementation` - Implementation details and checklist
- `adr-019-public-form-api-security` - API security for public form endpoints
- `prd-conditional-flow-branching` - Phase 3 mentions recovery & analytics

---

## Status

**Accepted** - 2026-01-20

**Implementation**: [Complete](./implementation.md)

---

## Context

### The Problem

When customers fill out testimonial collection forms, two issues impact completion rates:

1. **Abandonment without data**: If a user closes the tab mid-form, we lose all their progress and have no visibility into where they dropped off.

2. **No form resumption**: If a user gets interrupted (phone call, browser crash, etc.), they must start over from the beginning.

### Business Impact

| Issue | Impact |
|-------|--------|
| No abandonment tracking | Can't identify problematic steps, can't optimize form flow |
| No form resumption | Lower completion rates, frustrated users |
| No funnel analytics | Can't measure conversion rates per step |

### Requirements

1. **Form Resumption**: Users should be able to return to a partially completed form
2. **Abandonment Tracking**: Know when and where users abandon forms
3. **Funnel Analytics**: Track progression through form steps
4. **Privacy-First**: No PII stored on server until explicit submission
5. **Minimal Friction**: No account creation required for form completion

---

## Decision

Implement a **hybrid approach**:
- **localStorage** for form state persistence (client-side, privacy-preserving)
- **Lightweight server-side analytics** for event tracking (no PII)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Public Form)                   │
├─────────────────────────────────────────────────────────────┤
│  useFormPersistence          │  useFormAnalytics            │
│  - localStorage save/restore │  - Track events via API      │
│  - Session ID generation     │  - Beacon API for abandon    │
│  - 7-day expiry              │  - Current step context      │
└─────────────────────────────────────────────────────────────┘
                    │                        │
                    │                        ▼
                    │              POST /analytics/events
                    │                        │
                    ▼                        ▼
              localStorage          form_analytics_events table
              (browser)                   (PostgreSQL)
```

---

## Implementation Details

### 1. Session ID Strategy

Each form-filling session gets a unique client-generated UUID:

```typescript
// Generated once per form visit, stored in localStorage
const sessionId = crypto.randomUUID();
// Example: "550e8400-e29b-41d4-a716-446655440000"
```

**Why client-generated?**
- No server round-trip needed before tracking first event
- Works offline (events queued until online)
- Privacy: server never assigns identifiers to anonymous users

**Storage key pattern:**
```
testimonials_form_{formId}_session  → sessionId
testimonials_form_{formId}_state    → { answers, stepIndex, flow, savedAt }
```

---

### 2. localStorage Persistence

**Persisted State Structure:**

```typescript
interface PersistedFormState {
  formId: string;
  answers: Record<string, unknown>;  // stepId → answer value
  currentStepIndex: number;
  determinedFlow: 'testimonial' | 'improvement' | null;
  sessionId: string;
  savedAt: number;  // Unix timestamp
}
```

**Behavior:**

| Trigger | Action |
|---------|--------|
| Answer change | Debounced save (500ms) |
| Step navigation | Immediate save |
| Form mount | Check for persisted data |
| Successful submit | Clear persisted data |
| 7+ days old | Auto-expire, start fresh |

**Why localStorage (not server-side)?**

| Approach | Pros | Cons |
|----------|------|------|
| **localStorage** | No PII on server, works offline, instant | Single device only, browser-specific |
| Server-side | Cross-device, survives browser clear | Requires email/identifier, privacy concerns |

For testimonial forms (typically single-session), localStorage is the right trade-off.

---

### 3. Analytics Events

**Event Types:**

| Event | When Triggered | Data Captured |
|-------|----------------|---------------|
| `form_started` | User lands on form | formId, sessionId |
| `step_completed` | User advances past step | stepIndex, stepId, stepType |
| `step_skipped` | User skips optional step | stepIndex, stepId, stepType |
| `form_submitted` | Form successfully submitted | formId, sessionId |
| `form_abandoned` | Page unload without submit | stepIndex, stepId, stepType |
| `form_resumed` | User returns to saved form | stepIndex where resumed |

**Database Schema:**

```sql
CREATE TABLE form_analytics_events (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'form_started', 'step_completed', 'step_skipped',
    'form_submitted', 'form_abandoned', 'form_resumed'
  )),
  step_index INTEGER,
  step_id TEXT,
  step_type TEXT,
  event_data JSONB NOT NULL DEFAULT '{}',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_form_analytics_form ON form_analytics_events(form_id, created_at DESC);
CREATE INDEX idx_form_analytics_session ON form_analytics_events(session_id);
CREATE INDEX idx_form_analytics_event_type ON form_analytics_events(organization_id, event_type);
```

**Privacy Considerations:**
- No email, name, or answer content stored
- Only structural data: which step, what type, when
- `event_data` reserved for future non-PII metadata (e.g., viewport size)
- User agent stored for device/browser analytics

---

### 4. Abandonment Tracking via Beacon API

The `beforeunload` event is unreliable for async requests. We use the **Beacon API** for abandonment:

```typescript
// In useFormAnalytics composable
function setupUnloadHandler() {
  window.addEventListener('beforeunload', () => {
    if (isSubmitted.value) return;  // Don't track if already submitted

    const payload = JSON.stringify({
      formId: formId.value,
      organizationId: organizationId.value,
      sessionId: sessionId.value,
      eventType: 'form_abandoned',
      stepIndex: currentStep.value?.index,
      stepId: currentStep.value?.id,
      stepType: currentStep.value?.type,
    });

    navigator.sendBeacon('/api/analytics/events', payload);
  });
}
```

**Why Beacon API?**
- Guaranteed delivery even during page unload
- Non-blocking (doesn't delay page close)
- Works with `POST` requests and JSON payloads

---

### 5. API Endpoint

**POST /analytics/events**

```typescript
// Request
{
  formId: string,
  organizationId: string,
  sessionId: string,  // UUID format
  eventType: 'form_started' | 'step_completed' | ...,
  stepIndex?: number,
  stepId?: string,
  stepType?: string,
  eventData?: Record<string, unknown>
}

// Response (always 200 to not block user experience)
{
  success: true,
  eventId?: string
}
```

**Error Handling:**
- Analytics failures are logged but return success
- Never block form completion due to analytics errors
- Fail silently to prioritize user experience

---

## File Structure

```
api/src/
├── entities/
│   └── formAnalyticsEvent/
│       ├── graphql/
│       │   └── insertFormAnalyticsEvent.gql
│       └── index.ts
├── features/
│   └── analytics/
│       └── trackEvent/
│           └── index.ts
├── routes/
│   └── analytics.ts
└── shared/
    └── schemas/
        └── analytics.ts

apps/web/src/features/publicForm/
├── composables/
│   ├── useFormPersistence.ts
│   ├── useFormAnalytics.ts
│   ├── usePublicFormFlow.ts  (integrates both)
│   └── index.ts
└── models/
    ├── persistence.ts
    ├── analytics.ts
    └── index.ts

db/hasura/
├── migrations/
│   └── .../form_analytics_events__create_table/
│       ├── up.sql
│       └── down.sql
└── metadata/
    └── databases/default/tables/
        └── public_form_analytics_events.yaml
```

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Form resumption** | Users can continue where they left off (same device/browser) |
| **Abandonment visibility** | Know exactly where users drop off |
| **Funnel analytics** | Track conversion rates per step |
| **Privacy-preserving** | No PII stored until explicit submission |
| **Offline-capable** | localStorage works without connectivity |
| **Fast** | No server round-trips for save/restore |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| Single-device only | Acceptable for testimonial forms (typically single-session) |
| Browser storage limits | ~5MB per origin, our data is tiny (~1KB per form) |
| Can be cleared by user | Graceful degradation, just starts fresh |
| 7-day expiry | Long enough for most use cases, configurable if needed |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| localStorage disabled | Low | Low | Feature detection, graceful skip |
| Analytics table growth | Medium | Low | Partition by month, retention policy |
| Beacon API not supported | Very Low | Low | Fallback to regular fetch (best effort) |

---

## Analytics Queries (Future Dashboard)

**Abandonment Rate by Step:**
```sql
SELECT
  step_type,
  step_index,
  COUNT(*) FILTER (WHERE event_type = 'form_abandoned') AS abandonments,
  COUNT(*) FILTER (WHERE event_type = 'step_completed') AS completions,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'form_abandoned')::numeric /
    NULLIF(COUNT(*), 0) * 100, 2
  ) AS abandonment_rate
FROM form_analytics_events
WHERE form_id = $1
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY step_type, step_index
ORDER BY step_index;
```

**Funnel Visualization:**
```sql
SELECT
  step_index,
  COUNT(DISTINCT session_id) AS sessions_reached
FROM form_analytics_events
WHERE form_id = $1
  AND event_type IN ('form_started', 'step_completed')
GROUP BY step_index
ORDER BY step_index;
```

**Resume Rate:**
```sql
SELECT
  COUNT(*) FILTER (WHERE event_type = 'form_resumed') AS resumed,
  COUNT(*) FILTER (WHERE event_type = 'form_started') AS started,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'form_resumed')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'form_started'), 0) * 100, 2
  ) AS resume_rate
FROM form_analytics_events
WHERE form_id = $1;
```

---

## Related Decisions

- **ADR-019**: Public Form API Security - Rate limiting and security for the analytics endpoint
- **Future**: Analytics dashboard UI for visualizing funnel data

---

## References

- [Beacon API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API)
- [localStorage limits](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- PRD: Conditional Flow Branching (Phase 3: Recovery & Analytics)
