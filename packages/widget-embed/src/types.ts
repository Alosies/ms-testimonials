export interface WidgetConfig {
  id: string;
  name: string;
  type: 'wall_of_love' | 'carousel' | 'single_quote';
  theme: 'light' | 'dark';
  show_ratings: boolean;
  show_dates: boolean;
  show_company: boolean;
  show_avatar: boolean;
  max_display: number | null;
  settings: Record<string, unknown>;
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

export interface WidgetData {
  widget: WidgetConfig;
  testimonials: WidgetTestimonial[];
}
