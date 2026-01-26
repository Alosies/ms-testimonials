/**
 * Benchmark Calculation
 *
 * Calculates expected completion rate based on form structure.
 * Uses step complexity weights to estimate friction.
 */

import type { BenchmarkMetadata } from '@/shared/schemas/dashboard';

/**
 * Step type complexity weights
 *
 * Higher weight = more friction = lower expected completion
 * Based on industry research and user behavior patterns.
 */
const STEP_WEIGHTS: Record<string, number> = {
  // Low friction (read-only or single click)
  welcome: 0.3,
  thank_you: 0.0,
  reward: 0.2,

  // Medium friction (single selection)
  rating: 0.5,
  nps: 0.5,
  yes_no: 0.5,
  consent: 0.4,

  // Higher friction (selection from options)
  multiple_choice: 0.6,
  single_choice: 0.6,

  // High friction (typing required)
  short_text: 1.0,
  email: 0.8,
  contact_info: 1.2,

  // Very high friction (significant effort)
  long_text: 1.5,
  phone: 1.2,
  question: 1.0, // Default for question steps

  // Extreme friction
  file_upload: 2.0,
  video: 2.5,
};

/**
 * Benchmark calculation constants
 */
const BASE_RATE = 78; // Starting point (optimistic)
const MIN_RATE = 25; // Floor
const MAX_RATE = 85; // Ceiling
const COMPLEXITY_PENALTY = 4; // -4% per complexity point
const MULTI_STEP_BONUS = 5; // +5% for multi-step forms (better UX than single page)

/**
 * Get the complexity weight for a step type
 *
 * @param stepType - The type of form step
 * @returns Complexity weight (higher = more friction)
 */
export function getStepWeight(stepType: string): number {
  return STEP_WEIGHTS[stepType] ?? 1.0;
}

/**
 * Calculate the total complexity score for a form
 *
 * @param stepTypes - Array of step types in the form
 * @returns Total complexity score
 */
export function calculateComplexityScore(stepTypes: string[]): number {
  return stepTypes.reduce((sum, type) => sum + getStepWeight(type), 0);
}

/**
 * Calculate expected completion rate based on form structure
 *
 * Formula:
 * expectedRate = BASE_RATE - (complexityScore * COMPLEXITY_PENALTY) + multiStepBonus
 * Result is clamped between MIN_RATE and MAX_RATE
 *
 * @param stepTypes - Array of step types in the form
 * @returns Expected completion rate (percentage)
 */
export function calculateExpectedCompletionRate(stepTypes: string[]): number {
  const complexityScore = calculateComplexityScore(stepTypes);
  const multiStepBonus = stepTypes.length > 1 ? MULTI_STEP_BONUS : 0;

  const expectedRate =
    BASE_RATE - complexityScore * COMPLEXITY_PENALTY + multiStepBonus;

  return Math.max(MIN_RATE, Math.min(MAX_RATE, Math.round(expectedRate * 10) / 10));
}

/**
 * Calculate complete benchmark metadata for a form
 *
 * @param stepTypes - Array of step types in the form
 * @returns Benchmark metadata object
 */
export function calculateBenchmark(stepTypes: string[]): BenchmarkMetadata {
  const complexityScore = calculateComplexityScore(stepTypes);
  const expectedCompletionRate = calculateExpectedCompletionRate(stepTypes);

  return {
    expectedCompletionRate,
    complexityScore: Math.round(complexityScore * 10) / 10,
    stepCount: stepTypes.length,
  };
}

/**
 * Example calculations (for reference):
 *
 * Quick NPS form: welcome(0.3) + nps(0.5) + thank_you(0)
 * - Complexity: 0.8
 * - Expected: 78 - (0.8 * 4) + 5 = 79.8% → ~80%
 *
 * Standard testimonial: welcome(0.3) + question(1.0) + question(1.0) + rating(0.5) + consent(0.4)
 * - Complexity: 3.2
 * - Expected: 78 - (3.2 * 4) + 5 = 70.2% → ~70%
 *
 * Detailed case study: welcome + 3×long_text + rating + email + consent
 * - Complexity: 0.3 + 4.5 + 0.5 + 0.8 + 0.4 = 6.5
 * - Expected: 78 - (6.5 * 4) + 5 = 57% → 57%
 *
 * Video testimonial: welcome + question + video + consent
 * - Complexity: 0.3 + 1.0 + 2.5 + 0.4 = 4.2
 * - Expected: 78 - (4.2 * 4) + 5 = 66.2% → ~66%
 */
