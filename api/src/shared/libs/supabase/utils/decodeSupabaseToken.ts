import { decodeToken } from '@/shared/utils/tokens';
import type { SupabaseTokenContent } from '@/shared/utils/tokens';

/**
 * Decode a Supabase JWT token without verification
 * We don't verify because Supabase has already verified it
 */
export function decodeSupabaseToken(token: string): SupabaseTokenContent {
  try {
    return decodeToken<SupabaseTokenContent>(token);
  } catch (error) {
    console.error('Error decoding Supabase token:', error);
    throw new Error('Invalid token format');
  }
}
