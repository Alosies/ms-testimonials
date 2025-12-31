/**
 * Router guards for authentication and organization routing
 *
 * Following CoursePads pattern:
 * - Uses module-level promise for auth readiness (no Vue watch in guards)
 * - Uses currentUserId from context store as the primary auth check
 */
import type { Router } from 'vue-router'
import { useAuth, getAuthReadyPromise } from '@/features/auth'
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
  router.beforeEach(async (to, from, next) => {
    const { isInitialized } = useAuth()
    const contextStore = useCurrentContextStore()

    // For routes that require auth or are guest-only, wait for auth to initialize
    // Uses module-level promise pattern (no Vue watch in guards)
    if (to.meta.requiresAuth || to.meta.guestOnly) {
      await getAuthReadyPromise()
    }

    // If still not initialized (public routes), let them through
    if (!isInitialized.value) {
      return next()
    }

    // Check if user is authenticated using context store
    // Primary check: currentUserId is not null
    const hasUser = contextStore.currentUserId !== null
    const orgSlug = contextStore.currentOrganizationSlug

    // Redirect authenticated users from root path to their organization dashboard
    // This runs early to ensure authenticated users never see the landing page
    if (to.path === '/' && hasUser) {
      if (orgSlug) {
        return next(`/${orgSlug}/dashboard`)
      }
      // Org not loaded yet - this will be handled by useCurrentContext watcher
      // For now, let them through and the app will redirect once org is available
    }

    // Handle post-login redirect: when navigating FROM auth pages after login
    // This catches the case where user just logged in and orgSlug might not be ready
    // Skip if already going to the correct org dashboard to prevent infinite loops
    if (from.path.startsWith('/auth/') && hasUser) {
      const targetOrgDashboard = `/${orgSlug}/dashboard`
      if (orgSlug && to.path !== targetOrgDashboard) {
        return next(targetOrgDashboard)
      }
      // If no org slug yet, redirect to root which will handle it once org loads
      // But skip if already going to root
      if (!orgSlug && to.path !== '/') {
        return next('/')
      }
    }

    // Handle reserved slugs being used as org param (legacy routes)
    // e.g., /dashboard should redirect to /:org/dashboard
    if (to.params.org && isReservedSlug(to.params.org as string)) {
      if (hasUser && orgSlug) {
        // Redirect legacy route to proper org-scoped route
        // /dashboard -> /acme-corp/dashboard
        // /forms -> /acme-corp/forms
        const legacySegment = to.params.org as string
        const remainingPath = to.path.replace(`/${legacySegment}`, '')
        const newPath = `/${orgSlug}/${legacySegment}${remainingPath}`
        return next(newPath)
      }
      // Not authenticated, redirect to homepage
      return next('/')
    }

    // Allow public routes without authentication
    if (to.meta.public) {
      return next()
    }

    // Protect routes that require authentication
    // Redirect to homepage (landing page) if not authenticated
    if (to.meta.requiresAuth && !hasUser) {
      return next('/')
    }

    // Prevent authenticated users from accessing guest-only pages (login, signup)
    if (to.meta.guestOnly && hasUser) {
      // Redirect to org dashboard if we have an org slug
      if (orgSlug) {
        return next(`/${orgSlug}/dashboard`)
      }
      // Fallback to root which will handle redirect once org loads
      return next('/')
    }

    // For org-scoped routes, validate org slug matches current context
    // This prevents users from accessing other orgs via URL manipulation
    if (to.params.org && hasUser && orgSlug) {
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
