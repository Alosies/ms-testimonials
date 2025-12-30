<script setup lang="ts">
import { Card, CardContent } from '@testimonials/ui'
import ScrollReveal from '@/shared/ui/ScrollReveal.vue'

defineOptions({
  name: 'LandingProblem',
})

const problems = [
  {
    icon: '😩',
    title: 'Hard to Collect',
    description: 'Customers ignore your requests. Manual follow-ups waste hours with no replies.',
  },
  {
    icon: '📝',
    title: 'Low Quality',
    description: '"Great product!" isn\'t convincing. Generic testimonials don\'t convert visitors.',
  },
  {
    icon: '⏰',
    title: 'Time Consuming',
    description: 'Endless back-and-forth editing. Getting a good testimonial takes days.',
  },
]
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <ScrollReveal>
        <div class="text-center mb-16">
          <span class="inline-block text-sm font-medium text-destructive bg-destructive/10 px-3 py-1 rounded-full mb-4">
            The Problem
          </span>
          <h2 class="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Collecting testimonials is broken
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            You know testimonials drive conversions. But getting good ones? That's another story.
          </p>
        </div>
      </ScrollReveal>

      <!-- Problem Cards -->
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <ScrollReveal v-for="(problem, index) in problems" :key="problem.title" :delay="index * 100">
          <Card class="border-destructive/20 hover:border-destructive/40 transition-colors h-full">
            <CardContent class="pt-8 pb-6 px-6 text-center">
              <div class="text-4xl mb-4">
                {{ problem.icon }}
              </div>
              <h3 class="text-lg font-medium text-foreground mb-2">
                {{ problem.title }}
              </h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ problem.description }}
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  </section>
</template>
