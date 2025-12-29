# Database Schema Research - Testimonials MVP

**Date:** December 29, 2025
**Status:** Research Complete (v3 - Proper Relational Design)

---

## Executive Summary

This document presents a **scalable, provider-agnostic, properly normalized** database schema for the Testimonials MVP.

### Design Principles

1. **Provider-Agnostic Auth** - Federated `user_identities` table, no vendor lock-in
2. **Multi-Tenant by Default** - Organizations as the tenant boundary
3. **Proper Relational Design** - No JSONB shortcuts for structured data
4. **Constraint-Driven Integrity** - Database enforces business rules, not just application
5. **Query-Optimized** - Indexed for actual access patterns
6. **Migration-Friendly** - Schema changes via migrations, not hidden in JSONB

### JSONB Policy

| Use Case | JSONB? | Rationale |
|----------|--------|-----------|
| Provider metadata | **Yes** | Truly dynamic, varies per provider, dump/read |
| UI preferences/settings | **Yes** | Not queried, schema-less by nature |
| Structured business data | **No** | Needs constraints, queried, reported |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AUTHENTICATION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────┐         ┌──────────────────┐                                  │
│   │   USERS     │◄────────│ USER_IDENTITIES  │  ← Supabase, Google, GitHub      │
│   │             │ 1    N  │ (provider_metadata JSONB - appropriate)             │
│   └──────┬──────┘         └──────────────────┘                                  │
│          │                                                                      │
└──────────┼──────────────────────────────────────────────────────────────────────┘
           │
┌──────────┼──────────────────────────────────────────────────────────────────────┐
│          │                    MULTI-TENANCY LAYER                               │
├──────────┼──────────────────────────────────────────────────────────────────────┤
│          │                                                                      │
│          │    ┌───────────────┐       ┌─────────────┐                           │
│          └───►│ ORGANIZATIONS │──────►│   PLANS     │  ← Normalized plan config │
│               └───────┬───────┘       └─────────────┘                           │
│                       │                                                         │
│          ┌────────────┴────────────┐                                            │
│          ▼                         ▼                                            │
│   ┌─────────────────┐       ┌─────────────┐                                     │
│   │ ORG_ROLES       │       │    ROLES    │  ← Normalized roles                 │
│   └─────────────────┘       └─────────────┘                                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
           │
┌──────────┼──────────────────────────────────────────────────────────────────────┐
│          │                    BUSINESS ENTITIES                                 │
├──────────┼──────────────────────────────────────────────────────────────────────┤
│          ▼                                                                      │
│   ┌─────────────┐      ┌────────────────┐                                       │
│   │    FORMS    │─────►│ FORM_QUESTIONS │  ← Normalized questions               │
│   └──────┬──────┘ 1  N └───────┬────────┘                                       │
│          │                     │                                                │
│          │ 1                   │ 1                                              │
│          ▼ N                   ▼ N                                              │
│   ┌──────────────┐      ┌──────────────────────┐                                │
│   │ TESTIMONIALS │◄────►│ TESTIMONIAL_ANSWERS  │  ← Normalized answers          │
│   └──────┬───────┘      └──────────────────────┘                                │
│          │                                                                      │
│          │ N                                                                    │
│          ▼ M                                                                    │
│   ┌───────────────────┐      ┌─────────────┐                                    │
│   │ WIDGET_TESTIMONIALS│◄────│   WIDGETS   │  ← Proper junction table           │
│   └───────────────────┘  N 1 └─────────────┘                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Summary

### Layer 1: Authentication (3 tables)

| Table | Purpose | JSONB Fields |
|-------|---------|--------------|
| `users` | Application user identity | None |
| `user_identities` | Federated auth providers | `provider_metadata` (appropriate) |
| `roles` | Permission definitions | None |

### Layer 2: Multi-Tenancy (3 tables)

| Table | Purpose | JSONB Fields |
|-------|---------|--------------|
| `plans` | Subscription plan definitions | None |
| `organizations` | Tenant/workspace | `settings` (UI prefs only) |
| `organization_roles` | User ↔ Org ↔ Role junction | None |

### Layer 3: Business Entities (6 tables)

| Table | Purpose | JSONB Fields |
|-------|---------|--------------|
| `forms` | Collection forms | `settings` (UI prefs only) |
| `form_questions` | Questions per form | None |
| `testimonials` | Customer testimonials | `source_metadata` (import data) |
| `testimonial_answers` | Answers linked to questions | None |
| `widgets` | Embeddable displays | `settings` (UI prefs only) |
| `widget_testimonials` | Widget ↔ Testimonial junction | None |

**Total: 12 tables** (properly normalized)

---

## Layer 1: Authentication

### 1.1 Users Table

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

### 1.2 User Identities Table

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

### 1.3 Roles Table

Normalized role definitions with explicit permissions.

```sql
CREATE TABLE public.roles (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    name            VARCHAR(50) NOT NULL,
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

    CONSTRAINT roles_name_unique UNIQUE (name)
);

SELECT add_updated_at_trigger('roles');

-- Seed default roles
INSERT INTO roles (id, name, description, can_manage_forms, can_manage_testimonials, can_manage_widgets, can_manage_members, can_manage_billing, can_delete_org, is_viewer, is_system_role) VALUES
    ('role_owner', 'owner', 'Full access including billing and org deletion', true, true, true, true, true, true, false, true),
    ('role_admin', 'admin', 'Full access except billing', true, true, true, true, false, false, false, true),
    ('role_member', 'member', 'Can manage forms, testimonials, and widgets', true, true, true, false, false, false, false, true),
    ('role_viewer', 'viewer', 'Read-only access to all resources', false, false, false, false, false, false, true, true);

COMMENT ON TABLE roles IS 'Permission definitions - explicit boolean columns, not JSONB';
```

---

## Layer 2: Multi-Tenancy

### 2.1 Plans Table

Normalized plan definitions with explicit limit columns.

```sql
CREATE TABLE public.plans (
    id                  TEXT PRIMARY KEY,  -- 'free', 'pro', 'team' - semantic IDs
    name                VARCHAR(50) NOT NULL,
    description         TEXT,
    -- Explicit limit columns instead of JSONB
    max_testimonials    INTEGER NOT NULL,  -- -1 = unlimited
    max_forms           INTEGER NOT NULL,
    max_widgets         INTEGER NOT NULL,
    max_members         INTEGER NOT NULL,
    show_branding       BOOLEAN NOT NULL DEFAULT true,
    -- Pricing
    price_monthly       INTEGER NOT NULL DEFAULT 0,  -- Cents
    price_yearly        INTEGER NOT NULL DEFAULT 0,  -- Cents
    price_lifetime      INTEGER,                     -- Cents, NULL if not offered
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT add_updated_at_trigger('plans');

-- Seed default plans
INSERT INTO plans (id, name, description, max_testimonials, max_forms, max_widgets, max_members, show_branding, price_monthly, price_yearly, price_lifetime) VALUES
    ('free', 'Free', 'Get started with testimonials', 50, 1, 1, 1, true, 0, 0, NULL),
    ('pro', 'Pro', 'For growing businesses', -1, 5, -1, 1, false, 0, 0, 4900),
    ('team', 'Team', 'For teams with multiple members', -1, -1, -1, 3, false, 0, 0, 9900);

COMMENT ON TABLE plans IS 'Subscription plan definitions - explicit columns for queryable limits';
COMMENT ON COLUMN plans.max_testimonials IS '-1 means unlimited';
```

### 2.2 Organizations Table

Tenant boundary. Only `settings` JSONB for UI preferences.

```sql
CREATE TABLE public.organizations (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    name            TEXT NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    logo_url        TEXT,
    plan_id         TEXT NOT NULL DEFAULT 'free',
    -- Usage counters (denormalized for performance, updated via triggers)
    testimonial_count   INTEGER NOT NULL DEFAULT 0,
    form_count          INTEGER NOT NULL DEFAULT 0,
    widget_count        INTEGER NOT NULL DEFAULT 0,
    member_count        INTEGER NOT NULL DEFAULT 0,
    -- UI preferences only - not business logic
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_by      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT organizations_slug_unique UNIQUE (slug),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'),
    CONSTRAINT organizations_plan_fk
        FOREIGN KEY (plan_id) REFERENCES plans(id),
    CONSTRAINT organizations_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan_id);
CREATE INDEX idx_organizations_active ON organizations(id) WHERE is_active = true;

SELECT add_updated_at_trigger('organizations');

COMMENT ON TABLE organizations IS 'Tenant boundary - all business data scoped here';
COMMENT ON COLUMN organizations.settings IS 'UI preferences only (theme, locale) - not business logic';
```

### 2.3 Organization Roles Table

User ↔ Organization ↔ Role junction table. A user can have different roles in different organizations.

```sql
CREATE TABLE public.organization_roles (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    user_id             TEXT NOT NULL,
    organization_id     TEXT NOT NULL,
    role_id             TEXT NOT NULL DEFAULT 'role_member',
    is_default_org      BOOLEAN NOT NULL DEFAULT false,  -- User's default organization
    is_active           BOOLEAN NOT NULL DEFAULT true,
    invited_by          TEXT,
    invited_at          TIMESTAMPTZ,
    joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT org_roles_user_fk
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_role_fk
        FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT org_roles_invited_by_fk
        FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT org_roles_unique
        UNIQUE (user_id, organization_id)
);

CREATE INDEX idx_org_roles_user ON organization_roles(user_id);
CREATE INDEX idx_org_roles_org ON organization_roles(organization_id);
CREATE INDEX idx_org_roles_active ON organization_roles(user_id, organization_id)
    WHERE is_active = true;
CREATE UNIQUE INDEX idx_org_roles_one_default
    ON organization_roles(user_id) WHERE is_default_org = true;

SELECT add_updated_at_trigger('organization_roles');

COMMENT ON TABLE organization_roles IS 'User-Organization-Role junction - users can have different roles in different orgs';
```

---

## Layer 3: Business Entities

### 3.1 Forms Table

Collection forms - questions are normalized to separate table.

```sql
CREATE TABLE public.forms (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     TEXT NOT NULL,
    created_by          TEXT NOT NULL,
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL,
    product_name        TEXT NOT NULL,
    -- Submission settings as explicit columns
    collect_rating      BOOLEAN NOT NULL DEFAULT true,
    require_email       BOOLEAN NOT NULL DEFAULT true,
    require_company     BOOLEAN NOT NULL DEFAULT false,
    -- UI preferences only
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT forms_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT forms_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT forms_slug_per_org_unique
        UNIQUE (organization_id, slug),
    CONSTRAINT forms_slug_format
        CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

CREATE INDEX idx_forms_org ON forms(organization_id);
CREATE INDEX idx_forms_slug ON forms(organization_id, slug);
CREATE INDEX idx_forms_active ON forms(organization_id) WHERE is_active = true;

SELECT add_updated_at_trigger('forms');

COMMENT ON TABLE forms IS 'Testimonial collection forms - questions normalized to form_questions table';
COMMENT ON COLUMN forms.settings IS 'UI preferences only (theme, colors) - not business logic';
```

### 3.2 Form Questions Table

Normalized questions with proper constraints.

```sql
CREATE TABLE public.form_questions (
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    form_id         TEXT NOT NULL,
    question_key    VARCHAR(50) NOT NULL,  -- 'problem', 'solution', 'result', 'attribution'
    question_text   TEXT NOT NULL,
    placeholder     TEXT,
    help_text       TEXT,
    display_order   SMALLINT NOT NULL,
    is_required     BOOLEAN NOT NULL DEFAULT true,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT form_questions_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_key_per_form_unique
        UNIQUE (form_id, question_key),
    CONSTRAINT form_questions_order_per_form_unique
        UNIQUE (form_id, display_order),
    CONSTRAINT form_questions_key_format
        CHECK (question_key ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_form_questions_form ON form_questions(form_id);
CREATE INDEX idx_form_questions_order ON form_questions(form_id, display_order);

SELECT add_updated_at_trigger('form_questions');

COMMENT ON TABLE form_questions IS 'Normalized form questions - enables querying, reporting, reordering';
```

### 3.3 Testimonials Table

Customer testimonials - answers normalized to separate table.

```sql
CREATE TABLE public.testimonials (
    id                      TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id         TEXT NOT NULL,
    form_id                 TEXT NOT NULL,
    -- Workflow
    status                  TEXT NOT NULL DEFAULT 'pending',
    -- AI-assembled content
    content                 TEXT,
    rating                  SMALLINT,
    -- Customer info (denormalized for display performance)
    customer_name           TEXT NOT NULL,
    customer_email          TEXT NOT NULL,
    customer_title          TEXT,
    customer_company        TEXT,
    customer_avatar_url     TEXT,
    -- Source tracking
    source                  TEXT NOT NULL DEFAULT 'form',
    source_metadata         JSONB,  -- Appropriate: import-specific, varies by source
    -- Approval audit
    approved_by             TEXT,
    approved_at             TIMESTAMPTZ,
    rejected_by             TEXT,
    rejected_at             TIMESTAMPTZ,
    rejection_reason        TEXT,
    -- Timestamps
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT testimonials_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT testimonials_form_fk
        FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    CONSTRAINT testimonials_approved_by_fk
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_rejected_by_fk
        FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT testimonials_status_check
        CHECK (status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT testimonials_rating_check
        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    CONSTRAINT testimonials_source_check
        CHECK (source IN ('form', 'import', 'manual')),
    CONSTRAINT testimonials_email_format
        CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_testimonials_org ON testimonials(organization_id);
CREATE INDEX idx_testimonials_form ON testimonials(form_id);
CREATE INDEX idx_testimonials_status ON testimonials(organization_id, status);
CREATE INDEX idx_testimonials_created ON testimonials(organization_id, created_at DESC);
-- Partial index for approved (most common query)
CREATE INDEX idx_testimonials_approved
    ON testimonials(organization_id, created_at DESC)
    WHERE status = 'approved';

SELECT add_updated_at_trigger('testimonials');

COMMENT ON TABLE testimonials IS 'Customer testimonials - answers normalized to testimonial_answers';
COMMENT ON COLUMN testimonials.source_metadata IS 'Import-specific data (tweet ID, LinkedIn URL) - JSONB appropriate';
```

### 3.4 Testimonial Answers Table

Normalized answers linked to questions.

```sql
CREATE TABLE public.testimonial_answers (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    testimonial_id      TEXT NOT NULL,
    question_id         TEXT NOT NULL,
    answer_text         TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT testimonial_answers_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_answers_question_fk
        FOREIGN KEY (question_id) REFERENCES form_questions(id) ON DELETE CASCADE,
    CONSTRAINT testimonial_answers_unique
        UNIQUE (testimonial_id, question_id)
);

CREATE INDEX idx_testimonial_answers_testimonial ON testimonial_answers(testimonial_id);
CREATE INDEX idx_testimonial_answers_question ON testimonial_answers(question_id);

SELECT add_updated_at_trigger('testimonial_answers');

COMMENT ON TABLE testimonial_answers IS 'Normalized answers - enables querying by question, analytics, etc.';
```

### 3.5 Widgets Table

Embeddable widgets - testimonial selections in junction table.

```sql
CREATE TABLE public.widgets (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    organization_id     TEXT NOT NULL,
    created_by          TEXT NOT NULL,
    name                TEXT NOT NULL,
    type                TEXT NOT NULL,
    theme               TEXT NOT NULL DEFAULT 'light',
    -- Display settings as explicit columns
    show_ratings        BOOLEAN NOT NULL DEFAULT true,
    show_dates          BOOLEAN NOT NULL DEFAULT false,
    show_company        BOOLEAN NOT NULL DEFAULT true,
    show_avatar         BOOLEAN NOT NULL DEFAULT true,
    max_display         SMALLINT,  -- NULL = show all
    -- Type-specific settings (UI only)
    settings            JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT widgets_org_fk
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT widgets_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT widgets_type_check
        CHECK (type IN ('wall_of_love', 'carousel', 'single_quote')),
    CONSTRAINT widgets_theme_check
        CHECK (theme IN ('light', 'dark'))
);

CREATE INDEX idx_widgets_org ON widgets(organization_id);
CREATE INDEX idx_widgets_active ON widgets(organization_id) WHERE is_active = true;

SELECT add_updated_at_trigger('widgets');

COMMENT ON TABLE widgets IS 'Embeddable widgets - testimonial selections in junction table';
COMMENT ON COLUMN widgets.settings IS 'Type-specific UI settings (carousel speed, columns) - not business logic';
```

### 3.6 Widget Testimonials Junction Table

Proper many-to-many with ordering.

```sql
CREATE TABLE public.widget_testimonials (
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
    widget_id           TEXT NOT NULL,
    testimonial_id      TEXT NOT NULL,
    display_order       SMALLINT NOT NULL,
    is_featured         BOOLEAN NOT NULL DEFAULT false,  -- Highlighted in UI
    added_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    added_by            TEXT,

    CONSTRAINT widget_testimonials_widget_fk
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_testimonial_fk
        FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE CASCADE,
    CONSTRAINT widget_testimonials_added_by_fk
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT widget_testimonials_unique
        UNIQUE (widget_id, testimonial_id),
    CONSTRAINT widget_testimonials_order_unique
        UNIQUE (widget_id, display_order)
);

CREATE INDEX idx_widget_testimonials_widget ON widget_testimonials(widget_id);
CREATE INDEX idx_widget_testimonials_testimonial ON widget_testimonials(testimonial_id);
CREATE INDEX idx_widget_testimonials_order ON widget_testimonials(widget_id, display_order);

COMMENT ON TABLE widget_testimonials IS 'Widget-Testimonial junction with ordering and featured flag';
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA v3                                          │
│                        (Properly Normalized - 12 Tables)                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                    AUTHENTICATION
┌──────────────────┐                                      ┌───────────────────────┐
│      USERS       │                                      │    USER_IDENTITIES    │
├──────────────────┤                                      ├───────────────────────┤
│ id (PK)          │◄─────────────────────────────────────│ user_id (FK)          │
│ email (UNIQUE)   │                               1 : N  │ id (PK)               │
│ email_verified   │                                      │ provider              │
│ display_name     │                                      │ provider_user_id      │
│ avatar_url       │                                      │ provider_metadata     │ ← JSONB OK
│ is_active        │                                      │ is_primary            │
└────────┬─────────┘                                      └───────────────────────┘
         │
         │                              AUTHORIZATION
         │
         │         ┌────────────────────────┐             ┌─────────────┐
         │         │  ORGANIZATION_ROLES    │            │    ROLES    │
         │         ├────────────────────────┤            ├─────────────┤
         └────────►│ user_id (FK)           │            │ id (PK)     │
                   │ organization_id (FK)───┼──┐         │ name        │
                   │ role_id (FK)───────────┼──┼────────►│ can_*       │ ← Explicit columns
                   │ is_default_org         │  │         └─────────────┘
                   │ is_active              │  │
                   └────────────────────────┘  │
                                               │
                              MULTI-TENANCY    │
                                               │
         ┌─────────────┐                       │         ┌───────────────────┐
         │    PLANS    │                       │         │   ORGANIZATIONS   │
         ├─────────────┤                       │         ├───────────────────┤
         │ id (PK)     │◄──────────────────────┼─────────│ plan_id (FK)      │
         │ name        │                       └────────►│ id (PK)           │
         │ max_*       │ ← Explicit columns              │ name              │
         │ show_brand  │                                 │ slug (UNIQUE)     │
         │ price_*     │                                 │ *_count           │ ← Denormalized
         └─────────────┘                                 │ settings          │ ← JSONB (UI only)
                                                         └─────────┬─────────┘
                                                                   │
                              BUSINESS ENTITIES                    │
                                                                   │
                   ┌───────────────────────────────────────────────┼──────────────────┐
                   │                                               │                  │
                   ▼                                               ▼                  ▼
         ┌───────────────────┐                           ┌──────────────┐    ┌─────────────┐
         │       FORMS       │                           │ TESTIMONIALS │    │   WIDGETS   │
         ├───────────────────┤                           ├──────────────┤    ├─────────────┤
         │ id (PK)           │                           │ id (PK)      │    │ id (PK)     │
         │ organization_id───┼───────────────────────────│ org_id (FK)──┼────│ org_id (FK) │
         │ name              │                           │ form_id (FK)─┼─┐  │ name        │
         │ slug              │◄──────────────────────────┼──────────────┼─┘  │ type        │
         │ product_name      │                      1: N │ status       │    │ theme       │
         │ collect_rating    │ ← Explicit columns        │ content      │    │ show_*      │ ← Explicit
         │ require_*         │                           │ rating       │    │ settings    │ ← JSONB (UI)
         │ settings          │ ← JSONB (UI only)         │ customer_*   │    └──────┬──────┘
         └─────────┬─────────┘                           │ source       │           │
                   │                                     │ source_meta  │ ← JSONB OK│
                   │ 1 : N                               │ approved_*   │           │
                   ▼                                     └──────┬───────┘           │
         ┌────────────────────┐                                 │                   │
         │   FORM_QUESTIONS   │                                 │                   │
         ├────────────────────┤                                 │                   │
         │ id (PK)            │                                 │                   │
         │ form_id (FK)───────┼─────────────────────────────────┤                   │
         │ question_key       │                            1: N │              N: M │
         │ question_text      │                                 │                   │
         │ placeholder        │                                 │                   │
         │ display_order      │                                 ▼                   │
         │ is_required        │                    ┌──────────────────────┐         │
         └─────────┬──────────┘                    │ TESTIMONIAL_ANSWERS  │         │
                   │                               ├──────────────────────┤         │
                   │ 1 : N                         │ id (PK)              │         │
                   │                               │ testimonial_id (FK)──┼─────────┤
                   └──────────────────────────────►│ question_id (FK)     │         │
                                                   │ answer_text          │         │
                                                   └──────────────────────┘         │
                                                                                    │
                                                                                    │
                                                   ┌───────────────────────┐        │
                                                   │  WIDGET_TESTIMONIALS  │        │
                                                   ├───────────────────────┤        │
                                                   │ id (PK)               │        │
                                                   │ widget_id (FK)────────┼────────┘
                                                   │ testimonial_id (FK)───┼────────┐
                                                   │ display_order         │        │
                                                   │ is_featured           │        │
                                                   └───────────────────────┘        │
                                                              ▲                     │
                                                              └─────────────────────┘
```

---

## Migration Order

Dependencies determine order:

```
Phase 1: Utility Functions (exists)
  1. nanoid__utility-function
  2. updated_at__utility-function

Phase 2: Authentication
  3. users__create_table
  4. user_identities__create_table
  5. roles__create_table

Phase 3: Multi-Tenancy
  6. plans__create_table
  7. organizations__create_table
  8. organization_roles__create_table

Phase 4: Business Entities
  9.  forms__create_table
  10. form_questions__create_table
  11. testimonials__create_table
  12. testimonial_answers__create_table
  13. widgets__create_table
  14. widget_testimonials__create_table

Phase 5: Triggers & Functions
  15. organizations__usage_count_triggers
  16. testimonials__auto_org_id_trigger
```

---

## Usage Count Triggers

Keep organization counts accurate via triggers (not application code).

```sql
-- Trigger to update organization.testimonial_count
CREATE OR REPLACE FUNCTION update_org_testimonial_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations
        SET testimonial_count = testimonial_count + 1
        WHERE id = NEW.organization_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations
        SET testimonial_count = testimonial_count - 1
        WHERE id = OLD.organization_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_org_testimonial_count
    AFTER INSERT OR DELETE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_org_testimonial_count();

-- Similar triggers for form_count, widget_count, member_count
```

---

## Default Questions Seeding

When a form is created, seed default questions:

```sql
-- Function to seed default questions for a new form
CREATE OR REPLACE FUNCTION seed_default_questions()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO form_questions (form_id, question_key, question_text, placeholder, display_order, is_required)
    VALUES
        (NEW.id, 'problem', 'What problem were you trying to solve?',
         'Before using ' || NEW.product_name || ', I was struggling with...', 1, true),
        (NEW.id, 'solution', 'How did ' || NEW.product_name || ' help?',
         'It helped me by...', 2, true),
        (NEW.id, 'result', 'What specific result did you get?',
         'Now I can... / I achieved...', 3, true),
        (NEW.id, 'attribution', 'Your name, title & company',
         'John Doe, CEO at Acme Corp', 4, false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_seed_form_questions
    AFTER INSERT ON forms
    FOR EACH ROW EXECUTE FUNCTION seed_default_questions();
```

---

## Query Examples

### Get Form with Questions (Ordered)

```sql
SELECT
    f.id, f.name, f.slug, f.product_name,
    json_agg(
        json_build_object(
            'key', q.question_key,
            'text', q.question_text,
            'placeholder', q.placeholder,
            'required', q.is_required
        ) ORDER BY q.display_order
    ) AS questions
FROM forms f
JOIN form_questions q ON q.form_id = f.id AND q.is_active = true
WHERE f.organization_id = $1 AND f.slug = $2 AND f.is_active = true
GROUP BY f.id;
```

### Get Testimonial with Answers

```sql
SELECT
    t.*,
    json_agg(
        json_build_object(
            'question_key', q.question_key,
            'question', q.question_text,
            'answer', a.answer_text
        ) ORDER BY q.display_order
    ) AS answers
FROM testimonials t
JOIN testimonial_answers a ON a.testimonial_id = t.id
JOIN form_questions q ON q.id = a.question_id
WHERE t.id = $1
GROUP BY t.id;
```

### Get Widget with Testimonials (Ordered)

```sql
SELECT
    w.*,
    json_agg(
        json_build_object(
            'id', t.id,
            'content', t.content,
            'rating', t.rating,
            'customer_name', t.customer_name,
            'customer_company', t.customer_company,
            'is_featured', wt.is_featured
        ) ORDER BY wt.display_order
    ) AS testimonials
FROM widgets w
JOIN widget_testimonials wt ON wt.widget_id = w.id
JOIN testimonials t ON t.id = wt.testimonial_id AND t.status = 'approved'
WHERE w.id = $1 AND w.is_active = true
GROUP BY w.id;
```

### Check Plan Limits Before Insert

```sql
-- Check if org can add more testimonials
SELECT
    CASE
        WHEN p.max_testimonials = -1 THEN true
        WHEN o.testimonial_count < p.max_testimonials THEN true
        ELSE false
    END AS can_add_testimonial
FROM organizations o
JOIN plans p ON p.id = o.plan_id
WHERE o.id = $1;
```

---

## Hasura Permissions

### Member Role - Forms

```yaml
select_permissions:
  - role: member
    permission:
      columns: [id, name, slug, product_name, collect_rating, require_email, require_company, settings, is_active, created_at]
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      allow_aggregations: true

insert_permissions:
  - role: member
    permission:
      columns: [name, slug, product_name, collect_rating, require_email, require_company, settings]
      set:
        organization_id: X-Hasura-Organization-Id
        created_by: X-Hasura-User-Id
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id
```

### Anonymous Role - Form Submission

```yaml
# Anonymous can only insert testimonials (submit form)
insert_permissions:
  - role: anonymous
    permission:
      columns: [form_id, customer_name, customer_email, customer_title, customer_company, rating]
      set:
        status: pending
        source: form
      check:
        form:
          is_active:
            _eq: true
```

---

## Benefits of This Design

### 1. Queryable & Reportable

```sql
-- Which question gets the longest answers?
SELECT q.question_key, AVG(LENGTH(a.answer_text)) as avg_length
FROM form_questions q
JOIN testimonial_answers a ON a.question_id = q.id
GROUP BY q.question_key
ORDER BY avg_length DESC;

-- Not possible with JSONB without complex extraction
```

### 2. Referential Integrity

```sql
-- Can't delete a question that has answers
-- Can't add answer to non-existent question
-- Can't add testimonial to non-existent widget
-- All enforced by database, not application
```

### 3. Schema Evolution via Migrations

```sql
-- Add new question type? Simple migration
ALTER TABLE form_questions ADD COLUMN question_type TEXT DEFAULT 'text';

-- With JSONB, this change is hidden in application code
```

### 4. Efficient Queries

```sql
-- Find all testimonials mentioning "pricing"
SELECT t.* FROM testimonials t
JOIN testimonial_answers a ON a.testimonial_id = t.id
WHERE a.answer_text ILIKE '%pricing%';

-- With JSONB: jsonb_each_text() + ILIKE = slow
```

### 5. Proper Constraints

```sql
-- Unique order per form (no duplicates)
UNIQUE (form_id, display_order)

-- Required answer for required question (app logic, but queryable)
SELECT * FROM form_questions q
LEFT JOIN testimonial_answers a ON a.question_id = q.id AND a.testimonial_id = $1
WHERE q.form_id = $2 AND q.is_required = true AND a.id IS NULL;
```

---

## JSONB Usage Summary

| Table | JSONB Column | Purpose | Why OK |
|-------|--------------|---------|--------|
| user_identities | provider_metadata | OAuth tokens, provider claims | Varies per provider, not queried |
| organizations | settings | UI theme, locale | User preferences, not business logic |
| forms | settings | Form theme, colors | UI customization, not queried |
| testimonials | source_metadata | Import source details | Varies per source (Twitter, LinkedIn) |
| widgets | settings | Carousel speed, columns | Type-specific UI, not queried |

**All business-critical data is in proper columns with constraints.**

---

## References

- `docs/mvp.md` - Product requirements
- `docs/testimonial-competitor-deepdive.md` - Competitor analysis
- `/Users/alosiesgeorge/CodeRepositories/Fork/feat-authorize` - CoursePads patterns
- `db/CLAUDE.md` - Database conventions
