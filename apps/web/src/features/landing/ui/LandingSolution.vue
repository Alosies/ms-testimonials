<script setup lang="ts">
import { Card, CardContent } from '@testimonials/ui'
import ScrollReveal from '@/shared/ui/ScrollReveal.vue'

defineOptions({
  name: 'LandingSolution',
})

const features = [
  {
    title: 'AI Smart Prompts',
    description: 'Guided 4-step flow asks the right questions. Customers know exactly what to say.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    highlight: true,
  },
  {
    title: 'AI Question Generator',
    description: 'Enter your product. AI creates industry-specific questions in seconds.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`,
    highlight: true,
  },
  {
    title: 'AI Assembly',
    description: 'Customer answers become polished testimonials. Authentic voice, professional polish.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>`,
    highlight: true,
  },
  {
    title: 'Beautiful Widgets',
    description: 'Wall of Love, Carousel, Single Quote. Embed anywhere in seconds.',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>`,
    highlight: false,
  },
]
</script>

<template>
  <section class="py-24 bg-muted/50">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <ScrollReveal>
        <div class="text-center mb-16">
          <span class="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            The Solution
          </span>
          <h2 class="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            AI-powered testimonial collection
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            Smart prompts + AI assembly = testimonials that actually convert.
            Set up in 2 minutes.
          </p>
        </div>
      </ScrollReveal>

      <!-- Feature Bento Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <ScrollReveal
          v-for="(feature, index) in features"
          :key="feature.title"
          :delay="index * 100"
        >
          <Card
            :class="[
              'transition-all hover:shadow-lg h-full',
              feature.highlight ? 'border-primary/30 hover:border-primary/50' : ''
            ]"
          >
            <CardContent class="pt-6 pb-6 px-6">
              <div
                :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                  feature.highlight ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                ]"
                v-html="feature.icon"
              />
              <h3 class="text-base font-medium text-foreground mb-2">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ feature.description }}
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
