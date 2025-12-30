import { ref, computed } from 'vue'

/**
 * Available icon collections
 */
export const ICON_COLLECTIONS = {
  heroicons: 'heroicons',
  lucide: 'lucide',
  mdi: 'mdi',
  tabler: 'tabler',
} as const

export type IconCollectionType = (typeof ICON_COLLECTIONS)[keyof typeof ICON_COLLECTIONS]

const currentCollection = ref<IconCollectionType>('heroicons')

/**
 * Common icon mappings for quick access
 */
const commonIconNames = {
  home: 'home',
  add: 'plus',
  edit: 'pencil',
  delete: 'trash',
  settings: 'cog-6-tooth',
  search: 'magnifying-glass',
  close: 'x-mark',
  check: 'check',
  user: 'user',
  menu: 'bars-3',
} as const

/**
 * Composable for managing icon sets and collections
 */
export function useIconSet() {
  /**
   * Set the default icon collection
   */
  const setDefaultCollection = (collection: IconCollectionType) => {
    currentCollection.value = collection
  }

  /**
   * Get full icon name with collection prefix
   */
  const getIconName = (iconName: string, collection?: IconCollectionType) => {
    const col = collection || currentCollection.value
    // If already has collection prefix, return as-is
    if (iconName.includes(':')) return iconName
    return `${col}:${iconName}`
  }

  /**
   * Common icons with current collection prefix
   */
  const commonIcons = computed(() => {
    const icons: Record<keyof typeof commonIconNames, string> = {} as any
    for (const [key, value] of Object.entries(commonIconNames)) {
      icons[key as keyof typeof commonIconNames] = getIconName(value)
    }
    return icons
  })

  return {
    currentCollection: computed(() => currentCollection.value),
    setDefaultCollection,
    getIconName,
    commonIcons,
    ICON_COLLECTIONS,
  }
}
