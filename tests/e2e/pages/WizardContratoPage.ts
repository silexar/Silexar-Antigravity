/**
 * Page Object para el Wizard de Contratos
 * 
 * Encapsula las interacciones con el wizard de creación de contratos
 */

import type { Page, Locator } from '@playwright/test'

export class WizardContratoPage {
  readonly page: Page
  readonly heading: Locator
  readonly tipoCards: Record<string, Locator>
  readonly continuarButton: Locator
  readonly cancelarButton: Locator
  
  // Wizard steps header
  readonly stepIndicators: Locator
  readonly progressBar: Locator
  
  // Step 1: Info Fundamental
  readonly anuncianteSelect: Locator
  readonly nombreContratoInput: Locator
  readonly productoSelect: Locator
  readonly campanaSelect: Locator
  
  // Step 2: Términos Comerciales
  readonly montoInput: Locator
  readonly monedaSelect: Locator
  readonly formaPagoSelect: Locator
  readonly descuentoInput: Locator
  
  // Step 3: Especificaciones
  readonly fechaInicioInput: Locator
  readonly fechaFinInput: Locator
  readonly emisorasMultiSelect: Locator
  
  // Step 4: Aprobaciones
  readonly aprobadorSelect: Locator
  readonly nivelAprobacionSelect: Locator
  
  // Step 5: Documentación
  readonly fileUpload: Locator
  
  // Step 6: Autorización
  readonly terminosCheckbox: Locator
  readonly firmaDigitalButton: Locator
  
  // Navigation
  readonly siguienteButton: Locator
  readonly anteriorButton: Locator
  readonly guardarButton: Locator
  readonly guardarBorradorButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1')
    
    // Selector de tipo de contrato
    this.tipoCards = {
      nuevo: page.locator('button:has-text("Nuevo Contrato")'),
      renovacion: page.locator('button:has-text("Renovación")'),
      programatico: page.locator('button:has-text("Programático")'),
      marco: page.locator('button:has-text("Marco Anual")'),
      express: page.locator('button:has-text("Express")'),
    }
    
    this.continuarButton = page.locator('button:has-text("Continuar")')
    this.cancelarButton = page.locator('button:has-text("Cancelar")')
    
    // Wizard
    this.stepIndicators = page.locator('[class*="step"], [class*="paso"]').first()
    this.progressBar = page.locator('[class*="progress"], [class*="Progress"]').first()
    
    // Step 1
    this.anuncianteSelect = page.locator('select, input').filter({ hasText: /anunciante|cliente/i }).first()
    this.nombreContratoInput = page.locator('input[name*="nombre"], input[placeholder*="nombre"]').first()
    this.productoSelect = page.locator('select').filter({ hasText: /producto/i }).first()
    this.campanaSelect = page.locator('select').filter({ hasText: /campaña|campana/i }).first()
    
    // Step 2
    this.montoInput = page.locator('input[type="number"]').first()
    this.monedaSelect = page.locator('select').filter({ hasText: /moneda|currency/i }).first()
    this.formaPagoSelect = page.locator('select').filter({ hasText: /pago|payment/i }).first()
    this.descuentoInput = page.locator('input[type="number"]').nth(1)
    
    // Step 3
    this.fechaInicioInput = page.locator('input[type="date"]').first()
    this.fechaFinInput = page.locator('input[type="date"]').nth(1)
    this.emisorasMultiSelect = page.locator('[class*="multiselect"], [class*="chip"]').first()
    
    // Step 4
    this.aprobadorSelect = page.locator('select').filter({ hasText: /aprobador|approver/i }).first()
    this.nivelAprobacionSelect = page.locator('select').filter({ hasText: /nivel|level/i }).first()
    
    // Step 5
    this.fileUpload = page.locator('input[type="file"]').first()
    
    // Step 6
    this.terminosCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /términos|terms|acepto/i }).first()
    this.firmaDigitalButton = page.locator('button:has-text("Firmar"), button:has-text("firma")').first()
    
    // Navigation
    this.siguienteButton = page.locator('button:has-text("Siguiente"), button:has([class*="ChevronRight"])').first()
    this.anteriorButton = page.locator('button:has-text("Anterior"), button:has([class*="ChevronLeft"])').first()
    this.guardarButton = page.locator('button:has-text("Crear Contrato"), button:has-text("Guardar"), button:has-text("Finalizar"]').first()
    this.guardarBorradorButton = page.locator('button:has-text("Borrador"), button:has-text("Guardar borrador")').first()
  }

  async goto() {
    await this.page.goto('/contratos/nuevo')
    await this.page.waitForLoadState('networkidle')
  }

  async selectTipoContrato(tipo: keyof typeof this.tipoCards) {
    await this.tipoCards[tipo].click()
    await this.page.waitForTimeout(300)
  }

  async clickContinuar() {
    await this.continuarButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async fillStep1(datos: {
    anunciante?: string
    nombreContrato: string
    producto?: string
    campana?: string
  }) {
    if (datos.anunciante) {
      await this.anuncianteSelect.fill?.(datos.anunciante) || await this.anuncianteSelect.selectOption?.(datos.anunciante)
    }
    await this.nombreContratoInput.fill(datos.nombreContrato)
    if (datos.producto) {
      await this.productoSelect.selectOption(datos.producto)
    }
    if (datos.campana) {
      await this.campanaSelect.selectOption(datos.campana)
    }
  }

  async fillStep2(datos: {
    monto: string
    moneda?: string
    formaPago?: string
    descuento?: string
  }) {
    await this.montoInput.fill(datos.monto)
    if (datos.moneda) {
      await this.monedaSelect.selectOption(datos.moneda)
    }
    if (datos.formaPago) {
      await this.formaPagoSelect.selectOption(datos.formaPago)
    }
    if (datos.descuento) {
      await this.descuentoInput.fill(datos.descuento)
    }
  }

  async fillStep3(datos: {
    fechaInicio: string
    fechaFin: string
  }) {
    await this.fechaInicioInput.fill(datos.fechaInicio)
    await this.fechaFinInput.fill(datos.fechaFin)
  }

  async clickSiguiente() {
    await this.siguienteButton.click()
    await this.page.waitForTimeout(500)
  }

  async clickAnterior() {
    await this.anteriorButton.click()
    await this.page.waitForTimeout(500)
  }

  async clickGuardar() {
    await this.guardarButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async completeWizard(tipo: keyof typeof this.tipoCards, datos: {
    nombreContrato: string
    monto: string
    fechaInicio: string
    fechaFin: string
  }) {
    // Seleccionar tipo
    await this.selectTipoContrato(tipo)
    await this.clickContinuar()
    
    // Step 1: Info Fundamental
    await this.fillStep1({ nombreContrato: datos.nombreContrato })
    await this.clickSiguiente()
    
    // Step 2: Términos Comerciales
    await this.fillStep2({ monto: datos.monto })
    await this.clickSiguiente()
    
    // Step 3: Especificaciones
    await this.fillStep3({
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
    })
    await this.clickSiguiente()
    
    // Step 4: Aprobaciones (saltar)
    await this.clickSiguiente()
    
    // Step 5: Documentación (saltar)
    await this.clickSiguiente()
    
    // Step 6: Guardar
    await this.clickGuardar()
  }

  async getCurrentStep(): Promise<number> {
    // Buscar el indicador de paso activo
    const stepText = await this.page.locator('text=Paso\\s+\\d+').textContent().catch(() => 'Paso 1')
    const match = stepText?.match(/Paso\s+(\d+)/)
    return match ? parseInt(match[1]) : 1
  }

  async expectWizardLoaded() {
    await this.page.waitForSelector('h1, h2', { state: 'visible', timeout: 10000 })
  }

  async expectSuccess() {
    await this.page.waitForURL('**/contratos/**', { timeout: 15000 })
  }
}
