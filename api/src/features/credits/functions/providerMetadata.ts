/**
 * Provider Metadata Functions
 *
 * Pure functions for building provider metadata objects.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import type { SettleCreditParams } from '../types';

/**
 * Builds provider metadata JSONB object for the transaction record.
 *
 * @param params - Settlement parameters containing optional provider info
 * @returns Provider metadata object, or null if no provider fields provided
 *
 * @example
 * ```typescript
 * buildProviderMetadata({
 *   reservationId: 'res_123',
 *   actualCredits: 2.5,
 *   providerId: 'openai',
 *   modelId: 'gpt-4o-mini',
 *   inputTokens: 100,
 *   outputTokens: 50,
 * });
 * // → { provider: 'openai', model: 'gpt-4o-mini', input_tokens: 100, output_tokens: 50 }
 *
 * buildProviderMetadata({ reservationId: 'res_123', actualCredits: 1.0 });
 * // → null
 * ```
 */
export function buildProviderMetadata(
  params: Pick<SettleCreditParams, 'providerId' | 'modelId' | 'inputTokens' | 'outputTokens' | 'providerCostUsd'>
): Record<string, unknown> | null {
  const { providerId, modelId, inputTokens, outputTokens, providerCostUsd } = params;

  // Only create metadata if at least one provider field is provided
  if (
    !providerId &&
    !modelId &&
    inputTokens === undefined &&
    outputTokens === undefined &&
    providerCostUsd === undefined
  ) {
    return null;
  }

  const metadata: Record<string, unknown> = {};

  if (providerId) metadata.provider = providerId;
  if (modelId) metadata.model = modelId;
  if (inputTokens !== undefined) metadata.input_tokens = inputTokens;
  if (outputTokens !== undefined) metadata.output_tokens = outputTokens;
  if (providerCostUsd !== undefined) metadata.provider_cost_usd = providerCostUsd;

  return metadata;
}
