import type { ComputedRef } from 'vue'

/**
 * Navigation options for route transitions
 */
export interface NavigationOptions {
  query?: Record<string, string>
  replace?: boolean
}

/**
 * Entity reference for URL generation
 * Contains the entity name (for slug) and ID (for resolution)
 */
export interface EntityRef {
  name: string
  id: string
}

/**
 * Form entity reference
 */
export interface FormRef extends EntityRef {}

/**
 * Testimonial entity reference
 */
export interface TestimonialRef {
  customerName: string
  id: string
}

/**
 * Widget entity reference
 */
export interface WidgetRef extends EntityRef {}

/**
 * Routing utilities interface
 * Provides type-safe navigation actions and path getters
 */
export interface RoutingUtilities {
  // Organization context
  organizationSlug: ComputedRef<string | null>

  // Path getters (computed refs - organization-scoped)
  dashboardPath: ComputedRef<string>
  formsPath: ComputedRef<string>
  newFormPath: ComputedRef<string>
  testimonialsPath: ComputedRef<string>
  widgetsPath: ComputedRef<string>
  newWidgetPath: ComputedRef<string>
  settingsPath: ComputedRef<string>

  // Dynamic path getters (using slug_id pattern)
  getFormPath: (form: FormRef) => string
  getFormEditPath: (form: FormRef) => string
  getFormResponsesPath: (form: FormRef) => string
  getFormSettingsPath: (form: FormRef) => string
  getTestimonialPath: (testimonial: TestimonialRef) => string
  getWidgetPath: (widget: WidgetRef) => string

  // Navigation actions
  goToDashboard: () => void
  goToForms: () => void
  goToNewForm: () => void
  goToForm: (form: FormRef, options?: NavigationOptions) => void
  goToFormEdit: (form: FormRef, options?: NavigationOptions) => void
  goToFormResponses: (form: FormRef, options?: NavigationOptions) => void
  goToFormSettings: (form: FormRef, options?: NavigationOptions) => void
  goToTestimonials: () => void
  goToTestimonial: (testimonial: TestimonialRef, options?: NavigationOptions) => void
  goToWidgets: () => void
  goToNewWidget: () => void
  goToWidget: (widget: WidgetRef, options?: NavigationOptions) => void
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
