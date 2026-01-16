import type { Context } from 'hono';
import { env } from '@/shared/config/env';

/**
 * GET /e2e/organizations/:slug
 * Return configured E2E organization
 *
 * Only returns data if slug matches the configured E2E_ORGANIZATION_SLUG.
 */
export async function getOrganization(c: Context) {
  const slug = c.req.param('slug');

  if (slug !== env.E2E_ORGANIZATION_SLUG) {
    console.log(`[E2E] Org slug mismatch: ${slug} !== ${env.E2E_ORGANIZATION_SLUG}`);
    return c.json({ error: 'Organization not found' }, 404);
  }

  return c.json({
    id: env.E2E_ORGANIZATION_ID,
    slug: env.E2E_ORGANIZATION_SLUG,
  });
}
