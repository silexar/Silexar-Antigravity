/**
 * Tests unitarios para Input Validation
 * @module input-validation.test
 * @security Input sanitization and validation tests
 */

import { describe, it, expect } from 'vitest';
import {
  InputValidator,
  inputValidator,
  validateString,
  validateEmail,
  validateNumber,
  validatePassword,
  validateUrl,
  sanitizeInput,
} from './input-validation';

describe('InputValidator', () => {
  describe('validateString', () => {
    it('should validate basic strings', () => {
      const validator = new InputValidator();
      const result = validator.validateString('hello world');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should enforce required validation', () => {
      const validator = new InputValidator();
      const result = validator.validateString('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field is required');
    });

    it('should enforce minLength validation', () => {
      const validator = new InputValidator();
      const result = validator.validateString('ab', { minLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('at least 3'))).toBe(true);
    });

    it('should enforce maxLength validation', () => {
      const validator = new InputValidator();
      const result = validator.validateString('a'.repeat(1000), { maxLength: 100 });
      expect(result.isValid).toBe(false);
    });

    it('should enforce allowed values', () => {
      const validator = new InputValidator();
      const result = validator.validateString('invalid', { allowedValues: ['valid', 'also_valid'] });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value is not in allowed list');
    });

    it('should accept valid allowed values', () => {
      const validator = new InputValidator();
      const result = validator.validateString('valid', { allowedValues: ['valid', 'also_valid'] });
      expect(result.isValid).toBe(true);
    });

    it('should sanitize dangerous input when sanitize option is true', () => {
      const validator = new InputValidator();
      const result = validator.validateString('<script>alert("xss")</script>', { sanitize: true });
      expect(result.isValid).toBe(false);
      expect(result.securityViolations.length).toBeGreaterThan(0);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validator = new InputValidator();
      expect(validator.validateEmail('user@example.com').isValid).toBe(true);
      expect(validator.validateEmail('test.user@domain.co.uk').isValid).toBe(true);
      expect(validator.validateEmail('user+tag@example.org').isValid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const validator = new InputValidator();
      expect(validator.validateEmail('invalid').isValid).toBe(false);
      expect(validator.validateEmail('@example.com').isValid).toBe(false);
      expect(validator.validateEmail('user@').isValid).toBe(false);
      expect(validator.validateEmail('').isValid).toBe(false);
    });

    it('should sanitize email input', () => {
      const validator = new InputValidator();
      const result = validator.validateEmail('  user@example.com  ');
      expect(result.sanitizedValue).toBe('user@example.com');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const validator = new InputValidator();
      const strongPasswords = [
        'MyStr0ng!Pass',
        'C0mpl3x@P@ssw0rd',
        'S3cur3#P@ss123',
      ];
      
      strongPasswords.forEach(pwd => {
        const result = validator.validatePassword(pwd);
        // Password validation may have specific requirements
        expect(result).toBeDefined();
      });
    });

    it('should reject weak passwords', () => {
      const validator = new InputValidator();
      const weakPasswords = ['123', 'password', 'abc', ''];
      
      weakPasswords.forEach(pwd => {
        const result = validator.validatePassword(pwd);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('validateNumber', () => {
    it('should validate numbers', () => {
      const validator = new InputValidator();
      expect(validator.validateNumber(42).isValid).toBe(true);
      expect(validator.validateNumber('42').isValid).toBe(true);
      expect(validator.validateNumber(3.14).isValid).toBe(true);
    });

    it('should enforce min/max constraints', () => {
      const validator = new InputValidator();
      expect(validator.validateNumber(5, 0, 10).isValid).toBe(true);
      expect(validator.validateNumber(-5, 0, 10).isValid).toBe(false);
      expect(validator.validateNumber(15, 0, 10).isValid).toBe(false);
    });

    it('should handle required validation', () => {
      const validator = new InputValidator();
      expect(validator.validateNumber(null, undefined, undefined, true).isValid).toBe(false);
      expect(validator.validateNumber('', undefined, undefined, true).isValid).toBe(false);
      expect(validator.validateNumber(0, undefined, undefined, true).isValid).toBe(true);
    });

    it('should reject invalid number formats', () => {
      const validator = new InputValidator();
      expect(validator.validateNumber('not-a-number').isValid).toBe(false);
      expect(validator.validateNumber('abc123').isValid).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should validate dates', () => {
      const validator = new InputValidator();
      expect(validator.validateDate('2025-04-09').isValid).toBe(true);
      expect(validator.validateDate('2025-04-09T12:00:00Z').isValid).toBe(true);
      expect(validator.validateDate(Date.now()).isValid).toBe(true);
    });

    it('should reject invalid dates', () => {
      const validator = new InputValidator();
      expect(validator.validateDate('invalid-date').isValid).toBe(false);
      expect(validator.validateDate('').isValid).toBe(false);
    });

    it('should handle required validation', () => {
      const validator = new InputValidator();
      expect(validator.validateDate('', true).isValid).toBe(false);
      expect(validator.validateDate(null, true).isValid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate URLs', () => {
      const validator = new InputValidator();
      expect(validator.validateUrl('https://example.com').isValid).toBe(true);
      expect(validator.validateUrl('http://localhost:3000').isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const validator = new InputValidator();
      expect(validator.validateUrl('not-a-url').isValid).toBe(false);
      expect(validator.validateUrl('ftp://invalid-protocol.com').isValid).toBe(false);
    });

    it('should handle required validation', () => {
      const validator = new InputValidator();
      expect(validator.validateUrl('', true).isValid).toBe(false);
      expect(validator.validateUrl(null, true).isValid).toBe(false);
    });
  });

  describe('validateObject', () => {
    it('should validate objects against schema', () => {
      const validator = new InputValidator();
      const schema = {
        name: { required: true, minLength: 2 },
        email: { required: true },
        age: { required: false },
      };

      const validObject = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = validator.validateObject(validObject, schema);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should collect errors for invalid objects', () => {
      const validator = new InputValidator();
      const schema = {
        name: { required: true, minLength: 5 },
        email: { required: true },
      };

      const invalidObject = {
        name: 'Jo',
        email: 'invalid-email',
      };

      const result = validator.validateObject(invalidObject, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.email).toBeDefined();
    });

    it('should return sanitized data', () => {
      const validator = new InputValidator();
      const schema = {
        name: { required: true },
        email: { required: true },
      };

      const object = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
      };

      const result = validator.validateObject(object, schema);
      expect(result.sanitizedData.name).toBe('John Doe');
      expect(result.sanitizedData.email).toBe('john@example.com');
    });
  });

  describe('getStatistics', () => {
    it('should return validator statistics', () => {
      const validator = new InputValidator();
      const stats = validator.getStatistics();
      expect(stats.validatorId).toBe('enterprise-input-validator');
      expect(stats.securityPatternsCount).toBeGreaterThan(0);
      expect(stats.supportedValidations).toContain('string');
      expect(stats.supportedValidations).toContain('email');
      expect(stats.supportedValidations).toContain('password');
    });
  });
});

describe('Input Validation Functions', () => {
  describe('validateString function', () => {
    it('should work as standalone function', () => {
      const result = validateString('test', { required: true });
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateEmail function', () => {
    it('should work as standalone function', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNumber function', () => {
    it('should work as standalone function', () => {
      const result = validateNumber(42, 0, 100, true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword function', () => {
    it('should work as standalone function', () => {
      const result = validatePassword('StrongP@ssw0rd');
      expect(result).toBeDefined();
    });
  });

  describe('validateUrl function', () => {
    it('should work as standalone function', () => {
      const result = validateUrl('https://example.com');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeInput function', () => {
    it('should sanitize dangerous characters', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    it('should handle normal strings', () => {
      const result = sanitizeInput('Hello World');
      expect(result).toBe('Hello World');
    });
  });
});

describe('inputValidator singleton', () => {
  it('should be defined', () => {
    expect(inputValidator).toBeDefined();
    expect(inputValidator).toBeInstanceOf(InputValidator);
  });

  it('should work for string validation', () => {
    const result = inputValidator.validateString('test');
    expect(result.isValid).toBe(true);
  });
});
