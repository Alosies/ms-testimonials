# User Identities Schema Reference

**Last Updated**: `2025-12-29-1630` (GMT+5:30)

## Table Structure

```sql
CREATE TABLE public.user_identities (
    id TEXT NOT NULL DEFAULT generate_nanoid_16(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,
    provider_metadata JSONB,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    CONSTRAINT user_identities_user_fk
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT user_identities_provider_unique
        UNIQUE (provider, provider_user_id),
    CONSTRAINT user_identities_provider_check
        CHECK (provider IN ('supabase', 'google', 'github', 'microsoft', 'email'))
);
```

## Column Definitions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY, NOT NULL | NanoID 16-char (security-critical) |
| `user_id` | TEXT | NOT NULL, FK | Reference to parent user |
| `provider` | TEXT | NOT NULL, CHECK | Auth provider name |
| `provider_user_id` | TEXT | NOT NULL | User ID from the provider |
| `provider_email` | TEXT | NULL | Email from the provider |
| `provider_metadata` | JSONB | NULL | Provider-specific data (tokens, claims) |
| `is_primary` | BOOLEAN | NOT NULL, DEFAULT false | Primary identity flag |
| `verified_at` | TIMESTAMPTZ | NULL | When provider verified identity |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Auto-updated via trigger |

## Constraints

### Foreign Key Constraints
- `user_identities_user_fk` - FOREIGN KEY (`user_id`) REFERENCES `users(id)` ON DELETE CASCADE

### Unique Constraints
- `user_identities_provider_unique` - Ensures (provider, provider_user_id) combination is unique

### Check Constraints
- `user_identities_provider_check` - Validates provider is one of: supabase, google, github, microsoft, email

## Relationships

### Object Relationships (Many-to-One)
- `user` → `users.id`

## Indexes

| Index | Columns | Type | Description |
|-------|---------|------|-------------|
| `user_identities_pkey` | `id` | PRIMARY KEY | Primary key index |
| `idx_user_identities_user` | `user_id` | B-tree | User lookup |
| `idx_user_identities_lookup` | `provider`, `provider_user_id` | B-tree | Provider lookup |
| `idx_user_identities_one_primary` | `user_id` | Partial UNIQUE (WHERE is_primary = true) | One primary per user |

## Triggers

- `user_identities_updated_at_trigger` - Auto-updates `updated_at` on record modification

## JSONB Usage Note

The `provider_metadata` column uses JSONB appropriately because:
- Data is provider-specific and varies by provider
- Schema is determined by external providers, not our application
- Data is primarily stored and retrieved whole, not queried field-by-field
