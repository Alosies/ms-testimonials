// Components
export { Icon, IconButton } from './components'
export type { IconProps, IconButtonProps } from './components'

// Composables
export { useIconSet, ICON_COLLECTIONS } from './composables'
export type { IconCollectionType } from './composables'

// Theme
export { defaultIconTheme } from './theme'
export type { IconThemeKey, IconThemeConfig } from './theme'

// Re-export useful Iconify utilities
export { addIcon, loadIcons, disableCache, enableCache } from '@iconify/vue'
