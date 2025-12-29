<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@ui/lib/utils'

const cardVariants = cva(
  'rounded-xl text-card-foreground',
  {
    variants: {
      variant: {
        default: 'border bg-card shadow',
        glass: 'backdrop-blur-md bg-white/10 border border-white/20 shadow-xl',
        'glass-dark': 'backdrop-blur-md bg-black/20 border border-white/20 shadow-xl',
        'glass-teal': 'backdrop-blur-md bg-teal-500/10 border border-teal-500/20 shadow-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type CardVariants = VariantProps<typeof cardVariants>

const props = defineProps<{
  class?: HTMLAttributes["class"]
  variant?: CardVariants['variant']
}>()
</script>

<template>
  <div
    :class="cn(cardVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
