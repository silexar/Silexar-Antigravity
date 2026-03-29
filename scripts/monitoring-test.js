/**
 * @fileoverview Enterprise Monitoring Test Suite
 * 
 * Comprehensive monitoring tests for production systems including
 * metrics collection, alerting validation, and observability checks.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @monitoring Production monitoring validation
 * @observability Real-time system observability
 */

const fetch = require('node-fetch')
const fs = require('fs').promises

// Monitoring configuration
const MONITORING_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  duration: parseInt(process.env.MONITORING_DURATION) || 300000, // 5 minutes
  interval: parseInt(process.env.MONITORING_INTERVAL) || 10000, // 10 seconds
  metrics: {
    responseTime: { threshold: 1000, weight: 0.3 },
    errorRate: { threshold: 0.05, weight: 0.3 },
    throughput: { threshold: 50, weight: 0.2 },
    availability: { threshold: 0.99, weight: 0.2 }
  },
  endpoints: [
    '/api/health',
    '/api/metrics',
    '/',
    '/dashboard'
  ]
}

/**
 * Collect system metrics
 */
async function collectMetrics() {
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${MONITORING_CONFIG.baseUrl}/api/health`, {
      timeout: 5000
    })
    
    const responseTime = Date.now() - startTime
    const data = await response.json()
    
    return {
      timestamp: Date.now(),
      responseTime,
      status: response.status,
      available: response.ok,
      metrics: data.metrics || {},
      services: data.services || [],
      error: null
    }
  } catch (error) {
    return {
      timestamp: Date.now(),
      responseTime: Date.now() - startTime,
      status: 0,
      available: false,
      metrics: {},
      services: [],
      error: error.message
    }
  }
}

/**
 * Calculate monitoring score
 */
function calculateMonitoringScore(metrics) {
  let score = 100
  const issues = []
  
  // Response time score
  const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length
  if (avgResponseTime > MONITORING_CONFIG.metrics.responseTime.threshold) {
    const penalty = Math.min(30, (avgResponseTime / MONITORING_CONFIG.metrics.responseTime.threshold - 1) * 30)
    score -= penalty * MONITORING_CONFIG.metrics.responseTime.weight * 100
    issues.push(`High average response time: ${avgResponseTime.toFixed(2)}ms`)
  }
  
  // Error rate score
  const errorCount = metrics.filter(m => !m.available).length
  const errorRate = errorCount / metrics.length
  if (errorRate > MONITORING_CONFIG.metrics.errorRate.threshold) {
    const penalty = Math.min(40, (errorRate / MONITORING_CONFIG.metrics.errorRate.threshold - 1) * 40)
    score -= penalty * MONITORING_CONFIG.metrics.errorRate.weight * 100
    issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
  }
  
  // Availability score
  const availability = metrics.filter(m => m.available).length / metrics.length
  if (availability < MONITORING_CONFIG.metrics.availability.threshold) {
    const penalty = (MONITORING_CONFIG.metrics.availability.threshold - availability) * 50
    score -= penalty * MONITORING_CONFIG.metrics.availability.weight * 100
    issues.push(`Low availability: ${(availability * 100).toFixed(2)}%`)
  }
  
  return {
    score: Math.max(0, Math.round(score)),
    issues,
    metrics: {
      avgResponseTime,
      errorRate,
      availability
    }
  }
}

/**
 * Run monitoring test
 */
async function runMonitoringTest() {
  console.log('📊 Starting Enterprise Monitoring Test')
  console.log(`Target: ${MONITORING_CONFIG.baseUrl}`)
  console.log(`Duration: ${MONITORING_CONFIG.duration / 1000} seconds`)
  console.log(`Interval: ${MONITORING_CONFIG.interval / 1000} seconds`)
  console.log('=' * 50)
  
  const metrics = []
  const startTime = Date.now()
  let checkCount = 0
  
  while (Date.now() - startTime < MONITORING_CONFIG.duration) {
    checkCount++
    console.log(`\n🔍 Check ${checkCount} - ${new Date().toISOString()}`)
    
    const metric = await collectMetrics()
    metrics.push(metric)
    
    console.log(`   Response Time: ${metric.responseTime}ms`)
    console.log(`   Status: ${metric.status}`)
    console.log(`   Available: ${metric.available ? '✅' : '❌'}`)
    
    if (metric.metrics.memory) {
      console.log(`   Memory: ${metric.metrics.memory.percentage}%`)
    }
    
    if (metric.metrics.cpu) {
      console.log(`   CPU: ${metric.metrics.cpu.usage}%`)
    }
    
    if (metric.error) {
      console.log(`   Error: ${metric.error}`)
    }
    
    // Wait for next check
    await new Promise(resolve => setTimeout(resolve, MONITORING_CONFIG.interval))
  }
  
  // Calculate final score
  const evaluation = calculateMonitoringScore(metrics)
  
  console.log('\n📈 Monitoring Test Results')
  console.log(`Total Checks: ${metrics.length}`)
  console.log(`Average Response Time: ${evaluation.metrics.avgResponseTime.toFixed(2)}ms`)
  console.log(`Error Rate: ${(evaluation.metrics.errorRate * 100).toFixed(2)}%`)
  console.log(`Availability: ${(evaluation.metrics.availability * 100).toFixed(2)}%`)
  console.log(`Monitoring Score: ${evaluation.score}/100`)
  
  if (evaluation.issues.length > 0) {
    console.log('\n⚠️ Issues Detected:')
    evaluation.issues.forEach(issue => console.log(`   - ${issue}`))
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    duration: MONITORING_CONFIG.duration,
    totalChecks: metrics.length,
    score: evaluation.score,
    metrics: evaluation.metrics,
    issues: evaluation.issues,
    rawMetrics: metrics,
    status: evaluation.score >= 80 ? 'PASS' : 'FAIL'
  }
  
  // Save report
  const reportPath = `monitoring-report-${Date.now()}.json`
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 Monitoring report saved: ${reportPath}`)
  
  // Exit with appropriate code
  process.exit(report.status === 'PASS' ? 0 : 1)
}

// Run if called directly
if (require.main === module) {
  runMonitoringTest().catch(error => {
    console.error('❌ Monitoring test failed:', error)
    process.exit(1)
  })
}

module.exports = { runMonitoringTest, collectMetrics, calculateMonitoringScore }