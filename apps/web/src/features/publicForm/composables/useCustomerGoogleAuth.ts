/**
 * Customer Google Auth Composable
 *
 * Lightweight Google OAuth authentication for customers using the AI testimonial path.
 * This is NOT full account creation - just verification for abuse prevention.
 *
 * @see PRD-005: AI Testimonial Generation
 */
import { ref, onMounted } from 'vue';

/**
 * Google user info returned after successful authentication
 */
export interface CustomerGoogleInfo {
  google_id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Result type for Google authentication
 */
export type GoogleAuthResult =
  | { success: true; user: CustomerGoogleInfo }
  | { success: false; error: string };

// Google Sign-In SDK types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          prompt: (callback?: (notification: PromptNotification) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonOptions
          ) => void;
          cancel: () => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface PromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

interface GoogleButtonOptions {
  type: 'standard' | 'icon';
  theme: 'outline' | 'filled_blue' | 'filled_black';
  size: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string;
}

/**
 * Decode a JWT token (client-side, without verification)
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Storage key for customer Google session
 */
const STORAGE_KEY = 'testimonials_customer_google';

/**
 * Session duration (24 hours in milliseconds)
 */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Customer Google Auth Composable
 *
 * Provides lightweight Google authentication for customers
 * accessing the AI testimonial generation feature.
 */
export function useCustomerGoogleAuth() {
  const isLoading = ref(false);
  const isAuthenticated = ref(false);
  const customerInfo = ref<CustomerGoogleInfo | null>(null);
  const credential = ref<string | null>(null);
  const error = ref<string | null>(null);

  /**
   * Get stored session from sessionStorage
   */
  function getStoredSession(): { user: CustomerGoogleInfo; credential: string | null } | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (!parsed.user || !parsed.expiresAt) return null;

      // Check if session is expired
      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return {
        user: parsed.user as CustomerGoogleInfo,
        credential: (parsed.credential as string) ?? null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Store session in sessionStorage
   */
  function storeSession(user: CustomerGoogleInfo, rawCredential: string): void {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user,
          credential: rawCredential,
          expiresAt: Date.now() + SESSION_DURATION_MS,
        })
      );
    } catch {
      console.warn('Failed to store customer Google session');
    }
  }

  /**
   * Clear stored session
   */
  function clearSession(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Load Google Sign-In SDK script
   */
  function loadGoogleSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () =>
          reject(new Error('Failed to load Google Sign-In SDK'))
        );
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error('Failed to load Google Sign-In SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google Sign-In
   */
  async function initializeGoogleAuth(): Promise<void> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Google Client ID not configured');
      return;
    }

    try {
      await loadGoogleSdk();

      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (err) {
      console.error('Failed to initialize Google Sign-In:', err);
    }
  }

  /**
   * Handle the credential response from Google
   */
  function handleCredentialResponse(response: GoogleCredentialResponse): void {
    const payload = decodeJwtPayload(response.credential);
    if (!payload) {
      error.value = 'Invalid Google response';
      isLoading.value = false;
      return;
    }

    const user: CustomerGoogleInfo = {
      google_id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string | undefined,
    };

    customerInfo.value = user;
    credential.value = response.credential;
    isAuthenticated.value = true;
    error.value = null;
    isLoading.value = false;

    // Store in session
    storeSession(user, response.credential);
  }

  /**
   * Prompt user to sign in with Google
   */
  async function signInWithGoogle(): Promise<GoogleAuthResult> {
    isLoading.value = true;
    error.value = null;

    try {
      // Check for stored session first (must have credential for server-side verification)
      const stored = getStoredSession();
      if (stored && stored.credential) {
        customerInfo.value = stored.user;
        credential.value = stored.credential;
        isAuthenticated.value = true;
        isLoading.value = false;
        return { success: true, user: stored.user };
      }

      // Initialize if needed
      await initializeGoogleAuth();

      return new Promise((resolve) => {
        // Show the Google Sign-In prompt
        window.google?.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            isLoading.value = false;
            const reason = notification.getNotDisplayedReason();
            error.value = `Google Sign-In not available: ${reason}`;
            resolve({ success: false, error: error.value });
          } else if (notification.isSkippedMoment()) {
            isLoading.value = false;
            error.value = 'Sign-in was cancelled';
            resolve({ success: false, error: error.value });
          }
          // If successful, handleCredentialResponse will be called
        });

        // Set up a check for when auth completes
        const checkInterval = setInterval(() => {
          if (isAuthenticated.value && customerInfo.value) {
            clearInterval(checkInterval);
            resolve({ success: true, user: customerInfo.value });
          }
          if (!isLoading.value && error.value) {
            clearInterval(checkInterval);
            resolve({ success: false, error: error.value });
          }
        }, 100);

        // Timeout after 60 seconds
        setTimeout(() => {
          if (isLoading.value) {
            clearInterval(checkInterval);
            isLoading.value = false;
            error.value = 'Sign-in timed out';
            resolve({ success: false, error: error.value });
          }
        }, 60000);
      });
    } catch (err) {
      isLoading.value = false;
      error.value = err instanceof Error ? err.message : 'Sign-in failed';
      return { success: false, error: error.value };
    }
  }

  /**
   * Sign out and clear session
   */
  function signOut(): void {
    // Store google_id before clearing
    const googleId = customerInfo.value?.google_id;

    customerInfo.value = null;
    credential.value = null;
    isAuthenticated.value = false;
    clearSession();

    // Revoke if we had a google_id
    if (googleId) {
      window.google?.accounts.id.revoke(googleId, () => {
        // Revoked
      });
    }
  }

  // Check for existing session on mount
  onMounted(() => {
    const stored = getStoredSession();
    if (stored) {
      customerInfo.value = stored.user;
      credential.value = stored.credential;
      isAuthenticated.value = true;
    }
  });

  return {
    isLoading,
    isAuthenticated,
    customerInfo,
    credential,
    error,
    signInWithGoogle,
    signOut,
  };
}
