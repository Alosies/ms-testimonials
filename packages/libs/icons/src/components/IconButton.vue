<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import type { IconButtonProps } from './types'

const props = withDefaults(defineProps<IconButtonProps>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 16
    case 'lg':
      return 24
    default:
      return 20
  }
})

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  }

  const variants = {
    primary:
      'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-300',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50 disabled:text-gray-400',
    ghost:
      'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 disabled:text-gray-300',
    outline:
      'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200 disabled:text-gray-400',
  }

  return [base, sizes[props.size], variants[props.variant], props.disabled && 'cursor-not-allowed']
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    type="button"
    :class="buttonClasses"
    :disabled="disabled"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <Icon :icon="icon" :width="iconSize" :height="iconSize" />
    <span v-if="ariaLabel" class="sr-only">{{ ariaLabel }}</span>
  </button>
</template>
