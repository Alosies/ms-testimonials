<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@testimonials/ui'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'LandingHeader',
})

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm'
        : 'bg-transparent'
    ]"
  >
    <div class="container mx-auto px-4">
      <nav class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              isScrolled ? 'bg-primary' : 'bg-white/20'
            ]"
          >
            <svg
              :class="[
                'w-5 h-5 transition-colors',
                isScrolled ? 'text-primary-foreground' : 'text-white'
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span
            :class="[
              'text-lg font-semibold transition-colors',
              isScrolled ? 'text-foreground' : 'text-white'
            ]"
          >
            Testimonials
          </span>
          <span
            :class="[
              'text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors',
              isScrolled
                ? 'bg-amber-100 text-amber-600'
                : 'bg-amber-400/30 text-amber-200'
            ]"
          >
            AI
          </span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <a
            v-for="link in navLinks"
            :key="link.label"
            :href="link.href"
            :class="[
              'text-sm font-medium transition-colors hover:opacity-80',
              isScrolled ? 'text-muted-foreground hover:text-foreground' : 'text-white/80 hover:text-white'
            ]"
          >
            {{ link.label }}
          </a>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden md:flex items-center gap-3">
          <Button
            :variant="isScrolled ? 'ghost' : 'ghost'"
            size="sm"
            as-child
            :class="isScrolled ? '' : 'text-white hover:bg-white/10'"
          >
            <RouterLink to="/auth/login">
              Log in
            </RouterLink>
          </Button>
          <Button
            :variant="isScrolled ? 'default' : 'glass'"
            size="sm"
            as-child
          >
            <RouterLink to="/auth/signup">
              Get Started
            </RouterLink>
          </Button>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2"
          :class="isScrolled ? 'text-foreground' : 'text-white'"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg
            v-if="!isMobileMenuOpen"
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </nav>

      <!-- Mobile Menu -->
      <div
        v-show="isMobileMenuOpen"
        class="md:hidden pb-4"
      >
        <div class="flex flex-col gap-2">
          <a
            v-for="link in navLinks"
            :key="link.label"
            :href="link.href"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isScrolled
                ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            ]"
            @click="isMobileMenuOpen = false"
          >
            {{ link.label }}
          </a>
          <div class="flex flex-col gap-2 pt-2 border-t border-white/10">
            <Button
              :variant="isScrolled ? 'outline' : 'ghost'"
              size="sm"
              as-child
              :class="isScrolled ? '' : 'text-white hover:bg-white/10 border-white/20'"
            >
              <RouterLink to="/auth/login">
                Log in
              </RouterLink>
            </Button>
            <Button
              :variant="isScrolled ? 'default' : 'glass'"
              size="sm"
              as-child
            >
              <RouterLink to="/auth/signup">
                Get Started
              </RouterLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
