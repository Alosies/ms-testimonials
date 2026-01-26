/**
 * Dashboard API Composable
 *
 * Provides type-safe methods for dashboard API operations.
 * Types imported from API schemas for end-to-end type safety (per ADR-021).
 */

import { useApi } from '@/shared/api/rest';
import type {
  DashboardResponse,
  DashboardErrorResponse,
  Period,
} from '@api/shared/schemas/dashboard';

/**
 * Dashboard API composable
 * Provides methods for dashboard-related API operations
 */
export function useApiForDashboard() {
  const api = useApi();

  /**
   * Get form dashboard analytics data
   * GET /dashboard/forms/:formId
   *
   * @param formId - ID of the form
   * @param period - Time period (7d, 30d, 90d)
   * @returns Dashboard response with all analytics data
   */
  async function getFormDashboard(
    formId: string,
    period: Period = '30d'
  ): Promise<DashboardResponse> {
    return api.get<DashboardResponse>(`/dashboard/forms/${formId}`, { period });
  }

  return {
    getFormDashboard,
  };
}

// Re-export types for convenience
export type { DashboardResponse, DashboardErrorResponse, Period };
