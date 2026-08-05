/**
 * Super Wash Performance - Security & Sanitization Utilities
 */

/**
 * Sanitizes text inputs to prevent Cross-Site Scripting (XSS) attacks.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * In-memory Client Rate Limiter to prevent Brute Force or Spamming on forms.
 */
const attemptStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (actionKey: string, maxAttempts = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const record = attemptStore.get(actionKey);

  if (!record || now > record.resetTime) {
    attemptStore.set(actionKey, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
};
