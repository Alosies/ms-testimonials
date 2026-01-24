# ADR-022: Form Dashboard v1

## Doc Connections
**ID**: `adr-022-form-dashboard`

2026-01-23 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-021-api-service-data-layer-architecture` - Data layer (Drizzle, Hono RPC, TanStack Query)
- `adr-018-form-persistence-analytics` - Analytics data collection (data source)
- `prd-testimonials-mvp` - MVP feature requirements

---

## Status

**Accepted** - 2026-01-24

- 2026-01-23: Initial proposal
- 2026-01-24: Data layer decision (Drizzle + TanStack Query)

---

## Context

### The Problem

Form creators currently have no centralized view of how their forms are performing. After creating a form, they must:
1. Manually check the responses page for submissions
2. Have no visibility into abandonment or drop-off patterns
3. Cannot understand their audience (device, location, traffic source)
4. Cannot identify which steps cause users to leave

### Business Value

A form dashboard provides:

| Value | Description |
|-------|-------------|
| **Performance visibility** | Instantly see completion rates and trends |
| **Optimization insights** | Identify problematic steps to improve |
| **Audience understanding** | Know who's filling forms (device, location) |
| **Traffic attribution** | Understand which channels drive submissions |

### Data Availability

We already collect rich analytics data (ADR-018):
- Session events: started, step_completed, abandoned, submitted
- Device info: mobile/desktop, screen size, language, timezone
- Geo location: country, city, ISP (server-side enrichment)
- Traffic source: referrer URL
- Timing: event timestamps for duration calculation

This data is underutilized - currently only shown in a raw session list.

---

## Decision

Create a **Form Dashboard** as the default view at `/:org/forms/:urlSlug` with four sections:

### 1. Key Metrics (Top Row)

Five metric cards showing at-a-glance performance:

| Metric | Calculation | Why It Matters |
|--------|-------------|----------------|
| **Total Sessions** | COUNT of `form_started` events | Volume indicator |
| **Completion Rate** | `form_submitted` / `form_started` × 100 | Primary success metric |
| **Avg. Rating** | AVG of rating step responses | Customer sentiment |
| **Avg. Completion Time** | AVG duration of submitted sessions | UX quality indicator |
| **Abandonment Rate** | `form_abandoned` / `form_started` × 100 | Problem indicator |

**Design:**
```
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│  Sessions │ │Completion │ │Avg Rating │ │ Avg. Time │ │Abandonment│
│    247    │ │   68.4%   │ │  ★ 4.2    │ │  2m 34s   │ │   24.2%   │
│           │ │ ↑18% exp. │ │           │ │ ↓12% exp. │ │ ↓8% exp.  │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
```

**Note on Avg. Rating:**
- Only shown if form has a rating step
- No benchmark comparison (rating is absolute, not relative)
- Shows star visualization + numeric value

**Comparison:** Show performance vs expected benchmark (calculated from form structure).

#### Benchmark Calculation

Instead of comparing to previous time periods (which don't work for new forms), we calculate an **expected completion rate** based on the form's structure.

##### Step Type Complexity Weights

Each step type has a "friction weight" based on user effort required:

| Step Type | Weight | Rationale |
|-----------|--------|-----------|
| `welcome` | 0.3 | Read-only, low friction |
| `thank_you` | 0.0 | End state, no drop-off |
| `rating` | 0.5 | Single click |
| `nps` | 0.5 | Single click |
| `yes_no` | 0.5 | Binary choice |
| `multiple_choice` | 0.6 | Selection from options |
| `short_text` | 1.0 | Typing required |
| `long_text` | 1.5 | Significant typing |
| `email` | 0.8 | Personal info + typing |
| `phone` | 1.2 | Personal info (high abandonment) |
| `consent` | 0.4 | Checkbox click |
| `file_upload` | 2.0 | High effort |
| `video` | 2.5 | Very high effort |

##### Benchmark Formula

```typescript
function calculateExpectedCompletionRate(steps: FormStep[]): number {
  const BASE_RATE = 78;  // Starting point (optimistic)
  const MIN_RATE = 25;   // Floor
  const MAX_RATE = 85;   // Ceiling

  // Calculate total complexity score
  const complexityScore = steps.reduce((sum, step) => {
    return sum + getStepWeight(step.step_type);
  }, 0);

  // Each point of complexity reduces expected rate
  const COMPLEXITY_PENALTY = 4;  // -4% per complexity point

  // Bonus for multi-step (vs single page)
  const MULTI_STEP_BONUS = steps.length > 1 ? 5 : 0;

  // Calculate expected rate
  const expectedRate = BASE_RATE
    - (complexityScore * COMPLEXITY_PENALTY)
    + MULTI_STEP_BONUS;

  return Math.max(MIN_RATE, Math.min(MAX_RATE, expectedRate));
}
```

##### Example Calculations

| Form | Steps | Complexity Score | Expected Rate |
|------|-------|------------------|---------------|
| Quick NPS | welcome(0.3) + nps(0.5) + thank_you(0) | 0.8 | **80%** |
| Standard testimonial | welcome(0.3) + short_text(1.0) + short_text(1.0) + rating(0.5) + consent(0.4) | 3.2 | **65%** |
| Detailed case study | welcome + 3×long_text + rating + email + consent | 6.7 | **49%** |
| Video testimonial | welcome + short_text + video + consent | 4.2 | **59%** |

##### Display Format

```
┌─────────────────────────────────┐
│  Completion Rate                │
│         68.4%                   │
│                                 │
│  ████████████████░░░░░  vs 58%  │  ← Progress bar vs benchmark
│  ↑ 18% above expected           │  ← Green (above benchmark)
│                                 │
│  Expected based on form         │  ← Tooltip explains calculation
│  structure (5 steps, 3.2        │
│  complexity score)              │
└─────────────────────────────────┘
```

##### Sentiment Logic

| Metric | Above Expected | Below Expected |
|--------|---------------|----------------|
| Completion Rate | ✅ Green | ❌ Red |
| Avg. Time | ❌ Red (slower) | ✅ Green (faster) |
| Abandonment Rate | ❌ Red | ✅ Green |

**Note:** Sessions metric doesn't use benchmark comparison (no "expected" sessions).

#### Edge Cases & Meaningless Stats

Metrics must handle edge cases gracefully to avoid showing meaningless or confusing values.

##### Division by Zero

| Scenario | Bad Output | Good Output |
|----------|------------|-------------|
| 0 sessions started | `NaN%`, `Infinity%` | "No data yet" |
| 0 completed, 10 started | `0%` (valid) | `0%` (show normally) |
| 5 completed, 0 started | `Infinity%` | "No data yet" (data inconsistency) |

##### Insufficient Data

| Sessions | Handling | Rationale |
|----------|----------|-----------|
| 0 | Show empty state | No meaningful stats possible |
| 1-4 | Show stats with caveat | "Based on X sessions" warning |
| 5+ | Show stats normally | Statistically more meaningful |

```typescript
function getMetricDisplay(value: number, sessions: number): MetricDisplay {
  // No data
  if (sessions === 0 || !isFinite(value) || isNaN(value)) {
    return { value: null, label: 'No data yet', showBenchmark: false };
  }

  // Insufficient data warning
  if (sessions < 5) {
    return {
      value,
      label: formatValue(value),
      caveat: `Based on ${sessions} session${sessions > 1 ? 's' : ''}`,
      showBenchmark: false,  // Don't compare to benchmark with tiny sample
    };
  }

  // Normal display
  return { value, label: formatValue(value), showBenchmark: true };
}
```

##### Benchmark Comparison Edge Cases

| Scenario | Handling |
|----------|----------|
| No sessions | Hide benchmark comparison entirely |
| < 5 sessions | Hide benchmark (sample too small) |
| Actual = Expected | Show "On target" (neutral, not ↑0%) |
| Difference < 1% | Show "On target" (avoid "↑0.3%") |
| Expected = 0 | Never happens (MIN_RATE = 25%) |

##### Time-Based Edge Cases

| Scenario | Bad Output | Good Output |
|----------|------------|-------------|
| Session < 1 second | "0s" | "< 1s" or exclude from avg |
| Session > 1 hour | Skews average | Cap at 30 min or exclude outliers |
| No completed sessions | "NaN" for avg time | "—" or "No completions" |

##### Implementation Pattern

```typescript
// Safe percentage calculation
function safePercentage(numerator: number, denominator: number): number | null {
  if (denominator === 0 || !isFinite(denominator)) return null;
  const result = (numerator / denominator) * 100;
  if (!isFinite(result) || isNaN(result)) return null;
  return Math.round(result * 10) / 10;  // 1 decimal place
}

// Safe average calculation
function safeAverage(values: number[]): number | null {
  const filtered = values.filter(v => isFinite(v) && v > 0 && v < MAX_DURATION);
  if (filtered.length === 0) return null;
  return filtered.reduce((a, b) => a + b, 0) / filtered.length;
}

// Benchmark difference display
function formatBenchmarkDiff(actual: number, expected: number): string | null {
  if (actual === null || expected === null) return null;

  const diff = actual - expected;
  const percentDiff = (diff / expected) * 100;

  // Too small to be meaningful
  if (Math.abs(percentDiff) < 1) return 'On target';

  const arrow = percentDiff > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(Math.round(percentDiff))}% ${percentDiff > 0 ? 'above' : 'below'} expected`;
}
```

##### Empty State Display

When there's no data, show a helpful empty state instead of zeros:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         📊 No analytics data yet                    │
│                                                     │
│    Share your form to start collecting insights.    │
│                                                     │
│    [Copy Form Link]   [Preview Form]                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2. Conversion Funnel

Visual funnel showing drop-off at each step:

```
┌────────────────────────────────────────────────────────────┐
│ Step 1: Welcome                                            │
│ ████████████████████████████████████████████████████ 100%  │
│ 247 sessions                                               │
├────────────────────────────────────────────────────────────┤
│ Step 2: Problem Question                          ↓ 8% drop│
│ ██████████████████████████████████████████████     92%     │
│ 227 sessions                                               │
├────────────────────────────────────────────────────────────┤
│ Step 3: Solution Question                         ↓ 6% drop│
│ ████████████████████████████████████████          86%      │
│ 212 sessions                                               │
├────────────────────────────────────────────────────────────┤
│ Step 4: Rating                                   ↓ 12% drop│
│ ██████████████████████████████                    74%      │
│ 183 sessions                                               │
├────────────────────────────────────────────────────────────┤
│ Step 5: Consent                                   ↓ 4% drop│
│ ████████████████████████████                      70%      │
│ 173 sessions                                               │
├────────────────────────────────────────────────────────────┤
│ ✓ Submitted                                       ↓ 2% drop│
│ ██████████████████████████                        68%      │
│ 169 sessions                                               │
└────────────────────────────────────────────────────────────┘
```

**Key insight:** Highlight the step with highest drop-off (e.g., "Rating step has 12% drop-off").

**Why funnel matters:**
- Identifies friction points in the form
- Guides optimization efforts
- Shows if changes improve completion

---

### 3. Audience & Response Insights

Two-column layout showing visitor characteristics and response quality.

**Left Column: Device & Location**

```
┌─────────────────────────────────┐
│ Device & Location               │
├─────────────────────────────────┤
│ Desktop         72%  ████████░░ │
│ Mobile          28%  ███░░░░░░░ │
├─────────────────────────────────┤
│ 🇺🇸 United States        42%    │
│ 🇬🇧 United Kingdom       18%    │
│ 🇮🇳 India                12%    │
│ 🇨🇦 Canada                8%    │
│    Other                20%     │
└─────────────────────────────────┘
```

**Right Column: Activity & Ratings**

```
┌─────────────────────────────────┐
│ Average Rating                  │
├─────────────────────────────────┤
│         ★★★★☆                   │
│          4.2                    │
│    out of 5 (from 169 responses)│
├─────────────────────────────────┤
│ Rating Distribution             │
│ 5 ★  ████████████████░░  62%    │
│ 4 ★  ██████░░░░░░░░░░░░  24%    │
│ 3 ★  ██░░░░░░░░░░░░░░░░   8%    │
│ 2 ★  ░░░░░░░░░░░░░░░░░░   4%    │
│ 1 ★  ░░░░░░░░░░░░░░░░░░   2%    │
└─────────────────────────────────┘
```

**Activity Pattern (Below or Collapsible)**

```
┌─────────────────────────────────────────────────────┐
│ Best Time to Send Requests                          │
├─────────────────────────────────────────────────────┤
│ Peak Hours (Respondent Local Time)                  │
│     ▁▂▄▆█▇▅▃▂▁▁▂▃▅▇█▆▄▂▁                           │
│     6  9  12  15  18  21                            │
│                                                     │
│ 💡 Most responses: Tuesday - Thursday, 10am - 2pm   │
└─────────────────────────────────────────────────────┘
```

**Why these insights matter:**
- **Device:** Optimize form for primary device type
- **Location:** Consider language/timezone for follow-up
- **Rating:** Gauge overall customer sentiment at a glance
- **Activity:** Schedule outreach when users are most responsive

**Note:** Traffic Sources removed - testimonial forms are typically shared directly via email/links, making referrer data less meaningful.

---

### 4. Form Info Sidebar

Quick reference panel (right side or collapsible):

```
┌─────────────────────────────────┐
│ Form Details                    │
├─────────────────────────────────┤
│ Status      Published ●         │
│ Created     Jan 15, 2026        │
│ Updated     Jan 22, 2026        │
│ Steps       6 steps             │
├─────────────────────────────────┤
│ Public URL                      │
│ ┌─────────────────────────────┐ │
│ │ testimonials.app/f/abc123  │ │
│ └─────────────────────────────┘ │
│ [Copy Link]  [Preview]  [QR]    │
├─────────────────────────────────┤
│ Quick Actions                   │
│ • Edit in Studio                │
│ • View Responses                │
│ • Form Settings                 │
│ • Embed Widget                  │
└─────────────────────────────────┘
```

---

## Data Queries

### Key Metrics Query

```sql
WITH session_stats AS (
  SELECT
    session_id,
    MIN(created_at) as started_at,
    MAX(created_at) as ended_at,
    bool_or(event_type = 'form_submitted') as completed,
    bool_or(event_type = 'form_abandoned') as abandoned
  FROM form_analytics_events
  WHERE form_id = $1
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY session_id
)
SELECT
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE completed) as completions,
  COUNT(*) FILTER (WHERE abandoned) as abandonments,
  ROUND(COUNT(*) FILTER (WHERE completed)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as completion_rate,
  AVG(ended_at - started_at) FILTER (WHERE completed) as avg_completion_time
FROM session_stats;
```

### Funnel Query

```sql
SELECT
  step_index,
  step_type,
  COUNT(DISTINCT session_id) as sessions_reached
FROM form_analytics_events
WHERE form_id = $1
  AND event_type IN ('form_started', 'step_completed', 'form_submitted')
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY step_index, step_type
ORDER BY step_index;
```

### Device Breakdown Query

```sql
SELECT
  COALESCE(event_data->'device'->>'isMobile', 'false')::boolean as is_mobile,
  COUNT(DISTINCT session_id) as sessions
FROM form_analytics_events
WHERE form_id = $1
  AND event_type = 'form_started'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY is_mobile;
```

### Location Query

```sql
SELECT
  event_data->'geo'->>'country' as country,
  event_data->'geo'->>'countryCode' as country_code,
  COUNT(DISTINCT session_id) as sessions
FROM form_analytics_events
WHERE form_id = $1
  AND event_type = 'form_started'
  AND event_data->'geo'->>'country' IS NOT NULL
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY country, country_code
ORDER BY sessions DESC
LIMIT 5;
```

### Rating Query

Rating data comes from testimonials table (submitted responses), not analytics events.

```sql
SELECT
  AVG(rating) as avg_rating,
  COUNT(*) as total_ratings,
  COUNT(*) FILTER (WHERE rating = 5) as five_star,
  COUNT(*) FILTER (WHERE rating = 4) as four_star,
  COUNT(*) FILTER (WHERE rating = 3) as three_star,
  COUNT(*) FILTER (WHERE rating = 2) as two_star,
  COUNT(*) FILTER (WHERE rating = 1) as one_star
FROM testimonials
WHERE form_id = $1
  AND rating IS NOT NULL
  AND created_at > NOW() - INTERVAL '30 days';
```

### Peak Hours Query

```sql
SELECT
  EXTRACT(HOUR FROM created_at AT TIME ZONE COALESCE(
    event_data->'device'->>'timezone',
    'UTC'
  )) as hour_local,
  COUNT(DISTINCT session_id) as sessions
FROM form_analytics_events
WHERE form_id = $1
  AND event_type = 'form_submitted'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY hour_local
ORDER BY hour_local;
```

---

## Data Layer

This feature uses the data layer architecture defined in [ADR-021: API Service Data Layer Architecture](../021-api-service-data-layer-architecture/adr.md):

- **API**: Hono REST + Drizzle ORM for complex SQL aggregations
- **Frontend**: TanStack Query for smart caching and request deduplication

See ADR-021 for full rationale on technology choices, authentication, and patterns.

---

## Alternatives Considered

### Alternative 1: Separate Analytics Page

**Approach:** Keep overview minimal, create dedicated `/analytics` sub-route.

**Rejected because:**
- Adds navigation friction
- Analytics is the primary value of the overview page
- Users expect dashboard-style views at entity root

### Alternative 2: Real-time Updates

**Approach:** WebSocket-based live updating metrics.

**Deferred because:**
- Adds infrastructure complexity
- Manual refresh is sufficient for MVP
- Can add later via polling or WebSockets

### Alternative 3: Custom Date Ranges

**Approach:** Let users select arbitrary date ranges.

**Deferred because:**
- Adds UI complexity
- Fixed periods (7d, 30d, 90d) cover most needs
- Can add date picker in v2

### Alternative 4: Time-Based Comparison (vs Previous Period)

**Approach:** Compare current 7 days vs previous 7 days (like Google Analytics).

**Rejected because:**
- Doesn't work for new forms (no historical data)
- "Up 12% from last week" is less actionable than "18% above expected"
- Same percentage shown differently feels arbitrary

**May add later:** As secondary indicator alongside benchmark comparison.

### Alternative 5: Platform-Wide Dynamic Benchmarks

**Approach:** Compare to aggregate of all forms on our platform.

**Deferred because:**
- Need significant data volume first
- Privacy considerations (even with aggregation)
- Can transition to this once we have 10,000+ sessions

---

## Implementation Plan

### Prerequisites

Complete [ADR-021: API Service Data Layer Architecture](../021-api-service-data-layer-architecture/adr.md) first:
- Drizzle ORM setup in API
- TanStack Query setup in Web
- Auth middleware with org context
- Database schema definitions

### Phase 1: Core Metrics (MVP)

1. **API:** Implement `getSessionStats.ts` with Drizzle queries
2. **API:** Implement `calculateBenchmark.ts` with step weights
3. **API:** Create `GET /forms/:formId/dashboard` endpoint
4. **Web:** Create `useFormDashboard` composable with TanStack Query
5. **Web:** Build `FormDashboardMetricCard` component
6. **Web:** Display 5 key metrics with loading states
7. **Web:** Add period selector (7d / 30d / 90d)

### Phase 2: Funnel Visualization

1. **API:** Implement `getFunnelData.ts`
2. **Web:** Create `FormDashboardFunnel` component
3. **Web:** Calculate drop-off percentages client-side
4. **Web:** Highlight highest drop-off step

### Phase 3: Audience & Rating Insights

1. **API:** Implement `getAudienceData.ts` (device, location)
2. **API:** Implement `getRatingData.ts` (avg, distribution)
3. **Web:** Create `FormDashboardAudience` component
4. **Web:** Create `FormDashboardRatings` component
5. **Web:** Add simple visualizations (bars, lists)
6. **Web:** Handle missing geo data gracefully

### Phase 4: Polish

1. Add empty states and loading skeletons
2. Mobile responsive layout
3. Add peak hours chart
4. Add export functionality (optional)

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Actionable insights** | Form creators can optimize based on data |
| **Reduced friction** | Key info visible immediately, no navigation needed |
| **Data utilization** | Leverages analytics we already collect |
| **Professional feel** | Dashboard view elevates product perception |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| **Query complexity** | Use materialized views or caching if needed |
| **Page load time** | Parallel queries, skeleton loading states |
| **Data volume** | Aggregate queries, pagination for large forms |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slow queries on large forms | Medium | Medium | Index optimization, query limits |
| Confusing metrics | Low | Medium | Clear labels, tooltips with definitions |
| Missing geo data | Medium | Low | Graceful degradation, show "Unknown" |

---

## File Structure

For base infrastructure (db/, middleware/, shared/api/), see [ADR-021: API Service Data Layer Architecture](../021-api-service-data-layer-architecture/adr.md#file-structure).

### Dashboard Feature (API)

```
api/src/features/dashboard/
├── routes.ts                   # GET /forms/:formId/dashboard
├── getSessionStats.ts          # Key metrics query
├── getFunnelData.ts            # Step-by-step progression
├── getAudienceData.ts          # Device, location breakdown
├── getRatingData.ts            # Rating avg + distribution
├── getPeakHours.ts             # Activity pattern
├── calculateBenchmark.ts       # Expected completion rate
├── types.ts                    # DashboardResponse type
└── __tests__/
    ├── getSessionStats.test.ts
    ├── calculateBenchmark.test.ts
    └── routes.test.ts
```

### Dashboard Feature (Web)

```
apps/web/src/features/formDashboard/
├── ui/
│   ├── FormDashboardMetrics.vue      # 5 metric cards row
│   ├── FormDashboardMetricCard.vue   # Individual metric card
│   ├── FormDashboardFunnel.vue       # Step funnel visualization
│   ├── FormDashboardAudience.vue     # Device + location panel
│   ├── FormDashboardRatings.vue      # Rating + distribution
│   ├── FormDashboardActivity.vue     # Peak hours chart
│   ├── FormDashboardInfo.vue         # Form details sidebar
│   ├── FormDashboardSkeleton.vue     # Loading state
│   └── FormDashboardEmpty.vue        # No data state
├── composables/
│   └── useFormDashboard.ts           # TanStack Query wrapper
├── functions/
│   ├── formatMetricValue.ts          # Display formatting
│   ├── calculateDropoff.ts           # Funnel drop-off %
│   └── getMetricSentiment.ts         # Above/below benchmark
├── models/
│   └── index.ts                      # DashboardData types
└── index.ts
```

### Page Update

```
apps/web/src/pages/[org]/forms/[urlSlug]/
└── index.vue                         # Dashboard page (update)
```

---

## References

### Internal
- [ADR-021: API Service Data Layer Architecture](../021-api-service-data-layer-architecture/adr.md) - Data layer architecture
- [ADR-018: Form Persistence & Analytics](../018-form-persistence-analytics/adr.md) - Data collection

### Industry References
- [Google Analytics Dashboard Patterns](https://analytics.google.com/) - Dashboard design
- [Typeform Insights](https://www.typeform.com/) - Competitor reference

### Benchmark Research
- [Zuko Industry Benchmarking](https://www.zuko.io/benchmarking/industry-benchmarking) - 66% avg completion rate
- [Feathery Form Statistics](https://www.feathery.io/blog/online-form-statistics) - Step type impact data
- [Formsort Completion Stats](https://formsort.com/article/key-form-completion-stats/) - Multi-step vs single-page
- [Venture Harbour Form Length Study](https://ventureharbour.com/how-form-length-impacts-conversion-rates/) - Field count impact
- [FormStory Abandonment Stats](https://formstory.io/learn/form-abandonment-statistics/) - Drop-off by field type
