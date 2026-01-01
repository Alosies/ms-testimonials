<script setup lang="ts">
import { DialogRoot } from 'reka-ui';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
  }>(),
  {
    open: undefined,
    defaultOpen: false,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();
</script>

<template>
  <DialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </DialogRoot>
</template>
