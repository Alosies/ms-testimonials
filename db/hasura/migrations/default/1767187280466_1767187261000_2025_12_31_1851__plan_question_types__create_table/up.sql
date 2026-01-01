-- =====================================================
-- Plan Question Types Table Creation
-- =====================================================
-- Purpose: Junction table mapping plans to question_types for plan-based feature access control
-- Dependencies: plans, question_types, users tables

-- Create table
CREATE TABLE public.plan_question_types (
    -- Primary key (NanoID)
    id TEXT NOT NULL DEFAULT generate_nanoid_12(),

    -- Business fields
    plan_id TEXT NOT NULL,
    question_type_id TEXT NOT NULL,

    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT NULL,
    updated_by TEXT NULL,

    PRIMARY KEY (id)
);

-- Foreign keys
ALTER TABLE public.plan_question_types
    ADD CONSTRAINT plan_question_types_plan_fk
    FOREIGN KEY (plan_id) REFERENCES public.plans(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.plan_question_types
    ADD CONSTRAINT plan_question_types_question_type_fk
    FOREIGN KEY (question_type_id) REFERENCES public.question_types(id)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public.plan_question_types
    ADD CONSTRAINT plan_question_types_created_by_fk
    FOREIGN KEY (created_by) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.plan_question_types
    ADD CONSTRAINT plan_question_types_updated_by_fk
    FOREIGN KEY (updated_by) REFERENCES public.users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Unique constraint (plan + question_type combination must be unique)
ALTER TABLE public.plan_question_types
    ADD CONSTRAINT plan_question_types_unique
    UNIQUE (plan_id, question_type_id);

-- Indexes
CREATE INDEX idx_plan_question_types_plan_id ON public.plan_question_types(plan_id);
CREATE INDEX idx_plan_question_types_question_type_id ON public.plan_question_types(question_type_id);

-- Trigger for updated_at
SELECT add_updated_at_trigger('plan_question_types', 'public');

-- Documentation
COMMENT ON TABLE public.plan_question_types IS 'Junction table mapping plans to question_types - controls which question types are available per plan';
COMMENT ON COLUMN public.plan_question_types.id IS 'Primary key (NanoID 12-char)';
COMMENT ON COLUMN public.plan_question_types.plan_id IS 'FK to plans - the subscription plan';
COMMENT ON COLUMN public.plan_question_types.question_type_id IS 'FK to question_types - the question type available in this plan';
COMMENT ON COLUMN public.plan_question_types.created_at IS 'Timestamp when mapping was created';
COMMENT ON COLUMN public.plan_question_types.updated_at IS 'Timestamp when mapping was last modified';
COMMENT ON COLUMN public.plan_question_types.created_by IS 'User who created the mapping (FK to users)';
COMMENT ON COLUMN public.plan_question_types.updated_by IS 'User who last modified the mapping (FK to users)';

-- =====================================================
-- Seed Data
-- =====================================================
-- Audit user: alosies@gmail.com (id: 64CEjXjqSXST)

-- Free plan: Basic text and rating types (4 types)
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'free'
  AND qt.unique_name IN ('text_short', 'text_long', 'rating_star', 'special_consent');

-- Pro plan: All free types + choice types + additional text/rating (9 types)
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'pro'
  AND qt.unique_name IN (
    'text_short', 'text_long', 'text_email', 'text_url',
    'rating_star', 'rating_nps',
    'choice_single', 'choice_multiple',
    'special_consent'
  );

-- Team plan: All active types (full access)
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'team'
  AND qt.is_active = true;
