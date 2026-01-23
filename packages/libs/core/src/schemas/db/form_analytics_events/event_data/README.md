# form_analytics_events.event_data (JSONB)

## Overview

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| `form_analytics_events` | `event_data` | `JSONB` | Stores event-specific metadata |

## Current Schema Structure

```typescript
EventData {
  device?: DeviceInfo   // Client-side browser/device info
  geo?: GeoInfo         // Server-side IP geolocation
  // Additional event-specific fields via .passthrough()
}
```

## When This Data is Captured

| Event Type | device | geo | Notes |
|------------|--------|-----|-------|
| `form_started` | ✅ | ✅ | Initial session data |
| `form_resumed` | ✅ | ✅ | May return on different device |
| `step_completed` | ❌ | ❌ | No enrichment needed |
| `step_skipped` | ❌ | ❌ | No enrichment needed |
| `form_submitted` | ❌ | ❌ | No enrichment needed |
| `form_abandoned` | ❌ | ❌ | No enrichment needed |

## Migration Considerations

### When to Consider Normalizing to Tables

1. **Query patterns change**: Need to filter/aggregate by device type, location, etc.
2. **Data volume grows**: JSONB indexing becomes insufficient
3. **Reporting requirements**: Need joins with device/geo data
4. **Data integrity**: Need foreign key constraints

### Potential Normalized Schema

```sql
-- Option A: Separate tables for device and geo
CREATE TABLE session_device_info (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES form_analytics_events(session_id),
  screen_width INT,
  screen_height INT,
  is_mobile BOOLEAN,
  -- ... other fields
  UNIQUE(session_id)  -- One device info per session
);

CREATE TABLE session_geo_info (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES form_analytics_events(session_id),
  country TEXT,
  country_code TEXT,
  city TEXT,
  -- ... other fields
  UNIQUE(session_id)
);

-- Option B: Combined session_metadata table
CREATE TABLE session_metadata (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE,
  -- Device fields
  screen_width INT,
  is_mobile BOOLEAN,
  -- Geo fields
  country TEXT,
  city TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration Path

1. Create new table(s)
2. Backfill from JSONB using `event_data->>'device'`, `event_data->>'geo'`
3. Update API to write to both JSONB and new table
4. Migrate read queries to new table
5. Remove JSONB writes (keep for backward compat or drop)

### Current Decision: Keep as JSONB

**Rationale**:
- Low query complexity (mostly read full event data)
- Schema still evolving (flexibility needed)
- No performance issues at current scale
- Easy to add new fields without migrations

**Revisit when**:
- Need to query by device/geo fields frequently
- Analytics dashboard requires aggregations by location/device
- Data volume exceeds 1M events
