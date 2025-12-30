import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { signAuthJWT } from '@/shared/utils/tokens';

// Entity imports
import { findUserById } from '@/entities/user';
import { findOrganizationById } from '@/entities/organization';
import { fetchUserRoles, buildRolesList, getUserRoleInOrg } from '@/entities/organizationRole';

interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * POST /auth/switch-organization
 * Switch user's current organization context and generate new token
 *
 * Requires: Valid JWT in Authorization header
 * Input: { organizationId: string }
 * Output: New JWT with updated organization claims
 */
export async function switchOrganization(c: Context) {
  try {
    const body = await c.req.json();
    const { organizationId } = body;

    if (!organizationId) {
      return errorResponse(c, 'Organization ID is required', 400);
    }

    // Get user from context (set by auth middleware)
    const authUser = c.get('user') as AuthenticatedUser | undefined;
    if (!authUser) {
      return errorResponse(c, 'Authentication required', 401);
    }

    // Get full user data
    const user = await findUserById(authUser.id);
    if (!user) {
      return errorResponse(c, 'User not found', 404);
    }

    // Verify user has access to the requested organization
    const userRoleInOrg = await getUserRoleInOrg(user.id, organizationId);
    if (!userRoleInOrg) {
      return errorResponse(c, 'User does not have access to this organization', 403);
    }

    // Get organization details
    const organization = await findOrganizationById(organizationId);
    if (!organization || !organization.is_active) {
      return errorResponse(c, 'Organization not found or inactive', 404);
    }

    // Fetch all user roles for allowed_roles claim
    const allRoles = await fetchUserRoles(user.id);
    const allowedRoles = buildRolesList(allRoles || [], organizationId);

    // Generate new token with updated organization context
    const { token, expiresAt } = signAuthJWT(
      user.email,
      user.id,
      userRoleInOrg.role.unique_name,
      allowedRoles,
      organizationId,
      organization.slug
    );

    return successResponse(c, {
      access_token: token,
      expires_at: expiresAt,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    });
  } catch (error) {
    console.error('Organization switch failed:', error);
    return errorResponse(c, error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export default switchOrganization;
