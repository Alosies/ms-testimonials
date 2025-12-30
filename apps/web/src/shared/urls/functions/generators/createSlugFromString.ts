/**
 * Pure function: Creates a URL-friendly slug from a string
 * Used to generate the cosmetic portion of entity URLs
 *
 * @param input - The input string to convert to a slug (e.g., "Product Feedback Form")
 * @returns URL-friendly slug (e.g., "product-feedback-form")
 */

export function createSlugFromString(input: string): string {
  if (!input) {
    return '';
  }

  const slug = input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .trim()
    .substring(0, 50); // Max length

  return slug;
}
