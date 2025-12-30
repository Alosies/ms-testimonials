<script setup lang="ts">
import { Button, Card, CardContent, Badge } from '@testimonials/ui'
import { RouterLink } from 'vue-router'
import ScrollReveal from '@/shared/ui/ScrollReveal.vue'

defineOptions({
  name: 'LandingPricing',
})

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect to get started',
    features: [
      '50 testimonials',
      '1 collection form',
      '1 embed widget',
      'AI smart prompts',
      'AI testimonial assembly',
      'Testimonials branding',
    ],
    cta: 'Get Started Free',
    ctaVariant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: 'one-time',
    description: 'Best for growing businesses',
    features: [
      'Unlimited testimonials',
      '5 collection forms',
      'All widget types',
      'AI smart prompts',
      'AI question generator',
      'AI testimonial assembly',
      'No branding',
      'Priority support',
    ],
    cta: 'Get Pro Access',
    ctaVariant: 'default' as const,
    popular: true,
  },
  {
    name: 'Team',
    price: '$99',
    period: 'one-time',
    description: 'For teams and agencies',
    features: [
      'Everything in Pro',
      'Unlimited forms',
      '3 team seats',
      'Team management',
      'Priority support',
      'Early access to features',
    ],
    cta: 'Get Team Access',
    ctaVariant: 'outline' as const,
    popular: false,
  },
]
</script>

<template>
  <section id="pricing" class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <ScrollReveal>
        <div class="text-center mb-16">
          <span class="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            Pricing
          </span>
          <h2 class="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            No subscriptions. Pay once, use forever.
          </p>
        </div>
      </ScrollReveal>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <ScrollReveal
          v-for="(plan, index) in plans"
          :key="plan.name"
          :delay="index * 100"
        >
          <Card
            :class="[
              'relative h-full',
              plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''
            ]"
          >
          <!-- Popular Badge -->
          <Badge
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            Most Popular
          </Badge>

          <CardContent class="pt-8 pb-6 px-6">
            <!-- Plan Name -->
            <h3 class="text-lg font-medium text-foreground mb-2">
              {{ plan.name }}
            </h3>

            <!-- Price -->
            <div class="mb-4">
              <span class="text-4xl font-bold text-foreground">{{ plan.price }}</span>
              <span class="text-muted-foreground text-sm ml-1">{{ plan.period }}</span>
            </div>

            <!-- Description -->
            <p class="text-sm text-muted-foreground mb-6">
              {{ plan.description }}
            </p>

            <!-- Features -->
            <ul class="space-y-3 mb-8">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-center gap-2 text-sm"
              >
                <svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-foreground">{{ feature }}</span>
              </li>
            </ul>

            <!-- CTA -->
            <Button
              :variant="plan.ctaVariant"
              class="w-full"
              as-child
            >
              <RouterLink to="/auth/signup">
                {{ plan.cta }}
              </RouterLink>
            </Button>
          </CardContent>
          </Card>
        </ScrollReveal>
      </div>

      <!-- Money Back Guarantee -->
      <p class="text-center text-sm text-muted-foreground mt-8">
        30-day money-back guarantee. No questions asked.
      </p>
    </div>
  </section>
</template>
