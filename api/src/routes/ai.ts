import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { suggestQuestions } from '@/features/ai/suggestQuestions';
import { authMiddleware } from '@/shared/middleware/auth';
import {
  SuggestQuestionsRequestSchema,
  SuggestQuestionsResponseSchema,
  AssembleTestimonialRequestSchema,
  AssembleTestimonialResponseSchema,
} from '@/shared/schemas/ai';
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
} from '@/shared/schemas/common';

const ai = new OpenAPIHono();

/**
 * POST /ai/suggest-questions
 * Generate AI-suggested questions for a testimonial collection form
 */
const suggestQuestionsRoute = createRoute({
  method: 'post',
  path: '/suggest-questions',
  tags: ['AI'],
  summary: 'Generate AI question suggestions',
  description: 'Analyzes the product name and description to generate tailored testimonial collection questions. Uses GPT-4o-mini to infer industry, audience, and value propositions.',
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SuggestQuestionsRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Questions generated successfully',
      content: {
        'application/json': {
          schema: SuggestQuestionsResponseSchema,
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
    500: {
      description: 'AI service error',
      content: {
        'application/json': {
          schema: InternalErrorResponseSchema,
        },
      },
    },
  },
});

// Apply auth middleware and handler
ai.use('/suggest-questions', authMiddleware);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ai.openapi(suggestQuestionsRoute, suggestQuestions as any);

/**
 * POST /ai/assemble
 * Assemble testimonial from customer answers using AI
 */
const assembleTestimonialRoute = createRoute({
  method: 'post',
  path: '/assemble',
  tags: ['AI'],
  summary: 'Assemble testimonial from answers',
  description: 'Combines customer answers into a coherent, first-person testimonial. Preserves the customer\'s voice while connecting their responses smoothly.',
  request: {
    body: {
      content: {
        'application/json': {
          schema: AssembleTestimonialRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Testimonial assembled successfully',
      content: {
        'application/json': {
          schema: AssembleTestimonialResponseSchema,
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
    500: {
      description: 'AI service error',
      content: {
        'application/json': {
          schema: InternalErrorResponseSchema,
        },
      },
    },
  },
});

// Assemble endpoint (public - used during form submission)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ai.openapi(assembleTestimonialRoute, (async (c: any) => {
  // TODO: Implement AI testimonial assembly
  // This will be implemented when building the form submission flow
  return c.json({
    testimonial: 'AI-assembled testimonial placeholder',
  });
}) as any);

export { ai };
export type AIRoutes = typeof ai;
