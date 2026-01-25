/**
 * Drizzle Database Client
 *
 * Provides a type-safe SQL client for complex queries like:
 * - Analytics aggregations
 * - Multi-table joins
 * - Bulk operations
 *
 * For simple CRUD operations, use Hasura GraphQL instead.
 *
 * Uses lazy initialization to avoid startup crashes when DATABASE_URL is not set.
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema';

let _client: Sql | null = null;
let _db: PostgresJsDatabase<typeof schema> | null = null;

/**
 * Get the PostgreSQL client (lazy-initialized)
 *
 * Configuration:
 * - max: 10 connections (suitable for API server)
 * - idle_timeout: 20 seconds
 * - connect_timeout: 10 seconds
 * - prepare: false (required for serverless/edge compatibility)
 *
 * @throws Error if DATABASE_URL is not set
 */
export function getClient(): Sql {
  if (!_client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required for Drizzle queries');
    }
    _client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }
  return _client;
}

/**
 * Get the Drizzle ORM instance (lazy-initialized)
 *
 * @throws Error if DATABASE_URL is not set
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

/**
 * Close the database connection
 * Call this during graceful shutdown
 */
export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}

// Legacy exports for backwards compatibility (deprecated - use getDb() and getClient())
export const client = {
  end: async () => closeDb(),
};

export type DrizzleClient = PostgresJsDatabase<typeof schema>;
