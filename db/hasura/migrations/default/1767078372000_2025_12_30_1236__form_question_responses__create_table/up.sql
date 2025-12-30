-- =====================================================
-- Form Question Responses Table Creation
-- =====================================================
-- Purpose: Raw form submission responses (internal data, not displayed)
-- Dependencies: nanoid, updated_at, organizations, form_submissions, form_questions, users

CREATE TABLE public.form_question_responses (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Ownership & relationships
    organization_id     TEXT NOT NULL,
    submission_id       TEXT NOT NULL,
    question_id         TEXT NOT NULL,

    -- Typed answer columns (use based on question_type.answer_data_type)
    answer_text         TEXT,
    answer_integer      INTEGER,
    answer_boolean      BOOLEAN,
    answer_json         JSONB,
    answer_url          TEXT,

    -- Audit: who & when
    answered_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          TEXT,

    -- Constraints
    CONSTRAINT form_question_responses_org_fk
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
    CONSTRAINT form_question_responses_submission_fk
        FOREIGN KEY (submission_id) REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    CONSTRAINT form_question_responses_question_fk
        FOREIGN KEY (question_id) REFERENCES public.form_questions(id) ON DELETE CASCADE,
    CONSTRAINT form_question_responses_unique
        UNIQUE (submission_id, question_id),
    CONSTRAINT form_question_responses_updated_by_fk
        FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT form_question_responses_has_value
        CHECK (
            answer_text IS NOT NULL OR
            answer_integer IS NOT NULL OR
            answer_boolean IS NOT NULL OR
            answer_json IS NOT NULL OR
            answer_url IS NOT NULL
        )
);

-- Indexes
CREATE INDEX idx_form_question_responses_org ON public.form_question_responses(organization_id);
CREATE INDEX idx_form_question_responses_submission ON public.form_question_responses(submission_id);
CREATE INDEX idx_form_question_responses_question ON public.form_question_responses(question_id);
CREATE INDEX idx_form_question_responses_rating
    ON public.form_question_responses(question_id, answer_integer)
    WHERE answer_integer IS NOT NULL;

-- Trigger
SELECT add_updated_at_trigger('form_question_responses', 'public');

-- Table comment
COMMENT ON TABLE public.form_question_responses IS 'Raw form submission responses - internal data for AI assembly, not displayed on widgets';

-- Column comments
COMMENT ON COLUMN public.form_question_responses.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.form_question_responses.organization_id IS 'FK to organizations - tenant boundary for Hasura row-level permissions';
COMMENT ON COLUMN public.form_question_responses.submission_id IS 'FK to form_submissions - parent submission this response belongs to';
COMMENT ON COLUMN public.form_question_responses.question_id IS 'FK to form_questions - which question this responds to';
COMMENT ON COLUMN public.form_question_responses.answer_text IS 'Text responses: short text, long text, email, single choice value, dropdown value';
COMMENT ON COLUMN public.form_question_responses.answer_integer IS 'Numeric responses: star rating (1-5), NPS score (0-10), scale value';
COMMENT ON COLUMN public.form_question_responses.answer_boolean IS 'Boolean responses: consent checkbox (true = agreed)';
COMMENT ON COLUMN public.form_question_responses.answer_json IS 'JSON responses: multiple choice selected values array ["opt_a", "opt_c"]';
COMMENT ON COLUMN public.form_question_responses.answer_url IS 'URL responses: uploaded file URL, or validated URL input';
COMMENT ON COLUMN public.form_question_responses.answered_at IS 'When customer submitted this specific response';
COMMENT ON COLUMN public.form_question_responses.created_at IS 'Record creation timestamp. Usually same as answered_at';
COMMENT ON COLUMN public.form_question_responses.updated_at IS 'Last modification timestamp. Auto-updated by trigger';
COMMENT ON COLUMN public.form_question_responses.updated_by IS 'FK to users - who last modified. NULL until first update';
