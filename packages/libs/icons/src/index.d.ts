import type { DefineComponent } from 'vue'

// Component Types
export interface IconProps {
  icon: string
  color?: string
  width?: number | string
  height?: number | string
  hFlip?: boolean
  vFlip?: boolean
  rotate?: 0 | 1 | 2 | 3
  inline?: boolean
}

export interface IconButtonProps {
  icon: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
  disabled?: boolean
}

// Components
export declare const Icon: DefineComponent<IconProps>
export declare const IconButton: DefineComponent<IconButtonProps>

// Composables
export declare const ICON_COLLECTIONS: {
  readonly heroicons: 'heroicons'
  readonly lucide: 'lucide'
  readonly mdi: 'mdi'
  readonly tabler: 'tabler'
}

export type IconCollectionType = (typeof ICON_COLLECTIONS)[keyof typeof ICON_COLLECTIONS]

export declare function useIconSet(): {
  currentCollection: import('vue').ComputedRef<IconCollectionType>
  setDefaultCollection: (collection: IconCollectionType) => void
  getIconName: (iconName: string, collection?: IconCollectionType) => string
  commonIcons: import('vue').ComputedRef<Record<string, string>>
  ICON_COLLECTIONS: typeof ICON_COLLECTIONS
}

// Theme
export declare const defaultIconTheme: {
  readonly home: 'heroicons:home'
  readonly menu: 'heroicons:bars-3'
  readonly close: 'heroicons:x-mark'
  readonly back: 'heroicons:arrow-left'
  readonly forward: 'heroicons:arrow-right'
  readonly add: 'heroicons:plus'
  readonly remove: 'heroicons:minus'
  readonly edit: 'heroicons:pencil'
  readonly delete: 'heroicons:trash'
  readonly save: 'heroicons:check'
  readonly cancel: 'heroicons:x-mark'
  readonly copy: 'heroicons:document-duplicate'
  readonly share: 'heroicons:share'
  readonly download: 'heroicons:arrow-down-tray'
  readonly upload: 'heroicons:arrow-up-tray'
  readonly refresh: 'heroicons:arrow-path'
  readonly success: 'heroicons:check-circle'
  readonly error: 'heroicons:x-circle'
  readonly warning: 'heroicons:exclamation-triangle'
  readonly info: 'heroicons:information-circle'
  readonly search: 'heroicons:magnifying-glass'
  readonly filter: 'heroicons:funnel'
  readonly sort: 'heroicons:arrows-up-down'
  readonly settings: 'heroicons:cog-6-tooth'
  readonly more: 'heroicons:ellipsis-horizontal'
  readonly moreVertical: 'heroicons:ellipsis-vertical'
  readonly expand: 'heroicons:chevron-down'
  readonly collapse: 'heroicons:chevron-up'
  readonly arrowUp: 'heroicons:arrow-up'
  readonly arrowDown: 'heroicons:arrow-down'
  readonly arrowLeft: 'heroicons:arrow-left'
  readonly arrowRight: 'heroicons:arrow-right'
  readonly chevronUp: 'heroicons:chevron-up'
  readonly chevronDown: 'heroicons:chevron-down'
  readonly chevronLeft: 'heroicons:chevron-left'
  readonly chevronRight: 'heroicons:chevron-right'
  readonly user: 'heroicons:user'
  readonly users: 'heroicons:users'
  readonly calendar: 'heroicons:calendar'
  readonly email: 'heroicons:envelope'
  readonly phone: 'heroicons:phone'
  readonly lock: 'heroicons:lock-closed'
  readonly unlock: 'heroicons:lock-open'
  readonly eye: 'heroicons:eye'
  readonly eyeOff: 'heroicons:eye-slash'
  readonly link: 'heroicons:link'
  readonly externalLink: 'heroicons:arrow-top-right-on-square'
  readonly testimonial: 'heroicons:chat-bubble-left-right'
  readonly form: 'heroicons:document-text'
  readonly widget: 'heroicons:squares-2x2'
  readonly dashboard: 'heroicons:home'
  readonly workspace: 'heroicons:building-office-2'
  readonly inbox: 'heroicons:inbox'
  readonly chartBar: 'heroicons:chart-bar'
  readonly star: 'heroicons:star'
  readonly starFilled: 'heroicons:star-solid'
  readonly heart: 'heroicons:heart'
  readonly heartFilled: 'heroicons:heart-solid'
  readonly logout: 'heroicons:arrow-right-on-rectangle'
  readonly login: 'heroicons:arrow-left-on-rectangle'
}

export type IconThemeKey = keyof typeof defaultIconTheme
export type IconThemeConfig = Record<string, string>

// Re-exported Iconify utilities
export { addIcon, loadIcons, disableCache, enableCache } from '@iconify/vue'
