# Creating a New API Endpoint

## Doc Connections
**ID**: `api-endpoint-creation`

2026-01-25 IST

**Parent ReadMes**:
- `api-development-guide` - API development overview

**Related ReadMes**:
- `adr-021-api-service-data-layer-architecture` - Type safety architecture
- `graphql-code-skill` - For Hasura/GraphQL endpoints (different pattern)

---

Step-by-step guide for adding a new endpoint to the Testimonials API.

---

## Prerequisites

- API server running (`pnpm dev:api`)
- Understanding of the endpoint requirements (method, path, auth, request/response)

---

## Step 1: Define Zod Schemas

**File**: `api/src/shared/schemas/{feature}.ts`

```typescript
import { z } from '@hono/zod-openapi';

// Request schema
export const CreateWidgetRequestSchema = z.object({
  name: z.string().min(1).max(100).openapi({
    description: 'Widget display name',
    example: 'My Wall of Love',
  }),
  type: z.enum(['wall_of_love', 'carousel', 'single_quote']).openapi({
    description: 'Widget type',
    example: 'wall_of_love',
  }),
  testimonialIds: z.array(z.string()).optional().openapi({
    description: 'IDs of testimonials to include',
    example: ['test_abc123', 'test_xyz789'],
  }),
}).openapi('CreateWidgetRequest');

// Response schema
export const CreateWidgetResponseSchema = z.object({
  id: z.string().openapi({
    description: 'Created widget ID',
    example: 'wgt_abc123xyz',
  }),
  embedCode: z.string().openapi({
    description: 'HTML embed code',
    example: '<script src="..."></script>',
  }),
}).openapi('CreateWidgetResponse');

// Export inferred types (CRITICAL for frontend)
export type CreateWidgetRequest = z.infer<typeof CreateWidgetRequestSchema>;
export type CreateWidgetResponse = z.infer<typeof CreateWidgetResponseSchema>;
```

### Schema Rules

| Rule | Example |
|------|---------|
| Use `.openapi()` on all schemas | `z.object({...}).openapi('SchemaName')` |
| Add descriptions to all fields | `.openapi({ description: '...' })` |
| Add examples for docs | `.openapi({ example: '...' })` |
| Export `z.infer<>` types | `export type X = z.infer<typeof XSchema>` |

---

## Step 2: Create OpenAPI Route

**File**: `api/src/routes/{feature}.ts`

```typescript
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { authMiddleware } from '@/shared/middleware/auth';
import {
  CreateWidgetRequestSchema,
  CreateWidgetResponseSchema,
} from '@/shared/schemas/widget';
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';

const widgets = new OpenAPIHono();

// Define route with OpenAPI metadata
const createWidgetRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Widgets'],
  summary: 'Create a new widget',
  description: 'Creates an embeddable widget for displaying testimonials.',
  security: [{ BearerAuth: [] }],  // Marks as authenticated
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateWidgetRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Widget created successfully',
      content: {
        'application/json': {
          schema: CreateWidgetResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: UnauthorizedResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: InternalErrorResponseSchema } },
    },
  },
});

// Apply middleware (for authenticated routes)
widgets.use('/', authMiddleware);

// Register route with handler
widgets.openapi(createWidgetRoute, async (c) => {
  const body = c.req.valid('json');  // Typed as CreateWidgetRequest
  const { userId, organizationId } = c.get('auth');

  // TODO: Implement handler (see Step 3)
  const result = await createWidget(body, organizationId);

  return c.json(result, 201);
});

export { widgets };
export type WidgetRoutes = typeof widgets;
```

### Route Definition Rules

| Field | Required | Description |
|-------|----------|-------------|
| `method` | Yes | HTTP method |
| `path` | Yes | Route path (relative to mount point) |
| `tags` | Yes | OpenAPI tags for grouping |
| `summary` | Yes | Short description for docs |
| `description` | No | Detailed description |
| `security` | For auth | `[{ BearerAuth: [] }]` for JWT |
| `request.body` | For POST/PUT | Request body schema |
| `responses` | Yes | All possible response codes |

---

## Step 3: Implement Handler

**File**: `api/src/features/{feature}/{action}/index.ts`

```typescript
import type { Context } from 'hono';
import type { CreateWidgetRequest, CreateWidgetResponse } from '@/shared/schemas/widget';
import { db } from '@/db';  // If using Drizzle
import { widgets } from '@/db/schema';

export async function createWidget(
  request: CreateWidgetRequest,
  organizationId: string
): Promise<CreateWidgetResponse> {
  // Implementation
  const id = generateId();

  await db.insert(widgets).values({
    id,
    organizationId,
    name: request.name,
    type: request.type,
    testimonialIds: request.testimonialIds ?? [],
  });

  return {
    id,
    embedCode: generateEmbedCode(id),
  };
}
```

### Handler Rules

- **Pure function**: Handler logic should be a separate function, not inline
- **Type inputs**: Use schema-inferred types for parameters
- **Org isolation**: Always include `organizationId` in database operations
- **Error handling**: Let errors bubble up, global handler catches them

---

## Step 4: Register Route in App

**File**: `api/src/index.ts`

```typescript
import { widgets } from '@/routes/widgets';

// Mount at path
app.route('/widgets', widgets);
```

**File**: `api/src/routes/index.ts`

```typescript
// Add to exports
export { widgets } from './widgets';
export type { WidgetRoutes } from './widgets';
```

---

## Step 5: Create Frontend Composable

**File**: `apps/web/src/entities/{entity}/api/useApiFor{Entity}.ts`

```typescript
import { useApi } from '@/shared/api/rest';
import type {
  CreateWidgetRequest,
  CreateWidgetResponse,
} from '@api/shared/schemas/widget';

export function useApiForWidget() {
  const api = useApi();

  async function createWidget(
    request: CreateWidgetRequest
  ): Promise<CreateWidgetResponse> {
    return api.post<CreateWidgetRequest, CreateWidgetResponse>(
      '/widgets',
      request
    );
  }

  return {
    createWidget,
  };
}
```

---

## Step 6: Re-export Types in Entity Models (Optional)

**File**: `apps/web/src/entities/{entity}/models/index.ts`

```typescript
// Re-export API types for convenience
export type {
  CreateWidgetRequest,
  CreateWidgetResponse,
} from '@api/shared/schemas/widget';
```

---

## Verification Checklist

- [ ] Schema defined with `.openapi()` annotations
- [ ] Types exported with `z.infer<>`
- [ ] Route created with `createRoute()`
- [ ] Auth middleware applied (if needed)
- [ ] Handler implemented with org isolation
- [ ] Route mounted in `api/src/index.ts`
- [ ] Route exported in `api/src/routes/index.ts`
- [ ] Frontend composable imports types from `@api/shared/schemas/`
- [ ] `pnpm typecheck` passes
- [ ] Endpoint visible in Swagger UI (`/docs`)

---

## Testing the Endpoint

### 1. Check Swagger UI

Navigate to `http://localhost:4000/docs` and verify:
- Endpoint appears in correct tag
- Request/response schemas are correct
- Examples are helpful

### 2. Test with curl

```bash
# Get token first
TOKEN=$(curl -s http://localhost:4000/auth/enhance-token \
  -H "Content-Type: application/json" \
  -d '{"supabaseToken": "..."}' | jq -r '.token')

# Call endpoint
curl http://localhost:4000/widgets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Widget", "type": "wall_of_love"}'
```

### 3. Test Frontend Types

```typescript
// In a Vue component
import { useApiForWidget } from '@/entities/widget';

const { createWidget } = useApiForWidget();

// TypeScript should infer types correctly
const result = await createWidget({
  name: 'Test',
  type: 'wall_of_love',  // Autocomplete should work
});
console.log(result.id);  // Should be typed as string
```

---

## Common Issues

### "Type X is not assignable to type Y"

- Ensure you're importing from `@api/shared/schemas/`, not duplicating types
- Run `pnpm typecheck` in both `api/` and `apps/web/`

### Endpoint not appearing in Swagger

- Check route is mounted in `api/src/index.ts`
- Verify `tags` array is correct
- Restart API server

### Auth middleware not working

- Ensure `security: [{ BearerAuth: [] }]` is in route definition
- Apply middleware before registering route: `app.use('/path', authMiddleware)`
