import { ref, watch } from 'vue';
import type { PersistedFormState, UseFormPersistenceOptions } from '../models';

/**
 * LocalStorage key prefix for form persistence
 */
const STORAGE_KEY_PREFIX = 'testimonials_form_';

/**
 * Session ID storage key
 */
const SESSION_KEY_PREFIX = 'testimonials_session_';

/**
 * Maximum age for persisted data (7 days in milliseconds)
 */
const MAX_PERSIST_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Debounce delay for saving state (500ms)
 */
const SAVE_DEBOUNCE_MS = 500;

/**
 * Generate a UUID v4 for session tracking
 */
function generateUUID(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Composable for persisting form state in localStorage
 *
 * Provides:
 * - Session ID generation and retrieval
 * - Auto-save form progress (debounced)
 * - State restoration on form mount
 * - State cleanup on submission
 */
export function useFormPersistence(options: UseFormPersistenceOptions) {
  const { formId, answers, currentStepIndex, determinedFlow } = options;

  const sessionId = ref<string>('');
  const hasPersistedData = ref(false);
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Get storage key for form data
   */
  function getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${formId.value}`;
  }

  /**
   * Get storage key for session ID
   */
  function getSessionKey(): string {
    return `${SESSION_KEY_PREFIX}${formId.value}`;
  }

  /**
   * Initialize or retrieve session ID
   */
  function initSessionId(): string {
    const sessionKey = getSessionKey();
    try {
      const existingSession = localStorage.getItem(sessionKey);
      if (existingSession) {
        sessionId.value = existingSession;
        return existingSession;
      }
    } catch (e) {
      console.warn('Failed to read session from localStorage:', e);
    }

    // Generate new session ID
    const newSessionId = generateUUID();
    sessionId.value = newSessionId;

    try {
      localStorage.setItem(sessionKey, newSessionId);
    } catch (e) {
      console.warn('Failed to save session to localStorage:', e);
    }

    return newSessionId;
  }

  /**
   * Save form state to localStorage (debounced)
   */
  function saveState() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      try {
        const state: PersistedFormState = {
          formId: formId.value,
          answers: answers.value,
          currentStepIndex: currentStepIndex.value,
          determinedFlow: determinedFlow.value,
          sessionId: sessionId.value,
          savedAt: Date.now(),
        };
        localStorage.setItem(getStorageKey(), JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to save form state to localStorage:', e);
      }
    }, SAVE_DEBOUNCE_MS);
  }

  /**
   * Load persisted state if it exists and is not too old
   */
  function loadState(): PersistedFormState | null {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (!stored) return null;

      const state: PersistedFormState = JSON.parse(stored);

      // Validate form ID matches
      if (state.formId !== formId.value) return null;

      // Check if data is too old
      if (Date.now() - state.savedAt > MAX_PERSIST_AGE_MS) {
        clearState();
        return null;
      }

      return state;
    } catch (e) {
      console.warn('Failed to load form state from localStorage:', e);
      return null;
    }
  }

  /**
   * Restore form state from localStorage
   * Returns true if state was restored, false otherwise
   */
  function restoreState(): boolean {
    const state = loadState();
    if (!state) return false;

    // Check if there's meaningful progress to restore
    const hasAnswers = Object.keys(state.answers).length > 0;
    const hasProgress = state.currentStepIndex > 0;

    if (!hasAnswers && !hasProgress) return false;

    // Restore state to refs
    Object.assign(answers.value, state.answers);
    currentStepIndex.value = state.currentStepIndex;
    determinedFlow.value = state.determinedFlow;
    sessionId.value = state.sessionId;

    return true;
  }

  /**
   * Clear persisted state (called on successful submission)
   */
  function clearState() {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    try {
      localStorage.removeItem(getStorageKey());
      localStorage.removeItem(getSessionKey());
    } catch (e) {
      console.warn('Failed to clear form state from localStorage:', e);
    }

    hasPersistedData.value = false;
  }

  /**
   * Check if persisted data exists
   */
  function checkForPersistedData() {
    const state = loadState();
    if (state) {
      const hasAnswers = Object.keys(state.answers).length > 0;
      const hasProgress = state.currentStepIndex > 0;
      hasPersistedData.value = hasAnswers || hasProgress;
    } else {
      hasPersistedData.value = false;
    }
  }

  /**
   * Set up auto-save watchers
   */
  function setupAutoSave() {
    // Watch for changes and auto-save
    watch(
      [answers, currentStepIndex, determinedFlow],
      () => {
        saveState();
      },
      { deep: true }
    );
  }

  /**
   * Initialize persistence
   */
  function init() {
    initSessionId();
    checkForPersistedData();
  }

  return {
    sessionId,
    hasPersistedData,
    init,
    restoreState,
    clearState,
    setupAutoSave,
  };
}
