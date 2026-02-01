import type { TestimonialMetadata } from '@/shared/schemas/ai';

/**
 * Analyze testimonial content and extract metadata.
 *
 * Performs pattern-based analysis to determine:
 * - Word count and reading time
 * - Tone (formality, energy, confidence)
 * - Key themes mentioned in the testimonial
 */
export function analyzeTestimonial(testimonial: string): TestimonialMetadata {
  const words = testimonial.split(/\s+/);
  const wordCount = words.length;
  const readingTimeSeconds = Math.ceil(wordCount / 3); // ~3 words per second

  // Simple tone detection based on patterns
  const hasExclamation = testimonial.includes('!');
  const hasStrong = /(\bincredible\b|\bamazing\b|\bfantastic\b|\blove\b)/i.test(testimonial);
  const hasFormal = /(\bconsequently\b|\btherefore\b|\bfurthermore\b)/i.test(testimonial);
  const hasNumbers = /\d+/.test(testimonial);

  // Determine tone
  const formality: TestimonialMetadata['tone']['formality'] = hasFormal
    ? 'formal'
    : hasExclamation || hasStrong
      ? 'casual'
      : 'neutral';
  const energy: TestimonialMetadata['tone']['energy'] = hasExclamation || hasStrong
    ? 'enthusiastic'
    : 'neutral';
  const confidence: TestimonialMetadata['tone']['confidence'] = hasNumbers
    ? 'assertive'
    : 'neutral';

  // Extract key themes (simple keyword extraction)
  const themePatterns: [RegExp, string][] = [
    [/time[-\s]?sav|faster|quick|efficient/i, 'time-saving'],
    [/team|collaborat|together/i, 'collaboration'],
    [/easy|simple|intuitive/i, 'ease-of-use'],
    [/support|help|responsive/i, 'support'],
    [/money|cost|save|ROI|return/i, 'cost-effective'],
    [/quality|reliable|depend/i, 'reliability'],
    [/grow|scale|expand/i, 'scalability'],
  ];

  const keyThemes = themePatterns
    .filter(([pattern]) => pattern.test(testimonial))
    .map(([, theme]) => theme)
    .slice(0, 5);

  return {
    word_count: wordCount,
    reading_time_seconds: readingTimeSeconds,
    tone: {
      formality,
      energy,
      confidence,
    },
    key_themes: keyThemes.length > 0 ? keyThemes : ['general'],
  };
}
