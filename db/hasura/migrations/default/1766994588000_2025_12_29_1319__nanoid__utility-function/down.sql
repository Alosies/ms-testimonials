-- =====================================================
-- NanoID Functions Rollback
-- =====================================================
-- Removes NanoID Functions and Extensions

-- Remove all NanoID utility functions
DROP FUNCTION IF EXISTS generate_unique_nanoid;
DROP FUNCTION IF EXISTS get_nanoid_category;
DROP FUNCTION IF EXISTS is_valid_nanoid_length;
DROP FUNCTION IF EXISTS is_valid_nanoid;
DROP FUNCTION IF EXISTS generate_nanoid_16;
DROP FUNCTION IF EXISTS generate_nanoid_14;
DROP FUNCTION IF EXISTS generate_nanoid_12;
DROP FUNCTION IF EXISTS generate_nanoid;
DROP FUNCTION IF EXISTS nanoid_alphabet;

-- Note: We don't drop the pgcrypto extension as it might be used by other parts of the system
-- If you need to remove it completely, uncomment the line below:
-- DROP EXTENSION IF EXISTS "pgcrypto";
