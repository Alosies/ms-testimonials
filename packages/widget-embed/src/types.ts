import type {
  WidgetType,
  WidgetSettings,
  WallOfLoveSettings,
  CarouselSettings,
  SingleQuoteSettings,
  MarqueeSettings,
  RatingBadgeSettings,
  AvatarsBarSettings,
  ToastPopupSettings,
} from '@testimonials/core/schemas/db/widgets';

export type {
  WidgetType,
  WidgetSettings,
  WallOfLoveSettings,
  CarouselSettings,
  SingleQuoteSettings,
  MarqueeSettings,
  RatingBadgeSettings,
  AvatarsBarSettings,
  ToastPopupSettings,
};

export interface WidgetConfig {
  id: string;
  name: string;
  type: WidgetType;
  theme: 'light' | 'dark';
  show_ratings: boolean;
  show_dates: boolean;
  show_company: boolean;
  show_avatar: boolean;
  max_display: number | null;
  settings: WidgetSettings;
}

export interface WidgetTestimonial {
  id: string;
  content: string | null;
  customer_name: string | null;
  customer_company: string | null;
  customer_title: string | null;
  customer_avatar_url: string | null;
  rating: number | null;
  created_at: string;
  display_order: number;
  is_featured: boolean;
}

export interface WidgetAggregates {
  average_rating: number | null;
  total_count: number;
  rated_count: number;
}

export interface WidgetData {
  widget: WidgetConfig;
  testimonials: WidgetTestimonial[];
  aggregates?: WidgetAggregates;
}
