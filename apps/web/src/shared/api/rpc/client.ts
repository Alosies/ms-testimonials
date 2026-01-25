/**
 * Hono RPC Client
 *
 * Type-safe API client using Hono RPC for end-to-end type safety.
 *
 * Note: OpenAPIHono routes don't expose full type information for Hono RPC.
 * This client provides a foundation for future routes using standard Hono patterns.
 * For OpenAPI routes, use the typed fetch wrapper methods below.
 */

import { hc, type ClientResponse } from 'hono/client';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Generic Hono client type for routes without full type inference
 */
type GenericHonoClient = ReturnType<typeof hc>;

/**
 * API response helper - extracts JSON from Hono client response
 */
export async function unwrapResponse<T>(res: ClientResponse<T>): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Create API clients for each route module.
 *
 * @param getToken - Async function to retrieve the enhanced JWT token
 * @returns Object containing clients for each API route
 */
export function createApiClients(getToken: () => Promise<string | null>) {
  // Headers are resolved per-request to ensure fresh tokens
  const getHeaders = async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Base clients - types are limited due to OpenAPIHono not exposing route schemas
  const auth = hc(`${API_URL}/auth`, { headers: getHeaders });
  const ai = hc(`${API_URL}/ai`, { headers: getHeaders });
  const media = hc(`${API_URL}/media`, { headers: getHeaders });
  const analytics = hc(`${API_URL}/analytics`, { headers: getHeaders });

  return {
    auth: auth as GenericHonoClient,
    ai: ai as GenericHonoClient,
    media: media as GenericHonoClient,
    analytics: analytics as GenericHonoClient,
    // Raw fetch with auth headers for typed requests
    async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
      const headers = await getHeaders();
      return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...options.headers,
        },
      });
    },
  };
}

export type ApiClients = ReturnType<typeof createApiClients>;
