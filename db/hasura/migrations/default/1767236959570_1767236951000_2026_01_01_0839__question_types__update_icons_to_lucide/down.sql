-- =====================================================
-- Rollback Question Type Icons to Heroicons
-- =====================================================

-- Revert to original heroicons icon names
UPDATE public.question_types SET icon = 'arrow-path-rounded-square' WHERE unique_name = 'input_switch';
UPDATE public.question_types SET icon = 'check-square' WHERE unique_name = 'input_checkbox';
UPDATE public.question_types SET icon = 'stop-circle' WHERE unique_name = 'choice_single';
UPDATE public.question_types SET icon = 'check-circle' WHERE unique_name = 'choice_multiple';
