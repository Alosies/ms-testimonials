/**
 * REST API Client
 *
 * LIMITATION: OpenAPIHono with createRoute() does NOT support Hono RPC type inference.
 * The route types export OpenAPIHono instances, not chainable route types.
 * See README.md in this folder for full explanation.
 *
 * TYPE SAFETY STRATEGY (per ADR-021):
 * - API request/response types: Import from Zod schema inferences (@api/shared/schemas/*)
 * - Typed fetch wrapper: Use api.post/get with explicit types
 * - Entity composables: Define typed wrapper methods (useApiForMedia, useApiForAI)
 *
 * See: docs/adr/021-api-service-data-layer-architecture/adr.md
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * Create API client with typed fetch wrapper.
 *
 * Since OpenAPIHono doesn't support Hono RPC type inference, we use a typed
 * fetch wrapper pattern. Entity composables (useApiForMedia, useApiForAI)
 * import types from @api/shared/schemas/* for full type safety.
 *
 * @param getToken - Async function to retrieve the enhanced JWT token
 * @returns API client with typed fetch methods
 */
export function createApiClients(getToken: () => Promise<string | null>) {
  const getHeaders = async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    /**
     * Typed fetch wrapper for API requests.
     * Use with explicit type parameters for full type safety.
     *
     * @example
     * const res = await api.fetch('/media/presign', {
     *   method: 'POST',
     *   body: JSON.stringify(request),
     * });
     * const data = await res.json() as PresignResponse;
     */
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

    /**
     * Typed POST helper with generics.
     *
     * @example
     * const data = await api.post<PresignRequest, PresignResponse>(
     *   '/media/presign',
     *   request
     * );
     */
    async post<TRequest, TResponse>(
      endpoint: string,
      body: TRequest
    ): Promise<TResponse> {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Error ${res.status}`);
      }

      return res.json() as Promise<TResponse>;
    },

    /**
     * Typed GET helper with generics.
     *
     * @example
     * const data = await api.get<DashboardResponse>('/dashboard/forms/123');
     */
    async get<TResponse>(
      endpoint: string,
      params?: Record<string, string>
    ): Promise<TResponse> {
      const headers = await getHeaders();
      const url = new URL(`${API_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `API Error ${res.status}`);
      }

      return res.json() as Promise<TResponse>;
    },
  };
}

export type ApiClients = ReturnType<typeof createApiClients>;
