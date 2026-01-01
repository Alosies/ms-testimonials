-- =====================================================
-- Question Types - Rollback Google Forms Alignment
-- =====================================================
-- Reverses all changes from up.sql

-- =====================================================
-- 1. Delete new types (Date, Time)
-- =====================================================
DELETE FROM public.question_types WHERE unique_name = 'input_date';
DELETE FROM public.question_types WHERE unique_name = 'input_time';

-- =====================================================
-- 2. Restore original values for existing types
-- =====================================================

-- Text types
UPDATE public.question_types SET
    name = 'Short Text',
    description = 'Single line text input',
    icon = NULL,
    display_order = 1
WHERE unique_name = 'text_short';

UPDATE public.question_types SET
    name = 'Long Text',
    description = 'Multi-line textarea',
    icon = NULL,
    display_order = 2
WHERE unique_name = 'text_long';

UPDATE public.question_types SET
    name = 'Email',
    description = 'Email with validation',
    icon = NULL,
    display_order = 3
WHERE unique_name = 'text_email';

UPDATE public.question_types SET
    name = 'URL',
    description = 'URL with validation',
    icon = NULL,
    display_order = 4
WHERE unique_name = 'text_url';

-- Choice types
UPDATE public.question_types SET
    name = 'Single Choice',
    description = 'Radio button selection',
    icon = NULL,
    display_order = 20
WHERE unique_name = 'choice_single';

UPDATE public.question_types SET
    name = 'Multiple Choice',
    description = 'Checkbox selection',
    icon = NULL,
    display_order = 21
WHERE unique_name = 'choice_multiple';

UPDATE public.question_types SET
    name = 'Dropdown',
    description = 'Dropdown selection',
    icon = NULL,
    display_order = 22
WHERE unique_name = 'choice_dropdown';

-- Rating types
UPDATE public.question_types SET
    name = 'Star Rating',
    description = '1-5 star rating',
    icon = NULL,
    display_order = 10
WHERE unique_name = 'rating_star';

UPDATE public.question_types SET
    name = 'Scale',
    description = 'Numeric scale with custom range',
    icon = NULL,
    display_order = 12
WHERE unique_name = 'rating_scale';

-- Media types - Rename media_file back to media_image
UPDATE public.question_types SET
    unique_name = 'media_image',
    name = 'Image Upload',
    description = 'Image file upload',
    input_component = 'ImageUpload',
    icon = NULL,
    display_order = 30
WHERE unique_name = 'media_file';

UPDATE public.question_types SET
    name = 'Video Upload',
    description = 'Video file upload',
    icon = NULL,
    display_order = 31
WHERE unique_name = 'media_video';

-- Special types
UPDATE public.question_types SET
    name = 'Hidden Field',
    description = 'Hidden value (tracking)',
    icon = NULL,
    display_order = 41
WHERE unique_name = 'special_hidden';

-- =====================================================
-- 3. Re-insert deleted types (rating_nps, special_consent)
-- =====================================================
INSERT INTO public.question_types (
    unique_name, name, category, description, input_component, answer_data_type,
    supports_min_length, supports_max_length, supports_min_value, supports_max_value,
    supports_pattern, supports_options, supports_file_types, supports_max_file_size,
    default_min_value, default_max_value, display_order, icon
) VALUES
    ('rating_nps', 'NPS Score', 'rating', '0-10 Net Promoter Score', 'NpsRating', 'integer',
     false, false, true, true, false, false, false, false, 0, 10, 11, NULL),
    ('special_consent', 'Consent', 'special', 'Permission checkbox', 'ConsentCheckbox', 'boolean',
     false, false, false, false, false, false, false, false, NULL, NULL, 40, NULL);

-- =====================================================
-- 4. Restore category constraint (remove 'input')
-- =====================================================
ALTER TABLE public.question_types
DROP CONSTRAINT question_types_category_check;

ALTER TABLE public.question_types
ADD CONSTRAINT question_types_category_check
CHECK (category IN ('text', 'rating', 'choice', 'media', 'special'));

-- =====================================================
-- 5. Drop icon column
-- =====================================================
ALTER TABLE public.question_types
DROP COLUMN icon;
