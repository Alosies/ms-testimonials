-- =====================================================
-- Remove Updated At Trigger Functions
-- =====================================================

-- Note: This migration removes the trigger functions.
-- Any existing triggers created with these functions will need to be
-- manually removed from specific tables if needed.

-- Remove all helper functions
DROP FUNCTION IF EXISTS add_updated_at_triggers_to_all_tables;
DROP FUNCTION IF EXISTS remove_updated_at_trigger;
DROP FUNCTION IF EXISTS add_updated_at_trigger;

-- Remove the main trigger function
DROP FUNCTION IF EXISTS update_updated_at_column;
