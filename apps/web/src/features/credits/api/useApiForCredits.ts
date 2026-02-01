/**
 * Credits API Composable
 *
 * Provides type-safe methods for credits API operations.
 */

import { useApi } from '@/shared/api/rest';
import type {
  CreditTransactionsResponse,
  CreditTransactionsParams,
  GetTopupPackagesResponse,
  PurchaseCreditsResponse,
} from '../models';

/**
 * Credits API composable
 * Provides methods for credit-related API operations
 */
export function useApiForCredits() {
  const api = useApi();

  /**
   * Get credit transaction history with pagination
   * GET /credits/transactions
   *
   * @param params - Query parameters (page, limit, transactionType)
   * @returns Paginated list of credit transactions
   */
  async function getTransactions(
    params: CreditTransactionsParams = {}
  ): Promise<CreditTransactionsResponse> {
    const queryParams: Record<string, string> = {};

    if (params.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params.limit !== undefined) {
      queryParams.limit = String(params.limit);
    }
    if (params.transactionType) {
      queryParams.transactionType = params.transactionType;
    }

    return api.get<CreditTransactionsResponse>('/credits/transactions', queryParams);
  }

  /**
   * Get available credit topup packages
   * GET /credits/topup-packages
   *
   * @returns List of available topup packages
   */
  async function getTopupPackages(): Promise<GetTopupPackagesResponse> {
    return api.get<GetTopupPackagesResponse>('/credits/topup-packages');
  }

  /**
   * Purchase a credit topup package
   * POST /credits/purchase
   *
   * Creates a Stripe checkout session and returns the URL to redirect the user.
   *
   * @param packageId - ID of the topup package to purchase
   * @returns Stripe checkout session URL and ID
   */
  async function purchaseCredits(packageId: string): Promise<PurchaseCreditsResponse> {
    return api.post<{ packageId: string }, PurchaseCreditsResponse>(
      '/credits/purchase',
      { packageId }
    );
  }

  return {
    getTransactions,
    getTopupPackages,
    purchaseCredits,
  };
}
