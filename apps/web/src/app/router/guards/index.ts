/**
 * Router guards for authentication and organization routing
 */
import type { Router } from 'vue-router'
import { useAuth } from '@/features/auth'
import { useCurrentContextStore } from '@/shared/currentContext'

/**
 * Reserved route segments that cannot be used as organization slugs
 * These are top-level routes that would conflict with the /:org pattern
 */
const RESERVED_SLUGS = [
  'auth',
  'f',
  'w',
  'embed',
  'showcase',
  'api',
  'dashboard',  // Legacy route - redirect to proper org dashboard
  'forms',
  'testimonials',
  'widgets',
  'settings',
  'admin',
]

/**
 * Check if a slug is reserved (cannot be an org slug)
 */
function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.toLowerCase())
}

export function setupAuthGuards(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const { isAuthenticated, isLoading, isInitialized } = useAuth()
    const contextStore = useCurrentContextStore()

    // Wait for auth to initialize before making decisions
    if (!isInitialized.value) {
      return next()
    }

    // Wait for loading to complete
    if (isLoading.value) {
      return next()
    }

    const isAuth = isAuthenticated.value
    const orgSlug = contextStore.currentOrganizationSlug

    // Handle reserved slugs being used as org param (legacy routes)
    // e.g., /dashboard should redirect to /:org/dashboard
    if (to.params.org && isReservedSlug(to.params.org as string)) {
      if (isAuth && orgSlug) {
        // Redirect legacy route to proper org-scoped route
        // /dashboard -> /acme-corp/dashboard
        // /forms -> /acme-corp/forms
        const legacySegment = to.params.org as string
        const remainingPath = to.path.replace(`/${legacySegment}`, '')
        const newPath = `/${orgSlug}/${legacySegment}${remainingPath}`
        return next(newPath)
      }
      // Not authenticated, redirect to login
      return next('/auth/login')
    }

    // Allow public routes without authentication
    if (to.meta.public) {
      return next()
    }

    // Protect routes that require authentication
    if (to.meta.requiresAuth && !isAuth) {
      return next('/auth/login')
    }

    // Prevent authenticated users from accessing guest-only pages (login, signup)
    if (to.meta.guestOnly && isAuth) {
      // Redirect to org dashboard if we have an org slug
      if (orgSlug) {
        return next(`/${orgSlug}/dashboard`)
      }
      // Fallback to root which will handle redirect
      return next('/')
    }

    // Redirect authenticated users from root to their org dashboard
    if (to.path === '/' && isAuth) {
      if (orgSlug) {
        return next(`/${orgSlug}/dashboard`)
      }
      // If no org yet, wait for context to load
      // The app will redirect once org is available
      return next()
    }

    // For org-scoped routes, validate org slug matches current context
    // This prevents users from accessing other orgs via URL manipulation
    if (to.params.org && isAuth && orgSlug) {
      const routeOrg = to.params.org as string
      if (routeOrg !== orgSlug) {
        // Redirect to correct org path
        const newPath = to.path.replace(`/${routeOrg}/`, `/${orgSlug}/`)
        return next(newPath)
      }
    }

    next()
  })
}
