/**
 * @fileoverview Enterprise Performance Testing Suite
 * 
 * Comprehensive performance testing with load testing, stress testing,
 * and performance monitoring following Fortune 500 standards.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @testing Performance testing with enterprise metrics
 * @monitoring Real-time performance analysis
 */

const { performance } = require('perf_hooks')
const fetch = require('node-fetch')
const fs = require('fs').promises

// Performance test configuration
const PERFORMANCE_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  endpoints: [
    '/',
    '/dashboard',
    '/cortex',
    '/api/health',
    '/api/auth/login'
  ],
  loadTest: {
    concurrent: 50,
    duration: 60000, // 1 minute
    rampUp: 10000 // 10 seconds
  },
  thresholds: {
    responseTime: 1000, // 1 second
    errorRate: 0.01, // 1%
    throughput: 100 // requests per second
  }
}

/**
 * Performance test result interface
 */
class PerformanceResult {
  constructor() {
    this.startTime = Date.now()
    this.requests = []
    this.errors = []
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      throughput: 0,
      errorRate: 0
    }
  }

  addRequest(url, responseTime, status, error = null) {
    this.requests.push({
      url,
      responseTime,
      status,
      timestamp: Date.now(),
      error
    })

    if (error) {
      this.errors.push({ url, error, timestamp: Date.now() })
    }
  }

  calculateMetrics() {
    const totalTime = Date.now() - this.startTime
    this.metrics.totalRequests = this.requests.length
    this.metrics.successfulRequests = this.requests.filter(r => r.status >= 200 && r.status < 400).length
    this.metrics.failedRequests = this.requests.length - this.metrics.successfulRequests
    
    const responseTimes = this.requests.map(r => r.responseTime)
    this.metrics.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    this.metrics.minResponseTime = Math.min(...responseTimes)
    this.metrics.maxResponseTime = Math.max(...responseTimes)
    this.metrics.throughput = (this.metrics.totalRequests / totalTime) * 1000 // requests per second
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.totalRequests
  }

  generateReport() {
    this.calculateMetrics()
    
    return {
      summary: {
        duration: Date.now() - this.startTime,
        ...this.metrics
      },
      thresholds: {
        responseTime: {
          threshold: PERFORMANCE_CONFIG.thresholds.responseTime,
          actual: this.metrics.averageResponseTime,
          passed: this.metrics.averageResponseTime <= PERFORMANCE_CONFIG.thresholds.responseTime
        },
        errorRate: {
          threshold: PERFORMANCE_CONFIG.thresholds.errorRate,
          actual: this.metrics.errorRate,
          passed: this.metrics.errorRate <= PERFORMANCE_CONFIG.thresholds.errorRate
        },
        throughput: {
          threshold: PERFORMANCE_CONFIG.thresholds.throughput,
          actual: this.metrics.throughput,
          passed: this.metrics.throughput >= PERFORMANCE_CONFIG.thresholds.throughput
        }
      },
      errors: this.errors,
      requests: this.requests.slice(-100) // Last 100 requests for analysis
    }
  }
}

/**
 * Make HTTP request with performance measurement
 */
async function makeRequest(url, options = {}) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options
    })
    
    const responseTime = performance.now() - startTime
    
    return {
      status: response.status,
      responseTime,
      success: response.ok,
      error: null
    }
  } catch (error) {
    const responseTime = performance.now() - startTime
    
    return {
      status: 0,
      responseTime,
      success: false,
      error: error.message
    }
  }
}

/**
 * Run single endpoint test
 */
async function testEndpoint(endpoint) {
  console.log(`🧪 Testing endpoint: ${endpoint}`)
  
  const url = `${PERFORMANCE_CONFIG.baseUrl}${endpoint}`
  const result = await makeRequest(url)
  
  console.log(`   Response time: ${result.responseTime.toFixed(2)}ms`)
  console.log(`   Status: ${result.status}`)
  console.log(`   Success: ${result.success ? '✅' : '❌'}`)
  
  return result
}

/**
 * Run load test on endpoint
 */
async function loadTestEndpoint(endpoint, concurrent = 10, duration = 30000) {
  console.log(`🚀 Load testing: ${endpoint} (${concurrent} concurrent, ${duration/1000}s)`)
  
  const url = `${PERFORMANCE_CONFIG.baseUrl}${endpoint}`
  const result = new PerformanceResult()
  const startTime = Date.now()
  
  // Create concurrent workers
  const workers = Array.from({ length: concurrent }, async (_, workerId) => {
    while (Date.now() - startTime < duration) {
      const requestResult = await makeRequest(url)
      result.addRequest(url, requestResult.responseTime, requestResult.status, requestResult.error)
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  })
  
  // Wait for all workers to complete
  await Promise.all(workers)
  
  const report = result.generateReport()
  
  console.log(`   Total requests: ${report.summary.totalRequests}`)
  console.log(`   Success rate: ${((report.summary.successfulRequests / report.summary.totalRequests) * 100).toFixed(2)}%`)
  console.log(`   Average response time: ${report.summary.averageResponseTime.toFixed(2)}ms`)
  console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`)
  
  return report
}

/**
 * Run stress test
 */
async function stressTest() {
  console.log('🔥 Running stress test...')
  
  const stressLevels = [10, 25, 50, 100, 200]
  const results = []
  
  for (const concurrent of stressLevels) {
    console.log(`\n📈 Stress level: ${concurrent} concurrent users`)
    
    const result = await loadTestEndpoint('/', concurrent, 30000)
    results.push({
      concurrent,
      ...result.summary
    })
    
    // Check if system is still responsive
    if (result.summary.errorRate > 0.1) { // 10% error rate
      console.log('⚠️  High error rate detected, stopping stress test')
      break
    }
    
    // Cool down period
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  return results
}

/**
 * Monitor system during test
 */
async function monitorSystem(duration = 60000) {
  console.log('📊 Monitoring system metrics...')
  
  const metrics = []
  const startTime = Date.now()
  
  while (Date.now() - startTime < duration) {
    try {
      const healthResponse = await makeRequest(`${PERFORMANCE_CONFIG.baseUrl}/api/health`)
      
      if (healthResponse.success) {
        const healthData = await fetch(`${PERFORMANCE_CONFIG.baseUrl}/api/health`).then(r => r.json())
        
        metrics.push({
          timestamp: Date.now(),
          responseTime: healthResponse.responseTime,
          memory: healthData.metrics?.memory?.percentage || 0,
          cpu: healthData.metrics?.cpu?.usage || 0,
          status: healthData.status
        })
      }
    } catch (error) {
      console.error('Monitoring error:', error.message)
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000)) // Check every 5 seconds
  }
  
  return metrics
}

/**
 * Generate performance report
 */
async function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    configuration: PERFORMANCE_CONFIG,
    results,
    summary: {
      totalTests: results.length,
      passedTests: results.filter(r => r.thresholds && Object.values(r.thresholds).every(t => t.passed)).length,
      overallStatus: results.every(r => r.thresholds && Object.values(r.thresholds).every(t => t.passed)) ? 'PASS' : 'FAIL'
    }
  }
  
  // Save report to file
  const reportPath = `performance-report-${Date.now()}.json`
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n📄 Performance report saved: ${reportPath}`)
  
  return report
}

/**
 * Main performance test runner
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Enterprise Performance Test Suite')
  console.log(`Target: ${PERFORMANCE_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const results = []
  
  try {
    // 1. Basic endpoint tests
    console.log('\n1️⃣ Basic Endpoint Tests')
    for (const endpoint of PERFORMANCE_CONFIG.endpoints) {
      const result = await testEndpoint(endpoint)
      results.push({ endpoint, type: 'basic', ...result })
    }
    
    // 2. Load tests
    console.log('\n2️⃣ Load Tests')
    for (const endpoint of PERFORMANCE_CONFIG.endpoints.slice(0, 3)) { // Test first 3 endpoints
      const result = await loadTestEndpoint(endpoint, 20, 30000)
      results.push({ endpoint, type: 'load', ...result })
    }
    
    // 3. Stress test
    console.log('\n3️⃣ Stress Test')
    const stressResults = await stressTest()
    results.push({ type: 'stress', results: stressResults })
    
    // 4. System monitoring
    console.log('\n4️⃣ System Monitoring')
    const monitoringResults = await monitorSystem(60000)
    results.push({ type: 'monitoring', metrics: monitoringResults })
    
    // Generate final report
    const finalReport = await generateReport(results)
    
    console.log('\n🎉 Performance Test Suite Completed')
    console.log(`Overall Status: ${finalReport.summary.overallStatus}`)
    console.log(`Tests Passed: ${finalReport.summary.passedTests}/${finalReport.summary.totalTests}`)
    
    // Exit with appropriate code
    process.exit(finalReport.summary.overallStatus === 'PASS' ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
    process.exit(1)
  }
}

// Run tests if called directly
if (require.main === module) {
  runPerformanceTests()
}

module.exports = {
  runPerformanceTests,
  testEndpoint,
  loadTestEndpoint,
  stressTest,
  monitorSystem
}

/**
 * Make HTTP request with performance measurement
 */
async function makeRequest(url, options = {}) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(url, {
      timeout: 10000,
      ...options
    })
    
    const responseTime = performance.now() - startTime
    
    return {
      status: response.status,
      responseTime,
      success: response.ok,
      error: null
    }
  } catch (error) {
    const responseTime = performance.now() - startTime
    
    return {
      status: 0,
      responseTime,
      success: false,
      error: error.message
    }
  }
}

/**
 * Run single endpoint test
 */
async function testEndpoint(endpoint) {
  console.log(`🧪 Testing endpoint: ${endpoint}`)
  
  const url = `${PERFORMANCE_CONFIG.baseUrl}${endpoint}`
  const result = await makeRequest(url)
  
  console.log(`   Response time: ${result.responseTime.toFixed(2)}ms`)
  console.log(`   Status: ${result.status}`)
  console.log(`   Success: ${result.success ? '✅' : '❌'}`)
  
  return result
}

/**
 * Run load test on endpoint
 */
async function loadTestEndpoint(endpoint, concurrent = 10, duration = 30000) {
  console.log(`🚀 Load testing: ${endpoint} (${concurrent} concurrent, ${duration/1000}s)`)
  
  const url = `${PERFORMANCE_CONFIG.baseUrl}${endpoint}`
  const result = new PerformanceResult()
  const startTime = Date.now()
  
  // Create concurrent workers
  const workers = Array.from({ length: concurrent }, async (_, workerId) => {
    while (Date.now() - startTime < duration) {
      const requestResult = await makeRequest(url)
      result.addRequest(url, requestResult.responseTime, requestResult.status, requestResult.error)
      
      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  })
  
  // Wait for all workers to complete
  await Promise.all(workers)
  
  const report = result.generateReport()
  
  console.log(`   Total requests: ${report.summary.totalRequests}`)
  console.log(`   Success rate: ${((report.summary.successfulRequests / report.summary.totalRequests) * 100).toFixed(2)}%`)
  console.log(`   Average response time: ${report.summary.averageResponseTime.toFixed(2)}ms`)
  console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`)
  
  return report
}

/**
 * Run stress test
 */
async function stressTest() {
  console.log('🔥 Running stress test...')
  
  const stressLevels = [10, 25, 50, 100, 200]
  const results = []
  
  for (const concurrent of stressLevels) {
    console.log(`\n📈 Stress level: ${concurrent} concurrent users`)
    
    const result = await loadTestEndpoint('/', concurrent, 30000)
    results.push({
      concurrent,
      ...result.summary
    })
    
    // Check if system is still responsive
    if (result.summary.errorRate > 0.1) { // 10% error rate
      console.log('⚠️  High error rate detected, stopping stress test')
      break
    }
    
    // Cool down period
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  
  return results
}

/**
 * Monitor system during test
 */
async function monitorSystem(duration = 60000) {
  console.log('📊 Monitoring system metrics...')
  
  const metrics = []
  const startTime = Date.now()
  
  while (Date.now() - startTime < duration) {
    try {
      const healthResponse = await makeRequest(`${PERFORMANCE_CONFIG.baseUrl}/api/health`)
      
      if (healthResponse.success) {
        const healthData = await fetch(`${PERFORMANCE_CONFIG.baseUrl}/api/health`).then(r => r.json())
        
        metrics.push({
          timestamp: Date.now(),
          responseTime: healthResponse.responseTime,
          memory: healthData.metrics?.memory?.percentage || 0,
          cpu: healthData.metrics?.cpu?.usage || 0,
          status: healthData.status
        })
      }
    } catch (error) {
      console.error('Monitoring error:', error.message)
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000)) // Check every 5 seconds
  }
  
  return metrics
}

/**
 * Generate performance report
 */
async function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'test',
    configuration: PERFORMANCE_CONFIG,
    results,
    summary: {
      totalTests: results.length,
      passedTests: results.filter(r => r.thresholds && Object.values(r.thresholds).every(t => t.passed)).length,
      overallStatus: results.every(r => r.thresholds && Object.values(r.thresholds).every(t => t.passed)) ? 'PASS' : 'FAIL'
    }
  }
  
  // Save report to file
  const reportPath = `performance-report-${Date.now()}.json`
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n📄 Performance report saved: ${reportPath}`)
  
  return report
}

/**
 * Main performance test runner
 */
async function runPerformanceTests() {
  console.log('🚀 Starting Enterprise Performance Test Suite')
  console.log(`Target: ${PERFORMANCE_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const results = []
  
  try {
    // 1. Basic endpoint tests
    console.log('\n1️⃣ Basic Endpoint Tests')
    for (const endpoint of PERFORMANCE_CONFIG.endpoints) {
      const result = await testEndpoint(endpoint)
      results.push({ endpoint, type: 'basic', ...result })
    }
    
    // 2. Load tests
    console.log('\n2️⃣ Load Tests')
    for (const endpoint of PERFORMANCE_CONFIG.endpoints.slice(0, 3)) { // Test first 3 endpoints
      const result = await loadTestEndpoint(endpoint, 20, 30000)
      results.push({ endpoint, type: 'load', ...result })
    }
    
    // 3. Stress test
    console.log('\n3️⃣ Stress Test')
    const stressResults = await stressTest()
    results.push({ type: 'stress', results: stressResults })
    
    // 4. System monitoring
    console.log('\n4️⃣ System Monitoring')
    const monitoringResults = await monitorSystem(60000)
    results.push({ type: 'monitoring', metrics: monitoringResults })
    
    // Generate final report
    const finalReport = await generateReport(results)
    
    console.log('\n🎉 Performance Test Suite Completed')
    console.log(`Overall Status: ${finalReport.summary.overallStatus}`)
    console.log(`Tests Passed: ${finalReport.summary.passedTests}/${finalReport.summary.totalTests}`)
    
    // Exit with appropriate code
    process.exit(finalReport.summary.overallStatus === 'PASS' ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
    process.exit(1)
  }
}

// Run tests if called directly
if (require.main === module) {
  runPerformanceTests()
}

module.exports = {
  runPerformanceTests,
  testEndpoint,
  loadTestEndpoint,
  stressTest,
  monitorSystem
}