import jwt from 'jsonwebtoken';
import { createHasuraClaims } from './createHasuraClaims';
import type { SignJWTResult } from './models';
import { jwtIssuer, jwtAudience, jwtExpiresIn } from '@/shared/constants';
import { env } from '@/shared/config/env';

/**
 * Sign a JWT token with Hasura claims
 *
 * @param email - User's email address
 * @param userId - Internal user ID (NanoID)
 * @param role - Current active role
 * @param allowedRoles - All roles user can assume
 * @param organizationId - Current organization context
 * @param organizationSlug - Current organization slug
 * @returns Signed JWT token and expiration timestamp
 */
export function signAuthJWT(
  email: string,
  userId: string,
  role: string,
  allowedRoles: string[],
  organizationId?: string,
  organizationSlug?: string
): SignJWTResult {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // Create Hasura claims (include email for email-based permissions)
  const hasuraClaims = createHasuraClaims(
    userId,
    role,
    allowedRoles,
    organizationId,
    organizationSlug,
    email
  );

  // Calculate expiration (1 hour from now)
  const currentTime = Math.floor(Date.now() / 1000);
  const expiresAt = currentTime + jwtExpiresIn;

  // Create token payload
  const tokenPayload = {
    // Standard JWT claims
    iss: jwtIssuer,
    sub: userId,
    aud: jwtAudience,
    iat: currentTime,
    exp: expiresAt,

    // Essential user data
    email,

    // Hasura claims
    'https://hasura.io/jwt/claims': hasuraClaims,
  };

  // Sign the token
  const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
    algorithm: 'HS256',
  });

  return { token, expiresAt };
}
