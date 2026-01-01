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
 * Credit Calculation
 *
 * Dynamic credit calculation based on actual USD cost.
 * Uses 0.25 credit increments for fair, granular pricing.
 */

/** How much USD equals 1 credit */
const USD_PER_CREDIT = 0.001; // 1 credit = $0.001 USD

/** Minimum credit charge per operation */
const MIN_CREDITS = 0.25;

/**
 * Calculate credits from actual USD cost
 *
 * Uses dynamic calculation based on token usage rather than fixed costs.
 * Rounds UP to nearest 0.25 increment with a minimum charge.
 *
 * @param costUsd - Actual or estimated USD cost from token usage
 * @returns Credits to charge (minimum 0.25, increments of 0.25)
 *
 * @example
 * calculateCreditsFromCost(0.00048) // → 0.5 credits
 * calculateCreditsFromCost(0.0001)  // → 0.25 credits (minimum)
 * calculateCreditsFromCost(0.0025)  // → 2.5 credits
 */
export function calculateCreditsFromCost(costUsd: number): number {
  if (costUsd <= 0) {
    return MIN_CREDITS;
  }

  const rawCredits = costUsd / USD_PER_CREDIT;

  // Round UP to nearest 0.25 increment
  const roundedCredits = Math.ceil(rawCredits * 4) / 4;

  // Enforce minimum
  return Math.max(roundedCredits, MIN_CREDITS);
}

/**
 * Get the USD to credit conversion rate
 * Useful for displaying to users
 */
export function getCreditConversionRate(): { usdPerCredit: number; minCredits: number } {
  return {
    usdPerCredit: USD_PER_CREDIT,
    minCredits: MIN_CREDITS,
  };
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
 * Raw response structure from Vercel AI SDK
 * Each provider may populate different fields
 *
 * Note: Vercel AI SDK uses different property names depending on provider:
 * - OpenAI: promptTokens, completionTokens
 * - Google: inputTokens, outputTokens
 * - Anthropic: promptTokens, completionTokens
 */
interface RawAIResponse {
  usage?: {
    // OpenAI/Anthropic style
    promptTokens?: number;
    completionTokens?: number;
    // Google style
    inputTokens?: number;
    outputTokens?: number;
    // Common
    totalTokens?: number;
  };
  experimental_providerMetadata?: Record<string, unknown>;
  providerMetadata?: Record<string, unknown>;
  response?: {
    id?: string;
    modelId?: string;
  };
}

/**
 * Extract usage from OpenAI responses
 */
function extractOpenAIUsage(response: RawAIResponse): { input: number; output: number; requestId: string } {
  const usage = response.usage ?? {};
  return {
    input: usage.promptTokens ?? usage.inputTokens ?? 0,
    output: usage.completionTokens ?? usage.outputTokens ?? 0,
    requestId: response.response?.id ?? '',
  };
}

/**
 * Extract usage from Anthropic responses
 */
function extractAnthropicUsage(response: RawAIResponse): { input: number; output: number; requestId: string } {
  const usage = response.usage ?? {};
  return {
    input: usage.promptTokens ?? usage.inputTokens ?? 0,
    output: usage.completionTokens ?? usage.outputTokens ?? 0,
    requestId: response.response?.id ?? '',
  };
}

/**
 * Extract usage from Google Gemini responses
 * Google uses inputTokens/outputTokens (not promptTokens/completionTokens)
 */
function extractGoogleUsage(response: RawAIResponse): { input: number; output: number; requestId: string } {
  const usage = response.usage ?? {};

  // Google uses inputTokens/outputTokens
  return {
    input: usage.inputTokens ?? usage.promptTokens ?? 0,
    output: usage.outputTokens ?? usage.completionTokens ?? 0,
    requestId: response.response?.id ?? '',
  };
}

/**
 * Extract usage from OpenRouter responses
 */
function extractOpenRouterUsage(response: RawAIResponse): { input: number; output: number; requestId: string; cost: number | null } {
  const usage = response.usage ?? {};
  const openrouterMeta = (response.experimental_providerMetadata?.openrouter ?? response.providerMetadata?.openrouter) as {
    generationId?: string;
    totalCost?: number;
  } | undefined;

  return {
    input: usage.promptTokens ?? usage.inputTokens ?? 0,
    output: usage.completionTokens ?? usage.outputTokens ?? 0,
    requestId: openrouterMeta?.generationId ?? response.response?.id ?? '',
    cost: openrouterMeta?.totalCost ?? null,
  };
}

/**
 * Extract usage data from Vercel AI SDK response
 * Uses provider-specific adapters for accurate extraction
 */
export function extractUsageFromResponse(
  response: RawAIResponse,
  provider: AIProvider,
  model: string
): Partial<AIUsageData> {
  let inputTokens = 0;
  let outputTokens = 0;
  let requestId = '';
  let costUsd: number | null = null;

  // Use provider-specific extraction
  switch (provider) {
    case 'openai': {
      const data = extractOpenAIUsage(response);
      inputTokens = data.input;
      outputTokens = data.output;
      requestId = data.requestId;
      break;
    }
    case 'anthropic': {
      const data = extractAnthropicUsage(response);
      inputTokens = data.input;
      outputTokens = data.output;
      requestId = data.requestId;
      break;
    }
    case 'google': {
      const data = extractGoogleUsage(response);
      inputTokens = data.input;
      outputTokens = data.output;
      requestId = data.requestId;
      break;
    }
    case 'openrouter': {
      const data = extractOpenRouterUsage(response);
      inputTokens = data.input;
      outputTokens = data.output;
      requestId = data.requestId;
      costUsd = data.cost;
      break;
    }
    default: {
      // Fallback: try standard usage fields
      const usage = response.usage ?? {};
      inputTokens = usage.promptTokens ?? 0;
      outputTokens = usage.completionTokens ?? 0;
      requestId = response.response?.id ?? '';
    }
  }

  const totalTokens = inputTokens + outputTokens;

  // Calculate cost if not provided by provider
  if (costUsd === null) {
    costUsd = calculateEstimatedCost(model, inputTokens, outputTokens);
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
 * Log entry for AI operations (structured JSON for future log aggregation)
 */
export interface AILogEntry {
  requestId: string;
  provider: AIProvider;
  model: string;
  quality: QualityLevel;
  organizationId: string;
  userId?: string;
  operation: AIOperationType;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    credits: number;
    estimatedUsd: number | null;
  };
  timestamp: string;
  durationMs?: number;
  success: boolean;
  error?: string;
}

/**
 * Log AI operation usage (structured for log aggregation systems)
 * This data can be used to:
 * - Show usage to users in dashboard
 * - Track costs and credit consumption
 * - Monitor AI operation performance
 */
export function logAIUsage(entry: AILogEntry): void {
  const logLevel = entry.success ? '📊' : '❌';
  const usdFormatted = entry.cost.estimatedUsd !== null
    ? `$${entry.cost.estimatedUsd.toFixed(6)}`
    : 'N/A';

  console.log(`${logLevel} AI Usage`);
  console.table({
    Timestamp: entry.timestamp,
    'Request ID': entry.requestId,
    Provider: entry.provider,
    Model: entry.model,
    Quality: entry.quality,
    Operation: entry.operation,
    'User ID': entry.userId ?? 'N/A',
    Organization: entry.organizationId,
    'Input Tokens': entry.tokens.input,
    'Output Tokens': entry.tokens.output,
    'Total Tokens': entry.tokens.total,
    Credits: entry.cost.credits,
    'Est. USD': usdFormatted,
    Success: entry.success ? 'Yes' : 'No',
  });
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
