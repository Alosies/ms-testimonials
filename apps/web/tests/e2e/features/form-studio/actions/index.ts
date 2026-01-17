/**
 * Form Studio Actions
 *
 * Modular, reusable action helpers for Form Studio tests.
 * Used by both journey tests and focused tests for DRY code.
 *
 * ## Structure
 * - setup.actions.ts      - Load studio, initialize
 * - selection.actions.ts  - Select step by ID/index
 * - navigation.actions.ts - Keyboard up/down navigation
 * - branching.actions.ts  - Branch switching (left/right)
 * - management.actions.ts - Add/delete steps
 *
 * ## Usage
 * ```ts
 * const actions = createStudioActions(studio);
 *
 * await actions.setup.loadWithSteps(formData);
 * await actions.select.selectStep(stepId);
 * await actions.nav.navigateDown();
 * await actions.branch.switchToImprovement();
 * await actions.manage.addStep('Question');
 * ```
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import { createSetupActions } from './setup.actions';
import { createSelectionActions } from './selection.actions';
import { createNavigationActions } from './navigation.actions';
import { createBranchingActions } from './branching.actions';
import { createManagementActions } from './management.actions';

export function createStudioActions(studio: StudioPage) {
  return {
    /** Studio setup and loading actions */
    setup: createSetupActions(studio),

    /** Step selection actions */
    select: createSelectionActions(studio),

    /** Keyboard navigation (up/down) */
    nav: createNavigationActions(studio),

    /** Branch navigation (left/right) */
    branch: createBranchingActions(studio),

    /** Step management (add/delete) */
    manage: createManagementActions(studio),
  };
}

export type StudioActions = ReturnType<typeof createStudioActions>;

// Re-export individual action creators for granular imports
export { createSetupActions } from './setup.actions';
export { createSelectionActions } from './selection.actions';
export { createNavigationActions } from './navigation.actions';
export { createBranchingActions } from './branching.actions';
export { createManagementActions } from './management.actions';
