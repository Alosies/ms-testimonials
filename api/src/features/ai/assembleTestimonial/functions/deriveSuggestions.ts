import type { TestimonialSuggestion } from '@/shared/schemas/ai';

/**
 * Derive contextual suggestions based on testimonial content.
 *
 * Analyzes the testimonial text and returns applicable
 * suggestions for improving or adjusting the output.
 *
 * Pure function: input → output with no side effects.
 */
export function deriveSuggestions(
  testimonial: string,
  rating?: number
): TestimonialSuggestion[] {
  const suggestions: TestimonialSuggestion[] = [];
  const wordCount = testimonial.split(/\s+/).length;

  // Length-based suggestions
  if (wordCount > 100) {
    suggestions.push({
      id: 'make_briefer',
      label: 'Make it briefer',
      description: 'Shorten while keeping key points',
      applicability: Math.min(1, (wordCount - 100) / 100),
    });
  }
  if (wordCount < 60) {
    suggestions.push({
      id: 'add_details',
      label: 'Add more details',
      description: 'Expand with more specific examples',
      applicability: Math.min(1, (60 - wordCount) / 60),
    });
  }

  // Tone suggestions
  if (rating && rating >= 4) {
    suggestions.push({
      id: 'more_enthusiastic',
      label: 'More enthusiastic',
      description: 'Add more energy and excitement',
      applicability: 0.6,
    });
  }

  // Professional vs casual
  suggestions.push({
    id: 'more_professional',
    label: 'More professional',
    description: 'Use a more formal business tone',
    applicability: 0.5,
  });

  suggestions.push({
    id: 'more_casual',
    label: 'More casual',
    description: 'Use a friendlier, conversational tone',
    applicability: 0.5,
  });

  // Sort by applicability and return top 4
  return suggestions.sort((a, b) => b.applicability - a.applicability).slice(0, 4);
}
