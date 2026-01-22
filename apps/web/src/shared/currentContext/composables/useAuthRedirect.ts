import { watch, toRefs, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrentContextStore } from '../store';
import { useAuth } from '@/features/auth';

/**
 * Composable to redirect authenticated users to their dashboard
 *
 * Use this in pages that should redirect authenticated users away,
 * like the landing page (index route).
 *
 * @returns Object with isRedirecting computed ref to show loading while redirecting
 */
export function useAuthRedirect() {
  const router = useRouter();
  const contextStore = useCurrentContextStore();
  const { isAuthenticated, isInitialized } = useAuth();

  // Use toRefs to get proper reactive refs from Pinia store
  // This ensures Vue's reactivity system properly tracks the computed property
  const { currentOrganizationSlug } = toRefs(contextStore);

  // Track if redirect has been initiated to prevent multiple navigations
  let redirectInitiated = false;

  // Watch for auth state and redirect when authenticated
  // Use array of refs for proper reactivity tracking
  watch(
    [isInitialized, isAuthenticated, currentOrganizationSlug],
    ([initialized, authenticated, slug]) => {
      // Only redirect after auth is initialized
      if (!initialized) {
        return;
      }

      // Redirect authenticated users to their dashboard (only once)
      if (authenticated && slug && !redirectInitiated) {
        redirectInitiated = true;
        router.replace(`/${slug}/dashboard`).catch((err) => {
          console.error('[useAuthRedirect] router.replace() failed:', err);
        });
      }
    },
    { immediate: true }
  );

  return {
    // Show loading state while we're authenticated but waiting for org slug
    // Return computed for proper reactivity in templates
    isRedirecting: computed(() => isAuthenticated.value && isInitialized.value),
  };
}
