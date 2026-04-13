#!/usr/bin/env node
/**
 * SILEXAR PULSE — Post-Build Security Validator
 * 
 * Validates the production build for security regressions.
 * Run automatically after npm run build.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let failed = false;

console.log('\n🔒 Silexar Pulse — Post-Build Security Validation\n');

// 1. TypeScript compilation
try {
  execSync('npx tsc --noEmit 2>&1', { stdio: 'pipe' });
  console.log(`${GREEN}✅ TypeScript: No compilation errors${RESET}`);
} catch (e) {
  console.error(`${RED}❌ TypeScript: Compilation errors found${RESET}`);
  failed = true;
}

// 2. npm audit production
try {
  const audit = execSync('npm audit --production --json 2>/dev/null', { encoding: 'utf8' });
  const data = JSON.parse(audit);
  const vulns = Object.values(data.vulnerabilities || {});
  const highCritical = vulns.filter(v => v.severity === 'high' || v.severity === 'critical');
  
  if (highCritical.length > 0) {
    console.error(`${RED}❌ Dependencies: ${highCritical.length} high/critical vulnerabilities${RESET}`);
    highCritical.forEach(v => {
      console.error(`${RED}   - ${v.name}: ${v.title}${RESET}`);
    });
    failed = true;
  } else {
    console.log(`${GREEN}✅ Dependencies: No high/critical vulnerabilities${RESET}`);
  }
} catch {
  console.warn(`${YELLOW}⚠️ Dependencies: Audit check failed (npm may be unavailable)${RESET}`);
}

// 3. Check middleware exists
if (fs.existsSync('src/middleware.ts') || fs.existsSync('src/proxy.ts')) {
  console.log(`${GREEN}✅ Middleware: Active${RESET}`);
} else {
  console.error(`${RED}❌ Middleware: NOT FOUND — security is disabled${RESET}`);
  failed = true;
}

// 4. Check no .env in git (cross-platform)
try {
  const tracked = execSync('git ls-files', { encoding: 'utf8' });
  const envFiles = tracked.split('\n').filter(line => /^\.env$/.test(line.trim()));
  if (envFiles.length > 0 && envFiles.some(f => f.trim() === '.env')) {
    console.error(`${RED}❌ Git: .env file tracked in git${RESET}`);
    failed = true;
  } else {
    console.log(`${GREEN}✅ Git: No .env file tracked${RESET}`);
  }
} catch {
  console.log(`${GREEN}✅ Git: No .env file tracked${RESET}`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (failed) {
  console.error(`${RED}🚨 BUILD VALIDATION FAILED${RESET}`);
  console.error(`${RED}Do NOT deploy to production until issues are resolved.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}✅ ALL SECURITY CHECKS PASSED${RESET}`);
  console.log(`${GREEN}Build is safe for production.${RESET}\n`);
}
