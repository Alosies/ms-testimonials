/**
 * Navigation types for the sidebar feature
 */

export interface MenuItem {
  id: string
  icon: string
  label: string
  badge?: number | string
  action?: string | (() => void)
  children?: MenuItem[]
  expanded?: boolean
  section?: 'main' | 'secondary'
  testId?: string
  disabled?: boolean
  comingSoon?: boolean
}

export interface NavigationSection {
  id: string
  label: string
  icon?: string
  items: MenuItem[]
  collapsible?: boolean
  defaultExpanded?: boolean
}
