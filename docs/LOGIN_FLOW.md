# Login Flow Documentation

This document maps the complete login functionality data flow, including all watchers, promises, stores, and files involved.

---

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `features/auth/api/index.ts` | Supabase auth API calls |
| `features/auth/composables/useAuth.ts` | Auth state management & initialization |
| `shared/authorization/composables/useTokenManager.ts` | Token enhancement & storage |
| `shared/currentContext/store/index.ts` | Pinia store for user/org context |
| `shared/currentContext/composables/useCurrentContext.ts` | Context initialization & watchers |
| `App.vue` | Two-stage loader orchestration |
| `app/router/guards/index.ts` | Route protection & redirects |
| `pages/auth/callback.vue` | OAuth callback handling |
| `pages/index.vue` | Landing page with auth redirect |

---

## State Variables Quick Reference

### Auth Step State Machine (features/auth/models/index.ts)

The auth system uses a state machine (`AuthStep`) as the single source of truth.
Each step name indicates the domain/service we're in:
- `SUPABASE_*` = Supabase auth service
- `API_*` = Our backend API (/auth/enhance-token)
- `AUTH_*` = Auth system overall state

| Step | Description |
|------|-------------|
| `0_UNINITIALIZED` | Before initialize() called |
| `1_SUPABASE_CHECKING_SESSION` | Supabase: getSession() |
| `2_API_ENHANCING_TOKEN` | Our API: /auth/enhance-token |
| `3_AUTH_COMPLETED_AND_IDLE` | Auth complete, idle (authenticated or not) |
| `4_SUPABASE_SIGNING_IN` | Supabase: login or register in progress |
| `5_SUPABASE_LOGGING_OUT` | Supabase: logout in progress |

### useAuth Computed Properties (derived from authStep)

| Variable | Type | Description |
|----------|------|-------------|
| `authStep` | `Computed<AuthStep>` | Current auth step (single source of truth) |
| `currentUser` | `Ref<User \| null>` | Enhanced user from token manager |
| `isAuthenticated` | `Computed<boolean>` | `!!currentUser.value` |
| `isInitialized` | `Computed<boolean>` | `authStep === '3_AUTH_COMPLETED_AND_IDLE'` |
| `isAuthLoading` | `Computed<boolean>` | Steps 1, 2, or 4 |
| `isLoggingOut` | `Computed<boolean>` | `authStep === '5_SUPABASE_LOGGING_OUT'` |

### useCurrentContextStore (shared/currentContext/store/index.ts)

| Variable | Type | Description |
|----------|------|-------------|
| `user` | `Ref<CurrentUser \| null>` | Simplified user object |
| `organization` | `Ref<CurrentOrganization \| null>` | Current org with slug |
| `isLoading` | `Ref<boolean>` | Org query loading |
| `isReady` | `Ref<boolean>` | Context fully initialized |
| `currentOrganizationSlug` | `Computed<string \| null>` | `organization.value?.slug` |

### Module-Level Promises

| Promise | File | Purpose |
|---------|------|---------|
| `authReadyPromise` | `useAuth.ts:21-23` | Resolves when auth initialized |
| `contextReadyPromise` | `store/index.ts:10-13` | Resolves when context ready |

---

## Flow Diagrams

### A. App Initialization Flow (Cold Start)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APP.VUE SETUP                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: App.vue calls initialize()                                          │
│ File: App.vue:15                                                             │
│ authStep: 0_UNINITIALIZED → 1_SUPABASE_CHECKING_SESSION                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: useAuth.initialize() starts                                         │
│ File: useAuth.ts:149                                                         │
│ authStep: 1_SUPABASE_CHECKING_SESSION                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: Supabase getSession() called                                        │
│ File: useAuth.ts:160                                                         │
│ Checks localStorage for stored Supabase session                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
         ┌──────────────────┐           ┌──────────────────────────┐
         │ NO SESSION       │           │ SESSION EXISTS           │
         │ (Guest User)     │           │ (Returning User)         │
         └────────┬─────────┘           └────────────┬─────────────┘
                  │                                  │
                  ▼                                  ▼
┌─────────────────────────────┐    ┌────────────────────────────────────────┐
│ Step 4a: Mark initialized   │    │ Step 4b: Call processSession()        │
│ - isLoading = false         │    │ File: useAuth.ts:169                   │
│ - isInitialized = true      │    │ - supabaseUser = session.user         │
│ - Resolve authReadyPromise  │    │ - Call handleAuthCallback()           │
└──────────────┬──────────────┘    └────────────────┬───────────────────────┘
               │                                    │
               │                                    ▼
               │                   ┌────────────────────────────────────────┐
               │                   │ Step 5: Token Enhancement              │
               │                   │ File: useTokenManager.ts:150           │
               │                   │ POST /auth/enhance-token               │
               │                   │ - Sends supabaseToken                  │
               │                   │ - Receives: enhanced JWT + user info   │
               │                   └────────────────┬───────────────────────┘
               │                                    │
               │                                    ▼
               │                   ┌────────────────────────────────────────┐
               │                   │ Step 6: Store Enhanced Token           │
               │                   │ File: useTokenManager.ts:64-73         │
               │                   │ - enhancedTokenState.token = JWT       │
               │                   │ - enhancedTokenState.expiresAt = exp   │
               │                   │ - currentUser = user data              │
               │                   └────────────────┬───────────────────────┘
               │                                    │
               │                                    ▼
               │                   ┌────────────────────────────────────────┐
               │                   │ Step 7: Mark Initialized               │
               │                   │ File: useAuth.ts:181                   │
               │                   │ - isLoading = false                    │
               │                   │ - isInitialized = true                 │
               │                   │ - Resolve authReadyPromise             │
               │                   └────────────────┬───────────────────────┘
               │                                    │
               └────────────────────┬───────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 8: useCurrentContext watchers fire                                     │
│ File: useCurrentContext.ts:34-50                                            │
│ Watch: currentUser → setCurrentUser() in context store                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
         ┌──────────────────┐           ┌──────────────────────────┐
         │ NO USER          │           │ USER EXISTS              │
         │ (Guest)          │           │ (Authenticated)          │
         └────────┬─────────┘           └────────────┬─────────────┘
                  │                                  │
                  ▼                                  ▼
┌─────────────────────────────┐    ┌────────────────────────────────────────┐
│ Step 9a: Mark Ready         │    │ Step 9b: GraphQL Query Triggers        │
│ - isReady = true            │    │ File: useCurrentContext.ts:30-31       │
│ - Resolve contextReady      │    │ useGetUserDefaultOrganization()        │
│ - showApp = true            │    │ Query: GetUserDefaultOrganization      │
└─────────────────────────────┘    │ Variables: { userId: currentUser.id }  │
                                   └────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                                   ┌────────────────────────────────────────┐
                                   │ Step 10: Org Data Returns              │
                                   │ File: useCurrentContext.ts:54-75       │
                                   │ Watch: defaultOrg → setCurrentOrg()    │
                                   │ - organization.slug set in store       │
                                   │ - currentOrganizationSlug available    │
                                   └────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                                   ┌────────────────────────────────────────┐
                                   │ Step 11: Mark Context Ready            │
                                   │ File: useCurrentContext.ts:103-120     │
                                   │ Conditions: authInit && storeSlug      │
                                   │ - isReady = true                       │
                                   │ - Resolve contextReadyPromise          │
                                   └────────────────┬───────────────────────┘
                                                    │
                                                    ▼
                                   ┌────────────────────────────────────────┐
                                   │ Step 12: App Shows Content             │
                                   │ File: App.vue:40-48                    │
                                   │ showApp = isInit && !authLoading &&    │
                                   │           (!authenticated || ready)    │
                                   └────────────────────────────────────────┘
```

---

### B. Email/Password Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE (/auth/login)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: User submits login form                                             │
│ Calls: useAuth().login(credentials)                                         │
│ File: useAuth.ts:228                                                         │
│ Sets: isAuthenticating = true                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: Supabase signInWithPassword()                                       │
│ File: features/auth/api/index.ts:10-21                                      │
│ Sends: { email, password }                                                  │
│ Returns: { user, session }                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: Supabase fires onAuthStateChange('SIGNED_IN')                       │
│ File: useAuth.ts:185-206                                                    │
│ Async callback receives session with all needed data                        │
│ Sets: isAuthorizing = true                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 4: processSession() called directly                                    │
│ File: useAuth.ts:197-205                                                    │
│ Passes data from callback params (no Supabase calls inside)                 │
│ Calls: processSession({ user, access_token })                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 5: Token Enhancement                                                   │
│ File: useTokenManager.ts:150-194                                            │
│ POST /auth/enhance-token                                                    │
│ Stores: enhanced JWT, user info, organization info                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 6: States Update                                                       │
│ - isAuthorizing = false                                                     │
│ - isAuthenticating = false                                                  │
│ - isAuthenticated = true (currentUser is set)                               │
│ - isAuthLoading = false                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 7: Context Watchers Fire                                               │
│ File: useCurrentContext.ts:34-50                                            │
│ Watch currentUser → setCurrentUser()                                        │
│ Triggers org query                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 8: Organization Query Completes                                        │
│ Watch defaultOrg → setCurrentOrganization()                                 │
│ currentOrganizationSlug now available                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 9: Context Ready                                                       │
│ markAsReady() called                                                        │
│ contextReadyPromise resolves                                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 10: Router Guard Allows Navigation                                     │
│ File: router/guards/index.ts:162-177                                        │
│ guestOnly route + authenticated user                                        │
│ Redirects to: /{orgSlug}/dashboard                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### C. Google OAuth Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE (/auth/login)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: User clicks "Sign in with Google"                                   │
│ Calls: useAuth().loginWithGoogle()                                          │
│ File: useAuth.ts:264-276                                                    │
│ Sets: isAuthenticating = true                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: Supabase signInWithOAuth()                                          │
│ File: features/auth/api/index.ts:58-70                                      │
│ redirectTo: `${window.location.origin}/auth/callback`                       │
│ Browser redirects to Google                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   GOOGLE AUTH PAGE   │
                         │   User authenticates │
                         └──────────┬───────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: Google redirects to /auth/callback                                  │
│ URL contains: ?code=xxx&state=xxx                                           │
│ Supabase client automatically exchanges code for session                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 4: App.vue re-initializes (new page load)                              │
│ Calls: initialize()                                                         │
│ getSession() finds the new session                                          │
│ Follows initialization flow from Step 4b onwards                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 5: callback.vue renders                                                │
│ File: pages/auth/callback.vue                                               │
│ Shows: "Completing sign in" / "Welcome back!"                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 6: callback.vue watcher fires                                          │
│ File: pages/auth/callback.vue:42-63                                         │
│ Watch: [isAuthenticated, isAuthLoading, currentOrganizationSlug]            │
│ When all ready: router.push(`/${slug}/dashboard`)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Loader States Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        App.vue Loader Logic                                 │
│                        File: App.vue:25-49                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: AuthLoader                                                         │
│ Condition: !isInitialized || isAuthLoading                                  │
│ Shows: "Verifying your identity" → "Setting up workspace" → "Personalizing" │
│ File: features/auth/components/AuthLoader.vue                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (isInitialized && !isAuthLoading)
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: ContextLoader (authenticated users only)                           │
│ Condition: isInitialized && !isAuthLoading && isAuthenticated && !isReady   │
│ Shows: "Loading workspace" → "Preparing forms" → "Building dashboard"       │
│ File: shared/currentContext/components/ContextLoader.vue                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (isContextReady || !isAuthenticated)
┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: App Content                                                        │
│ Condition: isInitialized && !isAuthLoading && (!authenticated || ready)     │
│ Shows: <RouterView /> with actual app content                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Watchers Reference

### useCurrentContext.ts Watchers

| Watcher | Triggers | Action | Line |
|---------|----------|--------|------|
| `watch(currentUser)` | `currentUser` changes | `setCurrentUser()` or `reset()` | 34-50 |
| `watch(defaultOrg)` | Org query returns | `setCurrentOrganization()` | 54-75 |
| `watch(userRole)` | Org query returns | `setCurrentRole()` | 78-85 |
| `watch(isOrgLoading)` | Query loading changes | `setLoading()` | 88-96 |
| `watch([isInit, isOrgLoading, isAuth, storeOrg])` | Multiple deps | `markAsReady()` | 103-120 |

### useAuth.ts Listeners

| Listener | Event | Action | Line |
|----------|-------|--------|------|
| `onAuthStateChange` | `SIGNED_IN` | `processSession()` (deferred) | 195-206 |
| `onAuthStateChange` | `SIGNED_OUT` | `handleSignedOut()` | 207-208 |
| `onAuthStateChange` | `TOKEN_REFRESHED` | `processSession()` (deferred) | 209-221 |

### Page-Level Watchers

| File | Watcher | Purpose |
|------|---------|---------|
| `callback.vue:42-63` | `[isAuth, isAuthLoading, slug]` | Redirect after OAuth |
| `index.vue:19-21` | `isRedirecting` | Debug logging |
| `useAuthRedirect.ts:31-56` | `[isInit, isAuth, slug]` | Redirect from landing |

---

## Promise Resolution Timeline

```
Time ─────────────────────────────────────────────────────────────────────────►

┌───────────────────────────────────────────────────────────────────────────┐
│ getSession() starts                                                       │
└───────────┬───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ Token enhancement (if session exists)                                     │
└───────────┬───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ authReadyPromise RESOLVES                                                 │
│ File: useAuth.ts:133-136                                                  │
│ Router guards waiting on getAuthReadyPromise() unblock                    │
└───────────┬───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ GraphQL org query executes (if authenticated)                             │
│ File: useCurrentContext.ts:30-31                                          │
└───────────┬───────────────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│ contextReadyPromise RESOLVES                                              │
│ File: store/index.ts:96-99                                                │
│ Router guards waiting on getContextReadyPromise() unblock                 │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Router Guard Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         beforeEach Guard                                    │
│                         File: router/guards/index.ts:64-193                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: Check route meta flags                                              │
│ If (requiresAuth || guestOnly): await promises                              │
│   - await getAuthReadyPromise() (5s timeout)                               │
│   - await getContextReadyPromise()                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: Check current state                                                 │
│ hasUser = !!currentUser.value                                              │
│ orgSlug = contextStore.currentOrganizationSlug                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: Apply routing rules                                                 │
│ - Root (/) + hasUser → /{slug}/dashboard                                   │
│ - Post-login redirect handling                                             │
│ - Reserved slug redirect                                                   │
│ - requiresAuth + !hasUser → /auth/login (save URL)                         │
│ - guestOnly + hasUser → /{slug}/dashboard or saved URL                     │
│ - Org mismatch → correct org path                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Token Enhancement Details

### Request
```http
POST /auth/enhance-token
Content-Type: application/json

{
  "supabaseToken": "<supabase_jwt>"
}
```

### Response
```json
{
  "access_token": "<enhanced_jwt_with_hasura_claims>",
  "expires_at": 1234567890,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "organization": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp"
  }
}
```

### Enhanced JWT Claims (for Hasura)
```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["user", "admin"],
    "x-hasura-default-role": "user",
    "x-hasura-user-id": "uuid",
    "x-hasura-org-id": "uuid"
  }
}
```

---

## Debug Console Logs

During login, you'll see these console logs (in order):

```
[App.vue] SETUP START
[App.vue] Calling initialize()...
[Auth:initialize] START - isInitialized: false
[Auth:initialize] Set isLoading=true
[Auth:initialize] Calling getSession()...
[Auth:initialize] Found session for: user@example.com
[Auth:initialize] Calling processSession()...
[TokenManager] Enhancing token...
[Auth:initialize] processSession() completed, currentUser: user@example.com
[Auth:initialize] Calling markInitialized()...
[Auth:initialize] END - isInitialized: true isAuthenticated: true
[useCurrentContext] INIT
[useCurrentContext:watch:currentUser] User changed: user@example.com
[ContextStore:setCurrentUser] user@example.com
[useCurrentContext:watch:isOrgLoading] Loading changed: true
[ContextStore:setLoading] true
[App.vue:watch] State changed - showAuthLoader: true ...
[useCurrentContext:watch:defaultOrg] Org changed: acme-corp
[ContextStore:setCurrentOrganization] slug: acme-corp
[useCurrentContext:watch:ready] Check ready - authInit: true orgLoading: false ...
[useCurrentContext:watch:ready] Conditions met, calling markAsReady()
[ContextStore:markAsReady] Setting isReady=true
[ContextStore:markAsReady] Resolving contextReadyPromise
[App.vue:watch] State changed - showAuthLoader: false showContextLoader: false showApp: true
```

---

## Common Issues & Debug Points

### Issue: Infinite redirect loop
**Check:** Router guard at line 114-126 (post-login redirect logic)

### Issue: App stuck on AuthLoader
**Check:**
- `useAuth.ts:160` - Is getSession() returning?
- `useTokenManager.ts:49` - Is /auth/enhance-token responding?

### Issue: App stuck on ContextLoader
**Check:**
- `useCurrentContext.ts:30` - Is GraphQL query running?
- `useCurrentContext.ts:103-120` - Are ready conditions met?

### Issue: User sees landing page briefly after login
**Check:**
- `useAuthRedirect.ts` - Is redirectInitiated being set?
- `router/guards/index.ts:100-108` - Root path redirect logic
