/**
 * E2E Tests - Flujo de Autenticación
 * 
 * @file tests/e2e/auth/login.spec.ts
 * @description Tests para login exitoso, credenciales inválidas y logout
 */

import { test, expect, testUsers } from '../fixtures'

test.describe('🔐 Autenticación - Flujo de Login', () => {
  test.describe('Login Exitoso', () => {
    test('debe iniciar sesión con credenciales válidas y redirigir al dashboard', async ({ 
      page, 
      loginPage 
    }) => {
      // Arrange
      const user = testUsers.admin
      
      // Act
      await loginPage.goto()
      await loginPage.login(user.email, user.password)
      
      // Assert
      await loginPage.expectSuccessState()
      
      // Verificar redirección
      await expect(page).toHaveURL(/\/(dashboard|super-admin|admin-cliente)/, { timeout: 10000 })
      
      // Verificar que el usuario está autenticado (no en login)
      expect(await loginPage.isOnLoginPage()).toBe(false)
    })

    test('debe recordar credenciales cuando se marca "Recordarme"', async ({ 
      page, 
      loginPage 
    }) => {
      // Arrange
      const user = testUsers.admin
      
      // Act
      await loginPage.goto()
      await loginPage.loginWithRememberMe(user.email, user.password)
      await loginPage.expectSuccessState()
      
      // Assert - El checkbox debería haber sido marcado
      const cookies = await page.context().cookies()
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'))
      
      // Si hay cookie de sesión, verificar que tiene expiración extendida
      if (sessionCookie) {
        expect(sessionCookie.expires).toBeGreaterThan(0)
      }
    })

    test('debe mostrar/ocultar contraseña al hacer click en el botón', async ({ 
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      await loginPage.passwordInput.fill('TestPassword123')
      
      // Act - Mostrar contraseña
      await loginPage.togglePasswordVisibility()
      
      // Assert
      const typeAfterShow = await loginPage.passwordInput.getAttribute('type')
      expect(typeAfterShow).toBe('text')
      
      // Act - Ocultar contraseña
      await loginPage.togglePasswordVisibility()
      
      // Assert
      const typeAfterHide = await loginPage.passwordInput.getAttribute('type')
      expect(typeAfterHide).toBe('password')
    })
  })

  test.describe('Login con Credenciales Inválidas', () => {
    test('debe mostrar error con email no registrado', async ({ 
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      
      // Act
      await loginPage.login('nonexistent@example.com', 'AnyPassword123')
      
      // Assert
      await loginPage.expectErrorMessage()
      await expect(loginPage.page.locator('text=Credenciales inválidas, text=email, text=usuario no encontrado').first()).toBeVisible()
    })

    test('debe mostrar error con contraseña incorrecta', async ({ 
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      
      // Act
      await loginPage.login(testUsers.admin.email, 'WrongPassword123')
      
      // Assert
      await loginPage.expectErrorMessage('Credenciales inválidas')
    })

    test('debe mostrar error cuando el email está vacío', async ({ 
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      
      // Act
      await loginPage.login('', 'SomePassword123')
      
      // Assert
      await expect(loginPage.page.locator('text=El email es requerido')).toBeVisible()
    })

    test('debe mostrar error cuando la contraseña está vacía', async ({ 
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      
      // Act
      await loginPage.login('test@example.com', '')
      
      // Assert
      await expect(loginPage.page.locator('text=La contraseña es requerida')).toBeVisible()
    })

    test('debe mantener el email ingresado después de un error', async ({ 
      loginPage 
    }) => {
      // Arrange
      const email = 'test@example.com'
      await loginPage.goto()
      
      // Act
      await loginPage.emailInput.fill(email)
      await loginPage.passwordInput.fill('wrong')
      await loginPage.loginButton.click()
      
      // Assert
      const emailValue = await loginPage.emailInput.inputValue()
      expect(emailValue).toBe(email)
    })
  })

  test.describe('Logout', () => {
    test('debe cerrar sesión y redirigir a login', async ({ 
      authenticatedPage,
      loginPage 
    }) => {
      // Arrange - Usuario ya autenticado via fixture
      const page = authenticatedPage
      
      // Act - Simular logout (navegar a logout o llamar API)
      // Nota: Ajustar según la implementación real de logout
      await page.goto('/api/auth/signout')
      await page.waitForLoadState('networkidle')
      
      // O si hay un botón de logout:
      // await page.locator('button:has-text("Cerrar sesión"), [data-testid="logout"]').click()
      
      // Assert
      await expect(page).toHaveURL(/\/(login|auth)/, { timeout: 10000 })
      
      // Verificar que no puede acceder a páginas protegidas
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/(login|auth)/, { timeout: 5000 })
    })

    test('debe limpiar cookies de sesión al hacer logout', async ({ 
      authenticatedPage 
    }) => {
      // Arrange
      const page = authenticatedPage
      
      // Verificar que existe cookie de sesión
      const cookiesBefore = await page.context().cookies()
      const sessionCookieBefore = cookiesBefore.find(c => 
        c.name.includes('session') || c.name.includes('auth') || c.name.includes('token')
      )
      
      if (sessionCookieBefore) {
        // Act - Logout
        await page.goto('/api/auth/signout')
        await page.waitForLoadState('networkidle')
        
        // Assert - Cookie debería ser eliminada o invalidada
        const cookiesAfter = await page.context().cookies()
        const sessionCookieAfter = cookiesAfter.find(c => c.name === sessionCookieBefore.name)
        
        expect(sessionCookieAfter?.value).not.toBe(sessionCookieBefore.value)
      }
    })
  })

  test.describe('Navegación y UX', () => {
    test('debe tener link a recuperar contraseña funcional', async ({ 
      page,
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      
      // Act
      await loginPage.clickForgotPassword()
      
      // Assert
      await expect(page).toHaveURL(/\/(forgot-password|recuperar)/)
    })

    test('debe permitir navegación por teclado (accesibilidad)', async ({ 
      loginPage 
    }) => {
      // Arrange
      await loginPage.goto()
      
      // Act - Tab por los campos
      await loginPage.page.keyboard.press('Tab')
      await loginPage.page.keyboard.press('Tab')
      
      // Assert - El foco debería estar en algún elemento interactivo
      const focusedElement = loginPage.page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })
})
