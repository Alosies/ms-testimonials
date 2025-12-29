-- =====================================================
-- NanoID Functions and Extensions
-- =====================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- NanoID Generation Functions
-- =====================================================

-- Base NanoID alphabet (URL-safe characters)
-- Excludes similar looking characters: 0, O, I, l
CREATE OR REPLACE FUNCTION nanoid_alphabet()
RETURNS text AS $$
BEGIN
    RETURN '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate NanoID of specified length
CREATE OR REPLACE FUNCTION generate_nanoid(length integer DEFAULT 12)
RETURNS text AS $$
DECLARE
    alphabet text := nanoid_alphabet();
    alphabet_length integer := length(alphabet);
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(alphabet, floor(random() * alphabet_length)::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Generate 12-character NanoID (for business entities)
CREATE OR REPLACE FUNCTION generate_nanoid_12()
RETURNS text AS $$
BEGIN
    RETURN generate_nanoid(12);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Generate 14-character NanoID (for high-volume activity)
CREATE OR REPLACE FUNCTION generate_nanoid_14()
RETURNS text AS $$
BEGIN
    RETURN generate_nanoid(14);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Generate 16-character NanoID (for security-critical)
CREATE OR REPLACE FUNCTION generate_nanoid_16()
RETURNS text AS $$
BEGIN
    RETURN generate_nanoid(16);
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =====================================================
-- Validation Functions
-- =====================================================

-- Validate NanoID format (only allowed characters)
CREATE OR REPLACE FUNCTION is_valid_nanoid(input_id text)
RETURNS boolean AS $$
DECLARE
    alphabet text := nanoid_alphabet();
BEGIN
    -- Check if input contains only valid characters
    RETURN input_id ~ ('^[' || alphabet || ']+$');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate NanoID length
CREATE OR REPLACE FUNCTION is_valid_nanoid_length(input_id text, expected_length integer)
RETURNS boolean AS $$
BEGIN
    RETURN length(input_id) = expected_length AND is_valid_nanoid(input_id);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Utility Functions
-- =====================================================

-- Get NanoID length category
CREATE OR REPLACE FUNCTION get_nanoid_category(input_id text)
RETURNS text AS $$
BEGIN
    CASE length(input_id)
        WHEN 12 THEN RETURN 'business_entity';
        WHEN 14 THEN RETURN 'high_volume_activity';
        WHEN 16 THEN RETURN 'security_critical';
        ELSE RETURN 'unknown';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate collision-resistant NanoID with retry logic
CREATE OR REPLACE FUNCTION generate_unique_nanoid(
    length integer DEFAULT 12,
    table_name text DEFAULT NULL,
    column_name text DEFAULT 'id'
)
RETURNS text AS $$
DECLARE
    new_id text;
    exists_count integer;
    max_attempts integer := 10;
    attempt integer := 0;
BEGIN
    LOOP
        new_id := generate_nanoid(length);
        attempt := attempt + 1;

        -- If no table specified, return the ID (no collision check)
        IF table_name IS NULL THEN
            RETURN new_id;
        END IF;

        -- Check for collision in specified table
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE %I = $1', table_name, column_name)
        INTO exists_count
        USING new_id;

        -- If no collision, return the ID
        IF exists_count = 0 THEN
            RETURN new_id;
        END IF;

        -- If max attempts reached, raise exception
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique NanoID after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON FUNCTION generate_nanoid(integer) IS 'Generate a NanoID of specified length using URL-safe alphabet';
COMMENT ON FUNCTION generate_nanoid_12() IS 'Generate 12-character NanoID for business entities (users, forms, testimonials)';
COMMENT ON FUNCTION generate_nanoid_14() IS 'Generate 14-character NanoID for high-volume activity tables';
COMMENT ON FUNCTION generate_nanoid_16() IS 'Generate 16-character NanoID for security-critical tables';
COMMENT ON FUNCTION is_valid_nanoid(text) IS 'Validate that a string contains only valid NanoID characters';
COMMENT ON FUNCTION is_valid_nanoid_length(text, integer) IS 'Validate NanoID format and length';
COMMENT ON FUNCTION get_nanoid_category(text) IS 'Determine NanoID category based on length (business_entity, high_volume_activity, security_critical)';
COMMENT ON FUNCTION generate_unique_nanoid(integer, text, text) IS 'Generate collision-resistant NanoID with table uniqueness check';

-- =====================================================
-- Test the functions
-- =====================================================

-- Test basic generation
SELECT 'Testing NanoID generation:' as test_phase;
SELECT generate_nanoid_12() as nanoid_12_char;
SELECT generate_nanoid_14() as nanoid_14_char;
SELECT generate_nanoid_16() as nanoid_16_char;

-- Test validation
SELECT 'Testing NanoID validation:' as test_phase;
SELECT is_valid_nanoid('abc123XYZ') as valid_nanoid;
SELECT is_valid_nanoid('invalid-chars!') as invalid_nanoid;
SELECT is_valid_nanoid_length('abc123XYZ', 9) as correct_length;
SELECT is_valid_nanoid_length('abc123XYZ', 10) as incorrect_length;

-- Test categorization
SELECT 'Testing NanoID categorization:' as test_phase;
SELECT get_nanoid_category(generate_nanoid_12()) as category_12;
SELECT get_nanoid_category(generate_nanoid_14()) as category_14;
SELECT get_nanoid_category(generate_nanoid_16()) as category_16;
