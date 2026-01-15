/**
 * E2E API Client
 *
 * HTTP client for the E2E support endpoints that manage test data.
 * Uses E2E_API_SECRET for authentication, bypassing RLS for fast test setup.
 */

const E2E_API_URL = process.env.E2E_API_URL || 'http://localhost:4000';
const E2E_API_SECRET = process.env.E2E_API_SECRET;

/**
 * Make a request to the E2E API.
 *
 * @param method - HTTP method
 * @param path - API path (e.g., '/forms' - /e2e prefix added automatically)
 * @param body - Optional request body for POST/PUT
 * @returns Typed response data
 * @throws Error on non-ok responses
 *
 * @example
 * ```ts
 * const org = await e2eApiRequest<Organization>('GET', '/organizations/my-org');
 * const form = await e2eApiRequest<FormResult>('POST', '/forms', { name: 'Test Form' });
 * ```
 */
export async function e2eApiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  if (!E2E_API_SECRET) {
    throw new Error(
      'E2E_API_SECRET environment variable is not set. ' +
        'Configure it in apps/web/tests/e2e/.env'
    );
  }

  // Ensure path starts with /e2e
  const normalizedPath = path.startsWith('/e2e') ? path : `/e2e${path}`;
  const url = `${E2E_API_URL}${normalizedPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-E2E-Token': E2E_API_SECRET,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`E2E API error (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Check if E2E API is configured and available.
 * Useful for skipping tests that require E2E API.
 */
export function isE2EApiConfigured(): boolean {
  return Boolean(E2E_API_SECRET && E2E_API_SECRET.length >= 32);
}

// Legacy export for backward compatibility during migration
export const testApiRequest = e2eApiRequest;
export const isTestApiConfigured = isE2EApiConfigured;
