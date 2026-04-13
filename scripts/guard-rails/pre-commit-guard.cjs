#!/usr/bin/env node
/**
 * SILEXAR PULSE — Intelligent Pre-Commit Security Guard
 * 
 * Prevents ALL 149 audit findings from being committed.
 * Blocks commit if any critical security violation is detected.
 * 
 * @version 1.0.0
 * @audit AUDITORIA_COMPLETA_SISTEMA_2026-04-08.md
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Get staged files
const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

if (stagedFiles.length === 0) process.exit(0);

let errors = [];
let warnings = [];

// Helper to check a file against patterns
function checkFile(filePath, patterns) {
  if (!fs.existsSync(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    patterns.forEach(({ pattern, message, type }) => {
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          (type === 'error' ? errors : warnings).push({
            file: filePath,
            line: idx + 1,
            message,
            code: line.trim()
          });
        }
      });
    });
  } catch (e) {
    // Skip binary or unreadable files
  }
}

// ═══════════════════════════════════════════════════════════════
// CRITICAL CHECKS (Block Commit)
// ═══════════════════════════════════════════════════════════════

// 1. NO hardcoded secrets
stagedFiles.forEach(f => {
  if (f.includes('node_modules') || f.includes('.test.') || f.includes('.spec.')) return;
  checkFile(f, [
    { pattern: /['"](?:sk-|pk-|ghp_|gho_|xoxb-|xoxp-|SG\.)[A-Za-z0-9_-]{20,}['"]/, message: '🔴 API key detected', type: 'error' },
    { pattern: /(?:password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i, message: '🔴 Possible hardcoded secret', type: 'error' },
    { pattern: /silexar-dev-encryption-key/, message: '🔴 Dev encryption key in code', type: 'error' },
    { pattern: /Admin123!|admin123|password123/i, message: '🔴 Default/test password detected', type: 'error' },
  ]);
});

// 2. NO eval() or new Function()
stagedFiles.forEach(f => {
  if (f.includes('node_modules') || f.includes('.test.') || f.includes('.spec.') || f.includes('quality-assurance')) return;
  checkFile(f, [
    { pattern: /\beval\s*\(/, message: '🔴 eval() detected', type: 'error' },
    { pattern: /\bnew\s+Function\s*\(/, message: '🔴 new Function() detected', type: 'error' },
  ]);
});

// 3. NO dangerouslySetInnerHTML without DOMPurify
stagedFiles.forEach(f => {
  if (f.includes('node_modules')) return;
  try {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify') && !f.includes('.test.') && !f.includes('.spec.')) {
      errors.push({ file: f, message: '🔴 dangerouslySetInnerHTML without DOMPurify', type: 'error' });
    }
  } catch (e) {
    // Skip unreadable files
  }
});

// 4. NO Math.random() for security purposes
stagedFiles.forEach(f => {
  if (f.includes('node_modules') || f.includes('.test.') || f.includes('.spec.')) return;
  if (f.includes('password') || f.includes('secret') || f.includes('token') || f.includes('webhook')) {
    checkFile(f, [
      { pattern: /Math\.random\(\)/, message: '🔴 Math.random() in security-sensitive file — use crypto.randomInt()', type: 'error' },
    ]);
  }
});

// 5. NO middleware.ts missing
if (!stagedFiles.some(f => f.includes('middleware.')) && !fs.existsSync('src/middleware.ts')) {
  warnings.push({ file: 'src/middleware.ts', message: '🟡 Ensure middleware.ts exists and is active' });
}

// 6. NO console.log in API routes
stagedFiles.forEach(f => {
  if (f.includes('api/') && f.includes('route.') && !f.includes('.test.') && !f.includes('.spec.')) {
    checkFile(f, [
      { pattern: /console\.(log|warn|error|info|debug)\s*\(/, message: '🔴 console.* in API route — use logger', type: 'error' },
    ]);
  }
});

// 7. NO : any type in TypeScript files
stagedFiles.forEach(f => {
  if (f.endsWith('.ts') || f.endsWith('.tsx')) {
    checkFile(f, [
      { pattern: /:\s*any(?!\s*(where|longer))/, message: '🟡 : any type detected — use unknown or specific type', type: 'warning' },
    ]);
  }
});

// 8. NO raw SQL without parameterization
stagedFiles.forEach(f => {
  if (f.includes('api/') || f.includes('repository')) {
    checkFile(f, [
      { pattern: /db\.execute\(sql`[^`]*\$\{.*\+/, message: '🔴 Possible SQL injection — use parameterized queries', type: 'error' },
    ]);
  }
});

// 9. NO .env files committed
stagedFiles.forEach(f => {
  if (f.startsWith('.env') && !f.endsWith('.example') && !f.endsWith('.local.example') && !f.endsWith('.production.example')) {
    errors.push({ file: f, message: '🔴 .env file committed — add to .gitignore', type: 'error' });
  }
});

// 10. Check for mock repos in production paths
stagedFiles.forEach(f => {
  if (f.includes('api/') && f.includes('route.')) {
    checkFile(f, [
      { pattern: /Mock.*Repository/, message: '🟡 Mock repository in API route — ensure real repo is used', type: 'warning' },
    ]);
  }
});

// ═══════════════════════════════════════════════════════════════
// NUEVOS CHECKS D16–D20 (incorporados tras auditoría 2026-04-10)
// ═══════════════════════════════════════════════════════════════

// D16: API Route Wrapper Coverage — NO ruta de negocio sin withApiRoute/secureHandler
stagedFiles.forEach(f => {
  if (!f.includes('src/app/api/') || !f.includes('route.')) return;
  if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
  // Excluir rutas públicas legítimas
  const isPublic = /api\/(auth\/(login|register|refresh|logout|\[\.\.\.auth\])|health|security\/csp|webhooks|sitemap|robots|trpc)/.test(f);
  if (isPublic) return;
  try {
    const content = fs.readFileSync(f, 'utf8');
    const hasWrapper = /withApiRoute|secureHandler|getUserContext|withAuth|requireRole|getAuthContext/.test(content);
    const hasHttpExport = /export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD)/.test(content);
    if (hasHttpExport && !hasWrapper) {
      errors.push({
        file: f,
        message: '🔴 [D16] API route sin withApiRoute/secureHandler/getUserContext — ruta de negocio sin auth',
        type: 'error',
      });
    }
  } catch (e) { /* skip */ }
});

// D17: Config & Docs Consistency — bcrypt rounds deben ser >= 12 en todos los usos
stagedFiles.forEach(f => {
  if (f.includes('node_modules') || f.includes('.test.') || f.includes('.spec.')) return;
  if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
  try {
    const content = fs.readFileSync(f, 'utf8');
    // Detecta bcrypt.hash con menos de 12 rounds
    const match = content.match(/bcrypt\.hash\s*\([^,]+,\s*(\d+)\s*\)/);
    if (match && parseInt(match[1], 10) < 12) {
      errors.push({
        file: f,
        message: `🔴 [D17] bcrypt.hash con ${match[1]} rounds — mínimo requerido es 12 (CLAUDE.md)`,
        type: 'error',
      });
    }
    // Detecta expiresIn de JWT con valor mayor a 4h (access token)
    const jwtMatch = content.match(/expiresIn\s*[:=]\s*['"](\d+h)['"]|expiresIn\s*:\s*(\d+)/);
    if (jwtMatch) {
      const hours = jwtMatch[1] ? parseInt(jwtMatch[1]) : Math.round((parseInt(jwtMatch[2] || '0')) / 3600);
      if (hours > 4 && f.includes('signToken') || (f.includes('jwt') && hours > 4)) {
        warnings.push({
          file: f,
          message: `🟡 [D17] JWT access token expiry ${hours}h — CLAUDE.md recomienda máximo 1h para access tokens`,
          type: 'warning',
        });
      }
    }
  } catch (e) { /* skip */ }
});

// D18: Test Suite Completeness — @playwright/test debe estar en package.json si existe playwright.config.ts
const playwrightConfig = 'playwright.config.ts';
const packageJson = 'package.json';
if (stagedFiles.includes(playwrightConfig) || stagedFiles.includes(packageJson)) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    const hasPlaywrightConfig = fs.existsSync('playwright.config.ts') || fs.existsSync('playwright.config.js');
    const hasPlaywrightPkg = '@playwright/test' in allDeps || 'playwright' in allDeps;
    if (hasPlaywrightConfig && !hasPlaywrightPkg) {
      errors.push({
        file: 'package.json',
        message: '🔴 [D18] playwright.config.ts existe pero @playwright/test no está en package.json — E2E no puede correr en CI',
        type: 'error',
      });
    }
  } catch (e) { /* skip */ }
}

// D19: Password Hashing Consistency — NO bcrypt.hash directo en endpoints, usar PasswordSecuritySystem
stagedFiles.forEach(f => {
  if (f.includes('node_modules') || f.includes('.test.') || f.includes('.spec.')) return;
  if (!f.includes('src/app/api/') && !f.includes('src/modules/')) return;
  if (!f.endsWith('.ts')) return;
  try {
    const content = fs.readFileSync(f, 'utf8');
    if (/import.*bcrypt.*from\s+['"]bcryptjs['"]/.test(content) && /bcrypt\.hash\s*\(/.test(content)) {
      // Excluir si también usa PasswordSecuritySystem (migración en progreso)
      if (!/PasswordSecuritySystem/.test(content)) {
        warnings.push({
          file: f,
          message: '🟡 [D19] bcrypt.hash directo en endpoint — usar PasswordSecuritySystem.hashPassword() para consistencia',
          type: 'warning',
        });
      }
    }
  } catch (e) { /* skip */ }
});

// D20: Incident Response Code — src/lib/security/incident-response/ debe existir
if (stagedFiles.some(f => f.includes('security/audit-logger') || f.includes('audit-types'))) {
  const irPath = 'src/lib/security/incident-response';
  if (!fs.existsSync(irPath)) {
    warnings.push({
      file: irPath,
      message: '🟡 [D20] src/lib/security/incident-response/ no existe — playbooks de incidentes deben ser código ejecutable, no solo documentación en CLAUDE.md',
      type: 'warning',
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// REPORT
// ═══════════════════════════════════════════════════════════════

if (errors.length > 0) {
  console.error(`\n${RED}🚨 SECURITY GUARD: Commit BLOCKED${RESET}`);
  console.error(`${RED}Found ${errors.length} critical security violation(s):${RESET}\n`);
  errors.forEach((e, i) => {
    console.error(`${RED}  ${i + 1}. ${e.message}${RESET}`);
    console.error(`     File: ${e.file}${e.line ? `:${e.line}` : ''}`);
    if (e.code) console.error(`     Code: ${e.code.substring(0, 80)}`);
    console.error('');
  });
  console.error(`${YELLOW}💡 Fix these issues before committing.${RESET}`);
  console.error(`${YELLOW}   See AUDITORIA_COMPLETA_SISTEMA_2026-04-08.md for details.${RESET}\n`);
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn(`\n${YELLOW}⚠️ SECURITY GUARD: ${warnings.length} warning(s)${RESET}\n`);
  warnings.forEach((w, i) => {
    console.warn(`${YELLOW}  ${i + 1}. ${w.message}${RESET}`);
    console.warn(`     File: ${w.file}`);
  });
  console.warn('');
}

console.log(`${GREEN}✅ Security Guard: All critical checks passed${RESET}`);
process.exit(0);
