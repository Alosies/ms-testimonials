# Layer 1: Authentication

**Tables:** users, user_identities, roles

---

## 1.1 Users Table

Global user identity - NO provider-specific fields.

```sql
CREATE TABLE public.users (
    id                TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    email             TEXT NOT NULL,
    email_verified    BOOLEAN NOT NULL DEFAULT false,
    display_name      TEXT,
    avatar_url        TEXT,
    locale            TEXT NOT NULL DEFAULT 'en',
    timezone          TEXT NOT NULL DEFAULT 'UTC',
    is_active         BOOLEAN NOT NULL DEFAULT true,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_locale_check CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;

SELECT add_updated_at_trigger('users');

COMMENT ON TABLE users IS 'Application users - provider-agnostic, no auth provider IDs stored here';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 12-char |
| `email` | TEXT | NOT NULL, UNIQUE | Primary email |
| `email_verified` | BOOLEAN | NOT NULL | Email verification status |
| `display_name` | TEXT | NULL | User's display name |
| `avatar_url` | TEXT | NULL | Profile image URL |
| `locale` | TEXT | NOT NULL | Language preference (e.g., 'en', 'en-US') |
| `timezone` | TEXT | NOT NULL | Timezone (e.g., 'UTC', 'Asia/Kolkata') |
| `is_active` | BOOLEAN | NOT NULL | Soft delete flag |
| `last_login_at` | TIMESTAMPTZ | NULL | Last login timestamp |

---

## 1.2 User Identities Table

Federated auth - stores provider-specific identifiers. JSONB is appropriate here for `provider_metadata` since it varies per provider.

```sql
CREATE TABLE public.user_identities (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_16(),
    user_id             TEXT NOT NULL,
    provider            TEXT NOT NULL,
    provider_user_id    TEXT NOT NULL,
    provider_email      TEXT,
    provider_metadata   JSONB,  -- Appropriate: truly dynamic, provider-specific
    is_primary          BOOLEAN NOT NULL DEFAULT false,
    verified_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_identities_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_identities_provider_unique
        UNIQUE (provider, provider_user_id),
    CONSTRAINT user_identities_provider_check
        CHECK (provider IN ('supabase', 'google', 'github', 'microsoft', 'email'))
);

CREATE INDEX idx_user_identities_user ON user_identities(user_id);
CREATE INDEX idx_user_identities_lookup ON user_identities(provider, provider_user_id);
CREATE UNIQUE INDEX idx_user_identities_one_primary
    ON user_identities(user_id) WHERE is_primary = true;

SELECT add_updated_at_trigger('user_identities');

COMMENT ON TABLE user_identities IS 'Federated auth identities - one user can have multiple providers';
COMMENT ON COLUMN user_identities.provider_metadata IS 'Provider-specific data (tokens, claims) - JSONB appropriate here';
```

### Column Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | NanoID 16-char (security-critical) |
| `user_id` | TEXT | FK → users | Parent user |
| `provider` | TEXT | NOT NULL | Auth provider name |
| `provider_user_id` | TEXT | NOT NULL | ID from provider |
| `provider_email` | TEXT | NULL | Email from provider |
| `provider_metadata` | JSONB | NULL | Provider-specific data |
| `is_primary` | BOOLEAN | NOT NULL | Primary identity flag |
| `verified_at` | TIMESTAMPTZ | NULL | When identity was verified |

### Supported Providers

- `supabase` - Supabase Auth
- `google` - Google OAuth
- `github` - GitHub OAuth
- `microsoft` - Microsoft OAuth
- `email` - Magic link / password

---

## 1.3 Roles Table

Normalized role definitions with explicit permissions.

```sql
CREATE TABLE public.roles (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    unique_name     VARCHAR(50) NOT NULL,   -- Slug for code comparisons (owner, admin)
    name            VARCHAR(100) NOT NULL,  -- Display label for UI (Owner, Admin)
    description     TEXT,
    -- Explicit permission columns instead of JSONB
    can_manage_forms        BOOLEAN NOT NULL DEFAULT false,
    can_manage_testimonials BOOLEAN NOT NULL DEFAULT false,
    can_manage_widgets      BOOLEAN NOT NULL DEFAULT false,
    can_manage_members      BOOLEAN NOT NULL DEFAULT false,
    can_manage_billing      BOOLEAN NOT NULL DEFAULT false,
    can_delete_org          BOOLEAN NOT NULL DEFAULT false,
    -- Read-only access flag
    is_viewer       BOOLEAN NOT NULL DEFAULT false,
    is_system_role  BOOLEAN NOT NULL DEFAULT false,  -- Seed data, not deletable
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT roles_unique_name_unique UNIQUE (unique_name)
);

SELECT add_updated_at_trigger('roles');

-- Seed default roles (NanoID auto-generated, use unique_name for lookups)
INSERT INTO roles (unique_name, name, description, can_manage_forms, can_manage_testimonials, can_manage_widgets, can_manage_members, can_manage_billing, can_delete_org, is_viewer, is_system_role) VALUES
    ('owner', 'Owner', 'Full access including billing and org deletion', true, true, true, true, true, true, false, true),
    ('admin', 'Admin', 'Full access except billing', true, true, true, true, false, false, false, true),
    ('member', 'Member', 'Can manage forms, testimonials, and widgets', true, true, true, false, false, false, false, true),
    ('viewer', 'Viewer', 'Read-only access to all resources', false, false, false, false, false, false, true, true);

COMMENT ON TABLE roles IS 'Permission definitions - explicit boolean columns, not JSONB';
COMMENT ON COLUMN roles.unique_name IS 'Slug for code comparisons (owner, admin, member, viewer)';
COMMENT ON COLUMN roles.name IS 'Display-ready label for UI (Owner, Admin, Member, Viewer)';
```

### Permission Matrix

| Role | Forms | Testimonials | Widgets | Members | Billing | Delete Org | Viewer |
|------|-------|--------------|---------|---------|---------|------------|--------|
| owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| member | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| viewer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Usage Pattern

```typescript
// Code comparisons use unique_name
if (role.unique_name === 'owner') { ... }

// UI display uses name
<span>{{ role.name }}</span>
```
