/**
 * Router guards for authentication
 */
import type { Router } from 'vue-router';
import { useAuth } from '@/features/auth';

export function setupAuthGuards(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    // Access auth composable inside guard callback (lazy access pattern)
    // This ensures Pinia and other plugins are installed
    const { isAuthenticated, isLoading, isInitialized } = useAuth();

    // Wait for auth to initialize before making decisions
    if (!isInitialized.value) {
      // Allow navigation to complete, auth will be checked on next navigation
      // The App.vue will initialize auth on mount
      return next();
    }

    // Wait for loading to complete
    if (isLoading.value) {
      return next();
    }

    const isAuth = isAuthenticated.value;

    // Protect routes that require authentication
    if (to.meta.requiresAuth && !isAuth) {
      return next('/auth/login');
    }

    // Prevent authenticated users from accessing guest-only pages (login, signup)
    if (to.meta.guestOnly && isAuth) {
      return next('/dashboard');
    }

    // Redirect authenticated users from root to dashboard
    if (to.path === '/' && isAuth) {
      return next('/dashboard');
    }

    next();
  });
}
