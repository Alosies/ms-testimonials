/**
 * Credit Transaction Zod schemas for API validation
 * Part of ADR-023 AI Capabilities Plan Integration
 */

import { z } from '@hono/zod-openapi';

/**
 * Transaction type enum
 */
export const TransactionTypeSchema = z.enum([
  'ai_consumption',
  'plan_allocation',
  'topup_purchase',
  'promo_bonus',
  'admin_adjustment',
  'plan_change_adjustment',
  'expiration',
]).openapi({
  description: 'Type of credit transaction',
  example: 'ai_consumption',
});

export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/**
 * Query parameters for GET /credits/transactions
 */
export const GetTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    description: 'Page number (1-indexed)',
    example: 1,
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    description: 'Number of transactions per page (max 100)',
    example: 20,
  }),
  transaction_type: TransactionTypeSchema.optional().openapi({
    description: 'Filter by transaction type',
  }),
  from_date: z.string().datetime().optional().openapi({
    description: 'Filter transactions from this date (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  }),
  to_date: z.string().datetime().optional().openapi({
    description: 'Filter transactions until this date (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  }),
});

export type GetTransactionsQuery = z.infer<typeof GetTransactionsQuerySchema>;

/**
 * Single transaction in the response
 */
export const CreditTransactionSchema = z.object({
  id: z.string().openapi({
    description: 'Unique transaction ID',
    example: 'tx_abc123def',
  }),
  transactionType: TransactionTypeSchema.openapi({
    description: 'Type of credit transaction',
  }),
  creditsAmount: z.number().openapi({
    description: 'Credits amount (negative for consumption)',
    example: -2.5,
  }),
  balanceAfter: z.number().openapi({
    description: 'Balance after this transaction',
    example: 97.5,
  }),
  description: z.string().nullable().openapi({
    description: 'Human-readable description',
    example: 'AI question generation',
  }),
  aiCapabilityName: z.string().nullable().openapi({
    description: 'Name of the AI capability used (if applicable)',
    example: 'Smart Question Generation',
  }),
  qualityLevelName: z.string().nullable().openapi({
    description: 'Name of the quality level used (if applicable)',
    example: 'Enhanced',
  }),
  createdAt: z.string().datetime().openapi({
    description: 'When the transaction occurred (ISO 8601)',
    example: '2025-01-15T10:30:00Z',
  }),
});

export type CreditTransaction = z.infer<typeof CreditTransactionSchema>;

/**
 * Pagination metadata
 */
export const PaginationSchema = z.object({
  page: z.number().int().openapi({
    description: 'Current page number',
    example: 1,
  }),
  limit: z.number().int().openapi({
    description: 'Items per page',
    example: 20,
  }),
  total: z.number().int().openapi({
    description: 'Total number of transactions',
    example: 150,
  }),
  totalPages: z.number().int().openapi({
    description: 'Total number of pages',
    example: 8,
  }),
});

export type Pagination = z.infer<typeof PaginationSchema>;

/**
 * Successful response for GET /credits/transactions
 */
export const GetTransactionsResponseSchema = z.object({
  data: z.array(CreditTransactionSchema).openapi({
    description: 'List of credit transactions',
  }),
  pagination: PaginationSchema.openapi({
    description: 'Pagination metadata',
  }),
}).openapi('GetTransactionsResponse');

export type GetTransactionsResponse = z.infer<typeof GetTransactionsResponseSchema>;

/**
 * Error response for credits endpoints
 */
export const CreditsErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().openapi({
    description: 'Error message',
    example: 'Organization context required',
  }),
}).openapi('CreditsErrorResponse');

/**
 * Response for GET /credits/balance
 */
export const GetBalanceResponseSchema = z.object({
  available: z.number().openapi({
    description: 'Credits available (before overdraft) = monthly_credits + bonus_credits - reserved_credits - used_this_period',
    example: 75.5,
  }),
  spendable: z.number().openapi({
    description: 'Maximum spendable credits (available + overdraft_limit)',
    example: 85.5,
  }),
  monthlyCredits: z.number().openapi({
    description: 'Monthly credit allocation from plan',
    example: 100,
  }),
  bonusCredits: z.number().openapi({
    description: 'Purchased or promotional credits (do not expire monthly)',
    example: 25,
  }),
  reservedCredits: z.number().openapi({
    description: 'Credits currently reserved for pending AI operations',
    example: 5,
  }),
  usedThisPeriod: z.number().openapi({
    description: 'Credits consumed during the current billing period',
    example: 44.5,
  }),
  overdraftLimit: z.number().openapi({
    description: 'Overdraft allowance - how far negative balance can go',
    example: 10,
  }),
  periodStartsAt: z.string().datetime().openapi({
    description: 'Start of the current billing period (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  }),
  periodEndsAt: z.string().datetime().openapi({
    description: 'End of the current billing period (ISO 8601)',
    example: '2025-02-01T00:00:00Z',
  }),
}).openapi('GetBalanceResponse');

export type GetBalanceResponse = z.infer<typeof GetBalanceResponseSchema>;

// ============================================================
// POST /credits/purchase - Create Stripe checkout session
// ============================================================

/**
 * Request body for POST /credits/purchase
 */
export const PurchaseCreditsRequestSchema = z.object({
  packageId: z.string().min(1).openapi({
    description: 'ID of the credit topup package to purchase',
    example: 'abc123def456',
  }),
}).openapi('PurchaseCreditsRequest');

export type PurchaseCreditsRequest = z.infer<typeof PurchaseCreditsRequestSchema>;

/**
 * Successful response for POST /credits/purchase
 */
export const PurchaseCreditsResponseSchema = z.object({
  checkoutUrl: z.string().url().openapi({
    description: 'Stripe checkout session URL to redirect the user to',
    example: 'https://checkout.stripe.com/c/pay/cs_test_abc123',
  }),
  sessionId: z.string().openapi({
    description: 'Stripe checkout session ID for tracking',
    example: 'cs_test_abc123def456',
  }),
}).openapi('PurchaseCreditsResponse');

export type PurchaseCreditsResponse = z.infer<typeof PurchaseCreditsResponseSchema>;
