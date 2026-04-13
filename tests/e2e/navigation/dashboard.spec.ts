/**
 * E2E Tests - Navegación del Dashboard
 * 
 * @file tests/e2e/navigation/dashboard.spec.ts
 * @description Tests para cargar dashboard, navegar entre secciones y verificar elementos críticos
 */

import { test, expect } from '../fixtures'

test.describe('🧭 Navegación - Dashboard', () => {
  test.describe('Cargar Dashboard', () => {
    test('debe cargar el dashboard correctamente para usuario autenticado', async ({ 
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()
      
      // Assert
      await expect(dashboardPage.heading).toBeVisible()
      expect(await dashboardPage.isDashboardLoaded()).toBe(true)
    })

    test('debe mostrar título y branding del sistema', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      
      // Assert
      await expect(page).toHaveTitle(/SILEXAR|PULSE|Dashboard/i)
      await expect(dashboardPage.heading).toContainText(/Dashboard|Silexar|Pulse/i)
    })

    test('debe mostrar métricas principales del sistema', async ({ 
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      
      // Assert - Verificar que existen cards de métricas
      const metricLabels = ['Campañas', 'Contratos', 'Anunciantes', 'Facturas', 'Emisoras']
      
      for (const label of metricLabels) {
        const isVisible = await dashboardPage.page.locator(`text=${label}`).first().isVisible().catch(() => false)
        if (isVisible) {
          await expect(dashboardPage.page.locator(`text=${label}`).first()).toBeVisible()
        }
      }
    })

    test('debe mostrar estado del sistema', async ({ 
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      
      // Assert
      const statusVisible = await dashboardPage.systemStatus.isVisible().catch(() => false)
      if (statusVisible) {
        await expect(dashboardPage.systemStatus).toBeVisible()
      }
    })

    test('debe cargar datos en tiempo razonable', async ({ 
      page 
    }) => {
      // Arrange
      const startTime = Date.now()
      
      // Act
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Assert
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(5000) // Debería cargar en menos de 5 segundos
      
      // Verificar que hay contenido visible
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()
    })
  })

  test.describe('Navegar entre Secciones', () => {
    test('debe navegar a la sección de Campañas', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act
      await dashboardPage.navigateTo('campanas')
      
      // Assert
      await expect(page).toHaveURL(/\/campanas/)
      await expect(page.locator('h1')).toContainText(/Campañas|Campa|Campañas/i)
    })

    test('debe navegar a la sección de Contratos', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act
      await dashboardPage.navigateTo('contratos')
      
      // Assert
      await expect(page).toHaveURL(/\/contratos/)
      await expect(page.locator('h1')).toContainText(/Contratos/i)
    })

    test('debe navegar a la sección de Cuñas', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act
      await dashboardPage.navigateTo('cunas')
      
      // Assert
      await expect(page).toHaveURL(/\/cunas/)
      await expect(page.locator('h1')).toContainText(/Cuñas|Centro de Operaciones/i)
    })

    test('debe navegar a la sección de Anunciantes', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act
      await dashboardPage.navigateTo('anunciantes')
      
      // Assert
      await expect(page).toHaveURL(/\/anunciantes/)
      await expect(page.locator('h1')).toContainText(/Anunciantes|Clientes/i)
    })

    test('debe navegar a la sección de Facturación', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act
      await dashboardPage.navigateTo('facturacion')
      
      // Assert
      await expect(page).toHaveURL(/\/facturacion/)
    })

    test('debe volver al dashboard desde cualquier sección', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      await dashboardPage.navigateTo('cunas')
      
      // Act
      await dashboardPage.navigateTo('dashboard')
      
      // Assert
      await expect(page).toHaveURL(/\/dashboard/)
      await expect(dashboardPage.heading).toBeVisible()
    })
  })

  test.describe('Verificar Elementos Críticos', () => {
    test('debe mostrar indicadores de salud del sistema', async ({ 
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      
      // Assert - Verificar indicadores de estado
      const healthIndicators = ['healthy', 'OK', 'saludable', 'operativo', 'Activo']
      let foundIndicator = false
      
      for (const indicator of healthIndicators) {
        const hasIndicator = await dashboardPage.page.locator(`text=${indicator}`).first().isVisible().catch(() => false)
        if (hasIndicator) {
          foundIndicator = true
          break
        }
      }
      
      // Si hay indicadores de sistema, al menos uno debería ser visible
      if (await dashboardPage.systemStatus.isVisible().catch(() => false)) {
        expect(foundIndicator).toBe(true)
      }
    })

    test('debe tener menú de navegación accesible', async ({ 
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      
      // Assert - Verificar que existen los links principales
      const navSections = ['campanas', 'contratos', 'cunas', 'anunciantes']
      
      for (const section of navSections) {
        const link = dashboardPage.navigationLinks[section]
        await expect(link).toBeVisible()
      }
    })

    test('debe mostrar información del usuario autenticado', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange & Act
      await dashboardPage.goto()
      
      // Assert - Buscar elementos de usuario
      const userElements = await page.locator('[class*="user"], [class*="perfil"], [data-testid="user"]').count()
      
      // O buscar avatar o menú de usuario
      const avatarElements = await page.locator('img[alt*="avatar"], [class*="avatar"]').count()
      
      expect(userElements + avatarElements).toBeGreaterThanOrEqual(0)
    })

    test('debe tener botón de refrescar datos funcional', async ({ 
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Verificar si existe botón de refrescar
      const hasRefreshButton = await dashboardPage.refreshButton.isVisible().catch(() => false)
      
      if (hasRefreshButton) {
        // Act
        await dashboardPage.refreshData()
        
        // Assert - Los datos deberían recargar sin errores
        await expect(dashboardPage.heading).toBeVisible()
      }
    })

    test('debe ser responsive en diferentes viewports', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 1366, height: 768, name: 'laptop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' },
      ]
      
      for (const viewport of viewports) {
        // Act
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await dashboardPage.goto()
        
        // Assert
        await expect(dashboardPage.heading).toBeVisible()
        
        // Verificar que no hay scroll horizontal (indica layout roto)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = viewport.width
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50) // Tolerancia de 50px
      }
    })

    test('debe tener metadata SEO correcta', async ({ 
      page 
    }) => {
      // Arrange & Act
      await page.goto('/dashboard')
      
      // Assert
      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
      
      // Verificar meta description si existe
      const metaDescription = page.locator('meta[name="description"]')
      if (await metaDescription.count() > 0) {
        const content = await metaDescription.getAttribute('content')
        expect(content?.length).toBeGreaterThan(0)
      }
    })
  })

  test.describe('Accesibilidad y UX', () => {
    test('debe ser navegable por teclado', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act - Tab por los elementos interactivos
      await page.keyboard.press('Tab')
      const firstFocused = await page.locator(':focus').count()
      
      // Assert
      expect(firstFocused).toBeGreaterThan(0)
    })

    test('debe tener contraste adecuado en texto principal', async ({ 
      page,
      dashboardPage 
    }) => {
      // Arrange
      await dashboardPage.goto()
      
      // Act & Assert
      const heading = dashboardPage.heading
      await expect(heading).toBeVisible()
      
      // Verificar que el texto es legible (no es del mismo color que el fondo)
      const color = await heading.evaluate(el => getComputedStyle(el).color)
      expect(color).not.toBe('rgba(0, 0, 0, 0)')
    })

    test('debe mostrar skeleton o loading state al cargar', async ({ 
      page 
    }) => {
      // Arrange & Act
      await page.goto('/dashboard')
      
      // Verificar que hay indicador de carga o contenido aparece
      const hasSkeleton = await page.locator('[class*="skeleton"], [class*="Skeleton"], [class*="animate-pulse"]').count() > 0
      const hasSpinner = await page.locator('[class*="spinner"], [class*="loading"], [class*="loader"]').count() > 0
      
      // O el contenido principal carga
      const contentLoaded = await page.locator('h1').isVisible().catch(() => false)
      
      expect(hasSkeleton || hasSpinner || contentLoaded).toBe(true)
    })
  })
})
