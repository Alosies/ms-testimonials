/**
 * Router guards for authentication and organization routing
 *
 * Following CoursePads pattern:
 * - Uses module-level promise for auth readiness (no Vue watch in guards)
 * - Uses currentUser from useAuth directly for auth checks (avoids race conditions)
 * - Uses context store only for org slug (loaded asynchronously)
 * - Saves redirect URL for post-login navigation
 */
import type { Router } from 'vue-router'
import { useAuth, getAuthReadyPromise } from '@/features/auth'
import { useCurrentContextStore, getContextReadyPromise } from '@/shared/currentContext'

/**
 * Storage key for saving the redirect URL after authentication
 */
const REDIRECT_URL_KEY = 'auth_redirect_url'

/**
 * Save the intended destination URL for post-login redirect
 */
export function saveRedirectUrl(url: string): void {
  sessionStorage.setItem(REDIRECT_URL_KEY, url)
}

/**
 * Get and clear the saved redirect URL
 */
export function getAndClearRedirectUrl(): string | null {
  const url = sessionStorage.getItem(REDIRECT_URL_KEY)
  if (url) {
    sessionStorage.removeItem(REDIRECT_URL_KEY)
  }
  return url
}

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
    const { isInitialized, currentUser } = useAuth()
    const contextStore = useCurrentContextStore()

    // For routes that require auth or are guest-only, wait for auth to initialize
    // Uses module-level promise pattern (no Vue watch in guards)
    if (to.meta.requiresAuth || to.meta.guestOnly) {
      await getAuthReadyPromise()
      // Also wait for full context (including org) to be ready
      // This ensures we have org slug before making redirect decisions
      await getContextReadyPromise()
    }

    // If still not initialized (public routes), let them through
    if (!isInitialized.value) {
      return next()
    }

    // Check if user is authenticated using useAuth directly
    // This avoids race conditions - currentUser is set when authReadyPromise resolves,
    // but contextStore.currentUserId is set by a Vue watcher which runs asynchronously
    const hasUser = !!currentUser.value
    // Org slug from context store (may not be loaded yet for direct URL navigation)
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
    // Skip for logout page - user is intentionally signing out
    if (from.path.startsWith('/auth/') && !from.path.includes('/logout') && hasUser) {
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
    // Redirect to login page if not authenticated, saving the intended destination
    if (to.meta.requiresAuth && !hasUser) {
      // Save the intended destination for post-login redirect
      saveRedirectUrl(to.fullPath)
      return next('/auth/login')
    }

    // Prevent authenticated users from accessing guest-only pages (login, signup)
    if (to.meta.guestOnly && hasUser) {
      // Check for saved redirect URL (e.g., user was redirected to login from a protected page)
      const savedRedirectUrl = getAndClearRedirectUrl()
      if (savedRedirectUrl) {
        return next(savedRedirectUrl)
      }
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
