import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createSharedComposable } from '@vueuse/core'
import { useCurrentContextStore } from '@/shared/currentContext'
import { createEntityUrlSlug } from '@/shared/urls'
import type {
  RoutingUtilities,
  NavigationOptions,
  FormRef,
  TestimonialRef,
  WidgetRef,
} from '../models'

/**
 * Centralized routing composable for the Testimonials app
 * Provides type-safe navigation actions and path getters
 *
 * Uses the slug_id URL pattern where slugs are cosmetic and only IDs are used for resolution.
 *
 * Usage:
 * ```ts
 * const { goToDashboard, goToForm, formsPath } = useRouting()
 *
 * // Navigate to a form using name + ID
 * goToForm({ name: 'Product Feedback', id: 'f7x8y9z0a1b2' })
 * // Results in: /acme-corp/forms/product-feedback_f7x8y9z0a1b2
 * ```
 */
function useRoutingCore(): RoutingUtilities {
  const router = useRouter()
  const route = useRoute()
  const contextStore = useCurrentContextStore()

  // ============================================
  // Organization Context
  // ============================================

  // Use store slug first, fall back to route params for immediate availability
  const organizationSlug = computed(() => {
    const storeSlug = contextStore.currentOrganizationSlug
    if (storeSlug) return storeSlug
    // Fallback to route param when store isn't populated yet
    const routeOrg = route.params.org
    return typeof routeOrg === 'string' ? routeOrg : null
  })

  /**
   * Helper to build organization-scoped paths
   */
  const withOrgPrefix = (path: string): string => {
    const orgSlug = organizationSlug.value
    if (!orgSlug) {
      // Fallback to path without org prefix if not available
      return path
    }
    return `/${orgSlug}${path}`
  }

  // ============================================
  // Path Getters (Computed - Organization Scoped)
  // ============================================

  const dashboardPath = computed(() => withOrgPrefix('/dashboard'))
  const formsPath = computed(() => withOrgPrefix('/forms'))
  const testimonialsPath = computed(() => withOrgPrefix('/testimonials'))
  const widgetsPath = computed(() => withOrgPrefix('/widgets'))
  const settingsPath = computed(() => withOrgPrefix('/settings'))

  // ============================================
  // Dynamic Path Getters (using slug_id pattern)
  // ============================================

  const getFormPath = (form: FormRef) => {
    const urlSlug = createEntityUrlSlug(form.name, form.id)
    return withOrgPrefix(`/forms/${urlSlug}`)
  }

  const getFormEditPath = (form: FormRef) => {
    const urlSlug = createEntityUrlSlug(form.name, form.id)
    return withOrgPrefix(`/forms/${urlSlug}/edit`)
  }

  const getFormResponsesPath = (form: FormRef) => {
    const urlSlug = createEntityUrlSlug(form.name, form.id)
    return withOrgPrefix(`/forms/${urlSlug}/responses`)
  }

  const getFormSettingsPath = (form: FormRef) => {
    const urlSlug = createEntityUrlSlug(form.name, form.id)
    return withOrgPrefix(`/forms/${urlSlug}/settings`)
  }

  const getTestimonialPath = (testimonial: TestimonialRef) => {
    const urlSlug = createEntityUrlSlug(testimonial.customerName, testimonial.id)
    return withOrgPrefix(`/testimonials/${urlSlug}`)
  }

  const getWidgetPath = (widget: WidgetRef) => {
    const urlSlug = createEntityUrlSlug(widget.name, widget.id)
    return withOrgPrefix(`/widgets/${urlSlug}`)
  }

  // ============================================
  // Navigation Actions
  // ============================================

  const navigate = (path: string, options?: NavigationOptions) => {
    const routeConfig: { path: string; query?: Record<string, string> } = { path }
    if (options?.query) {
      routeConfig.query = options.query
    }
    if (options?.replace) {
      router.replace(routeConfig)
    } else {
      router.push(routeConfig)
    }
  }

  // Dashboard
  const goToDashboard = () => navigate(dashboardPath.value)

  // Forms
  const goToForms = () => navigate(formsPath.value)
  const goToNewForm = () => navigate(withOrgPrefix('/forms/new'))
  const goToForm = (form: FormRef, options?: NavigationOptions) =>
    navigate(getFormPath(form), options)
  const goToFormResponses = (form: FormRef, options?: NavigationOptions) =>
    navigate(getFormResponsesPath(form), options)
  const goToFormEdit = (form: FormRef, options?: NavigationOptions) =>
    navigate(getFormEditPath(form), options)
  const goToFormSettings = (form: FormRef, options?: NavigationOptions) =>
    navigate(getFormSettingsPath(form), options)

  // Testimonials
  const goToTestimonials = () => navigate(testimonialsPath.value)
  const goToTestimonial = (testimonial: TestimonialRef, options?: NavigationOptions) =>
    navigate(getTestimonialPath(testimonial), options)

  // Widgets
  const goToWidgets = () => navigate(widgetsPath.value)
  const goToNewWidget = () => navigate(withOrgPrefix('/widgets/new'))
  const goToWidget = (widget: WidgetRef, options?: NavigationOptions) =>
    navigate(getWidgetPath(widget), options)

  // Settings
  const goToSettings = () => navigate(settingsPath.value)
  const goToSettingsProfile = () => navigate(withOrgPrefix('/settings/profile'))

  // Auth (for redirects after login/logout)
  const goToLogin = () => navigate('/auth/login')
  const goToSignup = () => navigate('/auth/signup')

  return {
    // Organization context
    organizationSlug,

    // Path getters
    dashboardPath,
    formsPath,
    testimonialsPath,
    widgetsPath,
    settingsPath,

    // Dynamic path getters
    getFormPath,
    getFormEditPath,
    getFormResponsesPath,
    getFormSettingsPath,
    getTestimonialPath,
    getWidgetPath,

    // Navigation actions
    goToDashboard,
    goToForms,
    goToNewForm,
    goToForm,
    goToFormEdit,
    goToFormResponses,
    goToFormSettings,
    goToTestimonials,
    goToTestimonial,
    goToWidgets,
    goToNewWidget,
    goToWidget,
    goToSettings,
    goToSettingsProfile,
    goToLogin,
    goToSignup,
  }
}

/**
 * Shared routing composable
 * Ensures a single instance is used across the app
 */
export const useRouting = createSharedComposable(useRoutingCore)
