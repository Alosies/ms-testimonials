<script setup lang="ts">
/**
 * FormDashboardAudience
 *
 * Device donut chart and location breakdown panels.
 */

import { computed } from 'vue';
import { Monitor, Smartphone } from 'lucide-vue-next';
import { Card } from '@testimonials/ui';
import type { AudienceData } from '../models';
import { formatPercentage, formatNumber } from '../functions';
import { DeviceDonutChart } from './charts';

interface Props {
  audience: AudienceData | null;
}

const props = defineProps<Props>();

const device = computed(() => props.audience?.device ?? null);
const topCountries = computed(() => props.audience?.topCountries ?? []);
const otherPercent = computed(() => props.audience?.otherCountriesPercent ?? 0);

// Country flag emoji helper
function getCountryFlag(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';

  // Convert country code to regional indicator symbols
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <!-- Device Breakdown -->
    <Card class="p-5 backdrop-blur-sm bg-card/80 border-border/50">
      <h3 class="mb-4 text-lg font-medium text-foreground">
        Device
      </h3>

      <div v-if="device" class="space-y-4">
        <!-- Donut chart -->
        <DeviceDonutChart :device="device" />

        <!-- Legend -->
        <div class="flex justify-center gap-6">
          <div class="flex items-center gap-2">
            <Monitor class="h-4 w-4 text-[hsl(var(--chart-1))]" />
            <span class="text-sm text-muted-foreground">
              Desktop {{ formatPercentage(device.desktopPercent) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Smartphone class="h-4 w-4 text-[hsl(var(--chart-3))]" />
            <span class="text-sm text-muted-foreground">
              Mobile {{ formatPercentage(device.mobilePercent) }}
            </span>
          </div>
        </div>

        <!-- Session counts -->
        <div class="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>{{ formatNumber(device.desktop) }} desktop</span>
          <span>{{ formatNumber(device.mobile) }} mobile</span>
        </div>
      </div>

      <div v-else class="py-4 text-center text-muted-foreground">
        No device data available
      </div>
    </Card>

    <!-- Location Breakdown -->
    <Card class="p-5 backdrop-blur-sm bg-card/80 border-border/50">
      <h3 class="mb-4 text-lg font-medium text-foreground">
        Location
      </h3>

      <div v-if="topCountries.length > 0" class="space-y-2">
        <div
          v-for="country in topCountries"
          :key="country.countryCode ?? country.country"
          class="flex items-center justify-between text-sm"
        >
          <span class="flex items-center gap-2 text-foreground">
            <span>{{ getCountryFlag(country.countryCode) }}</span>
            <span>{{ country.country }}</span>
          </span>
          <span class="text-muted-foreground">
            {{ formatPercentage(country.percent) }}
          </span>
        </div>

        <!-- Other countries -->
        <div
          v-if="otherPercent > 0"
          class="flex items-center justify-between text-sm text-muted-foreground"
        >
          <span class="flex items-center gap-2">
            <span>🌍</span>
            <span>Other</span>
          </span>
          <span>{{ formatPercentage(otherPercent) }}</span>
        </div>
      </div>

      <div v-else class="py-4 text-center text-muted-foreground">
        No location data available
      </div>
    </Card>
  </div>
</template>
