/**
 * IP-based geolocation information from ip-api.com lookup.
 *
 * Note: The subset of this data that gets saved to event_data.geo
 * is defined by GeoInfoSchema in api/src/shared/schemas/analytics.ts.
 * This interface contains the full response; the schema defines what's persisted.
 */
export interface GeoLocation {
  ip: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  regionName: string | null;
  city: string | null;
  zip: string | null;
  lat: number | null;
  lon: number | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
}

/**
 * Response from ip-api.com
 */
interface IpApiResponse {
  status: 'success' | 'fail';
  message?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  query?: string;
}

/**
 * Looks up geolocation information for an IP address.
 * Uses ip-api.com free service (no API key required).
 *
 * Note: Free tier has rate limits (45 requests/minute).
 * For production with high volume, consider a paid service like MaxMind.
 *
 * @param ip - The IP address to look up
 * @returns Geolocation information or null if lookup fails
 */
export async function lookupGeoLocation(ip: string): Promise<GeoLocation | null> {
  // Skip lookup for localhost/private IPs
  if (isPrivateIp(ip)) {
    return {
      ip,
      country: null,
      countryCode: null,
      region: null,
      regionName: null,
      city: null,
      zip: null,
      lat: null,
      lon: null,
      timezone: null,
      isp: null,
      org: null,
    };
  }

  try {
    // ip-api.com free endpoint (no API key needed)
    // Fields: country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,query
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,query`,
      {
        signal: AbortSignal.timeout(3000), // 3 second timeout
      }
    );

    if (!response.ok) {
      console.warn(`Geolocation lookup failed: HTTP ${response.status}`);
      return null;
    }

    const data = (await response.json()) as IpApiResponse;

    if (data.status === 'fail') {
      console.warn(`Geolocation lookup failed: ${data.message}`);
      return null;
    }

    return {
      ip: data.query ?? ip,
      country: data.country ?? null,
      countryCode: data.countryCode ?? null,
      region: data.region ?? null,
      regionName: data.regionName ?? null,
      city: data.city ?? null,
      zip: data.zip ?? null,
      lat: data.lat ?? null,
      lon: data.lon ?? null,
      timezone: data.timezone ?? null,
      isp: data.isp ?? null,
      org: data.org ?? null,
    };
  } catch (error) {
    // Fail silently - geolocation is optional
    console.warn('Geolocation lookup error:', error);
    return null;
  }
}

/**
 * Checks if an IP address is private/local
 */
function isPrivateIp(ip: string): boolean {
  // IPv4 private ranges
  if (ip === '127.0.0.1' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const secondOctet = parseInt(ip.split('.')[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  // IPv6 loopback
  if (ip === '::1') return true;

  return false;
}

/**
 * Extracts client IP from request headers
 * Handles common proxy headers
 */
export function getClientIp(headers: {
  get(name: string): string | null | undefined;
}): string | null {
  // Check common proxy headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
    // The first one is the original client
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  return null;
}

/**
 * Returns a concise location string for display
 */
export function formatLocation(geo: GeoLocation): string {
  const parts: string[] = [];

  if (geo.city) parts.push(geo.city);
  if (geo.regionName && geo.regionName !== geo.city) parts.push(geo.regionName);
  if (geo.country) parts.push(geo.country);

  return parts.join(', ') || 'Unknown';
}
