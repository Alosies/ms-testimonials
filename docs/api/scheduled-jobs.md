# Scheduled Jobs

This document describes the scheduled job system using Hasura Scheduled Triggers.

**ADR Reference:** ADR-023 AI Capabilities Plan Integration (T7)

## Overview

The Testimonials API uses Hasura Scheduled Triggers (cron triggers) to execute background jobs. This provides:

- **Reliability**: Hasura handles scheduling, retries, and failure recovery
- **Observability**: Job execution is logged in Hasura console and API logs
- **Simplicity**: No separate job scheduler infrastructure needed
- **Security**: Webhook authentication prevents unauthorized job execution

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Hasura Engine  │────▶│  API /jobs/*     │────▶│   Job Function  │
│  (Scheduler)    │     │  (HTTP Handler)  │     │   (Business)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │ X-Hasura-Webhook-Secret│                        │
        │◀───────────────────────│                        │
        │                        │                        │
        │    JSON Response       │   CleanupResult /      │
        │◀───────────────────────│   ResetResult          │
        │                        │◀───────────────────────│
```

## Available Jobs

### 1. Credit Reservation Cleanup

**Endpoint:** `POST /jobs/cleanup-reservations`
**Schedule:** Every 5 minutes (`*/5 * * * *`)
**Purpose:** Expire stale credit reservations and return credits to organizations

**Process:**
1. Find reservations where `status='pending'` AND `expires_at < NOW()`
2. Update each reservation status to `'expired'`
3. Decrease `reserved_credits` in `organization_credit_balances`

**Idempotency:** Safe to call multiple times; already-processed reservations are skipped via `WHERE status='pending'` clause.

### 2. Monthly Credit Reset

**Endpoint:** `POST /jobs/reset-credits`
**Schedule:** Daily at midnight UTC (`0 0 * * *`)
**Purpose:** Reset monthly credit allocations at billing period end

**Process:**
1. Find organizations where `period_end <= NOW()`
2. For each organization:
   - Apply pending plan changes if any
   - Calculate new billing period (`period_end + 1 month`)
   - Set `monthly_credits` from plan's `monthly_ai_credits`
   - Keep `bonus_credits` (they carry over)
   - Reset `reserved_credits` to 0
   - Create `credit_transaction` for `'plan_allocation'`
   - If plan changed: create `'plan_change_adjustment'` transaction

**Idempotency:** Safe to call multiple times; only processes organizations with expired periods.

## Security

### Webhook Authentication

All job endpoints require the `X-Hasura-Webhook-Secret` header. This prevents unauthorized execution.

**Configuration:**

1. Generate a secret (minimum 32 characters):
   ```bash
   openssl rand -hex 32
   ```

2. Set in API environment:
   ```env
   HASURA_WEBHOOK_SECRET=your-generated-secret
   ```

3. Set in Hasura environment (Docker Compose or cloud):
   ```yaml
   environment:
     HASURA_WEBHOOK_SECRET: your-generated-secret
     API_URL: http://api:4000  # Internal Docker network URL
   ```

### Response Codes

| Code | Meaning | Hasura Behavior |
|------|---------|-----------------|
| 200 | Success | Job marked complete |
| 401 | Unauthorized | **Stops retries** (auth failure) |
| 5xx | Error | **Triggers retries** |

**Important:** 401 responses stop Hasura from retrying to prevent log spam from misconfigured secrets.

## Logging

Jobs use structured JSON logging for easy parsing in log aggregators:

```json
{
  "level": "info",
  "job": "cleanup-reservations",
  "phase": "complete",
  "durationMs": 245,
  "requestId": "job-1706745600000-a1b2c3",
  "result": {
    "expiredCount": 5,
    "errorCount": 0
  },
  "timestamp": "2026-02-01T00:00:00.245Z",
  "service": "testimonials-api",
  "component": "scheduled-jobs"
}
```

**Log Phases:**
- `start` - Job execution began
- `complete` - Job finished (may have partial errors)
- `error` - Job failed entirely

**Log Levels:**
- `info` - Normal execution
- `warn` - Completed with some errors
- `error` - Failed execution

## Configuration

### Hasura Metadata

Cron triggers are defined in `db/hasura/metadata/cron_triggers.yaml`:

```yaml
- name: cleanup_credit_reservations
  webhook: '{{API_URL}}/jobs/cleanup-reservations'
  schedule: '*/5 * * * *'
  headers:
    - name: X-Hasura-Webhook-Secret
      value_from_env: HASURA_WEBHOOK_SECRET
  retry_conf:
    num_retries: 3
    retry_interval_seconds: 30
    timeout_seconds: 60
    tolerance_seconds: 300
```

**Retry Configuration:**
- `num_retries` - Number of retry attempts on 5xx responses
- `retry_interval_seconds` - Wait time between retries
- `timeout_seconds` - Request timeout
- `tolerance_seconds` - How late the trigger can fire and still run

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `HASURA_WEBHOOK_SECRET` | API + Hasura | Shared secret for webhook auth |
| `API_URL` | Hasura only | Base URL for API webhooks |

## Local Development

### Running Jobs Manually

You can test job endpoints directly:

```bash
# Cleanup reservations
curl -X POST http://localhost:4000/jobs/cleanup-reservations \
  -H "X-Hasura-Webhook-Secret: your-local-secret" \
  -H "Content-Type: application/json"

# Reset credits
curl -X POST http://localhost:4000/jobs/reset-credits \
  -H "X-Hasura-Webhook-Secret: your-local-secret" \
  -H "Content-Type: application/json"
```

### Health Check

The health endpoint doesn't require authentication:

```bash
curl http://localhost:4000/jobs/health
```

Response:
```json
{
  "status": "healthy",
  "webhookSecretConfigured": true,
  "availableJobs": ["cleanup-reservations", "reset-credits"],
  "timestamp": "2026-02-01T12:00:00.000Z"
}
```

### Viewing Cron Trigger Logs

In Hasura Console:
1. Navigate to **Events** → **Cron Triggers**
2. Click on the trigger name
3. View **Invocation Logs** tab

## Troubleshooting

### Jobs Not Running

1. **Check Hasura Console**: Events → Cron Triggers → Invocation Logs
2. **Verify environment variables**: Both `HASURA_WEBHOOK_SECRET` and `API_URL` must be set
3. **Check API health**: `curl http://localhost:4000/jobs/health`

### Authentication Failures (401)

1. Verify `HASURA_WEBHOOK_SECRET` matches in both Hasura and API
2. Check Hasura environment variable is using `value_from_env` correctly
3. Ensure API can read the env var: check `webhookSecretConfigured` in health response

### Jobs Retrying Repeatedly

1. Check API logs for errors (5xx responses trigger retries)
2. Increase `timeout_seconds` if jobs are timing out
3. Check database connectivity

### Missing Job Results

1. Verify the job function is returning data
2. Check for database connection issues
3. Review structured logs for the `requestId`

## Adding New Jobs

1. **Create job function** in `api/src/jobs/`:
   ```typescript
   export async function myNewJob(): Promise<MyJobResult> {
     // Implementation
   }
   ```

2. **Export from index** in `api/src/jobs/index.ts`

3. **Add route handler** in `api/src/routes/jobs.ts`:
   ```typescript
   const myJobRoute = createRoute({
     method: 'post',
     path: '/my-job',
     // ... OpenAPI spec
   });

   jobs.openapi(myJobRoute, async (c) => {
     // Handler with logging
   });
   ```

4. **Add cron trigger** in `db/hasura/metadata/cron_triggers.yaml`

5. **Apply metadata**:
   ```bash
   cd db/hasura
   hasura metadata apply
   ```

## Production Considerations

### Monitoring

- Set up alerts for job failures in your log aggregator
- Monitor the `errorCount` in job results
- Track job duration trends for performance regression

### Scaling

- Jobs are designed to process in batches (e.g., `BATCH_SIZE = 100`)
- Each item is processed independently (one failure doesn't affect others)
- Consider increasing `timeout_seconds` for large datasets

### Disaster Recovery

- Jobs are idempotent; safe to run multiple times
- If a job fails mid-execution, retry will continue from where it left off
- Hasura persists trigger state; triggers resume after restart
