# Auth API Implementation Plan

## Doc Connections
**ID**: `guide-auth-implementation`

2025-12-30-1700 IST

**Parent ReadMes**:
- `docs-index` - Documentation root index

**Related ReadMes**:
- `adr-001-default-org` - Default organization creation decision
- `db-layer-1-auth` - Layer 1 Authentication design
- `db-layer-2-multitenancy` - Layer 2 Multi-tenancy design

---

**Version**: 1.0
**Date**: December 30, 2025
**Reference**: Coursepads API pattern

---

## Overview

Implement token enhancement API following the Coursepads pattern, adapted for ms-testimonials' simpler permission model (organization-level roles only, no course-level roles).

### Key Differences from Coursepads

| Aspect | Coursepads | ms-testimonials |
|--------|------------|-----------------|
| Role Levels | Organization + Course roles | Organization roles only |
| Role Table | `user_organization_roles` | `organization_roles` |
| Complexity | Two-tier permission lookup | Single-tier permission lookup |
| Claims | org_id + course-specific | org_id only |

---

## Database Schema (Auth-Related)

### Tables Involved

```
users
├── id (NanoID 12-char)
├── email (unique)
├── email_verified
├── display_name
├── avatar_url
├── locale
├── timezone
├── is_active
├── last_login_at
└── created_at, updated_at

user_identities
├── id (NanoID 16-char)
├── user_id → users.id
├── provider (supabase, google, github, etc.)
├── provider_user_id (Supabase UUID)
├── provider_email
├── provider_metadata (JSONB)
├── is_primary
├── verified_at
└── created_at, updated_at

organizations
├── id (NanoID 12-char)
├── created_by → users.id
├── name
├── slug (unique)
├── is_active
├── settings (JSONB)
└── created_at, updated_at

organization_roles
├── id (NanoID 12-char)
├── organization_id → organizations.id
├── user_id → users.id
├── role_id → roles.id
├── is_default_org (one per user)
├── is_active
├── invited_by, invited_at, joined_at
└── created_at, updated_at

roles
├── id (NanoID 12-char)
├── name (Owner, Admin, Member, Viewer)
├── unique_name (owner, org_admin, member, viewer)
├── can_manage_forms, can_manage_testimonials, can_manage_widgets
├── can_manage_members, can_manage_billing, can_delete_org
├── is_viewer, is_system_role
└── created_at, updated_at
```

---

## Token Enhancement Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT: POST /auth/enhance-token                                   │
│  Body: { supabaseToken: "...", organizationId?: "..." }             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Decode Supabase Token                                      │
│  ─────────────────────────────                                      │
│  • Extract: sub (Supabase user ID), email, user_metadata            │
│  • No verification needed (Supabase already verified)               │
│  • Get: display_name, avatar_url from metadata                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: Find or Create User Identity                               │
│  ─────────────────────────────────────                              │
│  A. Find identity by provider + provider_user_id                    │
│     → If found: Get user from identity.user_id                      │
│                                                                     │
│  B. If not found, check by email (account linking)                  │
│     → If email identity exists: Update provider_user_id             │
│     → If user exists by email: Create new identity link             │
│     → If neither: Create new user + identity                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Handle New User Onboarding                                 │
│  ─────────────────────────────────────                              │
│  If new user:                                                       │
│  • Create default organization (user's personal workspace)          │
│  • Assign "owner" role to user in that organization                 │
│  • Mark organization as is_default_org = true                       │
│  • Assign free plan to organization                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Fetch User Roles                                           │
│  ─────────────────────────────                                      │
│  Query: organization_roles WHERE user_id = X AND is_active = true   │
│  Join: organizations (for slug), roles (for unique_name)            │
│                                                                     │
│  Result:                                                            │
│  • List of { org_id, org_slug, role_unique_name, is_default_org }   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Determine Current Context                                  │
│  ─────────────────────────────────                                  │
│  If organizationId provided:                                        │
│    → Use that organization (validate user has access)               │
│  Else:                                                              │
│    → Use default organization (is_default_org = true)               │
│                                                                     │
│  Get: current org_id, org_slug, role for that org                   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Build Hasura Claims & Sign JWT                             │
│  ─────────────────────────────────────                              │
│  Claims:                                                            │
│    x-hasura-user-id: user.id                                        │
│    x-hasura-default-role: role.unique_name (e.g., "owner")          │
│    x-hasura-allowed-roles: [all roles user has across orgs]         │
│    x-hasura-organization-id: current org_id                         │
│    x-hasura-organization-slug: current org_slug                     │
│    x-hasura-user-email: user.email (for email-based permissions)    │
│                                                                     │
│  Sign with HS256, expire in 1 hour                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RESPONSE                                                           │
│  ────────                                                           │
│  {                                                                  │
│    access_token: "eyJ...",                                          │
│    expires_at: 1735600000,                                          │
│    user: { id, email, display_name, avatar_url },                   │
│    organization: { id, name, slug }                                 │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
api/src/
├── config/
│   ├── env.ts                    # Environment variables (exists, update)
│   └── cors.ts                   # CORS config (exists)
│
├── entities/
│   ├── user/
│   │   ├── models/
│   │   │   └── index.ts          # User types
│   │   ├── utils/
│   │   │   ├── findUserById.ts
│   │   │   ├── findUserByEmail.ts
│   │   │   ├── createUser.ts
│   │   │   └── updateUserLogin.ts
│   │   └── index.ts              # Barrel export
│   │
│   ├── userIdentity/
│   │   ├── models/
│   │   │   └── index.ts          # Identity types
│   │   ├── utils/
│   │   │   ├── findIdentity.ts
│   │   │   ├── findIdentityByEmail.ts
│   │   │   ├── createIdentity.ts
│   │   │   ├── updateIdentity.ts
│   │   │   └── isFirstIdentity.ts
│   │   └── index.ts
│   │
│   ├── organization/
│   │   ├── models/
│   │   │   └── index.ts          # Organization types
│   │   ├── utils/
│   │   │   ├── createDefaultOrganization.ts
│   │   │   └── findOrganizationById.ts
│   │   └── index.ts
│   │
│   └── organizationRole/
│       ├── models/
│       │   └── index.ts          # Role types
│       ├── utils/
│       │   ├── fetchUserRoles.ts
│       │   ├── findDefaultRole.ts
│       │   ├── buildRolesList.ts
│       │   └── assignRole.ts
│       └── index.ts
│
├── features/
│   └── auth/
│       ├── enhanceToken/
│       │   └── index.ts          # Main enhance token logic (rewrite)
│       └── switchOrganization/
│           └── index.ts          # Switch org context
│
├── routes/
│   └── auth.ts                   # Auth routes (update)
│
├── shared/
│   ├── libs/
│   │   ├── hasura/
│   │   │   ├── client.ts         # GraphQL client
│   │   │   └── index.ts
│   │   └── supabase/
│   │       ├── client.ts         # Supabase client
│   │       ├── utils/
│   │       │   └── decodeSupabaseToken.ts
│   │       └── index.ts
│   │
│   ├── utils/
│   │   ├── tokens/
│   │   │   ├── signAuthJWT.ts
│   │   │   ├── createHasuraClaims.ts
│   │   │   ├── decodeToken.ts
│   │   │   ├── models.ts         # Token types
│   │   │   └── index.ts
│   │   └── http.ts               # Response helpers
│   │
│   ├── constants/
│   │   └── index.ts              # Default role, etc.
│   │
│   └── middleware/
│       └── auth.ts               # Auth middleware (exists)
│
├── graphql/
│   ├── operations/
│   │   ├── users.graphql
│   │   ├── userIdentities.graphql
│   │   ├── organizations.graphql
│   │   └── organizationRoles.graphql
│   └── generated/
│       └── operations.ts         # Generated types
│
└── index.ts                      # App entry (exists)
```

---

## Files to Create/Update

### Phase 1: Shared Utilities

| File | Action | Description |
|------|--------|-------------|
| `shared/utils/http.ts` | Create | successResponse, errorResponse helpers |
| `shared/utils/tokens/models.ts` | Create | HasuraClaims, SupabaseTokenContent types |
| `shared/utils/tokens/decodeToken.ts` | Create | Generic JWT decode without verify |
| `shared/utils/tokens/createHasuraClaims.ts` | Create | Build Hasura claims object |
| `shared/utils/tokens/signAuthJWT.ts` | Create | Sign JWT with Hasura claims |
| `shared/utils/tokens/index.ts` | Create | Barrel export |
| `shared/constants/index.ts` | Create | defaultRole = 'member' |

### Phase 2: Hasura & Supabase Clients

| File | Action | Description |
|------|--------|-------------|
| `shared/libs/hasura/client.ts` | Create | GraphQL client with admin secret |
| `shared/libs/hasura/index.ts` | Create | executeGraphQL helper |
| `shared/libs/supabase/client.ts` | Create | Supabase client instance |
| `shared/libs/supabase/utils/decodeSupabaseToken.ts` | Create | Decode Supabase JWT |
| `shared/libs/supabase/models.ts` | Create | SupabaseTokenContent type |
| `shared/libs/supabase/index.ts` | Create | Barrel export |

### Phase 3: GraphQL Operations

| File | Action | Description |
|------|--------|-------------|
| `graphql/operations/users.graphql` | Create | FindUserById, FindUserByEmail, CreateUser, UpdateUserLogin |
| `graphql/operations/userIdentities.graphql` | Create | FindIdentity, CreateIdentity, UpdateIdentity |
| `graphql/operations/organizations.graphql` | Create | CreateOrganization, FindOrganization |
| `graphql/operations/organizationRoles.graphql` | Create | FetchUserRoles, AssignRole |

### Phase 4: Entity Utils

| File | Action | Description |
|------|--------|-------------|
| `entities/user/utils/*.ts` | Create | User CRUD operations |
| `entities/userIdentity/utils/*.ts` | Create | Identity CRUD operations |
| `entities/organization/utils/*.ts` | Create | Org creation |
| `entities/organizationRole/utils/*.ts` | Create | Role fetching, assignment |

### Phase 5: Auth Feature

| File | Action | Description |
|------|--------|-------------|
| `features/auth/enhanceToken/index.ts` | Rewrite | Complete token enhancement logic |
| `features/auth/switchOrganization/index.ts` | Create | Switch org context endpoint |
| `routes/auth.ts` | Update | Add switch-organization route |

---

## GraphQL Operations

### users.graphql

```graphql
query FindUserById($id: String!) {
  users_by_pk(id: $id) {
    id
    email
    email_verified
    display_name
    avatar_url
    locale
    timezone
    is_active
    last_login_at
  }
}

query FindUserByEmail($email: String!) {
  users(where: { email: { _eq: $email }, is_active: { _eq: true } }) {
    id
    email
    email_verified
    display_name
    avatar_url
  }
}

mutation CreateUser(
  $email: String!
  $email_verified: Boolean!
  $display_name: String
  $avatar_url: String
  $locale: String!
) {
  insert_users_one(
    object: {
      email: $email
      email_verified: $email_verified
      display_name: $display_name
      avatar_url: $avatar_url
      locale: $locale
    }
  ) {
    id
    email
    display_name
  }
}

mutation UpdateUserLogin($id: String!) {
  update_users_by_pk(
    pk_columns: { id: $id }
    _set: { last_login_at: "now()" }
  ) {
    id
    last_login_at
  }
}
```

### userIdentities.graphql

```graphql
query FindIdentity($provider: String!, $providerUserId: String!) {
  user_identities(
    where: {
      provider: { _eq: $provider }
      provider_user_id: { _eq: $providerUserId }
    }
  ) {
    id
    user_id
    provider
    provider_user_id
    provider_email
    is_primary
  }
}

query FindIdentityByEmail($provider: String!, $email: String!) {
  user_identities(
    where: {
      provider: { _eq: $provider }
      provider_email: { _eq: $email }
    }
  ) {
    id
    user_id
    provider
    provider_user_id
    provider_email
  }
}

mutation CreateIdentity(
  $user_id: String!
  $provider: String!
  $provider_user_id: String!
  $provider_email: String
  $provider_metadata: jsonb
  $is_primary: Boolean!
) {
  insert_user_identities_one(
    object: {
      user_id: $user_id
      provider: $provider
      provider_user_id: $provider_user_id
      provider_email: $provider_email
      provider_metadata: $provider_metadata
      is_primary: $is_primary
      verified_at: "now()"
    }
  ) {
    id
    user_id
  }
}

mutation UpdateIdentity($id: String!, $provider_user_id: String!, $provider_metadata: jsonb) {
  update_user_identities_by_pk(
    pk_columns: { id: $id }
    _set: {
      provider_user_id: $provider_user_id
      provider_metadata: $provider_metadata
    }
  ) {
    id
    user_id
  }
}

query CountUserIdentities($userId: String!) {
  user_identities_aggregate(where: { user_id: { _eq: $userId } }) {
    aggregate {
      count
    }
  }
}
```

### organizationRoles.graphql

```graphql
query FetchUserRoles($userId: String!) {
  organization_roles(
    where: {
      user_id: { _eq: $userId }
      is_active: { _eq: true }
    }
  ) {
    id
    organization_id
    role_id
    is_default_org
    organization {
      id
      name
      slug
      is_active
    }
    role {
      id
      name
      unique_name
      can_manage_forms
      can_manage_testimonials
      can_manage_widgets
      can_manage_members
      can_manage_billing
      can_delete_org
      is_viewer
    }
  }
}

mutation AssignRole(
  $organization_id: String!
  $user_id: String!
  $role_id: String!
  $is_default_org: Boolean!
) {
  insert_organization_roles_one(
    object: {
      organization_id: $organization_id
      user_id: $user_id
      role_id: $role_id
      is_default_org: $is_default_org
      joined_at: "now()"
    }
  ) {
    id
  }
}
```

### organizations.graphql

```graphql
mutation CreateOrganization(
  $name: String!
  $slug: String!
  $created_by: String!
) {
  insert_organizations_one(
    object: {
      name: $name
      slug: $slug
      created_by: $created_by
    }
  ) {
    id
    name
    slug
  }
}

query FindRoleByUniqueName($uniqueName: String!) {
  roles(where: { unique_name: { _eq: $uniqueName } }) {
    id
    name
    unique_name
  }
}

query FindFreePlan {
  plans(where: { id: { _eq: "plan_free" } }) {
    id
    name
  }
}

mutation CreateOrganizationPlan(
  $organization_id: String!
  $plan_id: String!
) {
  insert_organization_plans_one(
    object: {
      organization_id: $organization_id
      plan_id: $plan_id
      is_active: true
    }
  ) {
    id
  }
}
```

---

## Hasura JWT Claims Structure

```typescript
interface HasuraClaims {
  'x-hasura-allowed-roles': string[];      // All roles user can assume
  'x-hasura-default-role': string;         // Current active role
  'x-hasura-user-id': string;              // User's internal ID
  'x-hasura-organization-id'?: string;     // Current org context
  'x-hasura-organization-slug'?: string;   // For URL routing
  'x-hasura-user-email'?: string;          // For email-based permissions
}
```

### Example Token Payload

```json
{
  "iss": "testimonials",
  "sub": "usr_abc123xyz",
  "aud": "authenticated",
  "iat": 1735500000,
  "exp": 1735503600,
  "email": "user@example.com",
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["owner", "org_admin", "member", "viewer"],
    "x-hasura-default-role": "owner",
    "x-hasura-user-id": "usr_abc123xyz",
    "x-hasura-organization-id": "org_def456uvw",
    "x-hasura-organization-slug": "acme-corp",
    "x-hasura-user-email": "user@example.com"
  }
}
```

---

## API Endpoints

### POST /auth/enhance-token

**Request:**
```json
{
  "supabaseToken": "eyJ...",
  "organizationId": "org_abc123"  // Optional
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "expires_at": 1735503600,
  "user": {
    "id": "usr_abc123xyz",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": "https://..."
  },
  "organization": {
    "id": "org_def456uvw",
    "name": "Acme Corp",
    "slug": "acme-corp"
  }
}
```

**Error Responses:**
- 400: Missing supabaseToken
- 401: Invalid/expired Supabase token
- 403: User not authorized for requested organization
- 500: Internal server error

### POST /auth/switch-organization

**Request:**
```json
{
  "organizationId": "org_xyz789"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "expires_at": 1735503600,
  "organization": {
    "id": "org_xyz789",
    "name": "New Org",
    "slug": "new-org"
  }
}
```

---

## Implementation Order

### Step 1: Shared Utilities (Foundation)
1. `shared/utils/http.ts`
2. `shared/constants/index.ts`
3. `shared/utils/tokens/models.ts`
4. `shared/utils/tokens/decodeToken.ts`
5. `shared/utils/tokens/createHasuraClaims.ts`
6. `shared/utils/tokens/signAuthJWT.ts`
7. `shared/utils/tokens/index.ts`

### Step 2: External Clients
1. `shared/libs/hasura/client.ts`
2. `shared/libs/hasura/index.ts`
3. `shared/libs/supabase/client.ts`
4. `shared/libs/supabase/models.ts`
5. `shared/libs/supabase/utils/decodeSupabaseToken.ts`
6. `shared/libs/supabase/index.ts`

### Step 3: GraphQL Operations
1. Create `.graphql` files in `graphql/operations/`
2. Run `pnpm codegen` to generate types
3. Verify generated operations

### Step 4: Entity Utils
1. User entity (find, create, update)
2. UserIdentity entity (find, create, update)
3. Organization entity (create default)
4. OrganizationRole entity (fetch, assign, build roles list)

### Step 5: Auth Features
1. Rewrite `features/auth/enhanceToken/index.ts`
2. Create `features/auth/switchOrganization/index.ts`
3. Update `routes/auth.ts`

### Step 6: Testing
1. Test new user signup flow
2. Test existing user login
3. Test organization switching
4. Test edge cases (email change, identity linking)

---

## Environment Variables

```env
# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Hasura
HASURA_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=your-hasura-admin-secret

# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## New User Onboarding Flow

When a user signs up for the first time:

1. **Create User Record**
   - Generate NanoID for user.id
   - Store email, display_name, avatar_url from Supabase

2. **Create Identity Link**
   - Link Supabase provider_user_id to user
   - Mark as primary identity

3. **Create Default Organization**
   - Name: "{display_name}'s Workspace" or "{email}'s Workspace"
   - Slug: Auto-generate from email prefix (e.g., "john-doe-abc123")
   - Created by: user.id

4. **Assign Owner Role**
   - Create organization_role with role_id = "owner"
   - Set is_default_org = true

5. **Assign Free Plan**
   - Create organization_plan linking org to "plan_free"

---

## Security Considerations

1. **Token Expiration**: 1 hour (short-lived, refresh via enhance-token)
2. **Role Validation**: Always verify user has role in requested org
3. **Admin Secret**: Never expose HASURA_ADMIN_SECRET to client
4. **Supabase Verification**: Decode token (not verify) since Supabase already verified
5. **Soft Deletes**: Check is_active flags on user, org, role queries
