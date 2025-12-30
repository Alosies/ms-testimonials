<script setup lang="ts">
import ScrollReveal from '@/shared/ui/ScrollReveal.vue'

defineOptions({
  name: 'LandingHowItWorks',
})

const steps = [
  {
    number: '1',
    title: 'Create Your Form',
    description: 'Enter your product name and description. AI generates tailored questions instantly.',
    visual: 'form',
  },
  {
    number: '2',
    title: 'Customer Answers Prompts',
    description: 'Guided flow asks about their problem, your solution, and their results.',
    visual: 'prompts',
  },
  {
    number: '3',
    title: 'AI Assembles & You Approve',
    description: 'AI combines answers into polished testimonials. Review, approve, and embed.',
    visual: 'approve',
  },
]
</script>

<template>
  <section id="how-it-works" class="py-24 bg-background">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <ScrollReveal>
        <div class="text-center mb-16">
          <span class="inline-block text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            How it works
          </span>
          <h2 class="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-4">
            Three simple steps
          </h2>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
            From setup to embedded testimonials in under 5 minutes.
          </p>
        </div>
      </ScrollReveal>

      <!-- Steps -->
      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Connecting Line -->
          <div class="hidden md:block absolute left-[28px] top-12 bottom-12 w-0.5 bg-border" />

          <div class="space-y-12">
            <ScrollReveal
              v-for="(step, index) in steps"
              :key="step.number"
              :delay="index * 150"
            >
              <div class="relative flex gap-6 items-start">
              <!-- Step Number -->
              <div class="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold relative z-10">
                {{ step.number }}
              </div>

              <!-- Content -->
              <div class="flex-1 pt-2">
                <h3 class="text-xl font-medium text-foreground mb-2">
                  {{ step.title }}
                </h3>
                <p class="text-muted-foreground leading-relaxed mb-4">
                  {{ step.description }}
                </p>

                <!-- Visual Preview -->
                <div class="bg-muted rounded-lg border p-6">
                  <!-- Form Preview -->
                  <template v-if="step.visual === 'form'">
                    <div class="space-y-4">
                      <div>
                        <div class="text-xs text-muted-foreground mb-1">Product Name</div>
                        <div class="h-9 bg-background rounded border px-3 flex items-center text-sm text-foreground">
                          TaskFlow
                        </div>
                      </div>
                      <div>
                        <div class="text-xs text-muted-foreground mb-1">Description</div>
                        <div class="h-9 bg-background rounded border px-3 flex items-center text-sm text-foreground">
                          Project management for remote teams
                        </div>
                      </div>
                      <div class="flex items-center gap-2 text-sm text-primary">
                        <svg class="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI generating questions...
                      </div>
                    </div>
                  </template>

                  <!-- Prompts Preview -->
                  <template v-if="step.visual === 'prompts'">
                    <div class="space-y-3">
                      <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">1</div>
                        <p class="text-sm text-foreground">"What was your biggest challenge before TaskFlow?"</p>
                      </div>
                      <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">2</div>
                        <p class="text-sm text-foreground">"How did TaskFlow help solve it?"</p>
                      </div>
                      <div class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">3</div>
                        <p class="text-sm text-foreground">"What specific results have you seen?"</p>
                      </div>
                    </div>
                  </template>

                  <!-- Approve Preview -->
                  <template v-if="step.visual === 'approve'">
                    <div class="space-y-3">
                      <div class="bg-background rounded border p-4">
                        <p class="text-sm text-foreground italic">
                          "Before TaskFlow, coordinating our remote team was chaos. Now everything flows smoothly and we've cut meeting time by 50%."
                        </p>
                        <div class="mt-3 flex items-center gap-2">
                          <div class="w-8 h-8 rounded-full bg-muted" />
                          <div>
                            <div class="text-sm font-medium text-foreground">Sarah Chen</div>
                            <div class="text-xs text-muted-foreground">Product Lead at Acme</div>
                          </div>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <div class="px-3 py-1.5 rounded bg-success/10 text-success text-xs font-medium">
                          Approve
                        </div>
                        <div class="px-3 py-1.5 rounded bg-muted text-muted-foreground text-xs">
                          Edit
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
