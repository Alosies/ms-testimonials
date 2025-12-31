/**
 * AI Audit Tracking
 *
 * Captures usage data from AI operations for:
 * 1. Credit reconciliation
 * 2. Cost analysis
 * 3. Provider billing verification
 */

import type { AIProvider, QualityLevel } from './providers';

/**
 * AI operation types that consume credits
 */
export type AIOperationType =
  | 'question_generation'
  | 'testimonial_assembly'
  | 'testimonial_polish'
  | 'ai_regenerate';

/**
 * Usage data captured from AI response
 */
export interface AIUsageData {
  /** Provider used (openai, anthropic, openrouter) */
  provider: AIProvider;

  /** Actual model ID used */
  model: string;

  /** Quality level requested */
  quality: QualityLevel;

  /** Provider's request/generation ID */
  requestId: string;

  /** Input/prompt tokens used */
  inputTokens: number;

  /** Output/completion tokens used */
  outputTokens: number;

  /** Total tokens (input + output) */
  totalTokens: number;

  /**
   * Actual cost in USD (if available)
   * Only OpenRouter returns this directly
   * For others, we calculate from token counts
   */
  costUsd: number | null;

  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Full audit record for an AI operation
 */
export interface AIAuditRecord {
  /** Our internal transaction ID */
  transactionId: string;

  /** Organization that consumed credits */
  organizationId: string;

  /** Type of AI operation */
  operationType: AIOperationType;

  /** Credits charged */
  creditsCharged: number;

  /** Related entity (form, testimonial, etc.) */
  relatedEntityType?: 'form' | 'testimonial' | 'form_question';
  relatedEntityId?: string;

  /** Usage data from provider */
  usage: AIUsageData;

  /** Whether the operation succeeded */
  success: boolean;

  /** Error message if failed */
  errorMessage?: string;
}

/**
 * Tracking context passed to AI operations
 */
export interface AITrackingContext {
  organizationId: string;
  operationType: AIOperationType;
  quality: QualityLevel;
  relatedEntityType?: 'form' | 'testimonial' | 'form_question';
  relatedEntityId?: string;
}

/**
 * Estimated costs per 1M tokens by provider/model
 * Used for cost calculation when provider doesn't return actual cost
 */
const COST_PER_MILLION_TOKENS: Record<string, { input: number; output: number }> = {
  // OpenAI
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-5': { input: 1.25, output: 10.00 },

  // Anthropic
  'claude-3-5-haiku-latest': { input: 1.00, output: 5.00 },
  'claude-3-5-sonnet-latest': { input: 3.00, output: 15.00 },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },

  // Google Gemini (2025 pricing)
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },       // Fast and efficient
  'gemini-2.5-flash': { input: 0.15, output: 0.60 },       // Great balance
  'gemini-2.5-pro': { input: 1.25, output: 5.00 },         // Highest quality
};

/**
 * Calculate estimated cost from token usage
 */
export function calculateEstimatedCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = COST_PER_MILLION_TOKENS[model];
  if (!costs) {
    // Default to GPT-4o-mini costs if model not found
    return (inputTokens * 0.15 + outputTokens * 0.60) / 1_000_000;
  }

  return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
}

/**
 * Build tracking tag for provider request
 * Used to identify requests in provider dashboards
 */
export function buildTrackingTag(context: AITrackingContext): string {
  const parts = [
    `org:${context.organizationId}`,
    `op:${context.operationType}`,
    `q:${context.quality}`,
  ];

  if (context.relatedEntityType && context.relatedEntityId) {
    parts.push(`${context.relatedEntityType}:${context.relatedEntityId}`);
  }

  return parts.join('|');
}

/**
 * Extract usage data from Vercel AI SDK response
 */
export function extractUsageFromResponse(
  response: {
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    experimental_providerMetadata?: {
      openrouter?: {
        generationId?: string;
        totalCost?: number;
      };
    };
    response?: {
      id?: string;
      modelId?: string;
    };
  },
  provider: AIProvider,
  model: string
): Partial<AIUsageData> {
  const usage = response.usage ?? {};
  const inputTokens = usage.promptTokens ?? 0;
  const outputTokens = usage.completionTokens ?? 0;
  const totalTokens = usage.totalTokens ?? inputTokens + outputTokens;

  // Try to get actual cost from OpenRouter
  let costUsd: number | null = null;
  const openrouterMeta = response.experimental_providerMetadata?.openrouter;
  if (openrouterMeta?.totalCost) {
    costUsd = openrouterMeta.totalCost;
  } else {
    // Calculate estimated cost
    costUsd = calculateEstimatedCost(model, inputTokens, outputTokens);
  }

  // Get request ID
  let requestId = response.response?.id ?? '';
  if (openrouterMeta?.generationId) {
    requestId = openrouterMeta.generationId;
  }

  return {
    provider,
    model: response.response?.modelId ?? model,
    inputTokens,
    outputTokens,
    totalTokens,
    costUsd,
    requestId,
    timestamp: new Date(),
  };
}

/**
 * Create a full audit record
 */
export function createAuditRecord(
  transactionId: string,
  context: AITrackingContext,
  usage: Partial<AIUsageData>,
  creditsCharged: number,
  success: boolean,
  errorMessage?: string
): AIAuditRecord {
  return {
    transactionId,
    organizationId: context.organizationId,
    operationType: context.operationType,
    creditsCharged,
    relatedEntityType: context.relatedEntityType,
    relatedEntityId: context.relatedEntityId,
    usage: {
      provider: usage.provider ?? 'openai',
      model: usage.model ?? 'unknown',
      quality: context.quality,
      requestId: usage.requestId ?? '',
      inputTokens: usage.inputTokens ?? 0,
      outputTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
      costUsd: usage.costUsd ?? null,
      timestamp: usage.timestamp ?? new Date(),
    },
    success,
    errorMessage,
  };
}
