# REST API Client

Type-safe HTTP client for the Hono REST API.

## Why "rest" and not "rpc"?

This folder was originally named `rpc/` assuming we could use [Hono RPC](https://hono.dev/docs/guides/rpc) for end-to-end type safety. However, **OpenAPIHono with `createRoute()` does not support Hono RPC type inference**.

### The Limitation

Hono RPC works by inferring types from chained route definitions:

```typescript
// Standard Hono (RPC works)
const app = new Hono()
  .post('/feature', async (c) => { ... });

type AppType = typeof app;
const client = hc<AppType>('/api');
client.feature.$post();  // ✅ Fully typed
```

But OpenAPIHono routes are defined differently:

```typescript
// OpenAPIHono (RPC does NOT work)
const route = createRoute({
  method: 'post',
  path: '/',
  request: { body: { schema: RequestSchema } },
  responses: { 200: { schema: ResponseSchema } },
});

app.openapi(route, async (c) => { ... });
```

The `createRoute()` pattern stores schemas in a separate object, breaking the type chain that Hono RPC relies on.

### Trade-off Decision

We chose **OpenAPIHono** over vanilla Hono because:

| Feature | OpenAPIHono | Hono RPC |
|---------|-------------|----------|
| Swagger UI docs | ✅ Auto-generated | ❌ Not available |
| Schema validation | ✅ Via Zod | ✅ Via Zod |
| Frontend type safety | ⚠️ Manual imports | ✅ Automatic |
| API documentation | ✅ OpenAPI 3.0 | ❌ None |

**Decision**: OpenAPI documentation is more valuable for team collaboration and API consumers than automatic RPC types. We achieve type safety through explicit type imports.

## Type Safety Strategy

Instead of Hono RPC, we use **typed fetch helpers with explicit type imports**:

```typescript
// In entity composables (e.g., useApiForMedia.ts)
import { useApi } from '@/shared/api/rest';
import type { PresignRequest, PresignResponse } from '@api/shared/schemas/media';

export function useApiForMedia() {
  const api = useApi();

  async function requestPresignedUrl(request: PresignRequest): Promise<PresignResponse> {
    return api.post<PresignRequest, PresignResponse>('/media/presign', request);
  }

  return { requestPresignedUrl };
}
```

### Type Flow

```
API Zod Schema (api/src/shared/schemas/*.ts)
         │
         ▼
    z.infer<> exports
         │
         ▼
Frontend import (@api/shared/schemas/*)
         │
         ▼
  Typed fetch helper (api.post<Req, Res>())
```

## Files

| File | Purpose |
|------|---------|
| `client.ts` | Creates typed fetch helpers with auth header injection |
| `useApi.ts` | Vue composable providing singleton API client |
| `index.ts` | Barrel exports |

## Usage

```typescript
import { useApi } from '@/shared/api/rest';

// In a composable at setup time
const api = useApi();

// Later, in any function
const data = await api.post<RequestType, ResponseType>('/endpoint', body);
const result = await api.get<ResponseType>('/endpoint');
```

## Related Documentation

- [ADR-021: API Data Layer Architecture](../../../../../docs/adr/021-api-service-data-layer-architecture/adr.md)
- [API Development Guide](../../../../../docs/api/README.md)
