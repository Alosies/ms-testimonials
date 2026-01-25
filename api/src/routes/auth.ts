import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { enhanceToken } from '@/features/auth/enhanceToken';
import { switchOrganization } from '@/features/auth/switchOrganization';
import { authMiddleware } from '@/shared/middleware/auth';
import {
  EnhanceTokenRequestSchema,
  EnhanceTokenResponseSchema,
  SwitchOrganizationRequestSchema,
  SwitchOrganizationResponseSchema,
} from '@/shared/schemas/auth';
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';

const auth = new OpenAPIHono();

/**
 * POST /auth/enhance-token
 * Enhance Supabase token with Hasura claims
 */
const enhanceTokenRoute = createRoute({
  method: 'post',
  path: '/enhance-token',
  tags: ['Authentication'],
  summary: 'Enhance Supabase token',
  description: 'Converts a Supabase authentication token into an enhanced JWT with Hasura claims for GraphQL access',
  request: {
    body: {
      content: {
        'application/json': {
          schema: EnhanceTokenRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Token successfully enhanced',
      content: {
        'application/json': {
          schema: EnhanceTokenResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Invalid or expired Supabase token',
      content: {
        'application/json': {
          schema: UnauthorizedResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalErrorResponseSchema,
        },
      },
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
auth.openapi(enhanceTokenRoute, enhanceToken as any);

/**
 * POST /auth/switch-organization
 * Switch user's current organization context
 */
const switchOrganizationRoute = createRoute({
  method: 'post',
  path: '/switch-organization',
  tags: ['Authentication'],
  summary: 'Switch organization',
  description: 'Switches the user to a different organization and generates a new JWT token with updated context',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SwitchOrganizationRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Organization successfully switched',
      content: {
        'application/json': {
          schema: SwitchOrganizationResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized - Invalid or missing token',
      content: {
        'application/json': {
          schema: UnauthorizedResponseSchema,
        },
      },
    },
    403: {
      description: 'User does not have access to this organization',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: InternalErrorResponseSchema,
        },
      },
    },
  },
});

// Apply auth middleware before the handler
auth.use('/switch-organization', authMiddleware);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
auth.openapi(switchOrganizationRoute, switchOrganization as any);

export { auth };
export type AuthRoutes = typeof auth;
