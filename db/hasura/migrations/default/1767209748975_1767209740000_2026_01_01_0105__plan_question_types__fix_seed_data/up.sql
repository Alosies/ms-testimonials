-- =====================================================
-- Plan Question Types - Fix Seed Data
-- =====================================================
-- Purpose: Align plan_question_types with updated plan breakdown
--
-- Target state:
--   Free (4): text_short, text_long, rating_star, input_checkbox
--   Pro (9): Free + text_email, choice_single, choice_multiple, rating_scale, input_switch
--   Team (16): All types
--
-- Changes:
--   FREE: Add input_checkbox
--   PRO: Remove text_url, Add rating_scale, input_switch
--   TEAM: Add input_date, input_time, input_switch, input_checkbox

-- Audit user: alosies@gmail.com (id: 64CEjXjqSXST)

-- =====================================================
-- 1. FREE plan: Add input_checkbox
-- =====================================================
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'free'
  AND qt.unique_name = 'input_checkbox';

-- =====================================================
-- 2. PRO plan: Remove text_url (should be Team only)
-- =====================================================
DELETE FROM plan_question_types
WHERE plan_id = (SELECT id FROM plans WHERE unique_name = 'pro')
  AND question_type_id = (SELECT id FROM question_types WHERE unique_name = 'text_url');

-- =====================================================
-- 3. PRO plan: Add rating_scale, input_switch, input_checkbox
-- =====================================================
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'pro'
  AND qt.unique_name IN ('rating_scale', 'input_switch', 'input_checkbox');

-- =====================================================
-- 4. TEAM plan: Add new types (input_date, input_time, input_switch, input_checkbox)
-- =====================================================
INSERT INTO plan_question_types (plan_id, question_type_id, created_by, updated_by)
SELECT p.id, qt.id, '64CEjXjqSXST', '64CEjXjqSXST'
FROM plans p, question_types qt
WHERE p.unique_name = 'team'
  AND qt.unique_name IN ('input_date', 'input_time', 'input_switch', 'input_checkbox');
