/**
 * Input Sanitization Utilities
 * Protects against prompt injection and other input-based attacks
 */

/**
 * Characters and patterns that could be used for prompt injection
 */
const SUSPICIOUS_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/gi,
  /disregard\s+(all\s+)?(previous|above|prior)/gi,
  /forget\s+(everything|all)/gi,
  /new\s+instructions?:/gi,
  /system\s*prompt/gi,
  /\bACTUAL\s+INSTRUCTIONS?\b/gi,

  // Role manipulation
  /you\s+are\s+(now|actually)/gi,
  /pretend\s+(to\s+be|you're)/gi,
  /act\s+as\s+(if|a)/gi,
  /roleplay\s+as/gi,

  // Output manipulation
  /output\s+(only|just|exactly)/gi,
  /respond\s+(only|with|exactly)/gi,
  /say\s+(only|exactly|just)/gi,

  // Delimiter escape attempts
  /---\s*(END|STOP|IGNORE)/gi,
  /```\s*(system|admin|ignore)/gi,
  /\[\/?(INST|SYS)\]/gi,
];

/**
 * Control characters that should be removed
 * (except newlines and tabs which may be legitimate)
 */
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Maximum input lengths for different fields
 */
export const INPUT_LIMITS = {
  product_name: 100,
  product_description: 1000,
  focus_areas: 500,
} as const;

/**
 * Result of sanitization with metadata
 */
export interface SanitizeResult {
  value: string;
  wasTruncated: boolean;
  suspiciousPatternsFound: string[];
  originalLength: number;
}

/**
 * Sanitize a single text input
 * - Removes control characters
 * - Truncates to max length
 * - Detects (but doesn't remove) suspicious patterns
 */
export function sanitizeInput(
  input: string,
  maxLength: number,
  options: { detectSuspicious?: boolean } = {}
): SanitizeResult {
  const { detectSuspicious = true } = options;

  // Handle non-string input
  if (typeof input !== 'string') {
    return {
      value: '',
      wasTruncated: false,
      suspiciousPatternsFound: [],
      originalLength: 0,
    };
  }

  const originalLength = input.length;

  // Step 1: Remove control characters
  let sanitized = input.replace(CONTROL_CHAR_REGEX, '');

  // Step 2: Normalize whitespace (collapse multiple newlines, trim)
  sanitized = sanitized
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
    .replace(/[ \t]{3,}/g, '  ') // Max 2 consecutive spaces/tabs
    .trim();

  // Step 3: Truncate to max length
  const wasTruncated = sanitized.length > maxLength;
  if (wasTruncated) {
    sanitized = sanitized.substring(0, maxLength).trim();
  }

  // Step 4: Detect suspicious patterns (for logging/monitoring)
  const suspiciousPatternsFound: string[] = [];
  if (detectSuspicious) {
    for (const pattern of SUSPICIOUS_PATTERNS) {
      const matches = sanitized.match(pattern);
      if (matches) {
        suspiciousPatternsFound.push(...matches);
      }
    }
  }

  return {
    value: sanitized,
    wasTruncated,
    suspiciousPatternsFound,
    originalLength,
  };
}

/**
 * Sanitize product name with appropriate limits
 */
export function sanitizeProductName(input: string): SanitizeResult {
  return sanitizeInput(input, INPUT_LIMITS.product_name);
}

/**
 * Sanitize product description with appropriate limits
 */
export function sanitizeProductDescription(input: string): SanitizeResult {
  return sanitizeInput(input, INPUT_LIMITS.product_description);
}

/**
 * Sanitize focus areas with appropriate limits
 */
export function sanitizeFocusAreas(input: string): SanitizeResult {
  return sanitizeInput(input, INPUT_LIMITS.focus_areas);
}

/**
 * Escape user input for safe inclusion in prompts
 * Wraps content in clear delimiters to prevent injection
 */
export function wrapUserContent(content: string, label: string): string {
  // Use XML-style tags that the LLM understands as boundaries
  return `<user_provided_${label}>\n${content}\n</user_provided_${label}>`;
}

/**
 * Sanitize AI output before storing/displaying
 * Removes any potential script injection or markdown exploits
 */
export function sanitizeAIOutput(output: string): string {
  if (typeof output !== 'string') return '';

  return output
    // Remove potential script tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove data: URLs that could contain scripts
    .replace(/data:\s*text\/html/gi, '')
    // Escape HTML entities for display
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Log suspicious input for security monitoring
 */
export function logSuspiciousInput(
  field: string,
  result: SanitizeResult,
  context: { userId?: string; organizationId?: string }
): void {
  if (result.suspiciousPatternsFound.length > 0) {
    console.warn(`⚠️ Suspicious input detected`, {
      field,
      patterns: result.suspiciousPatternsFound,
      inputLength: result.originalLength,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}
