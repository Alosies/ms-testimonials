import { computed, reactive, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';

interface DirtyState {
  formInfo: boolean;
  questions: Set<string>;
  options: Set<string>;
  steps: Set<string>;
  flows: Set<string>;
}

export const useDirtyTracker = createSharedComposable(() => {
  const dirty = reactive<DirtyState>({
    formInfo: false,
    questions: new Set<string>(),
    options: new Set<string>(),
    steps: new Set<string>(),
    flows: new Set<string>(),
  });

  const mark = {
    formInfo: () => { dirty.formInfo = true; },
    question: (id: string) => { dirty.questions.add(id); },
    option: (id: string) => { dirty.options.add(id); },
    step: (id: string) => { dirty.steps.add(id); },
    flow: (id: string) => { dirty.flows.add(id); },
  };

  const snapshot = () => {
    const captured = {
      formInfo: dirty.formInfo,
      questions: new Set(dirty.questions),
      options: new Set(dirty.options),
      steps: new Set(dirty.steps),
      flows: new Set(dirty.flows),
    };
    clear();
    return captured;
  };

  const restoreDirtyState = (captured: ReturnType<typeof snapshot>) => {
    if (captured.formInfo) dirty.formInfo = true;
    captured.questions.forEach(id => dirty.questions.add(id));
    captured.options.forEach(id => dirty.options.add(id));
    captured.steps.forEach(id => dirty.steps.add(id));
    captured.flows.forEach(id => dirty.flows.add(id));
  };

  const clear = () => {
    dirty.formInfo = false;
    dirty.questions.clear();
    dirty.options.clear();
    dirty.steps.clear();
    dirty.flows.clear();
  };

  const hasPendingChanges = computed(() =>
    dirty.formInfo ||
    dirty.questions.size > 0 ||
    dirty.options.size > 0 ||
    dirty.steps.size > 0 ||
    dirty.flows.size > 0
  );

  return { dirty: readonly(dirty), mark, snapshot, restoreDirtyState, hasPendingChanges };
});
