/**
 * Fixtures personalizados para los tests E2E
 * 
 * Extiende el test context de Playwright con:
 * - Page Objects listos para usar
 * - Autenticación automática
 * - Utilidades comunes
 */

import { test as base, expect, type Page } from '@playwright/test'
import {
  LoginPage,
  DashboardPage,
  CunasPage,
  CrearCunaPage,
  ContratosPage,
  WizardContratoPage,
} from './pages'

// Tipos de datos para tests
export interface TestUser {
  email: string
  password: string
  role: 'admin' | 'user' | 'super_admin'
}

// Usuarios de prueba
export const testUsers: Record<string, TestUser> = {
  admin: {
    email: process.env.E2E_TEST_EMAIL || 'admin@silexar.test',
    password: process.env.E2E_TEST_PASSWORD || 'TestPass123!',
    role: 'admin',
  },
  regular: {
    email: 'user@silexar.test',
    password: 'UserPass123!',
    role: 'user',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
    role: 'user',
  },
}

// Extender el test con fixtures personalizados
type E2EFixtures = {
  // Page Objects
  loginPage: LoginPage
  dashboardPage: DashboardPage
  cunasPage: CunasPage
  crearCunaPage: CrearCunaPage
  contratosPage: ContratosPage
  wizardContratoPage: WizardContratoPage
  
  // Fixtures de autenticación
  authenticatedPage: Page
  testUser: TestUser
}

export const test = base.extend<E2EFixtures>({
  // Page Objects
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  
  cunasPage: async ({ page }, use) => {
    await use(new CunasPage(page))
  },
  
  crearCunaPage: async ({ page }, use) => {
    await use(new CrearCunaPage(page))
  },
  
  contratosPage: async ({ page }, use) => {
    await use(new ContratosPage(page))
  },
  
  wizardContratoPage: async ({ page }, use) => {
    await use(new WizardContratoPage(page))
  },
  
  // Usuario de prueba por defecto
  testUser: async ({}, use) => {
    await use(testUsers.admin)
  },
  
  // Página autenticada automáticamente
  authenticatedPage: async ({ page, loginPage, testUser }, use) => {
    // Navegar a login
    await loginPage.goto()
    
    // Realizar login
    await loginPage.login(testUser.email, testUser.password)
    
    // Esperar redirección al dashboard
    await page.waitForURL(/\/(dashboard|super-admin|admin-cliente)/, { timeout: 15000 })
    
    await use(page)
  },
})

export { expect }

// Helpers para tests
export const helpers = {
  /**
   * Genera una fecha futura formateada para inputs de fecha
   */
  futureDate(daysFromNow: number = 7): string {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  },
  
  /**
   * Genera un nombre único para entidades de prueba
   */
  generateUniqueName(prefix: string = 'Test'): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `${prefix}_${timestamp}_${random}`
  },
  
  /**
   * Espera a que un elemento sea visible y tenga texto
   */
  async waitForText(page: Page, selector: string, text: string, timeout: number = 10000) {
    await page.waitForFunction(
      ({ sel, txt }) => {
        const el = document.querySelector(sel)
        return el && el.textContent?.includes(txt)
      },
      { sel: selector, txt: text },
      { timeout }
    )
  },
  
  /**
   * Toma un screenshot con nombre descriptivo
   */
  async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    })
  },
}
