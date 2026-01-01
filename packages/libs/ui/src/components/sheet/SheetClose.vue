<script setup lang="ts">
import { DialogClose } from 'reka-ui';

defineProps<{
  asChild?: boolean;
}>();
</script>

<template>
  <DialogClose :as-child="asChild">
    <slot />
  </DialogClose>
</template>
