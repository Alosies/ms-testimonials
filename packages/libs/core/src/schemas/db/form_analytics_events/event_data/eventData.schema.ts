import { z } from 'zod';
import { DeviceInfoSchema } from './deviceInfo.schema';
import { GeoInfoSchema } from './geoInfo.schema';

/**
 * Complete event_data JSONB schema for form_analytics_events table.
 *
 * Structure depends on event type:
 * - form_started/form_resumed: Contains device + geo
 * - Other events: May be empty or contain event-specific metadata
 *
 * Uses .passthrough() to allow additional fields for forward compatibility.
 *
 * @see README.md for migration planning
 */
export const EventDataSchema = z
  .object({
    /** Client-side device/browser info (form_started, form_resumed) */
    device: DeviceInfoSchema.optional(),
    /** Server-side IP geolocation (form_started, form_resumed) */
    geo: GeoInfoSchema.optional(),
  })
  .passthrough();

/**
 * Event data type inferred from schema.
 * Single source of truth - do not manually define this interface elsewhere.
 */
export type EventData = z.infer<typeof EventDataSchema>;
