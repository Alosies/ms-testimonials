import type { Context } from 'hono';
import { generateObject } from 'ai';
import { successResponse, errorResponse } from '@/shared/utils/http';
import {
  getModelForQuality,
  getModelInfo,
  extractUsageFromResponse,
  buildTrackingTag,
  logAIUsage,
  calculateCreditsFromCost,
  type QualityLevel,
} from '@/shared/libs/ai';
import {
  sanitizeProductName,
  sanitizeProductDescription,
  sanitizeFocusAreas,
  logSuspiciousInput,
  sanitizeAIOutput,
} from '@/shared/utils/inputSanitizer';
import type { SuggestQuestionsResponse } from '@/shared/schemas/ai';
import { getOrganizationAllowedQuestionTypes } from '@/entities/organization';
import {
  executeWithAIAccess,
  type AIExecutionContext,
  type AIOperationResult,
} from '@/features/ai';
import type { QualityLevelId } from '@/features/ai/types';

// Import pure functions
import {
  buildUserMessage,
  buildAvailableTypesSection,
  buildDynamicAIResponseSchema,
} from '../functions';
import { buildSystemPrompt } from '../prompts';

/**
 * Internal response type for the AI generation result
 */
interface QuestionGenerationResult {
  inferred_context: {
    industry: string;
    audience: string;
    tone: string;
    value_props: string[];
  };
  form_structure: {
    branching_recommended: boolean;
    rating_question_index: number;
  };
  questions: Array<{
    question_text: string;
    question_key: string;
    question_type_id: string;
    placeholder: string | null;
    help_text: string | null;
    is_required: boolean;
    display_order: number;
    options: Array<{
      option_value: string;
      option_label: string;
      display_order: number;
    }> | null;
    flow_membership: 'shared' | 'testimonial' | 'improvement';
    is_branch_point: boolean;
  }>;
  step_content: {
    testimonial_write: {
      title: string;
      subtitle: string;
      ai_path_title: string;
      ai_path_description: string;
      manual_path_title: string;
      manual_path_description: string;
    };
    consent: {
      title: string;
      description: string;
      public_label: string;
      public_description: string;
      private_label: string;
      private_description: string;
    };
    thank_you: {
      title: string;
      message: string;
    };
    improvement_thank_you: {
      title: string;
      message: string;
    };
  };
}

/**
 * POST /ai/suggest-questions
 * Generate AI-suggested questions for a testimonial collection form
 *
 * This endpoint uses the ADR-023 credit system to:
 * 1. Check AI capability access for the organization
 * 2. Reserve credits before the operation
 * 3. Execute the AI operation
 * 4. Settle or release credits based on outcome
 */
export async function suggestQuestions(c: Context) {
  // Get auth context for tracking and logging
  const auth = c.get('auth');
  const organizationId = auth?.organizationId;
  const userId = auth?.userId ?? auth?.sub ?? undefined;

  // Require organization context for credit management
  if (!organizationId) {
    return errorResponse(
      c,
      'Organization context required. Please select an organization.',
      403,
      'ORGANIZATION_REQUIRED'
    );
  }

  try {
    const body = await c.req.json();
    const {
      product_name,
      product_description,
      focus_areas,
      qualityLevel,
      idempotencyKey,
    } = body;

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

    // Validate quality level (default to 'fast')
    const validQualities: QualityLevelId[] = ['fast', 'enhanced', 'premium'];
    const selectedQualityLevel: QualityLevelId = validQualities.includes(qualityLevel)
      ? qualityLevel
      : 'fast';

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

    // Generate idempotency key if not provided
    const effectiveIdempotencyKey = idempotencyKey ?? `suggest-${organizationId}-${Date.now()}`;

    // Execute AI operation with credit management
    const executionResult = await executeWithAIAccess<QuestionGenerationResult>({
      organizationId,
      capabilityUniqueName: 'question_generation',
      qualityLevelUniqueName: selectedQualityLevel,
      idempotencyKey: effectiveIdempotencyKey,
      execute: async (context: AIExecutionContext) => {
        // Map quality level to legacy quality for model selection
        // The context.defaultModelId comes from the database, but we still need
        // to use the existing model selection for now until full migration
        const legacyQuality: QualityLevel = selectedQualityLevel;
        const modelInfo = getModelInfo(legacyQuality);

        console.log(`🤖 AI Question Generation`);
        console.table({
          Provider: modelInfo.provider,
          Model: modelInfo.modelId,
          Quality: selectedQualityLevel,
          'Est. Credits': context.estimatedCredits,
          Organization: organizationId,
          'Allowed Types': allowedTypeIds.length,
          'Context Model': context.defaultModelId,
        });

        // Build tracking tag for provider audit
        const trackingTag = buildTrackingTag({
          organizationId,
          operationType: 'question_generation',
          quality: legacyQuality,
        });

        // Get model for selected quality
        const model = getModelForQuality(legacyQuality);

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
              quality: selectedQualityLevel,
              capabilityId: context.capabilityId,
              qualityLevelId: context.qualityLevelId,
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
          quality: legacyQuality,
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

        // Return the operation result with credit info
        const operationResult: AIOperationResult<QuestionGenerationResult> = {
          result: result.object as QuestionGenerationResult,
          actualCredits,
          providerId: modelInfo.provider,
          modelId: modelInfo.modelId,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          providerCostUsd: usage.costUsd ?? undefined,
        };

        return operationResult;
      },
    });

    // Handle execution errors
    if (!executionResult.success) {
      const error = executionResult.error!;
      console.error('AI execution failed:', error);

      // Map error codes to HTTP status codes
      if (error.code === 'ACCESS_DENIED') {
        // Check if it's a credit issue or capability issue
        if (error.message.includes('Insufficient credits')) {
          return c.json(
            {
              error: error.message,
              code: 'INSUFFICIENT_CREDITS',
            },
            402
          );
        }
        // Capability denied
        return c.json(
          {
            error: error.message,
            code: 'CAPABILITY_DENIED',
          },
          403
        );
      }

      if (error.code === 'OPERATION_FAILED') {
        // Check for specific AI errors
        if (error.message.includes('API key')) {
          return errorResponse(c, 'AI service not configured', 500, 'AI_CONFIG_ERROR');
        }
        if (error.message.includes('rate limit')) {
          return errorResponse(c, 'AI service rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT');
        }
        return errorResponse(c, 'Failed to generate questions. Please try again.', 500, 'AI_ERROR');
      }

      // Generic error
      return errorResponse(c, error.message || 'AI operation failed', 500, error.code);
    }

    // Build response with sanitized AI output to prevent XSS
    const aiResult = executionResult.result!;
    const response: SuggestQuestionsResponse = {
      inferred_context: {
        industry: sanitizeAIOutput(aiResult.inferred_context.industry),
        audience: sanitizeAIOutput(aiResult.inferred_context.audience),
        tone: sanitizeAIOutput(aiResult.inferred_context.tone),
        value_props: aiResult.inferred_context.value_props.map(sanitizeAIOutput),
      },
      form_structure: {
        branching_recommended: aiResult.form_structure.branching_recommended,
        rating_question_index: aiResult.form_structure.rating_question_index,
      },
      questions: aiResult.questions.map((q, index) => ({
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
          title: sanitizeAIOutput(aiResult.step_content.testimonial_write.title),
          subtitle: sanitizeAIOutput(aiResult.step_content.testimonial_write.subtitle),
          ai_path_title: sanitizeAIOutput(aiResult.step_content.testimonial_write.ai_path_title),
          ai_path_description: sanitizeAIOutput(aiResult.step_content.testimonial_write.ai_path_description),
          manual_path_title: sanitizeAIOutput(aiResult.step_content.testimonial_write.manual_path_title),
          manual_path_description: sanitizeAIOutput(aiResult.step_content.testimonial_write.manual_path_description),
        },
        consent: {
          title: sanitizeAIOutput(aiResult.step_content.consent.title),
          description: sanitizeAIOutput(aiResult.step_content.consent.description),
          public_label: sanitizeAIOutput(aiResult.step_content.consent.public_label),
          public_description: sanitizeAIOutput(aiResult.step_content.consent.public_description),
          private_label: sanitizeAIOutput(aiResult.step_content.consent.private_label),
          private_description: sanitizeAIOutput(aiResult.step_content.consent.private_description),
        },
        // ADR-018: Shared thank you for ALL users in outro flow
        thank_you: {
          title: sanitizeAIOutput(aiResult.step_content.thank_you.title),
          message: sanitizeAIOutput(aiResult.step_content.thank_you.message),
        },
        // Deprecated: kept for backward compatibility with existing forms
        improvement_thank_you: {
          title: sanitizeAIOutput(aiResult.step_content.improvement_thank_you.title),
          message: sanitizeAIOutput(aiResult.step_content.improvement_thank_you.message),
        },
      },
      // Include credit info in response body (ADR-023)
      credits_used: executionResult.creditsUsed!,
      balance_remaining: executionResult.balanceRemaining!,
    };

    // Return response with usage metadata in headers (for backward compatibility)
    c.header('X-Credits-Used', String(executionResult.creditsUsed));
    c.header('X-Balance-Remaining', String(executionResult.balanceRemaining));

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

    return errorResponse(
      c,
      'Failed to generate questions. Please try again.',
      500,
      'AI_ERROR'
    );
  }
}
