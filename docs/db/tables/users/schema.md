# Users Schema Reference

**Last Updated**: `2025-12-29-1630` (GMT+5:30)

## Table Structure

```sql
CREATE TABLE public.users (
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),
    email TEXT NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    display_name TEXT,
    avatar_url TEXT,
    locale TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_locale_check CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$')
);
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | NanoID 12-char format |
| `email` | TEXT | NOT NULL, UNIQUE | Canonical user email |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| `display_name` | TEXT | NULL | User's display name |
| `avatar_url` | TEXT | NULL | Profile picture URL |
| `locale` | TEXT | NOT NULL, DEFAULT 'en' | User's preferred language (ISO format) |
| `timezone` | TEXT | NOT NULL, DEFAULT 'UTC' | User's timezone (IANA format) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Soft delete flag |
| `last_login_at` | TIMESTAMPTZ | NULL | Last login timestamp |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Auto-updated via trigger |

## Constraints

### Unique Constraints
- `users_email_unique` - Ensures email uniqueness across all users

### Check Constraints
- `users_locale_check` - Validates locale format (e.g., 'en', 'en-US')

## Relationships

### Array Relationships (One-to-Many)
- `identities` → `user_identities.user_id`

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `users_pkey` | `id` | PRIMARY KEY | Primary key index |
| `users_email_unique` | `email` | UNIQUE | Email lookup |
| `idx_users_email` | `email` | B-tree | Email search optimization |
| `idx_users_active` | `id` | Partial (WHERE is_active = true) | Active users filter |

## Triggers

- `users_updated_at_trigger` - Auto-updates `updated_at` on record modification
