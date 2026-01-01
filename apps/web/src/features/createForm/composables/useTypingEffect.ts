import { ref, onUnmounted } from 'vue';

export interface TypingStage {
  icon: string;
  text: string;
  detail: (context: string) => string;
}

/**
 * Composable for staged text animation
 * - Main text fades in instantly
 * - Detail text uses typing effect
 */
export function useTypingEffect(stages: TypingStage[], context: string) {
  const currentStageIndex = ref(0);
  const displayedText = ref('');
  const displayedDetail = ref('');
  const isTypingDetail = ref(false);
  const showMain = ref(false);
  const showDetail = ref(false);

  let typeInterval: ReturnType<typeof setInterval> | null = null;

  function typeDetailText(text: string, callback?: () => void) {
    let index = 0;
    const speed = 20; // Fast typing for detail

    typeInterval = setInterval(() => {
      if (index < text.length) {
        displayedDetail.value = text.slice(0, index + 1);
        index++;
      } else {
        if (typeInterval) clearInterval(typeInterval);
        isTypingDetail.value = false;
        callback?.();
      }
    }, speed);
  }

  function advanceStage() {
    showMain.value = false;
    showDetail.value = false;
    displayedDetail.value = '';
    isTypingDetail.value = false;

    const stage = stages[currentStageIndex.value];

    // Fade in main text instantly
    setTimeout(() => {
      displayedText.value = stage.text;
      showMain.value = true;

      // Start typing detail after main fades in
      setTimeout(() => {
        showDetail.value = true;
        isTypingDetail.value = true;
        typeDetailText(stage.detail(context), () => {
          // Pause then advance to next stage
          setTimeout(() => {
            if (currentStageIndex.value < stages.length - 1) {
              currentStageIndex.value++;
              advanceStage();
            }
          }, 600);
        });
      }, 300);
    }, 50);
  }

  function start() {
    advanceStage();
  }

  function cleanup() {
    if (typeInterval) clearInterval(typeInterval);
  }

  onUnmounted(cleanup);

  return {
    currentStageIndex,
    displayedText,
    displayedDetail,
    showMain,
    showDetail,
    isTypingDetail,
    stages,
    start,
    cleanup,
  };
}
