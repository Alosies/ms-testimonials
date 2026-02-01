import { generateText } from 'ai';
import {
  getModelForQuality,
  getModelInfo,
  extractUsageFromResponse,
  buildTrackingTag,
  logAIUsage,
  calculateCreditsFromCost,
  calculateEstimatedCost,
  type QualityLevel,
} from '@/shared/libs/ai';
import { sanitizeAIOutput } from '@/shared/utils/inputSanitizer';
import type {
  AssembleTestimonialRequest,
  TestimonialSuggestion,
  TestimonialMetadata,
} from '@/shared/schemas/ai';
import type { AIExecutionContext } from '@/features/ai';
import { TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT } from '../prompts';
import { buildUserMessage, deriveSuggestions, analyzeTestimonial } from '../functions';

/**
 * Result of testimonial assembly operation
 */
export interface AssemblyResult {
  testimonial: string;
  suggestions: TestimonialSuggestion[];
  metadata: TestimonialMetadata;
}

/**
 * Parameters for executeAssembly function
 */
export interface ExecuteAssemblyParams {
  context: AIExecutionContext;
  productName: string;
  answers: AssembleTestimonialRequest['answers'];
  rating?: number;
  modification?: AssembleTestimonialRequest['modification'];
  selectedQuality: QualityLevel;
  organizationId: string;
}

/**
 * Result returned by executeAssembly including credit information
 */
export interface ExecuteAssemblyResult {
  result: AssemblyResult;
  actualCredits: number;
  providerId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  providerCostUsd: number;
}

/**
 * Execute the AI testimonial assembly operation.
 *
 * This is the core AI call that:
 * 1. Builds the prompt from customer answers
 * 2. Calls the AI model to generate a testimonial
 * 3. Analyzes the result and generates suggestions
 * 4. Returns credit usage information
 */
export async function executeAssembly(
  params: ExecuteAssemblyParams
): Promise<ExecuteAssemblyResult> {
  const {
    productName,
    answers,
    rating,
    modification,
    selectedQuality,
    organizationId,
  } = params;

  // Get model info for the selected quality
  const modelInfo = getModelInfo(selectedQuality);

  // Build tracking tag
  const trackingTag = buildTrackingTag({
    organizationId,
    operationType: 'testimonial_assembly',
    quality: selectedQuality,
  });

  // Get model for selected quality
  const model = getModelForQuality(selectedQuality);

  // Generate testimonial using Vercel AI SDK
  const result = await generateText({
    model,
    messages: [
      { role: 'system', content: TESTIMONIAL_ASSEMBLY_SYSTEM_PROMPT },
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

  // Calculate actual credits from cost
  const costUsd = usage.costUsd ?? calculateEstimatedCost(
    modelInfo.modelId,
    usage.inputTokens ?? 0,
    usage.outputTokens ?? 0
  );
  const actualCredits = calculateCreditsFromCost(costUsd);

  // Log usage
  logAIUsage({
    requestId: usage.requestId ?? '',
    provider: modelInfo.provider,
    model: modelInfo.modelId,
    quality: selectedQuality,
    organizationId,
    operation: 'testimonial_assembly',
    tokens: {
      input: usage.inputTokens ?? 0,
      output: usage.outputTokens ?? 0,
      total: usage.totalTokens ?? 0,
    },
    cost: {
      credits: actualCredits,
      estimatedUsd: costUsd,
    },
    timestamp: usage.timestamp?.toISOString() ?? new Date().toISOString(),
    success: true,
  });

  // Clean up the generated testimonial
  const testimonial = sanitizeAIOutput(result.text.trim());

  // Generate suggestions and metadata
  const suggestions = deriveSuggestions(testimonial, rating);
  const metadata = analyzeTestimonial(testimonial);

  return {
    result: {
      testimonial,
      suggestions,
      metadata,
    },
    actualCredits,
    providerId: modelInfo.provider,
    modelId: modelInfo.modelId,
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    providerCostUsd: costUsd,
  };
}
