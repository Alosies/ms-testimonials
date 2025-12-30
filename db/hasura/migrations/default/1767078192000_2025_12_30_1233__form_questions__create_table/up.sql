-- =====================================================
-- Form Questions Table Creation
-- =====================================================
-- Purpose: Questions linked to forms with typed validation rules
-- Dependencies: nanoid, updated_at, organizations, forms, question_types, users

CREATE TABLE public.form_questions (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & relationships
    organization_id     TEXT NOT NULL,
    form_id             TEXT NOT NULL,
    question_type_id    TEXT NOT NULL,

    -- Question content
    question_key        VARCHAR(50) NOT NULL,
    question_text       TEXT NOT NULL,
    placeholder         TEXT,
    help_text           TEXT,

    -- Display
    display_order       SMALLINT NOT NULL,

    -- Validation rules
    is_required         BOOLEAN NOT NULL DEFAULT true,
    min_length          INTEGER,
    max_length          INTEGER,
    min_value           INTEGER,
    max_value           INTEGER,
    validation_pattern  TEXT,

    -- File upload rules (Post-MVP)
    allowed_file_types  TEXT[],
    max_file_size_kb    INTEGER,

    -- State & audit
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          TEXT,

    -- Constraints
    CONSTRAINT form_questions_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_form_fk
        FOREIGN KEY (form_id) REFERENCES public.forms(id) ON DELETE CASCADE,
    CONSTRAINT form_questions_type_fk
        FOREIGN KEY (question_type_id) REFERENCES public.question_types(id) ON DELETE RESTRICT,
    CONSTRAINT form_questions_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT form_questions_key_per_form_unique
        UNIQUE (form_id, question_key),
    CONSTRAINT form_questions_order_per_form_unique
        UNIQUE (form_id, display_order),
    CONSTRAINT form_questions_key_format
        CHECK (question_key ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT form_questions_length_check
        CHECK (min_length IS NULL OR max_length IS NULL OR min_length <= max_length),
    CONSTRAINT form_questions_value_check
        CHECK (min_value IS NULL OR max_value IS NULL OR min_value <= max_value)
);

-- Indexes
CREATE INDEX idx_form_questions_org ON public.form_questions(organization_id);
CREATE INDEX idx_form_questions_form ON public.form_questions(form_id);
CREATE INDEX idx_form_questions_type ON public.form_questions(question_type_id);
CREATE INDEX idx_form_questions_order ON public.form_questions(form_id, display_order);

-- Trigger
SELECT add_updated_at_trigger('form_questions', 'public');

-- Table comment
COMMENT ON TABLE public.form_questions IS 'Form questions with typed validation - explicit columns, not JSONB';

-- Column comments
COMMENT ON COLUMN public.form_questions.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.form_questions.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN public.form_questions.form_id IS 'FK to forms - parent form this question belongs to';
COMMENT ON COLUMN public.form_questions.question_type_id IS 'FK to question_types - determines input component and applicable validation rules';
COMMENT ON COLUMN public.form_questions.question_key IS 'Semantic identifier unique per form (problem, solution, result, name, email). Used for answer lookup';
COMMENT ON COLUMN public.form_questions.question_text IS 'Display text shown to customer (e.g., "What problem were you trying to solve?")';
COMMENT ON COLUMN public.form_questions.placeholder IS 'Input placeholder hint (e.g., "Describe your challenge...")';
COMMENT ON COLUMN public.form_questions.help_text IS 'Tooltip help text explaining what kind of answer is expected';
COMMENT ON COLUMN public.form_questions.display_order IS 'Order in which question appears on form. Unique per form, starts at 1';
COMMENT ON COLUMN public.form_questions.is_required IS 'Whether answer is mandatory. Validation enforced on submission';
COMMENT ON COLUMN public.form_questions.min_length IS 'Minimum character count for text answers. NULL = no minimum. Only for text types';
COMMENT ON COLUMN public.form_questions.max_length IS 'Maximum character count for text answers. NULL = no maximum. Only for text types';
COMMENT ON COLUMN public.form_questions.min_value IS 'Minimum numeric value for rating answers. Used with rating types (e.g., 1 for stars)';
COMMENT ON COLUMN public.form_questions.max_value IS 'Maximum numeric value for rating answers. Used with rating types (e.g., 5 for stars, 10 for NPS)';
COMMENT ON COLUMN public.form_questions.validation_pattern IS 'Regex pattern for text validation. Used for email, URL, or custom format validation';
COMMENT ON COLUMN public.form_questions.allowed_file_types IS 'Array of allowed MIME types for file uploads. Post-MVP';
COMMENT ON COLUMN public.form_questions.max_file_size_kb IS 'Maximum file size in kilobytes for uploads. Post-MVP';
COMMENT ON COLUMN public.form_questions.is_active IS 'Soft delete flag. False = question hidden from form but answers preserved';
COMMENT ON COLUMN public.form_questions.created_at IS 'Timestamp when question was created. Immutable after insert';
COMMENT ON COLUMN public.form_questions.updated_at IS 'Timestamp of last modification. Auto-updated by trigger';
COMMENT ON COLUMN public.form_questions.updated_by IS 'FK to users - who last modified. NULL until first update';
