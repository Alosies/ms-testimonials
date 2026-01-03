<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { KbdVariants } from "."
import { cn } from '@ui/lib/utils'
import { kbdVariants } from "."

const props = defineProps<{
  size?: KbdVariants["size"]
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <kbd :class="cn(kbdVariants({ size }), props.class)">
    <slot />
  </kbd>
</template>
