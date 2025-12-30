import jwt from 'jsonwebtoken';

/**
 * Decode a JWT token without verification
 * Used for extracting payload when token is already verified by another service (e.g., Supabase)
 */
export function decodeToken<T>(token: string): T {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token format');
  }

  return decoded as T;
}
