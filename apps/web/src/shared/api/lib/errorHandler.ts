/**
 * Error handling utilities for API calls
 */

import { isApiClientError, type ApiClientError } from './apiClient';

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Format error for user-friendly display
 */
export function formatUserFriendlyError(error: unknown): string {
  if (isApiClientError(error)) {
    // Handle specific error codes
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'PARSE_ERROR':
        return 'Received an invalid response from the server.';
      default:
        // Use the error message from the API
        return error.message;
    }
  }

  return getErrorMessage(error);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return isApiClientError(error) && error.code === 'NETWORK_ERROR';
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return isApiClientError(error) && (error.status === 401 || error.status === 403);
}

export { isApiClientError };
export type { ApiClientError };
