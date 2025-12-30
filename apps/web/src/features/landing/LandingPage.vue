<script setup lang="ts">
import {
  LandingHeader,
  LandingHero,
  LandingProblem,
  LandingSolution,
  LandingHowItWorks,
  LandingFeatures,
  LandingPricing,
  LandingFaq,
  LandingCta,
  LandingFooter,
} from './ui'

defineOptions({
  name: 'LandingPage',
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <LandingHeader />
    <LandingHero />
    <LandingProblem />
    <LandingSolution />
    <LandingHowItWorks />
    <LandingFeatures />
    <LandingPricing />
    <LandingFaq />
    <LandingCta />
    <LandingFooter />
  </div>
</template>
