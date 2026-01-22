/**
 * Auth feature types
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  name?: string;
}

export interface EnhancedTokenResponse {
  token: string;
  user: AuthUser;
}

// Re-export AuthStep type from constants (type lives with its constants)
export type { AuthStep } from '../constants';
