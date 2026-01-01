<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui';
import { cn } from '../../lib/utils';

defineProps<DialogDescriptionProps & { class?: string }>();
</script>

<template>
  <DialogDescription :class="cn('text-sm text-gray-500', $props.class)">
    <slot />
  </DialogDescription>
</template>
