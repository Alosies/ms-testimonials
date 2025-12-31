/**
 * Reserved slugs that cannot be used as organization slugs.
 * These are blocked to prevent:
 * - Brand impersonation (google, facebook, etc.)
 * - Confusion with system routes (api, admin, etc.)
 * - Security issues (login, auth, etc.)
 * - RFC 2142 compliance (abuse, postmaster, etc.)
 */

// Major tech brands and companies
const BRAND_SLUGS = [
  'google',
  'facebook',
  'meta',
  'apple',
  'microsoft',
  'amazon',
  'aws',
  'netflix',
  'twitter',
  'x',
  'instagram',
  'whatsapp',
  'linkedin',
  'github',
  'gitlab',
  'slack',
  'discord',
  'zoom',
  'dropbox',
  'stripe',
  'paypal',
  'shopify',
  'salesforce',
  'oracle',
  'ibm',
  'intel',
  'nvidia',
  'adobe',
  'spotify',
  'uber',
  'airbnb',
  'notion',
  'linear',
  'figma',
  'canva',
  'vercel',
  'netlify',
  'heroku',
  'digitalocean',
  'cloudflare',
  'testimonials',
  'testimonial',
] as const;

// System and admin routes
const SYSTEM_SLUGS = [
  'admin',
  'administrator',
  'root',
  'system',
  'sys',
  'super',
  'superuser',
  'moderator',
  'mod',
  'staff',
  'support',
  'help',
  'helpdesk',
  'api',
  'graphql',
  'rest',
  'webhook',
  'webhooks',
  'oauth',
  'auth',
  'authentication',
  'www',
  'web',
  'mail',
  'email',
  'smtp',
  'imap',
  'pop',
  'ftp',
  'sftp',
  'ssh',
  'dns',
  'ns',
  'ns1',
  'ns2',
  'cdn',
  'static',
  'assets',
  'media',
  'images',
  'img',
  'files',
  'uploads',
  'download',
  'downloads',
] as const;

// Application routes (prevent collision with app URLs)
// Includes routes from apps/web/src/pages/ directory
const APP_ROUTE_SLUGS = [
  // Direct app routes (from pages directory)
  'auth',
  'f',
  'w',
  'showcase',
  // Common auth routes
  'login',
  'logout',
  'signin',
  'signout',
  'signup',
  'register',
  'forgot',
  'reset',
  'verify',
  'confirm',
  'activate',
  // App section routes
  'dashboard',
  'home',
  'index',
  'settings',
  'profile',
  'account',
  'billing',
  'subscription',
  'pricing',
  'plans',
  'checkout',
  'payment',
  'payments',
  'invoice',
  'invoices',
  'forms',
  'form',
  'widgets',
  'widget',
  'embed',
  'preview',
  // Environment routes
  'demo',
  'test',
  'testing',
  'sandbox',
  'dev',
  'development',
  'staging',
  'prod',
  'production',
  // Documentation/info routes
  'docs',
  'documentation',
  'blog',
  'news',
  'about',
  'contact',
  'privacy',
  'terms',
  'tos',
  'legal',
  'faq',
  'status',
  'health',
  'healthcheck',
] as const;

// RFC 2142 reserved email addresses (important for subdomain security)
const RFC_2142_SLUGS = [
  'abuse',
  'postmaster',
  'webmaster',
  'hostmaster',
  'admin',
  'administrator',
  'info',
  'marketing',
  'sales',
  'security',
  'noc',
  'noreply',
  'no-reply',
  'mailer-daemon',
] as const;

// Generic/common terms that could cause confusion
const GENERIC_SLUGS = [
  'app',
  'application',
  'company',
  'business',
  'enterprise',
  'team',
  'teams',
  'org',
  'organization',
  'workspace',
  'workspaces',
  'project',
  'projects',
  'client',
  'clients',
  'customer',
  'customers',
  'user',
  'users',
  'member',
  'members',
  'public',
  'private',
  'internal',
  'external',
  'default',
  'example',
  'sample',
  'null',
  'undefined',
  'void',
  'none',
  'anonymous',
  'guest',
  'unknown',
] as const;

// Create Sets for efficient lookup
const BRAND_SLUGS_SET = new Set<string>(BRAND_SLUGS);
const SYSTEM_SLUGS_SET = new Set<string>(SYSTEM_SLUGS);
const APP_ROUTE_SLUGS_SET = new Set<string>(APP_ROUTE_SLUGS);
const RFC_2142_SLUGS_SET = new Set<string>(RFC_2142_SLUGS);
const GENERIC_SLUGS_SET = new Set<string>(GENERIC_SLUGS);

/**
 * Complete list of reserved slugs
 */
export const RESERVED_SLUGS: Set<string> = new Set([
  ...BRAND_SLUGS,
  ...SYSTEM_SLUGS,
  ...APP_ROUTE_SLUGS,
  ...RFC_2142_SLUGS,
  ...GENERIC_SLUGS,
]);

/**
 * Check if a slug is reserved
 * @param slug - The slug to check (case-insensitive)
 * @returns true if the slug is reserved, false otherwise
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}

/**
 * Get a user-friendly message for why a slug is reserved
 * @param slug - The reserved slug
 * @returns A message explaining why the slug cannot be used
 */
export function getReservedSlugMessage(slug: string): string {
  const normalizedSlug = slug.toLowerCase().trim();

  if (BRAND_SLUGS_SET.has(normalizedSlug)) {
    return 'This name is reserved (brand protection)';
  }

  if (SYSTEM_SLUGS_SET.has(normalizedSlug)) {
    return 'This name is reserved for system use';
  }

  if (APP_ROUTE_SLUGS_SET.has(normalizedSlug)) {
    return 'This name conflicts with application routes';
  }

  if (RFC_2142_SLUGS_SET.has(normalizedSlug)) {
    return 'This name is reserved (RFC 2142)';
  }

  if (GENERIC_SLUGS_SET.has(normalizedSlug)) {
    return 'This name is reserved';
  }

  return 'This name is reserved';
}
