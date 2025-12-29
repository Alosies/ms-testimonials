# Roles Schema Reference

**Last Updated**: `2025-12-29-1630` (GMT+5:30)

## Table Structure

```sql
CREATE TABLE public.roles (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    unique_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    can_manage_forms BOOLEAN NOT NULL DEFAULT false,
    can_manage_testimonials BOOLEAN NOT NULL DEFAULT false,
    can_manage_widgets BOOLEAN NOT NULL DEFAULT false,
    can_manage_members BOOLEAN NOT NULL DEFAULT false,
    can_manage_billing BOOLEAN NOT NULL DEFAULT false,
    can_delete_org BOOLEAN NOT NULL DEFAULT false,
    is_viewer BOOLEAN NOT NULL DEFAULT false,
    is_system_role BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT roles_unique_name_unique UNIQUE (unique_name)
);
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | NanoID 12-char format |
| `unique_name` | VARCHAR(50) | NOT NULL, UNIQUE | Slug for code comparisons |
| `name` | VARCHAR(100) | NOT NULL | Display-ready label for UI |
| `description` | TEXT | NULL | Human-readable description |
| `can_manage_forms` | BOOLEAN | NOT NULL, DEFAULT false | Create, edit, delete forms |
| `can_manage_testimonials` | BOOLEAN | NOT NULL, DEFAULT false | Approve, reject, edit testimonials |
| `can_manage_widgets` | BOOLEAN | NOT NULL, DEFAULT false | Create, edit, delete widgets |
| `can_manage_members` | BOOLEAN | NOT NULL, DEFAULT false | Invite, remove, change roles |
| `can_manage_billing` | BOOLEAN | NOT NULL, DEFAULT false | View and manage billing |
| `can_delete_org` | BOOLEAN | NOT NULL, DEFAULT false | Delete the organization |
| `is_viewer` | BOOLEAN | NOT NULL, DEFAULT false | Read-only access flag |
| `is_system_role` | BOOLEAN | NOT NULL, DEFAULT false | Cannot be deleted by users |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Auto-updated via trigger |

## Constraints

### Unique Constraints
- `roles_unique_name_unique` - Ensures unique_name is unique across all roles

## Seed Data

```sql
INSERT INTO roles (unique_name, name, description, can_manage_forms, can_manage_testimonials, can_manage_widgets, can_manage_members, can_manage_billing, can_delete_org, is_viewer, is_system_role) VALUES
    ('owner', 'Owner', 'Full access including billing and organization deletion', true, true, true, true, true, true, false, true),
    ('admin', 'Admin', 'Full access to forms, testimonials, widgets, and members. No billing access.', true, true, true, true, false, false, false, true),
    ('member', 'Member', 'Can manage forms, testimonials, and widgets. No member or billing access.', true, true, true, false, false, false, false, true),
    ('viewer', 'Viewer', 'Read-only access to forms, testimonials, and widgets. Cannot modify anything.', false, false, false, false, false, false, true, true);
```

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `roles_pkey` | `id` | PRIMARY KEY | Primary key index |
| `roles_unique_name_unique` | `unique_name` | UNIQUE | Unique name lookup |

## Triggers

- `roles_updated_at_trigger` - Auto-updates `updated_at` on record modification

## Permission Matrix

| Role | Forms | Testimonials | Widgets | Members | Billing | Delete Org | Viewer |
|------|-------|--------------|---------|---------|---------|------------|--------|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| member | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| viewer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
