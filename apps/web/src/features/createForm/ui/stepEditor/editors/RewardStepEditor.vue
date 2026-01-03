<script setup lang="ts">
import { computed } from 'vue';
import { Input, Textarea, Label } from '@testimonials/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@testimonials/ui';
import type { FormStep, RewardContent } from '../../../models/stepContent';
import { isRewardStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: RewardContent): void;
}>();

const content = computed((): RewardContent => {
  if (isRewardStep(props.step)) {
    return props.step.content;
  }
  return {
    title: '',
    description: '',
    rewardType: 'coupon',
  };
});

function update(updates: Partial<RewardContent>) {
  emit('update', { ...content.value, ...updates });
}

function updateField(field: keyof RewardContent, value: string | number) {
  update({ [field]: String(value) });
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="Thank you for your feedback!"
        @update:model-value="updateField('title', $event)"
      />
    </div>

    <div>
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        :model-value="content.description"
        placeholder="Here's a small token of our appreciation."
        :rows="2"
        @update:model-value="updateField('description', $event)"
      />
    </div>

    <div>
      <Label>Reward Type</Label>
      <Select
        :model-value="content.rewardType"
        @update:model-value="update({ rewardType: $event as RewardContent['rewardType'] })"
      >
        <SelectTrigger>
          <SelectValue placeholder="Select reward type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="coupon">Coupon Code</SelectItem>
          <SelectItem value="download">Download Link</SelectItem>
          <SelectItem value="link">External Link</SelectItem>
          <SelectItem value="custom">Custom HTML</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Coupon fields -->
    <template v-if="content.rewardType === 'coupon'">
      <div>
        <Label>Coupon Code</Label>
        <Input
          :model-value="content.couponCode ?? ''"
          placeholder="THANKYOU20"
          @update:model-value="updateField('couponCode', $event)"
        />
      </div>
      <div>
        <Label>Coupon Description</Label>
        <Input
          :model-value="content.couponDescription ?? ''"
          placeholder="20% off your next purchase"
          @update:model-value="updateField('couponDescription', $event)"
        />
      </div>
    </template>

    <!-- Download fields -->
    <template v-if="content.rewardType === 'download'">
      <div>
        <Label>Download URL</Label>
        <Input
          :model-value="content.downloadUrl ?? ''"
          placeholder="https://example.com/ebook.pdf"
          @update:model-value="updateField('downloadUrl', $event)"
        />
      </div>
      <div>
        <Label>Button Label</Label>
        <Input
          :model-value="content.downloadLabel ?? ''"
          placeholder="Download Your Free Guide"
          @update:model-value="updateField('downloadLabel', $event)"
        />
      </div>
    </template>

    <!-- Link fields -->
    <template v-if="content.rewardType === 'link'">
      <div>
        <Label>Link URL</Label>
        <Input
          :model-value="content.linkUrl ?? ''"
          placeholder="https://example.com/special-offer"
          @update:model-value="updateField('linkUrl', $event)"
        />
      </div>
      <div>
        <Label>Button Label</Label>
        <Input
          :model-value="content.linkLabel ?? ''"
          placeholder="Claim Your Reward"
          @update:model-value="updateField('linkLabel', $event)"
        />
      </div>
    </template>

    <!-- Custom HTML fields -->
    <template v-if="content.rewardType === 'custom'">
      <div>
        <Label>Custom HTML</Label>
        <Textarea
          :model-value="content.customHtml ?? ''"
          placeholder="<p>Your custom reward content...</p>"
          :rows="4"
          @update:model-value="updateField('customHtml', $event)"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Use HTML to create a custom reward display.
        </p>
      </div>
    </template>
  </div>
</template>
