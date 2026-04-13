/**
 * Page Object para el módulo de Cuñas
 * 
 * Encapsula las interacciones con la lista y creación de cuñas
 */

import type { Page, Locator } from '@playwright/test'

export class CunasPage {
  readonly page: Page
  readonly heading: Locator
  readonly nuevaCunaButton: Locator
  readonly subirAudioButton: Locator
  readonly generarIAButton: Locator
  readonly searchInput: Locator
  readonly filterTipo: Locator
  readonly filterEstado: Locator
  readonly refreshButton: Locator
  readonly cunasList: Locator
  readonly cunaRows: Locator
  readonly panicButton: Locator
  readonly metricCards: Locator
  readonly quickAccessButtons: Record<string, Locator>

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1:has-text("Centro de Operaciones")')
    this.nuevaCunaButton = page.locator('button:has-text("Nueva Cuña")')
    this.subirAudioButton = page.locator('button:has-text("Subir Audio")')
    this.generarIAButton = page.locator('button:has-text("Generar con IA")')
    this.searchInput = page.locator('input[placeholder*="Buscar cuñas"], input[aria-label="Buscar cuñas"]')
    this.filterTipo = page.locator('select').nth(0)
    this.filterEstado = page.locator('select').nth(1)
    this.refreshButton = page.locator('button').filter({ has: page.locator('[class*="RefreshCw"]') }).first()
    this.cunasList = page.locator('[class*="space-y-3"]').first()
    this.cunaRows = page.locator('[class*="group"]').filter({ has: page.locator('text=SPX') })
    this.panicButton = page.locator('button:has-text("PANIC STOP"), button[title*="KILL SWITCH"]')
    this.metricCards = page.locator('[class*="MetricaCard"], [class*="grid"] > div')
    
    // Acceso rápido a secciones
    this.quickAccessButtons = {
      dashboard: page.locator('button:has-text("Dashboard"), a:has-text("Dashboard")').first(),
      programacion: page.locator('button:has-text("Programación"), a:has-text("Programación")').first(),
      inbox: page.locator('button:has-text("Inbox"), a:has-text("Inbox")').first(),
      material: page.locator('button:has-text("Material"), a:has-text("Material")').first(),
      presentacion: page.locator('button:has-text("Presentación"), a:has-text("Presentación")').first(),
      digital: page.locator('button:has-text("Digital"), a:has-text("Digital")').first(),
    }
  }

  async goto() {
    await this.page.goto('/cunas')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNuevaCuna() {
    await this.nuevaCunaButton.click()
    await this.page.waitForURL('**/cunas/nuevo')
  }

  async searchCuna(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(300) // Debounce
  }

  async filterByTipo(tipo: string) {
    await this.filterTipo.selectOption(tipo)
    await this.page.waitForLoadState('networkidle')
  }

  async filterByEstado(estado: string) {
    await this.filterEstado.selectOption(estado)
    await this.page.waitForLoadState('networkidle')
  }

  async getCunaCount(): Promise<number> {
    return await this.cunaRows.count()
  }

  async clickOnCuna(codigo: string) {
    await this.page.locator(`text=${codigo}`).first().click()
  }

  async expectCunaVisible(codigo: string) {
    await this.page.locator(`text=${codigo}`).waitFor({ state: 'visible' })
  }

  async navigateToQuickAccess(section: keyof typeof this.quickAccessButtons) {
    await this.quickAccessButtons[section].click()
    await this.page.waitForLoadState('networkidle')
  }
}
