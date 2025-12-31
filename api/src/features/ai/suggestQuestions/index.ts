import type { Context } from 'hono';
import { generateObject } from 'ai';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/shared/utils/http';
import {
  getModelForQuality,
  getModelInfo,
  CREDIT_COSTS,
  extractUsageFromResponse,
  buildTrackingTag,
  type QualityLevel,
  type AIUsageData,
} from '@/shared/libs/ai';
import type { SuggestQuestionsResponse } from '@/shared/schemas/ai';

/**
 * Zod schema for AI-generated response
 * Used by generateObject for structured output
 */
const AIResponseSchema = z.object({
  inferred_context: z.object({
    industry: z.string().describe('The inferred industry/category (e.g., SaaS, e-commerce, course, agency)'),
    audience: z.string().describe('The target audience (e.g., Remote teams, project managers)'),
    tone: z.string().describe('Recommended tone (Professional, Casual, Technical, Friendly)'),
    value_props: z.array(z.string()).describe('Key value propositions inferred from description'),
  }),
  questions: z.array(z.object({
    question_text: z.string().describe('The question to display to customers'),
    question_key: z.string().describe('Unique snake_case identifier for the question'),
    question_type_id: z.enum(['text_long', 'text_short', 'rating_star', 'rating_nps']).describe('Question input type'),
    placeholder: z.string().nullable().describe('Placeholder text for the input field'),
    help_text: z.string().nullable().describe('Help text displayed below the input'),
    is_required: z.boolean().describe('Whether the question is required'),
    display_order: z.number().int().describe('Display order of the question (1-indexed)'),
  })).length(5).describe('Exactly 5 testimonial collection questions'),
});

/**
 * Build the prompt for question generation
 */
function buildPrompt(productName: string, productDescription: string): string {
  return `Generate 5 testimonial collection questions for this product.

Product Name: ${productName}
Product Description: ${productDescription}

First, analyze the product to infer:
- Industry/category (SaaS, e-commerce, course, agency, etc.)
- Target audience (who uses this product)
- Key value propositions (what problems it solves)
- Appropriate tone (Professional, Casual, Technical, Friendly)

Then generate exactly 5 questions following these guidelines:

1. Question 1 (question_key: "problem_before"): Ask about the problem/challenge BEFORE using the product. Use question_type_id: "text_long"

2. Question 2 (question_key: "solution_impact"): Ask about HOW the product helped solve it. Use question_type_id: "text_long"

3. Question 3 (question_key: "specific_results"): Ask about specific RESULTS or outcomes (numbers, time saved, etc.). Use question_type_id: "text_long"

4. Question 4 (question_key: "rating"): A rating question asking about overall experience. Use question_type_id: "rating_star"

5. Question 5 (question_key: "recommendation"): Ask for recommendation or additional thoughts. Use question_type_id: "text_long"

Important guidelines:
- Use the actual product name "${productName}" in questions, never use placeholders like "[Product]"
- Make questions conversational and specific to the product context
- Placeholders should guide users on what to write
- Help text should provide additional context where useful (or null if not needed)
- Questions 1-4 should be required (is_required: true)
- Question 5 should be optional (is_required: false)
- display_order should be 1, 2, 3, 4, 5 respectively`;
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
    const { product_name, product_description, quality = 'fast' } = body;

    // Input validation
    if (!product_name || typeof product_name !== 'string') {
      return errorResponse(c, 'product_name is required', 400, 'VALIDATION_ERROR');
    }
    if (!product_description || typeof product_description !== 'string') {
      return errorResponse(c, 'product_description is required', 400, 'VALIDATION_ERROR');
    }
    if (product_description.length < 10) {
      return errorResponse(c, 'product_description must be at least 10 characters', 400, 'VALIDATION_ERROR');
    }

    // Validate quality level
    const validQualities: QualityLevel[] = ['fast', 'enhanced', 'premium'];
    const selectedQuality: QualityLevel = validQualities.includes(quality) ? quality : 'fast';

    // Get auth context for tracking
    const auth = c.get('auth');
    const organizationId = auth?.organizationId ?? 'anonymous';

    // Get model info for logging
    const modelInfo = getModelInfo(selectedQuality);
    const creditsRequired = CREDIT_COSTS[selectedQuality];

    console.log(`🤖 AI Question Generation`);
    console.log(`   Provider: ${modelInfo.provider}`);
    console.log(`   Model: ${modelInfo.modelId}`);
    console.log(`   Quality: ${selectedQuality}`);
    console.log(`   Credits: ${creditsRequired}`);
    console.log(`   Org: ${organizationId}`);

    // TODO: Check credit balance before proceeding
    // const hasCredits = await checkCredits(organizationId, creditsRequired);
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
    const result = await generateObject({
      model,
      schema: AIResponseSchema,
      prompt: buildPrompt(product_name, product_description),
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
    // Note: experimental_providerMetadata may not be available in all SDK versions
    const resultAny = result as any;
    const usage = extractUsageFromResponse(
      {
        usage: result.usage,
        experimental_providerMetadata: resultAny.experimental_providerMetadata,
        response: result.response,
      },
      modelInfo.provider,
      modelInfo.modelId
    );

    console.log(`📊 AI Usage`);
    console.log(`   Input tokens: ${usage.inputTokens}`);
    console.log(`   Output tokens: ${usage.outputTokens}`);
    console.log(`   Cost: $${usage.costUsd?.toFixed(6) ?? 'unknown'}`);
    console.log(`   Request ID: ${usage.requestId}`);

    // TODO: Deduct credits and store audit record
    // await consumeCredits(organizationId, creditsRequired, {
    //   operationType: 'question_generation',
    //   quality: selectedQuality,
    //   ...usage,
    // });

    // Build response
    const response: SuggestQuestionsResponse = {
      inferred_context: result.object.inferred_context,
      questions: result.object.questions.map((q, index) => ({
        ...q,
        display_order: index + 1, // Ensure correct ordering
      })),
    };

    // Return response with usage metadata in headers
    c.header('X-Credits-Used', String(creditsRequired));
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

    // TODO: Refund credits on failure
    // await refundCredits(organizationId, creditsRequired, 'AI operation failed');

    return errorResponse(
      c,
      'Failed to generate questions. Please try again.',
      500,
      'AI_ERROR'
    );
  }
}

export default suggestQuestions;
