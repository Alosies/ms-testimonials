<script setup lang="ts">
import { computed } from 'vue';
import { Input, Textarea, Label, Switch } from '@testimonials/ui';
import type { FormStep, ConsentContent } from '@/shared/stepCards';
import { isConsentStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: ConsentContent): void;
}>();

const content = computed((): ConsentContent => {
  if (isConsentStep(props.step)) {
    return props.step.content;
  }
  return {
    title: '',
    description: '',
    options: {
      public: { label: 'Public', description: '' },
      private: { label: 'Private', description: '' },
    },
    defaultOption: 'public',
    required: true,
  };
});

function update(updates: Partial<ConsentContent>) {
  emit('update', { ...content.value, ...updates });
}

function updateString(field: 'title' | 'description', value: string | number) {
  update({ [field]: String(value) });
}

function updateOption(type: 'public' | 'private', field: 'label' | 'description', value: string | number) {
  const newOptions = { ...content.value.options };
  newOptions[type] = { ...newOptions[type], [field]: String(value) };
  update({ options: newOptions });
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="How can we share your testimonial?"
        @update:model-value="updateString('title', $event)"
      />
    </div>

    <div>
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        :model-value="content.description"
        placeholder="Choose how you'd like your feedback to be used."
        :rows="2"
        @update:model-value="updateString('description', $event)"
      />
    </div>

    <div class="space-y-3 border rounded-md p-3">
      <h4 class="text-sm font-medium">Public Option</h4>
      <div>
        <Label>Label</Label>
        <Input
          :model-value="content.options.public.label"
          placeholder="Public"
          @update:model-value="updateOption('public', 'label', $event)"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Input
          :model-value="content.options.public.description"
          placeholder="Display on our website and marketing materials"
          @update:model-value="updateOption('public', 'description', $event)"
        />
      </div>
    </div>

    <div class="space-y-3 border rounded-md p-3">
      <h4 class="text-sm font-medium">Private Option</h4>
      <div>
        <Label>Label</Label>
        <Input
          :model-value="content.options.private.label"
          placeholder="Private"
          @update:model-value="updateOption('private', 'label', $event)"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Input
          :model-value="content.options.private.description"
          placeholder="For internal use only"
          @update:model-value="updateOption('private', 'description', $event)"
        />
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>Required</Label>
        <p class="text-xs text-muted-foreground">Customer must make a choice</p>
      </div>
      <Switch
        :checked="content.required"
        @update:checked="update({ required: $event })"
      />
    </div>
  </div>
</template>
