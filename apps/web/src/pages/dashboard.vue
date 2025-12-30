<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import AuthLayout from '@/layouts/AuthLayout.vue'

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <AuthLayout>
    <div class="p-8">
      <div class="max-w-4xl">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p class="mt-1 text-sm text-gray-500">
            Welcome back! Here's an overview of your testimonials.
          </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                <svg class="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-semibold text-gray-900">0</p>
                <p class="text-sm text-gray-500">Active Forms</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg class="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-semibold text-gray-900">0</p>
                <p class="text-sm text-gray-500">Total Testimonials</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-2xl font-semibold text-gray-900">0</p>
                <p class="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Getting Started Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <p class="text-sm text-gray-600 mb-6">
            Start collecting testimonials in just a few steps.
          </p>

          <div class="space-y-4">
            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-medium text-teal-700">1</span>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Create your first form</h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  Set up a collection form with smart AI-powered prompts.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-medium text-gray-500">2</span>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Share with customers</h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  Send your form link to customers via email or embed it on your site.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-medium text-gray-500">3</span>
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">Display testimonials</h3>
                <p class="text-sm text-gray-500 mt-0.5">
                  Create beautiful widgets to showcase approved testimonials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
