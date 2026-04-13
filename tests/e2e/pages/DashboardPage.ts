/**
 * Page Object para el Dashboard
 * 
 * Encapsula las interacciones con la página principal del sistema
 */

import type { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly heading: Locator
  readonly metricCards: Locator
  readonly refreshButton: Locator
  readonly systemStatus: Locator
  readonly navigationLinks: Record<string, Locator>

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1')
    this.metricCards = page.locator('[class*="MetricCard"], .metric-card, [data-testid="metric-card"]')
    this.refreshButton = page.locator('button:has([class*="RefreshCw"])')
    this.systemStatus = page.locator('[class*="StatusBadge"], [data-testid="system-status"]')
    
    // Links de navegación principales
    this.navigationLinks = {
      campanas: page.locator('a[href*="campanas"], button:has-text("Campañas")'),
      contratos: page.locator('a[href*="contratos"], button:has-text("Contratos")'),
      cunas: page.locator('a[href*="cunas"], button:has-text("Cuñas")'),
      anunciantes: page.locator('a[href*="anunciantes"], button:has-text("Anunciantes")'),
      facturacion: page.locator('a[href*="facturacion"], button:has-text("Facturación")'),
      dashboard: page.locator('a[href="/dashboard"], button:has-text("Dashboard")'),
    }
  }

  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForLoad() {
    await this.page.waitForSelector('h1', { state: 'visible', timeout: 10000 })
  }

  async navigateTo(section: keyof typeof this.navigationLinks) {
    await this.navigationLinks[section].click()
    await this.page.waitForLoadState('networkidle')
  }

  async getMetricValue(label: string): Promise<string | null> {
    const card = this.page.locator(`text=${label}`).locator('..').locator('..')
    const value = await card.locator('.text-2xl, [class*="value"]').textContent().catch(() => null)
    return value
  }

  async refreshData() {
    await this.refreshButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async isDashboardLoaded(): Promise<boolean> {
    const url = this.page.url()
    return url.includes('/dashboard') || url.includes('/super-admin') || url.includes('/admin-cliente')
  }

  async expectMetricVisible(label: string) {
    await this.page.locator(`text=${label}`).waitFor({ state: 'visible' })
  }
}
