import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { decodeSupabaseToken } from '@/shared/libs/supabase';
import { signAuthJWT } from '@/shared/utils/tokens';
import { authProviders } from '@/shared/constants';

// Entity imports
import { findUserById, findUserByEmail, createUser, updateUserLogin } from '@/entities/user';
import {
  findIdentity,
  findIdentityByEmail,
  createIdentity,
  updateIdentity,
  isFirstIdentity,
} from '@/entities/userIdentity';
import { createDefaultOrganization, findOrganizationById } from '@/entities/organization';
import {
  fetchUserRoles,
  findDefaultRole,
  buildRolesList,
  getUserRoleInOrg,
} from '@/entities/organizationRole';

/**
 * POST /auth/enhance-token
 * Enhance Supabase token with Hasura JWT claims
 *
 * Flow:
 * 1. Decode Supabase token (extract user info)
 * 2. Find or create user + identity
 * 3. Handle new user onboarding (create default org)
 * 4. Fetch user roles
 * 5. Generate enhanced JWT with Hasura claims
 */
export async function enhanceToken(c: Context) {
  try {
    const body = await c.req.json();
    const { supabaseToken, organizationId } = body;

    if (!supabaseToken) {
      return errorResponse(c, 'Supabase token is required', 400);
    }

    // 1. Decode Supabase token
    const decoded = decodeSupabaseToken(supabaseToken);
    const provider = authProviders.SUPABASE; // Using Supabase as the provider

    // 2. Find or create user identity
    let identity = await findIdentity(provider, decoded.sub);
    let user;

    if (!identity) {
      // Check if there's an existing identity for this email with a different Supabase ID
      const existingEmailIdentity = await findIdentityByEmail(provider, decoded.email);

      if (existingEmailIdentity) {
        // User exists with different Supabase ID - update the identity
        console.log('🔄 Updating existing identity with new Supabase user ID');
        const identityResponse = await updateIdentity({
          id: existingEmailIdentity.id,
          provider_user_id: decoded.sub,
          provider_metadata: decoded.user_metadata || {},
        });

        if (!identityResponse) {
          throw new Error('Failed to update identity');
        }

        identity = { ...existingEmailIdentity, provider_user_id: decoded.sub };
        user = await findUserById(existingEmailIdentity.user_id);
      } else {
        // Check if user exists by email (account linking)
        user = await findUserByEmail(decoded.email);

        if (!user) {
          // Create new user
          console.log('👤 Creating new user:', decoded.email);
          user = await createUser({
            email: decoded.email,
            email_verified: decoded.user_metadata?.email_verified || false,
            display_name:
              decoded.user_metadata?.full_name || decoded.user_metadata?.name || null,
            avatar_url:
              decoded.user_metadata?.avatar_url || decoded.user_metadata?.picture || null,
            locale: 'en',
          });
        }

        if (!user) {
          throw new Error('Failed to create user');
        }

        // Create identity link
        const isPrimary = await isFirstIdentity(user.id);
        await createIdentity({
          user_id: user.id,
          provider,
          provider_user_id: decoded.sub,
          provider_email: decoded.email,
          provider_metadata: decoded.user_metadata || {},
          is_primary: isPrimary,
        });
      }
    } else {
      // Get user from identity
      user = await findUserById(identity.user_id);
    }

    if (!user) {
      throw new Error('Failed to authenticate user');
    }

    // Update last login
    await updateUserLogin(user.id);

    // 3. Fetch user roles and ensure user has at least one organization
    let roles = await fetchUserRoles(user.id);

    if (!roles || roles.length === 0) {
      // User has no organization - create default one
      // This handles: new users, invited users whose org was deleted, edge cases
      console.log('🏢 Creating default organization for user without roles');
      await createDefaultOrganization(user.id, user.display_name, user.email);
      // Re-fetch roles after org creation
      roles = await fetchUserRoles(user.id);
    }

    // Determine current context
    let roleInfo = findDefaultRole(roles || []);
    let currentOrg = null;

    // If organizationId is provided, validate and use it
    if (organizationId) {
      const userRoleInOrg = await getUserRoleInOrg(user.id, organizationId);
      if (!userRoleInOrg) {
        return errorResponse(c, 'User does not have access to this organization', 403);
      }

      currentOrg = await findOrganizationById(organizationId);
      if (!currentOrg || !currentOrg.is_active) {
        return errorResponse(c, 'Organization not found or inactive', 404);
      }

      roleInfo = {
        currentOrganizationId: organizationId,
        currentOrganizationSlug: currentOrg.slug,
        userRole: userRoleInOrg.role.unique_name,
        allRoles: roles || [],
      };
    } else if (roleInfo.currentOrganizationId) {
      currentOrg = await findOrganizationById(roleInfo.currentOrganizationId);
    }

    // Build allowed roles list
    const allowedRoles = buildRolesList(roles || [], roleInfo.currentOrganizationId || undefined);

    // 5. Generate enhanced JWT
    const { token, expiresAt } = signAuthJWT(
      user.email,
      user.id,
      roleInfo.userRole,
      allowedRoles,
      roleInfo.currentOrganizationId || undefined,
      roleInfo.currentOrganizationSlug || undefined
    );

    // Build response
    const response: Record<string, unknown> = {
      access_token: token,
      expires_at: expiresAt,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
    };

    // Include organization info if available
    if (currentOrg) {
      response.organization = {
        id: currentOrg.id,
        name: currentOrg.name,
        slug: currentOrg.slug,
      };
    }

    return successResponse(c, response);
  } catch (error) {
    console.error('Token enhancement failed:', error);
    return errorResponse(c, error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export default enhanceToken;
