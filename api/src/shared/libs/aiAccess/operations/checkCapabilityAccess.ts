/**
 * Check AI Capability Access
 *
 * Checks if an organization can access a specific AI capability based on their plan.
 * This function queries the plan-capability junction tables to determine:
 * - If the capability exists and is active
 * - If the organization's plan has access to the capability
 * - What quality levels are available for the capability
 * - What LLM models are allowed at each quality level
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T3.2)
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import type {
  AICapabilityId,
  QualityLevelId,
  AICapabilityAccessResult,
  AICapabilityDenialReason,
  QualityLevelInfo,
} from '../types';

// =============================================================================
// Row Types for Drizzle Query Results
// =============================================================================

/** Row type from the main capability access query */
interface CapabilityAccessRow {
  capability_id: string;
  capability_name: string;
  is_enabled: string | boolean;
  rate_limit_rpm: string | null;
  rate_limit_rpd: string | null;
  estimated_credits_fast: string;
  estimated_credits_enhanced: string;
  estimated_credits_premium: string;
  [key: string]: unknown;
}

/** Row type for quality level information */
interface QualityLevelRow {
  quality_level_id: string;
  unique_name: string;
  quality_name: string;
  credit_multiplier: string;
  [key: string]: unknown;
}

/** Row type for model information */
interface ModelRow {
  quality_level_id: string;
  model_id: string;
  is_default: string | boolean;
  [key: string]: unknown;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Check if an organization can access a specific AI capability.
 *
 * This function performs a multi-step check:
 * 1. Verifies the capability exists and is active
 * 2. Checks if the organization's plan includes the capability
 * 3. Retrieves available quality levels for the plan-capability combination
 * 4. Fetches allowed LLM models for each quality level
 *
 * @param organizationId - The organization ID to check
 * @param capabilityUniqueName - The unique name of the AI capability (e.g., 'question_generation')
 * @param qualityLevelUniqueName - Optional: specific quality level to validate
 * @returns Access result with available quality levels and rate limits
 *
 * @example
 * ```typescript
 * const access = await checkCapabilityAccess(
 *   orgId,
 *   'testimonial_assembly',
 *   'enhanced'
 * );
 *
 * if (access.hasAccess) {
 *   // Proceed with AI operation
 *   const qualityLevel = access.availableQualityLevels[0];
 *   console.log(`Using model: ${qualityLevel.defaultModelId}`);
 * } else {
 *   console.log(`Access denied: ${access.reason}`);
 * }
 * ```
 */
export async function checkCapabilityAccess(
  organizationId: string,
  capabilityUniqueName: AICapabilityId,
  qualityLevelUniqueName?: QualityLevelId
): Promise<AICapabilityAccessResult> {
  const db = getDb();

  // Step 1: Get capability and plan access in a single query
  // This joins through: organization -> organization_plans -> plan -> plan_ai_capabilities -> ai_capabilities
  const accessResult = await db.execute<CapabilityAccessRow>(sql`
    SELECT
      ac.id as capability_id,
      ac.name as capability_name,
      pac.is_enabled,
      pac.rate_limit_rpm,
      pac.rate_limit_rpd,
      ac.estimated_credits_fast,
      ac.estimated_credits_enhanced,
      ac.estimated_credits_premium
    FROM ai_capabilities ac
    LEFT JOIN plan_ai_capabilities pac ON pac.ai_capability_id = ac.id
    LEFT JOIN organization_plans op ON op.plan_id = pac.plan_id
      AND op.organization_id = ${organizationId}
      AND op.status IN ('active', 'trial')
    WHERE ac.unique_name = ${capabilityUniqueName}
      AND ac.is_active = true
  `);

  // Step 1a: Check if capability exists
  if (accessResult.length === 0) {
    return createDeniedResult(capabilityUniqueName, 'capability_not_included');
  }

  const capabilityRow = accessResult[0];

  // Step 1b: Check if plan has access to this capability
  // If is_enabled is null, it means the join to plan_ai_capabilities or organization_plans failed
  // (no active plan or plan doesn't include this capability)
  if (capabilityRow.is_enabled === null || capabilityRow.is_enabled === false) {
    return createDeniedResult(
      capabilityUniqueName,
      'capability_not_included',
      capabilityRow.capability_id,
      capabilityRow.capability_name
    );
  }

  // Step 2: Get available quality levels for this plan-capability combination
  const qualityLevelsResult = await db.execute<QualityLevelRow>(sql`
    SELECT
      ql.id as quality_level_id,
      ql.unique_name,
      ql.name as quality_name,
      ql.credit_multiplier
    FROM quality_levels ql
    INNER JOIN plan_ai_capability_quality_levels pacql ON pacql.quality_level_id = ql.id
    INNER JOIN plan_ai_capabilities pac ON pac.id = pacql.plan_ai_capability_id
    INNER JOIN organization_plans op ON op.plan_id = pac.plan_id
    WHERE op.organization_id = ${organizationId}
      AND op.status IN ('active', 'trial')
      AND pac.ai_capability_id = ${capabilityRow.capability_id}
      AND pac.is_enabled = true
      AND ql.is_active = true
    ORDER BY ql.display_order ASC
  `);

  // If no quality levels are available, deny access
  if (qualityLevelsResult.length === 0) {
    return createDeniedResult(
      capabilityUniqueName,
      'capability_not_included',
      capabilityRow.capability_id,
      capabilityRow.capability_name
    );
  }

  // Step 3: Get all models for these quality levels
  const qualityLevelIds = qualityLevelsResult.map((ql) => ql.quality_level_id);

  // Build IN clause dynamically - sql.join() properly escapes each value
  const qualityLevelIdsSql = sql.join(
    qualityLevelIds.map((id) => sql`${id}`),
    sql`, `
  );

  const modelsResult = await db.execute<ModelRow>(sql`
    SELECT
      pacql.quality_level_id,
      pqlm.llm_model_id as model_id,
      pqlm.is_default
    FROM plan_quality_level_models pqlm
    INNER JOIN plan_ai_capability_quality_levels pacql ON pacql.id = pqlm.plan_ai_capability_quality_level_id
    INNER JOIN plan_ai_capabilities pac ON pac.id = pacql.plan_ai_capability_id
    INNER JOIN organization_plans op ON op.plan_id = pac.plan_id
    WHERE op.organization_id = ${organizationId}
      AND op.status IN ('active', 'trial')
      AND pac.ai_capability_id = ${capabilityRow.capability_id}
      AND pac.is_enabled = true
      AND pacql.quality_level_id IN (${qualityLevelIdsSql})
    ORDER BY pqlm.priority ASC
  `);

  // Step 4: Build quality level info with models
  const modelsByQualityLevel = new Map<
    string,
    { modelIds: string[]; defaultModelId: string | null }
  >();

  for (const modelRow of modelsResult) {
    const qualityLevelId = modelRow.quality_level_id;
    if (!modelsByQualityLevel.has(qualityLevelId)) {
      modelsByQualityLevel.set(qualityLevelId, {
        modelIds: [],
        defaultModelId: null,
      });
    }

    const entry = modelsByQualityLevel.get(qualityLevelId)!;
    entry.modelIds.push(modelRow.model_id);

    const isDefault =
      modelRow.is_default === true || modelRow.is_default === 'true';
    if (isDefault && !entry.defaultModelId) {
      entry.defaultModelId = modelRow.model_id;
    }
  }

  // Build the available quality levels array
  const availableQualityLevels: QualityLevelInfo[] = qualityLevelsResult.map(
    (qlRow) => {
      const modelsInfo = modelsByQualityLevel.get(qlRow.quality_level_id) || {
        modelIds: [],
        defaultModelId: null,
      };

      // Calculate credit cost based on quality level multiplier and capability base cost
      const creditMultiplier = parseFloat(qlRow.credit_multiplier) || 1.0;
      const baseCost = getBaseCostForQuality(capabilityRow, qlRow.unique_name);
      const creditCost = baseCost * creditMultiplier;

      return {
        id: qlRow.quality_level_id,
        uniqueName: qlRow.unique_name as QualityLevelId,
        name: qlRow.quality_name,
        creditCost,
        defaultModelId: modelsInfo.defaultModelId || modelsInfo.modelIds[0] || '',
        allowedModelIds: modelsInfo.modelIds,
      };
    }
  );

  // Step 5: If a specific quality level was requested, verify it's available
  if (qualityLevelUniqueName) {
    const requestedQuality = availableQualityLevels.find(
      (ql) => ql.uniqueName === qualityLevelUniqueName
    );
    if (!requestedQuality) {
      return createDeniedResult(
        capabilityUniqueName,
        'capability_not_included', // Using this reason as quality_level_not_available isn't in AICapabilityDenialReason
        capabilityRow.capability_id,
        capabilityRow.capability_name
      );
    }
  }

  // Step 6: Build and return the successful access result
  return {
    hasAccess: true,
    capabilityId: capabilityRow.capability_id,
    capabilityName: capabilityRow.capability_name,
    availableQualityLevels,
    dailyLimit: capabilityRow.rate_limit_rpd
      ? parseInt(capabilityRow.rate_limit_rpd)
      : null,
    monthlyLimit: null, // Not tracked in current schema
    usedToday: 0, // TODO: Implement usage tracking query
    usedThisMonth: 0, // TODO: Implement usage tracking query
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the base credit cost for a capability at a specific quality level.
 */
function getBaseCostForQuality(
  capabilityRow: CapabilityAccessRow,
  qualityUniqueName: string
): number {
  switch (qualityUniqueName) {
    case 'fast':
      return parseFloat(capabilityRow.estimated_credits_fast) || 1.0;
    case 'enhanced':
      return parseFloat(capabilityRow.estimated_credits_enhanced) || 1.5;
    case 'premium':
      return parseFloat(capabilityRow.estimated_credits_premium) || 3.0;
    default:
      return parseFloat(capabilityRow.estimated_credits_fast) || 1.0;
  }
}

/**
 * Create a denied access result.
 */
function createDeniedResult(
  capabilityUniqueName: AICapabilityId,
  reason: AICapabilityDenialReason,
  capabilityId?: string,
  capabilityName?: string
): AICapabilityAccessResult {
  return {
    hasAccess: false,
    capabilityId: capabilityId || '',
    capabilityName: capabilityName || capabilityUniqueName,
    availableQualityLevels: [],
    dailyLimit: null,
    monthlyLimit: null,
    usedToday: 0,
    usedThisMonth: 0,
    reason,
  };
}
