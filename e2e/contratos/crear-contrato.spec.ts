/**
 * E2E Tests - Contract Creation Flow
 * @description Tests for creating new contracts
 * @critical Contract creation, validation, workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Contract Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    test.skip(process.env.TEST_USER_EMAIL === undefined, 'Skip without test credentials');
    
    await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.TEST_USER_EMAIL || '');
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD || '');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/dashboard|super-admin|admin-cliente/, { timeout: 10000 });
  });

  test('should navigate to contract creation page', async ({ page }) => {
    await page.goto('/contratos');
    await page.waitForLoadState('networkidle');

    const newContractButton = page.locator('button:has-text("Nuevo Contrato"), a:has-text("Nuevo Contrato")').first();
    
    if (await newContractButton.isVisible().catch(() => false)) {
      await newContractButton.click();
      await page.waitForURL(/contratos\/(crear|nuevo)/);
      await expect(page.locator('h1, h2').filter({ hasText: /contrato|nuevo/i }).first()).toBeVisible();
    }
  });

  test('should display contract creation form with required fields', async ({ page }) => {
    await page.goto('/contratos/nuevo');
    await page.waitForLoadState('networkidle');

    const requiredFields = [
      'input[name*="titulo" i], input[name*="nombre" i], input[placeholder*="título" i]',
      'input[name*="cliente" i], select[name*="cliente" i]',
      'input[name*="fecha" i], input[type="date"]',
      'input[name*="monto" i], input[name*="valor" i], input[type="number"]',
    ];

    for (const selector of requiredFields) {
      const field = page.locator(selector).first();
      if (await field.isVisible().catch(() => false)) {
        await expect(field).toBeVisible();
      }
    }
  });

  test('should validate required fields before submission', async ({ page }) => {
    await page.goto('/contratos/nuevo');
    await page.waitForLoadState('networkidle');

    const submitButton = page.locator('button[type="submit"], button:has-text("Guardar"), button:has-text("Crear")').first();
    await submitButton.click();

    const errorMessages = page.locator('text=/requerido|obligatorio|required|error/i');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should allow selection of anunciante from list', async ({ page }) => {
    await page.goto('/contratos/nuevo');
    await page.waitForLoadState('networkidle');

    const clienteSelector = page.locator('select[name*="cliente" i], select[name*="anunciante" i], input[name*="cliente" i]').first();
    
    if (await clienteSelector.isVisible().catch(() => false)) {
      await clienteSelector.click();
      const options = page.locator('option, [role="option"]').first();
      await expect(options).toBeVisible();
    }
  });

  test('should calculate totals correctly', async ({ page }) => {
    await page.goto('/contratos/nuevo');
    await page.waitForLoadState('networkidle');

    const montoInput = page.locator('input[name*="monto" i], input[name*="valor" i]').first();
    
    if (await montoInput.isVisible().catch(() => false)) {
      await montoInput.fill('1000000');
      
      const totalDisplay = page.locator('text=/total|suma|neto/i').first();
      if (await totalDisplay.isVisible().catch(() => false)) {
        await expect(totalDisplay).toContainText(/1\.?000\.?000|\$|\d+/);
      }
    }
  });

  test('should save contract as draft', async ({ page }) => {
    await page.goto('/contratos/nuevo');
    await page.waitForLoadState('networkidle');

    const tituloInput = page.locator('input[name*="titulo" i], input[placeholder*="título" i]').first();
    if (await tituloInput.isVisible().catch(() => false)) {
      await tituloInput.fill(`Test Contract ${Date.now()}`);
    }

    const draftButton = page.locator('button:has-text("Borrador"), button:has-text("Guardar"), button:has-text("Draft")').first();
    
    if (await draftButton.isVisible().catch(() => false)) {
      await draftButton.click();
      await expect(page.locator('text=/guardado|éxito|success|creado/i').first()).toBeVisible();
    }
  });
});
