/**
 * E2E Tests - Wizard de Contratos
 * 
 * @file tests/e2e/contratos/wizard.spec.ts
 * @description Tests para iniciar wizard, completar pasos y generar contrato
 */

import { test, expect, helpers } from '../fixtures'

test.describe('📋 Wizard de Contratos', () => {
  test.describe('Iniciar Wizard', () => {
    test('debe mostrar selector de tipo de contrato', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange & Act
      await wizardContratoPage.goto()
      
      // Assert
      await expect(page.locator('h1')).toContainText(/tipo de contrato|Qué tipo/i)
      
      // Verificar que existen los tipos de contrato
      await expect(wizardContratoPage.tipoCards.nuevo).toBeVisible()
      await expect(wizardContratoPage.tipoCards.renovacion).toBeVisible()
      await expect(wizardContratoPage.tipoCards.programatico).toBeVisible()
      await expect(wizardContratoPage.tipoCards.marco).toBeVisible()
    })

    test('debe seleccionar tipo de contrato "Nuevo" y continuar', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      
      // Act
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      // Assert - Debería mostrar el wizard con pasos
      await expect(page.locator('text=Paso 1')).toBeVisible()
      await expect(page.locator('[class*="progress"], [class*="step"]').first()).toBeVisible()
    })

    test('debe seleccionar tipo de contrato "Renovación"', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      
      // Act
      await wizardContratoPage.selectTipoContrato('renovacion')
      await wizardContratoPage.clickContinuar()
      
      // Assert
      await expect(page.locator('text=Paso 1, text=Info Fundamental')).toBeVisible()
    })

    test('debe deshabilitar botón continuar hasta seleccionar tipo', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      
      // Assert - Botón debería estar deshabilitado inicialmente
      await expect(wizardContratoPage.continuarButton).toBeDisabled()
      
      // Act
      await wizardContratoPage.selectTipoContrato('nuevo')
      
      // Assert - Botón debería estar habilitado
      await expect(wizardContratoPage.continuarButton).toBeEnabled()
    })
  })

  test.describe('Completar Pasos del Wizard', () => {
    test('debe completar Paso 1: Información Fundamental', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      // Act
      await wizardContratoPage.fillStep1({
        nombreContrato: helpers.generateUniqueName('Contrato Test'),
      })
      
      // Assert
      await expect(wizardContratoPage.nombreContratoInput).toHaveValue(/Contrato Test/)
    })

    test('debe navegar a través de todos los pasos', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      await wizardContratoPage.fillStep1({
        nombreContrato: 'Contrato Navegación',
      })
      
      // Act - Navegar por todos los pasos
      await wizardContratoPage.clickSiguiente() // Paso 2
      await wizardContratoPage.clickSiguiente() // Paso 3
      await wizardContratoPage.clickSiguiente() // Paso 4
      await wizardContratoPage.clickSiguiente() // Paso 5
      
      // Assert - Debería estar en el último paso
      const currentStep = await wizardContratoPage.getCurrentStep()
      expect(currentStep).toBeGreaterThanOrEqual(5)
    })

    test('debe permitir retroceder entre pasos', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      const nombreContrato = 'Contrato Retroceso'
      await wizardContratoPage.fillStep1({ nombreContrato })
      await wizardContratoPage.clickSiguiente()
      
      // Act - Retroceder
      await wizardContratoPage.clickAnterior()
      
      // Assert - Los datos deberían persistir
      await expect(wizardContratoPage.nombreContratoInput).toHaveValue(nombreContrato)
    })

    test('debe completar Paso 2: Términos Comerciales', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      await wizardContratoPage.fillStep1({ nombreContrato: 'Test Términos' })
      await wizardContratoPage.clickSiguiente()
      
      // Act
      await wizardContratoPage.fillStep2({
        monto: '1000000',
        moneda: 'CLP',
      })
      
      // Assert
      await expect(wizardContratoPage.montoInput).toHaveValue('1000000')
    })

    test('debe completar Paso 3: Especificaciones', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      await wizardContratoPage.fillStep1({ nombreContrato: 'Test Especificaciones' })
      await wizardContratoPage.clickSiguiente()
      await wizardContratoPage.fillStep2({ monto: '500000' })
      await wizardContratoPage.clickSiguiente()
      
      // Act
      const fechaInicio = new Date().toISOString().split('T')[0]
      const fechaFin = helpers.futureDate(90)
      
      await wizardContratoPage.fillStep3({
        fechaInicio,
        fechaFin,
      })
      
      // Assert
      await expect(wizardContratoPage.fechaInicioInput).toHaveValue(fechaInicio)
      await expect(wizardContratoPage.fechaFinInput).toHaveValue(fechaFin)
    })

    test('debe validar que fecha fin sea posterior a fecha inicio', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      await wizardContratoPage.fillStep1({ nombreContrato: 'Test Fechas' })
      await wizardContratoPage.clickSiguiente()
      await wizardContratoPage.fillStep2({ monto: '100000' })
      await wizardContratoPage.clickSiguiente()
      
      // Act - Ingresar fechas inválidas
      const hoy = new Date().toISOString().split('T')[0]
      const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      
      await wizardContratoPage.fechaInicioInput.fill(hoy)
      await wizardContratoPage.fechaFinInput.fill(ayer)
      
      // Assert - Debería mostrar error de validación
      await wizardContratoPage.clickSiguiente()
      await expect(wizardContratoPage.page.locator('text=fecha, text=posterior, text=válida').first()).toBeVisible()
    })
  })

  test.describe('Generar Contrato', () => {
    test('debe completar todo el wizard y generar contrato', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange
      const nombreContrato = helpers.generateUniqueName('Contrato E2E')
      const fechaInicio = new Date().toISOString().split('T')[0]
      const fechaFin = helpers.futureDate(180)
      
      await wizardContratoPage.goto()
      
      // Act
      await wizardContratoPage.completeWizard('nuevo', {
        nombreContrato,
        monto: '2500000',
        fechaInicio,
        fechaFin,
      })
      
      // Assert
      await expect(page).toHaveURL(/\/contratos\//, { timeout: 20000 })
      await expect(page.locator('text=creado, text=generado, text=éxito').first()).toBeVisible()
    })

    test('debe mostrar mensaje de éxito al crear contrato', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      // Completar todos los pasos
      await wizardContratoPage.fillStep1({ nombreContrato: 'Contrato Éxito' })
      await wizardContratoPage.clickSiguiente()
      await wizardContratoPage.fillStep2({ monto: '1000000' })
      await wizardContratoPage.clickSiguiente()
      await wizardContratoPage.fillStep3({
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: helpers.futureDate(30),
      })
      await wizardContratoPage.clickSiguiente()
      await wizardContratoPage.clickSiguiente() // Paso 4
      await wizardContratoPage.clickSiguiente() // Paso 5
      
      // Act - Guardar
      await wizardContratoPage.clickGuardar()
      
      // Assert
      await expect(page.locator('text=creado, text=exitosamente, text=success').first()).toBeVisible({ timeout: 15000 })
    })

    test('debe mostrar resumen del contrato creado', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange
      const nombreContrato = helpers.generateUniqueName('Contrato Resumen')
      
      await wizardContratoPage.goto()
      await wizardContratoPage.completeWizard('nuevo', {
        nombreContrato,
        monto: '3000000',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: helpers.futureDate(60),
      })
      
      // Esperar redirección
      await page.waitForURL(/\/contratos\//, { timeout: 20000 })
      
      // Assert - Verificar que se muestra información del contrato
      await expect(page.locator(`text=${nombreContrato}`)).toBeVisible()
    })
  })

  test.describe('Funcionalidades Adicionales', () => {
    test('debe permitir guardar como borrador', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      await wizardContratoPage.fillStep1({ nombreContrato: 'Borrador Test' })
      
      // Act - Guardar como borrador (si está disponible)
      const borradorButton = wizardContratoPage.page.locator('button:has-text("Borrador")')
      if (await borradorButton.isVisible().catch(() => false)) {
        await borradorButton.click()
        
        // Assert
        await expect(wizardContratoPage.page.locator('text=borrador, text=guardado').first()).toBeVisible()
      }
    })

    test('debe mostrar barra de progreso correctamente', async ({ 
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      // Assert - Verificar progreso inicial
      await expect(wizardContratoPage.progressBar).toBeVisible()
      
      // Act - Avanzar pasos
      await wizardContratoPage.fillStep1({ nombreContrato: 'Test Progreso' })
      await wizardContratoPage.clickSiguiente()
      
      // Assert - Progreso debería actualizarse
      await expect(wizardContratoPage.page.locator('[class*="bg-indigo-500"], [class*="bg-emerald"]').first()).toBeVisible()
    })

    test('debe cancelar wizard y volver a lista de contratos', async ({ 
      page,
      wizardContratoPage 
    }) => {
      // Arrange
      await wizardContratoPage.goto()
      await wizardContratoPage.selectTipoContrato('nuevo')
      await wizardContratoPage.clickContinuar()
      
      // Act
      await wizardContratoPage.cancelarButton.click()
      
      // Assert
      await expect(page).toHaveURL(/\/(contratos|comando)/, { timeout: 5000 })
    })
  })
})
