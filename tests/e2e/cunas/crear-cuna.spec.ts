/**
 * E2E Tests - Flujo de Creación de Cuñas
 * 
 * @file tests/e2e/cunas/crear-cuna.spec.ts
 * @description Tests para navegar a cuñas, crear nueva cuña y verificar guardado
 */

import { test, expect, helpers } from '../fixtures'

test.describe('🎵 Módulo de Cuñas - Crear Cuña', () => {
  test.describe('Navegación a Cuñas', () => {
    test('debe cargar la página de cuñas desde el menú de navegación', async ({ 
      authenticatedPage,
      dashboardPage 
    }) => {
      // Arrange - Usuario autenticado
      const page = authenticatedPage
      await dashboardPage.goto()
      
      // Act
      await dashboardPage.navigateTo('cunas')
      
      // Assert
      await expect(page).toHaveURL(/\/cunas/)
      await expect(page.locator('h1:has-text("Centro de Operaciones")')).toBeVisible()
    })

    test('debe mostrar métricas de cuñas al cargar la página', async ({ 
      cunasPage 
    }) => {
      // Arrange & Act
      await cunasPage.goto()
      
      // Assert
      await expect(cunasPage.heading).toBeVisible()
      
      // Verificar que hay métricas visibles
      const metricCount = await cunasPage.page.locator('[class*="grid"] > div').count()
      expect(metricCount).toBeGreaterThan(0)
    })

    test('debe mostrar lista de cuñas existentes', async ({ 
      cunasPage 
    }) => {
      // Arrange & Act
      await cunasPage.goto()
      
      // Assert
      const cunaCount = await cunasPage.getCunaCount()
      
      // La lista debería cargar (puede estar vacía en entorno de test)
      await expect(cunasPage.cunasList.or(cunasPage.page.locator('text=No hay cuñas'))).toBeVisible()
    })

    test('debe permitir búsqueda de cuñas', async ({ 
      cunasPage 
    }) => {
      // Arrange
      await cunasPage.goto()
      
      // Act
      await cunasPage.searchCuna('Spot')
      
      // Assert - La búsqueda debería ejecutarse sin errores
      await expect(cunasPage.searchInput).toHaveValue('Spot')
    })

    test('debe tener accesos rápidos a otras secciones funcionales', async ({ 
      cunasPage 
    }) => {
      // Arrange
      await cunasPage.goto()
      
      // Act & Assert - Verificar que existen los botones de acceso rápido
      await expect(cunasPage.quickAccessButtons.dashboard).toBeVisible()
      await expect(cunasPage.quickAccessButtons.programacion).toBeVisible()
      await expect(cunasPage.quickAccessButtons.inbox).toBeVisible()
    })
  })

  test.describe('Crear Nueva Cuña', () => {
    test('debe navegar al wizard de creación de cuña', async ({ 
      page,
      cunasPage 
    }) => {
      // Arrange
      await cunasPage.goto()
      
      // Act
      await cunasPage.clickNuevaCuna()
      
      // Assert
      await expect(page).toHaveURL(/\/cunas\/nuevo/)
      await expect(page.locator('h1, h2').filter({ hasText: /Crear|Nueva|Wizard/i })).toBeVisible()
    })

    test('debe completar el paso 1: Información Básica', async ({ 
      crearCunaPage 
    }) => {
      // Arrange
      await crearCunaPage.goto()
      
      // Act
      await crearCunaPage.fillPaso1({
        nombre: helpers.generateUniqueName('Cuña Test'),
        tipo: 'audio',
        descripcion: 'Descripción de prueba para cuña E2E',
        duracion: '30',
      })
      
      // Assert
      await expect(crearCunaPage.nombreInput).toHaveValue(/Cuña Test/)
      await expect(crearCunaPage.descripcionInput).toHaveValue('Descripción de prueba para cuña E2E')
    })

    test('debe navegar entre pasos del wizard', async ({ 
      crearCunaPage 
    }) => {
      // Arrange
      await crearCunaPage.goto()
      await crearCunaPage.fillPaso1({
        nombre: 'Test Navegación',
      })
      
      // Act - Avanzar al paso 2
      await crearCunaPage.clickSiguiente()
      
      // Assert - Debería estar en el paso 2 (Contenido)
      await expect(crearCunaPage.page.locator('text=Contenido, text=audio, text=mención')).toBeVisible()
      
      // Act - Retroceder al paso 1
      await crearCunaPage.clickAnterior()
      
      // Assert - Debería volver al paso 1
      await expect(crearCunaPage.nombreInput).toHaveValue('Test Navegación')
    })

    test('debe completar el wizard y crear una cuña', async ({ 
      page,
      crearCunaPage 
    }) => {
      // Arrange
      const nombreCuña = helpers.generateUniqueName('Cuña E2E')
      const fechaInicio = new Date().toISOString().split('T')[0]
      const fechaFin = helpers.futureDate(30)
      
      await crearCunaPage.goto()
      
      // Act
      await crearCunaPage.completeWizard({
        nombre: nombreCuña,
        tipo: 'audio',
        descripcion: 'Cuña creada automáticamente por test E2E',
        duracion: '30',
        fechaInicio,
        fechaFin,
        urgencia: 'programada',
      })
      
      // Assert
      await expect(page).toHaveURL(/\/cunas\//, { timeout: 15000 })
      
      // Verificar que la cuña fue creada (verificar mensaje de éxito o redirección a detalle)
      await expect(page.locator('text=creada, text=guardada, text=éxito').first()).toBeVisible()
    })
  })

  test.describe('Verificar Guardado', () => {
    test('debe mostrar la cuña recién creada en la lista', async ({ 
      page,
      crearCunaPage,
      cunasPage 
    }) => {
      // Arrange - Crear una cuña
      const nombreCuña = helpers.generateUniqueName('Cuña Verificar')
      
      await crearCunaPage.goto()
      await crearCunaPage.completeWizard({
        nombre: nombreCuña,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: helpers.futureDate(30),
      })
      
      // Esperar redirección
      await page.waitForURL(/\/cunas\//, { timeout: 15000 })
      
      // Act - Ir a la lista de cuñas
      await cunasPage.goto()
      await cunasPage.searchCuna(nombreCuña)
      
      // Assert - La cuña debería aparecer en la lista
      await expect(page.locator(`text=${nombreCuña}`)).toBeVisible()
    })

    test('debe mostrar los detalles correctos de la cuña creada', async ({ 
      page,
      crearCunaPage 
    }) => {
      // Arrange
      const nombreCuña = helpers.generateUniqueName('Cuña Detalle')
      const descripcion = 'Descripción detallada de prueba'
      
      await crearCunaPage.goto()
      await crearCunaPage.completeWizard({
        nombre: nombreCuña,
        descripcion,
        duracion: '45',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: helpers.futureDate(30),
      })
      
      // Esperar redirección a detalle
      await page.waitForURL(/\/cunas\//, { timeout: 15000 })
      
      // Assert - Verificar datos guardados
      await expect(page.locator(`text=${nombreCuña}`)).toBeVisible()
      await expect(page.locator(`text=${descripcion}`)).toBeVisible()
    })

    test('debe permitir cancelar la creación de cuña', async ({ 
      page,
      crearCunaPage 
    }) => {
      // Arrange
      await crearCunaPage.goto()
      await crearCunaPage.fillPaso1({
        nombre: 'Cuña Cancelada',
      })
      
      // Act
      await crearCunaPage.clickCancelar()
      
      // Assert - Debería redirigir a la lista de cuñas o mostrar confirmación
      await expect(page).toHaveURL(/\/(cunas|confirm)/, { timeout: 5000 })
    })
  })

  test.describe('Validaciones', () => {
    test('debe mostrar error cuando el nombre está vacío', async ({ 
      crearCunaPage 
    }) => {
      // Arrange
      await crearCunaPage.goto()
      
      // Act - Intentar avanzar sin nombre
      await crearCunaPage.clickSiguiente()
      
      // Assert
      await expect(crearCunaPage.page.locator('text=nombre es requerido, text=campo obligatorio').first()).toBeVisible()
    })

    test('debe validar formato de duración numérica', async ({ 
      crearCunaPage 
    }) => {
      // Arrange
      await crearCunaPage.goto()
      
      // Act
      await crearCunaPage.duracionInput.fill('abc')
      
      // Assert - El campo debería validar o no aceptar letras
      const value = await crearCunaPage.duracionInput.inputValue()
      expect(value).not.toMatch(/[a-zA-Z]/)
    })
  })
})
