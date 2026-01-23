# ADR-019: Public Form API Security Architecture

## Doc Connections
**ID**: `adr-019-public-form-api-security`

2026-01-20 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-018-form-persistence-analytics` - Form persistence and analytics implementation
- `adr-012-ai-service-infrastructure` - AI service infrastructure patterns

---

## Status

**Proposed** - 2026-01-20

---

## Context

### The Problem

Public form functionality (viewing forms, submitting responses) currently relies on Hasura's `anonymous` role with GraphQL permissions. This approach has significant security limitations:

| Concern | Current State | Risk Level |
|---------|---------------|------------|
| Rate limiting | None | **High** - DoS/abuse possible |
| Input validation | Client-side only | **High** - Malicious payloads |
| Bot protection | None | **High** - Spam submissions |
| Audit logging | Limited | **Medium** - No abuse tracking |
| Data exposure | GraphQL introspection | **Medium** - Schema leakage |

### Current Architecture

```
Frontend (Public Form)
    │
    ▼ (GraphQL - anonymous role)
Hasura
    │
    ▼
PostgreSQL
```

**Problems with direct GraphQL access:**

1. **No rate limiting** - Anonymous users can make unlimited requests
2. **No honeypot/bot detection** - Easy for bots to spam submissions
3. **No request logging** - Hard to detect/block abusive IPs
4. **Schema exposure** - GraphQL introspection reveals database structure
5. **Complex permission management** - Requires maintaining permissions across 8+ tables
6. **No input sanitization** - XSS/injection vectors

### Tables Requiring Anonymous Access (Current)

| Table | Operation | Purpose |
|-------|-----------|---------|
| `forms` | SELECT | Load form config |
| `flows` | SELECT | Load branching flows |
| `form_steps` | SELECT | Load step content |
| `form_questions` | SELECT | Load questions |
| `question_options` | SELECT | Load dropdown options |
| `question_types` | SELECT | Load input types |
| `organizations` | SELECT | Load org logo |
| `media` | SELECT | Load logo image |
| `form_submissions` | INSERT | Submit form |
| `form_question_responses` | INSERT | Submit answers |
| `contacts` | INSERT | Create contact record |
| `form_analytics_events` | INSERT | Track events |

Managing anonymous permissions across 12 table operations is error-prone and provides no security controls.

---

## Decision

Route all anonymous operations through the API layer where we can implement proper security controls. The API uses admin credentials to query Hasura, eliminating the need for complex anonymous permissions.

### New Architecture

```
Frontend (Public Form)
    │
    ▼ (REST API)
┌─────────────────────────────────────────────────┐
│                  Hono API                        │
├─────────────────────────────────────────────────┤
│  1. Rate Limiting (IP-based, sliding window)    │
│  2. Input Validation (Zod schemas)              │
│  3. Security Checks (honeypot, size limits)     │
│  4. Input Sanitization (XSS prevention)         │
│  5. Request Logging (abuse detection)           │
│  6. Business Logic Validation                   │
│  7. Admin GraphQL (bypasses anonymous role)     │
└─────────────────────────────────────────────────┘
    │
    ▼
Hasura (admin-only access)
    │
    ▼
PostgreSQL
```

---

## API Design

### Endpoint 1: GET /forms/:formId/public

Fetch complete form data for public display.

**Security Controls:**
- Rate limit: 60 requests/minute per IP
- Only returns published & active forms
- Strips sensitive fields (created_by, updated_at, etc.)
- Cached responses (Redis, 5-minute TTL)

**Request:**
```
GET /forms/xK9mP2qR4tYn/public
```

**Response (200):**
```json
{
  "form": {
    "id": "xK9mP2qR4tYn",
    "name": "Product Feedback",
    "productName": "Acme Pro",
    "productDescription": "Enterprise solution for...",
    "settings": {
      "primaryColor": "#4f46e5"
    },
    "branchingConfig": {
      "enabled": true,
      "threshold": 4,
      "ratingStepId": "step_abc123"
    },
    "organization": {
      "id": "org_xyz789",
      "logoUrl": "https://cdn.example.com/logos/acme.png"
    }
  },
  "flows": [
    {
      "id": "flow_shared",
      "flowType": "shared",
      "displayOrder": 0
    }
  ],
  "steps": [
    {
      "id": "step_welcome",
      "flowId": "flow_shared",
      "stepType": "welcome",
      "stepOrder": 0,
      "content": { "title": "Welcome!", "description": "..." },
      "tips": [],
      "flowMembership": "shared",
      "question": null
    },
    {
      "id": "step_rating",
      "flowId": "flow_shared",
      "stepType": "rating",
      "stepOrder": 1,
      "content": {},
      "tips": ["Be honest"],
      "flowMembership": "shared",
      "question": {
        "id": "q_rating",
        "questionText": "How would you rate us?",
        "placeholder": null,
        "helpText": null,
        "isRequired": true,
        "minValue": 1,
        "maxValue": 5,
        "scaleMinLabel": "Poor",
        "scaleMaxLabel": "Excellent",
        "questionType": {
          "id": "qt_rating",
          "uniqueName": "rating_scale",
          "name": "Rating Scale",
          "category": "rating",
          "inputComponent": "RatingScaleInput"
        },
        "options": []
      }
    }
  ]
}
```

**Response (404):**
```json
{
  "error": "Form not found or not published",
  "code": "FORM_NOT_FOUND"
}
```

---

### Endpoint 2: POST /forms/:formId/submit

Submit form responses with contact information.

**Security Controls:**
- Rate limit: 10 submissions/minute per IP, 100/hour per form
- Honeypot field detection (reject if filled)
- Input sanitization (strip HTML, limit lengths)
- Required field validation
- Question ID validation (must belong to form)
- Session ID validation (UUID format)

**Request:**
```json
POST /forms/xK9mP2qR4tYn/submit
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "responses": [
    {
      "questionId": "q_rating",
      "answerInteger": 5
    },
    {
      "questionId": "q_feedback",
      "answerText": "Great product, really helped our team..."
    }
  ],
  "contact": {
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "company": "Acme Corp",
    "jobTitle": "Product Manager"
  },
  "consent": {
    "agreedToTerms": true,
    "agreedToMarketing": false
  },
  "_honeypot": ""
}
```

**Response (201):**
```json
{
  "success": true,
  "submissionId": "sub_abc123xyz"
}
```

**Response (400 - Validation Error):**
```json
{
  "error": "Validation failed: responses.0.questionId: Question not found in form",
  "code": "VALIDATION_ERROR"
}
```

**Response (429 - Rate Limited):**
```json
{
  "error": "Too many submissions. Please try again later.",
  "code": "RATE_LIMITED",
  "retryAfter": 45
}
```

---

### Endpoint 3: POST /analytics/events (Existing)

Already implemented. Add rate limiting.

**Enhanced Security Controls:**
- Rate limit: 100 requests/minute per IP
- Validate formId exists and is published (via admin query)

---

## Rate Limiting Strategy

### Implementation: Sliding Window with Redis

```typescript
// api/src/shared/middleware/rateLimit.ts

import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number;      // Window size in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix: string;     // Redis key prefix
}

export function createRateLimiter(redis: Redis, config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0] ||
               c.req.header('x-real-ip') ||
               'unknown';

    const key = `${config.keyPrefix}:${ip}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove old entries and count current window
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(config.windowMs / 1000));

    const results = await pipeline.exec();
    const requestCount = results?.[2]?.[1] as number;

    if (requestCount > config.maxRequests) {
      const oldestInWindow = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const retryAfter = oldestInWindow[1]
        ? Math.ceil((parseInt(oldestInWindow[1]) + config.windowMs - now) / 1000)
        : Math.ceil(config.windowMs / 1000);

      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', retryAfter.toString());
      c.header('Retry-After', retryAfter.toString());

      return c.json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter,
      }, 429);
    }

    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', (config.maxRequests - requestCount).toString());

    return next();
  };
}
```

### Rate Limit Configuration

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `GET /forms/:id/public` | 60 | 1 minute | IP |
| `POST /forms/:id/submit` | 10 | 1 minute | IP |
| `POST /forms/:id/submit` | 100 | 1 hour | formId |
| `POST /analytics/events` | 100 | 1 minute | IP |

---

## Security Validations

### 1. Honeypot Field Detection

```typescript
// api/src/shared/middleware/security.ts

export function honeypotCheck(fieldName: string = '_honeypot') {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();

      // If honeypot field is filled, it's likely a bot
      if (body[fieldName] && body[fieldName].trim() !== '') {
        // Log for monitoring but return success to not tip off the bot
        console.warn('[Security] Honeypot triggered', {
          ip: c.req.header('x-forwarded-for'),
          formId: c.req.param('formId'),
        });

        // Return fake success
        return c.json({ success: true, submissionId: 'fake_' + Date.now() }, 201);
      }

      // Store parsed body for handler
      c.set('parsedBody', body);
      return next();
    } catch {
      return c.json({ error: 'Invalid request body' }, 400);
    }
  };
}
```

### 2. Input Sanitization

```typescript
// api/src/shared/utils/inputSanitizer.ts

import DOMPurify from 'isomorphic-dompurify';

export function sanitizeTextInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';

  // Remove HTML tags
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

  // Trim and limit length
  return stripped.trim().slice(0, maxLength);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

export function sanitizeResponses(responses: unknown[]): SanitizedResponse[] {
  return responses.map(r => ({
    questionId: String(r.questionId).slice(0, 12),
    answerText: r.answerText ? sanitizeTextInput(r.answerText) : undefined,
    answerInteger: typeof r.answerInteger === 'number' ? r.answerInteger : undefined,
    answerBoolean: typeof r.answerBoolean === 'boolean' ? r.answerBoolean : undefined,
    answerJson: r.answerJson ? JSON.parse(JSON.stringify(r.answerJson)) : undefined,
  }));
}
```

### 3. Request Size Limits

```typescript
// In route configuration
import { bodyLimit } from 'hono/body-limit';

// Limit request body to 100KB
forms.use('/*/submit', bodyLimit({ maxSize: 100 * 1024 }));
```

### 4. Request Logging

```typescript
// api/src/shared/middleware/requestLogger.ts

export function publicRequestLogger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const requestId = crypto.randomUUID();

    c.set('requestId', requestId);

    await next();

    const duration = Date.now() - start;
    const log = {
      requestId,
      method: c.req.method,
      path: c.req.path,
      ip: c.req.header('x-forwarded-for'),
      userAgent: c.req.header('user-agent'),
      status: c.res.status,
      duration,
      formId: c.req.param('formId'),
    };

    // Log to structured logging service
    console.log('[PublicAPI]', JSON.stringify(log));
  };
}
```

---

## Hasura Permission Changes

After API implementation, simplify anonymous permissions:

### Keep (Required for Beacon API)

```yaml
# form_analytics_events - Keep anonymous INSERT
# Beacon API sends directly to GraphQL, can't go through API
insert_permissions:
  - role: anonymous
    permission:
      check:
        form:
          _and:
            - is_active: { _eq: true }
            - status: { _eq: published }
      columns:
        - organization_id
        - form_id
        - session_id
        - event_type
        - step_index
        - step_id
        - step_type
        - event_data
        - user_agent
```

### Remove

| Table | Remove | Reason |
|-------|--------|--------|
| `forms` | SELECT | API handles |
| `form_steps` | SELECT | API handles |
| `form_questions` | SELECT | API handles |
| `question_options` | SELECT | API handles |
| `question_types` | SELECT | API handles |
| `form_submissions` | INSERT | API handles |
| `form_question_responses` | INSERT | API handles |

---

## File Structure

```
api/src/
├── shared/
│   ├── middleware/
│   │   ├── rateLimit.ts          # Rate limiting (NEW)
│   │   ├── security.ts           # Honeypot, validation (NEW)
│   │   └── requestLogger.ts      # Request logging (NEW)
│   ├── schemas/
│   │   └── publicForm.ts         # Zod schemas (NEW)
│   └── utils/
│       └── inputSanitizer.ts     # Input sanitization (ENHANCE)
├── entities/
│   └── publicForm/
│       ├── graphql/
│       │   ├── getPublicForm.gql
│       │   └── submitForm.gql
│       └── index.ts
├── features/
│   └── publicForm/
│       ├── getPublicForm/
│       │   └── index.ts
│       └── submitForm/
│           └── index.ts
└── routes/
    └── forms.ts                  # Add public endpoints (MODIFY)
```

---

## Frontend Changes

### New API Client

```typescript
// apps/web/src/shared/api/publicForm.ts

const API_BASE = import.meta.env.VITE_API_URL;

export async function fetchPublicForm(formId: string): Promise<PublicFormData> {
  const response = await fetch(`${API_BASE}/forms/${formId}/public`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new FormNotFoundError();
    }
    if (response.status === 429) {
      throw new RateLimitError(response.headers.get('Retry-After'));
    }
    throw new ApiError('Failed to load form');
  }

  return response.json();
}

export async function submitPublicForm(
  formId: string,
  data: SubmitFormData
): Promise<SubmitFormResponse> {
  const response = await fetch(`${API_BASE}/forms/${formId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      _honeypot: '', // Empty honeypot field
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new SubmissionError(error.code, error.error);
  }

  return response.json();
}
```

### Page Updates

```typescript
// apps/web/src/pages/f/[urlSlug].vue

// BEFORE: Direct GraphQL
const { form, loading } = useGetForm(formVars);
const { formSteps } = useGetFormSteps(stepsVars);

// AFTER: API call
const { data, loading, error } = usePublicForm(formId);
// Returns combined form + flows + steps data
```

---

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Security** | Rate limiting, honeypot, sanitization prevent abuse |
| **Simplicity** | Single API endpoint vs. 12 GraphQL permissions |
| **Observability** | Request logging enables abuse detection |
| **Flexibility** | Can add CAPTCHA, geo-blocking, etc. without schema changes |
| **Performance** | Response caching, optimized queries |
| **Maintainability** | Business logic in API, not Hasura permissions |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| Additional API code | Well-structured, reusable patterns |
| Extra network hop | Minimal latency (<10ms), caching helps |
| Redis dependency for rate limiting | Fallback to in-memory for single instance |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API downtime | Low | High | Health checks, auto-restart |
| Rate limit too aggressive | Medium | Medium | Configurable limits, monitoring |
| Bypass via direct GraphQL | Low | Medium | Remove anonymous permissions |

---

## Implementation Phases

### Phase 1: Core API Endpoints
- [ ] Create rate limiting middleware
- [ ] Create security middleware (honeypot, sanitization)
- [ ] Implement `GET /forms/:formId/public`
- [ ] Implement `POST /forms/:formId/submit`
- [ ] Add request logging

### Phase 2: Frontend Migration
- [ ] Create API client functions
- [ ] Update `[urlSlug].vue` to use API
- [ ] Update `usePublicFormFlow` composable
- [ ] Test form submission flow

### Phase 3: Hasura Cleanup
- [ ] Remove unnecessary anonymous SELECT permissions
- [ ] Remove anonymous INSERT for submissions
- [ ] Keep only `form_analytics_events` INSERT for Beacon API
- [ ] Verify no breaking changes

### Phase 4: Monitoring & Tuning
- [ ] Set up rate limit monitoring dashboard
- [ ] Configure alerting for abuse patterns
- [ ] Tune rate limits based on real usage

---

## References

- ADR-012: AI Service Infrastructure (rate limiting patterns)
- OWASP API Security Top 10
- Hono Rate Limiter: https://github.com/rhinobase/hono-rate-limiter
- Redis Sliding Window: https://redis.io/commands/zrangebyscore/
