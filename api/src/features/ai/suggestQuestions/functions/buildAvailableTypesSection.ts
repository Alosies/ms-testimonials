import type { AllowedQuestionType } from '@/entities/organization';

/**
 * Builds the available question types section for the system prompt.
 * Dynamically generated based on the organization's plan.
 *
 * Pure function: input → output with no side effects.
 *
 * @param allowedTypes - Array of allowed question types from the organization's plan
 * @returns Formatted string listing available question types
 */
export function buildAvailableTypesSection(allowedTypes: AllowedQuestionType[]): string {
  if (allowedTypes.length === 0) {
    return 'No question types available.';
  }

  const lines = allowedTypes.map((type) => {
    const optionsNote = type.supports_options
      ? 'Options: REQUIRED array of 2-8 choices'
      : 'Options: null';
    return `- ${type.unique_name}: ${type.description ?? type.name}. ${optionsNote}`;
  });

  return lines.join('\n');
}
