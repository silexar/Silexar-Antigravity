/**
 * @fileoverview Enterprise Health Check Script
 * 
 * Comprehensive health check script for monitoring system status
 * and dependencies following Fortune 500 monitoring standards.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @monitoring Production health monitoring
 * @alerting Automated health status reporting
 */

const fetch = require('node-fetch')

// Health check configuration
const HEALTH_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 5000,
  retries: 3,
  thresholds: {
    responseTime: 1000, // 1 second
    memoryUsage: 80, // 80%
    cpuUsage: 70, // 70%
    errorRate: 0.05 // 5%
  },
  alerting: {
    webhook: process.env.ALERT_WEBHOOK_URL,
    enabled: process.env.ENABLE_ALERTS === 'true'
  }
}

/**
 * Perform health check
 */
async function performHealthCheck() {
  console.log('🏥 Performing Enterprise Health Check')
  console.log(`Target: ${HEALTH_CONFIG.baseUrl}`)
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${HEALTH_CONFIG.baseUrl}/api/health`, {
      timeout: HEALTH_CONFIG.timeout,
      headers: {
        'User-Agent': 'SilexarPulse-HealthCheck/2040.1.0'
      }
    })
    
    const responseTime = Date.now() - startTime
    const healthData = await response.json()
    
    console.log(`\n📊 Health Check Results:`)
    console.log(`   Response Time: ${responseTime}ms`)
    console.log(`   Status: ${healthData.status}`)
    console.log(`   Version: ${healthData.version}`)
    console.log(`   Uptime: ${Math.floor(healthData.uptime / 60)} minutes`)
    console.log(`   Environment: ${healthData.environment}`)
    
    // Check services
    console.log(`\n🔧 Service Status:`)
    healthData.services.forEach(service => {
      const status = service.status === 'up' ? '✅' : '❌'
      console.log(`   ${service.name}: ${status} (${service.responseTime}ms)`)
    })
    
    // Check system metrics
    console.log(`\n📈 System Metrics:`)
    if (healthData.metrics) {
      console.log(`   Memory Usage: ${healthData.metrics.memory?.percentage || 0}%`)
      console.log(`   CPU Usage: ${healthData.metrics.cpu?.usage || 0}%`)
      console.log(`   Total Requests: ${healthData.metrics.requests?.total || 0}`)
      console.log(`   Error Count: ${healthData.metrics.requests?.errors || 0}`)
    }
    
    // Check health checks
    console.log(`\n✅ Health Checks:`)
    healthData.checks.forEach(check => {
      const status = check.status === 'pass' ? '✅' : 
                    check.status === 'warn' ? '⚠️' : '❌'
      console.log(`   ${check.name}: ${status} - ${check.message} (${check.duration}ms)`)
    })
    
    // Evaluate overall health
    const evaluation = evaluateHealth(healthData, responseTime)
    
    console.log(`\n🎯 Health Evaluation:`)
    console.log(`   Overall Status: ${evaluation.status}`)
    console.log(`   Score: ${evaluation.score}/100`)
    
    if (evaluation.issues.length > 0) {
      console.log(`\n⚠️ Issues Detected:`)
      evaluation.issues.forEach(issue => {
        console.log(`   - ${issue}`)
      })
    }
    
    // Send alerts if needed
    if (HEALTH_CONFIG.alerting.enabled && evaluation.status !== 'healthy') {
      await sendAlert(evaluation, healthData)
    }
    
    return {
      success: true,
      status: evaluation.status,
      score: evaluation.score,
      responseTime,
      healthData,
      evaluation
    }
    
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`)
    
    const failureResult = {
      success: false,
      status: 'unhealthy',
      score: 0,
      error: error.message,
      responseTime: Date.now() - startTime
    }
    
    // Send critical alert
    if (HEALTH_CONFIG.alerting.enabled) {
      await sendAlert({
        status: 'critical',
        score: 0,
        issues: [`Health check endpoint unreachable: ${error.message}`]
      })
    }
    
    return failureResult
  }
}

/**
 * Evaluate health status based on metrics and thresholds
 */
function evaluateHealth(healthData, responseTime) {
  let score = 100
  const issues = []
  
  // Response time check
  if (responseTime > HEALTH_CONFIG.thresholds.responseTime) {
    score -= 20
    issues.push(`High response time: ${responseTime}ms (threshold: ${HEALTH_CONFIG.thresholds.responseTime}ms)`)
  }
  
  // Service status check
  const downServices = healthData.services.filter(s => s.status === 'down')
  if (downServices.length > 0) {
    score -= 30
    issues.push(`Services down: ${downServices.map(s => s.name).join(', ')}`)
  }
  
  // Memory usage check
  if (healthData.metrics?.memory?.percentage > HEALTH_CONFIG.thresholds.memoryUsage) {
    score -= 15
    issues.push(`High memory usage: ${healthData.metrics.memory.percentage}%`)
  }
  
  // CPU usage check
  if (healthData.metrics?.cpu?.usage > HEALTH_CONFIG.thresholds.cpuUsage) {
    score -= 15
    issues.push(`High CPU usage: ${healthData.metrics.cpu.usage}%`)
  }
  
  // Error rate check
  if (healthData.metrics?.requests) {
    const errorRate = healthData.metrics.requests.errors / healthData.metrics.requests.total
    if (errorRate > HEALTH_CONFIG.thresholds.errorRate) {
      score -= 20
      issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
    }
  }
  
  // Failed health checks
  const failedChecks = healthData.checks.filter(c => c.status === 'fail')
  if (failedChecks.length > 0) {
    score -= 10 * failedChecks.length
    issues.push(`Failed checks: ${failedChecks.map(c => c.name).join(', ')}`)
  }
  
  // Determine status
  let status = 'healthy'
  if (score < 50) {
    status = 'critical'
  } else if (score < 80) {
    status = 'degraded'
  }
  
  return {
    status,
    score: Math.max(0, score),
    issues
  }
}

/**
 * Send alert notification
    
    return {
      success: true,
      status: evaluation.status,
      score: evaluation.score,
      responseTime,
      healthData,
      evaluation
    }
    
  } catch (error) {
    console.error(`❌ Health check failed: ${error.message}`)
    
    const failureResult = {
      success: false,
      status: 'unhealthy',
      score: 0,
      error: error.message,
      responseTime: Date.now() - startTime
    }
    
    // Send critical alert
    if (HEALTH_CONFIG.alerting.enabled) {
      await sendAlert({
        status: 'critical',
        score: 0,
        issues: [`Health check endpoint unreachable: ${error.message}`]
      })
    }
    
    return failureResult
  }
}

/**
 * Evaluate health status based on metrics and thresholds
 */
function evaluateHealth(healthData, responseTime) {
  let score = 100
  const issues = []
  
  // Response time check
  if (responseTime > HEALTH_CONFIG.thresholds.responseTime) {
    score -= 20
    issues.push(`High response time: ${responseTime}ms (threshold: ${HEALTH_CONFIG.thresholds.responseTime}ms)`)
  }
  
  // Service status check
  const downServices = healthData.services.filter(s => s.status === 'down')
  if (downServices.length > 0) {
    score -= 30
    issues.push(`Services down: ${downServices.map(s => s.name).join(', ')}`)
  }
  
  // Memory usage check
  if (healthData.metrics?.memory?.percentage > HEALTH_CONFIG.thresholds.memoryUsage) {
    score -= 15
    issues.push(`High memory usage: ${healthData.metrics.memory.percentage}%`)
  }
  
  // CPU usage check
  if (healthData.metrics?.cpu?.usage > HEALTH_CONFIG.thresholds.cpuUsage) {
    score -= 15
    issues.push(`High CPU usage: ${healthData.metrics.cpu.usage}%`)
  }
  
  // Error rate check
  if (healthData.metrics?.requests) {
    const errorRate = healthData.metrics.requests.errors / healthData.metrics.requests.total
    if (errorRate > HEALTH_CONFIG.thresholds.errorRate) {
      score -= 20
      issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`)
    }
  }
  
  // Failed health checks
  const failedChecks = healthData.checks.filter(c => c.status === 'fail')
  if (failedChecks.length > 0) {
    score -= 10 * failedChecks.length
    issues.push(`Failed checks: ${failedChecks.map(c => c.name).join(', ')}`)
  }
  
  // Determine status
  let status = 'healthy'
  if (score < 50) {
    status = 'critical'
  } else if (score < 80) {
    status = 'degraded'
  }
  
  return {
    status,
    score: Math.max(0, score),
    issues
  }
}

/**
 * Send alert notification
 */
async function sendAlert(evaluation, healthData = null) {
  if (!HEALTH_CONFIG.alerting.webhook) {
    console.log('⚠️ Alert webhook not configured, skipping alert')
    return
  }
  
  const alertData = {
    timestamp: new Date().toISOString(),
    service: 'Silexar Pulse Quantum',
    environment: process.env.NODE_ENV || 'unknown',
    status: evaluation.status,
    score: evaluation.score,
    issues: evaluation.issues,
    healthData: healthData ? {
      uptime: healthData.uptime,
      version: healthData.version,
      services: healthData.services?.map(s => ({ name: s.name, status: s.status }))
    } : null
  }
  
  try {
    await fetch(HEALTH_CONFIG.alerting.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `🚨 Health Alert: ${alertData.service} is ${evaluation.status}`,
        attachments: [{
          color: evaluation.status === 'critical' ? 'danger' : 'warning',
          fields: [
            { title: 'Status', value: evaluation.status, short: true },
            { title: 'Score', value: `${evaluation.score}/100`, short: true },
            { title: 'Environment', value: alertData.environment, short: true },
            { title: 'Issues', value: evaluation.issues.join('\n'), short: false }
          ]
        }]
      })
    })
    
    console.log('📢 Alert sent successfully')
  } catch (error) {
    console.error('❌ Failed to send alert:', error.message)
  }
}

/**
 * Run continuous health monitoring
 */
async function runContinuousMonitoring(duration = 300000, interval = 30000) {
  console.log(`🔄 Starting continuous health monitoring for ${duration/1000} seconds`)
  console.log(`Check interval: ${interval/1000} seconds`)
  
  const results = []
  const startTime = Date.now()
  
  while (Date.now() - startTime < duration) {
    const result = await performHealthCheck()
    results.push({
      timestamp: new Date().toISOString(),
      ...result
    })
    
    console.log(`\n⏱️ Next check in ${interval/1000} seconds...`)
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  // Generate monitoring report
  const healthyChecks = results.filter(r => r.status === 'healthy').length
  const degradedChecks = results.filter(r => r.status === 'degraded').length
  const unhealthyChecks = results.filter(r => r.status === 'unhealthy').length
  
  console.log(`\n📊 Monitoring Summary:`)
  console.log(`   Total Checks: ${results.length}`)
  console.log(`   Healthy: ${healthyChecks} (${((healthyChecks/results.length)*100).toFixed(1)}%)`)
  console.log(`   Degraded: ${degradedChecks} (${((degradedChecks/results.length)*100).toFixed(1)}%)`)
  console.log(`   Unhealthy: ${unhealthyChecks} (${((unhealthyChecks/results.length)*100).toFixed(1)}%)`)
  
  const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length
  console.log(`   Average Score: ${avgScore.toFixed(1)}/100`)
  
  return results
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'single'
  
  try {
    if (command === 'continuous') {
      const duration = parseInt(args[1]) || 300000 // 5 minutes default
      const interval = parseInt(args[2]) || 30000 // 30 seconds default
      await runContinuousMonitoring(duration, interval)
    } else {
      const result = await performHealthCheck()
      process.exit(result.success && result.status === 'healthy' ? 0 : 1)
    }
  } catch (error) {
    console.error('❌ Health check script failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { 
  performHealthCheck, 
  evaluateHealth, 
  runContinuousMonitoring 
}