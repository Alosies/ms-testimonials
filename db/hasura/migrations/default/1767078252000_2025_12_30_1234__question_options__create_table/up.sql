-- =====================================================
-- Question Options Table Creation
-- =====================================================
-- Purpose: Predefined choices for choice-type questions
-- Dependencies: nanoid, organizations, form_questions, users

CREATE TABLE public.question_options (
    -- Primary key
    id              TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & relationship
    organization_id TEXT NOT NULL,
    question_id     TEXT NOT NULL,

    -- Option content
    option_value    VARCHAR(100) NOT NULL,
    option_label    TEXT NOT NULL,

    -- Display & defaults
    display_order   SMALLINT NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT false,

    -- State & audit
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      TEXT NOT NULL,

    -- Constraints
    CONSTRAINT question_options_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT question_options_question_fk
        FOREIGN KEY (question_id) REFERENCES public.form_questions(id) ON DELETE CASCADE,
    CONSTRAINT question_options_created_by_fk
        FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT question_options_value_per_question_unique
        UNIQUE (question_id, option_value),
    CONSTRAINT question_options_order_per_question_unique
        UNIQUE (question_id, display_order)
);

-- Indexes
CREATE INDEX idx_question_options_org ON public.question_options(organization_id);
CREATE INDEX idx_question_options_question ON public.question_options(question_id);
CREATE INDEX idx_question_options_order ON public.question_options(question_id, display_order);

-- Table comment
COMMENT ON TABLE public.question_options IS 'Predefined choices for choice-type questions (radio, checkbox, dropdown)';

-- Column comments
COMMENT ON COLUMN public.question_options.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.question_options.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN public.question_options.question_id IS 'FK to form_questions - must be a choice-type question';
COMMENT ON COLUMN public.question_options.option_value IS 'Stored value saved in form_question_responses (e.g., "yes", "no", "maybe")';
COMMENT ON COLUMN public.question_options.option_label IS 'Display text shown to customer (e.g., "Yes, definitely!", "Not right now")';
COMMENT ON COLUMN public.question_options.display_order IS 'Order in option list. Unique per question, starts at 1';
COMMENT ON COLUMN public.question_options.is_default IS 'Pre-selected when form loads. Only one per question should be true';
COMMENT ON COLUMN public.question_options.is_active IS 'Soft delete flag. False = option hidden but existing answers preserved';
COMMENT ON COLUMN public.question_options.created_at IS 'Timestamp when option was created. Immutable after insert';
COMMENT ON COLUMN public.question_options.created_by IS 'FK to users - user who created this option';
