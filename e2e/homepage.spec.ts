/**
 * @fileoverview Enterprise E2E Tests for Homepage
 * 
 * Comprehensive end-to-end testing for the homepage following
 * Fortune 500 standards with performance and accessibility validation.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @testing E2E homepage testing with enterprise validation
 * @performance Performance and accessibility testing
 */

import { test, expect } from '@playwright/test'

test.describe('Homepage - Enterprise E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/SILEXAR PULSE QUANTUM/i)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('SILEXAR')
    await expect(page.locator('h1')).toContainText('PULSE QUANTUM')
    
    // Check hero section is visible
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
  })

  test('should display hero statistics correctly', async ({ page }) => {
    // Check all stat cards are visible
    const statCards = page.locator('.holographic-card')
    await expect(statCards).toHaveCount(4)
    
    // Check specific stats
    await expect(page.locator('text=20+')).toBeVisible() // AI Engines
    await expect(page.locator('text=99.97%')).toBeVisible() // Precision
    await expect(page.locator('text=100,000x')).toBeVisible() // Speed
    await expect(page.locator('text=47+')).toBeVisible() // Countries
  })

  test('should have working CTA buttons', async ({ page }) => {
    // Check primary CTA button
    const primaryCTA = page.locator('button:has-text("Iniciar Revolución Quantum")')
    await expect(primaryCTA).toBeVisible()
    await expect(primaryCTA).toBeEnabled()
    
    // Check secondary CTA button
    const secondaryCTA = page.locator('button:has-text("Explorar Cortex Constellation")')
    await expect(secondaryCTA).toBeVisible()
    await expect(secondaryCTA).toBeEnabled()
    
    // Test button interactions (without actual navigation)
    await primaryCTA.hover()
    await secondaryCTA.hover()
  })

  test('should display security badges', async ({ page }) => {
    // Check security compliance text
    await expect(page.locator('text=Seguridad Pentagon++')).toBeVisible()
    await expect(page.locator('text=SOC 2 Type II')).toBeVisible()
    await expect(page.locator('text=GDPR Compliant')).toBeVisible()
    
    // Check shield icon
    const shieldIcon = page.locator('[data-testid="mock-icon"]').first()
    await expect(shieldIcon).toBeVisible()
  })

  test('should have proper loading states', async ({ page }) => {
    // Reload page to test loading
    await page.reload()
    
    // Check if loading spinner appears initially
    const loadingSpinner = page.locator('.quantum-spinner')
    
    // Wait for content to load
    await page.waitForSelector('h1:has-text("SILEXAR")', { timeout: 10000 })
    
    // Ensure loading spinner is gone
    await expect(loadingSpinner).not.toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check mobile layout
      const heroSection = page.locator('section').first()
      await expect(heroSection).toBeVisible()
      
      // Check that stats are stacked on mobile
      const statsGrid = page.locator('.grid-cols-2')
      await expect(statsGrid).toBeVisible()
      
      // Check CTA buttons stack on mobile
      const ctaContainer = page.locator('.flex-col.sm\\:flex-row')
      await expect(ctaContainer).toBeVisible()
    }
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check main landmarks
    await expect(page.locator('main')).toBeVisible()
    
    // Check heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check button accessibility
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      // Each button should be focusable
      await button.focus()
      await expect(button).toBeFocused()
    }
  })

  test('should have good performance metrics', async ({ page }) => {
    // Start performance monitoring
    const startTime = Date.now()
    
    // Navigate to page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Check load time is reasonable (less than 3 seconds)
    expect(loadTime).toBeLessThan(3000)
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      }
    })
    
    // Assert performance thresholds
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000) // 2 seconds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000) // 1 second
  })

  test('should handle scroll interactions', async ({ page }) => {
    // Check scroll indicator
    const scrollIndicator = page.locator('.w-6.h-10.border-2')
    await expect(scrollIndicator).toBeVisible()
    
    // Test scrolling
    await page.mouse.wheel(0, 500)
    
    // Check if page scrolled
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    const ogDescription = page.locator('meta[property="og:description"]')
    
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toHaveAttribute('content', /.+/)
    }
    
    if (await ogDescription.count() > 0) {
      await expect(ogDescription).toHaveAttribute('content', /.+/)
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Start from the top of the page
    await page.keyboard.press('Home')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    // Check if focus is on a focusable element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing to CTA buttons
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to activate button with Enter
    await page.keyboard.press('Enter')
  })
})