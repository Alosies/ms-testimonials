# ADR-002: Organization Setup Status Tracking

## Doc Connections
**ID**: `adr-002-org-setup-status`

2025-12-30-1730 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `adr-001-default-org` - Default organization creation decision
- `table-organizations` - Organizations table documentation

---

## Status

**Accepted** - 2025-12-30

## Context

When a default organization is auto-created during login (see ADR-001), it has placeholder values:
- **Name**: `"{email_prefix}'s Workspace"` or `"{display_name}'s Workspace"`
- **Slug**: Auto-generated with random suffix (e.g., `demo-user-rlm68i`)
- **Logo**: None

These placeholder values are functional but not ideal. Users should be encouraged to configure their organization with meaningful values.

## Decision

### 1. Track Setup Status

Add a `setup_status` column to the `organizations` table using an enum type:

| Value | Description |
|-------|-------------|
| `pending_setup` | Auto-created organization, needs user configuration |
| `completed` | User has configured the organization |

**Why Enum Over Boolean?**
- Extensibility for future states (e.g., `in_progress`)
- Clearer semantics
- Consistent with other status patterns in schema

### 2. Non-Blocking UX Philosophy

**Core Principle**: Let users experience the app first. Setup is a gentle nudge, not a gate.

- **No redirects** to setup wizard on login
- **No modals** blocking the dashboard
- **Todo notification** visible in sidebar/navigation
- **User decides** when to complete setup

This approach prioritizes time-to-value over data completeness. Users should feel the "magic" of the product before doing administrative tasks.

## Consequences

### Positive

1. **Zero Friction Onboarding**: Users experience the app immediately
2. **User Agency**: Setup happens when user is ready, not forced
3. **Clear State Tracking**: System knows which orgs need attention
4. **Extensible**: Enum allows future states without schema changes

### Negative

1. **Potential Delay**: Users might never complete setup (acceptable trade-off)
2. **Placeholder Data**: Public-facing forms may show auto-generated names

### Neutral

1. **System Functions Either Way**: Placeholder values are valid, just not ideal
2. **Backward Compatible**: Existing orgs default to `completed`

## Alternatives Considered

### Alternative 1: Mandatory Setup Wizard
- **Rejected**: Creates friction, delays time-to-value

### Alternative 2: No Tracking (Just Let It Be)
- **Rejected**: No way to prompt users or measure completion rates

### Alternative 3: Boolean `is_setup_complete`
- **Rejected**: Less extensible than enum, less semantic clarity
