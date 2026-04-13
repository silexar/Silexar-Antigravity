/**
 * Initialize Security Learning System
 *
 * This script imports existing fix data from .security-learning-db.json
 * into the SecurityLearning knowledge base so the AI-powered autofix
 * system can learn from past corrections.
 *
 * Usage:
 *   npx tsx scripts/init-security-learning.ts
 */

import { promises as fs } from 'fs'
import { resolve } from 'path'
import { SecurityLearning } from '../src/lib/security/auto-fix/SecurityLearning'
import type { SecurityIssue, IssueType } from '../src/lib/security/auto-fix/types'

interface LearningDBFix {
  file: string
  fix: string
  timestamp: string
}

interface LearningDB {
  version: string
  initialized: string
  system: string
  tier: string
  fixes: {
    [key: string]: LearningDBFix[]
  }
}

async function initializeSecurityLearning() {
  console.log('🔒 Initializing Security Learning System...')
  
  // Load the learning database
  const dbPath = resolve('.security-learning-db.json')
  let dbData: string
  
  try {
    dbData = await fs.readFile(dbPath, 'utf-8')
  } catch (error) {
    console.error('❌ .security-learning-db.json not found')
    console.log('💡 This file should contain past fixes to train the AI system')
    process.exit(1)
  }
  
  const db: LearningDB = JSON.parse(dbData)
  
  // Initialize the learning system
  const learning = new SecurityLearning({
    knowledgeBasePath: '.security/knowledge-base.json',
    historyPath: '.security/fix-history.json',
  })
  
  await learning.initialize()
  console.log('✅ Security Learning system initialized')
  
  // Map fix descriptions to issue types
  const issueTypeMap: Record<string, IssueType> = {
    'console-log': 'console_sensitive_data',
    'any-type': 'as_any_cast',
    'hardcoded-secret': 'hardcoded_secret',
    'unused-import': 'unused_import',
    'unused-variable': 'unused_variable',
    'insecure-random': 'insecure_random',
    'weak-crypto': 'weak_crypto',
  }
  
  let totalImported = 0
  let totalSkipped = 0
  
  // Import each fix type
  for (const [fixType, fixes] of Object.entries(db.fixes)) {
    console.log(`\n📦 Importing ${fixType} fixes (${fixes.length} total)...`)
    
    const issueType = issueTypeMap[fixType]
    if (!issueType) {
      console.log(`   ⚠️  Unknown fix type: ${fixType}, skipping`)
      totalSkipped += fixes.length
      continue
    }
    
    for (const fix of fixes) {
      try {
        // Create a mock issue for learning
        const issue: SecurityIssue = {
          type: issueType,
          filePath: fix.file,
          severity: fixType === 'console-log' ? 'LOW' : 
                   fixType === 'any-type' ? 'MEDIUM' : 'HIGH',
          line: 0,
          column: 0,
          message: `Auto-fixed: ${fixType}`,
          confidence: 1.0,
          originalCode: '// Original code',
          suggestion: fix.fix,
        }
        
        // Record the success in the learning system
        await learning.recordSuccess(
          issue,
          issue.originalCode,
          fix.fix,
          { source: 'security-learning-db', fixType }
        )
        
        totalImported++
      } catch (error) {
        console.error(`   ❌ Error importing fix: ${error}`)
        totalSkipped++
      }
    }
    
    console.log(`   ✅ ${fixes.length} ${fixType} fixes imported`)
  }
  
  // Get statistics
  const stats = await learning.getStatistics()
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 Security Learning Import Summary')
  console.log('='.repeat(60))
  console.log(`✅ Total fixes imported: ${totalImported}`)
  console.log(`⚠️  Total fixes skipped: ${totalSkipped}`)
  console.log(`🧠 Total patterns in knowledge base: ${stats.totalPatterns}`)
  console.log(`📈 Total corrections recorded: ${stats.totalCorrections}`)
  console.log(`🎯 Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`)
  console.log('='.repeat(60))
  
  // Save the knowledge base
  await learning.exportKnowledgeBase()
  console.log('\n💾 Knowledge base saved to .security/knowledge-base.json')
  console.log('✨ Security Learning System is ready for production use!')
}

// Run the initialization
initializeSecurityLearning().catch((error) => {
  console.error('❌ Failed to initialize security learning:', error)
  process.exit(1)
})
