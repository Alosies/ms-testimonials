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
 * Uses customer feedback science principles:
 * - Narrative arc (before → during → after)
 * - Concrete over abstract
 * - Emotion + specificity = persuasive testimonials
 */
function buildPrompt(productName: string, productDescription: string, focusAreas?: string): string {
  const focusSection = focusAreas
    ? `
FOCUS AREAS (User-specified priorities):
${focusAreas}
Incorporate these themes into the questions where natural. Ensure at least 2-3 questions address these focus areas directly.`
    : '';

  return `You are a customer feedback specialist. Generate 5 testimonial collection questions that will elicit compelling, specific, and credible customer stories.

PRODUCT CONTEXT:
- Name: ${productName}
- Description: ${productDescription}
${focusSection}

FIRST, analyze the product to infer:
- Industry/category (SaaS, e-commerce, course, agency, etc.)
- Target audience (who uses this product)
- Key value propositions (what problems it solves)
- Appropriate tone (Professional, Casual, Technical, Friendly)

QUESTION DESIGN PRINCIPLES:
1. Use the "Before → During → After" narrative arc
2. Ask for CONCRETE details (numbers, timeframes, specific examples)
3. Avoid yes/no questions - use open-ended prompts
4. Make questions feel conversational, not like a survey
5. Help customers recall specific moments, not general impressions

GENERATE exactly 5 questions following this framework:

Question 1 - THE STRUGGLE (question_key: "problem_before")
Purpose: Establish the "before state" - pain, frustration, or challenge
Psychology: Makes the transformation story relatable
Type: text_long
Ask about specific frustrations, wasted time/money, or failed alternatives BEFORE ${productName}

Question 2 - THE DISCOVERY (question_key: "solution_experience")
Purpose: Capture the experience of using the product
Psychology: Shows the product in action, builds credibility
Type: text_long
Ask about a specific moment, feature, or interaction that stood out

Question 3 - THE TRANSFORMATION (question_key: "specific_results")
Purpose: Quantify the impact with concrete outcomes
Psychology: Numbers and specifics make testimonials persuasive
Type: text_long
Ask for measurable results: time saved, money earned, problems eliminated, metrics improved

Question 4 - THE VERDICT (question_key: "rating")
Purpose: Capture overall satisfaction as a quantifiable metric
Psychology: Social proof signal, easy to display
Type: rating_star
Ask about overall experience or likelihood to recommend

Question 5 - THE ENDORSEMENT (question_key: "recommendation")
Purpose: Capture advice to others considering the product
Psychology: Peer-to-peer recommendations are highly trusted
Type: text_long
Ask what they would tell someone considering ${productName}

FORMATTING REQUIREMENTS:
- Use "${productName}" directly in questions - never placeholders like "[Product]"
- Write questions as if having a friendly conversation
- Placeholders should guide with examples of good answers
- Help text provides additional context (or null if self-explanatory)
- Questions 1-4: is_required: true
- Question 5: is_required: false (optional but valuable)
- display_order: 1, 2, 3, 4, 5 respectively`;
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
      prompt: buildPrompt(product_name, product_description, focus_areas),
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
