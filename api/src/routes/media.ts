import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { generatePresignedUrl } from '@/features/media/presign';
import { handleS3Webhook } from '@/features/media/webhook';
import { authMiddleware } from '@/shared/middleware/auth';
import {
  PresignRequestSchema,
  PresignResponseSchema,
  S3WebhookRequestSchema,
  S3WebhookResponseSchema,
} from '@/shared/schemas/media';
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';

const media = new OpenAPIHono();

// ============================================================
// POST /media/presign - Generate presigned URL for upload
// ============================================================

const presignRoute = createRoute({
  method: 'post',
  path: '/presign',
  tags: ['Media'],
  summary: 'Generate presigned upload URL',
  description: `
Generate a presigned URL for direct upload to S3.

**Flow:**
1. Client calls this endpoint with file metadata
2. API validates request and creates a pending media record
3. API returns presigned URL with upload headers
4. Client uploads file directly to S3 using the URL
5. Lambda validates the upload and calls the webhook
6. Media status is updated to 'ready' or 'failed'

**Supported entity types:**
- \`organization_logo\` - Images up to 5MB (PNG, JPEG, WebP, SVG)
- \`contact_avatar\` - Images up to 2MB (PNG, JPEG, WebP)
- \`testimonial_video\` - Videos up to 500MB (MP4, MOV, WebM) - Not yet enabled
- \`form_attachment\` - Images/PDFs up to 10MB
  `,
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: PresignRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Presigned URL generated successfully',
      content: {
        'application/json': {
          schema: PresignResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request (validation failed)',
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

// Apply auth middleware and register route
media.use('/presign', authMiddleware);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
media.openapi(presignRoute, generatePresignedUrl as any);

// ============================================================
// POST /media/webhooks/s3-upload - S3 upload completion webhook
// ============================================================

const webhookRoute = createRoute({
  method: 'post',
  path: '/webhooks/s3-upload',
  tags: ['Media', 'Webhooks'],
  summary: 'S3 upload completion webhook',
  description: `
Webhook endpoint called by Lambda after S3 upload completes.

**Authentication:** HMAC-SHA256 signature in \`X-Webhook-Signature\` header.

**Flow:**
1. Lambda receives S3 ObjectCreated event
2. Lambda validates file content (MIME type, size)
3. Lambda extracts image dimensions if applicable
4. Lambda calls this webhook with validation results
5. API updates media record status to 'ready' or 'failed'

**Note:** This endpoint is NOT for public use. It's called by the Lambda function.
  `,
  request: {
    body: {
      content: {
        'application/json': {
          schema: S3WebhookRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Webhook processed successfully',
      content: {
        'application/json': {
          schema: S3WebhookResponseSchema,
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
      description: 'Invalid webhook signature',
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

// No auth middleware for webhook (uses HMAC signature)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
media.openapi(webhookRoute, handleS3Webhook as any);

export default media;
