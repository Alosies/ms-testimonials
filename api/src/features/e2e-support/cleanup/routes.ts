import type { Context } from 'hono';
import { env } from '@/shared/config/env';
import { cleanupTestData } from '../forms/crud';

/**
 * POST /e2e/cleanup
 * Clean up old E2E test data
 *
 * Soft-deletes forms older than specified hours (default: 24)
 */
export async function cleanup(c: Context) {
  try {
    const body = await c.req.json();
    const { olderThanHours } = body;

    const hours = typeof olderThanHours === 'number' ? olderThanHours : 24;

    console.log(`[E2E] Cleaning forms older than ${hours}h`);

    const deletedCount = await cleanupTestData(env.E2E_ORGANIZATION_ID, hours);

    console.log(`[E2E] Deleted ${deletedCount} forms`);

    return c.json({ success: true, deletedCount });
  } catch (error) {
    console.error('[E2E] Cleanup error:', error);
    return c.json({ error: 'Failed to cleanup' }, 500);
  }
}
