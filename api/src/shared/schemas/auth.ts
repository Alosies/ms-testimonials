/**
 * Zod schemas for authentication endpoints
 */

import { z } from '@hono/zod-openapi';

/**
 * Enhance Token Request Schema
 */
export const EnhanceTokenRequestSchema = z.object({
  supabaseToken: z.string().min(1).openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Supabase authentication token',
  }),
  organizationId: z.string().min(12).max(12).optional().openapi({
    example: 'GspfE8jECdU4',
    description: 'Optional organization ID (NanoID) to set as active context',
  }),
}).openapi('EnhanceTokenRequest');

/**
 * Enhance Token Response Schema
 */
export const EnhanceTokenResponseSchema = z.object({
  access_token: z.string().openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Enhanced JWT token with Hasura claims',
  }),
  expires_at: z.number().openapi({
    example: 1735488000,
    description: 'Unix timestamp when the token expires',
  }),
}).openapi('EnhanceTokenResponse');

/**
 * Switch Organization Request Schema
 */
export const SwitchOrganizationRequestSchema = z.object({
  organizationId: z.string().min(12).max(12).openapi({
    example: 'GspfE8jECdU4',
    description: 'ID of the organization to switch to (NanoID)',
  }),
}).openapi('SwitchOrganizationRequest');

/**
 * Switch Organization Response Schema
 */
export const SwitchOrganizationResponseSchema = z.object({
  access_token: z.string().openapi({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'New JWT token with switched organization context',
  }),
  expires_at: z.number().openapi({
    example: 1735488000,
    description: 'Unix timestamp when the token expires',
  }),
}).openapi('SwitchOrganizationResponse');
