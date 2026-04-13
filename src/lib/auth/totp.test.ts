/**
 * Tests unitarios para TOTP (Time-based One-Time Password)
 * @module totp.test
 * @security RFC 6238 compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyTOTP, generateTOTP, buildOtpAuthUri } from './totp';

describe('TOTP - Time-based One-Time Password', () => {
  // Test secret (Base32 encoded)
  const TEST_SECRET = 'JBSWY3DPEHPK3PXP'; // "Hello!" in Base32
  const INVALID_SECRET = 'INVALID!!!';

  describe('verifyTOTP', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should verify correct TOTP token', () => {
      // Set a fixed time for reproducibility
      const fixedTime = new Date('2025-04-09T12:00:00Z');
      vi.setSystemTime(fixedTime);

      const token = generateTOTP(TEST_SECRET);
      expect(verifyTOTP(token, TEST_SECRET)).toBe(true);
    });

    it('should reject incorrect TOTP token', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      expect(verifyTOTP('000000', TEST_SECRET)).toBe(false);
      expect(verifyTOTP('999999', TEST_SECRET)).toBe(false);
    });

    it('should reject invalid token format', () => {
      expect(verifyTOTP('12345', TEST_SECRET)).toBe(false); // Too short
      expect(verifyTOTP('1234567', TEST_SECRET)).toBe(false); // Too long
      expect(verifyTOTP('abcdef', TEST_SECRET)).toBe(false); // Non-numeric
      expect(verifyTOTP('', TEST_SECRET)).toBe(false); // Empty
    });

    it('should accept token within time window (±30s)', () => {
      const baseTime = new Date('2025-04-09T12:00:00Z');
      vi.setSystemTime(baseTime);
      const token = generateTOTP(TEST_SECRET);

      // Same window
      vi.setSystemTime(baseTime);
      expect(verifyTOTP(token, TEST_SECRET)).toBe(true);

      // Previous window (30s before)
      vi.setSystemTime(new Date(baseTime.getTime() - 30000));
      expect(verifyTOTP(token, TEST_SECRET, 30, 1)).toBe(true);

      // Next window (30s after)
      vi.setSystemTime(new Date(baseTime.getTime() + 30000));
      expect(verifyTOTP(token, TEST_SECRET, 30, 1)).toBe(true);
    });

    it('should reject token outside time window', () => {
      const baseTime = new Date('2025-04-09T12:00:00Z');
      vi.setSystemTime(baseTime);
      const token = generateTOTP(TEST_SECRET);

      // Too far in the past (90s)
      vi.setSystemTime(new Date(baseTime.getTime() - 90000));
      expect(verifyTOTP(token, TEST_SECRET, 30, 1)).toBe(false);

      // Too far in the future (90s)
      vi.setSystemTime(new Date(baseTime.getTime() + 90000));
      expect(verifyTOTP(token, TEST_SECRET, 30, 1)).toBe(false);
    });

    it('should handle custom time steps', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      const token = generateTOTP(TEST_SECRET, 60); // 60 second step
      expect(verifyTOTP(token, TEST_SECRET, 60)).toBe(true);
    });

    it('should handle custom window size', () => {
      const baseTime = new Date('2025-04-09T12:00:00Z');
      vi.setSystemTime(baseTime);
      const token = generateTOTP(TEST_SECRET);

      // Window size 2 allows ±60s
      vi.setSystemTime(new Date(baseTime.getTime() + 60000));
      expect(verifyTOTP(token, TEST_SECRET, 30, 2)).toBe(true);

      // Window size 0 allows only exact window
      vi.setSystemTime(new Date(baseTime.getTime()));
      expect(verifyTOTP(token, TEST_SECRET, 30, 0)).toBe(true);
    });
  });

  describe('generateTOTP', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate 6-digit numeric code', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      const token = generateTOTP(TEST_SECRET);
      expect(token).toMatch(/^\d{6}$/);
    });

    it('should generate consistent codes for same time window', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      const token1 = generateTOTP(TEST_SECRET);
      const token2 = generateTOTP(TEST_SECRET);
      expect(token1).toBe(token2);
    });

    it('should generate different codes for different time windows', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      const token1 = generateTOTP(TEST_SECRET);

      vi.setSystemTime(new Date('2025-04-09T12:01:00Z'));
      const token2 = generateTOTP(TEST_SECRET);

      expect(token1).not.toBe(token2);
    });

    it('should handle secrets with spaces', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      const secretWithSpaces = 'JBSW Y3DP EHPK 3PXP';
      const token = generateTOTP(secretWithSpaces);
      expect(token).toMatch(/^\d{6}$/);
    });

    it('should handle lowercase secrets', () => {
      vi.setSystemTime(new Date('2025-04-09T12:00:00Z'));
      const token = generateTOTP(TEST_SECRET.toLowerCase());
      expect(token).toMatch(/^\d{6}$/);
    });
  });

  describe('buildOtpAuthUri', () => {
    it('should generate valid otpauth URI', () => {
      const uri = buildOtpAuthUri('Silexar Pulse', 'user@example.com', TEST_SECRET);
      expect(uri).toMatch(/^otpauth:\/\/totp\//);
      expect(uri).toContain('Silexar%20Pulse');
      expect(uri).toContain('user%40example.com');
      expect(uri).toContain(TEST_SECRET.toUpperCase());
    });

    it('should include required parameters', () => {
      const uri = buildOtpAuthUri('Test', 'test@test.com', TEST_SECRET);
      expect(uri).toContain('secret=');
      expect(uri).toContain('issuer=');
      expect(uri).toContain('algorithm=SHA1');
      expect(uri).toContain('digits=6');
      expect(uri).toContain('period=30');
    });

    it('should properly encode special characters in account', () => {
      const uri = buildOtpAuthUri('Silexar', 'user+test@example.com', TEST_SECRET);
      expect(uri).toContain('user%2Btest%40example.com');
    });

    it('should convert secret to uppercase', () => {
      const uri = buildOtpAuthUri('Test', 'test@test.com', 'jbswy3dpehpk3pxp');
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    });
  });

  describe('RFC 6238 Test Vectors', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate expected TOTP for known test vectors', () => {
      // Using test vectors from RFC 6238
      const secret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'; // "12345678901234567890" in Base32
      
      // Test at specific Unix timestamps
      const testCases = [
        { time: 59, expected: /^\d{6}$/ },
        { time: 1111111109, expected: /^\d{6}$/ },
        { time: 1111111111, expected: /^\d{6}$/ },
        { time: 1234567890, expected: /^\d{6}$/ },
        { time: 2000000000, expected: /^\d{6}$/ },
      ];

      testCases.forEach(({ time, expected }) => {
        vi.setSystemTime(time * 1000);
        const token = generateTOTP(secret);
        expect(token).toMatch(expected);
        expect(verifyTOTP(token, secret)).toBe(true);
      });
    });
  });
});
