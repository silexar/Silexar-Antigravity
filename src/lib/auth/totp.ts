/**
 * TOTP (RFC 6238) implementation using Node.js built-in crypto only.
 * No external dependencies — safe to use in Edge and Node runtimes.
 *
 * Algorithm:
 *   counter = floor(unixTime / step)         // 30-second window
 *   HOTP(K, C) = Truncate(HMAC-SHA1(K, C))
 *   TOTP(K, T) = HOTP(K, floor(T / step))
 */

import { createHmac } from 'crypto'

/** Base-32 alphabet (RFC 4648) */
const B32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(input: string): Buffer {
  const str = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  const output: number[] = []

  for (const c of str) {
    const idx = B32_CHARS.indexOf(c)
    if (idx < 0) continue // skip unknown chars gracefully
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(output)
}

/**
 * Compute one HOTP code for the given counter value.
 * Returns a zero-padded 6-digit string.
 */
function hotp(secretBase32: string, counter: number): string {
  const key = base32Decode(secretBase32)

  // Encode counter as 8-byte big-endian unsigned integer
  const buf = Buffer.allocUnsafe(8)
  const hi = Math.floor(counter / 0x100000000)
  const lo = counter >>> 0
  buf.writeUInt32BE(hi, 0)
  buf.writeUInt32BE(lo, 4)

  const hmac = createHmac('sha1', key).update(buf).digest()

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000

  return code.toString().padStart(6, '0')
}

/**
 * Verify a TOTP token.
 *
 * @param token  6-digit code from the authenticator app
 * @param secret Base-32 encoded TOTP secret
 * @param step   Time step in seconds (default: 30)
 * @param window Number of adjacent windows to check on each side (default: 1 = ±30s)
 */
export function verifyTOTP(
  token: string,
  secret: string,
  step = 30,
  window = 1
): boolean {
  if (!/^\d{6}$/.test(token)) return false

  const counter = Math.floor(Date.now() / 1000 / step)

  for (let i = -window; i <= window; i++) {
    if (hotp(secret, counter + i) === token) return true
  }

  return false
}

/**
 * Generate the current TOTP code for a secret.
 * Useful in tests / dev tooling to get the expected code.
 */
export function generateTOTP(secret: string, step = 30): string {
  const counter = Math.floor(Date.now() / 1000 / step)
  return hotp(secret, counter)
}

/**
 * Return a standard otpauth:// URI for QR-code enrollment.
 *
 * @param issuer  Displayed in the authenticator app (e.g. "Silexar Pulse")
 * @param account User account label (e.g. email)
 * @param secret  Base-32 encoded secret
 */
export function buildOtpAuthUri(issuer: string, account: string, secret: string): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  return (
    `otpauth://totp/${label}` +
    `?secret=${secret.toUpperCase()}` +
    `&issuer=${encodeURIComponent(issuer)}` +
    `&algorithm=SHA1&digits=6&period=30`
  )
}
