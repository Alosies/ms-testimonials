/**
 * Credits Routes
 *
 * Provides credit balance, transaction history, rate limits, and purchase
 * functionality for organizations.
 *
 * **Data Access Strategy (ADR-023):**
 * - READ operations (balance, transactions): GraphQL via Hasura
 *   - Leverages Hasura's row-level security for organization isolation
 *   - Type-safe via generated operations
 * - WRITE operations (purchase checkout): Drizzle ORM
 *   - Complex Stripe integration with conditional updates
 *
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { OpenAPIHono } from '@hono/zod-openapi';
import { authMiddleware } from '@/shared/middleware/auth';

// Import routes and handlers
import {
  getTransactionsRoute,
  getTransactionsHandler,
} from './getTransactions';
import { getBalanceRoute, getBalanceHandler } from './getBalance';
import { getLimitsRoute, getLimitsHandler } from './getLimits';
import { purchaseCreditsRoute, purchaseCreditsHandler } from './purchase';

const credits = new OpenAPIHono();

// Apply auth middleware to all routes
credits.use('/*', authMiddleware);

// Register routes with their handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(getTransactionsRoute, getTransactionsHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(getBalanceRoute, getBalanceHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(getLimitsRoute, getLimitsHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
credits.openapi(purchaseCreditsRoute, purchaseCreditsHandler as any);

export { credits };
export type CreditsRoutes = typeof credits;
