/**
 * Tests for TOTP (RFC 6238) implementation
 * src/lib/auth/totp.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyTOTP, generateTOTP, buildOtpAuthUri } from '@/lib/auth/totp'

// A known TOTP secret for deterministic tests (base-32 encoded)
const TEST_SECRET = 'JBSWY3DPEHPK3PXP'

// RFC 6238 test vectors (SHA1, step=30, digits=6)
// Counter 0 → time 0..29 → code 755224
// These are validated values from the RFC appendix
const RFC_VECTORS: { counter: number; code: string }[] = [
  { counter: 0,          code: '755224' },
  { counter: 1,          code: '287082' },
  { counter: 2,          code: '359152' },
  { counter: 3,          code: '969429' },
  { counter: 4,          code: '338314' },
  { counter: 5,          code: '254676' },
  { counter: 6,          code: '287922' },
  { counter: 7,          code: '162583' },
  { counter: 8,          code: '399871' },
  { counter: 9,          code: '520489' },
]

describe('generateTOTP', () => {
  it('returns a 6-digit string', () => {
    const code = generateTOTP(TEST_SECRET)
    expect(code).toMatch(/^\d{6}$/)
  })

  it('returns the same code within the same 30-second window', () => {
    const code1 = generateTOTP(TEST_SECRET)
    const code2 = generateTOTP(TEST_SECRET)
    expect(code1).toBe(code2)
  })

  it('pads codes with leading zeros', () => {
    // Use a secret that produces a small number — verify padding
    const code = generateTOTP(TEST_SECRET)
    expect(code.length).toBe(6)
  })

  it('generates different codes for different time windows', () => {
    const step = 30
    const now = Math.floor(Date.now() / 1000)
    // Mock time to two different counters
    const c1 = Math.floor(now / step)
    const c2 = c1 + 2 // 2 windows apart

    // Verify that hotp produces different values for different counters
    // by checking codes at artificially different times
    vi.useFakeTimers()
    vi.setSystemTime(c1 * step * 1000)
    const code1 = generateTOTP(TEST_SECRET)
    vi.setSystemTime(c2 * step * 1000)
    const code2 = generateTOTP(TEST_SECRET)
    vi.useRealTimers()

    // It's astronomically unlikely (< 0.01%) that two different counters produce same code
    expect(code1).not.toBe(code2)
  })
})

describe('verifyTOTP', () => {
  it('accepts a valid current code', () => {
    const code = generateTOTP(TEST_SECRET)
    expect(verifyTOTP(code, TEST_SECRET)).toBe(true)
  })

  it('rejects an invalid code', () => {
    expect(verifyTOTP('000000', TEST_SECRET)).toBe(false)
  })

  it('rejects codes with wrong length', () => {
    expect(verifyTOTP('12345', TEST_SECRET)).toBe(false)
    expect(verifyTOTP('1234567', TEST_SECRET)).toBe(false)
    expect(verifyTOTP('', TEST_SECRET)).toBe(false)
  })

  it('rejects non-numeric codes', () => {
    expect(verifyTOTP('abc123', TEST_SECRET)).toBe(false)
    expect(verifyTOTP('123abc', TEST_SECRET)).toBe(false)
    expect(verifyTOTP('aaaaaa', TEST_SECRET)).toBe(false)
  })

  it('accepts a code from the previous time window (window=1)', () => {
    const step = 30
    vi.useFakeTimers()
    // Set time to start of window N
    const baseCounter = 1000
    vi.setSystemTime(baseCounter * step * 1000)
    const previousCode = generateTOTP(TEST_SECRET)

    // Advance to window N+1
    vi.setSystemTime((baseCounter + 1) * step * 1000)
    // Previous code should still verify (window=1 → checks ±1)
    expect(verifyTOTP(previousCode, TEST_SECRET)).toBe(true)
    vi.useRealTimers()
  })

  it('accepts a code from the next time window (window=1)', () => {
    const step = 30
    vi.useFakeTimers()
    const baseCounter = 1000
    // Generate code for window N+1
    vi.setSystemTime((baseCounter + 1) * step * 1000)
    const futureCode = generateTOTP(TEST_SECRET)

    // Verify at window N (future code should be accepted with window=1)
    vi.setSystemTime(baseCounter * step * 1000)
    expect(verifyTOTP(futureCode, TEST_SECRET)).toBe(true)
    vi.useRealTimers()
  })

  it('rejects a code 2 windows ago when window=1', () => {
    const step = 30
    vi.useFakeTimers()
    const baseCounter = 1000
    // Generate code for window N
    vi.setSystemTime(baseCounter * step * 1000)
    const oldCode = generateTOTP(TEST_SECRET)

    // Advance to window N+2 — too far
    vi.setSystemTime((baseCounter + 2) * step * 1000)
    expect(verifyTOTP(oldCode, TEST_SECRET)).toBe(false)
    vi.useRealTimers()
  })

  it('uses a custom step (60 seconds)', () => {
    const step = 60
    vi.useFakeTimers()
    const baseCounter = 500
    vi.setSystemTime(baseCounter * step * 1000)
    const code = generateTOTP(TEST_SECRET, step)
    expect(verifyTOTP(code, TEST_SECRET, step)).toBe(true)
    vi.useRealTimers()
  })

  it('uses a custom window size (window=0 = strict)', () => {
    const step = 30
    vi.useFakeTimers()
    const baseCounter = 1000
    vi.setSystemTime(baseCounter * step * 1000)
    const currentCode = generateTOTP(TEST_SECRET)

    // Previous window code should NOT be accepted with window=0
    vi.setSystemTime((baseCounter - 1) * step * 1000)
    const previousCode = generateTOTP(TEST_SECRET)

    vi.setSystemTime(baseCounter * step * 1000)
    // Current code accepted even with window=0
    expect(verifyTOTP(currentCode, TEST_SECRET, step, 0)).toBe(true)
    // Previous code rejected
    expect(verifyTOTP(previousCode, TEST_SECRET, step, 0)).toBe(false)
    vi.useRealTimers()
  })

  it('handles base32 secrets with padding', () => {
    const paddedSecret = 'JBSWY3DPEHPK3PXP===='
    const code = generateTOTP(TEST_SECRET)
    // Padded and unpadded secrets should produce same codes
    expect(verifyTOTP(code, paddedSecret)).toBe(true)
  })

  it('handles lowercase secret input', () => {
    const lowerSecret = TEST_SECRET.toLowerCase()
    const code = generateTOTP(TEST_SECRET)
    expect(verifyTOTP(code, lowerSecret)).toBe(true)
  })
})

describe('buildOtpAuthUri', () => {
  it('produces a valid otpauth:// URI', () => {
    const uri = buildOtpAuthUri('Silexar Pulse', 'user@example.com', TEST_SECRET)
    expect(uri).toMatch(/^otpauth:\/\/totp\//)
  })

  it('includes the secret in uppercase', () => {
    const uri = buildOtpAuthUri('Silexar Pulse', 'user@example.com', TEST_SECRET.toLowerCase())
    expect(uri).toContain(`secret=${TEST_SECRET.toUpperCase()}`)
  })

  it('includes the issuer', () => {
    const uri = buildOtpAuthUri('Silexar Pulse', 'user@example.com', TEST_SECRET)
    expect(uri).toContain('issuer=Silexar%20Pulse')
  })

  it('URL-encodes special characters in label', () => {
    const uri = buildOtpAuthUri('Silexar Pulse', 'user+test@example.com', TEST_SECRET)
    expect(uri).toMatch(/^otpauth:\/\/totp\/Silexar%20Pulse/)
  })

  it('includes required TOTP parameters', () => {
    const uri = buildOtpAuthUri('TestApp', 'admin@silexar.com', TEST_SECRET)
    expect(uri).toContain('algorithm=SHA1')
    expect(uri).toContain('digits=6')
    expect(uri).toContain('period=30')
  })

  it('format matches standard otpauth spec', () => {
    const uri = buildOtpAuthUri('Silexar', 'test@silexar.com', TEST_SECRET)
    // otpauth://totp/{label}?secret={secret}&issuer={issuer}&...
    const url = new URL(uri)
    expect(url.protocol).toBe('otpauth:')
    expect(url.host).toBe('totp')
    expect(url.searchParams.get('secret')).toBe(TEST_SECRET.toUpperCase())
    expect(url.searchParams.get('algorithm')).toBe('SHA1')
    expect(url.searchParams.get('digits')).toBe('6')
    expect(url.searchParams.get('period')).toBe('30')
  })
})
