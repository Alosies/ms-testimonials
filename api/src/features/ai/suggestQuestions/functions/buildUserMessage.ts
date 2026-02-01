import { wrapUserContent } from '@/shared/utils/inputSanitizer';

/**
 * Build the user message containing ONLY user-provided data.
 * Wrapped in XML tags to clearly delineate untrusted content.
 *
 * Pure function: input → output with no side effects.
 *
 * @param productName - Sanitized product name
 * @param productDescription - Sanitized product description
 * @param focusAreas - Optional sanitized focus areas
 * @returns Formatted user message string
 */
export function buildUserMessage(
  productName: string,
  productDescription: string,
  focusAreas?: string
): string {
  const wrappedName = wrapUserContent(productName, 'product_name');
  const wrappedDescription = wrapUserContent(productDescription, 'product_description');
  const focusSection = focusAreas
    ? `\n\nFocus areas to emphasize:\n${wrapUserContent(focusAreas, 'focus_areas')}`
    : '';

  return `Please generate testimonial questions for this product:

${wrappedName}

${wrappedDescription}${focusSection}`;
}
