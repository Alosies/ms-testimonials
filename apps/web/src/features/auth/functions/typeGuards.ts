import type { AuthStep } from '../constants';

/**
 * Type-safe helper to check if current step is in a group
 */
export function isStepInGroup(
  step: AuthStep,
  group: readonly AuthStep[]
): boolean {
  return group.includes(step);
}
