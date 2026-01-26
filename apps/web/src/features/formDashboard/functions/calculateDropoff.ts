/**
 * Funnel Dropoff Calculations
 *
 * Client-side utilities for funnel visualization.
 */

import type { FunnelStep } from '@api/shared/schemas/dashboard';

/**
 * Calculate progress bar width percentage
 *
 * @param sessions - Sessions at this step
 * @param totalSessions - Total sessions (step 0)
 * @returns Percentage width for progress bar (0-100)
 */
export function getProgressWidth(sessions: number, totalSessions: number): number {
  if (totalSessions === 0) return 0;
  return Math.max(0, Math.min(100, (sessions / totalSessions) * 100));
}

/**
 * Get color class based on dropoff severity
 *
 * @param dropoffPercent - Dropoff percentage
 * @returns Tailwind color class
 */
export function getDropoffColorClass(dropoffPercent: number | null): string {
  if (dropoffPercent === null) return 'text-gray-500';

  if (dropoffPercent >= 20) return 'text-red-600 dark:text-red-400';
  if (dropoffPercent >= 10) return 'text-orange-500 dark:text-orange-400';
  if (dropoffPercent >= 5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

/**
 * Get bar color class based on step position
 *
 * @param percentage - Percentage of total sessions
 * @returns Tailwind background color class
 */
export function getBarColorClass(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  if (percentage >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Find the step with highest dropoff
 *
 * @param steps - Array of funnel steps
 * @returns The step with highest dropoff, or null
 */
export function findHighestDropoff(
  steps: FunnelStep[]
): FunnelStep | null {
  let highest: FunnelStep | null = null;
  let maxDropoff = 0;

  for (const step of steps) {
    if (step.dropoffPercent !== null && step.dropoffPercent > maxDropoff) {
      maxDropoff = step.dropoffPercent;
      highest = step;
    }
  }

  return highest;
}

/**
 * Get human-readable step type label
 *
 * @param stepType - Step type from API
 * @returns Human-readable label
 */
export function getStepTypeLabel(stepType: string): string {
  const labels: Record<string, string> = {
    welcome: 'Welcome',
    question: 'Question',
    rating: 'Rating',
    nps: 'NPS',
    consent: 'Consent',
    contact_info: 'Contact Info',
    reward: 'Reward',
    thank_you: 'Thank You',
    submitted: 'Submitted',
    unknown: 'Step',
  };

  return labels[stepType] || stepType;
}
