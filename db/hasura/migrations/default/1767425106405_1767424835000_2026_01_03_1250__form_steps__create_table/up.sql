-- =====================================================
-- Form Steps Table Creation
-- =====================================================
-- Purpose: Stores step configuration per form for the timeline editor.
--          Each step represents a screen in the testimonial collection flow.
--          Steps can be of different types: welcome, question, rating, consent,
--          contact_info, reward, or thank_you.
-- Dependencies: generate_nanoid_12(), add_updated_at_trigger(), forms, form_questions, organizations, users

CREATE TABLE public.form_steps (
    -- Primary key (NanoID 12-char)
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- Foreign key to the parent form. When form is deleted, all its steps are cascade deleted.
    form_id TEXT NOT NULL,

    -- Foreign key to organization for row-level security. Denormalized from form for query performance.
    organization_id TEXT NOT NULL,

    -- Type of step determining what content/behavior it has.
    -- Allowed values: welcome, question, rating, consent, contact_info, reward, thank_you
    step_type TEXT NOT NULL CHECK (step_type IN (
        'welcome', 'question', 'rating', 'consent',
        'contact_info', 'reward', 'thank_you'
    )),

    -- Zero-indexed position of this step within the form's step sequence.
    -- Used for ordering steps in the timeline editor and submission flow.
    step_order SMALLINT NOT NULL,

    -- Foreign key to form_questions table. Required for 'question' and 'rating' step types
    -- to link to the actual question configuration with validation rules.
    -- Must be NULL for non-question step types (enforced by constraint).
    question_id TEXT,

    -- JSONB content specific to each step_type. Structure varies by type:
    -- welcome: { title, subtitle, buttonText }
    -- consent: { title, description, options: { public: {label, description}, private: {label, description} } }
    -- contact_info: { title, subtitle, enabledFields[], requiredFields[] }
    -- reward: { title, description, rewardType, couponCode?, downloadUrl?, linkUrl? }
    -- thank_you: { title, message, showSocialShare, redirectUrl? }
    -- Empty {} for question/rating types (content is in form_questions table).
    content JSONB NOT NULL DEFAULT '{}',

    -- Array of helpful tips/suggestions shown to customers when answering question/rating steps.
    -- Examples: "Be specific about the problem", "Include metrics if possible"
    tips TEXT[] DEFAULT '{}',

    -- Soft delete flag. When false, step is hidden from the form but preserved for historical data.
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Timestamp when this step was created
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Timestamp when this step was last modified (auto-updated by trigger)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign key to users table. The user who created this step.
    created_by TEXT,

    -- Foreign key to users table. The user who last modified this step.
    updated_by TEXT,

    PRIMARY KEY (id),

    -- Ensure step_order is unique within each form to prevent ordering conflicts
    CONSTRAINT form_steps_form_order_unique UNIQUE (form_id, step_order),

    -- Business rule: question_id is required for question/rating types and must be NULL for others.
    -- This ensures data integrity between step types and their associated question records.
    CONSTRAINT form_steps_question_id_check CHECK (
        (step_type IN ('question', 'rating') AND question_id IS NOT NULL) OR
        (step_type NOT IN ('question', 'rating') AND question_id IS NULL)
    )
);

-- Foreign key: Link to parent form with cascade delete
ALTER TABLE public.form_steps
    ADD CONSTRAINT fk_form_steps_form_id
    FOREIGN KEY (form_id) REFERENCES public.forms(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: Link to organization for RLS (restrict delete to prevent orphans)
ALTER TABLE public.form_steps
    ADD CONSTRAINT fk_form_steps_organization_id
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Foreign key: Link to question configuration (cascade delete when question removed)
ALTER TABLE public.form_steps
    ADD CONSTRAINT fk_form_steps_question_id
    FOREIGN KEY (question_id) REFERENCES public.form_questions(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: Track which user created this step
ALTER TABLE public.form_steps
    ADD CONSTRAINT fk_form_steps_created_by
    FOREIGN KEY (created_by) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign key: Track which user last modified this step
ALTER TABLE public.form_steps
    ADD CONSTRAINT fk_form_steps_updated_by
    FOREIGN KEY (updated_by) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for querying all steps belonging to a form
CREATE INDEX idx_form_steps_form_id ON public.form_steps(form_id);

-- Index for querying steps by question reference
CREATE INDEX idx_form_steps_question_id ON public.form_steps(question_id);

-- Index for organization-based RLS queries
CREATE INDEX idx_form_steps_organization_id ON public.form_steps(organization_id);

-- Composite index for efficient ordered retrieval of steps within a form
CREATE INDEX idx_form_steps_form_order ON public.form_steps(form_id, step_order);

-- Trigger to automatically update updated_at timestamp on any modification
SELECT add_updated_at_trigger('form_steps', 'public');

-- Table-level documentation
COMMENT ON TABLE public.form_steps IS 'Stores step configuration per form for the timeline editor. Each step represents a screen in the testimonial collection flow (welcome, questions, consent, contact info, reward, thank you).';

-- Column-level documentation
COMMENT ON COLUMN public.form_steps.id IS 'Primary key using NanoID 12-character format for URL-safe, collision-resistant unique identification.';
COMMENT ON COLUMN public.form_steps.form_id IS 'Foreign key to forms table. Identifies which form this step belongs to. Cascade deletes when parent form is removed.';
COMMENT ON COLUMN public.form_steps.organization_id IS 'Foreign key to organizations table. Denormalized from form for efficient row-level security queries. Must match form.organization_id.';
COMMENT ON COLUMN public.form_steps.step_type IS 'Enumerated type determining step behavior: welcome (intro screen), question (text input), rating (star/scale), consent (public/private choice), contact_info (submitter details), reward (incentive), thank_you (completion).';
COMMENT ON COLUMN public.form_steps.step_order IS 'Zero-indexed position in the form step sequence. Used for display ordering in timeline editor and submission flow. Unique per form.';
COMMENT ON COLUMN public.form_steps.question_id IS 'Foreign key to form_questions table. Required for question/rating step types to link validation config. Must be NULL for non-question types.';
COMMENT ON COLUMN public.form_steps.content IS 'JSONB payload with type-specific configuration. Structure varies by step_type. Empty for question/rating types which use form_questions table instead.';
COMMENT ON COLUMN public.form_steps.tips IS 'Array of helper text strings shown to customers during question/rating steps. Provides guidance for better quality responses.';
COMMENT ON COLUMN public.form_steps.is_active IS 'Soft delete flag. False hides step from form while preserving data for historical analysis and potential restoration.';
COMMENT ON COLUMN public.form_steps.created_at IS 'Timestamp when this step record was first created. Set automatically, never modified.';
COMMENT ON COLUMN public.form_steps.updated_at IS 'Timestamp of last modification. Automatically updated by database trigger on any column change.';
COMMENT ON COLUMN public.form_steps.created_by IS 'Foreign key to users table. Records which user originally created this step for audit purposes.';
COMMENT ON COLUMN public.form_steps.updated_by IS 'Foreign key to users table. Records which user last modified this step for audit trail.';
