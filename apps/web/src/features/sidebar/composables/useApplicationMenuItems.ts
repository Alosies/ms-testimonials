import { computed, type ComputedRef } from 'vue'
import { useRouting } from '@/shared/routing'
import type { MenuItem } from '../types'

export interface UseApplicationMenuItemsReturn {
  applicationMenuItems: ComputedRef<MenuItem[]>
}

export function useApplicationMenuItems(): UseApplicationMenuItemsReturn {
  const {
    goToDashboard,
    goToForms,
    goToTestimonials,
    goToWidgets,
    goToSettings,
  } = useRouting()

  const applicationMenuItems = computed<MenuItem[]>(() => [
    {
      id: 'dashboard',
      icon: 'heroicons:home',
      label: 'Dashboard',
      action: goToDashboard,
      testId: 'nav-dashboard',
    },
    {
      id: 'forms',
      icon: 'heroicons:document-text',
      label: 'Forms',
      action: goToForms,
      testId: 'nav-forms',
    },
    {
      id: 'testimonials',
      icon: 'heroicons:chat-bubble-left-right',
      label: 'Testimonials',
      action: goToTestimonials,
      testId: 'nav-testimonials',
    },
    {
      id: 'widgets',
      icon: 'heroicons:squares-2x2',
      label: 'Widgets',
      action: goToWidgets,
      testId: 'nav-widgets',
    },
    {
      id: 'settings',
      icon: 'heroicons:cog-6-tooth',
      label: 'Settings',
      action: goToSettings,
      testId: 'nav-settings',
      section: 'secondary',
    },
  ])

  return {
    applicationMenuItems,
  }
}
