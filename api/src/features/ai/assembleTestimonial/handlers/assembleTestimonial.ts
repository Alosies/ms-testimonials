import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import type { QualityLevel } from '@/shared/libs/ai';
import type {
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
} from '@/shared/schemas/ai';
import {
  executeWithAIAccess,
  type AIExecutionContext,
  type AICapabilityId,
  type QualityLevelId,
} from '@/features/ai';
import { getFormById } from './getFormById';
import { executeAssembly, type AssemblyResult } from './executeAssembly';

/**
 * POST /ai/assemble-testimonial
 * Assemble testimonial from customer Q&A responses
 *
 * Uses the credit system via executeWithAIAccess to:
 * 1. Check capability access and credit balance
 * 2. Reserve credits before the AI operation
 * 3. Settle credits after successful completion
 *
 * @see PRD-005: AI Testimonial Generation
 * @see ADR-023: AI Capabilities Plan Integration
 */
export async function assembleTestimonial(c: Context) {
  try {
    const body = (await c.req.json()) as AssembleTestimonialRequest;
    const {
      form_id,
      answers,
      rating,
      quality,
      qualityLevel,
      idempotencyKey,
      modification,
    } = body;

    // Input validation
    if (!form_id || typeof form_id !== 'string') {
      return errorResponse(c, 'form_id is required', 400, 'VALIDATION_ERROR');
    }
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return errorResponse(c, 'At least one answer is required', 400, 'VALIDATION_ERROR');
    }

    // Fetch form to get product_name and organization_id
    const formResult = await getFormById(form_id);
    if (!formResult.success) {
      return errorResponse(c, formResult.error, 404, 'FORM_NOT_FOUND');
    }
    const productName = formResult.form.product_name || formResult.form.name;
    const organizationId = formResult.form.organization_id;

    // Determine quality level (prefer qualityLevel over deprecated quality field)
    const validQualities: QualityLevel[] = ['fast', 'enhanced', 'premium'];
    const requestedQuality = qualityLevel ?? quality ?? 'fast';
    const selectedQuality: QualityLevel = validQualities.includes(requestedQuality as QualityLevel)
      ? (requestedQuality as QualityLevel)
      : 'fast';

    // Generate idempotency key if not provided
    const effectiveIdempotencyKey = idempotencyKey ?? `assemble-${form_id}-${Date.now()}`;

    console.log(`AI Testimonial Assembly (with credits)`);
    console.table({
      OrganizationId: organizationId,
      FormId: form_id,
      QualityLevel: selectedQuality,
      AnswerCount: answers.length,
      IsModification: !!modification,
      IdempotencyKey: effectiveIdempotencyKey,
    });

    // Execute with credit management
    const executionResult = await executeWithAIAccess<AssemblyResult>({
      organizationId,
      capabilityUniqueName: 'testimonial_assembly' as AICapabilityId,
      qualityLevelUniqueName: selectedQuality as QualityLevelId,
      idempotencyKey: effectiveIdempotencyKey,
      // Audit context (ADR-023 Decision 8)
      // Note: This is a public endpoint (form submission), so no authenticated user
      userId: null,
      userEmail: null,
      formId: form_id,
      formName: formResult.form.name ?? null,
      execute: async (context: AIExecutionContext) => {
        return executeAssembly({
          context,
          productName,
          answers,
          rating,
          modification,
          selectedQuality,
          organizationId,
        });
      },
    });

    // Handle execution failure
    if (!executionResult.success) {
      const error = executionResult.error!;

      // Map error codes to HTTP status codes
      switch (error.code) {
        case 'ACCESS_DENIED':
          // Check if it's a credits issue or capability issue
          if (error.message.includes('Insufficient credits')) {
            return errorResponse(
              c,
              error.message,
              402, // Payment Required
              'INSUFFICIENT_CREDITS'
            );
          }
          return errorResponse(
            c,
            error.message,
            403, // Forbidden
            'CAPABILITY_DENIED'
          );

        case 'OPERATION_FAILED':
          // Check for specific AI errors
          if (error.message.includes('API key')) {
            return errorResponse(c, 'AI service not configured', 500, 'AI_CONFIG_ERROR');
          }
          if (error.message.includes('rate limit')) {
            return errorResponse(
              c,
              'AI service rate limit exceeded. Please try again later.',
              429,
              'RATE_LIMIT'
            );
          }
          return errorResponse(
            c,
            'Failed to generate testimonial. Please try again.',
            500,
            'AI_ERROR'
          );

        case 'UNEXPECTED_ERROR':
        default:
          return errorResponse(
            c,
            error.message || 'An unexpected error occurred',
            500,
            'INTERNAL_ERROR'
          );
      }
    }

    // Build successful response with credit information
    const response: AssembleTestimonialResponse = {
      ...executionResult.result!,
      credits_used: executionResult.creditsUsed,
      balance_remaining: executionResult.balanceRemaining,
    };

    // Set response headers with credit info
    if (executionResult.creditsUsed !== undefined) {
      c.header('X-Credits-Used', String(executionResult.creditsUsed));
    }
    if (executionResult.balanceRemaining !== undefined) {
      c.header('X-Balance-Remaining', String(executionResult.balanceRemaining));
    }

    return successResponse(c, response);
  } catch (error) {
    console.error('assembleTestimonial error:', error);

    // Handle specific AI SDK errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return errorResponse(c, 'AI service not configured', 500, 'AI_CONFIG_ERROR');
      }
      if (error.message.includes('rate limit')) {
        return errorResponse(
          c,
          'AI service rate limit exceeded. Please try again later.',
          429,
          'RATE_LIMIT'
        );
      }
    }

    return errorResponse(
      c,
      'Failed to generate testimonial. Please try again.',
      500,
      'AI_ERROR'
    );
  }
}
