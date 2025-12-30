# Organization Roles Schema Reference

**Last Updated**: `2025-12-30-1200` (GMT+5:30)

## Table Structure

```sql
CREATE TABLE public.organization_roles (
    id                  TEXT NOT NULL DEFAULT generate_nanoid_12(),
    user_id             TEXT NOT NULL,
    organization_id     TEXT NOT NULL,
    role_id             TEXT NOT NULL,
    is_default_org      BOOLEAN NOT NULL DEFAULT false,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    invited_by          TEXT,
    invited_at          TIMESTAMPTZ,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT org_roles_user_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_org_fk FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_role_fk FOREIGN KEY (role_id) REFERENCES public.roles(id),
    CONSTRAINT org_roles_invited_by_fk FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT org_roles_unique UNIQUE (user_id, organization_id)
);
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | Primary key (NanoID 12-char) |
| `user_id` | TEXT | NOT NULL, FK | User who has this role |
| `organization_id` | TEXT | NOT NULL, FK | Organization where user has this role |
| `role_id` | TEXT | NOT NULL, FK | Role assigned to user - app must lookup by role.unique_name |
| `is_default_org` | BOOLEAN | NOT NULL, DEFAULT false | Whether this is the user's default organization (only one per user) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag - false means membership is revoked |
| `invited_by` | TEXT | NULL, FK | User who invited this member to the organization |
| `invited_at` | TIMESTAMPTZ | NULL | When the invitation was sent |
| `joined_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the user joined the organization |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when record was last updated |

## Constraints

### Foreign Key Constraints
- `org_roles_user_fk` - FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE CASCADE
- `org_roles_org_fk` - FOREIGN KEY (`organization_id`) REFERENCES `organizations(id)` ON DELETE CASCADE
- `org_roles_role_fk` - FOREIGN KEY (`role_id`) REFERENCES `roles(id)`
- `org_roles_invited_by_fk` - FOREIGN KEY (`invited_by`) REFERENCES `users(id)` ON DELETE SET NULL

### Unique Constraints
- `org_roles_unique` - UNIQUE (`user_id`, `organization_id`) - One role per user per org

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `organization_roles_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_org_roles_user` | `user_id` | B-tree | User lookup |
| `idx_org_roles_org` | `organization_id` | B-tree | Organization lookup |
| `idx_org_roles_role` | `role_id` | B-tree | Role filter |
| `idx_org_roles_active` | `user_id`, `organization_id` | Partial (WHERE is_active = true) | Active memberships |
| `idx_org_roles_one_default` | `user_id` | UNIQUE Partial (WHERE is_default_org = true) | One default org per user |

## Triggers

- `organization_roles_updated_at_trigger` - Auto-updates `updated_at` on record modification
