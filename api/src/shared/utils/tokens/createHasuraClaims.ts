import type { HasuraClaims } from './models';
import { defaultRole } from '@/shared/constants';

/**
 * Create Hasura JWT claims object
 *
 * @param userId - Internal user ID (NanoID format)
 * @param role - Primary role for the user (defaults to 'member')
 * @param allowedRoles - Array of all roles the user can assume
 * @param organizationId - Optional organization ID for tenant scoping
 * @param organizationSlug - Optional organization slug for URL routing
 * @param userEmail - Optional user email for email-based permissions
 * @returns HasuraClaims object with all necessary authorization data
 */
export function createHasuraClaims(
  userId: string,
  role: string = defaultRole,
  allowedRoles: string[] = [role],
  organizationId?: string,
  organizationSlug?: string,
  userEmail?: string
): HasuraClaims {
  const claims: HasuraClaims = {
    'x-hasura-allowed-roles': allowedRoles,
    'x-hasura-default-role': role,
    'x-hasura-user-id': userId,
  };

  // Add optional claims only if provided (reduces token size)
  if (organizationId) {
    claims['x-hasura-organization-id'] = organizationId;
  }

  if (organizationSlug) {
    claims['x-hasura-organization-slug'] = organizationSlug;
  }

  if (userEmail) {
    claims['x-hasura-user-email'] = userEmail;
  }

  return claims;
}
