#!/usr/bin/env node

/**
 * TIER 0 Validation Script - Complete System Validation
 * 
 * @description Script para validar que el sistema cumple con todos los
 * estándares TIER 0 antes del deployment.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// TIER 0 Validation Checks
const validationChecks = [
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    description: 'Verify TypeScript strict mode compliance'
  },
  {
    name: 'Code Linting',
    command: 'npx biome check .',
    description: 'Verify code quality standards'
  },
  {
    name: 'Unit Tests',
    command: 'npm test -- --coverage --watchAll=false',
    description: 'Run unit tests with coverage'
  },
  {
    name: 'Build Process',
    command: 'npm run build',
    description: 'Verify production build'
  }
]

// TIER 0 File Structure Validation
const requiredFiles = [
  'src/components/ui/__tests__/button.test.tsx',
  'src/components/ui/__tests__/card.test.tsx',
  'src/components/ui/__tests__/badge.test.tsx',
  'src/hooks/__tests__/use-toast.test.tsx',
  'src/app/__tests__/page.test.tsx',
  'src/app/__tests__/layout.test.tsx',
  'src/lib/testing/jest.setup.ts',
  'src/lib/testing/test-coverage-analyzer.ts',
  'src/lib/documentation/jsdoc-coverage-analyzer.ts',
  'src/lib/performance/performance-monitor.ts',
  'src/lib/quality/quality-gates.ts',
  'src/lib/testing/automated-test-generator.ts'
]

// TIER 0 Configuration Validation
const requiredConfigs = [
  {
    file: 'tsconfig.json',
    checks: [
      { key: 'compilerOptions.strict', value: true },
      { key: 'compilerOptions.skipLibCheck', value: false },
      { key: 'compilerOptions.strictNullChecks', value: true }
    ]
  },
  {
    file: 'jest.config.js',
    checks: [
      { key: 'coverageThreshold.global.branches', value: 85 },
      { key: 'coverageThreshold.global.functions', value: 85 }
    ]
  }
]

console.log('🚀 Starting TIER 0 System Validation...')
console.log('=' .repeat(60))

let allPassed = true
const results = []

// 1. Validate File Structure
console.log('📁 Step 1/4: Validating File Structure...')
let missingFiles = []

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    missingFiles.push(file)
    allPassed = false
  }
}

if (missingFiles.length === 0) {
  console.log('   ✅ All required files present')
  results.push({ check: 'File Structure', status: 'PASSED' })
} else {
  console.log(`   ❌ Missing ${missingFiles.length} required files:`)
  missingFiles.forEach(file => console.log(`      - ${file}`))
  results.push({ check: 'File Structure', status: 'FAILED', details: missingFiles })
}

// 2. Validate Configuration
console.log('⚙️  Step 2/4: Validating Configuration...')
let configErrors = []

for (const config of requiredConfigs) {
  try {
    if (config.file.endsWith('.json')) {
      const content = JSON.parse(fs.readFileSync(config.file, 'utf-8'))
      for (const check of config.checks) {
        const value = getNestedValue(content, check.key)
        if (value !== check.value) {
          configErrors.push(`${config.file}: ${check.key} should be ${check.value}, got ${value}`)
        }
      }
    }
  } catch (error) {
    configErrors.push(`${config.file}: Failed to validate - ${error.message}`)
  }
}

if (configErrors.length === 0) {
  console.log('   ✅ All configurations valid')
  results.push({ check: 'Configuration', status: 'PASSED' })
} else {
  console.log(`   ❌ Configuration errors:`)
  configErrors.forEach(error => console.log(`      - ${error}`))
  results.push({ check: 'Configuration', status: 'FAILED', details: configErrors })
  allPassed = false
}

// 3. Run Validation Commands
console.log('🧪 Step 3/4: Running Validation Commands...')

for (const validation of validationChecks) {
  try {
    console.log(`   Running: ${validation.name}...`)
    execSync(validation.command, { stdio: 'pipe' })
    console.log(`   ✅ ${validation.name} passed`)
    results.push({ check: validation.name, status: 'PASSED' })
  } catch (error) {
    console.log(`   ❌ ${validation.name} failed`)
    console.log(`      ${error.message}`)
    results.push({ 
      check: validation.name, 
      status: 'FAILED', 
      details: error.message 
    })
    allPassed = false
  }
}

// 4. Generate Report
console.log('📋 Step 4/4: Generating Validation Report...')

const report = {
  timestamp: new Date().toISOString(),
  tier0Compliance: allPassed,
  overallStatus: allPassed ? 'TIER 0 SUPREMACY ACHIEVED' : 'TIER 0 COMPLIANCE FAILED',
  results: results,
  summary: {
    total: results.length,
    passed: results.filter(r => r.status === 'PASSED').length,
    failed: results.filter(r => r.status === 'FAILED').length
  }
}

// Write report to file
const reportPath = 'tier0-validation-report.json'
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

// Display Summary
console.log('=' .repeat(60))
console.log('🏆 TIER 0 VALIDATION SUMMARY')
console.log('=' .repeat(60))
console.log(`📊 Overall Status: ${report.overallStatus}`)
console.log(`✅ Passed: ${report.summary.passed}/${report.summary.total}`)
console.log(`❌ Failed: ${report.summary.failed}/${report.summary.total}`)
console.log(`📄 Report saved: ${reportPath}`)

if (allPassed) {
  console.log('')
  console.log('🎉 TIER 0 SUPREMACY ACHIEVED! 🎉')
  console.log('System is ready for production deployment.')
  process.exit(0)
} else {
  console.log('')
  console.log('❌ TIER 0 COMPLIANCE FAILED')
  console.log('Please fix the issues above before deployment.')
  process.exit(1)
}

// Helper function to get nested object values
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}