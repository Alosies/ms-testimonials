-- =====================================================
-- Updated At Trigger Function
-- =====================================================
-- This migration creates utility functions for auto-updating timestamps

-- Create a generic function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the updated_at column exists in the table
    IF TG_TABLE_NAME IS NOT NULL THEN
        -- Set the updated_at column to current timestamp
        NEW.updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Helper Function to Add Updated At Trigger to Any Table
-- =====================================================

-- Function to add updated_at trigger to a table (if updated_at column exists)
CREATE OR REPLACE FUNCTION add_updated_at_trigger(table_name text, schema_name text DEFAULT 'public')
RETURNS boolean AS $$
DECLARE
    column_exists boolean;
    trigger_name text;
    full_table_name text;
BEGIN
    -- Construct full table name
    full_table_name := schema_name || '.' || table_name;
    trigger_name := table_name || '_updated_at_trigger';

    -- Check if updated_at column exists in the specified table
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = add_updated_at_trigger.schema_name
        AND c.table_name = add_updated_at_trigger.table_name
        AND c.column_name = 'updated_at'
    ) INTO column_exists;

    -- If column exists, create the trigger
    IF column_exists THEN
        -- Drop existing trigger if it exists
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', trigger_name, full_table_name);

        -- Create the trigger
        EXECUTE format(
            'CREATE TRIGGER %I
             BEFORE UPDATE ON %s
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column()',
            trigger_name, full_table_name
        );

        RAISE NOTICE 'Added updated_at trigger to table: %', full_table_name;
        RETURN true;
    ELSE
        RAISE NOTICE 'Table % does not have an updated_at column, skipping trigger creation', full_table_name;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Helper Function to Remove Updated At Trigger from Any Table
-- =====================================================

-- Function to remove updated_at trigger from a table
CREATE OR REPLACE FUNCTION remove_updated_at_trigger(table_name text, schema_name text DEFAULT 'public')
RETURNS boolean AS $$
DECLARE
    trigger_name text;
    full_table_name text;
    trigger_exists boolean;
BEGIN
    -- Construct names
    full_table_name := schema_name || '.' || table_name;
    trigger_name := table_name || '_updated_at_trigger';

    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.triggers t
        WHERE t.trigger_schema = remove_updated_at_trigger.schema_name
        AND t.event_object_table = remove_updated_at_trigger.table_name
        AND t.trigger_name = remove_updated_at_trigger.trigger_name
    ) INTO trigger_exists;

    -- If trigger exists, drop it
    IF trigger_exists THEN
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', trigger_name, full_table_name);
        RAISE NOTICE 'Removed updated_at trigger from table: %', full_table_name;
        RETURN true;
    ELSE
        RAISE NOTICE 'No updated_at trigger found on table: %', full_table_name;
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Bulk Operations for All Tables
-- =====================================================

-- Function to add updated_at triggers to all tables that have updated_at column
CREATE OR REPLACE FUNCTION add_updated_at_triggers_to_all_tables(schema_name text DEFAULT 'public')
RETURNS text[] AS $$
DECLARE
    table_record RECORD;
    results text[] := '{}';
    success_count integer := 0;
BEGIN
    -- Find all tables with updated_at column in the specified schema
    FOR table_record IN
        SELECT DISTINCT c.table_name
        FROM information_schema.columns c
        WHERE c.table_schema = add_updated_at_triggers_to_all_tables.schema_name
        AND c.column_name = 'updated_at'
        AND c.table_name NOT LIKE 'pg_%'
        AND c.table_name NOT LIKE 'information_schema%'
    LOOP
        -- Add trigger to each table
        IF add_updated_at_trigger(table_record.table_name, schema_name) THEN
            results := array_append(results, table_record.table_name);
            success_count := success_count + 1;
        END IF;
    END LOOP;

    RAISE NOTICE 'Added updated_at triggers to % tables', success_count;
    RETURN results;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Generic trigger function to update updated_at column with current timestamp';
COMMENT ON FUNCTION add_updated_at_trigger(text, text) IS 'Add updated_at trigger to a specific table if it has updated_at column';
COMMENT ON FUNCTION remove_updated_at_trigger(text, text) IS 'Remove updated_at trigger from a specific table';
COMMENT ON FUNCTION add_updated_at_triggers_to_all_tables(text) IS 'Add updated_at triggers to all tables in schema that have updated_at column';

-- =====================================================
-- Usage Examples (commented out)
-- =====================================================

-- Example usage:
-- SELECT add_updated_at_trigger('users');
-- SELECT add_updated_at_trigger('forms', 'public');
-- SELECT remove_updated_at_trigger('users');
-- SELECT add_updated_at_triggers_to_all_tables();
-- SELECT add_updated_at_triggers_to_all_tables('public');
