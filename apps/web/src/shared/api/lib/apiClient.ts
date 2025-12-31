/**
 * Core API Client
 * Pure function-based HTTP client (no Vue reactivity)
 */

import type { ApiError } from '../models/common';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Base request configuration
 */
export interface RequestConfig {
  authenticated?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * GET request configuration
 */
export interface GetConfig extends RequestConfig {
  params?: Record<string, string | number | boolean>;
}

/**
 * POST request configuration
 */
export interface PostConfig extends RequestConfig {
  // POST-specific config if needed
}

/**
 * API Client Error
 */
export interface ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;
}

/**
 * Create an API client error
 */
export function createApiClientError(
  message: string,
  status: number,
  code?: string,
  details?: unknown
): ApiClientError {
  const error = new Error(message) as ApiClientError;
  error.name = 'ApiClientError';
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Check if error is an ApiClientError
 */
export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof Error && error.name === 'ApiClientError';
}

/**
 * API Client interface
 */
export interface ApiClient {
  get: <TResponse>(endpoint: string, config?: GetConfig) => Promise<TResponse>;
  post: <TRequest, TResponse>(
    endpoint: string,
    data?: TRequest,
    config?: PostConfig
  ) => Promise<TResponse>;
}

/**
 * Build full URL with query parameters
 */
function buildUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string {
  const url = `${baseUrl}${endpoint}`;

  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${url}?${searchParams.toString()}`;
}

/**
 * Build request headers
 */
async function buildHeaders(
  getAuthToken: () => Promise<string | null>,
  config: RequestConfig = {}
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // Add authentication if required
  if (config.authenticated) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Handle API response
 */
async function handleResponse<TResponse>(
  response: Response
): Promise<TResponse> {
  // Handle non-OK responses
  if (!response.ok) {
    let errorData: ApiError | undefined;

    try {
      errorData = await response.json();
    } catch {
      // Response body is not JSON or empty
    }

    const errorMessage =
      errorData?.error ||
      errorData?.message ||
      `Request failed with status ${response.status}`;

    throw createApiClientError(
      errorMessage,
      response.status,
      errorData?.error,
      errorData
    );
  }

  // Parse successful response
  try {
    const data = await response.json();
    return data as TResponse;
  } catch (error) {
    throw createApiClientError(
      'Failed to parse response JSON',
      response.status,
      'PARSE_ERROR',
      error
    );
  }
}

/**
 * Create API Client
 * Factory function that returns an API client with get and post methods
 *
 * @param baseUrl - Base URL for all API requests
 * @param getAuthToken - Function to retrieve authentication token
 * @returns API client instance
 */
export function createApiClient(
  baseUrl: string,
  getAuthToken: () => Promise<string | null>
): ApiClient {
  /**
   * Perform GET request
   */
  async function get<TResponse>(
    endpoint: string,
    config: GetConfig = {}
  ): Promise<TResponse> {
    const url = buildUrl(baseUrl, endpoint, config.params);
    const headers = await buildHeaders(getAuthToken, config);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(config.timeout || API_CONFIG.timeout),
      });

      return handleResponse<TResponse>(response);
    } catch (error) {
      if (isApiClientError(error)) {
        throw error;
      }

      // Network or other errors
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw createApiClientError(message, 0, 'NETWORK_ERROR', error);
    }
  }

  /**
   * Perform POST request
   */
  async function post<TRequest, TResponse>(
    endpoint: string,
    data?: TRequest,
    config: PostConfig = {}
  ): Promise<TResponse> {
    const url = buildUrl(baseUrl, endpoint);
    const headers = await buildHeaders(getAuthToken, config);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(config.timeout || API_CONFIG.timeout),
      });

      return handleResponse<TResponse>(response);
    } catch (error) {
      if (isApiClientError(error)) {
        throw error;
      }

      // Network or other errors
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw createApiClientError(message, 0, 'NETWORK_ERROR', error);
    }
  }

  return {
    get,
    post,
  };
}
