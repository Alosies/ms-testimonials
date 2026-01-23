import { z } from 'zod';

/**
 * Geolocation information enriched server-side from IP address.
 *
 * Added by the API on `form_started` and `form_resumed` events.
 * Uses ip-api.com for lookup (city-level precision only).
 *
 * @see README.md for migration planning
 */
export const GeoInfoSchema = z.object({
  ip: z.string(),
  country: z.string().nullable(),
  countryCode: z.string().nullable(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  timezone: z.string().nullable(),
  isp: z.string().nullable(),
  org: z.string().nullable(),
});

/**
 * Geo info type inferred from schema.
 * Single source of truth - do not manually define this interface elsewhere.
 */
export type GeoInfo = z.infer<typeof GeoInfoSchema>;
