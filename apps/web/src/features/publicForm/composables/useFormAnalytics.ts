import { ref, onUnmounted } from 'vue';
import { getApiBaseUrl } from '@/shared/api/config/apiConfig';
import type {
  AnalyticsEventType,
  CurrentStepContext,
  UseFormAnalyticsOptions,
  TrackEventRequest,
} from '../models';

/**
 * Composable for tracking form analytics events
 *
 * Provides:
 * - Event tracking via fetch to /analytics/events
 * - Beacon API for reliable abandonment tracking on page close
 * - Current step context tracking for abandonment events
 */
export function useFormAnalytics(options: UseFormAnalyticsOptions) {
  const { formId, organizationId, sessionId } = options;

  const isSubmitted = ref(false);
  const currentStep = ref<CurrentStepContext | null>(null);
  let unloadHandlerAttached = false;

  /**
   * Get the analytics API endpoint
   */
  function getAnalyticsEndpoint(): string {
    return `${getApiBaseUrl()}/analytics/events`;
  }

  /**
   * Send analytics event via fetch
   */
  async function sendEvent(
    eventType: AnalyticsEventType,
    eventData?: Record<string, unknown>
  ): Promise<boolean> {
    // Skip if form IDs not ready
    if (!formId.value || !organizationId.value || !sessionId.value) {
      return false;
    }

    const request: TrackEventRequest = {
      formId: formId.value,
      organizationId: organizationId.value,
      sessionId: sessionId.value,
      eventType,
      stepIndex: currentStep.value?.index,
      stepId: currentStep.value?.id,
      stepType: currentStep.value?.type,
      eventData,
    };

    try {
      const response = await fetch(getAnalyticsEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return response.ok;
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
      return false;
    }
  }

  /**
   * Send analytics event via Beacon API (for page unload)
   * Beacon is more reliable than fetch during unload
   */
  function sendEventViaBeacon(
    eventType: AnalyticsEventType,
    eventData?: Record<string, unknown>
  ): boolean {
    // Skip if form IDs not ready
    if (!formId.value || !organizationId.value || !sessionId.value) {
      return false;
    }

    const request: TrackEventRequest = {
      formId: formId.value,
      organizationId: organizationId.value,
      sessionId: sessionId.value,
      eventType,
      stepIndex: currentStep.value?.index,
      stepId: currentStep.value?.id,
      stepType: currentStep.value?.type,
      eventData,
    };

    try {
      const blob = new Blob([JSON.stringify(request)], {
        type: 'application/json',
      });
      return navigator.sendBeacon(getAnalyticsEndpoint(), blob);
    } catch (error) {
      console.warn('Failed to send beacon analytics event:', error);
      return false;
    }
  }

  /**
   * Track form started event
   */
  async function trackFormStarted(): Promise<boolean> {
    return sendEvent('form_started');
  }

  /**
   * Track step completed event
   */
  async function trackStepCompleted(
    stepIndex: number,
    stepId: string,
    stepType: string,
    eventData?: Record<string, unknown>
  ): Promise<boolean> {
    // Temporarily set step context for this event
    const previousStep = currentStep.value;
    currentStep.value = { index: stepIndex, id: stepId, type: stepType };

    const result = await sendEvent('step_completed', eventData);

    // Restore previous step context (next step will update it)
    currentStep.value = previousStep;

    return result;
  }

  /**
   * Track form submitted event
   */
  async function trackFormSubmitted(): Promise<boolean> {
    return sendEvent('form_submitted');
  }

  /**
   * Track form resumed event
   */
  async function trackFormResumed(stepIndex: number): Promise<boolean> {
    return sendEvent('form_resumed', { resumedAtStep: stepIndex });
  }

  /**
   * Update current step context (for abandonment tracking)
   */
  function setCurrentStep(index: number, id: string, type: string) {
    currentStep.value = { index, id, type };
  }

  /**
   * Mark form as submitted (prevents abandonment event)
   */
  function markAsSubmitted() {
    isSubmitted.value = true;
  }

  /**
   * Handle page unload - send abandonment event if not submitted
   */
  function handleBeforeUnload() {
    // Don't send abandonment if form was successfully submitted
    if (isSubmitted.value) return;

    // Don't send if no step context (form not started properly)
    if (!currentStep.value) return;

    sendEventViaBeacon('form_abandoned');
  }

  /**
   * Setup beforeunload handler for abandonment tracking
   */
  function setupUnloadHandler() {
    if (unloadHandlerAttached) return;

    window.addEventListener('beforeunload', handleBeforeUnload);
    unloadHandlerAttached = true;
  }

  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    if (unloadHandlerAttached) {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unloadHandlerAttached = false;
    }
  });

  return {
    trackFormStarted,
    trackStepCompleted,
    trackFormSubmitted,
    trackFormResumed,
    setCurrentStep,
    markAsSubmitted,
    setupUnloadHandler,
  };
}
