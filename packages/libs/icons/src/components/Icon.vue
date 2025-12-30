<script setup lang="ts">
import { computed } from 'vue'
import { Icon as IconifyIcon } from '@iconify/vue'
import type { IconProps } from './types'

const props = withDefaults(defineProps<IconProps>(), {
  width: 24,
  height: 24,
  hFlip: false,
  vFlip: false,
  rotate: 0,
  inline: false,
})

const flip = computed(() => {
  if (props.hFlip && props.vFlip) return 'horizontal,vertical'
  if (props.hFlip) return 'horizontal'
  if (props.vFlip) return 'vertical'
  return undefined
})
</script>

<template>
  <IconifyIcon
    :icon="icon"
    :color="color"
    :width="width"
    :height="height"
    :flip="flip"
    :rotate="rotate"
    :inline="inline"
  />
</template>
