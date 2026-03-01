/**
 * Supabase Proxy Worker
 *
 * Proxies requests to Supabase to bypass DNS-level blocks (e.g., India Section 69A).
 * Deploy on Cloudflare Workers with a custom domain, then point VITE_SUPABASE_URL at it.
 */

interface Env {
  SUPABASE_PROJECT_URL: string;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const supabaseUrl = new URL(env.SUPABASE_PROJECT_URL);
    const requestUrl = new URL(request.url);

    // Rewrite origin to Supabase
    requestUrl.hostname = supabaseUrl.hostname;
    requestUrl.port = supabaseUrl.port;
    requestUrl.protocol = supabaseUrl.protocol;

    // Clone headers and set correct Host
    const headers = new Headers(request.headers);
    headers.set('Host', supabaseUrl.hostname);

    // Check for WebSocket upgrade
    const upgradeHeader = request.headers.get('Upgrade');
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      return fetch(requestUrl.toString(), {
        method: request.method,
        headers,
        body: request.body,
      });
    }

    // Forward the request
    const response = await fetch(requestUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'follow',
    });

    // Add CORS headers to response
    const responseHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      responseHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
} satisfies ExportedHandler<Env>;
