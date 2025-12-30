import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollAnimation(threshold = 0.1) {
  const elementRef: Ref<HTMLElement | null> = ref(null)
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            // Once visible, stop observing (animate only once)
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    elementRef,
    isVisible,
  }
}
