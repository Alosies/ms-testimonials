import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { enhanceToken } from '@/features/auth/enhanceToken';

const auth = new Hono();

const enhanceTokenSchema = z.object({
  supabaseToken: z.string().min(1, 'Supabase token is required'),
});

/**
 * POST /auth/enhance-token
 * Enhance Supabase token with Hasura claims
 */
auth.post('/enhance-token', zValidator('json', enhanceTokenSchema), async (c) => {
  try {
    const { supabaseToken } = c.req.valid('json');

    const result = await enhanceToken({ supabaseToken });

    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token enhancement failed';
    return c.json({ error: message }, 401);
  }
});

/**
 * POST /auth/switch-role
 * Switch user role (placeholder for future implementation)
 */
auth.post('/switch-role', async (c) => {
  // TODO: Implement role switching if needed
  return c.json({ message: 'Role switch endpoint - not implemented' }, 501);
});

export default auth;
