/**
 * Remove dead code files - files with 0 imports across the codebase
 * Only removes files we are CERTAIN are unused
 */
const fs = require('fs');
const path = require('path');

function getFiles(dir, exts) {
  let results = [];
  try {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && f !== 'node_modules' && f !== '.next') {
        results = results.concat(getFiles(full, exts));
      } else if (exts.some(e => f.endsWith(e)) && !f.endsWith('.d.ts')) {
        results.push(full);
      }
    }
  } catch(e) {}
  return results;
}

// Get all source content for import scanning
const allSrc = getFiles('src', ['.ts', '.tsx']).filter(f =>
  !f.includes('node_modules') && !f.includes('.next')
);

// Confirmed dead lib files (zero imports found)
const deadLibFiles = [
  'src/lib/ai/ai-security-pipeline.ts',
  'src/lib/ai/conversational-engine.ts',
  'src/lib/ai/CortexContentService.ts',
  'src/lib/ai/performance-optimizer.ts',
  'src/lib/ai/quantum-consciousness.ts',
  'src/lib/ai/response-generator.ts',
  'src/lib/ai/supreme-intelligence.ts',
  'src/lib/ai/user-behavior-analyzer.ts',
  'src/lib/api-helper.ts',
  'src/lib/architecture/circuit-breaker.ts',
  'src/lib/audit/enterprise-audit-system.ts',
  'src/lib/auth/enterprise-auth.ts',
  'src/lib/auth/impersonation-service.ts',
  'src/lib/auth/sso-service.ts',
  'src/lib/automation/api-ecosystem.ts',
  'src/lib/automation/automation-manager.ts',
  'src/lib/automation/email-intelligence.ts',
  'src/lib/automation/voice-ai-integration.ts',
  'src/lib/automation/whatsapp-business-advanced.ts',
  'src/lib/backup/critical-backup-system.ts',
  'src/lib/billing/intelligent-billing-engine.ts',
  'src/lib/cache/cache-middleware.ts',
  'src/lib/cache/multi-region-cache.ts',
  'src/lib/cicd/advanced-pipeline-integration.ts',
  'src/lib/compliance/gdpr-service.ts',
];

// Confirmed dead components (zero page/component imports)
const deadComponents = [
  'src/components/admin/audit-log-viewer.tsx',
  'src/components/admin/impersonation-banner.tsx',
  'src/components/admin/NeuromorphicSDKPortal.tsx',
  'src/components/admin/security-settings.tsx',
  'src/components/admin/webhooks-config.tsx',
  'src/components/ai/ai-supremacy-dashboard.tsx',
  'src/components/ai/AIPredictiveDashboard.tsx',
  'src/components/audit/EnterpriseAuditDashboard.tsx',
  'src/components/automation/automation-integration.tsx',
  'src/components/blockchain/BlockchainAuditDashboard.tsx',
  'src/components/cache/DistributedCacheDashboard.tsx',
  'src/components/cache/RedisCacheDashboard.tsx',
  // Keep command-center, report-builder, ceo-dashboard as they may be referenced in future
  // Keep billing components (sii-integration.tsx is documented in CLAUDE.md)
];

// DO NOT delete: better-auth-client (referenced in CLAUDE.md), nlp-engine (may be used by wil)
// DO NOT delete: continuous-improvement/* (suite files may be orchestrated at runtime)

let deleted = 0;
const allToDelete = [...deadLibFiles, ...deadComponents];

for (const file of allToDelete) {
  if (!fs.existsSync(file)) {
    console.log('Already gone:', file);
    continue;
  }

  // Double-check: scan for any import of this file
  const basename = path.basename(file).replace(/\.(ts|tsx)$/, '');
  let importCount = 0;
  for (const srcFile of allSrc) {
    if (srcFile === file) continue;
    const content = fs.readFileSync(srcFile, 'utf8');
    if (content.includes(basename)) {
      importCount++;
      break;
    }
  }

  if (importCount === 0) {
    fs.unlinkSync(file);
    console.log('DELETED:', file);
    deleted++;
  } else {
    console.log('KEPT (has imports):', file);
  }
}

console.log('\nTotal deleted:', deleted);

// Clean up empty directories
function removeEmptyDirs(dir) {
  try {
    const files = fs.readdirSync(dir);
    if (files.length === 0) {
      fs.rmdirSync(dir);
      console.log('Removed empty dir:', dir);
      return true;
    }
    let allRemoved = true;
    for (const f of files) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) {
        if (!removeEmptyDirs(full)) allRemoved = false;
      } else {
        allRemoved = false;
      }
    }
    if (allRemoved) {
      fs.rmdirSync(dir);
      console.log('Removed empty dir:', dir);
    }
    return allRemoved;
  } catch(e) {}
  return false;
}

['src/lib/ai', 'src/lib/audit', 'src/lib/automation', 'src/lib/backup', 'src/lib/billing',
 'src/lib/cache', 'src/lib/cicd', 'src/lib/compliance', 'src/components/automation',
 'src/components/audit', 'src/components/blockchain', 'src/components/cache'].forEach(d => {
  if (fs.existsSync(d) && fs.readdirSync(d).length === 0) {
    fs.rmdirSync(d);
    console.log('Removed empty:', d);
  }
});
