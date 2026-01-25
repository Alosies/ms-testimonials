import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit Configuration
 *
 * This config is used for:
 * - Introspecting the existing database to generate schema files
 * - Validating Drizzle schema matches Hasura migrations
 *
 * Note: We use Hasura for migrations. Drizzle is for type-safe queries only.
 */
export default defineConfig({
  dialect: 'postgresql',
  out: './src/db/schema/generated',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Introspect all tables to ensure foreign key completeness
  // Note: We use all tables since they have complex FK relationships
  tablesFilter: ['*'],
});
