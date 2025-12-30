# ADR-001: Default Organization Creation on Login

## Doc Connections
**ID**: `adr-001-default-org`

2025-12-30-1700 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `guide-auth-implementation` - Auth implementation plan
- `table-organizations` - Organizations table documentation
- `table-organization-roles` - Organization roles table documentation
- `db-layer-2-multitenancy` - Multi-tenancy layer design

---

## Status

**Accepted** - 2025-12-30

## Context

Testimonials is a multi-tenant SaaS application where all business data (forms, testimonials, widgets) is scoped to organizations. The Hasura JWT claims require `x-hasura-organization-id` for row-level security to function correctly.

### The Problem

During the `POST /auth/enhance-token` flow, we need to decide when to create a default organization for users. The initial implementation only created organizations for newly registered users (`isNewUser = true`).

This approach had gaps:

| Scenario | Initial Behavior | Problem |
|----------|------------------|---------|
| New user (self-signup) | Org created | None |
| Existing user found by email | No org created | User may have no org |
| User's only org was deleted | No org created | User stuck without access |
| Invited user whose org was deactivated | No org created | User stuck without access |
| User created manually in DB | No org created | No org assigned |

### Operational Issues Without an Organization

1. **Hasura JWT Claims Incomplete**: Token cannot include `x-hasura-organization-id`, breaking row-level security
2. **GraphQL Queries Fail**: All org-scoped queries return empty results or 403 errors
3. **UI/Dashboard Breaks**: Frontend expects organization context for navigation and data display
4. **No Permissions**: `fetchUserRoles` returns empty, user has no allowed roles in JWT

## Decision

**Create a default organization for any user who has no organization roles at login time, not just for newly created users.**

### Implementation

```typescript
// In POST /auth/enhance-token handler

// Fetch user roles and ensure user has at least one organization
let roles = await fetchUserRoles(user.id);

if (!roles || roles.length === 0) {
  // User has no organization - create default one
  // This handles: new users, invited users whose org was deleted, edge cases
  console.log('Creating default organization for user without roles');
  await createDefaultOrganization(user.id, user.display_name, user.email);
  // Re-fetch roles after org creation
  roles = await fetchUserRoles(user.id);
}
```

### What `createDefaultOrganization` Does

1. Creates organization with name `"{display_name}'s Workspace"` or `"{email_prefix}'s Workspace"`
2. Generates unique slug from name with random suffix
3. Assigns the free plan with default limits
4. Assigns the `owner` role to the user with `is_default_org = true`

### Location

- **File**: `api/src/features/auth/enhanceToken/index.ts`
- **Function**: `enhanceToken`

## Consequences

### Positive

1. **Guaranteed Organization Context**: Every user always has at least one organization
2. **Self-Healing**: Users whose organizations were deleted automatically get a new workspace
3. **Simpler Onboarding**: No special handling needed for different user creation paths
4. **Robust JWT Claims**: Token always has complete Hasura claims

### Negative

1. **Potential Orphan Organizations**: If user was invited to org A, logs in (creating personal org B), then joins org A - they now have an unused org B
2. **Naming Collisions**: Auto-generated workspace names may not be ideal for all users
3. **Storage Cost**: Each organization consumes database rows (organization, organization_plan, organization_role)

### Neutral

1. **Invitation Flow Unaffected**: Users invited to an existing organization will already have roles, so no default org is created
2. **Multiple Orgs Supported**: Users can belong to multiple organizations; the default is just a fallback

## Alternatives Considered

### Alternative 1: Only Create Org for New Users
- **Rejected**: Leaves edge cases unhandled (deleted orgs, manual user creation)

### Alternative 2: Require Org During User Creation
- **Rejected**: Complicates user creation flow, especially for invitations

### Alternative 3: Allow Orgless State with UI Prompt
- **Rejected**: Adds complexity to frontend, requires handling partial states throughout the app

## References

- Multi-tenancy design: `docs/db/research/layer-2-multitenancy.md`
- Auth implementation: `docs/guides/auth-implementation-plan.md`
- Organization table: `docs/db/tables/organizations/docs.md`
