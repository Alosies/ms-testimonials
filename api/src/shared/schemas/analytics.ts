/**
 * Form Analytics Zod Schemas
 *
 * Defines schemas for lightweight analytics event tracking.
 * Events capture form interactions without storing PII.
 *
 * IMPORTANT: JSONB schemas are imported from @testimonials/core (single source of truth).
 * This file extends them with OpenAPI metadata for API documentation.
 */

import { z } from '@hono/zod-openapi';
import {
  DeviceInfoSchema as BaseDeviceInfoSchema,
  GeoInfoSchema as BaseGeoInfoSchema,
  EventDataSchema as BaseEventDataSchema,
  type DeviceInfo,
  type GeoInfo,
  type EventData,
} from '@testimonials/core';

// Re-export types from core package
export type { DeviceInfo, GeoInfo, EventData };

/**
 * Valid event types for form analytics
 */
export const AnalyticsEventTypeSchema = z.enum([
  'form_started',
  'step_completed',
  'step_skipped',
  'form_submitted',
  'form_abandoned',
  'form_resumed',
]).openapi({
  description: 'Type of analytics event',
  example: 'step_completed',
});

// ============================================================================
// JSONB event_data Schemas (extended with OpenAPI metadata)
// ============================================================================
// Base schemas imported from @testimonials/core - single source of truth
// Extended here with .openapi() for API documentation
// ============================================================================

/**
 * Device information collected from the client browser.
 * @see @testimonials/core for base schema definition
 */
export const DeviceInfoSchema = BaseDeviceInfoSchema.openapi({
  description: 'Device and browser information collected without user permission',
});

/**
 * Geolocation information enriched server-side from IP address.
 * @see @testimonials/core for base schema definition
 */
export const GeoInfoSchema = BaseGeoInfoSchema.openapi({
  description: 'IP-based geolocation enriched server-side',
});

/**
 * Complete event_data JSONB schema.
 * @see @testimonials/core for base schema definition
 */
export const EventDataSchema = BaseEventDataSchema.openapi({
  description: 'Event metadata stored in JSONB. Structure varies by event type.',
});

// ============================================================================
// Request/Response Schemas
// ============================================================================

/**
 * Track event request body
 */
export const TrackEventRequestSchema = z.object({
  formId: z.string().min(1).openapi({
    description: 'ID of the form being tracked',
    example: 'xK9mP2qR4tYn',
  }),
  organizationId: z.string().min(1).openapi({
    description: 'ID of the organization that owns the form',
    example: 'org_abc123def',
  }),
  sessionId: z.string().uuid().openapi({
    description: 'Client-generated UUID for correlating events within a session',
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  eventType: AnalyticsEventTypeSchema,
  stepIndex: z.number().int().min(0).optional().openapi({
    description: 'Zero-based index of the current step (for step-related events)',
    example: 2,
  }),
  stepId: z.string().optional().openapi({
    description: 'ID of the step (for step-related events)',
    example: 'step_xyz789',
  }),
  stepType: z.string().optional().openapi({
    description: 'Type of the step (welcome, question, rating, etc.)',
    example: 'rating',
  }),
  eventData: EventDataSchema.optional().openapi({
    description: 'Additional event metadata - see DeviceInfoSchema and GeoInfoSchema',
  }),
}).openapi('TrackEventRequest');

/**
 * Track event response
 */
export const TrackEventResponseSchema = z.object({
  success: z.boolean().openapi({
    description: 'Whether the event was tracked successfully',
    example: true,
  }),
  eventId: z.string().optional().openapi({
    description: 'ID of the created event record',
    example: 'evt_abc123xyz',
  }),
}).openapi('TrackEventResponse');

// Type exports
export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;
export type TrackEventRequest = z.infer<typeof TrackEventRequestSchema>;
export type TrackEventResponse = z.infer<typeof TrackEventResponseSchema>;
