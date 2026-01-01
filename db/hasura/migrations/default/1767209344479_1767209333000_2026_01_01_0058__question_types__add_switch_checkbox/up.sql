-- =====================================================
-- Question Types - Add Switch and Checkbox (Boolean Types)
-- =====================================================
-- Purpose: Add boolean field types following Fillout's pattern
--   - input_switch: On/Off toggle for newsletter, permissions
--   - input_checkbox: Agreement/consent checkboxes

INSERT INTO public.question_types (
    unique_name, name, category, description, input_component, answer_data_type,
    supports_min_length, supports_max_length, supports_min_value, supports_max_value,
    supports_pattern, supports_options, supports_file_types, supports_max_file_size,
    default_min_value, default_max_value, display_order, icon
) VALUES
    ('input_switch', 'Switch', 'input', 'On/Off toggle switch', 'SwitchInput', 'boolean',
     false, false, false, false, false, false, false, false, NULL, NULL, 42, 'arrow-path-rounded-square'),
    ('input_checkbox', 'Checkbox', 'input', 'Agreement or consent checkbox', 'CheckboxInput', 'boolean',
     false, false, false, false, false, false, false, false, NULL, NULL, 43, 'check-square');
