-- =====================================================
-- Question Types - Remove Switch and Checkbox
-- =====================================================

DELETE FROM public.question_types WHERE unique_name = 'input_switch';
DELETE FROM public.question_types WHERE unique_name = 'input_checkbox';
