<script setup lang="ts">
import { ref } from 'vue'
import ScrollReveal from '@/shared/ui/ScrollReveal.vue'

defineOptions({
  name: 'LandingFaq',
})

const faqs = [
  {
    question: 'What makes this different from other testimonial tools?',
    answer: 'Two AI features set us apart: 1) AI generates industry-specific questions from just your product description, and 2) AI assembles customer answers into polished testimonials while keeping their authentic voice. You get better testimonials with less effort.',
  },
  {
    question: 'How does the AI testimonial assembly work?',
    answer: 'Customers answer 3-4 guided prompts about their problem, your solution, and their results. Our AI then combines these answers into a natural, first-person testimonial. The customer reviews and approves it before submission, ensuring authenticity.',
  },
  {
    question: 'Do I need coding skills to embed widgets?',
    answer: 'No coding required. Just copy our simple embed code and paste it into your website. Works with any website builder including Webflow, WordPress, Squarespace, and custom sites.',
  },
  {
    question: 'Is there a free tier?',
    answer: 'Yes! The free tier includes 50 testimonials, 1 form, and 1 widget. AI features are included. You only need to upgrade when you need more forms, widgets, or want to remove our branding.',
  },
  {
    question: 'What\'s included in the one-time payment?',
    answer: 'Lifetime access to all features in your tier, including future updates. No recurring fees. The Pro tier ($49) includes unlimited testimonials, 5 forms, all widgets, and no branding.',
  },
  {
    question: 'Can I try before I buy?',
    answer: 'Absolutely. Start with the free tier and upgrade whenever you\'re ready. We also offer a 30-day money-back guarantee on all paid plans.',
  },
]

const openIndex = ref<number | null>(null)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section id="faq" class="py-24 bg-muted/50">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <ScrollReveal>
        <div class="text-center mb-16">
          <span class="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            FAQ
          </span>
          <h2 class="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about the product.
          </p>
        </div>
      </ScrollReveal>

      <!-- FAQ List -->
      <ScrollReveal>
        <div class="max-w-2xl mx-auto space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="border rounded-lg bg-card overflow-hidden"
          >
            <button
              class="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
              @click="toggle(index)"
            >
              <span class="text-base font-medium text-foreground">
                {{ faq.question }}
              </span>
              <svg
                :class="[
                  'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform',
                  openIndex === index ? 'rotate-180' : ''
                ]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-show="openIndex === index"
              class="px-6 pb-4"
            >
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>
