/**
 * Test IDs for Public Form (customer-facing form)
 *
 * Used in E2E tests for form persistence, analytics, and submission flow.
 */
export const publicFormTestIds = {
  // Container
  container: 'public-form-container',
  loadingSpinner: 'public-form-loading',
  notFoundMessage: 'public-form-not-found',

  // Progress
  progressBar: 'public-form-progress-bar',

  // Navigation
  backButton: 'public-form-back-button',
  continueButton: 'public-form-continue-button',
  submitButton: 'public-form-submit-button',

  // Step indicators
  stepIndicator: 'public-form-step-indicator',
  stepDot: 'public-form-step-dot',

  // Step cards (use data-step-type for specific step identification)
  stepCard: 'public-form-step-card',

  // Welcome step specific
  welcomeStartButton: 'public-form-welcome-start',

  // Rating step specific
  ratingInput: 'public-form-rating-input',
  ratingStar: 'public-form-rating-star',
} as const;

export type PublicFormTestId = typeof publicFormTestIds;
