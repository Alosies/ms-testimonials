-- =====================================================
-- Users Table Creation
-- =====================================================
-- Purpose: Application users - provider-agnostic, no auth provider IDs stored here
-- Dependencies: nanoid utility-function, updated_at utility-function

CREATE TABLE public.users (
    -- Primary key (NanoID 12-char)
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- Core identity
    email TEXT NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,

    -- Profile
    display_name TEXT,
    avatar_url TEXT,

    -- Preferences
    locale TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    PRIMARY KEY (id),
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_locale_check CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_active ON public.users(id) WHERE is_active = true;

-- =====================================================
-- Triggers
-- =====================================================

SELECT add_updated_at_trigger('users', 'public');

-- =====================================================
-- Documentation
-- =====================================================

COMMENT ON TABLE public.users IS 'Application users - provider-agnostic, no auth provider IDs stored here';
COMMENT ON COLUMN public.users.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.users.email IS 'Primary email address - unique across all users';
COMMENT ON COLUMN public.users.email_verified IS 'Whether email has been verified';
COMMENT ON COLUMN public.users.display_name IS 'User display name';
COMMENT ON COLUMN public.users.avatar_url IS 'Profile picture URL';
COMMENT ON COLUMN public.users.locale IS 'User language preference (e.g., en, en-US)';
COMMENT ON COLUMN public.users.timezone IS 'User timezone (e.g., UTC, America/New_York)';
COMMENT ON COLUMN public.users.is_active IS 'Soft delete flag - false means user is deactivated';
COMMENT ON COLUMN public.users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when record was last updated';
