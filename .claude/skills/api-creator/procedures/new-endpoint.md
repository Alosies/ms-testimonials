# Creating a New REST Endpoint

Detailed procedure for adding a new endpoint.

## Before You Start

Gather requirements:
- HTTP method (GET, POST, PUT, DELETE)
- Path (e.g., `/widgets`, `/widgets/:id`)
- Authentication (public or authenticated)
- Request body structure (for POST/PUT)
- Response structure
- Error cases

---

## Phase 1: Schema Definition

### 1.1 Create/Update Schema File

**Location**: `api/src/shared/schemas/{feature}.ts`

If file doesn't exist, create it with this template:

```typescript
/**
 * {Feature} API Schemas
 *
 * Zod schemas for {feature} endpoints.
 * Types are inferred and used by both API and frontend.
 */

import { z } from '@hono/zod-openapi';
```

### 1.2 Add Request Schema

```typescript
/**
 * POST /feature - Request body
 */
export const CreateFeatureRequestSchema = z.object({
  // Required field with description
  name: z.string().min(1).max(100).openapi({
    description: 'Feature name',
    example: 'My Feature',
  }),

  // Optional field
  description: z.string().optional().openapi({
    description: 'Optional description',
  }),

  // Enum field
  type: z.enum(['type_a', 'type_b']).openapi({
    description: 'Feature type',
    example: 'type_a',
  }),

  // Array field
  items: z.array(z.string()).optional().openapi({
    description: 'List of item IDs',
    example: ['item_1', 'item_2'],
  }),
}).openapi('CreateFeatureRequest');
```

### 1.3 Add Response Schema

```typescript
/**
 * POST /feature - Response
 */
export const CreateFeatureResponseSchema = z.object({
  id: z.string().openapi({
    description: 'Created feature ID',
    example: 'feat_abc123',
  }),
  name: z.string(),
  createdAt: z.string().datetime().openapi({
    description: 'Creation timestamp',
    example: '2026-01-25T10:30:00Z',
  }),
}).openapi('CreateFeatureResponse');
```

### 1.4 Export Inferred Types

```typescript
// Type exports (CRITICAL for frontend type safety)
export type CreateFeatureRequest = z.infer<typeof CreateFeatureRequestSchema>;
export type CreateFeatureResponse = z.infer<typeof CreateFeatureResponseSchema>;
```

---

## Phase 2: Route Definition

### 2.1 Create/Update Route File

**Location**: `api/src/routes/{feature}.ts`

```typescript
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { authMiddleware } from '@/shared/middleware/auth';
import {
  CreateFeatureRequestSchema,
  CreateFeatureResponseSchema,
} from '@/shared/schemas/feature';
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';

const feature = new OpenAPIHono();
```

### 2.2 Define Route

```typescript
const createFeatureRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Features'],
  summary: 'Create a new feature',
  description: `
Creates a new feature in the system.

**Authentication required.**

Returns the created feature with its ID.
  `.trim(),
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateFeatureRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Feature created successfully',
      content: {
        'application/json': {
          schema: CreateFeatureResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
      content: {
        'application/json': {
          schema: UnauthorizedResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalErrorResponseSchema,
        },
      },
    },
  },
});
```

### 2.3 Apply Middleware and Register Handler

```typescript
// Apply auth middleware for all routes (or specific paths)
feature.use('/*', authMiddleware);

// Register route with handler
feature.openapi(createFeatureRoute, async (c) => {
  const body = c.req.valid('json');
  const { userId, organizationId } = c.get('auth');

  // Call business logic
  const result = await createFeature(body, organizationId);

  return c.json(result, 201);
});

// Export route and type
export { feature };
export type FeatureRoutes = typeof feature;
```

---

## Phase 3: Handler Implementation

### 3.1 Create Handler

**Location**: `api/src/features/{feature}/create/index.ts`

```typescript
import type { CreateFeatureRequest, CreateFeatureResponse } from '@/shared/schemas/feature';
import { db } from '@/db';  // If using Drizzle
import { features } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function createFeature(
  request: CreateFeatureRequest,
  organizationId: string
): Promise<CreateFeatureResponse> {
  const id = `feat_${nanoid(12)}`;
  const now = new Date().toISOString();

  await db.insert(features).values({
    id,
    organizationId,  // ALWAYS include for multi-tenancy
    name: request.name,
    description: request.description,
    type: request.type,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    name: request.name,
    createdAt: now,
  };
}
```

---

## Phase 4: App Integration

### 4.1 Mount Route in App

**File**: `api/src/index.ts`

```typescript
import { feature } from '@/routes/feature';

// Add with other routes
app.route('/features', feature);
```

### 4.2 Export in Routes Index

**File**: `api/src/routes/index.ts`

```typescript
// Add exports
export { feature } from './feature';
export type { FeatureRoutes } from './feature';
```

---

## Phase 5: Frontend Integration

### 5.1 Create API Composable

**Location**: `apps/web/src/entities/{entity}/api/useApiForFeature.ts`

```typescript
/**
 * Feature API Composable
 *
 * Provides type-safe methods for feature operations.
 * Types imported from API schemas (per ADR-021).
 */

import { useApi } from '@/shared/api/rest';
import type {
  CreateFeatureRequest,
  CreateFeatureResponse,
} from '@api/shared/schemas/feature';

export function useApiForFeature() {
  const api = useApi();

  /**
   * Create a new feature
   * POST /features
   */
  async function createFeature(
    request: CreateFeatureRequest
  ): Promise<CreateFeatureResponse> {
    return api.post<CreateFeatureRequest, CreateFeatureResponse>(
      '/features',
      request
    );
  }

  return {
    createFeature,
  };
}
```

### 5.2 Export from Entity

**File**: `apps/web/src/entities/{entity}/api/index.ts`

```typescript
export { useApiForFeature } from './useApiForFeature';
```

### 5.3 Re-export Types (Optional)

**File**: `apps/web/src/entities/{entity}/models/index.ts`

```typescript
// Re-export API types for convenience
export type {
  CreateFeatureRequest,
  CreateFeatureResponse,
} from '@api/shared/schemas/feature';
```

---

## Phase 6: Verification

### 6.1 Type Check

```bash
# Check API types
cd api && pnpm typecheck

# Check frontend types
cd apps/web && pnpm typecheck
```

### 6.2 Test in Swagger UI

1. Start API: `pnpm dev:api`
2. Open `http://localhost:4000/docs`
3. Find endpoint in correct tag
4. Verify schemas look correct
5. Try "Try it out" with valid data

### 6.3 Test Frontend Types

```typescript
// In a component
import { useApiForFeature } from '@/entities/feature/api';

const { createFeature } = useApiForFeature();

// Verify autocomplete works
const result = await createFeature({
  name: 'Test',
  type: 'type_a',  // Should autocomplete enum values
});

console.log(result.id);  // Should be typed as string
```

---

## Troubleshooting

### Types not found in frontend

1. Check import path uses `@api/shared/schemas/`
2. Verify tsconfig.json has `@api/*` path alias
3. Restart TypeScript server in IDE

### Endpoint not in Swagger UI

1. Check route is mounted in `api/src/index.ts`
2. Verify export in `api/src/routes/index.ts`
3. Check `tags` array matches expected category
4. Restart API server

### 401 on authenticated endpoint

1. Verify `authMiddleware` is applied
2. Check `security: [{ BearerAuth: [] }]` in route
3. Ensure token is being passed in Authorization header
