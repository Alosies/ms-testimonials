<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { Avatar, AvatarFallback, AvatarImage, Checkbox } from '@testimonials/ui';
import { useGetTestimonials } from '@/entities/testimonial';
import { useCurrentContextStore } from '@/shared/currentContext';

const props = defineProps<{
  selectedIds: string[];
}>();

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]];
}>();

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));
const { testimonials, isLoading } = useGetTestimonials(variables);

const approvedTestimonials = computed(() =>
  testimonials.value.filter((t) => t.status === 'approved')
);

function toggleTestimonial(id: string) {
  const current = [...props.selectedIds];
  const index = current.indexOf(id);
  if (index >= 0) {
    current.splice(index, 1);
  } else {
    current.push(id);
  }
  emit('update:selectedIds', current);
}

function selectAll() {
  emit(
    'update:selectedIds',
    approvedTestimonials.value.map((t) => t.id)
  );
}

function selectNone() {
  emit('update:selectedIds', []);
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <label class="text-sm font-medium text-foreground">Testimonials</label>
      <div class="flex gap-2 text-xs">
        <button type="button" class="text-primary hover:underline" @click="selectAll">
          Select all
        </button>
        <span class="text-muted-foreground">|</span>
        <button type="button" class="text-muted-foreground hover:underline" @click="selectNone">
          Clear
        </button>
      </div>
    </div>

    <p v-if="isLoading" class="text-sm text-muted-foreground py-4">Loading testimonials...</p>

    <p
      v-else-if="approvedTestimonials.length === 0"
      class="text-sm text-muted-foreground py-4 text-center"
    >
      No approved testimonials available.
    </p>

    <div v-else class="space-y-2 max-h-64 overflow-y-auto pr-1">
      <div
        v-for="t in approvedTestimonials"
        :key="t.id"
        role="button"
        class="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer transition-colors hover:bg-muted/30"
        :class="selectedIds.includes(t.id) ? 'bg-muted/30 border-primary/30' : ''"
        @click="toggleTestimonial(t.id)"
      >
        <Checkbox
          :checked="selectedIds.includes(t.id)"
          class="mt-0.5 pointer-events-none"
        />
        <Avatar class="h-8 w-8 shrink-0">
          <AvatarImage v-if="t.customer_avatar_url" :src="t.customer_avatar_url" />
          <AvatarFallback class="text-xs">{{ getInitials(t.customer_name) }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-foreground truncate">
            {{ t.customer_name ?? 'Anonymous' }}
          </p>
          <p class="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {{ t.content ?? 'No content' }}
          </p>
          <div v-if="t.rating" class="flex items-center gap-0.5 mt-1">
            <Icon
              v-for="i in 5"
              :key="i"
              icon="heroicons:star-solid"
              class="h-3 w-3"
              :class="i <= t.rating ? 'text-amber-400' : 'text-gray-200'"
            />
          </div>
        </div>
      </div>
    </div>

    <p class="text-xs text-muted-foreground mt-2">
      {{ selectedIds.length }} of {{ approvedTestimonials.length }} selected
    </p>
  </div>
</template>
