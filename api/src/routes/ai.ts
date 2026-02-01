import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { suggestQuestions } from '@/features/ai/suggestQuestions';
import { assembleTestimonial } from '@/features/ai/assembleTestimonial';
import { checkAIAccess } from '@/shared/libs/aiAccess';
import { authMiddleware, type AuthContext } from '@/shared/middleware/auth';
import {
  SuggestQuestionsRequestSchema,
  SuggestQuestionsResponseSchema,
  AssembleTestimonialRequestSchema,
  AssembleTestimonialResponseSchema,
  AccessCheckRequestSchema,
  AccessCheckResponseSchema,
  AccessCheckForbiddenResponseSchema,
  type AICapabilityIdType,
  type QualityLevelIdType,
} from '@/shared/schemas/ai';
import {
  ErrorResponseSchema,
  UnauthorizedResponseSchema,
  InternalErrorResponseSchema,
  TooManyRequestsResponseSchema,
  PaymentRequiredResponseSchema,
  ForbiddenResponseSchema,
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
    402: {
      description: 'Payment Required - Insufficient credits',
      content: {
        'application/json': {
          schema: PaymentRequiredResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - Capability not available on plan',
      content: {
        'application/json': {
          schema: ForbiddenResponseSchema,
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
 * POST /ai/assemble-testimonial
 * Assemble testimonial from customer Q&A responses using AI
 *
 * Uses the credit system (ADR-023) to check capability access and charge credits.
 * The organization_id is derived from the form_id.
 *
 * @see PRD-005: AI Testimonial Generation
 * @see ADR-023: AI Capabilities Plan Integration
 */
const assembleTestimonialRoute = createRoute({
  method: 'post',
  path: '/assemble-testimonial',
  tags: ['AI'],
  summary: 'Assemble testimonial from Q&A responses',
  description: `Transforms customer question-answer responses into a coherent, first-person testimonial.
Returns the testimonial along with modification suggestions and metadata analysis.

**Credit System Integration (ADR-023):**
- Organization is determined from the form_id
- Credits are reserved before AI operation and settled after completion
- Response includes credits_used and balance_remaining

**New Request Parameters:**
- qualityLevel: 'fast' | 'enhanced' | 'premium' (default: 'fast')
- idempotencyKey: Optional client-provided key for idempotent requests

**Error Responses:**
- 402 Payment Required: Insufficient credits
- 403 Forbidden: Capability not available on plan`,
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
    402: {
      description: 'Payment Required - Insufficient credits',
      content: {
        'application/json': {
          schema: PaymentRequiredResponseSchema,
        },
      },
    },
    403: {
      description: 'Forbidden - Capability not available on plan',
      content: {
        'application/json': {
          schema: ForbiddenResponseSchema,
        },
      },
    },
    404: {
      description: 'Form not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    429: {
      description: 'Rate limit exceeded',
      content: {
        'application/json': {
          schema: TooManyRequestsResponseSchema,
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
ai.openapi(assembleTestimonialRoute, assembleTestimonial as any);

/**
 * POST /ai/access-check
 * Pre-check access to AI capabilities before showing AI options
 *
 * Part of ADR-023 AI Capabilities Plan Integration (T5.5)
 */
const accessCheckRoute = createRoute({
  method: 'post',
  path: '/access-check',
  tags: ['AI'],
  summary: 'Check AI capability access',
  description: `
Pre-check access to an AI capability before showing AI options in the UI.

**Authentication required** - Must have access to the organization.

**Request:**
- \`capabilityUniqueName\` - The AI capability to check (question_generation, testimonial_assembly, testimonial_polish)
- \`qualityLevelUniqueName\` - Optional specific quality level to check (fast, enhanced, premium)

**Response includes:**
- Whether the operation can proceed
- Capability access status
- Credit balance and requirements
- Selected quality level with available models
- All available quality levels for this capability
- Hints for upgrading or purchasing credits if needed
`,
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: AccessCheckRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Access check completed successfully',
      content: {
        'application/json': {
          schema: AccessCheckResponseSchema,
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
      description: 'Forbidden - Organization context required',
      content: {
        'application/json': {
          schema: AccessCheckForbiddenResponseSchema,
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

// Apply auth middleware and handler for access-check
ai.use('/access-check', authMiddleware);

// Type assertion needed: OpenAPI handler type inference is complex with @hono/zod-openapi.
// Runtime type safety is ensured by Zod schema validation inside the handler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
ai.openapi(accessCheckRoute, async (c: any) => {
  const body = c.req.valid('json');
  const auth = c.get('auth') as AuthContext;

  // Verify organization context
  if (!auth.organizationId) {
    return c.json(
      {
        success: false as const,
        error: 'Organization context required',
      },
      403
    );
  }

  const { capabilityUniqueName, qualityLevelUniqueName } = body;

  try {
    // Call the checkAIAccess function
    const accessResult = await checkAIAccess({
      organizationId: auth.organizationId,
      capabilityUniqueName: capabilityUniqueName as AICapabilityIdType,
      qualityLevelUniqueName: qualityLevelUniqueName as QualityLevelIdType | undefined,
    });

    // Transform to API response format
    const response = buildAccessCheckResponse(accessResult);

    return c.json(response, 200);
  } catch (error) {
    console.error('AI access check error:', error);
    return c.json(
      {
        error: 'Failed to check AI access',
        code: 'INTERNAL_ERROR',
      },
      500
    );
  }
});

/**
 * Transform internal AIAccessResult to API response format
 */
function buildAccessCheckResponse(accessResult: Awaited<ReturnType<typeof checkAIAccess>>) {
  const { capability, credits, selectedQualityLevel, canProceed, reason } = accessResult;

  // Build capability info
  const capabilityInfo = {
    id: capability.capabilityId,
    name: capability.capabilityName,
    hasAccess: capability.hasAccess,
  };

  // Build credit info
  const creditInfo = {
    available: credits.available,
    required: credits.required,
    hasEnough: credits.available >= credits.required,
  };

  // Build selected quality level with models (null if no access)
  const selectedQualityLevelResponse = selectedQualityLevel.id
    ? {
        id: selectedQualityLevel.id,
        name: selectedQualityLevel.name,
        creditCost: selectedQualityLevel.creditCost,
        allowedModels: selectedQualityLevel.allowedModelIds.map((modelId, index) => ({
          id: modelId,
          name: `Model ${index + 1}`, // TODO: Fetch actual model names from DB
          isDefault: modelId === selectedQualityLevel.defaultModelId,
        })),
      }
    : null;

  // Build available quality levels
  const availableQualityLevels = capability.availableQualityLevels.map((ql) => ({
    id: ql.id,
    name: ql.name,
    creditCost: ql.creditCost,
  }));

  // Build hints
  let upgradeHint: string | undefined;
  let topupHint: string | undefined;

  if (!canProceed && reason) {
    // If capability not included, suggest upgrade
    if (
      reason.includes('not included') ||
      reason.includes('quality level is not available')
    ) {
      upgradeHint = 'Upgrade your plan to access this AI capability or quality level.';
    }

    // If insufficient credits, suggest topup
    if (reason.includes('Insufficient credits')) {
      const shortfall = credits.required - credits.available;
      topupHint = `You need ${shortfall.toFixed(1)} more credits to proceed. Purchase a credit pack to continue.`;
    }
  }

  return {
    canProceed,
    capability: capabilityInfo,
    credits: creditInfo,
    selectedQualityLevel: selectedQualityLevelResponse,
    availableQualityLevels,
    ...(upgradeHint && { upgradeHint }),
    ...(topupHint && { topupHint }),
  };
}

export { ai };
export type AIRoutes = typeof ai;
