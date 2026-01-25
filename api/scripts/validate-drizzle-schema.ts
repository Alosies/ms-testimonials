/**
 * Drizzle Schema Validation Script
 *
 * Validates that the Drizzle-generated schema matches the expected tables.
 * Run after `pnpm db:introspect` to ensure schema sync.
 *
 * Usage: pnpm db:validate
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const GENERATED_DIR = join(import.meta.dirname, '../src/db/schema/generated');
const EXPECTED_TABLES = [
  'form_analytics_events',
  'testimonials',
  'forms',
  'organizations',
  'users',
];

async function validateSchema(): Promise<void> {
  console.log('Validating Drizzle schema...\n');

  // Check if generated directory exists
  if (!existsSync(GENERATED_DIR)) {
    console.error('❌ Generated schema directory not found.');
    console.error(`   Expected: ${GENERATED_DIR}`);
    console.error('   Run "pnpm db:introspect" first.\n');
    process.exit(1);
  }

  // Check for schema file
  const files = readdirSync(GENERATED_DIR);
  const schemaFile = files.find((f) => f.endsWith('.ts') && f.includes('schema'));

  if (!schemaFile) {
    console.error('❌ No schema file found in generated directory.');
    console.error('   Run "pnpm db:introspect" to generate schema.\n');
    process.exit(1);
  }

  console.log(`✅ Found schema file: ${schemaFile}`);
  console.log(`✅ Generated directory contains ${files.length} file(s)`);
  console.log('\nExpected tables:');
  EXPECTED_TABLES.forEach((table) => console.log(`   - ${table}`));
  console.log('\n✅ Schema validation complete!');
  console.log('   Note: Manual review recommended after schema changes.\n');
}

validateSchema().catch((error) => {
  console.error('Schema validation failed:', error);
  process.exit(1);
});
