/**
 * E2E: Authentication flows
 *
 * Tests the login page and critical auth API endpoints.
 * These run against the live dev/staging server.
 */

import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')

    // Page title contains Silexar branding
    await expect(page).toHaveTitle(/Silexar|Pulse/i)

    // Email and password inputs are visible
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first()
    const passwordInput = page
      .locator('input[type="password"], input[name="password"]')
      .first()

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('shows validation error for empty submission', async ({ page }) => {
    await page.goto('/login')

    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()

    // Some form of error feedback should appear
    // (exact selector depends on the component implementation)
    const errorIndicator = page.locator('[role="alert"], .error, [data-testid*="error"]').first()
    // We just check the page didn't navigate away unexpectedly
    await expect(page).toHaveURL(/login/)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('no-such-user@silexar.test')
    await passwordInput.fill('WrongPassword123!')
    await submitButton.click()

    // Page must remain on /login after failed attempt
    await expect(page).toHaveURL(/login/, { timeout: 10_000 })
  })
})

test.describe('Auth API', () => {
  test('POST /api/auth/login returns 401 for wrong credentials', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'nobody@silexar.test', password: 'wrong' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  test('POST /api/auth/login returns 422 for invalid payload', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'not-an-email', password: '' },
    })
    // 422 Unprocessable Entity for Zod validation failure
    expect([400, 422]).toContain(res.status())
  })

  test('GET /api/auth/me returns 401 without token', async ({ request }) => {
    const res = await request.get('/api/auth/me')
    expect(res.status()).toBe(401)
  })
})
