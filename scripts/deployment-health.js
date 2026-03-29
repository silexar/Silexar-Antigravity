/**
 * @fileoverview Deployment Health Validation Script
 * 
 * Comprehensive post-deployment health validation with rollback capabilities
 * for enterprise production deployments.
 * 
 * @author SILEXAR AI Team
 * @version 2040.1.0
 * @deployment Post-deployment validation
 * @rollback Automated rollback on health failures
 */

const fetch = require('node-fetch')
const fs = require('fs').promises

// Deployment health configuration
const HEALTH_CONFIG = {
  baseUrl: process.env.DEPLOYMENT_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 5,
  retryDelay: 10000,
  healthChecks: [
    {
      name: 'Application Health',
      endpoint: '/api/health',
      expectedStatus: 200,
      expectedContent: 'healthy',
      critical: true,
      timeout: 10000
    },
    {
      name: 'Database Connectivity',
      endpoint: '/api/health/database',
      expectedStatus: 200,
      expectedContent: 'connected',
      critical: true,
      timeout: 15000
    },
    {
      name: 'Cache Connectivity',
      endpoint: '/api/health/cache',
      expectedStatus: 200,
      expectedContent: 'connected',
      critical: false,
      timeout: 5000
    },
    {
      name: 'External Services',
      endpoint: '/api/health/external',
      expectedStatus: 200,
      expectedContent: 'available',
      critical: false,
      timeout: 20000
    },
    {
      name: 'Homepage Load',
      endpoint: '/',
      expectedStatus: 200,
      expectedContent: 'SILEXAR PULSE QUANTUM',
      critical: true,
      timeout: 10000
    },
    {
      name: 'Dashboard Access',
      endpoint: '/dashboard',
      expectedStatus: 200,
      expectedContent: 'Dashboard',
      critical: true,
      timeout: 10000
    }
  ],
  performanceThresholds: {
    responseTime: 2000, // 2 seconds
    availability: 0.99, // 99%
    errorRate: 0.01 // 1%
  },
  rollbackConfig: {
    enabled: process.env.ENABLE_ROLLBACK === 'true',
    previousVersion: process.env.PREVIOUS_VERSION,
    rollbackCommand: process.env.ROLLBACK_COMMAND
  }
}

/**
 * Perform single health check
 */
async function performHealthCheck(check) {
  console.log(`🔍 Checking: ${check.name}`)
  
  const url = `${HEALTH_CONFIG.baseUrl}${check.endpoint}`
  const startTime = Date.now()
  
  for (let attempt = 1; attempt <= HEALTH_CONFIG.retries; attempt++) {
    try {
      const response = await fetch(url, {
        timeout: check.timeout || HEALTH_CONFIG.timeout,
        headers: {
          'User-Agent': 'SilexarPulse-DeploymentHealth/2040.1.0'
        }
      })
      
      const responseTime = Date.now() - startTime
      const text = await response.text()
      
      const statusOk = response.status === check.expectedStatus
      const contentOk = !check.expectedContent || text.includes(check.expectedContent)
      const performanceOk = responseTime <= HEALTH_CONFIG.performanceThresholds.responseTime
      
      const result = {
        name: check.name,
        url,
        status: response.status,
        responseTime,
        statusOk,
        contentOk,
        performanceOk,
        passed: statusOk && contentOk,
        critical: check.critical,
        attempt,
        error: null
      }
      
      console.log(`   Status: ${response.status} ${statusOk ? '✅' : '❌'}`)
      console.log(`   Response Time: ${responseTime}ms ${performanceOk ? '✅' : '⚠️'}`)
      console.log(`   Content Check: ${contentOk ? '✅' : '❌'}`)
      console.log(`   Overall: ${result.passed ? '✅ PASS' : '❌ FAIL'}`)
      
      if (result.passed) {
        return result
      }
      
      if (attempt < HEALTH_CONFIG.retries) {
        console.log(`   Retrying in ${HEALTH_CONFIG.retryDelay / 1000} seconds...`)
        await new Promise(resolve => setTimeout(resolve, HEALTH_CONFIG.retryDelay))
      }
      
    } catch (error) {
      console.log(`   Attempt ${attempt} failed: ${error.message}`)
      
      if (attempt === HEALTH_CONFIG.retries) {
        return {
          name: check.name,
          url,
          status: 0,
          responseTime: Date.now() - startTime,
          statusOk: false,
          contentOk: false,
          performanceOk: false,
          passed: false,
          critical: check.critical,
          attempt,
          error: error.message
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, HEALTH_CONFIG.retryDelay))
    }
  }
}

/**
 * Run all health checks
 */
async function runHealthChecks() {
  console.log('🏥 Running Deployment Health Checks')
  console.log(`Target: ${HEALTH_CONFIG.baseUrl}`)
  console.log('=' * 50)
  
  const results = []
  let criticalFailures = 0
  let totalFailures = 0
  
  for (const check of HEALTH_CONFIG.healthChecks) {
    const result = await performHealthCheck(check)
    results.push(result)
    
    if (!result.passed) {
      totalFailures++
      if (result.critical) {
        criticalFailures++
      }
    }
    
    console.log('') // Empty line for readability
  }
  
  return {
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: totalFailures,
      criticalFailures,
      overallHealth: criticalFailures === 0 ? 'healthy' : 'unhealthy'
    }
  }
}

/**
 * Perform performance validation
 */
async function performanceValidation() {
  console.log('📊 Running Performance Validation')
  
  const performanceResults = []
  const testDuration = 60000 // 1 minute
  const requestInterval = 1000 // 1 second
  
  const startTime = Date.now()
  let requestCount = 0
  let successCount = 0
  let totalResponseTime = 0
  
  while (Date.now() - startTime < testDuration) {
    const requestStart = Date.now()
    
    try {
      const response = await fetch(`${HEALTH_CONFIG.baseUrl}/api/health`, {
        timeout: 5000
      })
      
      const responseTime = Date.now() - requestStart
      requestCount++
      totalResponseTime += responseTime
      
      if (response.ok) {
        successCount++
      }
      
      performanceResults.push({
        timestamp: Date.now(),
        responseTime,
        status: response.status,
        success: response.ok
      })
      
    } catch (error) {
      requestCount++
      performanceResults.push({
        timestamp: Date.now(),
        responseTime: Date.now() - requestStart,
        status: 0,
        success: false,
        error: error.message
      })
    }
    
    await new Promise(resolve => setTimeout(resolve, requestInterval))
  }
  
  const avgResponseTime = totalResponseTime / requestCount
  const availability = successCount / requestCount
  const errorRate = (requestCount - successCount) / requestCount
  
  const performanceHealth = {
    avgResponseTime,
    availability,
    errorRate,
    totalRequests: requestCount,
    successfulRequests: successCount,
    thresholds: HEALTH_CONFIG.performanceThresholds,
    passed: {
      responseTime: avgResponseTime <= HEALTH_CONFIG.performanceThresholds.responseTime,
      availability: availability >= HEALTH_CONFIG.performanceThresholds.availability,
      errorRate: errorRate <= HEALTH_CONFIG.performanceThresholds.errorRate
    }
  }
  
  console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms ${performanceHealth.passed.responseTime ? '✅' : '❌'}`)
  console.log(`   Availability: ${(availability * 100).toFixed(2)}% ${performanceHealth.passed.availability ? '✅' : '❌'}`)
  console.log(`   Error Rate: ${(errorRate * 100).toFixed(2)}% ${performanceHealth.passed.errorRate ? '✅' : '❌'}`)
  
  const overallPerformance = Object.values(performanceHealth.passed).every(p => p)
  console.log(`   Overall Performance: ${overallPerformance ? '✅ PASS' : '❌ FAIL'}`)
  
  return {
    ...performanceHealth,
    overallPassed: overallPerformance,
    rawResults: performanceResults
  }
}

/**
 * Execute rollback if needed
 */
async function executeRollback(reason) {
  if (!HEALTH_CONFIG.rollbackConfig.enabled) {
    console.log('⚠️ Rollback is disabled, manual intervention required')
    return false
  }
  
  console.log(`🔄 Initiating rollback due to: ${reason}`)
  
  try {
    if (HEALTH_CONFIG.rollbackConfig.rollbackCommand) {
      const { execSync } = require('child_process')
      
      console.log(`Executing rollback command: ${HEALTH_CONFIG.rollbackConfig.rollbackCommand}`)
      execSync(HEALTH_CONFIG.rollbackConfig.rollbackCommand, { stdio: 'inherit' })
      
      console.log('✅ Rollback command executed successfully')
      
      // Wait for rollback to take effect
      console.log('⏳ Waiting for rollback to take effect...')
      await new Promise(resolve => setTimeout(resolve, 30000))
      
      // Verify rollback
      console.log('🔍 Verifying rollback...')
      const verificationResult = await runHealthChecks()
      
      if (verificationResult.summary.overallHealth === 'healthy') {
        console.log('✅ Rollback successful, system is healthy')
        return true
      } else {
        console.log('❌ Rollback verification failed')
        return false
      }
    } else {
      console.log('❌ No rollback command configured')
      return false
    }
  } catch (error) {
    console.error('❌ Rollback failed:', error.message)
    return false
  }
}

/**
 * Send deployment notification
 */
async function sendDeploymentNotification(healthResult, performanceResult, rollbackResult = null) {
  const webhookUrl = process.env.DEPLOYMENT_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.log('⚠️ No webhook URL configured for notifications')
    return
  }
  
  const overallStatus = healthResult.summary.overallHealth === 'healthy' && 
                       performanceResult.overallPassed ? 'success' : 'failure'
  
  const notification = {
    timestamp: new Date().toISOString(),
    deployment: {
      url: HEALTH_CONFIG.baseUrl,
      version: process.env.DEPLOYMENT_VERSION || 'unknown',
      environment: process.env.DEPLOYMENT_ENV || 'unknown'
    },
    status: overallStatus,
    health: healthResult.summary,
    performance: {
      avgResponseTime: performanceResult.avgResponseTime,
      availability: performanceResult.availability,
      errorRate: performanceResult.errorRate
    },
    rollback: rollbackResult
  }
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: `🚀 Deployment Health Check: ${overallStatus.toUpperCase()}`,
        attachments: [{
          color: overallStatus === 'success' ? 'good' : 'danger',
          fields: [
            { title: 'Environment', value: notification.deployment.environment, short: true },
            { title: 'Version', value: notification.deployment.version, short: true },
            { title: 'Health Status', value: healthResult.summary.overallHealth, short: true },
            { title: 'Performance', value: performanceResult.overallPassed ? 'PASS' : 'FAIL', short: true },
            { title: 'Response Time', value: `${performanceResult.avgResponseTime.toFixed(2)}ms`, short: true },
            { title: 'Availability', value: `${(performanceResult.availability * 100).toFixed(2)}%`, short: true }
          ]
        }]
      })
    })
    
    console.log('📢 Deployment notification sent')
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message)
  }
}

/**
 * Generate deployment report
 */
async function generateDeploymentReport(healthResult, performanceResult, rollbackResult = null) {
  const report = {
    timestamp: new Date().toISOString(),
    deployment: {
      url: HEALTH_CONFIG.baseUrl,
      version: process.env.DEPLOYMENT_VERSION || 'unknown',
      environment: process.env.DEPLOYMENT_ENV || 'unknown'
    },
    health: healthResult,
    performance: performanceResult,
    rollback: rollbackResult,
    overallStatus: healthResult.summary.overallHealth === 'healthy' && 
                   performanceResult.overallPassed ? 'SUCCESS' : 'FAILURE'
  }
  
  const reportPath = `deployment-health-report-${Date.now()}.json`
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`📄 Deployment health report saved: ${reportPath}`)
  
  return report
}

/**
 * Main deployment health validation
 */
async function runDeploymentHealthValidation() {
  console.log('🚀 Starting Deployment Health Validation')
  console.log('=' * 60)
  
  try {
    // Run health checks
    const healthResult = await runHealthChecks()
    
    // Run performance validation
    const performanceResult = await performanceValidation()
    
    // Check if rollback is needed
    let rollbackResult = null
    const needsRollback = healthResult.summary.criticalFailures > 0 || !performanceResult.overallPassed
    
    if (needsRollback) {
      console.log('\n🚨 Critical issues detected, considering rollback...')
      rollbackResult = await executeRollback('Critical health check failures')
    }
    
    // Generate report
    const report = await generateDeploymentReport(healthResult, performanceResult, rollbackResult)
    
    // Send notification
    await sendDeploymentNotification(healthResult, performanceResult, rollbackResult)
    
    // Display final summary
    console.log('\n🎯 Deployment Health Validation Summary')
    console.log(`Overall Status: ${report.overallStatus}`)
    console.log(`Health Checks: ${healthResult.summary.passed}/${healthResult.summary.total} passed`)
    console.log(`Critical Failures: ${healthResult.summary.criticalFailures}`)
    console.log(`Performance: ${performanceResult.overallPassed ? 'PASS' : 'FAIL'}`)
    
    if (rollbackResult !== null) {
      console.log(`Rollback: ${rollbackResult ? 'SUCCESS' : 'FAILED'}`)
    }
    
    // Exit with appropriate code
    const finalStatus = rollbackResult === true || report.overallStatus === 'SUCCESS'
    process.exit(finalStatus ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Deployment health validation failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runDeploymentHealthValidation()
}

module.exports = { 
  runDeploymentHealthValidation,
  runHealthChecks,
  performanceValidation,
  executeRollback
}