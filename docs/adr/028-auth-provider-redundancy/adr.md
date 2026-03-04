# ADR-028: Auth Provider Redundancy & Abstraction Layer

## Doc Connections
**ID**: `adr-028-auth-redundancy`

2026-02-27-1200 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-001-default-org` - Default Organization Creation on Login
- `guide-auth-implementation` - Auth implementation plan

---

## Status

**Accepted** - 2026-02-27
**Implementation started** - 2026-03-01
**Deferred (Phases 1-4)** - 2026-03-04

> **Phase 0 (Cloudflare Worker proxy) remains active and deployed.** Phases 1-4 (abstraction layer, Better Auth deployment, testing) are deferred until post-MVP. See [Research & Deferral Notes](#research--deferral-notes-2026-03-04) for details.

## Context

### The Problem

On 2026-02-24, the Indian government issued a blocking order under **Section 69A of the IT Act**, causing major ISPs (Jio, Airtel, ACT Fibernet) to DNS-poison `*.supabase.co` domains. Indian users are resolved to sinkhole IPs instead of Supabase's actual servers. This breaks all Supabase-dependent functionality: authentication, storage, real-time, and API calls.

India is Supabase's 4th largest market (~9% of global traffic, ~365K developers). The block operates at **multiple network levels** — not just DNS. Some users report that even custom domains and DNS overrides (1.1.1.1, 8.8.8.8) don't consistently resolve the issue, suggesting deeper packet inspection by some ISPs.

While our application data (PostgreSQL, Hasura) remains fully operational on our self-hosted Hetzner infrastructure, no Indian user can log in because Supabase Auth is the sole identity provider.

### Current Architecture

Supabase serves as a **thin identity layer** in our auth pipeline:

```
User Login → Supabase Auth (identity) → /auth/enhance-token (custom API) → Hasura JWT → App
```

**What Supabase provides:**
- Email/password signup & login
- Google OAuth
- Session management & token refresh
- Signed JWTs with user identity (`sub`, `email`, `user_metadata`)

**What our custom API provides (independent of Supabase):**
- User creation in `users` table
- Identity linking via `user_identities` table (already federated)
- Organization & role resolution
- Hasura JWT claims generation (`x-hasura-user-id`, `x-hasura-organization-id`)
- All authorization logic

### Key Insight: We're 80% Decoupled Already

The `user_identities` table stores `provider` + `provider_user_id`, meaning our database schema was **designed for multi-provider auth from day one**. The `enhance-token` endpoint already normalizes any provider's identity into our internal user system. The remaining coupling is in ~6 files.

### Supabase Integration Surface (Files That Touch Supabase)

| Layer | File | Coupling Type |
|-------|------|---------------|
| Frontend | `apps/web/src/shared/auth/supabase.ts` | Client initialization |
| Frontend | `apps/web/src/features/auth/composables/useAuth.ts` | `supabase.auth.*` calls |
| Frontend | `apps/web/src/features/auth/api/index.ts` | Supabase API methods |
| Frontend | `apps/web/src/shared/authorization/composables/useTokenManager.ts` | `supabase.auth.getSession()` |
| API | `api/src/shared/libs/supabase/client.ts` | Server-side Supabase client |
| API | `api/src/shared/libs/supabase/utils/decodeSupabaseToken.ts` | Supabase JWT decoding |

### Infrastructure Context

Our current Hetzner server runs:
- PostgreSQL 16 (Docker)
- Hasura v2.43.0 (Docker)
- Caddy reverse proxy (Docker, production profile)

The API server (Hono.js) is deployed separately. All infrastructure is self-managed except Supabase Auth.

## Decision

### 0. Immediate Mitigation: Self-Hosted Cloudflare Worker Reverse Proxy

Deploy a **self-hosted Cloudflare Worker** on our own Cloudflare account to proxy all Supabase API traffic through our custom domain. This bypasses the India ISP DNS block without trusting third-party proxy services.

**How it works:**
```
Indian User → api.ourdomain.com (Cloudflare edge) → *.supabase.co (proxied)
```

ISPs block `*.supabase.co` domains, but traffic to our own domain passes through Cloudflare's edge network (300+ PoPs globally), which is not blocked. Cloudflare then forwards the request to Supabase's actual servers.

**Why self-hosted, not JioBase:**

| Factor | Self-Hosted CF Worker | JioBase |
|--------|----------------------|---------|
| **Trust** | Our own Cloudflare account | Third-party indie project |
| **Data exposure** | Auth tokens stay in our infra | Auth tokens flow through third party |
| **Availability** | Tied to our Cloudflare account SLA | No SLA, could disappear |
| **Control** | Full control over routing, headers, CORS | Managed by someone else |
| **Cost** | Free (Cloudflare Workers free tier: 100K req/day) | Free tier, paid for custom domains |

**What the Worker proxies:**
- Supabase Auth endpoints (`/auth/v1/*`)
- Supabase REST endpoints (if needed for future features)
- WebSocket connections for real-time (if needed)

**Frontend change:** Replace the Supabase URL in the client initialization:
```typescript
// Before
const supabase = createClient('https://xyz.supabase.co', anonKey);

// After (env-driven)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Points to CF Worker in production
const supabase = createClient(supabaseUrl, anonKey);
```

**Limitations:**
- Only solves the India ISP DNS block — does **not** solve Supabase itself going down
- Adds ~1-5ms latency per request (Cloudflare edge hop)
- Cloudflare Workers free tier has a 100K requests/day limit (sufficient for MVP)

**Timeline:** Can be deployed in hours. This buys time while we implement the full abstraction layer (Phases 1-4).

### 1. Adopt Better Auth as the Backup Auth Provider

**Better Auth** is selected as the primary backup provider for these reasons:

| Criteria | Better Auth | Why It Wins |
|----------|-------------|-------------|
| Cost | Free (MIT license) | No per-MAU fees, ever |
| Stack fit | Native Hono integration | Plugs directly into our API server |
| Self-hosted | Yes, on our Hetzner server | Same infrastructure, full control |
| Vendor lock-in | None | Open source, we own everything |
| OAuth support | Google, GitHub, 20+ providers | Covers our current + future needs |
| JWT control | Full | We define the token format |
| Community | 13K+ GitHub stars, 350K+ npm/mo | Active, growing project |

### 2. Implement an Auth Port/Adapter Abstraction Layer

Introduce a **Ports and Adapters** (Hexagonal Architecture) pattern so auth providers are swappable via configuration, not code rewrites.

```
                    ┌─────────────────────┐
                    │    useAuth()         │  ← Frontend composable
                    │    (unchanged API)   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    AuthPort          │  ← Interface contract
                    │    (6 methods)       │
                    └──────────┬──────────┘
                          ┌────┴────┐
                ┌─────────▼──┐  ┌───▼──────────┐
                │ Supabase   │  │ Better Auth  │
                │ Adapter    │  │ Adapter      │
                │ (current)  │  │ (backup)     │
                └────────────┘  └──────────────┘
```

### 3. Host Better Auth on the Same Hetzner Server

Better Auth runs as a lightweight Node.js process. Add it to the existing Docker Compose stack rather than provisioning a new server.

**Rationale:**
- Better Auth is a library, not a heavy Java service (unlike Keycloak)
- Memory footprint: ~50-100MB (vs Keycloak's 1-2GB)
- Our Hetzner server already runs PostgreSQL — Better Auth uses the same database
- Reduces operational complexity: one server, one deployment
- If the Hetzner server itself goes down, both auth providers would be unavailable anyway — but that's a different failure mode than a third-party SaaS outage

### 4. Isolate Better Auth Tables in a Separate PostgreSQL Schema

Better Auth auto-creates 4 tables: `user`, `session`, `account`, and `verification`. These are Better Auth's internal tables for session management and identity storage.

**Decision:** Run Better Auth in a dedicated `better_auth` PostgreSQL schema, not `public`.

**Why:**
- Our app already has a `users` table (plural) in `public`. Better Auth creates `user` (singular). No direct collision, but sharing `public` risks future naming conflicts as Better Auth adds features/plugins.
- Clean separation: `public.*` = our app tables, `better_auth.*` = Better Auth internal tables.
- Better Auth's tables are only used internally by Better Auth for session management. Our `enhance-token` endpoint links Better Auth identities to our own `users` table via `user_identities` — it never queries Better Auth's tables directly.
- Easier to reason about, backup, and clean up if Better Auth is ever removed.

**Implementation:** Set `search_path=better_auth` on the PostgreSQL connection pool used by Better Auth, and create the schema via a migration before first run.

### 4. MVP vs Scaling Strategy

#### MVP Strategy (Launch → 1K MAU)

**Keep Supabase as primary, add Better Auth as cold standby.**

- Implement the abstraction layer
- Deploy Better Auth on Hetzner (dormant, not user-facing)
- Test the Better Auth adapter in E2E tests
- Document the failover runbook
- **Failover is manual**: flip an environment variable and redeploy

**Why:** At launch, Supabase's managed service reduces operational burden. We focus on product, not auth infrastructure. The abstraction layer ensures we *can* switch if needed.

#### Scaling Strategy (1K → 100K MAU)

**Migrate to Better Auth as primary, keep Supabase as fallback.**

| Milestone | Action | Rationale |
|-----------|--------|-----------|
| 1K MAU | Better Auth fully tested, running in shadow mode | Validates production readiness |
| 5K MAU | Migrate new signups to Better Auth | Reduces Supabase dependency |
| 10K MAU | Migrate existing users to Better Auth | Full ownership of auth |
| 10K+ MAU | Supabase becomes optional fallback or is removed | Cost savings, full control |

**Cost comparison at scale:**

| MAU | Supabase (primary) | Better Auth (primary) | Savings |
|-----|--------------------|-----------------------|---------|
| 1K | Free | ~$5/mo (infra share) | -$5 |
| 10K | Free | ~$5/mo | -$5 |
| 50K | Free | ~$10/mo | -$10 |
| 100K | ~$25/mo | ~$15/mo | ~$10 |

At our scale, the cost difference is negligible. The real value is **resilience and control**.

## Implementation Overview

### AuthPort Interface (Contract)

```typescript
interface AuthPort {
  // Identity operations
  signUpWithEmail(email: string, password: string, metadata?: UserMetadata): Promise<AuthResult>;
  signInWithEmail(email: string, password: string): Promise<AuthResult>;
  signInWithOAuth(provider: OAuthProvider): Promise<void>;
  signOut(): Promise<void>;

  // Session operations
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(callback: AuthStateCallback): UnsubscribeFn;

  // Provider identity
  readonly providerName: string; // 'supabase' | 'better-auth'
}

interface AuthResult {
  user: {
    id: string;          // Provider's user ID
    email: string;
    metadata: Record<string, unknown>;
  };
  accessToken: string;   // Provider's raw JWT
}

interface AuthSession {
  accessToken: string;
  user: { id: string; email: string };
  expiresAt: number;
}
```

### Backend: Generic Token Decoding

Replace `decodeSupabaseToken` with a provider-aware decoder:

```typescript
interface ProviderTokenPayload {
  sub: string;           // Provider user ID
  email: string;
  metadata: Record<string, unknown>;
  provider: string;      // Which provider issued this
}

function decodeProviderToken(token: string, provider: string): ProviderTokenPayload;
```

The `enhance-token` endpoint already handles the rest (user creation, identity linking, org resolution, Hasura claims).

### Docker Compose Addition (Hetzner)

```yaml
# Added to db/docker-compose.yml
better-auth:
  image: node:22-alpine
  container_name: better-auth
  restart: always
  working_dir: /app
  volumes:
    - ./better-auth:/app
  environment:
    DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
    BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
  ports:
    - "3100:3100"
  depends_on:
    postgres:
      condition: service_healthy
  profiles:
    - with-better-auth
```

Using Docker profiles means Better Auth only starts when explicitly activated:
```bash
docker compose --profile with-better-auth up -d
```

## Consequences

### Positive

1. **Resilience**: Auth outage from any single provider doesn't take down the app
2. **Zero vendor lock-in**: Can switch providers via config change + redeploy
3. **Cost control**: Better Auth is free at any scale
4. **Self-hosted option**: Full control over auth infrastructure on our own server
5. **Existing DB schema ready**: `user_identities` table already supports multi-provider
6. **Small blast radius**: Only ~6 files need the abstraction layer

### Negative

1. **Implementation effort**: ~3-5 days for abstraction layer + Better Auth adapter
2. **Operational complexity**: One more service to monitor on Hetzner (mitigated by Docker profiles — only active when needed)
3. **Testing surface**: Must test both adapters in E2E
4. **User migration**: Moving existing Supabase users to Better Auth requires a migration script for passwords (or password reset flow)

### Neutral

1. **No impact on Hasura**: JWT claims generation is already custom; Hasura doesn't know or care which provider issued the upstream identity
2. **No database schema changes**: `user_identities` already has `provider` column
3. **Existing sessions survive**: Users with valid enhanced JWTs continue working regardless of provider status

## Alternatives Considered

### Alternative 1: Firebase Auth as Backup
- **Rejected for primary backup**: Adds another third-party dependency. Same class of failure as Supabase (managed SaaS outage). Good as a secondary option but doesn't solve the self-hosted resilience problem.

### Alternative 2: Clerk with JWT Templates
- **Rejected**: Expensive at scale ($0.02/MAU), no self-hosting, has had its own outages (Feb 2025, Jun 2025). Could simplify architecture by embedding Hasura claims directly, but lock-in is worse.

### Alternative 3: Auth0
- **Rejected**: Prohibitively expensive for a micro-SaaS. $2,000-4,000/mo at 100K MAU. Enterprise-grade features we don't need.

### Alternative 4: Keycloak
- **Rejected**: Java-based, 1-2GB RAM minimum. Overkill for a thin identity layer. Would strain our Hetzner resources.

### Alternative 5: Custom JWT (bcrypt + jsonwebtoken)
- **Rejected**: High security risk without a dedicated security engineer. OAuth implementation alone is non-trivial. Better Auth gives us the same control with battle-tested security.

### Alternative 6: Ory Kratos
- **Rejected**: Headless (must build all UI from scratch). Session-based rather than JWT-based, requiring an extra token exchange layer. Higher migration effort than Better Auth.

### Alternative 7: JioBase (Managed Reverse Proxy)
- **Rejected**: Third-party managed Cloudflare proxy that routes `*.supabase.co` traffic through `*.jiobase.com`. While open source and free, it routes all auth traffic (including tokens and credentials) through an indie developer's Cloudflare account. No SLA, no guarantee of availability. Adds a third-party dependency rather than removing one. A self-hosted Cloudflare Worker on our own account achieves the same result with full control.

## Research & Deferral Notes (2026-03-04)

### What Was Attempted

Phases 1-3 were implemented over 2026-03-01 to 2026-03-04:

1. **API-side abstraction layer** — `AuthPort`/`TokenDecoder` interfaces, Supabase and Better Auth decoder adapters, generic `decodeProviderToken()` factory
2. **Frontend-side abstraction layer** — `AuthPort` interface, Supabase adapter, Better Auth adapter using official `better-auth/vue` SDK, adapter factory
3. **Better Auth server deployment** — Hono.js + Better Auth on Hetzner, Docker Compose with `profiles: [with-better-auth]`, Caddy reverse proxy, Resend email integration, rate limiting, `better_auth` schema isolation

### Issues Encountered with Better Auth

1. **OAuth `state_mismatch` error** — Cross-origin cookie issue. Better Auth stores OAuth state in cookies, but cross-origin requests (frontend on `localhost:3000`, Better Auth on `auth.testimonial.brownforge.com`) caused `SameSite=Lax` cookies to be dropped. Fixed with `defaultCookieAttributes: { sameSite: 'none', secure: true }`.

2. **Opaque session tokens** — Better Auth uses opaque session tokens (not JWTs). Our `TokenDecoder` pattern assumed local JWT decoding. Required a server-to-server call from our API to Better Auth's `get-session` endpoint for every token validation — adding latency, a network dependency, and a single point of failure.

3. **Session validation failures** — The `get-session` endpoint consistently returned `null` despite correct cookie formatting (including `__Secure-` prefix for HTTPS). Root cause was never fully resolved.

4. **Server stability** — Better Auth server returned 500 errors on sign-up attempts (JSON parse errors in request handling). Debugging the self-hosted Better Auth instance consumed significant time.

5. **Operational overhead** — Running a separate auth server (even lightweight) adds monitoring, deployment, and debugging surface area that is disproportionate for an MVP.

### Alternatives Researched

A comprehensive evaluation of 10+ auth providers was conducted:

| Provider | Type | Verdict | Key Reason |
|----------|------|---------|------------|
| **Better Auth** | Self-hosted OSS | Attempted, abandoned | Opaque tokens, session validation issues, operational overhead |
| **Arctic + jose** | Library (DIY) | **Recommended for future** | Lightweight OAuth library + JWT signing. Full control, no server dependency. ~200 lines of code for Google OAuth + email/password |
| **Auth.js / @hono/auth-js** | Library | Runner-up | Good Hono integration, but session-based by default (needs JWT adapter). Less mature than Arctic for custom flows |
| **WorkOS** | Managed SaaS | Poor fit | Redirect-based auth (not inline), no `onAuthStateChange` equivalent, Vue.js is second-class citizen, $0 up to 1M MAU but enterprise-focused |
| **Ory Kratos** | Self-hosted OSS | Too complex | Headless (must build all UI), session-based not JWT-based, Go binary adds infra complexity |
| **Keycloak** | Self-hosted OSS | Too heavy | Java-based, 1-2GB RAM minimum, enterprise-grade overkill |
| **Logto** | Self-hosted/Cloud | Decent option | Good UI, but another server to run. Cloud tier has per-MAU pricing |
| **SuperTokens** | Self-hosted/Cloud | Decent option | React-focused, Vue support via vanilla JS SDK only |
| **Stack Auth** | Managed | Too new | Small community, unclear long-term viability |
| **Firebase Auth** | Managed SaaS | Same failure class | Another third-party SaaS — doesn't solve the resilience problem |
| **Clerk** | Managed SaaS | Too expensive | $0.02/MAU, vendor lock-in, has had its own outages |
| **Auth0** | Managed SaaS | Too expensive | $2,000-4,000/mo at 100K MAU |

### Why Deferral Is the Right Call

1. **The Cloudflare Worker proxy (Phase 0) already solves the immediate problem** — Indian users can access Supabase through our own domain, bypassing the DNS block.

2. **This is an MVP** — Engineering time is better spent on product features (testimonial collection, widgets, AI assembly) than auth infrastructure redundancy.

3. **The risk is manageable** — Supabase has had one ISP-level block (India) which is solved by the proxy. A full Supabase outage is a different, lower-probability risk that doesn't justify the MVP investment.

4. **The abstraction layer can be added later** — The `user_identities` table already supports multi-provider. When the time comes, Arctic + jose is a 1-2 day implementation that doesn't require running a separate server.

### Future Recommendation

When auth provider redundancy is revisited (post-MVP, likely at 1K+ MAU):

1. **Use Arctic + jose** — Lightweight OAuth library for Google/GitHub OAuth + `jose` for JWT signing. No server dependency. Runs as part of the existing Hono API.
2. **Skip self-hosted auth servers** — The operational overhead of Better Auth, Keycloak, Ory Kratos, etc. is not justified for a micro-SaaS.
3. **Keep the Port/Adapter pattern** — The interface design in this ADR is sound. Implement it when there's a concrete second provider to plug in.

## References

- India Section 69A block (TechCrunch): https://techcrunch.com/2026/02/27/india-disrupts-access-to-popular-developer-platform-supabase-with-blocking-order/
- Supabase Jio ISP issue (GitHub): https://github.com/supabase/supabase/issues/43142
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- Better Auth documentation: https://www.better-auth.com/
- Better Auth Hono integration: https://www.better-auth.com/docs/integrations/hono
- Supabase status history: https://status.supabase.com/history
- Auth abstraction pattern: https://www.unkey.com/blog/auth-abstraction
- `user_identities` table design: `db/hasura/migrations/default/1767004770000_2025_12_29_1609__user_identities__create_table/`
- Current enhance-token flow: `api/src/features/auth/enhanceToken/index.ts`
- Docker Compose infrastructure: `db/docker-compose.yml`
