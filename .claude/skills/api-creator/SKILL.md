---
name: api-creator
description: Create REST API endpoints with OpenAPIHono, Zod schemas, and type-safe frontend integration. Use when adding new Hono endpoints, API schemas, or frontend API composables. Triggers on "create endpoint", "add api", "rest endpoint", "hono route".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# API Endpoint Creator

Create REST API endpoints following Testimonials patterns with full type safety.

**Full documentation**: [docs/api/](../../../docs/api/)

---

## Quick Reference

```
api/src/
├── shared/schemas/{feature}.ts   # 1. Zod schemas (SOURCE OF TRUTH)
├── routes/{feature}.ts           # 2. OpenAPI route
├── features/{feature}/           # 3. Handler logic
└── routes/index.ts               # 4. Export route

apps/web/src/entities/{entity}/
└── api/useApiFor{Entity}.ts      # 5. Frontend composable
```

---

## Workflow

```
1. Define Zod schemas → 2. Create OpenAPI route → 3. Implement handler
                                                         ↓
4. Mount in app ← 5. Export in routes/index.ts ← 6. Create frontend composable
```

---

## Type Safety (CRITICAL)

**OpenAPIHono does NOT support Hono RPC type inference.**

Frontend must import types directly from API schemas:

```typescript
// ✅ CORRECT: Import from API schemas
import type { PresignRequest, PresignResponse } from '@api/shared/schemas/media';

// ❌ WRONG: Duplicate types in frontend
interface PresignRequest { ... }
```

---

## Creating an Endpoint

### Step 1: Define Zod Schemas

**File**: `api/src/shared/schemas/{feature}.ts`

```typescript
import { z } from '@hono/zod-openapi';

export const RequestSchema = z.object({
  name: z.string().min(1).openapi({
    description: 'Description for docs',
    example: 'Example value',
  }),
}).openapi('RequestName');

export const ResponseSchema = z.object({
  id: z.string(),
  // ...fields
}).openapi('ResponseName');

// CRITICAL: Export inferred types
export type RequestType = z.infer<typeof RequestSchema>;
export type ResponseType = z.infer<typeof ResponseSchema>;
```

### Step 2: Create OpenAPI Route

**File**: `api/src/routes/{feature}.ts`

```typescript
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { authMiddleware } from '@/shared/middleware/auth';
import { RequestSchema, ResponseSchema } from '@/shared/schemas/{feature}';
import { ErrorResponseSchema, UnauthorizedResponseSchema } from '@/shared/schemas/common';

const feature = new OpenAPIHono();

const route = createRoute({
  method: 'post',
  path: '/',
  tags: ['Feature'],
  summary: 'Short description',
  security: [{ BearerAuth: [] }],  // For authenticated routes
  request: {
    body: { content: { 'application/json': { schema: RequestSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: ResponseSchema } }, description: 'Success' },
    400: { content: { 'application/json': { schema: ErrorResponseSchema } }, description: 'Bad request' },
    401: { content: { 'application/json': { schema: UnauthorizedResponseSchema } }, description: 'Unauthorized' },
  },
});

// Apply auth (for authenticated routes)
feature.use('/', authMiddleware);

// Register handler
feature.openapi(route, async (c) => {
  const body = c.req.valid('json');  // Typed!
  const { organizationId } = c.get('auth');
  // ...implementation
  return c.json(result);
});

export { feature };
export type FeatureRoutes = typeof feature;
```

### Step 3: Mount Route

**File**: `api/src/index.ts`

```typescript
import { feature } from '@/routes/feature';
app.route('/feature', feature);
```

**File**: `api/src/routes/index.ts`

```typescript
export { feature } from './feature';
export type { FeatureRoutes } from './feature';
```

### Step 4: Create Frontend Composable

**File**: `apps/web/src/entities/{entity}/api/useApiFor{Entity}.ts`

```typescript
import { useApi } from '@/shared/api/rest';
import type { RequestType, ResponseType } from '@api/shared/schemas/{feature}';

export function useApiFor{Entity}() {
  const api = useApi();

  async function doAction(request: RequestType): Promise<ResponseType> {
    return api.post<RequestType, ResponseType>('/feature', request);
  }

  return { doAction };
}
```

---

## Detailed Guides

| Topic | Documentation |
|-------|---------------|
| Full walkthrough | [endpoint-creation.md](../../../docs/api/endpoint-creation.md) |
| Type safety strategy | [README.md](../../../docs/api/README.md) |
| Architecture decisions | [ADR-021](../../../docs/adr/021-api-service-data-layer-architecture/adr.md) |

---

## Patterns

### Authenticated vs Public

| Type | Middleware | Security Field |
|------|------------|----------------|
| Authenticated | `app.use('/', authMiddleware)` | `security: [{ BearerAuth: [] }]` |
| Public | None | Omit `security` field |

### Response Codes

Always include standard error schemas:
- `400` - Validation error (ErrorResponseSchema)
- `401` - Unauthorized (UnauthorizedResponseSchema)
- `500` - Server error (InternalErrorResponseSchema)

---

## Checklist

- [ ] Zod schema with `.openapi()` annotations
- [ ] Types exported with `z.infer<>`
- [ ] Route created with `createRoute()`
- [ ] Auth middleware applied (if needed)
- [ ] Route mounted in `api/src/index.ts`
- [ ] Route exported in `api/src/routes/index.ts`
- [ ] Frontend composable imports from `@api/shared/schemas/`
- [ ] `pnpm typecheck` passes in both api and web
- [ ] Endpoint visible in Swagger UI

---

## Common Commands

```bash
# Type check
pnpm typecheck

# Run API server
pnpm dev:api

# View Swagger UI
open http://localhost:4000/docs
```
