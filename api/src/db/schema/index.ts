/**
 * Drizzle Schema Definitions
 *
 * Re-exports generated schemas from database introspection.
 *
 * Schema Generation:
 * 1. Run `pnpm db:introspect` to generate schemas from the database
 * 2. Generated schemas appear in ./generated/
 *
 * Note: We use Hasura for migrations. These schemas are for type-safe queries only.
 */

export * from './generated/schema';
export * from './generated/relations';

// Type inference helpers
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
