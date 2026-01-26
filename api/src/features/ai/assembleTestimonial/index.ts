import type { Context } from 'hono';
import { generateText } from 'ai';
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
} from '@/shared/libs/ai';
import { sanitizeAIOutput, wrapUserContent } from '@/shared/utils/inputSanitizer';
import type {
  AssembleTestimonialRequest,
  AssembleTestimonialResponse,
  TestimonialSuggestion,
  TestimonialMetadata,
} from '@/shared/schemas/ai';
import { getFormById } from './getFormById';

/**
 * System prompt for testimonial assembly
 */
const SYSTEM_PROMPT = `You are an expert testimonial writer who transforms customer Q&A responses into compelling, authentic first-person testimonials.

Your goal is to:
1. Combine the customer's answers into a natural, flowing narrative
2. Preserve their authentic voice and specific details
3. Create a coherent story arc (problem → solution → result)
4. Keep the testimonial concise yet impactful (typically 50-150 words)

IMPORTANT RULES:
- Write in first person from the customer's perspective
- Never add details that weren't mentioned in the answers
- Keep their specific numbers, metrics, and examples
- Don't use marketing buzzwords they didn't use
- Connect their thoughts naturally with smooth transitions

OUTPUT FORMAT:
Return ONLY the testimonial text, nothing else. No quotes, no attribution, just the testimonial content.`;

/**
 * Build the user message with customer answers
 */
function buildUserMessage(
  productName: string,
  answers: AssembleTestimonialRequest['answers'],
  rating?: number,
  modification?: AssembleTestimonialRequest['modification']
): string {
  const answerBlocks = answers
    .map(
      (a) =>
        `<question key="${a.question_key}">${a.question_text}</question>\n<answer>${a.answer}</answer>`
    )
    .join('\n\n');

  let message = `Transform these customer responses into a testimonial for ${wrapUserContent(productName, 'product_name')}:

<customer_responses>
${answerBlocks}
</customer_responses>`;

  if (rating) {
    message += `\n\n<rating>${rating}/5 stars</rating>`;
  }

  if (modification) {
    message += `\n\n<modification_request>
Apply this modification to improve the testimonial:
Suggestion: ${modification.suggestion_id}
Previous testimonial: ${modification.previous_testimonial}
</modification_request>`;
  }

  return message;
}

/**
 * Generate contextual suggestions based on testimonial content
 */
function generateSuggestions(
  testimonial: string,
  rating?: number
): TestimonialSuggestion[] {
  const suggestions: TestimonialSuggestion[] = [];
  const wordCount = testimonial.split(/\s+/).length;

  // Length-based suggestions
  if (wordCount > 100) {
    suggestions.push({
      id: 'make_briefer',
      label: 'Make it briefer',
      description: 'Shorten while keeping key points',
      applicability: Math.min(1, (wordCount - 100) / 100),
    });
  }
  if (wordCount < 60) {
    suggestions.push({
      id: 'add_details',
      label: 'Add more details',
      description: 'Expand with more specific examples',
      applicability: Math.min(1, (60 - wordCount) / 60),
    });
  }

  // Tone suggestions
  if (rating && rating >= 4) {
    suggestions.push({
      id: 'more_enthusiastic',
      label: 'More enthusiastic',
      description: 'Add more energy and excitement',
      applicability: 0.6,
    });
  }

  // Professional vs casual
  suggestions.push({
    id: 'more_professional',
    label: 'More professional',
    description: 'Use a more formal business tone',
    applicability: 0.5,
  });

  suggestions.push({
    id: 'more_casual',
    label: 'More casual',
    description: 'Use a friendlier, conversational tone',
    applicability: 0.5,
  });

  // Sort by applicability and return top 4
  return suggestions.sort((a, b) => b.applicability - a.applicability).slice(0, 4);
}

/**
 * Analyze testimonial metadata
 */
function analyzeTestimonial(testimonial: string): TestimonialMetadata {
  const words = testimonial.split(/\s+/);
  const wordCount = words.length;
  const readingTimeSeconds = Math.ceil(wordCount / 3); // ~3 words per second

  // Simple tone detection based on patterns
  const hasExclamation = testimonial.includes('!');
  const hasStrong = /(\bincredible\b|\bamazing\b|\bfantastic\b|\blove\b)/i.test(testimonial);
  const hasFormal = /(\bconsequently\b|\btherefore\b|\bfurthermore\b)/i.test(testimonial);
  const hasNumbers = /\d+/.test(testimonial);

  // Determine tone
  const formality: TestimonialMetadata['tone']['formality'] = hasFormal
    ? 'formal'
    : hasExclamation || hasStrong
      ? 'casual'
      : 'neutral';
  const energy: TestimonialMetadata['tone']['energy'] = hasExclamation || hasStrong
    ? 'enthusiastic'
    : 'neutral';
  const confidence: TestimonialMetadata['tone']['confidence'] = hasNumbers
    ? 'assertive'
    : 'neutral';

  // Extract key themes (simple keyword extraction)
  const themePatterns: [RegExp, string][] = [
    [/time[-\s]?sav|faster|quick|efficient/i, 'time-saving'],
    [/team|collaborat|together/i, 'collaboration'],
    [/easy|simple|intuitive/i, 'ease-of-use'],
    [/support|help|responsive/i, 'support'],
    [/money|cost|save|ROI|return/i, 'cost-effective'],
    [/quality|reliable|depend/i, 'reliability'],
    [/grow|scale|expand/i, 'scalability'],
  ];

  const keyThemes = themePatterns
    .filter(([pattern]) => pattern.test(testimonial))
    .map(([, theme]) => theme)
    .slice(0, 5);

  return {
    word_count: wordCount,
    reading_time_seconds: readingTimeSeconds,
    tone: {
      formality,
      energy,
      confidence,
    },
    key_themes: keyThemes.length > 0 ? keyThemes : ['general'],
  };
}

/**
 * POST /ai/assemble-testimonial
 * Assemble testimonial from customer Q&A responses
 *
 * @see PRD-005: AI Testimonial Generation
 */
export async function assembleTestimonial(c: Context) {
  try {
    const body = (await c.req.json()) as AssembleTestimonialRequest;
    const { form_id, answers, rating, quality = 'fast', modification } = body;

    // Input validation
    if (!form_id || typeof form_id !== 'string') {
      return errorResponse(c, 'form_id is required', 400, 'VALIDATION_ERROR');
    }
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return errorResponse(c, 'At least one answer is required', 400, 'VALIDATION_ERROR');
    }

    // Fetch form to get product_name
    const formResult = await getFormById(form_id);
    if (!formResult.success) {
      return errorResponse(c, formResult.error, 404, 'FORM_NOT_FOUND');
    }
    const productName = formResult.form.product_name || formResult.form.name;

    // Validate quality level
    const validQualities: QualityLevel[] = ['fast', 'enhanced', 'premium'];
    const selectedQuality: QualityLevel = validQualities.includes(quality as QualityLevel)
      ? (quality as QualityLevel)
      : 'fast';

    // Get model info for logging
    const modelInfo = getModelInfo(selectedQuality);
    const estimatedCredits = CREDIT_COSTS[selectedQuality];

    console.log(`🤖 AI Testimonial Assembly`);
    console.table({
      Provider: modelInfo.provider,
      Model: modelInfo.modelId,
      Quality: selectedQuality,
      'Est. Credits': estimatedCredits,
      FormId: form_id,
      AnswerCount: answers.length,
      IsModification: !!modification,
    });

    // Build tracking tag
    const trackingTag = buildTrackingTag({
      organizationId: 'public', // Public endpoint, no auth required
      operationType: 'testimonial_assembly',
      quality: selectedQuality,
    });

    // Get model for selected quality
    const model = getModelForQuality(selectedQuality);

    // Generate testimonial using Vercel AI SDK
    const result = await generateText({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildUserMessage(productName, answers, rating, modification),
        },
      ],
      temperature: 0.7,
      experimental_telemetry: {
        isEnabled: true,
        metadata: {
          trackingTag,
          operation: 'testimonial_assembly',
          quality: selectedQuality,
        },
      },
    });

    // Extract usage data
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

    // Calculate actual credits
    const actualCredits = calculateCreditsFromCost(usage.costUsd ?? 0);

    // Log usage
    logAIUsage({
      requestId: usage.requestId ?? '',
      provider: modelInfo.provider,
      model: modelInfo.modelId,
      quality: selectedQuality,
      organizationId: 'public',
      operation: 'testimonial_assembly',
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

    // Clean up the generated testimonial
    const testimonial = sanitizeAIOutput(result.text.trim());

    // Generate suggestions and metadata
    const suggestions = generateSuggestions(testimonial, rating);
    const metadata = analyzeTestimonial(testimonial);

    // Build response
    const response: AssembleTestimonialResponse = {
      testimonial,
      suggestions,
      metadata,
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

export default assembleTestimonial;
