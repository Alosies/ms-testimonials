/**
 * Credits Actions
 *
 * Composes all credit-related action helpers.
 */
import type { CreditsPage } from '@e2e/shared/pages/credits.page';
import { createNavigationActions } from './navigation.actions';
import { createVerificationActions } from './verification.actions';

export function createCreditsActions(credits: CreditsPage, orgSlug: string) {
  return {
    nav: createNavigationActions(credits, orgSlug),
    verify: createVerificationActions(credits),
  };
}

export { createNavigationActions } from './navigation.actions';
export { createVerificationActions } from './verification.actions';
