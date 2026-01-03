<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

interface Props {
  tips: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', tips: string[]): void;
}>();

const editingIndex = ref<number | null>(null);
const editingValue = ref('');
const newTipValue = ref('');

function startEdit(index: number) {
  editingIndex.value = index;
  editingValue.value = props.tips[index];
}

function saveEdit() {
  if (editingIndex.value !== null && editingValue.value.trim()) {
    const newTips = [...props.tips];
    newTips[editingIndex.value] = editingValue.value.trim();
    emit('update', newTips);
  }
  cancelEdit();
}

function cancelEdit() {
  editingIndex.value = null;
  editingValue.value = '';
}

function addTip() {
  if (newTipValue.value.trim()) {
    emit('update', [...props.tips, newTipValue.value.trim()]);
    newTipValue.value = '';
  }
}

function removeTip(index: number) {
  const newTips = props.tips.filter((_, i) => i !== index);
  emit('update', newTips);
}

function moveTip(index: number, direction: 'up' | 'down') {
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= props.tips.length) return;

  const newTips = [...props.tips];
  [newTips[index], newTips[newIndex]] = [newTips[newIndex], newTips[index]];
  emit('update', newTips);
}
</script>

<template>
  <div class="border-b pb-4">
    <h4 class="text-sm font-medium mb-2 flex items-center gap-2">
      <Icon icon="heroicons:light-bulb" class="w-4 h-4 text-amber-500" />
      Question Tips
    </h4>
    <p class="text-xs text-muted-foreground mb-3">
      Help customers leave better testimonials with example prompts.
    </p>

    <!-- Tips list -->
    <div class="space-y-2 mb-3">
      <div
        v-for="(tip, index) in tips"
        :key="index"
        class="group flex items-start gap-2 p-2 rounded-md bg-muted/50"
      >
        <!-- Editing mode -->
        <template v-if="editingIndex === index">
          <Input
            v-model="editingValue"
            class="flex-1 text-sm"
            @keyup.enter="saveEdit"
            @keyup.escape="cancelEdit"
          />
          <Button size="icon" variant="ghost" class="h-7 w-7" @click="saveEdit">
            <Icon icon="heroicons:check" class="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" class="h-7 w-7" @click="cancelEdit">
            <Icon icon="heroicons:x-mark" class="w-4 h-4" />
          </Button>
        </template>

        <!-- Display mode -->
        <template v-else>
          <span class="flex-1 text-sm">{{ tip }}</span>
          <div class="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              class="h-6 w-6"
              :disabled="index === 0"
              @click="moveTip(index, 'up')"
            >
              <Icon icon="heroicons:chevron-up" class="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              class="h-6 w-6"
              :disabled="index === tips.length - 1"
              @click="moveTip(index, 'down')"
            >
              <Icon icon="heroicons:chevron-down" class="w-3 h-3" />
            </Button>
            <Button size="icon" variant="ghost" class="h-6 w-6" @click="startEdit(index)">
              <Icon icon="heroicons:pencil" class="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              class="h-6 w-6 text-destructive"
              @click="removeTip(index)"
            >
              <Icon icon="heroicons:trash" class="w-3 h-3" />
            </Button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add new tip -->
    <div class="flex gap-2">
      <Input
        v-model="newTipValue"
        placeholder="Add a tip..."
        class="flex-1 text-sm"
        @keyup.enter="addTip"
      />
      <Button size="sm" variant="outline" @click="addTip">
        <Icon icon="heroicons:plus" class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
