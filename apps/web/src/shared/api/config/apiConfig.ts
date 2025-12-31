/**
 * API Configuration
 * Centralized configuration for API client
 */

/**
 * API base URL from environment variable with fallback
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
}

/**
 * API configuration constants
 */
export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 0, // No retries by default
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  // AI
  AI_SUGGEST_QUESTIONS: '/ai/suggest-questions',
  AI_ASSEMBLE: '/ai/assemble',

  // Auth
  AUTH_ENHANCE_TOKEN: '/auth/enhance-token',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
