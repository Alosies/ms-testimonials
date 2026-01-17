/**
 * Timeline Editor Composables
 *
 * ARCHITECTURE:
 * - useTimelineEditor: Step state management (CRUD, selection)
 * - useStepSave: Persistence for question data
 * - useSaveFormSteps: Persistence for steps and branching config
 * - useFlowNavigation: Single source of truth for flow navigation structure
 * - useBranchedKeyboardNavigation: Keyboard navigation using flow navigation
 *
 * NOTE: Auto-save will be refactored per ADR-010 (Centralized Auto-Save Controller).
 *
 * For scroll-snap navigation (keyboard nav, scroll detection),
 * use useScrollSnapNavigation from @/shared/composables instead.
 * This is set up at the component level in FormStudioPage.vue.
 *
 * @see @/shared/composables/useScrollSnapNavigation
 * @see FormStudioPage.vue
 * @see docs/adr/010-centralized-auto-save/adr.md
 */
export { useTimelineEditor, type TimelineEditorContext } from './useTimelineEditor';
export { useStepSave } from './useStepSave';
export { useSaveFormSteps } from './useSaveFormSteps';
export { useFlowNavigation } from './useFlowNavigation';
export { useBranchedKeyboardNavigation } from './useBranchedKeyboardNavigation';
export { useFormStudioData } from './useFormStudioData';

// ADR-014 Phase 3: Focused composables (ISP compliance)
export { useTimelineReader, type TimelineReader } from './useTimelineReader';
export { useTimelineMutator, type TimelineMutator } from './useTimelineMutator';
export { useTimelineControl, type TimelineControl } from './useTimelineControl';

// ADR-014 Phase 5: Split timeline editor (SRP compliance)
export { useTimelineState, type TimelineState } from './useTimelineState';
export { useTimelineSelection, type TimelineSelection } from './useTimelineSelection';
export { useTimelineStepOps, type TimelineStepOps, type StepAddOptions } from './useTimelineStepOps';
export { useTimelineStepOpsLocal, type TimelineStepOpsLocal } from './useTimelineStepOpsLocal';
export { useTimelineStepOpsPersist, type TimelineStepOpsPersist } from './useTimelineStepOpsPersist';
export { useTimelinePersistence, type TimelinePersistence } from './useTimelinePersistence';
export { useTimelineComputed, type TimelineComputed } from './useTimelineComputed';
