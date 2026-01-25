/**
 * REST API Client Barrel Export
 *
 * Provides typed fetch helpers for the Hono REST API.
 * See README.md for why this isn't using Hono RPC.
 */

export { useApi, resetApiClients } from './useApi';
export { createApiClients } from './client';
export type { ApiClients } from './client';
