/**
 * Page Object para la página de Login
 * 
 * Encapsula todas las interacciones con la página de autenticación
 */

import type { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator
  readonly rememberMeCheckbox: Locator
  readonly forgotPasswordLink: Locator
  readonly showPasswordButton: Locator
  readonly successMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('#login-email')
    this.passwordInput = page.locator('#login-password')
    this.loginButton = page.locator('button:has-text("Iniciar Sesión")')
    this.errorMessage = page.locator('.bg-red-500\\/10 .text-red-400')
    this.rememberMeCheckbox = page.locator('input[type="checkbox"]')
    this.forgotPasswordLink = page.locator('text=¿Olvidaste tu contraseña?')
    this.showPasswordButton = page.locator('button[aria-label*="contraseña"]')
    this.successMessage = page.locator('text=Sesión iniciada correctamente')
  }

  async goto() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async loginWithRememberMe(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.rememberMeCheckbox.check()
    await this.loginButton.click()
  }

  async togglePasswordVisibility() {
    await this.showPasswordButton.click()
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click()
  }

  async expectErrorMessage(message?: string) {
    await this.errorMessage.waitFor({ state: 'visible' })
    if (message) {
      await this.page.locator(`text=${message}`).waitFor({ state: 'visible' })
    }
  }

  async expectSuccessState() {
    await this.page.locator('text=¡Bienvenido!').waitFor({ state: 'visible', timeout: 10000 })
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/login')
  }
}
