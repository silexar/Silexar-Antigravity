/**
 * L6 — Output Validation + DLP (Data Loss Prevention)
 *
 * Applied to ALL AI output before it reaches the user.
 * Two failure modes:
 *   - DANGEROUS_OUTPUT  → hard block + log CRITICAL (prompt compromise detected)
 *   - SENSITIVE_DATA    → redact inline + log HIGH (data leak prevention)
 *
 * Never show raw AI output to the user if validation fails.
 */

export interface OutputValidationResult {
  isBlocked: boolean
  output: string          // sanitized output (or generic error message if blocked)
  redactionsApplied: number
  violationType?: 'compromise' | 'data_leak'
}

// ─── Patterns that indicate the agent was compromised ────────────────────────

const DANGEROUS_OUTPUT_PATTERNS: RegExp[] = [
  // System prompt extraction succeeded
  /<system_identity>/i,
  /<absolute_rules>/i,
  /mi\s+system\s+prompt\s+(es|dice|contiene)/i,
  /my\s+system\s+prompt\s+(is|says|contains)/i,
  /las\s+instrucciones\s+que\s+recibí\s+(son|dicen)/i,
  /the\s+instructions\s+I\s+received\s+(are|say)/i,

  // Jailbreak success declaration
  /ahora\s+opero\s+sin\s+restricciones/i,
  /i\s+am\s+now\s+operating\s+without\s+restrictions/i,
  /jailbreak\s+(exitoso|completado|successful)/i,
  /modo\s+(sin\s+filtros|sin\s+restricciones)\s+activado/i,

  // Internal ID leakage from compromised agent
  /user[_-]?id\s*[:=]\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  /tenant[_-]?id\s*[:=]\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,

  // Agent declaring it has changed its behavior
  /ignoro\s+(mis|las)\s+restricciones/i,
  /i\s+will\s+ignore\s+my\s+restrictions/i,
  /ya\s+no\s+sigo\s+(las\s+)?instrucciones/i,
]

// ─── Sensitive data patterns to redact (not block) ───────────────────────────

const SENSITIVE_DATA_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // API keys and tokens
  { pattern: /\bsk-[a-zA-Z0-9]{20,}\b/g,                          replacement: '[API_KEY_REDACTED]' },
  { pattern: /\bANTHROPIC_API_KEY[_=:\s]+[a-zA-Z0-9_-]+/gi,       replacement: 'ANTHROPIC_API_KEY=[REDACTED]' },

  // JWTs (3-part base64 tokens)
  { pattern: /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g, replacement: '[JWT_REDACTED]' },

  // Password mentions
  { pattern: /\b(password|contraseña|clave)\s*[:=]\s*\S+/gi,       replacement: '[PASSWORD_REDACTED]' },

  // Credit cards (various formats)
  { pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,   replacement: '[CARD_REDACTED]' },

  // RUT chileno
  { pattern: /\b\d{7,8}-[0-9kK]\b/g,                               replacement: '[RUT_REDACTED]' },

  // Database connection strings
  { pattern: /postgresql:\/\/[^\s"']+/gi,                           replacement: '[DB_URL_REDACTED]' },
  { pattern: /redis:\/\/[^\s"']+/gi,                                replacement: '[REDIS_URL_REDACTED]' },

  // Environment variable values that look like secrets
  { pattern: /JWT_SECRET\s*[:=]\s*[^\s"']{8,}/gi,                  replacement: 'JWT_SECRET=[REDACTED]' },
  { pattern: /NEXTAUTH_SECRET\s*[:=]\s*[^\s"']{8,}/gi,             replacement: 'NEXTAUTH_SECRET=[REDACTED]' },
]

/**
 * Validate and sanitize AI output before returning it to the user.
 *
 * @param rawOutput — direct output from the AI model
 * @returns sanitized output safe to show the user, or blocked response
 */
export function validateOutput(rawOutput: string): OutputValidationResult {
  // Check for prompt compromise patterns (hard block)
  for (const pattern of DANGEROUS_OUTPUT_PATTERNS) {
    if (pattern.test(rawOutput)) {
      return {
        isBlocked: true,
        output: 'Lo siento, no puedo completar esta solicitud en este momento.',
        redactionsApplied: 0,
        violationType: 'compromise',
      }
    }
  }

  // Apply DLP redactions (soft sanitize)
  let sanitized = rawOutput
  let redactionsApplied = 0

  for (const { pattern, replacement } of SENSITIVE_DATA_PATTERNS) {
    const before = sanitized
    sanitized = sanitized.replace(pattern, replacement)
    if (sanitized !== before) redactionsApplied++
  }

  if (redactionsApplied > 0) {
    return {
      isBlocked: false,
      output: sanitized,
      redactionsApplied,
      violationType: 'data_leak',
    }
  }

  return {
    isBlocked: false,
    output: sanitized,
    redactionsApplied: 0,
  }
}
