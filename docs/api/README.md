# API Development Guide

## Doc Connections
**ID**: `api-development-guide`

2026-01-25 IST

**Parent ReadMes**:
- `docs-index` - Documentation index

**Related ReadMes**:
- `adr-021-api-service-data-layer-architecture` - Architecture decisions
- `api-endpoint-creation` - Step-by-step endpoint creation
- `graphql-code-skill` - GraphQL/Hasura patterns (complementary)

**Child ReadMes**:
- `api-endpoint-creation` - Detailed endpoint creation guide

---

Practical guide for creating API endpoints in the Testimonials API.

---

## Quick Start

```
API Endpoint = Zod Schema + OpenAPI Route + Handler + Frontend Types
```

**Files to create/modify:**
1. `api/src/shared/schemas/{feature}.ts` - Request/response schemas
2. `api/src/routes/{feature}.ts` - OpenAPI route definition
3. `apps/web/src/entities/{entity}/api/useApiFor{Entity}.ts` - Frontend composable

---

## Directory Structure

```
api/src/
├── routes/
│   ├── index.ts         # Aggregated exports
│   ├── auth.ts          # Auth routes
│   ├── ai.ts            # AI routes
│   ├── media.ts         # Media routes
│   └── analytics.ts     # Analytics routes
│
├── shared/
│   ├── schemas/         # Zod + OpenAPI schemas (SOURCE OF TRUTH)
│   │   ├── common.ts    # Error, success schemas
│   │   ├── auth.ts
│   │   ├── ai.ts
│   │   ├── media.ts
│   │   └── analytics.ts
│   └── middleware/
│       └── auth.ts      # JWT validation
│
└── features/            # Business logic
    └── {feature}/
        └── index.ts     # Handler implementation
```

---

## Type Safety Strategy

### The Limitation

**OpenAPIHono does NOT support Hono RPC type inference.** The `typeof routes` exports `OpenAPIHono` instances, not chainable route types.

### The Solution

Import Zod-inferred types directly from API schemas:

```typescript
// Frontend composable
import type { PresignRequest, PresignResponse } from '@api/shared/schemas/media';

async function requestPresignedUrl(request: PresignRequest): Promise<PresignResponse> {
  return api.post<PresignRequest, PresignResponse>('/media/presign', request);
}
```

### Type Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Zod Schema (SOURCE OF TRUTH)                                │
│ api/src/shared/schemas/media.ts                             │
│                                                             │
│   export const PresignRequestSchema = z.object({...});      │
│   export type PresignRequest = z.infer<...>;                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ API Route (uses schema for validation)                      │
│ api/src/routes/media.ts                                     │
│                                                             │
│   createRoute({ request: { body: PresignRequestSchema }})   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Frontend (imports types from API)                           │
│ apps/web/src/entities/media/api/useApiForMedia.ts           │
│                                                             │
│   import type { PresignRequest } from '@api/shared/schemas/media'; │
│   api.post<PresignRequest, PresignResponse>('/media/presign', req) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step: Adding a New Endpoint

See [endpoint-creation.md](./endpoint-creation.md) for detailed walkthrough.

### Summary

1. **Define schemas** in `api/src/shared/schemas/{feature}.ts`
2. **Create route** in `api/src/routes/{feature}.ts`
3. **Implement handler** in `api/src/features/{feature}/`
4. **Create frontend composable** importing types from `@api/shared/schemas/`
5. **Re-export types** in entity models if needed

---

## Common Patterns

### Authenticated Endpoint

```typescript
// Apply auth middleware
media.use('/presign', authMiddleware);
media.openapi(presignRoute, generatePresignedUrl);
```

### Public Endpoint

```typescript
// No middleware - endpoint is public
analytics.openapi(trackEventRoute, trackEvent);
```

### Error Responses

Always include standard error schemas:

```typescript
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';

const route = createRoute({
  // ...
  responses: {
    200: { /* success */ },
    400: { content: { 'application/json': { schema: ErrorResponseSchema } } },
    401: { content: { 'application/json': { schema: UnauthorizedResponseSchema } } },
    500: { content: { 'application/json': { schema: InternalErrorResponseSchema } } },
  },
});
```

---

## Frontend API Client

### Typed Fetch Helpers

```typescript
// apps/web/src/shared/api/rest/client.ts
const api = useApi();

// POST with types
const data = await api.post<RequestType, ResponseType>('/endpoint', body);

// GET with types
const data = await api.get<ResponseType>('/endpoint', { param: 'value' });

// Raw fetch when needed
const res = await api.fetch('/endpoint', { method: 'POST', body: JSON.stringify(data) });
```

### Entity Composable Pattern

```typescript
// apps/web/src/entities/{entity}/api/useApiFor{Entity}.ts
import { useApi } from '@/shared/api/rest';
import type { RequestType, ResponseType } from '@api/shared/schemas/{feature}';

export function useApiFor{Entity}() {
  const api = useApi();

  async function doSomething(request: RequestType): Promise<ResponseType> {
    return api.post<RequestType, ResponseType>('/endpoint', request);
  }

  return { doSomething };
}
```

---

## Documentation

API documentation is auto-generated from OpenAPI schemas:

- **OpenAPI Spec**: `http://localhost:4000/openapi.json`
- **Swagger UI**: `http://localhost:4000/docs`

All route descriptions, examples, and schemas come from `createRoute()` definitions.
