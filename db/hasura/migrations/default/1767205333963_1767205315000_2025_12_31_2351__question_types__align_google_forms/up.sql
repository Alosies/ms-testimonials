-- =====================================================
-- Question Types - Align with Google Forms Standard
-- =====================================================
-- Purpose: Restructure question_types to align with Google Forms field types,
--          add icon column, and remove obsolete types
-- Changes:
--   1. Add icon column for heroicons icon names
--   2. Update category constraint to include 'input'
--   3. Update existing rows with new names, icons, display_order
--   4. Rename media_image -> media_file
--   5. Insert new types: input_date, input_time
--   6. Delete: rating_nps, special_consent

-- =====================================================
-- 1. Add icon column
-- =====================================================
ALTER TABLE public.question_types
ADD COLUMN icon VARCHAR(50);

COMMENT ON COLUMN public.question_types.icon IS 'Heroicons icon name for form builder UI (e.g., minus, star, calendar)';

-- =====================================================
-- 2. Update category constraint to include 'input'
-- =====================================================
ALTER TABLE public.question_types
DROP CONSTRAINT question_types_category_check;

ALTER TABLE public.question_types
ADD CONSTRAINT question_types_category_check
CHECK (category IN ('text', 'rating', 'choice', 'media', 'special', 'input'));

-- =====================================================
-- 3. Delete obsolete types (before updates to avoid conflicts)
-- =====================================================
DELETE FROM public.question_types WHERE unique_name = 'rating_nps';
DELETE FROM public.question_types WHERE unique_name = 'special_consent';

-- =====================================================
-- 4. Update existing rows with new names, icons, display_order
-- =====================================================

-- Text types
UPDATE public.question_types SET
    name = 'Short answer',
    description = 'Single line text input',
    icon = 'minus',
    display_order = 1
WHERE unique_name = 'text_short';

UPDATE public.question_types SET
    name = 'Paragraph',
    description = 'Multi-line text input',
    icon = 'bars-3-bottom-left',
    display_order = 2
WHERE unique_name = 'text_long';

UPDATE public.question_types SET
    name = 'Email',
    description = 'Email address with validation',
    icon = 'envelope',
    display_order = 3
WHERE unique_name = 'text_email';

UPDATE public.question_types SET
    name = 'URL',
    description = 'Web address with validation',
    icon = 'link',
    display_order = 4
WHERE unique_name = 'text_url';

-- Choice types
UPDATE public.question_types SET
    name = 'Multiple choice',
    description = 'Single selection from options',
    icon = 'stop-circle',
    display_order = 10
WHERE unique_name = 'choice_single';

UPDATE public.question_types SET
    name = 'Checkboxes',
    description = 'Multiple selection from options',
    icon = 'check-circle',
    display_order = 11
WHERE unique_name = 'choice_multiple';

UPDATE public.question_types SET
    name = 'Dropdown',
    description = 'Single selection from dropdown',
    icon = 'chevron-up-down',
    display_order = 12
WHERE unique_name = 'choice_dropdown';

-- Rating types
UPDATE public.question_types SET
    name = 'Star rating',
    description = '1-5 star rating',
    icon = 'star',
    display_order = 20
WHERE unique_name = 'rating_star';

UPDATE public.question_types SET
    name = 'Linear scale',
    description = 'Numeric scale (e.g., 1-10)',
    icon = 'ellipsis-horizontal',
    display_order = 21
WHERE unique_name = 'rating_scale';

-- Media types
-- Rename media_image to media_file (generic file upload)
UPDATE public.question_types SET
    unique_name = 'media_file',
    name = 'File upload',
    description = 'Upload files (images, documents)',
    input_component = 'FileUpload',
    icon = 'cloud-arrow-up',
    display_order = 30
WHERE unique_name = 'media_image';

UPDATE public.question_types SET
    name = 'Video',
    description = 'Upload video files',
    icon = 'video-camera',
    display_order = 31
WHERE unique_name = 'media_video';

-- Special types
UPDATE public.question_types SET
    name = 'Hidden field',
    description = 'Hidden value for tracking',
    icon = 'eye-slash',
    display_order = 50
WHERE unique_name = 'special_hidden';

-- =====================================================
-- 5. Insert new types: Date and Time
-- =====================================================
INSERT INTO public.question_types (
    unique_name, name, category, description, input_component, answer_data_type,
    supports_min_length, supports_max_length, supports_min_value, supports_max_value,
    supports_pattern, supports_options, supports_file_types, supports_max_file_size,
    default_min_value, default_max_value, display_order, icon
) VALUES
    ('input_date', 'Date', 'input', 'Date picker', 'DatePicker', 'text',
     false, false, false, false, false, false, false, false, NULL, NULL, 40, 'calendar'),
    ('input_time', 'Time', 'input', 'Time picker', 'TimePicker', 'text',
     false, false, false, false, false, false, false, false, NULL, NULL, 41, 'clock');
