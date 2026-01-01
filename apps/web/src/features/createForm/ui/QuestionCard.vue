<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { Button, Card, CardContent } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useOrganizationStore } from '@/entities/organization';
import type { QuestionData } from '../models';

const props = defineProps<{
  question: QuestionData;
  index: number;
  isSelected?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  select: [index: number];
  remove: [index: number];
}>();

// Get allowed question types from organization's plan
const organizationStore = useOrganizationStore();
const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

// Find current question type details
const currentQuestionType = computed(() =>
  questionTypes.value.find((t) => t.id === props.question.question_type_id)
);

const questionTypeLabel = computed(
  () => currentQuestionType.value?.name ?? props.question.question_type_id
);
const questionTypeIcon = computed(() => currentQuestionType.value?.icon ?? 'minus');

// Map icon names to heroicons format
function getHeroIconName(iconName: string | null | undefined): string {
  if (!iconName) return 'heroicons:minus';
  return `heroicons:${iconName}`;
}

function handleClick() {
  if (!props.readonly) {
    emit('select', props.index);
  }
}

function handleRemove(event: Event) {
  event.stopPropagation();
  emit('remove', props.index);
}
</script>

<template>
  <Card
    class="group transition-all duration-200"
    :class="[
      !readonly && 'cursor-pointer hover:shadow-md hover:border-primary/50',
      isSelected && 'ring-2 ring-primary border-primary shadow-md',
    ]"
    @click="handleClick"
  >
    <CardContent class="p-4">
      <div class="flex items-start gap-3">
        <!-- Drag Handle -->
        <div
          v-if="!readonly"
          class="mt-0.5 cursor-grab text-gray-300 transition-colors group-hover:text-gray-400"
          @click.stop
        >
          <Icon icon="lucide:grip-vertical" class="h-5 w-5" />
        </div>

        <!-- Question Number -->
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors"
          :class="[
            isSelected
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary',
          ]"
        >
          {{ index + 1 }}
        </div>

        <!-- Question Content -->
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p
                class="text-sm text-gray-900 line-clamp-2"
                :class="{ 'font-medium': isSelected }"
              >
                {{ question.question_text }}
              </p>

              <!-- Meta info -->
              <div class="mt-1.5 flex flex-wrap items-center gap-2">
                <!-- Question Type Badge -->
                <div
                  class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  <Icon
                    :icon="getHeroIconName(questionTypeIcon)"
                    class="h-3 w-3"
                  />
                  <span>{{ questionTypeLabel }}</span>
                </div>

                <!-- Required Badge -->
                <span
                  v-if="question.is_required"
                  class="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                >
                  Required
                </span>

                <!-- Options Count for choice questions -->
                <span
                  v-if="question.options?.length"
                  class="text-xs text-gray-500"
                >
                  {{ question.options.length }} options
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-1">
              <!-- Edit indicator on hover -->
              <div
                v-if="!readonly && !isSelected"
                class="hidden items-center gap-1 text-xs text-gray-400 group-hover:flex"
              >
                <Icon icon="lucide:pencil" class="h-3 w-3" />
                <span>Edit</span>
              </div>

              <!-- Delete Button -->
              <Button
                v-if="!readonly"
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-gray-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                @click="handleRemove"
              >
                <Icon icon="lucide:trash-2" class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
