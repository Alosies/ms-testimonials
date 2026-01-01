-- =====================================================
-- Update Question Type Icons to Lucide
-- =====================================================
-- Purpose: Fix icons that don't render or look wrong
-- - input_switch: arrow-path-rounded-square -> lucide:toggle-right (toggle icon)
-- - input_checkbox: check-square -> lucide:square-check (checkbox icon)
-- - choice_single: stop-circle -> lucide:circle-dot (radio button style)
-- - choice_multiple: check-circle -> lucide:list-checks (checklist style)

-- Update icons to use lucide icons with full prefix
UPDATE public.question_types SET icon = 'lucide:toggle-right' WHERE unique_name = 'input_switch';
UPDATE public.question_types SET icon = 'lucide:square-check' WHERE unique_name = 'input_checkbox';
UPDATE public.question_types SET icon = 'lucide:circle-dot' WHERE unique_name = 'choice_single';
UPDATE public.question_types SET icon = 'lucide:list-checks' WHERE unique_name = 'choice_multiple';
