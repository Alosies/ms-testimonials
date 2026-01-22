/**
 * Auth Step Constants
 *
 * Each step name indicates the domain/service we're in:
 *   - SUPABASE_* = Supabase auth service
 *   - API_*      = Our backend API (/auth/enhance-token)
 *   - AUTH_*     = Auth system overall state
 *
 * Flow diagram:
 *   0 → 1 → 2 → 3 (init)
 *       ↑       ↓
 *       2 ← 4 ← 3 (login: Supabase fires SIGNED_IN, then we enhance token)
 *               ↓
 *           5 → 3 (logout)
 */

export const AUTH_STEPS = {
  UNINITIALIZED: '0_UNINITIALIZED',
  SUPABASE_CHECKING_SESSION: '1_SUPABASE_CHECKING_SESSION',
  API_ENHANCING_TOKEN: '2_API_ENHANCING_TOKEN',
  AUTH_COMPLETED_AND_IDLE: '3_AUTH_COMPLETED_AND_IDLE',
  SUPABASE_SIGNING_IN: '4_SUPABASE_SIGNING_IN',
  SUPABASE_LOGGING_OUT: '5_SUPABASE_LOGGING_OUT',
} as const;

export type AuthStep = (typeof AUTH_STEPS)[keyof typeof AUTH_STEPS];

/**
 * Step groups for computed checks (type-safe)
 */
export const AUTH_STEP_GROUPS = {
  /** Steps where auth is actively loading (show loading UI) */
  LOADING: [
    AUTH_STEPS.SUPABASE_CHECKING_SESSION,
    AUTH_STEPS.API_ENHANCING_TOKEN,
    AUTH_STEPS.SUPABASE_SIGNING_IN,
  ] as const,

  /** Steps during initial auth check (before first ready state) */
  INITIALIZING: [
    AUTH_STEPS.SUPABASE_CHECKING_SESSION,
    AUTH_STEPS.API_ENHANCING_TOKEN,
  ] as const,
};

