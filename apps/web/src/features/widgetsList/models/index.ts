import type { GetWidgetsQuery } from '@/shared/graphql/generated/operations';

export type WidgetListItem = GetWidgetsQuery['widgets'][number];
