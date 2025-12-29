-- =====================================================
-- User Identities Table Creation
-- =====================================================
-- Purpose: Federated auth identities - one user can have multiple providers
-- Dependencies: users table, nanoid utility-function, updated_at utility-function

CREATE TABLE public.user_identities (
    -- Primary key (NanoID 16-char for security-critical table)
    id TEXT NOT NULL DEFAULT generate_nanoid_16(),

    -- User reference
    user_id TEXT NOT NULL,

    -- Provider identification
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    provider_email TEXT,

    -- Provider-specific data (JSONB appropriate: varies per provider, dump/read)
    provider_metadata JSONB,

    -- Status
    is_primary BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    PRIMARY KEY (id),
    CONSTRAINT user_identities_user_fk
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT user_identities_provider_unique
        UNIQUE (provider, provider_user_id),
    CONSTRAINT user_identities_provider_check
        CHECK (provider IN ('supabase', 'google', 'github', 'microsoft', 'email'))
);

-- =====================================================
-- Indexes
-- =====================================================

-- Lookup by user
CREATE INDEX idx_user_identities_user ON public.user_identities(user_id);

-- Fast provider lookup (most common query pattern)
CREATE INDEX idx_user_identities_lookup ON public.user_identities(provider, provider_user_id);

-- Ensure only one primary identity per user
CREATE UNIQUE INDEX idx_user_identities_one_primary
    ON public.user_identities(user_id) WHERE is_primary = true;

-- =====================================================
-- Triggers
-- =====================================================

SELECT add_updated_at_trigger('user_identities', 'public');

-- =====================================================
-- Documentation
-- =====================================================

COMMENT ON TABLE public.user_identities IS 'Federated auth identities - one user can have multiple providers (Supabase, Google, GitHub, etc.)';
COMMENT ON COLUMN public.user_identities.id IS 'Primary key (NanoID 16-char for security)';
COMMENT ON COLUMN public.user_identities.user_id IS 'Reference to users table';
COMMENT ON COLUMN public.user_identities.provider IS 'Auth provider name (supabase, google, github, microsoft, email)';
COMMENT ON COLUMN public.user_identities.provider_user_id IS 'User ID from the auth provider (e.g., Supabase UUID, Google sub)';
COMMENT ON COLUMN public.user_identities.provider_email IS 'Email from the auth provider (may differ from users.email)';
COMMENT ON COLUMN public.user_identities.provider_metadata IS 'Provider-specific data (tokens, claims) - JSONB appropriate here';
COMMENT ON COLUMN public.user_identities.is_primary IS 'Whether this is the primary login method for the user';
COMMENT ON COLUMN public.user_identities.verified_at IS 'When this identity was verified';
COMMENT ON COLUMN public.user_identities.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.user_identities.updated_at IS 'Timestamp when record was last updated';
