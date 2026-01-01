/**
 * AI Provider Configuration
 *
 * Supports multiple AI providers with easy switching via environment variable.
 * Uses Vercel AI SDK for provider-agnostic interface.
 *
 * Supported providers:
 * - openai: Direct OpenAI API (default, cost-effective)
 * - anthropic: Direct Anthropic API (premium quality)
 * - google: Google Gemini API (good balance of cost and quality)
 */

import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import { env } from '@/shared/config/env';

/**
 * Supported AI providers
 * Note: openrouter is reserved for future use (multi-model routing)
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'openrouter';

/**
 * Model presets for different use cases
 * Maps to user-facing quality levels
 */
export type ModelPreset = 'fast' | 'balanced' | 'powerful';

/**
 * Quality level (user-facing names)
 */
export type QualityLevel = 'fast' | 'enhanced' | 'premium';

/**
 * Estimated credit costs per quality level
 *
 * These are ESTIMATES used for:
 * - Pre-operation credit balance checks
 * - UI display to users before they run an operation
 *
 * Actual credits are calculated dynamically based on token usage
 * using calculateCreditsFromCost() after the operation completes.
 * This ensures fair billing based on actual consumption.
 */
export const CREDIT_COSTS: Record<QualityLevel, number> = {
  fast: 1,      // Typical range: 0.25 - 2 credits
  enhanced: 5,  // Typical range: 2 - 8 credits
  premium: 12,  // Typical range: 5 - 20 credits
};

/**
 * Map quality level to model preset
 */
export const QUALITY_TO_PRESET: Record<QualityLevel, ModelPreset> = {
  fast: 'fast',
  enhanced: 'balanced',
  premium: 'powerful',
};

/**
 * Model configuration per provider and preset
 */
const MODEL_CONFIG: Record<AIProvider, Record<ModelPreset, string>> = {
  openai: {
    fast: 'gpt-4o-mini',
    balanced: 'gpt-4o',
    powerful: 'gpt-4o', // Use gpt-5 when available
  },
  anthropic: {
    fast: 'claude-3-5-haiku-latest',
    balanced: 'claude-sonnet-4-20250514',  // Using Sonnet 4 for balanced (3.5 sonnet deprecated)
    powerful: 'claude-sonnet-4-20250514',
  },
  google: {
    fast: 'gemini-2.0-flash',        // Fast and cost-effective
    balanced: 'gemini-2.5-flash',    // Great balance of speed and quality
    powerful: 'gemini-2.5-pro',      // Highest quality
  },
  // Reserved for future use - OpenRouter model IDs
  openrouter: {
    fast: 'google/gemini-2.0-flash-exp:free',
    balanced: 'anthropic/claude-3.5-sonnet',
    powerful: 'anthropic/claude-3-opus',
  },
};

/**
 * Get the configured AI provider from environment
 */
export function getAIProvider(): AIProvider {
  const provider = env.AI_PROVIDER?.toLowerCase();
  if (provider === 'anthropic') return 'anthropic';
  if (provider === 'google') return 'google';
  return 'openai'; // default
}

/**
 * Create OpenAI provider instance
 */
function createOpenAIProvider() {
  if (!env.OPENAI_API_KEY) {
    throw new Error(
      `AI provider "openai" is selected (AI_PROVIDER=${env.AI_PROVIDER}) but OPENAI_API_KEY is not configured. ` +
        `Either set OPENAI_API_KEY or change AI_PROVIDER to a configured provider.`
    );
  }
  return createOpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

/**
 * Create Anthropic provider instance
 */
function createAnthropicProvider() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error(
      `AI provider "anthropic" is selected (AI_PROVIDER=${env.AI_PROVIDER}) but ANTHROPIC_API_KEY is not configured. ` +
        `Either set ANTHROPIC_API_KEY or change AI_PROVIDER to a configured provider.`
    );
  }
  return createAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
  });
}

/**
 * Create Google Gemini provider instance
 */
function createGoogleProvider() {
  if (!env.GOOGLE_API_KEY) {
    throw new Error(
      `AI provider "google" is selected (AI_PROVIDER=${env.AI_PROVIDER}) but GOOGLE_API_KEY is not configured. ` +
        `Either set GOOGLE_API_KEY or change AI_PROVIDER to a configured provider.`
    );
  }
  return createGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
  });
}

/**
 * Get a language model for the specified preset
 *
 * @param preset - Model preset (fast, balanced, powerful)
 * @param providerOverride - Optional provider override (defaults to env config)
 * @returns Language model instance
 *
 * @example
 * ```ts
 * // Use default provider from env
 * const model = getModel('fast');
 *
 * // Force specific provider
 * const model = getModel('balanced', 'anthropic');
 *
 * // Use quality level
 * const model = getModelForQuality('enhanced');
 * ```
 */
export function getModel(
  preset: ModelPreset = 'fast',
  providerOverride?: AIProvider
): LanguageModel {
  const provider = providerOverride ?? getAIProvider();
  const modelId = MODEL_CONFIG[provider][preset];

  if (provider === 'anthropic') {
    const anthropic = createAnthropicProvider();
    return anthropic(modelId);
  }

  if (provider === 'google') {
    const google = createGoogleProvider();
    return google(modelId);
  }

  // Default to OpenAI
  const openai = createOpenAIProvider();
  return openai(modelId);
}

/**
 * Get a language model for the specified quality level
 * This is the main function to use in features
 */
export function getModelForQuality(
  quality: QualityLevel,
  providerOverride?: AIProvider
): LanguageModel {
  const preset = QUALITY_TO_PRESET[quality];
  return getModel(preset, providerOverride);
}

/**
 * Get model info for logging/debugging
 */
export function getModelInfo(
  quality: QualityLevel,
  providerOverride?: AIProvider
): {
  provider: AIProvider;
  modelId: string;
  quality: QualityLevel;
  creditCost: number;
} {
  const provider = providerOverride ?? getAIProvider();
  const preset = QUALITY_TO_PRESET[quality];
  const modelId = MODEL_CONFIG[provider][preset];

  return {
    provider,
    modelId,
    quality,
    creditCost: CREDIT_COSTS[quality],
  };
}

/**
 * Check if a provider is available (has API key configured)
 */
export function isProviderAvailable(provider: AIProvider): boolean {
  switch (provider) {
    case 'openai':
      return !!env.OPENAI_API_KEY;
    case 'anthropic':
      return !!env.ANTHROPIC_API_KEY;
    case 'google':
      return !!env.GOOGLE_API_KEY;
    default:
      return false;
  }
}
