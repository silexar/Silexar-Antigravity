/**
 * UTILITY: ENTERPRISE INPUT SANITIZER & VALIDATOR
 * 
 * @description Sanitización de inputs para prevenir XSS, SQL injection,
 * y otros vectores de ataque. Rate-limiting helper para action buttons.
 * 
 * ⚠️ PRODUCTION: Complement with server-side validation (never trust client).
 */

/* ─── XSS SANITIZER ──────────────────────────────────────────── */

const DANGEROUS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
  /on\w+\s*=\s*"[^"]*"/gi,
  /on\w+\s*=\s*'[^']*'/gi,
  /javascript\s*:/gi,
  /data\s*:[^,]*base64/gi,
];

/**
 * Strip dangerous HTML/script patterns from user input.
 * For display-only; server must re-validate.
 */
export function sanitizeInput(raw: string): string {
  let clean = raw;
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Also escape HTML entities for safe rendering
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return clean.trim();
}

/* ─── FIELD VALIDATORS ────────────────────────────────────────── */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email)
    ? { valid: true }
    : { valid: false, error: 'Invalid email format' };
}

export function validateCurrency(value: string): ValidationResult {
  const num = parseFloat(value.replace(/[,$]/g, ''));
  if (isNaN(num)) return { valid: false, error: 'Must be a number' };
  if (num < 0) return { valid: false, error: 'Cannot be negative' };
  if (num > 999999999) return { valid: false, error: 'Exceeds maximum value' };
  return { valid: true };
}

export function validatePercentage(value: string): ValidationResult {
  const num = parseFloat(value);
  if (isNaN(num)) return { valid: false, error: 'Must be a number' };
  if (num < 0 || num > 100) return { valid: false, error: 'Must be 0-100' };
  return { valid: true };
}

/* ─── DEBOUNCE / THROTTLE ─────────────────────────────────────── */

/**
 * Debounce: Delay execution until after `wait` ms of inactivity.
 * Useful for search inputs, filter changes.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * Throttle: Execute at most once per `limit` ms.
 * Useful for rate-limiting button clicks, API calls.
 */
export function throttle<T extends (...args: unknown[]) => void>(fn: T, limit: number): T {
  let inThrottle = false;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  }) as T;
}

/* ─── RATE LIMITER (per action) ───────────────────────────────── */

const actionTimestamps: Record<string, number[]> = {};

/**
 * Check if an action should be rate-limited.
 * @param actionId Unique identifier for the action
 * @param maxPerMinute Maximum allowed executions per minute
 * @returns true if the action is allowed, false if rate-limited
 */
export function checkRateLimit(actionId: string, maxPerMinute: number = 10): boolean {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  if (!actionTimestamps[actionId]) {
    actionTimestamps[actionId] = [];
  }

  // Clean old entries
  actionTimestamps[actionId] = actionTimestamps[actionId].filter(t => t > oneMinuteAgo);

  if (actionTimestamps[actionId].length >= maxPerMinute) {
    return false; // Rate limited
  }

  actionTimestamps[actionId].push(now);
  return true;
}
