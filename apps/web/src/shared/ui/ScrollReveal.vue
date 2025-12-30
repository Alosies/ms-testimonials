<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'ScrollReveal',
})

const props = withDefaults(
  defineProps<{
    threshold?: number
    delay?: number
    direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  }>(),
  {
    threshold: 0.1,
    delay: 0,
    direction: 'up',
  }
)

const elementRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: props.threshold }
  )

  if (elementRef.value) {
    observer.observe(elementRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})

const directionClasses = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: 'translate-x-8',
  right: '-translate-x-8',
  none: '',
}
</script>

<template>
  <div
    ref="elementRef"
    :class="[
      'transition-all duration-700 ease-out',
      isVisible
        ? 'opacity-100 translate-x-0 translate-y-0'
        : `opacity-0 ${directionClasses[direction]}`
    ]"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>
