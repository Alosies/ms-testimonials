import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrentContextStore } from '../store';
import { useAuth } from '@/features/auth';

/**
 * Composable to redirect authenticated users to their dashboard
 *
 * Use this in pages that should redirect authenticated users away,
 * like the landing page (index route).
 *
 * @returns Object with isRedirecting state to show loading while redirecting
 */
export function useAuthRedirect() {
  const router = useRouter();
  const contextStore = useCurrentContextStore();
  const { isAuthenticated, isInitialized } = useAuth();

  // Watch for auth state and redirect when authenticated
  watch(
    [isInitialized, isAuthenticated, () => contextStore.currentOrganizationSlug],
    ([initialized, authenticated, orgSlug]) => {
      // Only redirect after auth is initialized
      if (!initialized) return;

      // Redirect authenticated users to their dashboard
      if (authenticated && orgSlug) {
        router.replace(`/${orgSlug}/dashboard`);
      }
    },
    { immediate: true }
  );

  return {
    // Show loading state while we're authenticated but waiting for org slug
    isRedirecting: () => isAuthenticated.value && isInitialized.value,
  };
}
