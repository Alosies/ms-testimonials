/**
 * Default role for new users (used when no specific role is assigned)
 */
export const defaultRole = 'member';

/**
 * Owner role unique name
 */
export const ownerRole = 'owner';

/**
 * JWT issuer identifier
 */
export const jwtIssuer = 'testimonials';

/**
 * JWT audience
 */
export const jwtAudience = 'authenticated';

/**
 * JWT expiration time in seconds (1 hour)
 */
export const jwtExpiresIn = 60 * 60;

/**
 * Auth provider names
 */
export const authProviders = {
  SUPABASE: 'supabase',
  GOOGLE: 'google',
  GITHUB: 'github',
  EMAIL: 'email',
} as const;

/**
 * Role unique names (must match database roles.unique_name)
 */
export const roleUniqueNames = {
  OWNER: 'owner',
  ADMIN: 'org_admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

/**
 * Plan IDs (must match database plans.id)
 */
export const planIds = {
  FREE: 'plan_free',
  PRO: 'plan_pro',
  TEAM: 'plan_team',
} as const;
