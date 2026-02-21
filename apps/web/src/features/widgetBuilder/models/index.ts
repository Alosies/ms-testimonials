import type { WidgetType, WidgetTheme } from '@/entities/widget';

export interface WidgetFormState {
  name: string;
  type: WidgetType;
  theme: WidgetTheme;
  form_id: string | null;
  show_ratings: boolean;
  show_dates: boolean;
  show_company: boolean;
  show_avatar: boolean;
  max_display: number | null;
  settings: Record<string, unknown>;
  is_active: boolean;
}

export const DEFAULT_WIDGET_STATE: WidgetFormState = {
  name: '',
  type: 'wall_of_love',
  theme: 'light',
  form_id: null,
  show_ratings: true,
  show_dates: false,
  show_company: true,
  show_avatar: true,
  max_display: null,
  settings: {},
  is_active: true,
};

export interface TestimonialForSelector {
  id: string;
  content: string | null;
  customer_name: string | null;
  customer_company: string | null;
  customer_avatar_url: string | null;
  rating: number | null;
  status: string;
}
