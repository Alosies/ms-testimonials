<script setup lang="ts">
/**
 * AI Limits Widget
 *
 * Composes credit balance and rate limits cards in a responsive grid.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import CreditBalanceCard from './CreditBalanceCard.vue';
import RateLimitsCard from './RateLimitsCard.vue';
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <CreditBalanceCard />
    <RateLimitsCard />
  </div>
</template>
