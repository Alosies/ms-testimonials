/**
 * Database JSONB schemas organized by table
 *
 * Structure: db/{table_name}/{column_name}/
 *
 * Each JSONB column folder contains:
 * - Zod schemas for validation
 * - TypeScript types (inferred from schemas)
 * - README.md with migration planning docs
 */

export * from './form_analytics_events';
