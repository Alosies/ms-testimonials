<script setup lang="ts">
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

defineProps<{
  minValue: number | null;
  maxValue: number | null;
  minLabel: string | null;
  maxLabel: string | null;
}>();

const emit = defineEmits<{
  'update:minValue': [value: number];
  'update:maxValue': [value: number];
  'update:minLabel': [value: string | null];
  'update:maxLabel': [value: string | null];
}>();
</script>

<template>
  <div>
    <Separator class="my-4" />

    <div class="space-y-4 rounded-lg border bg-gray-50 p-4">
      <div class="flex items-center gap-2">
        <Icon icon="lucide:sliders-horizontal" class="h-4 w-4 text-gray-500" />
        <Label class="text-sm font-medium">Scale Settings</Label>
      </div>

      <!-- Scale Range -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label class="text-xs text-gray-500">Start Value</Label>
          <Select
            :model-value="String(minValue ?? 1)"
            @update:model-value="(v) => emit('update:minValue', Number(v))"
          >
            <SelectTrigger class="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="text-xs text-gray-500">End Value</Label>
          <Select
            :model-value="String(maxValue ?? 10)"
            @update:model-value="(v) => emit('update:maxValue', Number(v))"
          >
            <SelectTrigger class="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Scale Labels -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label class="text-xs text-gray-500">Min Label</Label>
          <Input
            :model-value="minLabel ?? ''"
            class="mt-1"
            placeholder="Low"
            @update:model-value="(v) => emit('update:minLabel', String(v) || null)"
          />
        </div>
        <div>
          <Label class="text-xs text-gray-500">Max Label</Label>
          <Input
            :model-value="maxLabel ?? ''"
            class="mt-1"
            placeholder="High"
            @update:model-value="(v) => emit('update:maxLabel', String(v) || null)"
          />
        </div>
      </div>

      <p class="text-xs text-gray-500">
        Customize the scale range and endpoint labels
      </p>
    </div>
  </div>
</template>
