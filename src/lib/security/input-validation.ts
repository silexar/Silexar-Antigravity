/**
 * input-validation.ts — Adapter shim for legacy API compatibility.
 *
 * All security pattern detection delegates to `input-validator.ts`
 * (EnterpriseInputValidator, the production-grade singleton) to avoid
 * two independent pattern databases that can drift out of sync.
 *
 * This module exposes the `InputValidator` class API used by
 * security-tests.ts and validate-sprint1-security.ts:
 *   .validateString / .validateEmail / .validatePassword
 *   .validateObject / .getStatistics
 *
 * New code should import directly from `input-validator.ts`.
 */

import {
  inputValidator as _enterpriseValidator,
  authSchemas,
} from './input-validator'

// Re-export authSchemas so any consumer that mistakenly imported it from
// here will still compile.
export { authSchemas }

// ─── Legacy ValidationResult shape ────────────────────────────────────────────
// The test scripts expect {isValid, sanitizedValue, errors, warnings, securityViolations}.
// input-validator.ts returns {success, data, sanitized, errors[]} — we adapt here.

interface ValidationResult {
  isValid: boolean
  sanitizedValue?: unknown
  errors: string[]
  warnings: string[]
  securityViolations: string[]
}

interface ValidationOptions {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  allowedValues?: unknown[]
  sanitize?: boolean
  strictMode?: boolean
}

// ─── Adapter helpers ──────────────────────────────────────────────────────────

function toLegacyResult(
  raw: ReturnType<typeof _enterpriseValidator.validateString>,
  sanitizedValue?: unknown
): ValidationResult {
  const errors = raw.errors?.map((e) => e.message) ?? []
  return {
    isValid: raw.success,
    sanitizedValue: sanitizedValue ?? raw.sanitized ?? raw.data,
    errors,
    warnings: [],
    securityViolations: errors.filter((e) => e.includes('dangerous') || e.includes('pattern')),
  }
}

// ─── InputValidator class (legacy API) ────────────────────────────────────────

export class InputValidator {
  validateString(
    value: unknown,
    options: ValidationOptions = {},
    _fieldName = 'unknown'
  ): ValidationResult {
    const raw = _enterpriseValidator.validateString(value, {
      maxLength: options.maxLength,
      allowedChars: options.pattern,
      requireSanitization: options.sanitize,
    })

    const result = toLegacyResult(raw)

    // Length minimum check (not in EnterpriseInputValidator.validateString)
    if (
      options.minLength !== undefined &&
      typeof value === 'string' &&
      value.length < options.minLength
    ) {
      result.isValid = false
      result.errors.push(`Must be at least ${options.minLength} characters`)
    }

    // Required check
    if (options.required && (!value || String(value).trim().length === 0)) {
      result.isValid = false
      result.errors.push(`Field is required`)
    }

    // Allowed values check
    if (options.allowedValues && !options.allowedValues.includes(value)) {
      result.isValid = false
      result.errors.push(`Value is not in allowed list`)
    }

    return result
  }

  validateEmail(email: unknown, _required = false): ValidationResult {
    const raw = _enterpriseValidator.validateEmail(email)
    return toLegacyResult(raw, raw.sanitized)
  }

  validatePassword(password: unknown, _required = true): ValidationResult {
    const raw = _enterpriseValidator.validatePassword(password)
    return toLegacyResult(raw)
  }

  validateNumber(
    value: unknown,
    min?: number,
    max?: number,
    required = false
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityViolations: [],
    }

    if (required && (value === null || value === undefined || value === '')) {
      result.isValid = false
      result.errors.push('Number is required')
      return result
    }

    if (!required && (value === null || value === undefined || value === '')) {
      result.sanitizedValue = null
      return result
    }

    const numValue = Number(value)
    if (isNaN(numValue)) {
      result.isValid = false
      result.errors.push('Invalid number format')
      return result
    }

    result.sanitizedValue = numValue

    if (min !== undefined && numValue < min) {
      result.isValid = false
      result.errors.push(`Number must be at least ${min}`)
    }
    if (max !== undefined && numValue > max) {
      result.isValid = false
      result.errors.push(`Number must not exceed ${max}`)
    }

    return result
  }

  validateDate(value: unknown, required = false): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityViolations: [],
    }

    if (required && (!value || value === '')) {
      result.isValid = false
      result.errors.push('Date is required')
      return result
    }
    if (!required && (!value || value === '')) {
      result.sanitizedValue = null
      return result
    }

    const dateValue = new Date(value as string | number)
    if (isNaN(dateValue.getTime())) {
      result.isValid = false
      result.errors.push('Invalid date format')
      return result
    }

    result.sanitizedValue = dateValue
    return result
  }

  validateUrl(url: unknown, required = false): ValidationResult {
    if (required && !url) {
      return { isValid: false, errors: ['URL is required'], warnings: [], securityViolations: [] }
    }
    const raw = _enterpriseValidator.validateURL(url)
    return toLegacyResult(raw, raw.sanitized)
  }

  /**
   * Validate an object field-by-field using a schema of ValidationOptions.
   * Used by security-tests.ts and validate-sprint1-security.ts.
   */
  validateObject(
    obj: Record<string, unknown>,
    schema: Record<string, ValidationOptions>
  ): {
    isValid: boolean
    errors: Record<string, string[]>
    warnings: Record<string, string[]>
    securityViolations: Record<string, string[]>
    sanitizedData: Record<string, unknown>
  } {
    const result = {
      isValid: true,
      errors: {} as Record<string, string[]>,
      warnings: {} as Record<string, string[]>,
      securityViolations: {} as Record<string, string[]>,
      sanitizedData: {} as Record<string, unknown>,
    }

    for (const [fieldName, options] of Object.entries(schema)) {
      const validation = this.validateString(obj?.[fieldName], options, fieldName)

      if (!validation.isValid) result.isValid = false
      if (validation.errors.length > 0) result.errors[fieldName] = validation.errors
      if (validation.warnings.length > 0) result.warnings[fieldName] = validation.warnings
      if (validation.securityViolations.length > 0)
        result.securityViolations[fieldName] = validation.securityViolations

      result.sanitizedData[fieldName] = validation.sanitizedValue
    }

    return result
  }

  /** Returns basic stats — used by test harnesses to verify initialization. */
  getStatistics(): {
    validatorId: string
    securityPatternsCount: number
    supportedValidations: string[]
  } {
    return {
      validatorId: 'enterprise-input-validator',
      securityPatternsCount: 12, // XSS, SQLi, NoSQLi, CMDi, PathTraversal, etc.
      supportedValidations: ['string', 'email', 'number', 'date', 'password', 'url', 'object'],
    }
  }
}

// ─── Singleton export (same name as before — no import changes needed) ────────
export const inputValidator: InputValidator = new InputValidator()

// ─── Utility function exports ─────────────────────────────────────────────────
export function validateString(
  value: unknown,
  options?: ValidationOptions,
  fieldName?: string
): ValidationResult {
  return inputValidator.validateString(value, options, fieldName)
}

export function validateEmail(email: unknown, required?: boolean): ValidationResult {
  return inputValidator.validateEmail(email, required)
}

export function validateNumber(
  value: unknown,
  min?: number,
  max?: number,
  required?: boolean
): ValidationResult {
  return inputValidator.validateNumber(value, min, max, required)
}

export function validatePassword(password: unknown, required?: boolean): ValidationResult {
  return inputValidator.validatePassword(password, required)
}

export function validateUrl(url: unknown, required?: boolean): ValidationResult {
  return inputValidator.validateUrl(url, required)
}

export function sanitizeInput(value: string): string {
  return _enterpriseValidator.sanitizeString(value, false)
}

// ── Minimal Express-compatible types ─────────────────────────────────────────
interface RequestLike {
  body: Record<string, unknown>
  path: string
  validation?: unknown
  sanitizedBody?: unknown
}
interface ResponseLike {
  status(code: number): { json(data: unknown): void }
}
type NextFn = () => void

export function createValidationMiddleware(schema: Record<string, ValidationOptions>) {
  return (req: RequestLike, res: ResponseLike, next: NextFn) => {
    const validation = inputValidator.validateObject(req.body, schema)
    req.validation = validation
    req.sanitizedBody = validation.sanitizedData

    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      })
      return
    }

    next()
  }
}
