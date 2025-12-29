-- =====================================================
-- Roles Table Creation
-- =====================================================
-- Purpose: Permission definitions - explicit boolean columns for queryable permissions
-- Dependencies: nanoid utility-function, updated_at utility-function

CREATE TABLE public.roles (
    -- Primary key (NanoID - use 'unique_name' column for code comparisons)
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- Role identity
    unique_name VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Explicit permission columns (not JSONB - these are queryable/constrainable)
    can_manage_forms BOOLEAN NOT NULL DEFAULT false,
    can_manage_testimonials BOOLEAN NOT NULL DEFAULT false,
    can_manage_widgets BOOLEAN NOT NULL DEFAULT false,
    can_manage_members BOOLEAN NOT NULL DEFAULT false,
    can_manage_billing BOOLEAN NOT NULL DEFAULT false,
    can_delete_org BOOLEAN NOT NULL DEFAULT false,

    -- Read-only access flag (viewer role - can see but not modify)
    is_viewer BOOLEAN NOT NULL DEFAULT false,

    -- System role flag (seed data, not deletable by users)
    is_system_role BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    PRIMARY KEY (id),
    CONSTRAINT roles_unique_name_unique UNIQUE (unique_name)
);

-- =====================================================
-- Triggers
-- =====================================================

SELECT add_updated_at_trigger('roles', 'public');

-- =====================================================
-- Seed Default Roles
-- =====================================================

INSERT INTO public.roles (
    unique_name,
    name,
    description,
    can_manage_forms,
    can_manage_testimonials,
    can_manage_widgets,
    can_manage_members,
    can_manage_billing,
    can_delete_org,
    is_viewer,
    is_system_role
) VALUES
    (
        'owner',
        'Owner',
        'Full access including billing and organization deletion',
        true, true, true, true, true, true,
        false,
        true
    ),
    (
        'admin',
        'Admin',
        'Full access to forms, testimonials, widgets, and members. No billing access.',
        true, true, true, true, false, false,
        false,
        true
    ),
    (
        'member',
        'Member',
        'Can manage forms, testimonials, and widgets. No member or billing access.',
        true, true, true, false, false, false,
        false,
        true
    ),
    (
        'viewer',
        'Viewer',
        'Read-only access to forms, testimonials, and widgets. Cannot modify anything.',
        false, false, false, false, false, false,
        true,
        true
    );

-- =====================================================
-- Documentation
-- =====================================================

COMMENT ON TABLE public.roles IS 'Permission definitions - explicit boolean columns for queryable permissions';
COMMENT ON COLUMN public.roles.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.roles.unique_name IS 'Unique slug for code comparisons (owner, admin, member, viewer)';
COMMENT ON COLUMN public.roles.name IS 'Display-ready label for UI (Owner, Admin, Member, Viewer)';
COMMENT ON COLUMN public.roles.description IS 'Human-readable description of the role';
COMMENT ON COLUMN public.roles.can_manage_forms IS 'Permission to create, edit, delete forms';
COMMENT ON COLUMN public.roles.can_manage_testimonials IS 'Permission to approve, reject, edit testimonials';
COMMENT ON COLUMN public.roles.can_manage_widgets IS 'Permission to create, edit, delete widgets';
COMMENT ON COLUMN public.roles.can_manage_members IS 'Permission to invite, remove, change roles of org members';
COMMENT ON COLUMN public.roles.can_manage_billing IS 'Permission to view and manage billing/subscription';
COMMENT ON COLUMN public.roles.can_delete_org IS 'Permission to delete the organization';
COMMENT ON COLUMN public.roles.is_viewer IS 'Read-only access - can view all resources but cannot modify anything';
COMMENT ON COLUMN public.roles.is_system_role IS 'System roles cannot be deleted or modified by users';
