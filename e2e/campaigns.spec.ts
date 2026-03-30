import { test, expect } from '@playwright/test'

test.describe('Campañas E2E (placeholder)', () => {
  test.skip('Flujo completo creación-programación-confirmación', async ({ page }) => {
    await page.goto('/')
    // TODO: implementar flujo real
    await expect(page).toHaveTitle(/SILEXAR PULSE/i)
  })
})
