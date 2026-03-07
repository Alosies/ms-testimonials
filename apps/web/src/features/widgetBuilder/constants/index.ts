import { getDefaultSettings } from '@/entities/widget';
import type { WidgetFormState } from '../models';

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
  settings: getDefaultSettings('wall_of_love'),
  is_active: true,
};
