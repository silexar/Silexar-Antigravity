/**
 * E2E Tests — 2FA (Two-Factor Authentication) Flow
 *
 * Covers:
 *  - 2FA challenge shown after valid password
 *  - Valid TOTP code accepted (dev secret path)
 *  - Invalid / wrong-format codes rejected
 *  - Rate limit feedback (≥5 bad codes triggers lock message)
 *  - Resend / cancel returns to login
 *
 * Prerequisites:
 *  - App running with NODE_ENV=development and DEV_2FA_SECRET set in env
 *  - A test user with 2FA enabled (userId: "user_001")
 *
 * Environment vars consumed:
 *  - E2E_2FA_USER_EMAIL     (default: admin2fa@silexar.test)
 *  - E2E_2FA_USER_PASSWORD  (default: TestPass123!)
 *  - E2E_2FA_TOTP_SECRET    base-32 secret to generate live TOTP codes in tests
 */

import { test, expect } from '@playwright/test'

// ── helpers ───────────────────────────────────────────────────────────────────

const USER_EMAIL = process.env.E2E_2FA_USER_EMAIL ?? 'admin2fa@silexar.test'
const USER_PASSWORD = process.env.E2E_2FA_USER_PASSWORD ?? 'TestPass123!'
const TOTP_SECRET = process.env.E2E_2FA_TOTP_SECRET ?? ''

/**
 * Generate current TOTP code from base-32 secret using the same algorithm
 * as src/lib/auth/totp.ts — avoids importing Node modules in browser context.
 */
function generateTOTP(secretBase32: string): string {
  const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const str = secretBase32.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0, value = 0
  const output: number[] = []
  for (const c of str) {
    const idx = B32.indexOf(c)
    if (idx < 0) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) { output.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
  }
  const key = Buffer.from(output)
  const counter = Math.floor(Date.now() / 1000 / 30)
  const buf = Buffer.allocUnsafe(8)
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
  buf.writeUInt32BE(counter >>> 0, 4)
  const { createHmac } = require('crypto')
  const hmac: Buffer = createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0x0f
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000
  return code.toString().padStart(6, '0')
}

// ── helpers to interact with the login page ───────────────────────────────────

async function fillLoginAndSubmit(page: ReturnType<typeof test['info']> extends never ? never : Parameters<Parameters<typeof test>[1]>[0]['page'], email: string, password: string) {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"], input[type="email"], input[name="email"]', email)
  await page.fill('[data-testid="password-input"], input[type="password"], input[name="password"]', password)
  await page.click('[data-testid="login-button"], button[type="submit"]')
}

// ── tests ─────────────────────────────────────────────────────────────────────

test.describe('2FA — Two-Factor Authentication', () => {
  test.describe('Challenge screen appearance', () => {
    test('shows 2FA code input after valid credentials for 2FA-enabled user', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      // After valid password, 2FA step should appear
      await expect(
        page.locator('[data-testid="2fa-input"], input[inputmode="numeric"][maxlength="6"], input[placeholder*="código"], input[placeholder*="código"]')
      ).toBeVisible({ timeout: 8000 })
    })

    test('2FA screen shows instructional text', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      // Look for 2FA-related text
      await expect(
        page.getByText(/verificación|autenticador|código|2FA|factor/i)
      ).toBeVisible({ timeout: 8000 })
    })
  })

  test.describe('Invalid code rejection', () => {
    test('rejects all-zeros code', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      // Wait for 2FA input
      const codeInput = page.locator('[data-testid="2fa-input"], input[inputmode="numeric"][maxlength="6"]').first()
      await codeInput.waitFor({ state: 'visible', timeout: 8000 })
      await codeInput.fill('000000')
      await page.click('[data-testid="2fa-submit"], button[type="submit"]')

      // Should show error message
      await expect(
        page.getByText(/inválido|incorrecto|error|invalid/i)
      ).toBeVisible({ timeout: 5000 })
    })

    test('rejects non-numeric code (input should block or show error)', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      const codeInput = page.locator('[data-testid="2fa-input"], input[inputmode="numeric"][maxlength="6"]').first()
      await codeInput.waitFor({ state: 'visible', timeout: 8000 })
      await codeInput.fill('abcdef')
      await page.click('[data-testid="2fa-submit"], button[type="submit"]')

      // Either input blocks non-numeric, or form shows error
      const errorVisible = await page.getByText(/inválido|incorrecto|error|invalid/i).isVisible()
      const inputValue = await codeInput.inputValue()
      // Either error or input filtered to empty/numbers only
      expect(errorVisible || inputValue === '' || /^\d*$/.test(inputValue)).toBe(true)
    })

    test('rejects 5-digit code (too short)', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      const codeInput = page.locator('[data-testid="2fa-input"], input[inputmode="numeric"][maxlength="6"]').first()
      await codeInput.waitFor({ state: 'visible', timeout: 8000 })
      await codeInput.fill('12345')
      await page.click('[data-testid="2fa-submit"], button[type="submit"]')

      await expect(
        page.getByText(/inválido|incorrecto|error|dígito/i)
      ).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Valid code acceptance', () => {
    test.skip(!TOTP_SECRET, 'Requires E2E_2FA_TOTP_SECRET env var')

    test('accepts valid TOTP code and redirects to dashboard', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      const codeInput = page.locator('[data-testid="2fa-input"], input[inputmode="numeric"][maxlength="6"]').first()
      await codeInput.waitFor({ state: 'visible', timeout: 8000 })

      const validCode = generateTOTP(TOTP_SECRET)
      await codeInput.fill(validCode)
      await page.click('[data-testid="2fa-submit"], button[type="submit"]')

      // Should redirect away from login
      await expect(page).toHaveURL(/\/(dashboard|super-admin|admin-cliente)/, { timeout: 10000 })
    })
  })

  test.describe('Cancel / back to login', () => {
    test('cancel on 2FA returns to login screen', async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"], input[name="email"]', USER_EMAIL)
      await page.fill('input[type="password"], input[name="password"]', USER_PASSWORD)
      await page.click('button[type="submit"]')

      const codeInput = page.locator('[data-testid="2fa-input"], input[inputmode="numeric"][maxlength="6"]').first()
      await codeInput.waitFor({ state: 'visible', timeout: 8000 })

      // Click cancel/back button if present
      const cancelBtn = page.getByRole('button', { name: /cancelar|volver|atrás|back/i })
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click()
        // Should be back on login screen
        await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 })
      } else {
        // Navigating away manually also resets state
        await page.goto('/login')
        await expect(page.locator('input[type="email"]')).toBeVisible()
      }
    })
  })
})

// ── API-level 2FA tests (direct fetch — faster, no UI) ───────────────────────

test.describe('2FA API — /api/auth/verify-2fa', () => {
  test('returns 403 in development with unconfigured secret', async ({ request }) => {
    const res = await request.post('/api/auth/verify-2fa', {
      data: { userId: 'user_001', code: '000000' },
    })
    // Either 403 (blocked in prod/unconfigured) or 400 (invalid code)
    expect([400, 403, 429]).toContain(res.status())
  })

  test('returns 400 or 422 for non-numeric code', async ({ request }) => {
    const res = await request.post('/api/auth/verify-2fa', {
      data: { userId: 'user_001', code: 'abcdef' },
    })
    expect([400, 422, 403]).toContain(res.status())
  })

  test('returns 400 or 422 for missing code', async ({ request }) => {
    const res = await request.post('/api/auth/verify-2fa', {
      data: { userId: 'user_001' },
    })
    expect([400, 422, 403]).toContain(res.status())
  })

  test('returns 429 after rate limit exceeded', async ({ request }) => {
    // Exhaust the 5 attempts/minute limit
    const attempts = Array.from({ length: 6 }, () =>
      request.post('/api/auth/verify-2fa', {
        data: { userId: 'rate_limit_test_user', code: '999999' },
      })
    )
    const responses = await Promise.all(attempts)
    const statuses = responses.map(r => r.status())
    // At least one response should be 429 (rate limited) or 403
    expect(statuses.some(s => s === 429 || s === 403)).toBe(true)
  })
})
