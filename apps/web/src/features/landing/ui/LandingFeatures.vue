<script setup lang="ts">
import { Card, CardContent } from '@testimonials/ui'
import ScrollReveal from '@/shared/ui/ScrollReveal.vue'

defineOptions({
  name: 'LandingFeatures',
})

const widgets = [
  {
    name: 'Wall of Love',
    description: 'Masonry grid showcasing multiple testimonials',
    preview: 'wall',
  },
  {
    name: 'Carousel',
    description: 'Sliding testimonials for any section',
    preview: 'carousel',
  },
  {
    name: 'Single Quote',
    description: 'Featured testimonial for hero sections',
    preview: 'quote',
  },
]

const features = [
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>`,
    title: 'Shareable Links',
    description: 'Custom URLs for each form',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`,
    title: 'Mobile Friendly',
    description: 'Responsive on all devices',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`,
    title: 'Lightning Fast',
    description: '<50kb widget, <500ms load',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`,
    title: 'Approve Workflow',
    description: 'Review before publishing',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>`,
    title: 'Star Ratings',
    description: 'Optional 5-star ratings',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>`,
    title: 'Theme Options',
    description: 'Light & dark modes',
  },
]
</script>

<template>
  <section id="features" class="py-24 bg-muted/50">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <ScrollReveal>
        <div class="text-center mb-16">
          <span class="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            Features
          </span>
          <h2 class="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Everything you need
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features that make testimonial collection and display effortless.
          </p>
        </div>
      </ScrollReveal>

      <!-- Widget Types -->
      <ScrollReveal>
        <div class="mb-16">
          <h3 class="text-lg font-medium text-foreground text-center mb-8">
            Embed Widgets
          </h3>
          <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card v-for="widget in widgets" :key="widget.name" class="overflow-hidden">
            <!-- Widget Preview -->
            <div class="h-40 bg-gradient-to-br from-teal-500 to-cyan-600 p-4">
              <!-- Wall of Love Preview -->
              <template v-if="widget.preview === 'wall'">
                <div class="grid grid-cols-3 gap-2 h-full">
                  <div class="bg-white/20 backdrop-blur-sm rounded h-full" />
                  <div class="space-y-2">
                    <div class="bg-white/20 backdrop-blur-sm rounded h-1/2" />
                    <div class="bg-white/20 backdrop-blur-sm rounded h-1/3" />
                  </div>
                  <div class="space-y-2">
                    <div class="bg-white/20 backdrop-blur-sm rounded h-1/3" />
                    <div class="bg-white/20 backdrop-blur-sm rounded h-1/2" />
                  </div>
                </div>
              </template>

              <!-- Carousel Preview -->
              <template v-if="widget.preview === 'carousel'">
                <div class="flex items-center justify-center h-full gap-2">
                  <div class="w-2 h-2 rounded-full bg-white/40" />
                  <div class="flex-1 bg-white/20 backdrop-blur-sm rounded h-full max-w-[70%]" />
                  <div class="w-2 h-2 rounded-full bg-white/40" />
                </div>
              </template>

              <!-- Single Quote Preview -->
              <template v-if="widget.preview === 'quote'">
                <div class="flex items-center justify-center h-full">
                  <div class="bg-white/20 backdrop-blur-sm rounded p-4 text-center">
                    <div class="text-white/80 text-2xl mb-2">"</div>
                    <div class="w-32 h-2 bg-white/30 rounded mx-auto mb-2" />
                    <div class="w-24 h-2 bg-white/30 rounded mx-auto" />
                  </div>
                </div>
              </template>
            </div>

            <CardContent class="pt-4 pb-4 px-4 text-center">
              <h4 class="text-base font-medium text-foreground mb-1">
                {{ widget.name }}
              </h4>
              <p class="text-sm text-muted-foreground">
                {{ widget.description }}
              </p>
            </CardContent>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      <!-- Feature Grid -->
      <ScrollReveal :delay="200">
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="flex items-start gap-3"
          >
            <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0" v-html="feature.icon" />
            <div>
              <h4 class="text-sm font-medium text-foreground mb-0.5">
                {{ feature.title }}
              </h4>
              <p class="text-sm text-muted-foreground">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>
