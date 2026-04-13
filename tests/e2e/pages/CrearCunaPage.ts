/**
 * Page Object para el Wizard de Creación de Cuñas
 * 
 * Encapsula las interacciones con el formulario de creación de cuñas
 */

import type { Page, Locator } from '@playwright/test'

export class CrearCunaPage {
  readonly page: Page
  readonly heading: Locator
  readonly pasoIndicator: Locator
  
  // Paso 1: Información Básica
  readonly tipoSelect: Locator
  readonly nombreInput: Locator
  readonly anuncianteSearch: Locator
  readonly productoSelect: Locator
  readonly descripcionInput: Locator
  readonly duracionInput: Locator
  
  // Paso 2: Contenido
  readonly audioUpload: Locator
  readonly textoMencionInput: Locator
  
  // Paso 3: Vigencia
  readonly fechaInicioInput: Locator
  readonly horaInicioInput: Locator
  readonly fechaFinInput: Locator
  readonly horaFinInput: Locator
  readonly urgenciaSelect: Locator
  
  // Paso 4: Distribución
  readonly gruposDistribucion: Locator
  readonly enviarAlCrearCheckbox: Locator
  
  // Paso 5: Notas
  readonly notasInput: Locator
  readonly tagsInput: Locator
  
  // Navegación
  readonly siguienteButton: Locator
  readonly anteriorButton: Locator
  readonly guardarButton: Locator
  readonly cancelarButton: Locator
  
  // Mensajes
  readonly successMessage: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.locator('h1, h2').filter({ hasText: /Crear|Nueva|Wizard/i }).first()
    this.pasoIndicator = page.locator('[class*="paso"], [class*="step"], .flex.gap-2').first()
    
    // Paso 1
    this.tipoSelect = page.locator('select').filter({ hasText: /tipo|Tipo/i }).first()
    this.nombreInput = page.locator('input[placeholder*="nombre"], input[name*="nombre"]').first()
    this.anuncianteSearch = page.locator('input[placeholder*="anunciante"], input[name*="anunciante"]').first()
    this.productoSelect = page.locator('select').filter({ hasText: /producto|Producto/i }).first()
    this.descripcionInput = page.locator('textarea[placeholder*="descripción"], textarea[name*="descripcion"]').first()
    this.duracionInput = page.locator('input[type="number"]').first()
    
    // Paso 2
    this.audioUpload = page.locator('input[type="file"]').first()
    this.textoMencionInput = page.locator('textarea[placeholder*="texto"], textarea[name*="texto"]').first()
    
    // Paso 3
    this.fechaInicioInput = page.locator('input[type="date"]').first()
    this.horaInicioInput = page.locator('input[type="time"]').first()
    this.fechaFinInput = page.locator('input[type="date"]').nth(1)
    this.horaFinInput = page.locator('input[type="time"]').nth(1)
    this.urgenciaSelect = page.locator('select').filter({ hasText: /urgencia|Urgencia/i }).first()
    
    // Paso 4
    this.gruposDistribucion = page.locator('[class*="distribucion"], input[type="checkbox"]').first()
    this.enviarAlCrearCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /enviar|Enviar/i }).first()
    
    // Paso 5
    this.notasInput = page.locator('textarea[placeholder*="notas"], textarea[name*="notas"]').first()
    this.tagsInput = page.locator('input[placeholder*="tags"], input[name*="tags"]').first()
    
    // Navegación
    this.siguienteButton = page.locator('button:has-text("Siguiente"), button:has([class*="ArrowRight"])').first()
    this.anteriorButton = page.locator('button:has-text("Anterior"), button:has([class*="ArrowLeft"])').first()
    this.guardarButton = page.locator('button:has-text("Guardar"), button:has-text("Crear"), button:has-text("Finalizar"]').first()
    this.cancelarButton = page.locator('button:has-text("Cancelar")').first()
    
    // Mensajes
    this.successMessage = page.locator('text=Cuña creada, text=guardada, text=éxito, text=success').first()
    this.errorMessage = page.locator('[class*="error"], [class*="Error"], .text-red-500, .text-red-400').first()
  }

  async goto() {
    await this.page.goto('/cunas/nuevo')
    await this.page.waitForLoadState('networkidle')
  }

  async fillPaso1(datos: {
    tipo?: string
    nombre: string
    anunciante?: string
    descripcion?: string
    duracion?: string
  }) {
    if (datos.tipo) {
      await this.tipoSelect.selectOption(datos.tipo)
    }
    await this.nombreInput.fill(datos.nombre)
    if (datos.anunciante) {
      await this.anuncianteSearch.fill(datos.anunciante)
      // Esperar y seleccionar el primer resultado
      await this.page.waitForTimeout(500)
      await this.page.locator('[class*="resultado"], [class*="option"]').first().click().catch(() => {})
    }
    if (datos.descripcion) {
      await this.descripcionInput.fill(datos.descripcion)
    }
    if (datos.duracion) {
      await this.duracionInput.fill(datos.duracion)
    }
  }

  async fillPaso2(datos: {
    textoMencion?: string
  }) {
    if (datos.textoMencion) {
      await this.textoMencionInput.fill(datos.textoMencion)
    }
  }

  async fillPaso3(datos: {
    fechaInicio?: string
    fechaFin?: string
    urgencia?: string
  }) {
    if (datos.fechaInicio) {
      await this.fechaInicioInput.fill(datos.fechaInicio)
    }
    if (datos.fechaFin) {
      await this.fechaFinInput.fill(datos.fechaFin)
    }
    if (datos.urgencia) {
      await this.urgenciaSelect.selectOption(datos.urgencia)
    }
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

  async clickCancelar() {
    await this.cancelarButton.click()
  }

  async completeWizard(datos: {
    tipo?: string
    nombre: string
    anunciante?: string
    descripcion?: string
    duracion?: string
    fechaInicio?: string
    fechaFin?: string
    urgencia?: string
  }) {
    // Paso 1
    await this.fillPaso1(datos)
    await this.clickSiguiente()
    
    // Paso 2 - Contenido (opcional)
    await this.clickSiguiente()
    
    // Paso 3 - Vigencia
    await this.fillPaso3({
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      urgencia: datos.urgencia,
    })
    await this.clickSiguiente()
    
    // Paso 4 - Distribución
    await this.clickSiguiente()
    
    // Paso 5 - Notas y Guardar
    await this.clickGuardar()
  }

  async expectSuccess() {
    await this.page.waitForURL('**/cunas/**', { timeout: 10000 })
  }

  getPasoActual(): Promise<number> {
    // Intentar extraer el número de paso del indicador
    return this.pasoIndicator.locator('span').first().textContent().then(text => {
      const match = text?.match(/(\d+)/)
      return match ? parseInt(match[1]) : 1
    }).catch(() => 1)
  }
}
