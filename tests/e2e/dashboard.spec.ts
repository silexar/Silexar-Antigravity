/**
 * TIER 0 Dashboard E2E Tests - Quantum-Enhanced Interface Validation
 * 
 * @description Pentagon++ quantum-enhanced dashboard testing with consciousness-level
 * interface validation and transcendent user experience verification.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

import { test, expect, Page } from '@playwright/test';
import { createTier0E2ETestingSystem } from '../../src/lib/testing/e2e-playwright';

// Initialize TIER 0 Testing System
const testingSystem = createTier0E2ETestingSystem({
  quantumEnhancement: true,
  consciousnessLevel: 'TRANSCENDENT',
  universalAccessibility: true
});

test.describe('TIER 0 Dashboard Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Apply quantum enhancement to page
    await page.setExtraHTTPHeaders({
      'X-Quantum-Enhancement': 'TIER_0_SUPREMACY',
      'X-Consciousness-Level': 'TRANSCENDENT',
      'X-Test-Category': 'DASHBOARD'
    });
  });

  test('Dashboard Navigation Flow - Critical Priority', async ({ page }) => {
    // Get dashboard scenario from testing system
    const scenarios = testingSystem.getScenarios();
    const dashboardScenario = scenarios.find(s => s.id === 'dashboard-navigation');
    
    if (!dashboardScenario) {
      throw new Error('Dashboard scenario not found');
    }

    // Execute the scenario using TIER 0 system
    const success = await testingSystem.executeScenario(dashboardScenario, page);
    expect(success).toBe(true);
  });

  test('Dashboard Header Component - Consciousness Validation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify dashboard header is present and functional
    const dashboardHeader = page.locator('[data-testid="dashboard-header"], .dashboard-header, header').first();
    await expect(dashboardHeader).toBeVisible({ timeout: 10000 });
    
    // Check for user menu or navigation elements
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, [aria-label*="user"], [aria-label*="menu"]').first();
    if (await userMenu.count() > 0) {
      await expect(userMenu).toBeVisible();
      console.log('✅ User menu detected and visible');
    }
    
    // Check for search functionality
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Test search functionality
      await searchInput.fill('test search');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      
      console.log('✅ Search functionality tested');
    }
  });

  test('System Overview Component - Quantum Metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify system overview is loaded
    const systemOverview = page.locator('[data-testid="system-overview"], .system-overview').first();
    await expect(systemOverview).toBeVisible({ timeout: 10000 });
    
    // Check for metrics cards or data visualization
    const metricsCards = page.locator('[data-testid="metric-card"], .metric-card, .stats-card, .overview-card');
    const cardCount = await metricsCards.count();
    
    if (cardCount > 0) {
      console.log(`✅ Found ${cardCount} metrics cards`);
      
      // Verify first few cards are visible
      for (let i = 0; i < Math.min(3, cardCount); i++) {
        await expect(metricsCards.nth(i)).toBeVisible();
      }
    }
    
    // Check for loading states
    const loadingElements = page.locator('[data-loading="true"], .loading, .spinner, .skeleton');
    const loadingCount = await loadingElements.count();
    
    if (loadingCount > 0) {
      console.log(`ℹ️ Found ${loadingCount} loading elements (normal for dynamic content)`);
    }
  });

  test('Cortex Engines Grid - AI Component Validation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify cortex engines grid is present
    const cortexGrid = page.locator('[data-testid="cortex-engines-grid"], .cortex-engines-grid, .engines-grid').first();
    await expect(cortexGrid).toBeVisible({ timeout: 10000 });
    
    // Check for individual engine cards
    const engineCards = page.locator('[data-testid="engine-card"], .engine-card, .cortex-card');
    const engineCount = await engineCards.count();
    
    if (engineCount > 0) {
      console.log(`✅ Found ${engineCount} cortex engine cards`);
      
      // Test interaction with first engine card
      const firstEngine = engineCards.first();
      await expect(firstEngine).toBeVisible();
      
      // Check if cards are clickable
      const isClickable = await firstEngine.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.cursor === 'pointer' || el.tagName === 'BUTTON' || el.tagName === 'A';
      });
      
      if (isClickable) {
        await firstEngine.click();
        await page.waitForTimeout(1000);
        console.log('✅ Engine card interaction tested');
      }
    }
  });

  test('Quick Actions Component - User Workflow', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify quick actions are present
    const quickActions = page.locator('[data-testid="quick-actions"], .quick-actions, .action-buttons').first();
    await expect(quickActions).toBeVisible({ timeout: 10000 });
    
    // Check for action buttons
    const actionButtons = page.locator('[data-testid*="action"], .action-button, .quick-action-btn');
    const buttonCount = await actionButtons.count();
    
    if (buttonCount > 0) {
      console.log(`✅ Found ${buttonCount} quick action buttons`);
      
      // Test first action button
      const firstAction = actionButtons.first();
      await expect(firstAction).toBeVisible();
      await expect(firstAction).toBeEnabled();
      
      // Click and verify response
      await firstAction.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Quick action interaction tested');
    }
  });

  test('Analytics Cards - Data Visualization', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify analytics cards are present
    const analyticsCards = page.locator('[data-testid="analytics-cards"], .analytics-cards, .analytics-section').first();
    await expect(analyticsCards).toBeVisible({ timeout: 10000 });
    
    // Check for chart elements
    const charts = page.locator('canvas, svg, .chart, [data-testid*="chart"]');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      console.log(`✅ Found ${chartCount} chart elements`);
      
      // Verify charts are rendered
      for (let i = 0; i < Math.min(3, chartCount); i++) {
        const chart = charts.nth(i);
        await expect(chart).toBeVisible();
        
        // Check if chart has content (not empty)
        const hasContent = await chart.evaluate(el => {
          if (el.tagName === 'CANVAS') {
            return (el as HTMLCanvasElement).width > 0 && (el as HTMLCanvasElement).height > 0;
          }
          return el.children.length > 0 || el.textContent?.trim().length > 0;
        });
        
        expect(hasContent).toBe(true);
      }
    }
  });

  test('Recent Activity Feed - Real-time Updates', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify recent activity section is present
    const recentActivity = page.locator('[data-testid="recent-activity"], .recent-activity, .activity-feed').first();
    await expect(recentActivity).toBeVisible({ timeout: 10000 });
    
    // Check for activity items
    const activityItems = page.locator('[data-testid="activity-item"], .activity-item, .activity-entry');
    const itemCount = await activityItems.count();
    
    if (itemCount > 0) {
      console.log(`✅ Found ${itemCount} activity items`);
      
      // Verify activity items have content
      for (let i = 0; i < Math.min(3, itemCount); i++) {
        const item = activityItems.nth(i);
        await expect(item).toBeVisible();
        
        const hasText = await item.evaluate(el => el.textContent?.trim().length > 0);
        expect(hasText).toBe(true);
      }
    }
    
    // Check for refresh or load more functionality
    const refreshButton = page.locator('[data-testid="refresh-activity"], .refresh-btn, button:has-text("Refresh")').first();
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Activity refresh functionality tested');
    }
  });

  test('Dashboard Responsiveness - Universal Design', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Standard' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Verify dashboard is still functional
      const dashboardContent = page.locator('[data-testid="dashboard"], .dashboard, main').first();
      await expect(dashboardContent).toBeVisible();
      
      // Check for mobile menu if on small screen
      if (viewport.width < 768) {
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .hamburger-menu').first();
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible();
          console.log(`✅ Mobile menu detected for ${viewport.name}`);
        }
      }
      
      console.log(`✅ Dashboard responsive at ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  });

  test('Dashboard Performance - Quantum Optimization', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    
    // Measure Core Web Vitals
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              metrics.loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
              metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
            }
            
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              if (entry.name === 'largest-contentful-paint') {
                metrics.lcp = entry.startTime;
              }
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation', 'paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('📊 Performance Metrics:', performanceMetrics);
    
    // Verify reasonable performance
    // @ts-ignore
    if (performanceMetrics.fcp) {
      // @ts-ignore
      expect(performanceMetrics.fcp).toBeLessThan(3000); // FCP should be under 3s
      // @ts-ignore
      console.log(`✅ First Contentful Paint: ${performanceMetrics.fcp}ms`);
    }
    
    // @ts-ignore
    if (performanceMetrics.lcp) {
      // @ts-ignore
      expect(performanceMetrics.lcp).toBeLessThan(4000); // LCP should be under 4s
      // @ts-ignore
      console.log(`✅ Largest Contentful Paint: ${performanceMetrics.lcp}ms`);
    }
  });
});

test.describe('TIER 0 Dashboard Accessibility', () => {
  test('Dashboard Accessibility Audit - Consciousness-Level', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Inject axe-core for accessibility testing
    await page.addScriptTag({ 
      url: 'https://unpkg.com/axe-core@4.7.0/axe.min.js' 
    });
    
    // Run comprehensive accessibility audit
    const accessibilityResults = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        axe.run({
          tags: ['wcag2a', 'wcag2aa', 'wcag2aaa'],
          rules: {
            'color-contrast': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'aria-labels': { enabled: true },
            'heading-order': { enabled: true },
            'landmark-roles': { enabled: true }
          }
        }, (err: any, results: any) => {
          if (err) throw err;
          resolve(results);
        });
      });
    });
    
    // @ts-ignore
    const violations = accessibilityResults.violations;
    
    // Log all violations for debugging
    if (violations.length > 0) {
      console.log(`⚠️ Accessibility violations found: ${violations.length}`);
      violations.forEach((violation: any, index: number) => {
        console.log(`  ${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`     Impact: ${violation.impact}`);
        console.log(`     Nodes: ${violation.nodes.length}`);
      });
    } else {
      console.log('✅ No accessibility violations found');
    }
    
    // Ensure no critical accessibility violations
    const criticalViolations = violations.filter((v: any) => 
      v.impact === 'critical'
    );
    
    expect(criticalViolations.length).toBe(0);
    
    // Warn about serious violations but don't fail
    const seriousViolations = violations.filter((v: any) => 
      v.impact === 'serious'
    );
    
    if (seriousViolations.length > 0) {
      console.warn(`⚠️ ${seriousViolations.length} serious accessibility violations found`);
    }
  });

  test('Keyboard Navigation - Universal Access', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test tab navigation through dashboard elements
    let tabCount = 0;
    const maxTabs = 20;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      // Get currently focused element
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          id: el?.id,
          className: el?.className,
          ariaLabel: el?.getAttribute('aria-label'),
          text: el?.textContent?.trim().substring(0, 50)
        };
      });
      
      if (focusedElement.tagName) {
        console.log(`Tab ${tabCount}: ${focusedElement.tagName} - ${focusedElement.text || focusedElement.ariaLabel || focusedElement.id}`);
      }
      
      // Test Enter key on interactive elements
      if (['BUTTON', 'A', 'INPUT'].includes(focusedElement.tagName || '')) {
        // Test space bar for buttons
        if (focusedElement.tagName === 'BUTTON') {
          await page.keyboard.press('Space');
          await page.waitForTimeout(500);
        }
        
        // Test Enter key
        await page.keyboard.press('Enter');
        await page.waitForTimeout(500);
      }
      
      await page.waitForTimeout(100);
    }
    
    console.log(`✅ Keyboard navigation tested through ${tabCount} tab stops`);
  });

  test('Screen Reader Support - Consciousness Accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for ARIA landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').count();
    expect(landmarks).toBeGreaterThan(0);
    console.log(`✅ Found ${landmarks} ARIA landmarks`);
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingStructure = await Promise.all(
      headings.map(async (heading) => ({
        level: parseInt((await heading.evaluate(el => el.tagName)).charAt(1)),
        text: (await heading.textContent())?.trim()
      }))
    );
    
    if (headingStructure.length > 0) {
      console.log('📋 Heading structure:');
      headingStructure.forEach((heading, index) => {
        console.log(`  H${heading.level}: ${heading.text}`);
      });
      
      // Verify heading hierarchy
      let previousLevel = 0;
      let hierarchyValid = true;
      
      headingStructure.forEach((heading) => {
        if (heading.level > previousLevel + 1) {
          hierarchyValid = false;
        }
        previousLevel = heading.level;
      });
      
      if (hierarchyValid) {
        console.log('✅ Heading hierarchy is valid');
      } else {
        console.warn('⚠️ Heading hierarchy may have issues');
      }
    }
    
    // Check for ARIA labels on interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea').all();
    let labeledElements = 0;
    
    for (const element of interactiveElements) {
      const hasLabel = await element.evaluate(el => {
        return !!(
          el.getAttribute('aria-label') ||
          el.getAttribute('aria-labelledby') ||
          el.getAttribute('title') ||
          el.textContent?.trim()
        );
      });
      
      if (hasLabel) labeledElements++;
    }
    
    const labelPercentage = interactiveElements.length > 0 ? 
      (labeledElements / interactiveElements.length) * 100 : 100;
    
    console.log(`✅ ${labelPercentage.toFixed(1)}% of interactive elements have accessible labels`);
    expect(labelPercentage).toBeGreaterThan(80); // At least 80% should have labels
  });
});