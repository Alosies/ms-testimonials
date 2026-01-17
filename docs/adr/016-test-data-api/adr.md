# ADR-016: Test Data API for E2E Testing

## Doc Connections
**ID**: `adr-016-test-data-api`

2026-01-14

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ADRs**:
- `adr-015-e2e-testing-architecture` - E2E Testing Architecture (this ADR extends it)

---

## Status

**Proposed** - 2026-01-14

---

## Context

### The Problem

ADR-015 established our E2E testing architecture using Playwright. However, test data creation currently relies on a fragile authentication flow:

```typescript
// Current approach in fixtures.ts
async function createTestForm(page: Page) {
  // 1. Extract Supabase token from browser localStorage
  const supabaseToken = await getSupabaseToken(page);

  // 2. Call enhance-token API to get Hasura JWT
  const hasuraToken = await enhanceToken(supabaseToken);

  // 3. Execute GraphQL mutations with the token
  await executeGraphQL(CREATE_FORM, { ... }, hasuraToken);
}
```

**Problems with this approach:**

| Issue | Impact |
|-------|--------|
| **Browser state dependency** | Tests fail if localStorage format changes |
| **Token extraction fragility** | Supabase SDK updates can break extraction |
| **Authentication coupling** | Test data creation tied to user auth flow |
| **Debugging difficulty** | Auth failures obscure test data issues |
| **Speed** | Token dance adds latency to every test |

### Real-World Example

```
Test failure:
  Error: No Supabase token found in browser. Is the user logged in?

Root cause: Supabase SDK 2.x changed localStorage key format
Actual issue: Nothing wrong with the feature being tested
```

### Industry Precedent

Many production systems implement dedicated test APIs:

| Company | Approach | Documentation |
|---------|----------|---------------|
| **Stripe** | Test mode with `sk_test_*` API keys | [Stripe Testing](https://stripe.com/docs/testing) |
| **Twilio** | Test credentials & magic numbers | [Twilio Test Credentials](https://www.twilio.com/docs/iam/test-credentials) |
| **Auth0** | Test tenants with separate configs | [Auth0 Testing](https://auth0.com/docs/deploy-monitor/test) |
| **Plaid** | Sandbox environment with test data | [Plaid Sandbox](https://plaid.com/docs/sandbox/) |
| **SendGrid** | Test API keys with limited scope | SendGrid Testing Guide |

**Common patterns:**
1. Separate authentication mechanism (API keys, not user tokens)
2. Environment-gated access (disabled in production)
3. Scoped operations (only test data, not real data)
4. Audit logging (track all test API calls)

---

## Decision

Implement a **dedicated Test Data API** in the backend with token-based authentication, environment-gated access, and scoped operations for E2E test data management.

### Core Principles

1. **Separation of Concerns** — Test data creation should not depend on user authentication
2. **Explicit Security** — Test API is intentionally disabled in production
3. **Simple Authentication** — Shared secret, not OAuth/JWT
4. **Scoped Operations** — Only create/delete test data, never touch real data
5. **Audit Trail** — Log all test API operations

---

## Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     E2E Test (Playwright)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST /test/forms
                              │ Header: X-Test-Token: {secret}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Server                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Test Routes                             │  │
│  │  • Only mounted when TEST_API_ENABLED=true                 │  │
│  │  • Validates X-Test-Token header                           │  │
│  │  • Logs all operations                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Uses HASURA_ADMIN_SECRET
                              │ (bypasses RLS)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Hasura GraphQL Engine                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Layers                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Environment Gate                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ TEST_API_ENABLED !== 'true' → Routes not mounted            ││
│  │ Production: Variable not set → API doesn't exist            ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  Layer 2: Token Validation                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ X-Test-Token !== TEST_API_SECRET → 401 Unauthorized         ││
│  │ Secret: 64-char random string, rotated periodically         ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  Layer 3: Operation Scoping                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Only test data operations allowed                           ││
│  │ Cannot read/modify production data                          ││
│  │ Test data marked with is_test_data flag (optional)          ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  Layer 4: Audit Logging                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ All operations logged with timestamp, operation, result     ││
│  │ Log level: info (success), warn (validation), error (fail)  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### Environment Configuration

```bash
# .env.test (test/staging environments only)
TEST_API_ENABLED=true
TEST_API_SECRET=your-64-character-random-secret-here-use-openssl-rand-hex-32

# .env.production (production - these should NOT exist)
# TEST_API_ENABLED is not set
# TEST_API_SECRET is not set
```

**Secret Generation:**

```bash
# Generate a secure 64-character hex secret
openssl rand -hex 32
```

### API Routes

```typescript
// api/src/routes/test.ts
import { Hono } from 'hono';
import { logger } from 'hono/logger';

const TEST_API_SECRET = process.env.TEST_API_SECRET;
const TEST_API_ENABLED = process.env.TEST_API_ENABLED === 'true';

// Create test router (only if enabled)
export function createTestRoutes() {
  if (!TEST_API_ENABLED) {
    // Return empty router - routes don't exist in production
    return new Hono();
  }

  if (!TEST_API_SECRET || TEST_API_SECRET.length < 32) {
    console.error('TEST_API_SECRET must be at least 32 characters');
    return new Hono();
  }

  const app = new Hono();

  // Middleware: Validate test token
  app.use('*', async (c, next) => {
    const token = c.req.header('X-Test-Token');

    if (!token || token !== TEST_API_SECRET) {
      console.warn('[TEST API] Unauthorized access attempt', {
        path: c.req.path,
        ip: c.req.header('x-forwarded-for') || 'unknown',
      });
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await next();
  });

  // POST /test/forms - Create test form with steps
  app.post('/forms', async (c) => {
    const body = await c.req.json();
    const { organizationId, name = `E2E Test Form ${Date.now()}` } = body;

    if (!organizationId) {
      return c.json({ error: 'organizationId is required' }, 400);
    }

    console.info('[TEST API] Creating test form', { organizationId, name });

    try {
      const form = await createTestFormWithSteps(organizationId, name);

      console.info('[TEST API] Test form created', { formId: form.id });
      return c.json(form, 201);
    } catch (error) {
      console.error('[TEST API] Failed to create test form', { error });
      return c.json({ error: 'Failed to create test form' }, 500);
    }
  });

  // DELETE /test/forms/:id - Delete test form
  app.delete('/forms/:id', async (c) => {
    const formId = c.req.param('id');

    console.info('[TEST API] Deleting test form', { formId });

    try {
      await deleteTestForm(formId);

      console.info('[TEST API] Test form deleted', { formId });
      return c.json({ success: true });
    } catch (error) {
      console.error('[TEST API] Failed to delete test form', { formId, error });
      return c.json({ error: 'Failed to delete test form' }, 500);
    }
  });

  // GET /test/organizations/:slug - Get organization by slug
  app.get('/organizations/:slug', async (c) => {
    const slug = c.req.param('slug');

    try {
      const org = await getOrganizationBySlug(slug);
      return c.json(org);
    } catch (error) {
      return c.json({ error: 'Organization not found' }, 404);
    }
  });

  // POST /test/cleanup - Clean up all test data (dangerous, use with care)
  app.post('/cleanup', async (c) => {
    const body = await c.req.json();
    const { organizationId, olderThanHours = 24 } = body;

    console.warn('[TEST API] Cleanup requested', { organizationId, olderThanHours });

    try {
      const result = await cleanupTestData(organizationId, olderThanHours);

      console.info('[TEST API] Cleanup completed', result);
      return c.json(result);
    } catch (error) {
      console.error('[TEST API] Cleanup failed', { error });
      return c.json({ error: 'Cleanup failed' }, 500);
    }
  });

  return app;
}
```

### Mount Routes

```typescript
// api/src/index.ts
import { Hono } from 'hono';
import { createTestRoutes } from './routes/test';

const app = new Hono();

// ... other routes ...

// Mount test routes (only active when TEST_API_ENABLED=true)
app.route('/test', createTestRoutes());
```

### Data Operations

```typescript
// api/src/services/test-data.ts
import { hasuraAdminClient } from '../lib/hasura';

interface TestForm {
  id: string;
  name: string;
  organizationId: string;
  studioUrl: string;
  steps: Array<{
    id: string;
    stepType: string;
    stepOrder: number;
  }>;
}

/**
 * Create a test form with steps and questions.
 * Uses admin client to bypass RLS.
 */
export async function createTestFormWithSteps(
  organizationId: string,
  name: string
): Promise<TestForm> {
  // 1. Create form
  const form = await hasuraAdminClient.request(CREATE_FORM, {
    form: {
      name,
      organization_id: organizationId,
      product_name: 'E2E Test Product',
    },
  });

  // 2. Create primary flow
  const flow = await hasuraAdminClient.request(CREATE_FLOW, {
    flow: {
      form_id: form.id,
      organization_id: organizationId,
      flow_type: 'shared',
      is_primary: true,
      name: 'Main Flow',
      display_order: 0,
    },
  });

  // 3. Create steps
  const steps = await hasuraAdminClient.request(CREATE_STEPS, {
    inputs: [
      { flow_id: flow.id, organization_id: organizationId, step_type: 'welcome', step_order: 0, content: { title: 'Share your experience', subtitle: 'It only takes a couple of minutes' } },
      { flow_id: flow.id, organization_id: organizationId, step_type: 'question', step_order: 1 },
      { flow_id: flow.id, organization_id: organizationId, step_type: 'question', step_order: 2 },
      { flow_id: flow.id, organization_id: organizationId, step_type: 'rating', step_order: 3 },
      { flow_id: flow.id, organization_id: organizationId, step_type: 'thank_you', step_order: 4, content: { title: 'Thank you!', subtitle: 'We really appreciate your feedback' } },
    ],
  });

  // 4. Create questions for question/rating steps
  const questionSteps = steps.filter(s => ['question', 'rating'].includes(s.step_type));
  await hasuraAdminClient.request(CREATE_QUESTIONS, {
    inputs: questionSteps.map((step, i) => ({
      step_id: step.id,
      organization_id: organizationId,
      question_type_id: step.step_type === 'rating' ? 'rating_star' : 'text_long',
      question_key: ['problem', 'solution', 'rating'][i],
      question_text: ['What challenges were you facing?', 'How did we help?', 'How satisfied are you?'][i],
      display_order: i + 1,
      is_required: true,
    })),
  });

  // 5. Build response
  const orgSlug = await getOrganizationSlug(organizationId);
  const urlSlug = buildUrlSlug(name, form.id);

  return {
    id: form.id,
    name,
    organizationId,
    studioUrl: `/${orgSlug}/forms/${urlSlug}/studio`,
    steps: steps.map(s => ({
      id: s.id,
      stepType: s.step_type,
      stepOrder: s.step_order,
    })),
  };
}

/**
 * Delete a test form (soft delete).
 */
export async function deleteTestForm(formId: string): Promise<void> {
  await hasuraAdminClient.request(SOFT_DELETE_FORM, { id: formId });
}

/**
 * Clean up old test data.
 */
export async function cleanupTestData(
  organizationId: string,
  olderThanHours: number
): Promise<{ deletedCount: number }> {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

  const result = await hasuraAdminClient.request(CLEANUP_OLD_FORMS, {
    organizationId,
    cutoffDate: cutoff.toISOString(),
    namePattern: 'E2E%', // Only forms starting with "E2E"
  });

  return { deletedCount: result.affected_rows };
}
```

### Playwright Fixture

```typescript
// apps/web/tests/e2e/fixtures.ts
import { test as base, Page } from '@playwright/test';

const TEST_API_URL = process.env.TEST_API_URL || 'http://localhost:4000';
const TEST_API_SECRET = process.env.TEST_API_SECRET;

interface TestFormData {
  id: string;
  name: string;
  studioUrl: string;
  orgSlug: string;
}

// Helper to call test API
async function testApiRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${TEST_API_URL}/test${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Token': TEST_API_SECRET!,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Test API error: ${error.error || response.statusText}`);
  }

  return response.json();
}

export const test = base.extend<{
  authedPage: Page;
  testFormFast: TestFormData;
}>({
  authedPage: async ({ page }, use) => {
    // ... existing auth logic ...
    await use(page);
  },

  // Fast test form fixture using Test API
  testFormFast: async ({ authedPage }, use) => {
    // Get organization from authenticated page URL
    const orgSlug = extractOrgSlug(authedPage.url());
    const org = await testApiRequest<{ id: string }>('GET', `/organizations/${orgSlug}`);

    // Create test form via API
    const form = await testApiRequest<TestFormData>('POST', '/forms', {
      organizationId: org.id,
      name: `E2E Fast Test ${Date.now()}`,
    });

    await use(form);

    // Cleanup
    await testApiRequest('DELETE', `/forms/${form.id}`);
  },
});
```

---

## API Contract

### Authentication

All test API requests must include the `X-Test-Token` header:

```http
X-Test-Token: {TEST_API_SECRET}
```

### Endpoints

#### Create Test Form

```http
POST /test/forms
Content-Type: application/json
X-Test-Token: {secret}

{
  "organizationId": "org_abc123",
  "name": "E2E Test Form 1705234567890"  // optional, auto-generated if not provided
}
```

**Response (201 Created):**

```json
{
  "id": "form_xyz789",
  "name": "E2E Test Form 1705234567890",
  "organizationId": "org_abc123",
  "studioUrl": "/test-org/forms/e2e-test-form_form_xyz789/studio",
  "steps": [
    { "id": "step_1", "stepType": "welcome", "stepOrder": 0 },
    { "id": "step_2", "stepType": "question", "stepOrder": 1 },
    { "id": "step_3", "stepType": "question", "stepOrder": 2 },
    { "id": "step_4", "stepType": "rating", "stepOrder": 3 },
    { "id": "step_5", "stepType": "thank_you", "stepOrder": 4 }
  ]
}
```

#### Delete Test Form

```http
DELETE /test/forms/{formId}
X-Test-Token: {secret}
```

**Response (200 OK):**

```json
{
  "success": true
}
```

#### Get Organization

```http
GET /test/organizations/{slug}
X-Test-Token: {secret}
```

**Response (200 OK):**

```json
{
  "id": "org_abc123",
  "slug": "test-org",
  "name": "Test Organization"
}
```

#### Cleanup Test Data

```http
POST /test/cleanup
Content-Type: application/json
X-Test-Token: {secret}

{
  "organizationId": "org_abc123",
  "olderThanHours": 24  // optional, default 24
}
```

**Response (200 OK):**

```json
{
  "deletedCount": 15
}
```

### Error Responses

```json
// 401 Unauthorized
{ "error": "Unauthorized" }

// 400 Bad Request
{ "error": "organizationId is required" }

// 404 Not Found
{ "error": "Organization not found" }

// 500 Internal Server Error
{ "error": "Failed to create test form" }
```

---

## Security Considerations

### What This Protects Against

| Threat | Mitigation |
|--------|------------|
| **Production exposure** | `TEST_API_ENABLED` not set in production |
| **Unauthorized access** | 64-char secret validation |
| **Secret leakage** | Secret never in client code, env-only |
| **Audit trail** | All operations logged with context |
| **Data confusion** | Test forms named with `E2E` prefix |

### What This Does NOT Protect Against

| Threat | Why | Mitigation |
|--------|-----|------------|
| **Compromised secret** | Secret could be stolen from CI/CD | Rotate secrets periodically |
| **Malicious insider** | Developer with secret access | Audit logs, principle of least privilege |
| **Denial of service** | Many test forms could fill DB | Cleanup endpoint, rate limiting (future) |

### Best Practices

1. **Never commit secrets** — Use environment variables only
2. **Rotate secrets** — Change `TEST_API_SECRET` quarterly
3. **Limit access** — Only CI/CD and authorized developers know secret
4. **Monitor logs** — Alert on unusual test API activity
5. **Cleanup regularly** — Run cleanup endpoint in CI after test runs

---

## Alternatives Considered

### Alternative 1: Database Seeding

**Approach:** Direct database access to seed test data.

```typescript
// Seed script
import { db } from './database';
await db.forms.insert({ ... });
```

**Pros:**
- Very fast
- No network overhead
- Simple implementation

**Cons:**
- Bypasses application logic entirely
- Schema changes require seed updates
- No validation of business rules
- Can't test in deployed environments

**Decision:** Rejected — Too disconnected from application behavior.

---

### Alternative 2: Service Account with Normal APIs

**Approach:** Use a service account to create data via normal authenticated APIs.

```typescript
const serviceToken = await loginAsServiceAccount();
await api.post('/forms', { ... }, { headers: { Authorization: serviceToken } });
```

**Pros:**
- Tests same code paths as users
- No special API needed

**Cons:**
- Still depends on authentication system
- Service account tokens expire
- Slower (full auth flow)
- Complex permission management

**Decision:** Rejected — Doesn't solve the core problem of auth dependency.

---

### Alternative 3: GraphQL Admin Endpoint

**Approach:** Expose Hasura admin secret directly to tests.

```typescript
await graphql(query, { headers: { 'x-hasura-admin-secret': ADMIN_SECRET } });
```

**Pros:**
- Full database access
- Simple implementation

**Cons:**
- Admin secret is extremely sensitive
- No operation scoping
- No audit logging
- High risk if secret leaks

**Decision:** Rejected — Too risky, no operational boundaries.

---

### Alternative 4: Test Data API (Chosen)

**Approach:** Dedicated API with its own authentication and scoped operations.

**Pros:**
- Clear separation from production auth
- Scoped operations (only test data)
- Environment-gated (disabled in prod)
- Audit logging
- Simple to use from tests

**Cons:**
- Additional code to maintain
- Another secret to manage

**Decision:** Accepted — Best balance of safety, simplicity, and reliability.

---

## Migration Plan

### Phase 1: Implement API (Week 1)

1. Create test routes in API
2. Add environment variables
3. Implement form creation/deletion

### Phase 2: Update Fixtures (Week 1)

1. Create new `testFormApi` fixture
2. Keep existing `testFormFast` as fallback
3. Update tests to use API fixture

### Phase 3: CI Integration (Week 2)

1. Add `TEST_API_SECRET` to CI secrets
2. Update GitHub Actions workflow
3. Add cleanup step after test runs

### Phase 4: Deprecate Old Approach (Week 3)

1. Remove browser token extraction
2. Simplify fixtures
3. Update documentation

---

## Consequences

### Positive

- **Reliable** — No browser state dependency
- **Fast** — Direct API call, no token dance
- **Debuggable** — Clear error messages, audit logs
- **Secure** — Environment-gated, scoped operations
- **Maintainable** — Single source of truth for test data creation

### Negative

- **Additional code** — New API routes to maintain
- **Secret management** — Another secret to rotate and protect
- **Potential drift** — Test data creation could diverge from real flow

### Acceptable Trade-offs

- The additional code is minimal and isolated
- Secret management is a solved problem in CI/CD
- Test data matches production structure, just created differently

---

## References

- [ADR-015: E2E Testing Architecture](../015-e2e-testing-architecture/adr.md)
- [Stripe Test Mode Documentation](https://stripe.com/docs/testing)
- [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [12-Factor App: Config](https://12factor.net/config)
