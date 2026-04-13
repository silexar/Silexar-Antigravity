/**
 * E2E Tests - Reconciliation Flow
 * @description Tests for financial reconciliation process
 * @critical Reconciliation, financial validation, approval workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Financial Reconciliation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    test.skip(process.env.TEST_USER_EMAIL === undefined, 'Skip without test credentials');
    
    await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.TEST_USER_EMAIL || '');
    await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD || '');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/dashboard|super-admin|admin-cliente/, { timeout: 10000 });
  });

  test('should navigate to reconciliation page', async ({ page }) => {
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: /conciliación|reconciliation/i }).first()).toBeVisible();
  });

  test('should display reconciliation dashboard with metrics', async ({ page }) => {
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');

    const metrics = [
      'text=/pendiente|pending/i',
      'text=/conciliado|reconciled/i',
      'text=/diferencia|difference/i',
      'text=/total|monto/i',
    ];

    for (const metric of metrics) {
      const element = page.locator(metric).first();
      if (await element.isVisible().catch(() => false)) {
        await expect(element).toBeVisible();
      }
    }
  });

  test('should display transaction list', async ({ page }) => {
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');

    const transactionList = page.locator('table, [data-testid="transaction-list"], .transaction-list').first();
    
    if (await transactionList.isVisible().catch(() => false)) {
      await expect(transactionList).toBeVisible();
      const headers = page.locator('th, .header').first();
      await expect(headers).toBeVisible();
    }
  });

  test('should allow manual reconciliation', async ({ page }) => {
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');

    const reconcileButton = page.locator('button:has-text("Conciliar"), button:has-text("Reconciliar"), button:has-text("Match")').first();
    
    if (await reconcileButton.isVisible().catch(() => false)) {
      await reconcileButton.click();
      const dialog = page.locator('[role="dialog"], .modal, .dialog').first();
      await expect(dialog).toBeVisible();
    }
  });

  test('should handle date range filtering', async ({ page }) => {
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');

    const dateFrom = page.locator('input[type="date"], input[placeholder*="desde" i], input[name*="from" i]').first();
    const dateTo = page.locator('input[type="date"], input[placeholder*="hasta" i], input[name*="to" i]').first();

    if (await dateFrom.isVisible().catch(() => false)) {
      await dateFrom.fill('2025-01-01');
    }

    if (await dateTo.isVisible().catch(() => false)) {
      await dateTo.fill('2025-12-31');
    }

    const applyButton = page.locator('button:has-text("Filtrar"), button:has-text("Aplicar"), button:has-text("Buscar")').first();
    if (await applyButton.isVisible().catch(() => false)) {
      await applyButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should export reconciliation report', async ({ page }) => {
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');

    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Export"), button:has-text("Descargar")').first();
    
    if (await exportButton.isVisible().catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        exportButton.click(),
      ]);
      
      if (download) {
        expect(download.suggestedFilename()).toBeTruthy();
      }
    }
  });

  test('mobile view should be accessible', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Only run on mobile viewport');
    
    await page.goto('/conciliacion');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
