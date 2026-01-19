/**
 * Validate Branching Config - Pure Validation Functions
 *
 * ADR-014 Phase 4: Extract branching validation logic as standalone functions.
 * These are pure functions that validate branching configuration without side effects.
 *
 * Validation Rules:
 * 1. Rating step must exist if branching is enabled
 * 2. Rating step must be in shared flow (branch point)
 * 3. Threshold must be between 1 and 10 (inclusive)
 * 4. Each branch (testimonial/improvement) should have at least one step
 */

import type {
  ValidatableStep,
  BranchingValidationError,
  BranchingValidationWarning,
  BranchingValidationResult,
  ValidateBranchingParams,
} from '../models/functionTypes';
import { MIN_THRESHOLD, MAX_THRESHOLD } from '../constants/branching';

// Re-export constants for backward compatibility
export { MIN_THRESHOLD, MAX_THRESHOLD };

/**
 * Validate branching configuration against steps
 *
 * Checks all branching rules and returns errors and warnings.
 * Use isValid to determine if the configuration can be saved.
 *
 * @param params - Configuration and steps to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```ts
 * const result = validateBranchingConfig({
 *   config: branchingConfig.value,
 *   steps: steps.value,
 * });
 *
 * if (!result.isValid) {
 *   // Show errors to user
 *   result.errors.forEach(e => console.error(e.message));
 * }
 *
 * if (result.warnings.length > 0) {
 *   // Show warnings but allow save
 *   result.warnings.forEach(w => console.warn(w.message));
 * }
 * ```
 */
export function validateBranchingConfig(
  params: ValidateBranchingParams
): BranchingValidationResult {
  const { config, steps } = params;
  const errors: BranchingValidationError[] = [];
  const warnings: BranchingValidationWarning[] = [];

  // If branching is disabled, no validation needed
  if (!config.enabled) {
    return { isValid: true, errors, warnings };
  }

  // Rule 1: Rating step must exist
  if (!config.ratingStepId) {
    errors.push({
      code: 'MISSING_RATING_STEP_ID',
      message: 'Branching requires a rating step to be selected as the branch point.',
      field: 'ratingStepId',
    });
  } else {
    // Verify the rating step exists
    const ratingStep = steps.find(s => s.id === config.ratingStepId);
    if (!ratingStep) {
      errors.push({
        code: 'RATING_STEP_NOT_FOUND',
        message: 'The selected rating step no longer exists.',
        field: 'ratingStepId',
      });
    } else {
      // Rule 2: Rating step must be a rating type
      if (ratingStep.stepType !== 'rating') {
        errors.push({
          code: 'INVALID_BRANCH_POINT_TYPE',
          message: 'The branch point must be a rating step.',
          field: 'ratingStepId',
        });
      }

      // Rule 3: Rating step must be in shared flow
      if (ratingStep.flowMembership !== 'shared') {
        errors.push({
          code: 'RATING_NOT_IN_SHARED_FLOW',
          message: 'The rating step must be in the shared flow to act as a branch point.',
          field: 'ratingStepId',
        });
      }
    }
  }

  // Rule 4: Threshold must be between 1 and 10
  if (config.threshold < MIN_THRESHOLD || config.threshold > MAX_THRESHOLD) {
    errors.push({
      code: 'INVALID_THRESHOLD',
      message: `Rating threshold must be between ${MIN_THRESHOLD} and ${MAX_THRESHOLD}.`,
      field: 'threshold',
    });
  }

  // Rule 5 (Warning): Each branch should have at least one step
  const testimonialSteps = steps.filter(s => s.flowMembership === 'testimonial');
  const improvementSteps = steps.filter(s => s.flowMembership === 'improvement');

  if (testimonialSteps.length === 0) {
    warnings.push({
      code: 'EMPTY_TESTIMONIAL_BRANCH',
      message: 'The testimonial branch has no steps. Users with high ratings will skip to thank you.',
    });
  }

  if (improvementSteps.length === 0) {
    warnings.push({
      code: 'EMPTY_IMPROVEMENT_BRANCH',
      message: 'The improvement branch has no steps. Users with low ratings will skip to thank you.',
    });
  }

  // Rule 6 (Warning): Shared flow should have a thank_you step OR branches should
  const sharedSteps = steps.filter(s => s.flowMembership === 'shared');
  const hasSharedThankYou = sharedSteps.some(s => s.stepType === 'thank_you');
  const hasTestimonialThankYou = testimonialSteps.some(s => s.stepType === 'thank_you');
  const hasImprovementThankYou = improvementSteps.some(s => s.stepType === 'thank_you');

  if (!hasSharedThankYou && (!hasTestimonialThankYou || !hasImprovementThankYou)) {
    warnings.push({
      code: 'MISSING_THANK_YOU_STEP',
      message: 'Consider adding a thank you step to each branch or the shared flow.',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a step can be the branch point
 *
 * Returns true if the step is a rating type in the shared flow.
 *
 * @param step - Step to check
 * @returns Whether the step can be a branch point
 */
export function canBeBranchPoint(step: ValidatableStep): boolean {
  return step.stepType === 'rating' && step.flowMembership === 'shared';
}

/**
 * Find all possible branch point steps
 *
 * Returns all rating steps in the shared flow.
 *
 * @param steps - All steps to search
 * @returns Steps that can be branch points
 */
export function findPossibleBranchPoints<T extends ValidatableStep>(
  steps: T[]
): T[] {
  return steps.filter(canBeBranchPoint);
}

/**
 * Check if branching is possible with the current steps
 *
 * Returns true if there's at least one rating step in shared flow.
 *
 * @param steps - All steps to check
 * @returns Whether branching can be enabled
 */
export function canEnableBranching(steps: ValidatableStep[]): boolean {
  return findPossibleBranchPoints(steps).length > 0;
}

/**
 * Get the recommended branch point from steps
 *
 * Returns the last rating step in the shared flow, which is typically
 * the best choice for a branch point (after gathering initial feedback).
 *
 * @param steps - All steps to search
 * @returns The recommended branch point step, or null if none
 */
export function getRecommendedBranchPoint<T extends ValidatableStep>(
  steps: T[]
): T | null {
  const candidates = findPossibleBranchPoints(steps);
  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
}

/**
 * Validate threshold value
 *
 * @param threshold - Threshold to validate
 * @returns Whether the threshold is valid
 */
export function isValidThreshold(threshold: number): boolean {
  return (
    Number.isInteger(threshold) &&
    threshold >= MIN_THRESHOLD &&
    threshold <= MAX_THRESHOLD
  );
}

/**
 * Clamp threshold to valid range
 *
 * @param threshold - Threshold to clamp
 * @returns Threshold clamped to valid range
 */
export function clampThreshold(threshold: number): number {
  return Math.max(MIN_THRESHOLD, Math.min(MAX_THRESHOLD, Math.round(threshold)));
}
