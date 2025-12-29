-- =====================================================
-- Organization Roles Table Creation
-- =====================================================
-- Purpose: User-Organization-Role junction - one role per user per org
-- Dependencies: users table, organizations table, roles table

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
    CONSTRAINT org_roles_user_fk
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT org_roles_role_fk
        FOREIGN KEY (role_id) REFERENCES public.roles(id),
    CONSTRAINT org_roles_invited_by_fk
        FOREIGN KEY (invited_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT org_roles_unique
        UNIQUE (user_id, organization_id)
);

-- Indexes
CREATE INDEX idx_org_roles_user ON public.organization_roles(user_id);
CREATE INDEX idx_org_roles_org ON public.organization_roles(organization_id);
CREATE INDEX idx_org_roles_role ON public.organization_roles(role_id);
CREATE INDEX idx_org_roles_active ON public.organization_roles(user_id, organization_id)
    WHERE is_active = true;
CREATE UNIQUE INDEX idx_org_roles_one_default
    ON public.organization_roles(user_id) WHERE is_default_org = true;

-- Trigger
SELECT add_updated_at_trigger('organization_roles', 'public');

-- Documentation
COMMENT ON TABLE public.organization_roles IS 'User-Organization-Role junction - one role per user per org';
COMMENT ON COLUMN public.organization_roles.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.organization_roles.role_id IS 'FK to roles - app must lookup role.id by role.unique_name';
COMMENT ON COLUMN public.organization_roles.is_default_org IS 'User default organization (only one per user)';
