import type { ComputedRef } from 'vue'

/**
 * Navigation options for route transitions
 */
export interface NavigationOptions {
  query?: Record<string, string>
  replace?: boolean
}

/**
 * Routing utilities interface
 * Provides type-safe navigation actions and path getters
 */
export interface RoutingUtilities {
  // Path getters (computed refs)
  dashboardPath: ComputedRef<string>
  formsPath: ComputedRef<string>
  testimonialsPath: ComputedRef<string>
  widgetsPath: ComputedRef<string>
  settingsPath: ComputedRef<string>

  // Dynamic path getters
  getFormPath: (formSlug: string) => string
  getFormResponsesPath: (formSlug: string) => string
  getFormSettingsPath: (formSlug: string) => string
  getTestimonialPath: (testimonialId: string) => string
  getWidgetPath: (widgetId: string) => string

  // Navigation actions
  goToDashboard: () => void
  goToForms: () => void
  goToNewForm: () => void
  goToForm: (formSlug: string, options?: NavigationOptions) => void
  goToFormResponses: (formSlug: string, options?: NavigationOptions) => void
  goToFormSettings: (formSlug: string, options?: NavigationOptions) => void
  goToTestimonials: () => void
  goToTestimonial: (testimonialId: string, options?: NavigationOptions) => void
  goToWidgets: () => void
  goToNewWidget: () => void
  goToWidget: (widgetId: string, options?: NavigationOptions) => void
  goToSettings: () => void
  goToSettingsProfile: () => void

  // Auth (for redirects)
  goToLogin: () => void
  goToSignup: () => void
}

/**
 * Breadcrumb item for navigation trail
 */
export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
  isLast?: boolean
}
