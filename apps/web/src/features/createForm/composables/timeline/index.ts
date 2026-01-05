/**
 * Timeline Editor Composables
 *
 * ARCHITECTURE:
 * - useTimelineEditor: Step state management (CRUD, selection)
 * - useStepSave: Persistence for question data
 * - useSaveFormSteps: Persistence for steps and branching config
 *
 * For scroll-snap navigation (keyboard nav, scroll detection),
 * use useScrollSnapNavigation from @/shared/composables instead.
 * This is set up at the component level in FormStudioPage.vue.
 *
 * @see @/shared/composables/useScrollSnapNavigation
 * @see FormStudioPage.vue
 */
export { useTimelineEditor, type TimelineEditorContext } from './useTimelineEditor';
export { useStepSave } from './useStepSave';
export { useSaveFormSteps } from './useSaveFormSteps';
