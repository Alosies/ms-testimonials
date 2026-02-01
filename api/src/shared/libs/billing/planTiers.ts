/**
 * Plan Tier Functions
 *
 * Pure functions for determining plan tier ordering and comparing plans.
 * Used for upgrade/downgrade validation.
 */

// =============================================================================
// Constants
// =============================================================================

/**
 * Plan tier ordering for upgrade/downgrade validation.
 * Higher number = higher tier.
 */
export const PLAN_TIER_ORDER: Record<string, number> = {
  free: 1,
  pro: 2,
  team: 3,
};

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Gets the tier level for a plan.
 *
 * @param planUniqueName - The plan's unique_name
 * @returns The tier level (0 if unknown)
 */
export function getPlanTierLevel(planUniqueName: string): number {
  return PLAN_TIER_ORDER[planUniqueName] ?? 0;
}

/**
 * Determines if a plan change is an upgrade.
 *
 * @param currentPlanUniqueName - Current plan's unique_name
 * @param newPlanUniqueName - New plan's unique_name
 * @returns true if the new plan is a higher tier
 *
 * @example
 * ```typescript
 * isUpgrade('free', 'pro');  // true
 * isUpgrade('pro', 'free');  // false
 * isUpgrade('pro', 'pro');   // false
 * ```
 */
export function isUpgrade(
  currentPlanUniqueName: string,
  newPlanUniqueName: string
): boolean {
  const currentTier = getPlanTierLevel(currentPlanUniqueName);
  const newTier = getPlanTierLevel(newPlanUniqueName);
  return newTier > currentTier;
}

/**
 * Determines if a plan change is a downgrade.
 *
 * @param currentPlanUniqueName - Current plan's unique_name
 * @param newPlanUniqueName - New plan's unique_name
 * @returns true if the new plan is a lower tier
 *
 * @example
 * ```typescript
 * isDowngrade('pro', 'free');  // true
 * isDowngrade('free', 'pro');  // false
 * isDowngrade('pro', 'pro');   // false
 * ```
 */
export function isDowngrade(
  currentPlanUniqueName: string,
  newPlanUniqueName: string
): boolean {
  const currentTier = getPlanTierLevel(currentPlanUniqueName);
  const newTier = getPlanTierLevel(newPlanUniqueName);
  return newTier < currentTier;
}

/**
 * Determines if two plans are the same tier.
 *
 * @param planA - First plan's unique_name
 * @param planB - Second plan's unique_name
 * @returns true if both plans are the same tier
 */
export function isSameTier(planA: string, planB: string): boolean {
  return getPlanTierLevel(planA) === getPlanTierLevel(planB);
}
