/**
 * Step Type Registry - Centralized step type configuration
 *
 * This registry provides a single source of truth for step type behavior,
 * fixing OCP violations where adding a new step type required modifying multiple files.
 *
 * ADR-014 Phase 2: Step Type Registry
 */
import type { FlowMembership, StepType } from '../models';

/**
 * Step type category for grouping in UI menus
 */
export type StepTypeCategory = 'core' | 'question' | 'flow-control';

/**
 * Step type configuration interface
 * Defines all behavior and defaults for a step type in one place.
 */
export interface StepTypeConfig {
  /** Unique identifier for this step type (matches StepType union) */
  type: StepType;

  /** Human-readable label for UI display */
  label: string;

  /** Icon name from icon library */
  icon: string;

  /** Whether this step type requires a linked question */
  requiresQuestion: boolean;

  /** The default question type to create (if requiresQuestion is true) */
  defaultQuestionType?: string;

  /** Flow memberships this step type is allowed in */
  allowedFlows: FlowMembership[];

  /** Default content structure for new steps of this type */
  defaultContent: Record<string, unknown>;

  /** Whether this step type can serve as a branching point */
  canBranch: boolean;

  /** Whether multiple steps of this type are allowed per flow */
  allowMultiple: boolean;

  /** Display order in "Add Step" menu (lower = higher priority) */
  menuOrder: number;

  /** Category for grouping in UI menus */
  category: StepTypeCategory;
}

/**
 * Registry type - Map of step type to its configuration
 */
export type StepTypeRegistry = Map<StepType, StepTypeConfig>;

// =============================================================================
// Registry Initialization
// =============================================================================

const registry: StepTypeRegistry = new Map();

// -----------------------------------------------------------------------------
// Core Steps
// -----------------------------------------------------------------------------

registry.set('welcome', {
  type: 'welcome',
  label: 'Welcome',
  icon: 'hand-wave',
  requiresQuestion: false,
  allowedFlows: ['shared'],
  defaultContent: {
    title: 'Share your experience',
    subtitle: 'Your feedback helps others make better decisions.',
    buttonText: 'Get Started',
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 1,
  category: 'core',
});

registry.set('thank_you', {
  type: 'thank_you',
  label: 'Thank You',
  icon: 'check-circle',
  requiresQuestion: false,
  allowedFlows: ['shared', 'testimonial', 'improvement'],
  defaultContent: {
    title: 'Thank you!',
    message: 'Your testimonial has been submitted successfully.',
    showSocialShare: false,
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 100,
  category: 'core',
});

// -----------------------------------------------------------------------------
// Question Steps
// -----------------------------------------------------------------------------

registry.set('question', {
  type: 'question',
  label: 'Question',
  icon: 'message-circle',
  requiresQuestion: true,
  defaultQuestionType: 'long_text',
  allowedFlows: ['shared', 'testimonial', 'improvement'],
  defaultContent: {},
  canBranch: false,
  allowMultiple: true,
  menuOrder: 10,
  category: 'question',
});

registry.set('rating', {
  type: 'rating',
  label: 'Rating',
  icon: 'star',
  requiresQuestion: true,
  defaultQuestionType: 'rating_nps',
  allowedFlows: ['shared'],
  defaultContent: {},
  canBranch: true,
  allowMultiple: false,
  menuOrder: 5,
  category: 'question',
});

// -----------------------------------------------------------------------------
// Flow Control Steps
// -----------------------------------------------------------------------------

registry.set('consent', {
  type: 'consent',
  label: 'Consent',
  icon: 'shield-check',
  requiresQuestion: false,
  allowedFlows: ['testimonial'],
  defaultContent: {
    title: 'How can we share your testimonial?',
    description: "Choose how you'd like your feedback to be used.",
    options: {
      public: { label: 'Public', description: 'Display on our website and marketing materials' },
      private: { label: 'Private', description: 'For internal use only' },
    },
    defaultOption: 'public',
    required: true,
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 50,
  category: 'flow-control',
});

registry.set('contact_info', {
  type: 'contact_info',
  label: 'Contact Info',
  icon: 'user',
  requiresQuestion: false,
  allowedFlows: ['shared', 'testimonial', 'improvement'],
  defaultContent: {
    title: 'A little about you',
    subtitle: 'Help us put a face to your feedback',
    enabledFields: ['name', 'email'],
    requiredFields: ['email'],
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 40,
  category: 'flow-control',
});

registry.set('reward', {
  type: 'reward',
  label: 'Reward',
  icon: 'gift',
  requiresQuestion: false,
  allowedFlows: ['testimonial', 'improvement'],
  defaultContent: {
    title: 'Thank you for your feedback!',
    description: "Here's a small token of our appreciation.",
    rewardType: 'coupon',
    couponCode: '',
    couponDescription: '',
  },
  canBranch: false,
  allowMultiple: false,
  menuOrder: 60,
  category: 'flow-control',
});

// =============================================================================
// Export frozen registry (immutable after initialization)
// =============================================================================

/**
 * The step type registry - single source of truth for step type configuration.
 * Frozen to prevent runtime modifications.
 */
export const stepTypeRegistry: Readonly<StepTypeRegistry> = Object.freeze(registry) as Readonly<StepTypeRegistry>;

// =============================================================================
// Registry Helper Functions
// =============================================================================

/**
 * Get configuration for a step type.
 * @param type - The step type to look up
 * @returns The step type configuration
 * @throws Error if step type is not found in registry
 */
export function getStepTypeConfig(type: StepType): StepTypeConfig {
  const config = stepTypeRegistry.get(type);
  if (!config) {
    throw new Error(`Unknown step type: ${type}`);
  }
  return config;
}

/**
 * Get configuration for a step type safely (returns undefined if not found).
 * @param type - The step type to look up
 * @returns The step type configuration or undefined
 */
export function getStepTypeConfigSafe(type: StepType): StepTypeConfig | undefined {
  return stepTypeRegistry.get(type);
}

/**
 * Check if a step type requires a linked question.
 * @param type - The step type to check
 * @returns True if the step type requires a question
 */
export function stepTypeRequiresQuestion(type: StepType): boolean {
  return getStepTypeConfig(type).requiresQuestion;
}

/**
 * Get a deep clone of the default content for a step type.
 * @param type - The step type
 * @returns A cloned copy of the default content
 */
export function getStepTypeDefaultContent(type: StepType): Record<string, unknown> {
  return structuredClone(getStepTypeConfig(type).defaultContent);
}

/**
 * Get all step types allowed in a given flow membership.
 * @param flow - The flow membership to filter by
 * @returns Array of step type configs sorted by menu order
 */
export function getStepTypesForFlow(flow: FlowMembership): StepTypeConfig[] {
  return Array.from(stepTypeRegistry.values())
    .filter(config => config.allowedFlows.includes(flow))
    .sort((a, b) => a.menuOrder - b.menuOrder);
}

/**
 * Get all step types sorted by menu order.
 * @returns Array of all step type configs
 */
export function getAllStepTypes(): StepTypeConfig[] {
  return Array.from(stepTypeRegistry.values())
    .sort((a, b) => a.menuOrder - b.menuOrder);
}

/**
 * Get step types filtered by category.
 * @param category - The category to filter by
 * @returns Array of step type configs in that category, sorted by menu order
 */
export function getStepTypesByCategory(category: StepTypeCategory): StepTypeConfig[] {
  return Array.from(stepTypeRegistry.values())
    .filter(config => config.category === category)
    .sort((a, b) => a.menuOrder - b.menuOrder);
}
