-- =====================================================
-- Flows Table Creation
-- =====================================================
-- Purpose: Defines branching paths for forms. Each form has multiple flows
--          (shared, testimonial, improvement) that determine which steps
--          are shown based on user responses (e.g., rating threshold).
--
-- Architecture: See ADR-009 for detailed design decisions.
--
-- Flows enable:
--   - Rating-based branching (testimonial vs improvement)
--   - Future: NPS branching (promoters/passives/detractors)
--   - Future: Custom conditions (boolean, choice-based)
--
-- Dependencies: generate_nanoid_12(), add_updated_at_trigger(), forms, organizations

CREATE TABLE public.flows (
    -- =========================================================================
    -- Primary Key
    -- =========================================================================
    -- Unique identifier using NanoID 12-character format for URL-safe,
    -- collision-resistant identification. Used in GraphQL queries and
    -- as foreign key reference from form_steps.
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- =========================================================================
    -- Parent References
    -- =========================================================================

    -- Foreign key to the parent form. When a form is deleted, all its flows
    -- are automatically cascade deleted. Each form typically has 3 flows:
    -- one shared (always shown) and two branches (testimonial, improvement).
    form_id TEXT NOT NULL,

    -- Foreign key to organization for row-level security. Denormalized from
    -- form for efficient RLS queries. Must match form.organization_id.
    -- Used by Hasura permission rules to restrict access by organization.
    organization_id TEXT NOT NULL,

    -- =========================================================================
    -- Flow Identification
    -- =========================================================================

    -- Human-readable name for the flow, displayed in the form editor UI.
    -- Examples: "Shared Steps", "Testimonial Flow", "Improvement Flow"
    -- For NPS: "Promoters", "Passives", "Detractors"
    -- Must be unique within a form (enforced by constraint).
    name TEXT NOT NULL,

    -- Type of flow determining its behavior:
    --   'shared': Steps always shown to all respondents (before branch point)
    --   'branch': Steps shown conditionally based on branch_condition
    -- A form should have exactly one 'shared' flow and one or more 'branch' flows.
    flow_type TEXT NOT NULL CHECK (flow_type IN ('shared', 'branch')),

    -- =========================================================================
    -- Branching Configuration
    -- =========================================================================

    -- JSONB condition that determines when this branch is shown.
    -- Must be NULL for 'shared' flow type.
    -- Must be NOT NULL for 'branch' flow type (enforced by constraint).
    --
    -- Schema: { "field": string, "op": string, "value": number|boolean|array }
    --
    -- Supported operators:
    --   ">="  - greater than or equal (e.g., rating >= 4)
    --   ">"   - greater than
    --   "<="  - less than or equal
    --   "<"   - less than (e.g., rating < 4)
    --   "="   - equals (e.g., used_feature = true)
    --   "!="  - not equals
    --   "between" - range inclusive (e.g., nps between [7, 8])
    --
    -- Examples:
    --   {"field": "rating", "op": ">=", "value": 4}     -- Testimonial flow
    --   {"field": "rating", "op": "<", "value": 4}      -- Improvement flow
    --   {"field": "nps", "op": ">=", "value": 9}        -- NPS Promoters
    --   {"field": "nps", "op": "between", "value": [7,8]} -- NPS Passives
    --   {"field": "used_feature", "op": "=", "value": true} -- Boolean branch
    branch_condition JSONB,

    -- =========================================================================
    -- Ordering
    -- =========================================================================

    -- Display order for rendering flows in the form editor UI.
    -- Convention: shared=0, then branches in logical order (e.g., testimonial=1, improvement=2).
    -- Used for consistent display ordering in queries:
    --   ORDER BY display_order, step_order
    display_order SMALLINT NOT NULL DEFAULT 0,

    -- =========================================================================
    -- Timestamps
    -- =========================================================================

    -- Timestamp when this flow was first created. Set automatically by DEFAULT,
    -- never modified after initial insert.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp of last modification. Automatically updated by database trigger
    -- (add_updated_at_trigger) on any column change.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- =========================================================================
    -- Constraints
    -- =========================================================================

    PRIMARY KEY (id),

    -- Each flow name must be unique within a form to prevent duplicate flows
    -- and ensure clear identification in the UI.
    CONSTRAINT flows_form_name_unique UNIQUE (form_id, name),

    -- Business rule: Shared flows must NOT have a branch_condition (they're always shown).
    -- Branch flows MUST have a branch_condition (they're conditional).
    -- This ensures data integrity and prevents invalid flow configurations.
    CONSTRAINT flows_branch_condition_check CHECK (
        (flow_type = 'shared' AND branch_condition IS NULL) OR
        (flow_type = 'branch' AND branch_condition IS NOT NULL)
    )
);

-- =========================================================================
-- Foreign Keys
-- =========================================================================

-- Link to parent form with cascade delete. When a form is deleted,
-- all associated flows are automatically removed.
ALTER TABLE public.flows
    ADD CONSTRAINT fk_flows_form_id
    FOREIGN KEY (form_id) REFERENCES public.forms(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Link to organization for RLS. RESTRICT delete to prevent orphaned flows
-- if organization deletion is attempted (should be blocked at app level).
ALTER TABLE public.flows
    ADD CONSTRAINT fk_flows_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- =========================================================================
-- Indexes
-- =========================================================================

-- Index for querying all flows belonging to a form.
-- Primary access pattern: "Get all flows for form X"
CREATE INDEX idx_flows_form_id ON public.flows(form_id);

-- Index for organization-based RLS queries.
-- Used by Hasura permission filters: WHERE organization_id = x-hasura-org-id
CREATE INDEX idx_flows_organization_id ON public.flows(organization_id);

-- Composite index for efficient ordered retrieval of flows within a form.
-- Supports: ORDER BY form_id, display_order (common query pattern)
CREATE INDEX idx_flows_form_order ON public.flows(form_id, display_order);

-- =========================================================================
-- Triggers
-- =========================================================================

-- Automatically update updated_at timestamp on any modification.
SELECT add_updated_at_trigger('flows', 'public');

-- =========================================================================
-- Documentation
-- =========================================================================

COMMENT ON TABLE public.flows IS 'Defines branching paths for forms. Each form has flows (shared, testimonial, improvement) that determine step visibility based on user responses like rating. See ADR-009 for architecture details.';

COMMENT ON COLUMN public.flows.id IS 'Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification.';
COMMENT ON COLUMN public.flows.form_id IS 'Foreign key to forms table. Identifies which form this flow belongs to. Cascade deletes when parent form is removed.';
COMMENT ON COLUMN public.flows.organization_id IS 'Foreign key to organizations for row-level security. Denormalized from form for efficient permission queries.';
COMMENT ON COLUMN public.flows.name IS 'Human-readable flow name displayed in form editor (e.g., "Shared Steps", "Testimonial Flow", "Improvement Flow").';
COMMENT ON COLUMN public.flows.flow_type IS 'Flow behavior type: shared (always shown, before branch) or branch (conditional, after branch point).';
COMMENT ON COLUMN public.flows.branch_condition IS 'JSONB branching condition: {field, op, value}. Examples: rating>=4 for testimonial, rating<4 for improvement. NULL for shared flow.';
COMMENT ON COLUMN public.flows.display_order IS 'Order for displaying flows in UI and queries. Convention: shared=0, branches follow (1, 2, ...).';
COMMENT ON COLUMN public.flows.created_at IS 'Timestamp when this flow was first created. Set automatically, never modified.';
COMMENT ON COLUMN public.flows.updated_at IS 'Timestamp of last modification. Automatically updated by database trigger on any column change.';
