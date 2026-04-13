/**
 * E2E Tests - Authentication Flows
 * @description Tests for login, 2FA, and session management
 * @critical Login, 2FA, Password Reset
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login form correctly', async ({ page }) => {
      await expect(page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")')).toBeVisible();
    });

    test('should show validation error for empty fields', async ({ page }) => {
      const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")');
      await submitButton.click();
      
      const errorMessage = page.locator('text=/email|contraseña|required|obligatorio/i').first();
      await expect(errorMessage).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();

      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();

      await expect(page.locator('text=/incorrect|inválid|error|falló/i').first()).toBeVisible();
    });

    test('should redirect to dashboard on successful login', async ({ page }) => {
      test.skip(process.env.TEST_USER_EMAIL === undefined, 'Skip without test credentials');

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').first();

      await emailInput.fill(process.env.TEST_USER_EMAIL || '');
      await passwordInput.fill(process.env.TEST_USER_PASSWORD || '');
      await submitButton.click();

      await page.waitForURL(/dashboard|super-admin|admin-cliente/, { timeout: 10000 });
      expect(page.url()).not.toContain('/login');
    });

    test('should have working "forgot password" link', async ({ page }) => {
      const forgotLink = page.locator('a:has-text("olvidó"), a:has-text("forgot"), a:has-text("recuperar")').first();
      
      if (await forgotLink.isVisible().catch(() => false)) {
        await forgotLink.click();
        await expect(page).toHaveURL(/forgot-password|recuperar/);
      }
    });

    test('should maintain session after page reload', async ({ page }) => {
      test.skip(process.env.TEST_USER_EMAIL === undefined, 'Skip without test credentials');

      await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.TEST_USER_EMAIL || '');
      await page.locator('input[type="password"]').first().fill(process.env.TEST_USER_PASSWORD || '');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/dashboard|super-admin|admin-cliente/, { timeout: 10000 });

      await page.reload();
      await expect(page.locator('text=/logout|cerrar|salir/i').first()).toBeVisible();
    });
  });

  test.describe('Two-Factor Authentication (2FA)', () => {
    test('should prompt for 2FA code when enabled', async ({ page }) => {
      test.skip(true, 'Requires user with 2FA enabled');
      
      await page.goto('/login');
      await page.locator('input[type="email"]').fill('2fa-user@example.com');
      await page.locator('input[type="password"]').fill('password');
      await page.locator('button[type="submit"]').click();

      await expect(page.locator('input[placeholder*="código" i], input[placeholder*="code" i], input[name="totp"], input[name="code"]')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should clear session on logout', async ({ page }) => {
      test.skip(process.env.TEST_USER_EMAIL === undefined, 'Skip without test credentials');

      await page.goto('/login');
      await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL || '');
      await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD || '');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/dashboard|super-admin/);

      const logoutButton = page.locator('button:has-text("Cerrar"), button:has-text("Logout"), a:has-text("Salir")').first();
      await logoutButton.click();

      await page.waitForURL(/login/);
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/login/);
    });
  });
});
