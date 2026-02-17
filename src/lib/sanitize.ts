/**
 * Input Sanitization Utilities
 * Prevents XSS, SQL injection, and other injection attacks at the application boundary
 */

/**
 * Strip HTML tags from a string to prevent XSS
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters for safe rendering
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize a string for safe database storage and display
 * - Trims whitespace
 * - Removes null bytes
 * - Strips HTML tags
 * - Limits length
 */
export function sanitizeString(input: string, maxLength = 10000): string {
  return stripHtml(input)
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 320);
}

/**
 * Sanitize a URL — only allow http/https protocols
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Recursively sanitize all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T, maxStringLength = 10000): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value, maxStringLength);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item, maxStringLength)
          : item && typeof item === 'object'
            ? sanitizeObject(item as Record<string, unknown>, maxStringLength)
            : item
      );
    } else if (value && typeof value === 'object') {
      result[key] = sanitizeObject(value as Record<string, unknown>, maxStringLength);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Check if a string contains potential injection patterns
 */
export function hasSuspiciousContent(input: string): boolean {
  const patterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:\s*text\/html/i,
    /vbscript:/i,
  ];
  return patterns.some((pattern) => pattern.test(input));
}
