import type { Context } from 'hono';
import { generateObject } from 'ai';
import { successResponse, errorResponse } from '@/shared/utils/http';
import {
  getModelForQuality,
  getModelInfo,
  CREDIT_COSTS,
  extractUsageFromResponse,
  buildTrackingTag,
  logAIUsage,
  calculateCreditsFromCost,
  type QualityLevel,
  type AIUsageData,
} from '@/shared/libs/ai';
import {
  sanitizeProductName,
  sanitizeProductDescription,
  sanitizeFocusAreas,
  wrapUserContent,
  logSuspiciousInput,
  sanitizeAIOutput,
} from '@/shared/utils/inputSanitizer';
import type { SuggestQuestionsResponse } from '@/shared/schemas/ai';
import { getOrganizationAllowedQuestionTypes } from '@/entities/organization';
import {
  buildAvailableTypesSection,
  buildDynamicAIResponseSchema,
  buildSystemPrompt,
} from './buildDynamicPrompt';

// Note: AIResponseSchema and SYSTEM_PROMPT are now dynamically generated
// based on the organization's plan and allowed question types.
// See buildDynamicPrompt.ts for the implementation.

/**
 * Build the user message containing ONLY user-provided data
 * Wrapped in XML tags to clearly delineate untrusted content
 */
function buildUserMessage(productName: string, productDescription: string, focusAreas?: string): string {
  const wrappedName = wrapUserContent(productName, 'product_name');
  const wrappedDescription = wrapUserContent(productDescription, 'product_description');
  const focusSection = focusAreas
    ? `\n\nFocus areas to emphasize:\n${wrapUserContent(focusAreas, 'focus_areas')}`
    : '';

  return `Please generate testimonial questions for this product:

${wrappedName}

${wrappedDescription}${focusSection}`;
}

/**
 * Response type including audit data
 */
interface SuggestQuestionsResult {
  response: SuggestQuestionsResponse;
  usage: Partial<AIUsageData>;
  creditsUsed: number;
}

/**
 * POST /ai/suggest-questions
 * Generate AI-suggested questions for a testimonial collection form
 */
export async function suggestQuestions(c: Context) {
  try {
    const body = await c.req.json();
    const { product_name, product_description, focus_areas, quality = 'fast' } = body;

    // Get auth context for tracking and logging
    const auth = c.get('auth');
    const organizationId = auth?.organizationId ?? 'anonymous';
    const userId = auth?.userId ?? auth?.sub ?? undefined;
    const securityContext = { organizationId };

    // Input validation
    if (!product_name || typeof product_name !== 'string') {
      return errorResponse(c, 'product_name is required', 400, 'VALIDATION_ERROR');
    }
    if (!product_description || typeof product_description !== 'string') {
      return errorResponse(c, 'product_description is required', 400, 'VALIDATION_ERROR');
    }

    // Sanitize inputs to prevent prompt injection and enforce limits
    const sanitizedName = sanitizeProductName(product_name);
    const sanitizedDescription = sanitizeProductDescription(product_description);
    const sanitizedFocusAreas = focus_areas ? sanitizeFocusAreas(focus_areas) : null;

    // Log any suspicious patterns for security monitoring
    logSuspiciousInput('product_name', sanitizedName, securityContext);
    logSuspiciousInput('product_description', sanitizedDescription, securityContext);
    if (sanitizedFocusAreas) {
      logSuspiciousInput('focus_areas', sanitizedFocusAreas, securityContext);
    }

    // Validate sanitized content
    if (sanitizedName.value.length < 1) {
      return errorResponse(c, 'product_name is required', 400, 'VALIDATION_ERROR');
    }
    if (sanitizedDescription.value.length < 10) {
      return errorResponse(c, 'product_description must be at least 10 characters', 400, 'VALIDATION_ERROR');
    }

    // Validate quality level
    const validQualities: QualityLevel[] = ['fast', 'enhanced', 'premium'];
    const selectedQuality: QualityLevel = validQualities.includes(quality) ? quality : 'fast';

    // Fetch allowed question types for the organization's plan
    const questionTypesResult = await getOrganizationAllowedQuestionTypes(organizationId);

    if (!questionTypesResult.success) {
      const errorMessages: Record<typeof questionTypesResult.reason, { message: string; code: string; status: number }> = {
        query_error: {
          message: 'Failed to fetch plan information. Please try again.',
          code: 'PLAN_QUERY_ERROR',
          status: 500,
        },
        organization_not_found: {
          message: 'Organization not found.',
          code: 'ORGANIZATION_NOT_FOUND',
          status: 404,
        },
        no_active_plan: {
          message: 'No active plan found for your organization. Please contact support.',
          code: 'NO_ACTIVE_PLAN',
          status: 403,
        },
      };

      const { message, code, status } = errorMessages[questionTypesResult.reason];
      return errorResponse(c, message, status, code);
    }

    const allowedQuestionTypes = questionTypesResult.questionTypes;

    if (allowedQuestionTypes.length === 0) {
      console.warn(`Plan has no question types for organization ${organizationId}`);
      return errorResponse(
        c,
        'No question types available for your plan. Please contact support.',
        403,
        'PLAN_RESTRICTION'
      );
    }

    // Extract unique_names for schema and logging
    const allowedTypeIds = allowedQuestionTypes.map((t) => t.unique_name);
    console.log(`📋 Allowed question types for org ${organizationId}:`, allowedTypeIds);

    // Build dynamic schema and prompt based on allowed types
    const AIResponseSchema = buildDynamicAIResponseSchema(allowedTypeIds);
    const availableTypesSection = buildAvailableTypesSection(allowedQuestionTypes);
    const SYSTEM_PROMPT = buildSystemPrompt(availableTypesSection);

    // Get model info for logging
    const modelInfo = getModelInfo(selectedQuality);
    const estimatedCredits = CREDIT_COSTS[selectedQuality]; // Estimate before operation

    console.log(`🤖 AI Question Generation`);
    console.table({
      Provider: modelInfo.provider,
      Model: modelInfo.modelId,
      Quality: selectedQuality,
      'Est. Credits': estimatedCredits,
      Organization: organizationId,
      'Allowed Types': allowedTypeIds.length,
    });

    // TODO: Check credit balance before proceeding (use estimatedCredits for pre-check)
    // const hasCredits = await checkCredits(organizationId, estimatedCredits);
    // if (!hasCredits) {
    //   return errorResponse(c, 'Insufficient credits', 402, 'INSUFFICIENT_CREDITS');
    // }

    // Build tracking tag for provider audit
    const trackingTag = buildTrackingTag({
      organizationId,
      operationType: 'question_generation',
      quality: selectedQuality,
    });

    // Get model for selected quality
    const model = getModelForQuality(selectedQuality);

    // Generate structured output using Vercel AI SDK
    // Security: System prompt is separate from user content (industry best practice)
    const result = await generateObject({
      model,
      schema: AIResponseSchema,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildUserMessage(
            sanitizedName.value,
            sanitizedDescription.value,
            sanitizedFocusAreas?.value
          ),
        },
      ],
      temperature: 0.7,
      // Tag for audit (supported by OpenAI and Anthropic)
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          trackingTag,
          organizationId,
          operation: 'question_generation',
          quality: selectedQuality,
        },
      },
    });

    // Extract usage data for audit
    const resultAny = result as any;
    const usage = extractUsageFromResponse(
      {
        usage: result.usage,
        experimental_providerMetadata: resultAny.experimental_providerMetadata,
        providerMetadata: resultAny.providerMetadata,
        response: result.response,
      },
      modelInfo.provider,
      modelInfo.modelId
    );

    // Calculate actual credits based on token usage (0.25 increments)
    const actualCredits = calculateCreditsFromCost(usage.costUsd ?? 0);

    // Log usage data (structured for future persistence)
    logAIUsage({
      requestId: usage.requestId ?? '',
      provider: modelInfo.provider,
      model: modelInfo.modelId,
      quality: selectedQuality,
      organizationId,
      userId,
      operation: 'question_generation',
      tokens: {
        input: usage.inputTokens ?? 0,
        output: usage.outputTokens ?? 0,
        total: usage.totalTokens ?? 0,
      },
      cost: {
        credits: actualCredits,
        estimatedUsd: usage.costUsd ?? null,
      },
      timestamp: usage.timestamp?.toISOString() ?? new Date().toISOString(),
      success: true,
    });

    // TODO: Deduct credits and store audit record (use actualCredits after operation)
    // await consumeCredits(organizationId, actualCredits, {
    //   operationType: 'question_generation',
    //   quality: selectedQuality,
    //   ...usage,
    // });

    // Build response with sanitized AI output to prevent XSS
    const response: SuggestQuestionsResponse = {
      inferred_context: {
        industry: sanitizeAIOutput(result.object.inferred_context.industry),
        audience: sanitizeAIOutput(result.object.inferred_context.audience),
        tone: sanitizeAIOutput(result.object.inferred_context.tone),
        value_props: result.object.inferred_context.value_props.map(sanitizeAIOutput),
      },
      form_structure: {
        branching_recommended: result.object.form_structure.branching_recommended,
        rating_question_index: result.object.form_structure.rating_question_index,
      },
      questions: result.object.questions.map((q, index) => ({
        question_text: sanitizeAIOutput(q.question_text),
        question_key: q.question_key, // Already validated by schema (snake_case)
        question_type_id: q.question_type_id, // Enum, safe
        placeholder: q.placeholder ? sanitizeAIOutput(q.placeholder) : null,
        help_text: q.help_text ? sanitizeAIOutput(q.help_text) : null,
        is_required: q.is_required,
        display_order: index + 1, // Ensure correct ordering
        // Sanitize options for choice questions
        options: q.options
          ? q.options.map((opt) => ({
              option_value: opt.option_value, // snake_case, validated by schema
              option_label: sanitizeAIOutput(opt.option_label),
              display_order: opt.display_order,
            }))
          : null,
        flow_membership: q.flow_membership, // Enum, safe
        is_branch_point: q.is_branch_point,
      })),
      step_content: {
        testimonial_write: {
          title: sanitizeAIOutput(result.object.step_content.testimonial_write.title),
          subtitle: sanitizeAIOutput(result.object.step_content.testimonial_write.subtitle),
          ai_path_title: sanitizeAIOutput(result.object.step_content.testimonial_write.ai_path_title),
          ai_path_description: sanitizeAIOutput(result.object.step_content.testimonial_write.ai_path_description),
          manual_path_title: sanitizeAIOutput(result.object.step_content.testimonial_write.manual_path_title),
          manual_path_description: sanitizeAIOutput(result.object.step_content.testimonial_write.manual_path_description),
        },
        consent: {
          title: sanitizeAIOutput(result.object.step_content.consent.title),
          description: sanitizeAIOutput(result.object.step_content.consent.description),
          public_label: sanitizeAIOutput(result.object.step_content.consent.public_label),
          public_description: sanitizeAIOutput(result.object.step_content.consent.public_description),
          private_label: sanitizeAIOutput(result.object.step_content.consent.private_label),
          private_description: sanitizeAIOutput(result.object.step_content.consent.private_description),
        },
        improvement_thank_you: {
          title: sanitizeAIOutput(result.object.step_content.improvement_thank_you.title),
          message: sanitizeAIOutput(result.object.step_content.improvement_thank_you.message),
        },
      },
    };

    // Return response with usage metadata in headers
    c.header('X-Credits-Used', String(actualCredits));
    c.header('X-AI-Provider', modelInfo.provider);
    c.header('X-AI-Model', modelInfo.modelId);
    if (usage.requestId) {
      c.header('X-AI-Request-ID', usage.requestId);
    }

    return successResponse(c, response);
  } catch (error) {
    console.error('suggestQuestions error:', error);

    // Handle specific AI SDK errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errorResponse(c, 'AI service not configured', 500, 'AI_CONFIG_ERROR');
      }
      if (error.message.includes('rate limit')) {
        return errorResponse(c, 'AI service rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
      }
    }

    // TODO: Refund credits on failure (use estimatedCredits since actual is unknown)
    // await refundCredits(organizationId, estimatedCredits, 'AI operation failed');

    return errorResponse(
      c,
      'Failed to generate questions. Please try again.',
      500,
      'AI_ERROR'
    );
  }
}

export default suggestQuestions;
