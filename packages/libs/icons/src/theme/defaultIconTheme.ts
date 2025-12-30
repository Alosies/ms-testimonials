/**
 * Default icon theme mapping semantic names to Heroicons
 * This provides a consistent icon vocabulary across the application
 */
export const defaultIconTheme = {
  // Navigation
  home: 'heroicons:home',
  menu: 'heroicons:bars-3',
  close: 'heroicons:x-mark',
  back: 'heroicons:arrow-left',
  forward: 'heroicons:arrow-right',

  // Actions
  add: 'heroicons:plus',
  remove: 'heroicons:minus',
  edit: 'heroicons:pencil',
  delete: 'heroicons:trash',
  save: 'heroicons:check',
  cancel: 'heroicons:x-mark',
  copy: 'heroicons:document-duplicate',
  share: 'heroicons:share',
  download: 'heroicons:arrow-down-tray',
  upload: 'heroicons:arrow-up-tray',
  refresh: 'heroicons:arrow-path',

  // Status
  success: 'heroicons:check-circle',
  error: 'heroicons:x-circle',
  warning: 'heroicons:exclamation-triangle',
  info: 'heroicons:information-circle',

  // UI Elements
  search: 'heroicons:magnifying-glass',
  filter: 'heroicons:funnel',
  sort: 'heroicons:arrows-up-down',
  settings: 'heroicons:cog-6-tooth',
  more: 'heroicons:ellipsis-horizontal',
  moreVertical: 'heroicons:ellipsis-vertical',
  expand: 'heroicons:chevron-down',
  collapse: 'heroicons:chevron-up',

  // Arrows & Chevrons
  arrowUp: 'heroicons:arrow-up',
  arrowDown: 'heroicons:arrow-down',
  arrowLeft: 'heroicons:arrow-left',
  arrowRight: 'heroicons:arrow-right',
  chevronUp: 'heroicons:chevron-up',
  chevronDown: 'heroicons:chevron-down',
  chevronLeft: 'heroicons:chevron-left',
  chevronRight: 'heroicons:chevron-right',

  // Common
  user: 'heroicons:user',
  users: 'heroicons:users',
  calendar: 'heroicons:calendar',
  email: 'heroicons:envelope',
  phone: 'heroicons:phone',
  lock: 'heroicons:lock-closed',
  unlock: 'heroicons:lock-open',
  eye: 'heroicons:eye',
  eyeOff: 'heroicons:eye-slash',
  link: 'heroicons:link',
  externalLink: 'heroicons:arrow-top-right-on-square',

  // Testimonials-specific
  testimonial: 'heroicons:chat-bubble-left-right',
  form: 'heroicons:document-text',
  widget: 'heroicons:squares-2x2',
  dashboard: 'heroicons:home',
  workspace: 'heroicons:building-office-2',
  inbox: 'heroicons:inbox',
  chartBar: 'heroicons:chart-bar',
  star: 'heroicons:star',
  starFilled: 'heroicons:star-solid',
  heart: 'heroicons:heart',
  heartFilled: 'heroicons:heart-solid',
  logout: 'heroicons:arrow-right-on-rectangle',
  login: 'heroicons:arrow-left-on-rectangle',
} as const

export type IconThemeKey = keyof typeof defaultIconTheme
export type IconThemeConfig = Record<string, string>
