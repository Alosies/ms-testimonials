import { z } from 'zod';

/**
 * Common validation schemas for reuse across the application
 */

/**
 * Non-empty string with trimming
 */
export const nonEmptyString = z.string().trim().min(1, 'This field is required');

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address');

/**
 * Optional email validation
 */
export const optionalEmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''));

/**
 * URL validation
 */
export const urlSchema = z.string().trim().url('Please enter a valid URL');

/**
 * Optional URL validation
 */
export const optionalUrlSchema = z
  .string()
  .trim()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

/**
 * Slug validation (URL-safe identifier)
 */
export const slugSchema = z
  .string()
  .trim()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  );

/**
 * NanoID validation (12 character identifier)
 */
export const nanoIdSchema = z.string().length(12, 'Invalid ID format');

/**
 * Rating validation (1-5 stars)
 */
export const ratingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

/**
 * Optional rating
 */
export const optionalRatingSchema = ratingSchema.optional();

/**
 * Boolean consent field
 */
export const consentSchema = z.literal(true, {
  errorMap: () => ({ message: 'You must agree to continue' }),
});

/**
 * Text content with minimum length
 */
export function textWithMinLength(minLength: number, fieldName = 'This field') {
  return z
    .string()
    .trim()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`);
}

/**
 * Text content with min and max length
 */
export function textWithLength(
  minLength: number,
  maxLength: number,
  fieldName = 'This field'
) {
  return z
    .string()
    .trim()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} must be at most ${maxLength} characters`);
}

/**
 * Person name validation
 */
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters');

/**
 * Optional name
 */
export const optionalNameSchema = nameSchema.optional().or(z.literal(''));
