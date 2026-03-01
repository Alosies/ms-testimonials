# ADR-028: Implementation Plan — Auth Provider Redundancy

## Doc Connections
**ID**: `impl-028-auth-redundancy`

2026-02-27-1200 IST

**Parent ReadMes**:
- `adr-028-auth-redundancy` - Architecture Decision Record

---

## Overview

This document details the step-by-step implementation of auth provider redundancy with Better Auth as the backup provider and an abstraction layer to make providers swappable.

**Estimated total effort:** 5-8 days across 5 phases (Phase 0 can be done immediately, independent of Phases 1-4)

---

## Phase 0: Immediate Mitigation — Self-Hosted Cloudflare Worker Proxy

**Goal:** Restore Supabase connectivity for Indian users blocked by ISP-level DNS poisoning of `*.supabase.co` domains.

**Estimated effort:** 2-4 hours

**Priority:** URGENT — deploy before Phases 1-4. This is independent of the abstraction layer work.

### Step 0.1: Create Cloudflare Worker

Deploy a reverse proxy Worker on our own Cloudflare account that forwards requests to Supabase.

**Files to create:**
- `infra/cloudflare-worker/wrangler.toml` — Worker configuration
- `infra/cloudflare-worker/src/index.ts` — Proxy logic

**Worker implementation:**
```typescript
// infra/cloudflare-worker/src/index.ts
const SUPABASE_PROJECT_URL = 'https://xyz.supabase.co';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Rewrite the origin to Supabase
    const supabaseUrl = new URL(url.pathname + url.search, SUPABASE_PROJECT_URL);

    // Forward the request with all original headers
    const proxyRequest = new Request(supabaseUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    });

    // Set the Host header to Supabase's domain
    proxyRequest.headers.set('Host', new URL(SUPABASE_PROJECT_URL).host);

    const response = await fetch(proxyRequest);

    // Clone response and add CORS headers for our frontend
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*');

    return modifiedResponse;
  },
};
```

**Wrangler config:**
```toml
# infra/cloudflare-worker/wrangler.toml
name = "supabase-proxy"
main = "src/index.ts"
compatibility_date = "2026-02-28"

[vars]
SUPABASE_PROJECT_URL = "https://xyz.supabase.co"

# Custom domain (set up in Cloudflare dashboard)
# routes = [{ pattern = "api-auth.ourdomain.com/*", zone_name = "ourdomain.com" }]
```

> **Skill:** N/A (Cloudflare Worker, deployed via `wrangler`)

### Step 0.2: Configure Custom Domain in Cloudflare

1. Add a custom domain route in Cloudflare dashboard (e.g., `api-auth.ourdomain.com`)
2. Or use the default `*.workers.dev` domain for initial testing
3. Set up DNS CNAME record pointing to the Worker

**Cloudflare Dashboard steps:**
1. Go to Workers & Pages → `supabase-proxy` → Settings → Domains & Routes
2. Add custom domain: `api-auth.ourdomain.com`
3. Cloudflare auto-provisions SSL certificate

### Step 0.3: Update Frontend Supabase Client URL

**Files to modify:**
- `apps/web/src/shared/auth/supabase.ts` — Use env variable for Supabase URL
- `apps/web/.env.example` — Add `VITE_SUPABASE_URL`
- `apps/web/.env.production` — Point to CF Worker URL

**Change:**
```typescript
// Before (hardcoded or default Supabase URL)
const supabase = createClient('https://xyz.supabase.co', anonKey);

// After (env-driven, proxy-aware)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyz.supabase.co';
const supabase = createClient(supabaseUrl, anonKey);
```

**Environment values:**
```bash
# .env.development (direct to Supabase — no ISP block on dev machines / VPN)
VITE_SUPABASE_URL=https://xyz.supabase.co

# .env.production (through Cloudflare Worker proxy)
VITE_SUPABASE_URL=https://api-auth.ourdomain.com
```

### Step 0.4: Deploy and Verify

```bash
# Deploy the Worker
cd infra/cloudflare-worker
npx wrangler deploy

# Verify proxy works
curl https://api-auth.ourdomain.com/auth/v1/health

# Test from India (or simulate with VPN set to India)
# - Signup flow
# - Login flow
# - Google OAuth redirect
# - Token refresh
```

### Step 0.5: Handle WebSocket Proxying (If Needed)

If real-time subscriptions are used via Supabase, the Worker needs WebSocket support:

```typescript
// Add to the fetch handler
if (request.headers.get('Upgrade') === 'websocket') {
  const supabaseWsUrl = SUPABASE_PROJECT_URL.replace('https://', 'wss://');
  const wsUrl = new URL(url.pathname + url.search, supabaseWsUrl);
  return fetch(new Request(wsUrl.toString(), request));
}
```

**Note:** Cloudflare Workers support WebSocket proxying on all plans.

### Phase 0 Checklist

- [ ] Create Cloudflare Worker project in `infra/cloudflare-worker/`
- [ ] Deploy Worker to Cloudflare (`wrangler deploy`)
- [ ] Configure custom domain (e.g., `api-auth.ourdomain.com`)
- [ ] Update `VITE_SUPABASE_URL` in production env
- [ ] Verify auth flow works through proxy (signup, login, OAuth, token refresh)
- [ ] Redeploy frontend with new env variable
- [ ] Verify Indian users can access the app

---

## Phase 1: Auth Port Abstraction Layer (API Side)

**Goal:** Make the backend auth-provider-agnostic without changing external behavior.

**Estimated effort:** 1-2 days

### Step 1.1: Define AuthPort Types

Create the provider-agnostic interface that both Supabase and Better Auth will implement.

**Files to create:**
- `api/src/shared/auth/models.ts` — `AuthPort`, `ProviderTokenPayload`, `AuthResult` types
- `api/src/shared/auth/index.ts` — Barrel export

**What to define:**
```
ProviderTokenPayload {
  sub: string              // Provider's user ID
  email: string
  metadata: Record<string, unknown>
  provider: 'supabase' | 'better-auth'
}
```

> **Skill:** N/A (pure TypeScript types, manual creation)

### Step 1.2: Create Generic Token Decoder

Replace the Supabase-specific `decodeSupabaseToken` with a provider-aware decoder.

**Files to modify:**
- `api/src/shared/libs/supabase/utils/decodeSupabaseToken.ts` → Keep as `SupabaseTokenDecoder`
- **New:** `api/src/shared/auth/decoders/supabase.ts` — Wraps existing decoder, returns `ProviderTokenPayload`
- **New:** `api/src/shared/auth/decoders/better-auth.ts` — Better Auth token decoder
- **New:** `api/src/shared/auth/decoders/index.ts` — Factory that selects decoder based on provider header or token inspection

**Logic:**
```
decodeProviderToken(token, providerHint?) → ProviderTokenPayload
  1. If providerHint provided, use that decoder directly
  2. If no hint, inspect JWT payload for provider-specific claims:
     - Has `iss: "supabase"` or `app_metadata.provider` → Supabase
     - Has `iss: "better-auth"` → Better Auth
  3. Return normalized ProviderTokenPayload
```

> **Skill:** `/api-code-review` — Review the decoder for architecture compliance after writing

### Step 1.3: Update enhance-token Endpoint

Modify the token enhancement flow to accept tokens from any provider.

**Files to modify:**
- `api/src/features/auth/enhanceToken/index.ts`

**Changes:**
1. Accept optional `provider` field in request body (default: `'supabase'` for backward compat)
2. Replace `decodeSupabaseToken(token)` with `decodeProviderToken(token, provider)`
3. Use `ProviderTokenPayload.provider` when creating `user_identities` records
4. Everything downstream (user creation, org resolution, Hasura claims) stays unchanged

**Request body evolution:**
```typescript
// Before
{ supabaseToken: string }

// After (backward compatible)
{ supabaseToken?: string; token?: string; provider?: 'supabase' | 'better-auth' }
```

If `supabaseToken` is present, treat as `provider: 'supabase'` (backward compat).
If `token` is present, use the `provider` field.

> **Skill:** `/api-code-review` — Review the endpoint changes
> **Skill:** `/api-creator` — If the endpoint shape changes significantly

### Step 1.4: Add Provider Config to Environment

**Files to modify:**
- `api/.env.example` — Add Better Auth env vars
- `db/.env.example` — Add Better Auth Docker env vars

**New env vars:**
```bash
# Auth Provider Configuration
AUTH_PROVIDER=supabase                    # 'supabase' | 'better-auth' | 'auto'
BETTER_AUTH_SECRET=                       # Better Auth signing secret
BETTER_AUTH_URL=http://localhost:3100     # Better Auth server URL

# Google OAuth (shared between providers)
GOOGLE_CLIENT_ID=                         # Already exists for Supabase
GOOGLE_CLIENT_SECRET=                     # Needed for Better Auth
```

> **Skill:** N/A (env file edits)

---

## Phase 2: Auth Port Abstraction Layer (Frontend Side)

**Goal:** Make the frontend auth-provider-agnostic. `useAuth()` API stays identical.

**Estimated effort:** 1-2 days

### Step 2.1: Define Frontend AuthPort Interface

**Files to create:**
- `apps/web/src/shared/auth/port.ts` — Frontend `AuthPort` interface

```typescript
interface AuthPort {
  signUpWithEmail(email: string, password: string, metadata?: UserMetadata): Promise<AuthResult>;
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithOAuth(provider: 'google'): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(callback: AuthStateCallback): UnsubscribeFn;
  readonly providerName: string;
}
```

> **Skill:** N/A (TypeScript interface definition)

### Step 2.2: Extract Supabase Adapter

Wrap existing Supabase calls into an adapter that implements `AuthPort`.

**Files to create:**
- `apps/web/src/shared/auth/adapters/supabase.ts` — `SupabaseAuthAdapter implements AuthPort`

**Files to modify:**
- `apps/web/src/shared/auth/supabase.ts` — Keep as internal, not exported directly
- `apps/web/src/shared/auth/index.ts` — Export adapter, not raw Supabase client

**The adapter wraps:**
```
supabase.auth.signUp()           → adapter.signUpWithEmail()
supabase.auth.signInWithPassword → adapter.signInWithEmail()
supabase.auth.signInWithOAuth()  → adapter.signInWithOAuth()
supabase.auth.signOut()          → adapter.signOut()
supabase.auth.getSession()       → adapter.getSession()
supabase.auth.onAuthStateChange  → adapter.onAuthStateChange()
```

> **Skill:** `/code-review` — Review adapter for Vue/TypeScript conventions

### Step 2.3: Create Better Auth Adapter

**Files to create:**
- `apps/web/src/shared/auth/adapters/better-auth.ts` — `BetterAuthAdapter implements AuthPort`

This adapter uses Better Auth's client SDK (`@better-auth/client`) to implement the same `AuthPort` interface.

> **Skill:** `/code-review` — Review adapter

### Step 2.4: Create Adapter Factory

**Files to create:**
- `apps/web/src/shared/auth/factory.ts` — Factory that instantiates the correct adapter

```typescript
function createAuthAdapter(): AuthPort {
  const provider = import.meta.env.VITE_AUTH_PROVIDER || 'supabase';
  switch (provider) {
    case 'supabase': return new SupabaseAuthAdapter();
    case 'better-auth': return new BetterAuthAdapter();
    default: return new SupabaseAuthAdapter();
  }
}
```

**Files to modify:**
- `apps/web/.env.example` — Add `VITE_AUTH_PROVIDER=supabase`

> **Skill:** N/A

### Step 2.5: Update useAuth Composable

Replace direct `supabase.auth.*` calls with `AuthPort` method calls.

**Files to modify:**
- `apps/web/src/features/auth/composables/useAuth.ts` — Use adapter instead of Supabase directly
- `apps/web/src/shared/authorization/composables/useTokenManager.ts` — Use adapter's `getSession()` instead of `supabase.auth.getSession()`

**Key change in useTokenManager:**
```typescript
// Before
const { data: { session } } = await supabase.auth.getSession();
const supabaseToken = session?.access_token;

// After
const session = await authAdapter.getSession();
const providerToken = session?.accessToken;
// Pass provider name to enhance-token
await fetch('/auth/enhance-token', {
  body: JSON.stringify({ token: providerToken, provider: authAdapter.providerName })
});
```

> **Skill:** `/code-review` — Review the composable changes

### Step 2.6: Update Auth Components

**Files to modify:**
- `apps/web/src/features/auth/components/LoginForm.vue` — Use adapter methods
- `apps/web/src/features/auth/components/SignupForm.vue` — Use adapter methods
- `apps/web/src/features/auth/components/GoogleLoginButton.vue` — Use adapter methods
- `apps/web/src/features/auth/api/index.ts` — Refactor to use adapter

> **Skill:** `/code-review` — Review component changes

---

## Phase 3: Better Auth Server Deployment (Hetzner)

**Goal:** Deploy Better Auth as a Docker service alongside PostgreSQL and Hasura on the existing Hetzner server.

**Estimated effort:** 1 day

### Step 3.1: Create Better Auth Server App

Better Auth can run as a standalone Hono server (matching our existing API framework).

**Files to create:**
- `db/better-auth/package.json` — Minimal Node.js app
- `db/better-auth/src/index.ts` — Hono + Better Auth server
- `db/better-auth/Dockerfile` — Production Docker image

**Server setup:**
```typescript
import { Hono } from 'hono';
import { betterAuth } from 'better-auth';

const auth = betterAuth({
  database: { url: process.env.DATABASE_URL },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});

const app = new Hono();
app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw));
export default { port: 3100, fetch: app.fetch };
```

> **Skill:** `/api-creator` — For endpoint structure if needed

### Step 3.2: Add to Docker Compose

**Files to modify:**
- `db/docker-compose.yml` — Add `better-auth` service with `profiles: [with-better-auth]`

```yaml
better-auth:
  build:
    context: ./better-auth
    dockerfile: Dockerfile
  container_name: better-auth
  restart: always
  environment:
    DATABASE_URL: postgres://${POSTGRES_USER:-testimonials_admin}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-testimonials}
    BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
    BETTER_AUTH_URL: ${BETTER_AUTH_URL:-http://localhost:3100}
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
  ports:
    - "3100:3100"
  depends_on:
    postgres:
      condition: service_healthy
  profiles:
    - with-better-auth
```

**Key decisions:**
- Uses Docker `profiles` — only starts when explicitly activated: `docker compose --profile with-better-auth up -d`
- Shares the same PostgreSQL instance (Better Auth creates its own tables)
- Port 3100 to avoid conflicts with existing services (3000 web, 4000 API, 8080 Hasura)

> **Skill:** N/A (Docker/infra configuration)

### Step 3.3: Add Caddy Routes (Production)

**Files to modify:**
- `db/Caddyfile` — Add reverse proxy route for Better Auth

```
auth.yourdomain.com {
  reverse_proxy better-auth:3100
}
```

> **Skill:** N/A (Caddy configuration)

### Step 3.4: Update Environment Files

**Files to modify:**
- `db/.env.example` — Add Better Auth variables

```bash
# Better Auth (backup auth provider)
BETTER_AUTH_SECRET=your-better-auth-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3100
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> **Skill:** N/A

---

## Phase 4: Testing, Migration & Failover Runbook

**Goal:** Validate the abstraction layer works with both providers and document the failover procedure.

**Estimated effort:** 2 days

### Step 4.1: E2E Tests for Auth Abstraction

Create E2E tests that exercise the full auth flow with each provider.

**Tests to create:**
- Login with email/password (Supabase adapter)
- Login with email/password (Better Auth adapter)
- Google OAuth flow (both adapters)
- Token enhancement works with both provider tokens
- Session refresh works with both adapters
- Logout clears state for both adapters

> **Skill:** `/e2e-tests-creator` — Create the E2E test files
> **Skill:** `/e2e-tests-runner` — Run and validate tests
> **Skill:** `/e2e-test-ids` — Add test IDs to auth components if needed

### Step 4.2: API Integration Tests

**Tests to create:**
- `enhance-token` accepts Supabase token → returns enhanced JWT
- `enhance-token` accepts Better Auth token → returns enhanced JWT
- `enhance-token` with `provider: 'supabase'` backward compat
- User identity created with correct provider name
- Existing user matched by email across providers

> **Skill:** `/api-code-review` — Review test coverage

### Step 4.3: User Migration Script

For users switching from Supabase to Better Auth, create a migration utility.

**Files to create:**
- `api/src/scripts/migrate-auth-provider.ts`

**Strategy:**
- Export user emails from `users` table
- Create corresponding accounts in Better Auth (email/password users get a password reset email)
- Google OAuth users authenticate naturally (Better Auth links by email)
- Update `user_identities` to add Better Auth provider records alongside Supabase records

**Important:** Users don't need to re-register. The `enhance-token` flow already matches users by email and creates new identity records. When a user logs in via Better Auth for the first time, the existing user is found by email, and a new `user_identities` row is created with `provider: 'better-auth'`.

> **Skill:** `/hasura-migrations` — If any DB schema changes needed
> **Skill:** `/hasura-permissions` — If permissions need updating for new tables

### Step 4.4: Failover Runbook

**Create:** `docs/guides/auth-failover-runbook.md`

**Contents:**

#### Detecting an Auth Outage
1. Monitor Supabase status: https://status.supabase.com
2. Monitor auth error rates in application logs
3. Alert if `enhance-token` failure rate exceeds 10% in 5 minutes

#### Manual Failover Steps (MVP)
```bash
# 1. Start Better Auth if not running
ssh hetzner "cd /app/db && docker compose --profile with-better-auth up -d better-auth"

# 2. Switch frontend auth provider
# Update VITE_AUTH_PROVIDER=better-auth in deployment config
# Redeploy frontend

# 3. Switch API auth provider
# Update AUTH_PROVIDER=better-auth in deployment config
# Redeploy API

# 4. Verify
# - Login page shows (no Supabase branding)
# - New signup works
# - Google OAuth works
# - Existing users can log in (password reset needed for email/pw users)
```

#### Failback Steps (Return to Supabase)
```bash
# 1. Verify Supabase is back: https://status.supabase.com
# 2. Switch VITE_AUTH_PROVIDER=supabase
# 3. Switch AUTH_PROVIDER=supabase
# 4. Redeploy frontend + API
# 5. Optionally stop Better Auth:
ssh hetzner "docker stop better-auth"
```

> **Skill:** N/A (documentation)

---

## Phase Summary & Skill Map

| Phase | Description | Duration | Skills Used |
|-------|-------------|----------|-------------|
| **Phase 0** | Cloudflare Worker proxy (immediate fix) | 2-4 hours | N/A (Cloudflare/infra) |
| **Phase 1** | API-side abstraction layer | 1-2 days | `/api-code-review`, `/api-creator` |
| **Phase 2** | Frontend-side abstraction layer | 1-2 days | `/code-review` |
| **Phase 3** | Better Auth deployment on Hetzner | 1 day | `/api-creator` |
| **Phase 4** | Testing + failover runbook | 2 days | `/e2e-tests-creator`, `/e2e-tests-runner`, `/e2e-test-ids`, `/api-code-review`, `/hasura-migrations`, `/hasura-permissions` |

### Skill Reference Quick Guide

| Skill | When to Use |
|-------|-------------|
| `/api-creator` | Creating new Hono endpoints or modifying `enhance-token` |
| `/api-code-review` | Reviewing API changes for architecture compliance |
| `/api-manager` | Orchestrating multiple API operations |
| `/code-review` | Reviewing Vue/TypeScript frontend changes |
| `/e2e-tests-creator` | Writing Playwright tests for auth flows |
| `/e2e-tests-runner` | Running and debugging auth E2E tests |
| `/e2e-test-ids` | Adding `data-testid` to auth components |
| `/e2e-manager` | Orchestrating multiple E2E testing operations |
| `/hasura-migrations` | If Better Auth needs DB schema changes |
| `/hasura-permissions` | If new tables need Hasura permissions |
| `/hasura-table-docs` | Documenting any new auth-related tables |
| `/graphql-code` | If GraphQL queries touch auth entities |
| `/create-commits` | Committing each phase as atomic commits |
| `/agent-browser` | Manual browser testing of auth flows |

---

## Hosting Recommendation: Same Hetzner Server

### Why Same Server (Recommended for MVP)

| Factor | Same Server | Separate Server |
|--------|-------------|-----------------|
| **Cost** | $0 additional | ~$5-15/mo |
| **Latency** | ~0ms to PostgreSQL | Network hop to DB |
| **Ops complexity** | One server to manage | Two servers, networking |
| **Resource usage** | +50-100MB RAM | Dedicated resources |
| **Failure isolation** | Shared (server down = all down) | Independent |

**Verdict:** For MVP and up to ~10K MAU, same server is the right call. Better Auth is lightweight (~50-100MB RAM). The primary risk we're mitigating is **third-party SaaS outage** (Supabase going down), not **server failure**. If the Hetzner server goes down, we have bigger problems than auth.

### When to Move to Separate Server

Move Better Auth to its own server when:
- Hetzner server RAM exceeds 80% sustained utilization
- You need geographic redundancy (auth in EU + US)
- You upgrade to a HA PostgreSQL setup (managed DB like Hetzner managed Postgres)
- You hit >50K MAU and want dedicated resources for auth

At that point, the recommended setup is:
```
Hetzner Server 1: PostgreSQL + Hasura + Caddy (existing)
Hetzner Server 2: Better Auth + its own PostgreSQL (or shared managed DB)
```

---

## File Change Summary

### New Files (14)
```
infra/cloudflare-worker/wrangler.toml                  # CF Worker config (Phase 0)
infra/cloudflare-worker/src/index.ts                   # CF Worker proxy logic (Phase 0)
api/src/shared/auth/models.ts                          # AuthPort types
api/src/shared/auth/index.ts                            # Barrel export
api/src/shared/auth/decoders/supabase.ts                # Supabase decoder adapter
api/src/shared/auth/decoders/better-auth.ts             # Better Auth decoder
api/src/shared/auth/decoders/index.ts                   # Decoder factory
apps/web/src/shared/auth/port.ts                        # Frontend AuthPort interface
apps/web/src/shared/auth/adapters/supabase.ts           # Supabase frontend adapter
apps/web/src/shared/auth/adapters/better-auth.ts        # Better Auth frontend adapter
apps/web/src/shared/auth/factory.ts                     # Adapter factory
db/better-auth/package.json                             # Better Auth server
db/better-auth/src/index.ts                             # Better Auth Hono app
db/better-auth/Dockerfile                               # Docker image
```

### Modified Files (11)
```
apps/web/src/shared/auth/supabase.ts                   # Env-driven Supabase URL (Phase 0)
api/src/features/auth/enhanceToken/index.ts             # Accept provider param
api/src/shared/libs/supabase/utils/decodeSupabaseToken.ts  # Keep, wrap in adapter
apps/web/src/features/auth/composables/useAuth.ts       # Use AuthPort adapter
apps/web/src/shared/authorization/composables/useTokenManager.ts  # Use adapter.getSession()
apps/web/src/features/auth/components/LoginForm.vue     # Use adapter
apps/web/src/features/auth/components/SignupForm.vue     # Use adapter
apps/web/src/features/auth/components/GoogleLoginButton.vue  # Use adapter
apps/web/src/features/auth/api/index.ts                 # Refactor to use adapter
apps/web/src/shared/auth/index.ts                       # Update exports
db/docker-compose.yml                                   # Add better-auth service
```

### Config Files
```
api/.env.example                                        # Add AUTH_PROVIDER, BETTER_AUTH_*
apps/web/.env.example                                   # Add VITE_AUTH_PROVIDER, VITE_SUPABASE_URL
apps/web/.env.production                                # VITE_SUPABASE_URL → CF Worker URL (Phase 0)
db/.env.example                                         # Add BETTER_AUTH_SECRET, GOOGLE_*
db/Caddyfile                                            # Add auth subdomain route
```
