<script setup lang="ts">
import { computed } from 'vue';
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  type DialogContentEmits,
  type DialogContentProps,
} from 'reka-ui';
import { X } from 'lucide-vue-next';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right:
          'inset-y-0 right-0 h-full w-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        xl: '',
        wide: '',
        full: '',
      },
    },
    compoundVariants: [
      // Right side sizes
      { side: 'right', size: 'sm', class: 'sm:max-w-sm' },
      { side: 'right', size: 'default', class: 'sm:max-w-md' },
      { side: 'right', size: 'lg', class: 'sm:max-w-lg' },
      { side: 'right', size: 'xl', class: 'sm:max-w-xl' },
      { side: 'right', size: 'wide', class: 'sm:w-3/5 sm:max-w-none' },
      { side: 'right', size: 'full', class: 'w-full sm:max-w-none' },
      // Left side sizes
      { side: 'left', size: 'sm', class: 'sm:max-w-sm' },
      { side: 'left', size: 'default', class: 'sm:max-w-md' },
      { side: 'left', size: 'lg', class: 'sm:max-w-lg' },
      { side: 'left', size: 'xl', class: 'sm:max-w-xl' },
      { side: 'left', size: 'wide', class: 'sm:w-3/5 sm:max-w-none' },
      { side: 'left', size: 'full', class: 'w-full sm:max-w-none' },
    ],
    defaultVariants: {
      side: 'right',
      size: 'default',
    },
  }
);

type SheetVariants = VariantProps<typeof sheetVariants>;

interface SheetContentProps extends DialogContentProps {
  side?: SheetVariants['side'];
  size?: SheetVariants['size'];
  class?: string;
}

const props = withDefaults(defineProps<SheetContentProps>(), {
  side: 'right',
  size: 'default',
});

const emit = defineEmits<DialogContentEmits>();

const delegatedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { class: _, side: __, size: ___, ...rest } = props;
  return rest;
});
</script>

<template>
  <DialogPortal>
    <DialogOverlay
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <DialogContent
      :class="cn(sheetVariants({ side, size }), props.class)"
      v-bind="delegatedProps"
      @close-auto-focus="emit('closeAutoFocus', $event)"
      @escape-key-down="emit('escapeKeyDown', $event)"
      @focus-outside="emit('focusOutside', $event)"
      @interact-outside="emit('interactOutside', $event)"
      @open-auto-focus="emit('openAutoFocus', $event)"
      @pointer-down-outside="emit('pointerDownOutside', $event)"
    >
      <slot />

      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
