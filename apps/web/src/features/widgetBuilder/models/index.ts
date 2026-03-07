import type { WidgetType, WidgetTheme, WidgetSettings } from '@/entities/widget';

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
  settings: WidgetSettings;
  is_active: boolean;
}

export interface TestimonialForSelector {
  id: string;
  content: string | null;
  customer_name: string | null;
  customer_company: string | null;
  customer_avatar_url: string | null;
  rating: number | null;
  status: string;
}
