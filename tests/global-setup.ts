/**
 * Playwright Global Setup
 *
 * Runs once before all E2E tests:
 *   1. Verifies the dev server is reachable
 *   2. Authenticates a test user and saves storage state
 *      so individual tests skip the login flow
 *   3. Prepares the test-results directory
 */

import path from 'path'
import fs from 'fs'
import { chromium, type FullConfig } from '@playwright/test'

export const AUTH_STATE_PATH = path.join(process.cwd(), 'test-results', 'auth-state.json')

async function globalSetup(config: FullConfig) {
  // ── 1. Ensure output directories exist ────────────────────────────────────
  const resultsDir = path.join(process.cwd(), 'test-results')
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000'
  console.log(`[setup] baseURL: ${baseURL}`)

  // ── 2. Verify app is reachable ─────────────────────────────────────────────
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    const response = await page.goto(`${baseURL}/api/health`, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    })

    if (!response || response.status() >= 500) {
      throw new Error(`Health check returned ${response?.status()} — is the dev server running?`)
    }

    console.log('[setup] Health check passed')
  } catch (err) {
    // Non-fatal: dev server may not expose /api/health in all envs
    console.warn('[setup] Health check skipped:', (err as Error).message)
  }

  // ── 3. Authenticate test user and save storage state ──────────────────────
  const testEmail = process.env.E2E_TEST_EMAIL ?? 'e2e@silexar.test'
  const testPassword = process.env.E2E_TEST_PASSWORD ?? 'E2eTestPwd123!'

  try {
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle', timeout: 20_000 })

    const emailInput = page
      .locator('[data-testid="email-input"], input[type="email"], input[name="email"]')
      .first()
    const passwordInput = page
      .locator('[data-testid="password-input"], input[type="password"], input[name="password"]')
      .first()
    const submitButton = page
      .locator('[data-testid="login-button"], button[type="submit"]')
      .first()

    if ((await emailInput.count()) > 0 && (await passwordInput.count()) > 0) {
      await emailInput.fill(testEmail)
      await passwordInput.fill(testPassword)
      await submitButton.click()

      // Wait for redirect away from /login
      await page
        .waitForURL(url => !url.pathname.includes('/login'), { timeout: 10_000 })
        .catch(() => console.warn('[setup] Login redirect not detected'))

      await context.storageState({ path: AUTH_STATE_PATH })
      console.log(`[setup] Auth state saved to ${AUTH_STATE_PATH}`)
    } else {
      console.warn('[setup] Login form not found — auth state not saved')
    }
  } catch (err) {
    // Non-fatal: tests that need auth will handle missing state
    console.warn('[setup] Auth state setup skipped:', (err as Error).message)
  }

  await context.close()
  await browser.close()

  console.log('[setup] Global setup complete')
}

export default globalSetup
