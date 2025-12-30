/**
 * Hasura JWT claims structure
 */
export interface HasuraClaims {
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
  'x-hasura-user-id': string;
  'x-hasura-organization-id'?: string;
  'x-hasura-organization-slug'?: string;
  'x-hasura-user-email'?: string;
}

/**
 * Complete JWT payload structure
 */
export interface JWTPayload {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  email: string;
  'https://hasura.io/jwt/claims': HasuraClaims;
}

/**
 * Supabase token content after decoding
 */
export interface SupabaseTokenContent {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string; // Supabase user ID (UUID)
  email: string;
  phone: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    name?: string;
    picture?: string;
    provider_id?: string;
    sub?: string;
  };
  role: string;
  aal: string;
  amr: Array<{ method: string; timestamp: number }>;
  session_id: string;
  is_anonymous: boolean;
}

/**
 * Sign JWT result
 */
export interface SignJWTResult {
  token: string;
  expiresAt: number;
}
