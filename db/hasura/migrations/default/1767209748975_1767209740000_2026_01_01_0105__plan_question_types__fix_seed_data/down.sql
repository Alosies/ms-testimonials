-- =====================================================
-- Plan Question Types - Rollback Seed Data Fix
-- =====================================================
-- Reverses changes from up.sql

-- =====================================================
-- 1. TEAM plan: Remove new types
-- =====================================================
DELETE FROM plan_question_types
WHERE plan_id = (SELECT id FROM plans WHERE unique_name = 'team')
  AND question_type_id IN (
    SELECT id FROM question_types WHERE unique_name IN ('input_date', 'input_time', 'input_switch', 'input_checkbox')
  );

-- =====================================================
-- 2. PRO plan: Remove rating_scale, input_switch, input_checkbox
-- =====================================================
DELETE FROM plan_question_types
WHERE plan_id = (SELECT id FROM plans WHERE unique_name = 'pro')
  AND question_type_id IN (
    SELECT id FROM question_types WHERE unique_name IN ('rating_scale', 'input_switch', 'input_checkbox')
  );

-- =====================================================
-- 3. PRO plan: Re-add text_url
-- =====================================================
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'pro'
  AND qt.unique_name = 'text_url';

-- =====================================================
-- 4. FREE plan: Remove input_checkbox
-- =====================================================
DELETE FROM plan_question_types
WHERE plan_id = (SELECT id FROM plans WHERE unique_name = 'free')
  AND question_type_id = (SELECT id FROM question_types WHERE unique_name = 'input_checkbox');
