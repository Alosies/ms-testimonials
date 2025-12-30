-- =====================================================
-- Question Types Table Creation (Seed/Reference Data)
-- =====================================================
-- Purpose: Defines available question types with validation rules
-- Dependencies: nanoid utility-function

CREATE TABLE public.question_types (
    -- Primary key
    id                  TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

    -- Type identity
    unique_name         VARCHAR(50) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    category            VARCHAR(30) NOT NULL,
    description         TEXT,

    -- Frontend mapping
    input_component     VARCHAR(50) NOT NULL,
    answer_data_type    VARCHAR(20) NOT NULL,

    -- Validation rule applicability flags
    supports_min_length     BOOLEAN NOT NULL DEFAULT false,
    supports_max_length     BOOLEAN NOT NULL DEFAULT false,
    supports_min_value      BOOLEAN NOT NULL DEFAULT false,
    supports_max_value      BOOLEAN NOT NULL DEFAULT false,
    supports_pattern        BOOLEAN NOT NULL DEFAULT false,
    supports_options        BOOLEAN NOT NULL DEFAULT false,
    supports_file_types     BOOLEAN NOT NULL DEFAULT false,
    supports_max_file_size  BOOLEAN NOT NULL DEFAULT false,

    -- Default values
    default_min_value   INTEGER,
    default_max_value   INTEGER,

    -- State & display
    is_active           BOOLEAN NOT NULL DEFAULT true,
    display_order       SMALLINT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT question_types_unique_name_unique UNIQUE (unique_name),
    CONSTRAINT question_types_category_check
        CHECK (category IN ('text', 'rating', 'choice', 'media', 'special')),
    CONSTRAINT question_types_answer_type_check
        CHECK (answer_data_type IN ('text', 'integer', 'boolean', 'decimal', 'json', 'url'))
);

-- Indexes
CREATE INDEX idx_question_types_category ON public.question_types(category);

-- Table comment
COMMENT ON TABLE public.question_types IS 'Question type definitions - seed data, system-defined, not user-modifiable';

-- Column comments
COMMENT ON COLUMN public.question_types.id IS 'Primary key - NanoID 12-char unique identifier';
COMMENT ON COLUMN public.question_types.unique_name IS 'Code identifier for type lookups (text_short, rating_star). Use in code comparisons';
COMMENT ON COLUMN public.question_types.name IS 'Display label for UI (Short Text, Star Rating). Human-readable';
COMMENT ON COLUMN public.question_types.category IS 'Type grouping: text, rating, choice, media, special. Used for UI organization';
COMMENT ON COLUMN public.question_types.description IS 'Brief explanation of type purpose shown in form builder tooltip';
COMMENT ON COLUMN public.question_types.input_component IS 'Vue component name for rendering (TextInput, StarRating). Maps to frontend';
COMMENT ON COLUMN public.question_types.answer_data_type IS 'Data type for storing answers: text, integer, boolean, decimal, json, url';
COMMENT ON COLUMN public.question_types.supports_min_length IS 'Whether min_length validation is applicable (true for text types)';
COMMENT ON COLUMN public.question_types.supports_max_length IS 'Whether max_length validation is applicable (true for text types)';
COMMENT ON COLUMN public.question_types.supports_min_value IS 'Whether min_value validation is applicable (true for rating types)';
COMMENT ON COLUMN public.question_types.supports_max_value IS 'Whether max_value validation is applicable (true for rating types)';
COMMENT ON COLUMN public.question_types.supports_pattern IS 'Whether regex validation is applicable (true for email, URL types)';
COMMENT ON COLUMN public.question_types.supports_options IS 'Whether predefined choices are applicable (true for choice types)';
COMMENT ON COLUMN public.question_types.supports_file_types IS 'Whether file type restrictions are applicable (true for media types)';
COMMENT ON COLUMN public.question_types.supports_max_file_size IS 'Whether file size limit is applicable (true for media types)';
COMMENT ON COLUMN public.question_types.default_min_value IS 'Default minimum value when creating question (e.g., 1 for star rating)';
COMMENT ON COLUMN public.question_types.default_max_value IS 'Default maximum value when creating question (e.g., 5 for star rating, 10 for NPS)';
COMMENT ON COLUMN public.question_types.is_active IS 'Whether type is available for new questions. False hides from form builder';
COMMENT ON COLUMN public.question_types.display_order IS 'Order in form builder type picker. Lower = appears first';
COMMENT ON COLUMN public.question_types.created_at IS 'Timestamp when type was seeded. Immutable';

-- =====================================================
-- Seed Data
-- =====================================================

INSERT INTO public.question_types (
    unique_name, name, category, description, input_component, answer_data_type,
    supports_min_length, supports_max_length, supports_min_value, supports_max_value,
    supports_pattern, supports_options, supports_file_types, supports_max_file_size,
    default_min_value, default_max_value, display_order
) VALUES
    -- Text types
    ('text_short', 'Short Text', 'text', 'Single line text input', 'TextInput', 'text',
     true, true, false, false, true, false, false, false, NULL, NULL, 1),
    ('text_long', 'Long Text', 'text', 'Multi-line textarea', 'TextArea', 'text',
     true, true, false, false, false, false, false, false, NULL, NULL, 2),
    ('text_email', 'Email', 'text', 'Email with validation', 'EmailInput', 'text',
     false, true, false, false, true, false, false, false, NULL, NULL, 3),
    ('text_url', 'URL', 'text', 'URL with validation', 'UrlInput', 'url',
     false, true, false, false, true, false, false, false, NULL, NULL, 4),

    -- Rating types
    ('rating_star', 'Star Rating', 'rating', '1-5 star rating', 'StarRating', 'integer',
     false, false, true, true, false, false, false, false, 1, 5, 10),
    ('rating_nps', 'NPS Score', 'rating', '0-10 Net Promoter Score', 'NpsRating', 'integer',
     false, false, true, true, false, false, false, false, 0, 10, 11),
    ('rating_scale', 'Scale', 'rating', 'Numeric scale with custom range', 'ScaleRating', 'integer',
     false, false, true, true, false, false, false, false, 1, 10, 12),

    -- Choice types
    ('choice_single', 'Single Choice', 'choice', 'Radio button selection', 'RadioGroup', 'text',
     false, false, false, false, false, true, false, false, NULL, NULL, 20),
    ('choice_multiple', 'Multiple Choice', 'choice', 'Checkbox selection', 'CheckboxGroup', 'json',
     false, false, true, true, false, true, false, false, NULL, NULL, 21),
    ('choice_dropdown', 'Dropdown', 'choice', 'Dropdown selection', 'SelectInput', 'text',
     false, false, false, false, false, true, false, false, NULL, NULL, 22),

    -- Media types (Post-MVP)
    ('media_image', 'Image Upload', 'media', 'Image file upload', 'ImageUpload', 'url',
     false, false, false, false, false, false, true, true, NULL, NULL, 30),
    ('media_video', 'Video Upload', 'media', 'Video file upload', 'VideoUpload', 'url',
     false, false, false, false, false, false, true, true, NULL, NULL, 31),

    -- Special types
    ('special_consent', 'Consent', 'special', 'Permission checkbox', 'ConsentCheckbox', 'boolean',
     false, false, false, false, false, false, false, false, NULL, NULL, 40),
    ('special_hidden', 'Hidden Field', 'special', 'Hidden value (tracking)', 'HiddenInput', 'text',
     false, true, false, false, false, false, false, false, NULL, NULL, 41);
