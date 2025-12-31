export { createApiClient, isApiClientError } from './apiClient';
export type { ApiClient, ApiClientError, RequestConfig, GetConfig, PostConfig } from './apiClient';

export {
  getErrorMessage,
  formatUserFriendlyError,
  isNetworkError,
  isAuthError,
} from './errorHandler';
