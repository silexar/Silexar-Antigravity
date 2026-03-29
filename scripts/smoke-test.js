/**
 * @fileoverview Enterprise Smoke Testing Suite
 * 
 * Quick smoke tests to verify basic functionality after deployment
 * following Fortune 500 standards for production validation.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @testing Production smoke tests for deployment validation
 * @deployment Critical path verification
 */

const fetch = require('node-fetch')

// Smoke test configuration
const SMOKE_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 10000,
  retries: 3,
  criticalPaths: [
    {
      name: 'Homepage',
      path: '/',
      expectedStatus: 200,
      expectedContent: 'SILEXAR PULSE QUANTUM'
    },
    {
      name: 'Health Check',
      path: '/api/health',
      expectedStatus: 200,
      expectedContent: 'healthy'
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      expectedStatus: 200,
      expectedContent: 'Dashboard'
    },
    {
      name: 'Cortex',
      path: '/cortex',
      expectedStatus: 200,
      expectedContent: 'Cortex'
    }
  ]
}

/**
 * Make HTTP request with retries
 */
async function makeRequestWithRetry(url, retries = SMOKE_CONFIG.retries) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        timeout: SMOKE_CONFIG.timeout,
        headers: {
          'User-Agent': 'SilexarPulse-SmokeTest/2040.1.0'
        }
      })
      
      const text = await response.text()
      
      return {
        status: response.status,
        text,
        success: true,
        attempt
      }
    } catch (error) {
      console.log(`   Attempt ${attempt}/${retries} failed: ${error.message}`)
      
      if (attempt === retries) {
        return {
          status: 0,
          text: '',
          success: false,
          error: error.message,
          attempt
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}

/**
 * Run smoke test for a single path
 */
async function testPath(pathConfig) {
  console.log(`🧪 Testing: ${pathConfig.name}`)
  
  const url = `${SMOKE_CONFIG.baseUrl}${pathConfig.path}`
  const result = await makeRequestWithRetry(url)
  
  const checks = {
    accessible: result.success,
    correctStatus: result.status === pathConfig.expectedStatus,
    hasExpectedContent: result.text.includes(pathConfig.expectedContent)
  }
  
  const passed = Object.values(checks).every(check => check)
  
  console.log(`   URL: ${url}`)
  console.log(`   Status: ${result.status} ${checks.correctStatus ? '✅' : '❌'}`)
  console.log(`   Accessible: ${checks.accessible ? '✅' : '❌'}`)
  console.log(`   Content Check: ${checks.hasExpectedContent ? '✅' : '❌'}`)
  console.log(`   Overall: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  
  if (!passed && result.error) {
    console.log(`   Error: ${result.error}`)
  }
  
  return {
    name: pathConfig.name,
    url,
    passed,
    checks,
    result
  }
}

/**
 * Run all smoke tests
 */
async function runSmokeTests() {
  console.log('🚀 Starting Enterprise Smoke Test Suite')
  console.log(`Target: ${SMOKE_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const results = []
  let passedTests = 0
  
  for (const pathConfig of SMOKE_CONFIG.criticalPaths) {
    const result = await testPath(pathConfig)
    results.push(result)
    
    if (result.passed) {
      passedTests++
    }
    
    console.log('') // Empty line for readability
  }
  
  // Summary
  console.log('📊 Smoke Test Summary')
  console.log(`Tests Passed: ${passedTests}/${results.length}`)
  console.log(`Success Rate: ${((passedTests / results.length) * 100).toFixed(1)}%`)
  
  const overallPassed = passedTests === results.length
  console.log(`Overall Status: ${overallPassed ? '✅ PASS' : '❌ FAIL'}`)
  
  // Detailed results for failed tests
  const failedTests = results.filter(r => !r.passed)
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:')
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.url}`)
      if (test.result.error) {
        console.log(`     Error: ${test.result.error}`)
      }
    })
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    baseUrl: SMOKE_CONFIG.baseUrl,
    summary: {
      total: results.length,
      passed: passedTests,
      failed: results.length - passedTests,
      successRate: (passedTests / results.length) * 100,
      overallStatus: overallPassed ? 'PASS' : 'FAIL'
    },
    results
  }
  
  // Save report if in CI environment
  if (process.env.CI) {
    const fs = require('fs').promises
    const reportPath = `smoke-test-report-${Date.now()}.json`
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Smoke test report saved: ${reportPath}`)
  }
  
  // Exit with appropriate code
  process.exit(overallPassed ? 0 : 1)
}

// Run smoke tests if called directly
if (require.main === module) {
  runSmokeTests().catch(error => {
    console.error('❌ Smoke test suite failed:', error)
    process.exit(1)
  })
}

module.exports = { runSmokeTests, testPath }
  }
  
  const passed = Object.values(checks).every(check => check)
  
  console.log(`   URL: ${url}`)
  console.log(`   Status: ${result.status} ${checks.correctStatus ? '✅' : '❌'}`)
  console.log(`   Accessible: ${checks.accessible ? '✅' : '❌'}`)
  console.log(`   Content Check: ${checks.hasExpectedContent ? '✅' : '❌'}`)
  console.log(`   Overall: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  
  if (!passed && result.error) {
    console.log(`   Error: ${result.error}`)
  }
  
  return {
    name: pathConfig.name,
    url,
    passed,
    checks,
    result
  }
}

/**
 * Run all smoke tests
 */
async function runSmokeTests() {
  console.log('🚀 Starting Enterprise Smoke Test Suite')
  console.log(`Target: ${SMOKE_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const results = []
  let passedTests = 0
  
  for (const pathConfig of SMOKE_CONFIG.criticalPaths) {
    const result = await testPath(pathConfig)
    results.push(result)
    
    if (result.passed) {
      passedTests++
    }
    
    console.log('') // Empty line for readability
  }
  
  // Summary
  console.log('📊 Smoke Test Summary')
  console.log(`Tests Passed: ${passedTests}/${results.length}`)
  console.log(`Success Rate: ${((passedTests / results.length) * 100).toFixed(1)}%`)
  
  const overallPassed = passedTests === results.length
  console.log(`Overall Status: ${overallPassed ? '✅ PASS' : '❌ FAIL'}`)
  
  // Detailed results for failed tests
  const failedTests = results.filter(r => !r.passed)
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:')
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.url}`)
      if (test.result.error) {
        console.log(`     Error: ${test.result.error}`)
      }
    })
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    baseUrl: SMOKE_CONFIG.baseUrl,
    summary: {
      total: results.length,
      passed: passedTests,
      failed: results.length - passedTests,
      successRate: (passedTests / results.length) * 100,
      overallStatus: overallPassed ? 'PASS' : 'FAIL'
    },
    results
  }
  
  // Save report if in CI environment
  if (process.env.CI) {
    const fs = require('fs').promises
    const reportPath = `smoke-test-report-${Date.now()}.json`
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Smoke test report saved: ${reportPath}`)
  }
  
  // Exit with appropriate code
  process.exit(overallPassed ? 0 : 1)
}

// Run smoke tests if called directly
if (require.main === module) {
  runSmokeTests().catch(error => {
    console.error('❌ Smoke test suite failed:', error)
    process.exit(1)
  })
}

module.exports = { runSmokeTests, testPath }