import { z } from 'zod';

/**
 * Custom Zod refinements and transformations for advanced validation rules
 */

/**
 * Profanity filter refinement
 * Add words to filter as needed
 */
const PROFANITY_LIST: string[] = [
  // Add profanity words here as needed
];

export function noProfanity(message = 'Please use appropriate language') {
  return z.string().refine(
    (value) => {
      const lowerValue = value.toLowerCase();
      return !PROFANITY_LIST.some((word) => lowerValue.includes(word));
    },
    { message }
  );
}

/**
 * URL with specific domain restriction
 */
export function urlWithDomain(
  allowedDomains: string[],
  message = 'URL must be from an allowed domain'
) {
  return z.string().url().refine(
    (value) => {
      try {
        const url = new URL(value);
        return allowedDomains.some(
          (domain) =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        );
      } catch {
        return false;
      }
    },
    { message }
  );
}

/**
 * Image URL validation (checks for common image extensions)
 */
export function imageUrl(message = 'Must be a valid image URL') {
  return z.string().url().refine(
    (value) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const lowerValue = value.toLowerCase();
      return imageExtensions.some((ext) => lowerValue.includes(ext));
    },
    { message }
  );
}

/**
 * Slug format validation with custom pattern
 */
export function slug(options?: { minLength?: number; maxLength?: number }) {
  const { minLength = 3, maxLength = 50 } = options ?? {};

  return z
    .string()
    .trim()
    .min(minLength, `Slug must be at least ${minLength} characters`)
    .max(maxLength, `Slug must be at most ${maxLength} characters`)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug can only contain lowercase letters, numbers, and hyphens (no consecutive hyphens)'
    );
}

/**
 * Transform string to slug format
 */
export function toSlug() {
  return z.string().transform((value) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
  );
}

/**
 * Sanitize HTML to prevent XSS
 * Strips all HTML tags from input
 */
export function noHtml(message = 'HTML is not allowed') {
  return z.string().refine(
    (value) => {
      const htmlRegex = /<[^>]*>/g;
      return !htmlRegex.test(value);
    },
    { message }
  );
}

/**
 * Transform to strip HTML tags
 */
export function stripHtml() {
  return z.string().transform((value) => value.replace(/<[^>]*>/g, ''));
}

/**
 * Validate that a string contains at least N words
 */
export function minWords(count: number, message?: string) {
  const defaultMessage = `Must contain at least ${count} words`;
  return z.string().refine(
    (value) => {
      const words = value.trim().split(/\s+/).filter(Boolean);
      return words.length >= count;
    },
    { message: message ?? defaultMessage }
  );
}

/**
 * Phone number validation (basic international format)
 */
export function phoneNumber(message = 'Please enter a valid phone number') {
  return z.string().regex(/^\+?[1-9]\d{1,14}$/, message);
}

/**
 * Optional phone number
 */
export function optionalPhoneNumber(
  message = 'Please enter a valid phone number'
) {
  return phoneNumber(message).optional().or(z.literal(''));
}

/**
 * Date string validation (ISO format)
 */
export function isoDate(message = 'Please enter a valid date') {
  return z.string().refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    { message }
  );
}

/**
 * Future date validation
 */
export function futureDate(message = 'Date must be in the future') {
  return z.string().refine(
    (value) => {
      const date = new Date(value);
      return date > new Date();
    },
    { message }
  );
}

/**
 * Past date validation
 */
export function pastDate(message = 'Date must be in the past') {
  return z.string().refine(
    (value) => {
      const date = new Date(value);
      return date < new Date();
    },
    { message }
  );
}

/**
 * Hex color validation
 */
export function hexColor(message = 'Please enter a valid hex color') {
  return z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message);
}

/**
 * JSON string validation
 */
export function jsonString(message = 'Please enter valid JSON') {
  return z.string().refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message }
  );
}

/**
 * Transform JSON string to object
 */
export function parseJson<T>() {
  return z.string().transform((value): T => JSON.parse(value));
}
