<script setup lang="ts">
/**
 * PeriodSelector
 *
 * Segmented control for selecting time periods using Tabs component.
 */

import { Tabs, TabsList, TabsTrigger } from '@testimonials/ui';
import type { Period } from '../models';

const modelValue = defineModel<Period>({ default: '30d' });

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];
</script>

<template>
  <Tabs v-model="modelValue" class="w-fit">
    <TabsList class="grid w-fit grid-cols-3 bg-muted/50 backdrop-blur-sm">
      <TabsTrigger
        v-for="period in periods"
        :key="period.value"
        :value="period.value"
        class="px-4 text-xs"
      >
        {{ period.label }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
