<script setup lang="ts">
/**
 * DeviceDonutChart
 *
 * Donut chart for device breakdown (desktop/mobile).
 * Uses CSS conic-gradient for reliable rendering.
 */

import { computed } from 'vue';
import type { DeviceBreakdown } from '../../models';

interface Props {
  device: DeviceBreakdown;
}

const props = defineProps<Props>();

// Chart colors
const desktopColor = 'hsl(var(--chart-1))';
const mobileColor = 'hsl(var(--chart-3))';

// Center label showing total
const totalSessions = computed(() => props.device.desktop + props.device.mobile);

// Conic gradient for donut effect
const gradientStyle = computed(() => {
  const desktop = props.device.desktopPercent;
  const mobile = props.device.mobilePercent;

  // Handle edge cases
  if (desktop === 0 && mobile === 0) {
    return { background: 'hsl(var(--muted))' };
  }

  return {
    background: `conic-gradient(
      ${desktopColor} 0% ${desktop}%,
      ${mobileColor} ${desktop}% ${desktop + mobile}%,
      hsl(var(--muted)) ${desktop + mobile}% 100%
    )`,
  };
});
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Donut chart using CSS -->
    <div class="relative h-32 w-32">
      <!-- Outer ring with gradient -->
      <div
        class="absolute inset-0 rounded-full"
        :style="gradientStyle"
      />
      <!-- Inner circle to create donut hole -->
      <div class="absolute inset-4 rounded-full bg-card" />
      <!-- Center label -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-xl font-semibold text-foreground">
          {{ totalSessions.toLocaleString() }}
        </span>
        <span class="text-xs text-muted-foreground">total</span>
      </div>
    </div>
  </div>
</template>
