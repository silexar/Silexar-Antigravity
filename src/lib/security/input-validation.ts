/**
 * 🛡️ SILEXAR PULSE QUANTUM - OWASP INPUT VALIDATION
 *
 * Class-based OWASP input validator with named methods (.validateString /
 * .validateEmail / .validatePassword / .validateObject / .getStatistics).
 * Used by security-tests.ts and validate-sprint1-security.ts.
 *
 * DIFFERENT FROM input-validator.ts — that file is the production-grade singleton
 * (EnterpriseInputValidator) with Zod schema support (.validateWithSchema /
 * .validateJSON / .validateUUID) and authSchemas exports.
 * This file intentionally kept separate because .validateObject() and
 * .getStatistics() are used by test/validation scripts and are absent from
 * input-validator.ts.
 *
 * @version 2040.1.0
 * @classification TIER 0 - SECURITY FOUNDATION
 */

import { qualityLogger } from '../quality/quality-logger';
import { auditLogger, AuditEventType, AuditSeverity } from './audit-logger';

// 🎯 Validation Result
interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: unknown; // string for text fields, number for numeric, Date for dates
  errors: string[];
  warnings: string[];
  securityViolations: string[];
}

// 🔧 Validation Options
interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: unknown[];
  sanitize?: boolean;
  strictMode?: boolean;
}

// 🚨 Security Patterns (OWASP)
const SECURITY_PATTERNS = {
  // SQL Injection patterns
  SQL_INJECTION: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\bOR\b|\bAND\b).*?(\b=\b|\bLIKE\b)/gi
  ],
  
  // XSS patterns
  XSS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<.*?(\bon\w+\s*=|javascript:|data:)/gi
  ],
  
  // Command Injection patterns
  COMMAND_INJECTION: [
    /[;&|`$(){}[\]]/g,
    /\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ping|wget|curl|nc|telnet|ssh|ftp)\b/gi
  ],
  
  // Path Traversal patterns
  PATH_TRAVERSAL: [
    /\.\.[\/\\]/g,
    /[\/\\]\.\.[\/\\]/g,
    /%2e%2e[\/\\]/gi,
    /\.\.%2f/gi
  ],
  
  // LDAP Injection patterns
  LDAP_INJECTION: [
    /[()&|!]/g,
    /\*.*\*/g
  ],
  
  // NoSQL Injection patterns
  NOSQL_INJECTION: [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$lt/gi,
    /\$regex/gi
  ]
};

/**
 * 🛡️ OWASP Input Validator Class
 */
export class InputValidator {
  private validatorId: string;

  constructor() {
    this.validatorId = `validator_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    qualityLogger.info('OWASP Input Validator initialized', 'INPUT_VALIDATOR', {
      validatorId: this.validatorId,
      securityPatterns: Object.keys(SECURITY_PATTERNS).length
    });
  }

  /**
   * 🔍 Validate String Input
   * @param value - Input value to validate
   * @param options - Validation options
   * @param fieldName - Field name for logging
   * @returns Validation result
   */
  validateString(value: unknown, options: ValidationOptions = {}, fieldName: string = 'unknown'): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityViolations: []
    };

    // Convert to string
    const stringValue = String(value || '');
    result.sanitizedValue = stringValue;

    // Required validation
    if (options.required && (!stringValue || stringValue.trim().length === 0)) {
      result.isValid = false;
      result.errors.push(`${fieldName} is required`);
      return result;
    }

    // Skip further validation if empty and not required
    if (!stringValue && !options.required) {
      return result;
    }

    // Length validation
    if (options.minLength && stringValue.length < options.minLength) {
      result.isValid = false;
      result.errors.push(`${fieldName} must be at least ${options.minLength} characters`);
    }

    if (options.maxLength && stringValue.length > options.maxLength) {
      result.isValid = false;
      result.errors.push(`${fieldName} must not exceed ${options.maxLength} characters`);
    }

    // Pattern validation
    if (options.pattern && !options.pattern.test(stringValue)) {
      result.isValid = false;
      result.errors.push(`${fieldName} format is invalid`);
    }

    // Allowed values validation
    if (options.allowedValues && !options.allowedValues.includes(stringValue)) {
      result.isValid = false;
      result.errors.push(`${fieldName} contains invalid value`);
    }

    // Security validation (OWASP)
    const securityCheck = this.checkSecurityViolations(stringValue, fieldName);
    if (securityCheck.violations.length > 0) {
      result.securityViolations = securityCheck.violations;
      if (options.strictMode) {
        result.isValid = false;
        result.errors.push(...securityCheck.violations);
      } else {
        result.warnings.push(...securityCheck.violations);
      }
    }

    // Sanitization
    if (options.sanitize) {
      result.sanitizedValue = this.sanitizeInput(stringValue);
    }

    return result;
  }

  /**
   * 📧 Validate Email
   * @param email - Email to validate
   * @param required - Is required
   * @returns Validation result
   */
  validateEmail(email: unknown, required: boolean = false): ValidationResult {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    return this.validateString(email, {
      required,
      pattern: emailPattern,
      maxLength: 254,
      sanitize: true,
      strictMode: true
    }, 'email');
  }

  /**
   * 🔢 Validate Number
   * @param value - Number to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @param required - Is required
   * @returns Validation result
   */
  validateNumber(value: unknown, min?: number, max?: number, required: boolean = false): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityViolations: []
    };

    // Required validation
    if (required && (value === null || value === undefined || value === '')) {
      result.isValid = false;
      result.errors.push('Number is required');
      return result;
    }

    // Skip if empty and not required
    if ((value === null || value === undefined || value === '') && !required) {
      result.sanitizedValue = null;
      return result;
    }

    // Convert to number
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      result.isValid = false;
      result.errors.push('Invalid number format');
      return result;
    }

    result.sanitizedValue = numValue;

    // Range validation
    if (min !== undefined && numValue < min) {
      result.isValid = false;
      result.errors.push(`Number must be at least ${min}`);
    }

    if (max !== undefined && numValue > max) {
      result.isValid = false;
      result.errors.push(`Number must not exceed ${max}`);
    }

    return result;
  }

  /**
   * 📅 Validate Date
   * @param value - Date to validate
   * @param required - Is required
   * @returns Validation result
   */
  validateDate(value: unknown, required: boolean = false): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityViolations: []
    };

    // Required validation
    if (required && (!value || value === '')) {
      result.isValid = false;
      result.errors.push('Date is required');
      return result;
    }

    // Skip if empty and not required
    if ((!value || value === '') && !required) {
      result.sanitizedValue = null;
      return result;
    }

    // Try to parse date — narrow unknown to string | number for Date constructor
    const dateValue = new Date(value as string | number);
    
    if (isNaN(dateValue.getTime())) {
      result.isValid = false;
      result.errors.push('Invalid date format');
      return result;
    }

    result.sanitizedValue = dateValue;
    return result;
  }

  /**
   * 🔐 Validate Password
   * @param password - Password to validate
   * @param required - Is required
   * @returns Validation result
   */
  validatePassword(password: unknown, required: boolean = true): ValidationResult {
    const result = this.validateString(password, {
      required,
      minLength: 8,
      maxLength: 128,
      strictMode: true
    }, 'password');

    if (!result.isValid) return result;

    const passwordStr = String(password || '');
    
    // Password strength validation
    const hasLowerCase = /[a-z]/.test(passwordStr);
    const hasUpperCase = /[A-Z]/.test(passwordStr);
    const hasNumbers = /\d/.test(passwordStr);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(passwordStr);

    if (!hasLowerCase) {
      result.warnings.push('Password should contain lowercase letters');
    }

    if (!hasUpperCase) {
      result.warnings.push('Password should contain uppercase letters');
    }

    if (!hasNumbers) {
      result.warnings.push('Password should contain numbers');
    }

    if (!hasSpecialChars) {
      result.warnings.push('Password should contain special characters');
    }

    // Strong password requirement
    const strongPassword = hasLowerCase && hasUpperCase && hasNumbers && hasSpecialChars;
    if (!strongPassword) {
      result.warnings.push('Password is not strong enough');
    }

    return result;
  }

  /**
   * 🌐 Validate URL
   * @param url - URL to validate
   * @param required - Is required
   * @returns Validation result
   */
  validateUrl(url: unknown, required: boolean = false): ValidationResult {
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    
    return this.validateString(url, {
      required,
      pattern: urlPattern,
      maxLength: 2048,
      sanitize: true,
      strictMode: true
    }, 'url');
  }

  /**
   * 🚨 Check Security Violations
   * @param value - Value to check
   * @param fieldName - Field name for logging
   * @returns Security check result
   */
  private checkSecurityViolations(value: string, fieldName: string): {
    violations: string[];
    detectedPatterns: string[];
  } {
    const violations: string[] = [];
    const detectedPatterns: string[] = [];

    // Check each security pattern category
    Object.entries(SECURITY_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.test(value)) {
          const violation = `Potential ${category.replace('_', ' ').toLowerCase()} detected in ${fieldName}`;
          violations.push(violation);
          detectedPatterns.push(category);

          // Log security violation
          auditLogger.logEvent({
            eventType: AuditEventType.SECURITY_VIOLATION,
            severity: AuditSeverity.HIGH,
            resource: fieldName,
            action: 'INPUT_VALIDATION',
            details: {
              violationType: category,
              fieldName,
              pattern: pattern.toString(),
              value: value.substring(0, 100) // Log first 100 chars only
            },
            success: false,
            errorMessage: violation
          });
        }
      });
    });

    return { violations, detectedPatterns };
  }

  /**
   * 🧹 Sanitize Input
   * @param value - Value to sanitize
   * @returns Sanitized value
   */
  private sanitizeInput(value: string): string {
    let sanitized = value;

    // HTML encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * 📋 Validate Object
   * @param obj - Object to validate
   * @param schema - Validation schema
   * @returns Validation result
   */
  validateObject(obj: Record<string, unknown>, schema: Record<string, ValidationOptions>): {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
    securityViolations: Record<string, string[]>;
    sanitizedData: Record<string, unknown>;
  } {
    const result = {
      isValid: true,
      errors: {} as Record<string, string[]>,
      warnings: {} as Record<string, string[]>,
      securityViolations: {} as Record<string, string[]>,
      sanitizedData: {} as Record<string, unknown>
    };

    Object.entries(schema).forEach(([fieldName, options]) => {
      const fieldValue = obj?.[fieldName];
      const validation = this.validateString(fieldValue, options, fieldName);

      if (!validation.isValid) {
        result.isValid = false;
      }

      if (validation.errors.length > 0) {
        result.errors[fieldName] = validation.errors;
      }

      if (validation.warnings.length > 0) {
        result.warnings[fieldName] = validation.warnings;
      }

      if (validation.securityViolations.length > 0) {
        result.securityViolations[fieldName] = validation.securityViolations;
      }

      result.sanitizedData[fieldName] = validation.sanitizedValue;
    });

    return result;
  }

  /**
   * 📊 Get Validation Statistics
   * @returns Validation statistics
   */
  getStatistics(): {
    validatorId: string;
    securityPatternsCount: number;
    supportedValidations: string[];
  } {
    return {
      validatorId: this.validatorId,
      securityPatternsCount: Object.keys(SECURITY_PATTERNS).length,
      supportedValidations: [
        'string', 'email', 'number', 'date', 'password', 'url', 'object'
      ]
    };
  }
}

// 🛡️ Global Input Validator Instance
export const inputValidator = new InputValidator();

// 🔧 Utility Functions
export function validateString(value: unknown, options?: ValidationOptions, fieldName?: string): ValidationResult {
  return inputValidator.validateString(value, options, fieldName);
}

export function validateEmail(email: unknown, required?: boolean): ValidationResult {
  return inputValidator.validateEmail(email, required);
}

export function validateNumber(value: unknown, min?: number, max?: number, required?: boolean): ValidationResult {
  return inputValidator.validateNumber(value, min, max, required);
}

export function validatePassword(password: unknown, required?: boolean): ValidationResult {
  return inputValidator.validatePassword(password, required);
}

export function validateUrl(url: unknown, required?: boolean): ValidationResult {
  return inputValidator.validateUrl(url, required);
}

export function sanitizeInput(value: string): string {
  return inputValidator['sanitizeInput'](value);
}

// ── Minimal Express-compatible types (avoids `any`) ──────────────────────────
interface RequestLike { body: Record<string, unknown>; path: string; validation?: unknown; sanitizedBody?: unknown }
interface ResponseLike { status(code: number): { json(data: unknown): void } }
type NextFn = () => void

// 🎯 Express/Next.js Middleware
export function createValidationMiddleware(schema: Record<string, ValidationOptions>) {
  return (req: RequestLike, res: ResponseLike, next: NextFn) => {
    try {
      const validation = inputValidator.validateObject(req.body, schema);

      // Add validation results to request
      req.validation = validation;
      req.sanitizedBody = validation.sanitizedData;

      // Block request if validation fails in strict mode
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          errors: validation.errors,
          warnings: validation.warnings,
          securityViolations: validation.securityViolations
        });
      }

      // Log security violations even if not blocking
      if (Object.keys(validation.securityViolations).length > 0) {
        qualityLogger.warn('Security violations detected in request', 'INPUT_VALIDATION', {
          violations: validation.securityViolations,
          endpoint: req.path
        });
      }

      next();
    } catch (error) {
      qualityLogger.error('Validation middleware error', 'INPUT_VALIDATION', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(); // Continue on error to avoid blocking legitimate requests
    }
  };
}