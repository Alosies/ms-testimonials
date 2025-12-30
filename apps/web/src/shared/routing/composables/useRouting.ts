import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { createSharedComposable } from '@vueuse/core'
import type { RoutingUtilities, NavigationOptions } from '../models'

/**
 * Centralized routing composable for the Testimonials app
 * Provides type-safe navigation actions and path getters
 *
 * Usage:
 * ```ts
 * const { goToDashboard, goToForm, formsPath } = useRouting()
 * goToForm('my-form-slug')
 * ```
 */
function useRoutingCore(): RoutingUtilities {
  const router = useRouter()

  // ============================================
  // Path Getters (Computed)
  // ============================================

  const dashboardPath = computed(() => '/dashboard')
  const formsPath = computed(() => '/forms')
  const testimonialsPath = computed(() => '/testimonials')
  const widgetsPath = computed(() => '/widgets')
  const settingsPath = computed(() => '/settings')

  // ============================================
  // Dynamic Path Getters
  // ============================================

  const getFormPath = (formSlug: string) => `/forms/${formSlug}`
  const getFormResponsesPath = (formSlug: string) => `/forms/${formSlug}/responses`
  const getFormSettingsPath = (formSlug: string) => `/forms/${formSlug}/settings`
  const getTestimonialPath = (testimonialId: string) => `/testimonials/${testimonialId}`
  const getWidgetPath = (widgetId: string) => `/widgets/${widgetId}`

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
  const goToNewForm = () => navigate('/forms/new')
  const goToForm = (formSlug: string, options?: NavigationOptions) =>
    navigate(getFormPath(formSlug), options)
  const goToFormResponses = (formSlug: string, options?: NavigationOptions) =>
    navigate(getFormResponsesPath(formSlug), options)
  const goToFormSettings = (formSlug: string, options?: NavigationOptions) =>
    navigate(getFormSettingsPath(formSlug), options)

  // Testimonials
  const goToTestimonials = () => navigate(testimonialsPath.value)
  const goToTestimonial = (testimonialId: string, options?: NavigationOptions) =>
    navigate(getTestimonialPath(testimonialId), options)

  // Widgets
  const goToWidgets = () => navigate(widgetsPath.value)
  const goToNewWidget = () => navigate('/widgets/new')
  const goToWidget = (widgetId: string, options?: NavigationOptions) =>
    navigate(getWidgetPath(widgetId), options)

  // Settings
  const goToSettings = () => navigate(settingsPath.value)
  const goToSettingsProfile = () => navigate('/settings/profile')

  // Auth (for redirects after login/logout)
  const goToLogin = () => navigate('/auth/login')
  const goToSignup = () => navigate('/auth/signup')

  return {
    // Path getters
    dashboardPath,
    formsPath,
    testimonialsPath,
    widgetsPath,
    settingsPath,

    // Dynamic path getters
    getFormPath,
    getFormResponsesPath,
    getFormSettingsPath,
    getTestimonialPath,
    getWidgetPath,

    // Navigation actions
    goToDashboard,
    goToForms,
    goToNewForm,
    goToForm,
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
