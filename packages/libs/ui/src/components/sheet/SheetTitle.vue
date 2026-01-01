<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'reka-ui';
import { cn } from '../../lib/utils';

defineProps<DialogTitleProps & { class?: string }>();
</script>

<template>
  <DialogTitle :class="cn('text-lg font-semibold text-gray-950', $props.class)">
    <slot />
  </DialogTitle>
</template>
