import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useTimelineEditor } from './useTimelineEditor';

/**
 * Scroll-based step detection for timeline editor.
 *
 * Detects which step is closest to the viewport center and updates selection.
 * Uses throttled scroll events to avoid excessive updates.
 */
export function useScrollStepDetection() {
  const editor = useTimelineEditor();
  const timelineRef = ref<HTMLElement | null>(null);
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  function findCenteredStep() {
    // Don't override selection during programmatic scroll
    if (editor.isProgrammaticScroll.value) return;
    if (!timelineRef.value) return;

    const container = timelineRef.value;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    const stepElements = container.querySelectorAll('[data-step-index]');
    let closestIndex = -1;
    let closestDistance = Infinity;

    stepElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        const indexAttr = el.getAttribute('data-step-index');
        if (indexAttr !== null) {
          closestIndex = parseInt(indexAttr, 10);
        }
      }
    });

    if (closestIndex !== -1 && closestIndex !== editor.selectedIndex.value) {
      editor.selectStep(closestIndex);
    }
  }

  function handleScroll() {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      findCenteredStep();
    }, 50);
  }

  function setupScrollObserver() {
    if (!timelineRef.value) return;

    timelineRef.value.removeEventListener('scroll', handleScroll);
    timelineRef.value.addEventListener('scroll', handleScroll, { passive: true });
  }

  function initialize() {
    timelineRef.value = document.querySelector('.timeline-scroll');
    setupScrollObserver();
  }

  function cleanup() {
    if (timelineRef.value) {
      timelineRef.value.removeEventListener('scroll', handleScroll);
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  }

  // Re-setup observer when steps change
  watch(
    () => editor.steps.value.length,
    () => {
      nextTick(() => setupScrollObserver());
    }
  );

  onMounted(() => {
    nextTick(() => initialize());
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    timelineRef,
    initialize,
    cleanup,
  };
}
