/**
 * Pure Functions for URLs
 * Organized by function type for better discoverability and tree-shaking
 */

// Extractor functions - extract data from URLs, routes, etc.
export {
  extractEntityIdFromSlug,
  extractOrganizationSlug,
  getRouteType,
} from './extractors';

// Validator functions - validate data and return boolean results
export { isValidEntityUrl } from './validators';

// Generator functions - create/generate new data from inputs
export {
  createSlugFromString,
  createEntityUrlSlug,
  createEntityUrl,
  createFormUrl,
  createTestimonialUrl,
  createWidgetUrl,
  createOrgEntityUrl,
  createOrgFormUrl,
  createOrgTestimonialUrl,
  createOrgWidgetUrl,
} from './generators';
