# ADR-021: Form Dashboard v1

## Doc Connections
**ID**: `adr-021-form-dashboard`

2026-01-23 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-018-form-persistence-analytics` - Analytics data collection (data source)
- `prd-testimonials-mvp` - MVP feature requirements

---

## Status

**Proposed** - 2026-01-23

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

Four metric cards showing at-a-glance performance:

| Metric | Calculation | Why It Matters |
|--------|-------------|----------------|
| **Total Sessions** | COUNT of `form_started` events | Volume indicator |
| **Completion Rate** | `form_submitted` / `form_started` × 100 | Primary success metric |
| **Avg. Completion Time** | AVG duration of submitted sessions | UX quality indicator |
| **Abandonment Rate** | `form_abandoned` / `form_started` × 100 | Problem indicator |

**Design:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Sessions  │ │ Completion  │ │  Avg. Time  │ │ Abandonment │
│     247     │ │    68.4%    │ │   2m 34s    │ │    24.2%    │
│   ↑12% ▲    │ │   ↑5% ▲     │ │   ↓8% ▼     │ │   ↓3% ▼     │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Comparison period:** Show % change vs previous period (7 days default).

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

### 3. Audience Insights

Two-column layout showing visitor characteristics:

**Left Column: Device & Location**

```
┌─────────────────────────────────┐
│ Device Breakdown                │
│ ┌─────────┐                     │
│ │  72%    │ Desktop    178      │
│ │  28%    │ Mobile      69      │
│ └─────────┘                     │
├─────────────────────────────────┤
│ Top Locations                   │
│ 🇺🇸 United States        42%    │
│ 🇬🇧 United Kingdom       18%    │
│ 🇮🇳 India                12%    │
│ 🇨🇦 Canada                8%    │
│ 🇩🇪 Germany               6%    │
│    Other                 14%    │
└─────────────────────────────────┘
```

**Right Column: Traffic & Time**

```
┌─────────────────────────────────┐
│ Traffic Sources                 │
│ 🔗 google.com             34%   │
│ 🔗 twitter.com            22%   │
│ 🔗 linkedin.com           15%   │
│ 🔗 Direct                 18%   │
│ 🔗 Other                  11%   │
├─────────────────────────────────┤
│ Peak Hours (Local Time)         │
│     ▁▂▄▆█▇▅▃▂▁▁▂▃▅▇█▆▄▂▁       │
│     6  9  12  15  18  21        │
│                                 │
│ Busiest: 10am - 11am            │
└─────────────────────────────────┘
```

**Why audience insights matter:**
- **Device:** Optimize form for primary device type
- **Location:** Consider language/timezone for follow-up
- **Referrer:** Double down on effective channels
- **Time:** Schedule outreach when users are active

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

---

## Implementation Plan

### Phase 1: Core Metrics (MVP)

1. Create `useFormDashboardStats` composable
2. Build `FormDashboardMetricCard` component
3. Display 4 key metrics with loading states
4. Add period selector (7d / 30d / 90d)

### Phase 2: Funnel Visualization

1. Create `FormDashboardFunnel` component
2. Query step-by-step progression data
3. Calculate drop-off percentages
4. Highlight highest drop-off step

### Phase 3: Audience Insights

1. Create `FormDashboardAudience` component
2. Aggregate device, location, referrer data
3. Add simple visualizations (bars, lists)
4. Handle missing geo data gracefully

### Phase 4: Polish

1. Add comparison vs previous period
2. Add export functionality
3. Add empty states and loading skeletons
4. Mobile responsive layout

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

```
apps/web/src/
├── features/
│   └── formDashboard/
│       ├── ui/
│       │   ├── FormDashboardMetrics.vue      # 4 metric cards
│       │   ├── FormDashboardMetricCard.vue   # Individual card
│       │   ├── FormDashboardFunnel.vue       # Step funnel
│       │   ├── FormDashboardAudience.vue     # Device/location/referrer
│       │   ├── FormDashboardInfo.vue         # Form details sidebar
│       │   └── FormDashboardSkeleton.vue     # Loading state
│       ├── composables/
│       │   ├── useFormDashboardStats.ts      # Metrics query
│       │   ├── useFormFunnelData.ts          # Funnel query
│       │   └── useFormAudienceData.ts        # Audience queries
│       ├── functions/
│       │   ├── calculateFunnelDropoff.ts
│       │   └── aggregateAudienceData.ts
│       ├── models/
│       │   └── index.ts
│       └── index.ts
│
├── entities/
│   └── formAnalyticsEvent/
│       └── graphql/
│           └── queries/
│               ├── getFormDashboardStats.gql
│               ├── getFormFunnelData.gql
│               └── getFormAudienceData.gql
```

---

## References

- [ADR-018: Form Persistence & Analytics](../018-form-persistence-analytics/adr.md) - Data collection
- [Google Analytics Dashboard Patterns](https://analytics.google.com/) - Industry reference
- [Typeform Insights](https://www.typeform.com/) - Competitor reference
