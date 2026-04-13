/**
 * Page Object para el módulo de Contratos
 * 
 * Encapsula las interacciones con la lista y creación de contratos
 */

import type { Page, Locator } from '@playwright/test'

export class ContratosPage {
  readonly page: Page
  readonly heading: Locator
  readonly nuevoContratoButton: Locator
  readonly contratosList: Locator
  readonly searchInput: Locator
  readonly filterEstado: Locator
  readonly refreshButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1').filter({ hasText: /Contratos/i })
    this.nuevoContratoButton = page.locator('a[href*="nuevo"], button:has-text("Nuevo Contrato"), button:has-text("Crear Contrato")').first()
    this.contratosList = page.locator('[class*="contrato"], [class*="Contrato"], table tbody tr').first()
    this.searchInput = page.locator('input[placeholder*="buscar"], input[placeholder*="Buscar"]').first()
    this.filterEstado = page.locator('select').first()
    this.refreshButton = page.locator('button').filter({ has: page.locator('[class*="Refresh"]') }).first()
  }

  async goto() {
    await this.page.goto('/contratos')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNuevoContrato() {
    await this.nuevoContratoButton.click()
    await this.page.waitForURL('**/contratos/nuevo')
  }

  async searchContrato(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(300)
  }
}
