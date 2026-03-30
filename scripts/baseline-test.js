/**
 * @fileoverview Enterprise Baseline Performance Test
 * 
 * Establishes performance baselines and validates against them
 * for continuous performance monitoring and regression detection.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @performance Baseline establishment and validation
 * @regression Performance regression detection
 */

const fetch = require('node-fetch')
const fs = require('fs').promises
const path = require('path')

// Baseline configuration
const BASELINE_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  baselineFile: 'performance-baseline.json',
  tolerance: {
    responseTime: 0.2, // 20% tolerance
    throughput: 0.15, // 15% tolerance
    errorRate: 0.05 // 5% absolute tolerance
  },
  testDuration: 60000, // 1 minute
  warmupDuration: 10000, // 10 seconds
  endpoints: [
    { path: '/', name: 'Homepage', weight: 0.3 },
    { path: '/dashboard', name: 'Dashboard', weight: 0.25 },
    { path: '/cortex', name: 'Cortex', weight: 0.25 },
    { path: '/api/health', name: 'Health API', weight: 0.2 }
  ]
}

/**
 * Load existing baseline
 */
async function loadBaseline() {
  try {
    const baselineData = await fs.readFile(BASELINE_CONFIG.baselineFile, 'utf8')
    return JSON.parse(baselineData)
  } catch (error) {
    console.log('📝 No existing baseline found, will create new one')
    return null
  }
}

/**
 * Save baseline
 */
async function saveBaseline(baseline) {
  await fs.writeFile(BASELINE_CONFIG.baselineFile, JSON.stringify(baseline, null, 2))
  console.log(`💾 Baseline saved to ${BASELINE_CONFIG.baselineFile}`)
}

/**
 * Measure endpoint performance
 */
async function measureEndpoint(endpoint, duration = 30000) {
  console.log(`📊 Measuring ${endpoint.name}...`)
  
  const url = `${BASELINE_CONFIG.baseUrl}${endpoint.path}`
  const measurements = []
  const startTime = Date.now()
  
  // Warmup
  console.log('   🔥 Warming up...')
  const warmupEnd = Date.now() + BASELINE_CONFIG.warmupDuration
  while (Date.now() < warmupEnd) {
    try {
      await fetch(url, { timeout: 5000 })
    } catch (error) {
      // Ignore warmup errors
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Actual measurements
  console.log('   📈 Collecting measurements...')
  const measurementEnd = Date.now() + duration
  
  while (Date.now() < measurementEnd) {
    const requestStart = Date.now()
    
    try {
      const response = await fetch(url, { timeout: 10000 })
      const responseTime = Date.now() - requestStart
      
      measurements.push({
        responseTime,
        status: response.status,
        success: response.ok,
        timestamp: Date.now()
      })
    } catch (error) {
      measurements.push({
        responseTime: Date.now() - requestStart,
        status: 0,
        success: false,
        error: error.message,
        timestamp: Date.now()
      })
    }
    
    await new Promise(resolve => setTimeout(resolve, 200)) // 5 RPS
  }
  
  // Calculate metrics
  const successfulRequests = measurements.filter(m => m.success)
  const failedRequests = measurements.filter(m => !m.success)
  
  const avgResponseTime = successfulRequests.length > 0 
    ? successfulRequests.reduce((sum, m) => sum + m.responseTime, 0) / successfulRequests.length
    : 0
  
  const p95ResponseTime = successfulRequests.length > 0
    ? successfulRequests.map(m => m.responseTime).sort((a, b) => a - b)[Math.floor(successfulRequests.length * 0.95)]
    : 0
  
  const throughput = measurements.length / (duration / 1000)
  const errorRate = failedRequests.length / measurements.length
  
  const metrics = {
    endpoint: endpoint.name,
    path: endpoint.path,
    totalRequests: measurements.length,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length,
    avgResponseTime,
    p95ResponseTime,
    throughput,
    errorRate,
    weight: endpoint.weight
  }
  
  console.log(`   ✅ ${endpoint.name} metrics:`)
  console.log(`      Avg Response Time: ${avgResponseTime.toFixed(2)}ms`)
  console.log(`      P95 Response Time: ${p95ResponseTime.toFixed(2)}ms`)
  console.log(`      Throughput: ${throughput.toFixed(2)} req/s`)
  console.log(`      Error Rate: ${(errorRate * 100).toFixed(2)}%`)
  
  return metrics
}

/**
 * Establish new baseline
 */
async function establishBaseline() {
  console.log('🎯 Establishing Performance Baseline')
  console.log(`Target: ${BASELINE_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const baselineMetrics = []
  
  for (const endpoint of BASELINE_CONFIG.endpoints) {
    const metrics = await measureEndpoint(endpoint, BASELINE_CONFIG.testDuration / BASELINE_CONFIG.endpoints.length)
    baselineMetrics.push(metrics)
  }
  
  // Calculate overall baseline score
  const overallScore = baselineMetrics.reduce((sum, metric) => {
    const endpointScore = Math.max(0, 100 - (metric.avgResponseTime / 10) - (metric.errorRate * 100))
    return sum + (endpointScore * metric.weight)
  }, 0)
  
  const baseline = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    overallScore,
    metrics: baselineMetrics,
    config: BASELINE_CONFIG
  }
  
  await saveBaseline(baseline)
  
  console.log('\n🎉 Baseline Established')
  console.log(`Overall Score: ${overallScore.toFixed(2)}/100`)
  
  return baseline
}

/**
 * Compare against baseline
 */
async function compareAgainstBaseline(currentMetrics, baseline) {
  console.log('\n🔍 Comparing Against Baseline')
  
  const comparisons = []
  let overallPassed = true
  
  for (const currentMetric of currentMetrics) {
    const baselineMetric = baseline.metrics.find(m => m.path === currentMetric.path)
    
    if (!baselineMetric) {
      console.log(`⚠️ No baseline found for ${currentMetric.endpoint}`)
      continue
    }
    
    const responseTimeDiff = (currentMetric.avgResponseTime - baselineMetric.avgResponseTime) / baselineMetric.avgResponseTime
    const throughputDiff = (baselineMetric.throughput - currentMetric.throughput) / baselineMetric.throughput
    const errorRateDiff = currentMetric.errorRate - baselineMetric.errorRate
    
    const responseTimePassed = responseTimeDiff <= BASELINE_CONFIG.tolerance.responseTime
    const throughputPassed = throughputDiff <= BASELINE_CONFIG.tolerance.throughput
    const errorRatePassed = errorRateDiff <= BASELINE_CONFIG.tolerance.errorRate
    
    const endpointPassed = responseTimePassed && throughputPassed && errorRatePassed
    
    if (!endpointPassed) {
      overallPassed = false
    }
    
    const comparison = {
      endpoint: currentMetric.endpoint,
      passed: endpointPassed,
      responseTime: {
        baseline: baselineMetric.avgResponseTime,
        current: currentMetric.avgResponseTime,
        diff: responseTimeDiff,
        passed: responseTimePassed
      },
      throughput: {
        baseline: baselineMetric.throughput,
        current: currentMetric.throughput,
        diff: throughputDiff,
        passed: throughputPassed
      },
      errorRate: {
        baseline: baselineMetric.errorRate,
        current: currentMetric.errorRate,
        diff: errorRateDiff,
        passed: errorRatePassed
      }
    }
    
    comparisons.push(comparison)
    
    console.log(`\n📊 ${currentMetric.endpoint}:`)
    console.log(`   Response Time: ${currentMetric.avgResponseTime.toFixed(2)}ms vs ${baselineMetric.avgResponseTime.toFixed(2)}ms (${(responseTimeDiff * 100).toFixed(1)}%) ${responseTimePassed ? '✅' : '❌'}`)
    console.log(`   Throughput: ${currentMetric.throughput.toFixed(2)} vs ${baselineMetric.throughput.toFixed(2)} req/s (${(throughputDiff * 100).toFixed(1)}%) ${throughputPassed ? '✅' : '❌'}`)
    console.log(`   Error Rate: ${(currentMetric.errorRate * 100).toFixed(2)}% vs ${(baselineMetric.errorRate * 100).toFixed(2)}% ${errorRatePassed ? '✅' : '❌'}`)
    console.log(`   Overall: ${endpointPassed ? '✅ PASS' : '❌ FAIL'}`)
  }
  
  return {
    passed: overallPassed,
    comparisons
  }
}

/**
 * Run baseline test
 */
async function runBaselineTest() {
  const args = process.argv.slice(2)
  const command = args[0] || 'validate'
  
  try {
    if (command === 'establish') {
      await establishBaseline()
      return
    }
    
    // Load existing baseline
    const baseline = await loadBaseline()
    
    if (!baseline) {
      console.log('❌ No baseline found. Run with "establish" to create one.')
      process.exit(1)
    }
    
    console.log('🧪 Running Baseline Validation Test')
    console.log(`Baseline from: ${baseline.timestamp}`)
    console.log(`Target: ${BASELINE_CONFIG.baseUrl}`)
    console.log('=' * 50)
    
    // Measure current performance
    const currentMetrics = []
    
    for (const endpoint of BASELINE_CONFIG.endpoints) {
      const metrics = await measureEndpoint(endpoint, BASELINE_CONFIG.testDuration / BASELINE_CONFIG.endpoints.length)
      currentMetrics.push(metrics)
    }
    
    // Compare against baseline
    const comparison = await compareAgainstBaseline(currentMetrics, baseline)
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      baseline: {
        timestamp: baseline.timestamp,
        version: baseline.version
      },
      current: {
        version: process.env.npm_package_version || '1.0.0',
        metrics: currentMetrics
      },
      comparison,
      status: comparison.passed ? 'PASS' : 'FAIL'
    }
    
    // Save report
    const reportPath = `baseline-report-${Date.now()}.json`
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Baseline report saved: ${reportPath}`)
    console.log(`\n🎯 Baseline Test Result: ${report.status}`)
    
    // Exit with appropriate code
    process.exit(comparison.passed ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Baseline test failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runBaselineTest()
}

module.exports = { 
  establishBaseline, 
  compareAgainstBaseline, 
  measureEndpoint,
  runBaselineTest 
}
        error: error.message,
        timestamp: Date.now()
      })
    }
    
    await new Promise(resolve => setTimeout(resolve, 200)) // 5 RPS
  }
  
  // Calculate metrics
  const successfulRequests = measurements.filter(m => m.success)
  const failedRequests = measurements.filter(m => !m.success)
  
  const avgResponseTime = successfulRequests.length > 0 
    ? successfulRequests.reduce((sum, m) => sum + m.responseTime, 0) / successfulRequests.length
    : 0
  
  const p95ResponseTime = successfulRequests.length > 0
    ? successfulRequests.map(m => m.responseTime).sort((a, b) => a - b)[Math.floor(successfulRequests.length * 0.95)]
    : 0
  
  const throughput = measurements.length / (duration / 1000)
  const errorRate = failedRequests.length / measurements.length
  
  const metrics = {
    endpoint: endpoint.name,
    path: endpoint.path,
    totalRequests: measurements.length,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length,
    avgResponseTime,
    p95ResponseTime,
    throughput,
    errorRate,
    weight: endpoint.weight
  }
  
  console.log(`   ✅ ${endpoint.name} metrics:`)
  console.log(`      Avg Response Time: ${avgResponseTime.toFixed(2)}ms`)
  console.log(`      P95 Response Time: ${p95ResponseTime.toFixed(2)}ms`)
  console.log(`      Throughput: ${throughput.toFixed(2)} req/s`)
  console.log(`      Error Rate: ${(errorRate * 100).toFixed(2)}%`)
  
  return metrics
}

/**
 * Establish new baseline
 */
async function establishBaseline() {
  console.log('🎯 Establishing Performance Baseline')
  console.log(`Target: ${BASELINE_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const baselineMetrics = []
  
  for (const endpoint of BASELINE_CONFIG.endpoints) {
    const metrics = await measureEndpoint(endpoint, BASELINE_CONFIG.testDuration / BASELINE_CONFIG.endpoints.length)
    baselineMetrics.push(metrics)
  }
  
  // Calculate overall baseline score
  const overallScore = baselineMetrics.reduce((sum, metric) => {
    const endpointScore = Math.max(0, 100 - (metric.avgResponseTime / 10) - (metric.errorRate * 100))
    return sum + (endpointScore * metric.weight)
  }, 0)
  
  const baseline = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    overallScore,
    metrics: baselineMetrics,
    config: BASELINE_CONFIG
  }
  
  await saveBaseline(baseline)
  
  console.log('\n🎉 Baseline Established')
  console.log(`Overall Score: ${overallScore.toFixed(2)}/100`)
  
  return baseline
}

/**
 * Compare against baseline
 */
async function compareAgainstBaseline(currentMetrics, baseline) {
  console.log('\n🔍 Comparing Against Baseline')
  
  const comparisons = []
  let overallPassed = true
  
  for (const currentMetric of currentMetrics) {
    const baselineMetric = baseline.metrics.find(m => m.path === currentMetric.path)
    
    if (!baselineMetric) {
      console.log(`⚠️ No baseline found for ${currentMetric.endpoint}`)
      continue
    }
    
    const responseTimeDiff = (currentMetric.avgResponseTime - baselineMetric.avgResponseTime) / baselineMetric.avgResponseTime
    const throughputDiff = (baselineMetric.throughput - currentMetric.throughput) / baselineMetric.throughput
    const errorRateDiff = currentMetric.errorRate - baselineMetric.errorRate
    
    const responseTimePassed = responseTimeDiff <= BASELINE_CONFIG.tolerance.responseTime
    const throughputPassed = throughputDiff <= BASELINE_CONFIG.tolerance.throughput
    const errorRatePassed = errorRateDiff <= BASELINE_CONFIG.tolerance.errorRate
    
    const endpointPassed = responseTimePassed && throughputPassed && errorRatePassed
    
    if (!endpointPassed) {
      overallPassed = false
    }
    
    const comparison = {
      endpoint: currentMetric.endpoint,
      passed: endpointPassed,
      responseTime: {
        baseline: baselineMetric.avgResponseTime,
        current: currentMetric.avgResponseTime,
        diff: responseTimeDiff,
        passed: responseTimePassed
      },
      throughput: {
        baseline: baselineMetric.throughput,
        current: currentMetric.throughput,
        diff: throughputDiff,
        passed: throughputPassed
      },
      errorRate: {
        baseline: baselineMetric.errorRate,
        current: currentMetric.errorRate,
        diff: errorRateDiff,
        passed: errorRatePassed
      }
    }
    
    comparisons.push(comparison)
    
    console.log(`\n📊 ${currentMetric.endpoint}:`)
    console.log(`   Response Time: ${currentMetric.avgResponseTime.toFixed(2)}ms vs ${baselineMetric.avgResponseTime.toFixed(2)}ms (${(responseTimeDiff * 100).toFixed(1)}%) ${responseTimePassed ? '✅' : '❌'}`)
    console.log(`   Throughput: ${currentMetric.throughput.toFixed(2)} vs ${baselineMetric.throughput.toFixed(2)} req/s (${(throughputDiff * 100).toFixed(1)}%) ${throughputPassed ? '✅' : '❌'}`)
    console.log(`   Error Rate: ${(currentMetric.errorRate * 100).toFixed(2)}% vs ${(baselineMetric.errorRate * 100).toFixed(2)}% ${errorRatePassed ? '✅' : '❌'}`)
    console.log(`   Overall: ${endpointPassed ? '✅ PASS' : '❌ FAIL'}`)
  }
  
  return {
    passed: overallPassed,
    comparisons
  }
}

/**
 * Run baseline test
 */
async function runBaselineTest() {
  const args = process.argv.slice(2)
  const command = args[0] || 'validate'
  
  try {
    if (command === 'establish') {
      await establishBaseline()
      return
    }
    
    // Load existing baseline
    const baseline = await loadBaseline()
    
    if (!baseline) {
      console.log('❌ No baseline found. Run with "establish" to create one.')
      process.exit(1)
    }
    
    console.log('🧪 Running Baseline Validation Test')
    console.log(`Baseline from: ${baseline.timestamp}`)
    console.log(`Target: ${BASELINE_CONFIG.baseUrl}`)
    console.log('=' * 50)
    
    // Measure current performance
    const currentMetrics = []
    
    for (const endpoint of BASELINE_CONFIG.endpoints) {
      const metrics = await measureEndpoint(endpoint, BASELINE_CONFIG.testDuration / BASELINE_CONFIG.endpoints.length)
      currentMetrics.push(metrics)
    }
    
    // Compare against baseline
    const comparison = await compareAgainstBaseline(currentMetrics, baseline)
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      baseline: {
        timestamp: baseline.timestamp,
        version: baseline.version
      },
      current: {
        version: process.env.npm_package_version || '1.0.0',
        metrics: currentMetrics
      },
      comparison,
      status: comparison.passed ? 'PASS' : 'FAIL'
    }
    
    // Save report
    const reportPath = `baseline-report-${Date.now()}.json`
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Baseline report saved: ${reportPath}`)
    console.log(`\n🎯 Baseline Test Result: ${report.status}`)
    
    // Exit with appropriate code
    process.exit(comparison.passed ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Baseline test failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runBaselineTest()
}

module.exports = { 
  establishBaseline, 
  compareAgainstBaseline, 
  measureEndpoint,
  runBaselineTest 
}