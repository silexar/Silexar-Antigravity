/**
 * @fileoverview Global Setup for E2E Testing
 * 
 * Global setup configuration for Playwright E2E tests with
 * database initialization and test environment preparation.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @testing E2E global setup
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...')
  
  // Set test environment variables
  Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true
  })
  process.env.NEXT_TELEMETRY_DISABLED = '1'
  
  // Wait for the server to be ready
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the application to be ready
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    console.log('✅ Application is ready for E2E testing')
  } catch (error) {
    console.error('❌ Failed to connect to application:', error)
    throw error
  } finally {
    await browser.close()
  }
  
  console.log('✅ E2E test environment setup complete')
}

export default globalSetup