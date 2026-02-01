<script setup lang="ts">
/**
 * TopupPurchaseModal
 *
 * Modal component for purchasing credit topup packages.
 * Displays available packages and handles Stripe checkout flow.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { ref, computed, watch } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Skeleton,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useApiForCredits } from '../api';
import type { CreditTopupPackage } from '../models';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'purchase-started'): void;
}>();

// Initialize API client at setup time (per Vue composable rules)
const { getTopupPackages, purchaseCredits } = useApiForCredits();

// State
const packages = ref<CreditTopupPackage[]>([]);
const selectedPackageId = ref<string | null>(null);
const loading = ref(false);
const purchasing = ref(false);
const error = ref<string | null>(null);

/**
 * Fetch available topup packages when modal opens
 */
async function fetchPackages(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const response = await getTopupPackages();
    packages.value = response.packages;

    // Auto-select the popular package if available
    const popularPackage = packages.value.find((pkg) => pkg.uniqueName === 'popular');
    if (popularPackage) {
      selectedPackageId.value = popularPackage.id;
    } else if (packages.value.length > 0) {
      selectedPackageId.value = packages.value[0].id;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load packages';
  } finally {
    loading.value = false;
  }
}

/**
 * Handle package selection
 */
function selectPackage(packageId: string): void {
  selectedPackageId.value = packageId;
}

/**
 * Check if a package is selected
 */
function isSelected(packageId: string): boolean {
  return selectedPackageId.value === packageId;
}

/**
 * Format price from cents to dollars
 */
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Format price per credit
 */
function formatPricePerCredit(pricePerCredit: number): string {
  return `$${pricePerCredit.toFixed(4)}`;
}

/**
 * Handle purchase button click
 */
async function handlePurchase(): Promise<void> {
  if (!selectedPackageId.value) return;

  purchasing.value = true;
  error.value = null;

  try {
    const response = await purchaseCredits(selectedPackageId.value);

    // Emit event before redirecting
    emit('purchase-started');

    // Redirect to Stripe checkout
    window.location.href = response.checkoutUrl;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to start checkout';
    purchasing.value = false;
  }
}

/**
 * Handle modal close
 */
function handleClose(): void {
  if (!purchasing.value) {
    emit('close');
  }
}

/**
 * Handle dialog visibility update
 */
function handleUpdateVisible(value: boolean): void {
  if (!value) {
    handleClose();
  }
}

/**
 * Get selected package for display
 */
const selectedPackage = computed(() => {
  return packages.value.find((pkg) => pkg.id === selectedPackageId.value);
});

// Watch for modal open/close to fetch packages
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      fetchPackages();
    } else {
      // Reset state when modal closes
      selectedPackageId.value = null;
      error.value = null;
      purchasing.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <Dialog :open="open" @update:open="handleUpdateVisible">
    <DialogContent
      class="z-[60] sm:max-w-lg"
      overlay-class="z-[60]"
      data-testid="topup-modal"
    >
      <DialogHeader>
        <!-- Icon -->
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
        >
          <Icon icon="heroicons:bolt" class="h-6 w-6 text-primary" />
        </div>

        <DialogTitle class="text-center">Get More Credits</DialogTitle>
        <DialogDescription class="text-center">
          Purchase additional AI credits for your account. Credits never expire and can be used
          anytime.
        </DialogDescription>
      </DialogHeader>

      <!-- Loading State -->
      <div v-if="loading" class="mt-4 space-y-3">
        <Skeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="error && !packages.length" class="mt-4 text-center py-6">
        <Icon
          icon="heroicons:exclamation-triangle"
          class="h-10 w-10 text-destructive mx-auto mb-3"
        />
        <p class="text-sm text-destructive mb-3">{{ error }}</p>
        <Button variant="outline" size="sm" @click="fetchPackages">
          <Icon icon="lucide:refresh-cw" class="h-4 w-4 mr-1.5" />
          Try Again
        </Button>
      </div>

      <!-- Package Selection -->
      <div v-else class="mt-4 space-y-3">
        <button
          v-for="pkg in packages"
          :key="pkg.id"
          type="button"
          class="relative w-full rounded-lg border p-4 text-left transition-all"
          :class="[
            isSelected(pkg.id)
              ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-sm'
              : 'border-border hover:border-primary/50 hover:bg-muted/50',
          ]"
          :disabled="purchasing"
          :data-testid="`package-${pkg.uniqueName}`"
          @click="selectPackage(pkg.id)"
        >
          <!-- Popular Badge -->
          <span
            v-if="pkg.uniqueName === 'popular'"
            class="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground"
          >
            <Icon icon="heroicons:star" class="h-3 w-3" />
            Popular
          </span>

          <div class="flex items-start justify-between gap-4">
            <!-- Package Info -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <!-- Radio indicator -->
                <div
                  class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                  :class="
                    isSelected(pkg.id)
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  "
                >
                  <div
                    v-if="isSelected(pkg.id)"
                    class="h-1.5 w-1.5 rounded-full bg-primary-foreground"
                  />
                </div>

                <h3 class="font-semibold text-foreground">{{ pkg.name }}</h3>
              </div>

              <p v-if="pkg.description" class="mt-1 text-sm text-muted-foreground pl-6">
                {{ pkg.description }}
              </p>

              <!-- Credits amount -->
              <div class="mt-2 flex items-center gap-2 pl-6">
                <Icon icon="heroicons:bolt" class="h-4 w-4 text-amber-500" />
                <span class="text-sm font-medium text-foreground">
                  {{ pkg.credits.toLocaleString() }} credits
                </span>
              </div>
            </div>

            <!-- Price -->
            <div class="text-right">
              <p class="text-lg font-bold text-foreground">
                {{ formatPrice(pkg.priceUsdCents) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ formatPricePerCredit(pkg.pricePerCredit) }}/credit
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- Inline error for purchase failure -->
      <div
        v-if="error && packages.length"
        class="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3"
      >
        <p class="text-sm text-destructive flex items-center gap-2">
          <Icon icon="heroicons:exclamation-circle" class="h-4 w-4 shrink-0" />
          {{ error }}
        </p>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex gap-3">
        <Button
          variant="outline"
          class="flex-1"
          :disabled="purchasing"
          @click="handleClose"
        >
          Cancel
        </Button>
        <Button
          class="flex-1"
          :disabled="!selectedPackageId || purchasing || loading"
          data-testid="purchase-button"
          @click="handlePurchase"
        >
          <Icon
            v-if="purchasing"
            icon="lucide:loader-2"
            class="mr-1.5 h-4 w-4 animate-spin"
          />
          <template v-if="purchasing">
            Redirecting...
          </template>
          <template v-else-if="selectedPackage">
            Purchase {{ formatPrice(selectedPackage.priceUsdCents) }}
          </template>
          <template v-else>
            Select a Package
          </template>
        </Button>
      </div>

      <!-- Security note -->
      <p class="mt-3 text-center text-xs text-muted-foreground">
        <Icon icon="heroicons:lock-closed" class="inline h-3 w-3 mr-1" />
        Secure checkout powered by Stripe
      </p>
    </DialogContent>
  </Dialog>
</template>
