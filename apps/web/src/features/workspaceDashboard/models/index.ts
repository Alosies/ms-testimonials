import type { GetDashboardStatsQueryVariables } from '@/shared/graphql/generated/operations';

export type GetDashboardStatsVariables = GetDashboardStatsQueryVariables;

export interface DashboardStats {
  formsCount: number;
  testimonialsCount: number;
  pendingCount: number;
  widgetsCount: number;
}

export interface QuickAction {
  name: string;
  icon: string;
  color: string;
  description: string;
  route: string;
}
